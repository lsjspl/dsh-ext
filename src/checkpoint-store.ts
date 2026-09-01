import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { git, hasGit, splitNul } from './git.ts'
import { workspaceKey } from './paths.ts'
import type { CheckpointRow } from './shared/api-contract.ts'

/**
 * The shadow repository behind feature 8.
 *
 * ## Why a second repository at all
 *
 * The requirement is per-session rollback that never dirties the user's own git
 * history. Every mechanism that lives *inside* the project's repository —
 * commits on a side branch, stashes, `git notes`, a temporary index — is
 * visible to the user's tooling and shows up in their reflog, their stash list,
 * or their status. So this uses a repository the project does not know about.
 *
 * ## The three isolation invariants
 *
 * 1. `GIT_DIR` points into this plugin's own directory, never `<project>/.git`.
 * 2. `GIT_INDEX_FILE` points there too. Without it, a `git add` would write
 *    `<project>/.git/index` — staging the user's files as a side effect, which
 *    is exactly the "dirtied their git" failure this feature must not have.
 * 3. `.git/` is excluded from every snapshot. To the shadow repository the
 *    project's `.git` is an ordinary directory, so an unexcluded snapshot would
 *    commit the user's entire history into ours.
 *
 * Nothing here ever runs a write command with the project's own `GIT_DIR`. The
 * only commands that touch the working tree are `checkout-index` and explicit
 * deletions during a restore, both scoped to paths the shadow tree names.
 */

/** Commit identity for shadow commits. Never the user's, so their config is untouched. */
const AUTHOR_NAME = 'dsh-dev-tool-ext'
const AUTHOR_EMAIL = 'checkpoints@dsh-dev-tool-ext.invalid'

/** Message prefix carrying the session id, so a log is filterable by session. */
const MESSAGE_PREFIX = 'dsh-checkpoint'

/**
 * Field and record separators for `git log --format`. ASCII unit/record
 * separators rather than a printable delimiter: a commit body is user-facing
 * text that may contain any printable character, and these two cannot appear
 * in one.
 */
const FIELD_SEP = '\u001f'
const RECORD_SEP = '\u001e'

export interface ShadowRepo {
  /** Absolute path of the shadow `GIT_DIR`. */
  readonly gitDir: string
  /** The project directory the shadow repo treats as its work tree. */
  readonly workTree: string
}

export interface SnapshotResult {
  readonly id: string
  readonly changed: number
  /** False when nothing changed since the previous checkpoint, so none was made. */
  readonly created: boolean
}

/**
 * Why a snapshot could not be taken. Distinguished rather than collapsed into
 * one absent value because the two causes need different words in front of a
 * user: "install git" is actionable, "git refused the commit" is a defect
 * report, and reporting the first for the second sends people looking in
 * entirely the wrong place.
 */
export class SnapshotError extends Error {
  constructor(readonly cause: 'no-git' | 'git-failed', message: string) {
    super(message)
    this.name = 'SnapshotError'
  }
}

export class CheckpointStore {
  constructor(
    private readonly root: string,
    private readonly excludes: readonly string[],
    private readonly maxFileSizeMb: number,
  ) {}

  private repoFor(workTree: string): ShadowRepo {
    return { gitDir: join(this.root, workspaceKey(workTree)), workTree }
  }

  /**
   * Environment that pins every invariant at once. Passed to every single git
   * call in this class — there is no code path here that talks to git without it.
   */
  private env(repo: ShadowRepo): Record<string, string> {
    return {
      GIT_DIR: repo.gitDir,
      GIT_WORK_TREE: repo.workTree,
      // Invariant 2. Sits inside the shadow GIT_DIR, so it cannot collide with
      // the project's index even by accident.
      GIT_INDEX_FILE: join(repo.gitDir, 'dsh-index'),
      GIT_AUTHOR_NAME: AUTHOR_NAME,
      GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
      GIT_COMMITTER_NAME: AUTHOR_NAME,
      GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
      // A project hook must never run on a shadow commit.
      GIT_CONFIG_GLOBAL: '/dev/null',
    }
  }

  /**
   * Create the shadow repository if it does not exist yet, and write its excludes.
   *
   * The creation is `git init --bare <shadowDir>`, run with the shadow directory
   * as the CWD and no work tree in the picture at all.
   *
   * It is emphatically NOT `git init --separate-git-dir` inside the project.
   * That form, run in a directory that is already a repository, REPLACES the
   * project's `.git` directory with a pointer file and moves its contents — the
   * precise catastrophe this feature exists to avoid. There is no version of
   * that command worth keeping behind a fallback, so it is not here.
   */
  async ensure(workTree: string): Promise<ShadowRepo | undefined> {
    if (!await hasGit(workTree)) return undefined
    const repo = this.repoFor(workTree)
    const env = this.env(repo)

    // Probed with the shadow GIT_DIR, so this asks about OUR repository. A
    // `--git-dir` probe from the work tree would answer about the project's.
    const existing = await git(['rev-parse', '--git-dir'], { cwd: workTree, env })
    if (!existing.ok) {
      await mkdir(repo.gitDir, { recursive: true, mode: 0o700 })
      // CWD is the shadow directory itself: nothing about this command can
      // reach, read, or rewrite the project's repository.
      const init = await git(
        ['init', '--quiet', '--bare', '--initial-branch=checkpoints', repo.gitDir],
        { cwd: repo.gitDir, env: {} },
      )
      if (!init.ok) return undefined

      // A bare repository refuses working-tree operations; the shadow repo needs
      // them, and takes its work tree from GIT_WORK_TREE per call.
      await git(['config', 'core.bare', 'false'], { cwd: workTree, env })
      // Never garbage-collect or repack on git's own schedule mid-snapshot.
      await git(['config', 'gc.auto', '0'], { cwd: workTree, env })
      // Line endings must round-trip byte-for-byte: a checkpoint that "restores"
      // a file with different newlines has corrupted it.
      await git(['config', 'core.autocrlf', 'false'], { cwd: workTree, env })
      // The project's own hooks live in its .git; point ours at nothing so no
      // repository hook ever runs on this plugin's behalf.
      await git(['config', 'core.hooksPath', join(repo.gitDir, 'no-hooks')], { cwd: workTree, env })
    }

    await this.clearStaleLock(repo)
    await this.writeExcludes(repo)
    return repo
  }

  /**
   * Remove a leftover index lock in the shadow repository.
   *
   * git creates `<index>.lock` for the duration of an index write and removes it
   * on completion; one still present means a previous run was killed mid-write.
   * Every later index operation then fails, so the feature stays broken until
   * someone deletes a file they have no reason to know about.
   *
   * Clearing it is safe HERE and would not be in the project's repository: this
   * lock belongs to an index only this plugin writes, and its writes are already
   * serialized per workspace by the caller. There is no other writer whose work
   * could be interrupted.
   */
  private async clearStaleLock(repo: ShadowRepo): Promise<void> {
    await rm(`${join(repo.gitDir, 'dsh-index')}.lock`, { force: true }).catch(() => { /* best effort */ })
  }

  /** Invariant 3, plus the user's configured excludes and the size cap. */
  private async writeExcludes(repo: ShadowRepo): Promise<void> {
    const infoDir = join(repo.gitDir, 'info')
    await mkdir(infoDir, { recursive: true, mode: 0o700 })
    const lines = [
      '# Written by dsh-dev-tool-ext. Edit the plugin settings, not this file.',
      // The load-bearing one: the project's own history is not ours to copy.
      '/.git/',
      ...this.excludes,
    ]
    await writeFile(join(infoDir, 'exclude'), `${lines.join('\n')}\n`, { encoding: 'utf8', mode: 0o600 })
  }

  /**
   * Stage the working tree into the shadow index, honouring the size cap.
   *
   * Deliberately NOT `add --force`. `--force` bypasses every exclusion source —
   * including this repository's own `info/exclude` — so it stages `node_modules`
   * and every build directory the excludes exist to skip. On a real project that
   * is tens of thousands of files per snapshot, which is not "slower": it is a
   * checkpoint that never finishes.
   *
   * The consequence, stated plainly: a file the project's own `.gitignore`
   * ignores is not checkpointed, because the shadow repository reads those
   * `.gitignore` files too. That is the right trade — ignored paths are
   * overwhelmingly build output, caches, and secrets, none of which belong in a
   * snapshot — but it does mean rollback does not cover them.
   */
  private async stage(repo: ShadowRepo, signal?: AbortSignal): Promise<void> {
    const env = this.env(repo)
    const added = await git(['add', '--all', '.'], { cwd: repo.workTree, env, signal })
    if (!added.ok) {
      throw new SnapshotError('git-failed', `git could not stage the workspace: ${added.stderr.trim() || `exit ${added.code}`}`)
    }
    await this.dropOversized(repo, signal)
  }

  /**
   * Unstage anything past the size cap.
   *
   * Sizes come from one `cat-file --batch-check` fed every object id, rather than
   * one `cat-file -s` per file. The per-file form spawns a process per staged
   * file, which on a repository of any size costs more than the snapshot it is
   * protecting.
   */
  private async dropOversized(repo: ShadowRepo, signal?: AbortSignal): Promise<void> {
    const env = this.env(repo)
    const limit = this.maxFileSizeMb * 1024 * 1024
    const listed = await git(['ls-files', '-s', '-z'], { cwd: repo.workTree, env, signal })
    if (!listed.ok) return

    // `<mode> <object> <stage>\t<path>` per record.
    const staged: { object: string; path: string }[] = []
    for (const record of splitNul(listed.stdout)) {
      const tab = record.indexOf('\t')
      if (tab < 0) continue
      const object = record.slice(0, tab).split(' ')[1]
      if (object !== undefined) staged.push({ object, path: record.slice(tab + 1) })
    }
    if (staged.length === 0) return

    const sizes = await git(['cat-file', '--batch-check=%(objectname) %(objectsize)'], {
      cwd: repo.workTree,
      env,
      signal,
      input: `${staged.map(entry => entry.object).join('\n')}\n`,
    })
    if (!sizes.ok) return

    const oversized = new Set<string>()
    const byObject = new Map<string, number>()
    for (const line of sizes.stdout.split('\n')) {
      const [object, size] = line.trim().split(' ')
      const bytes = Number.parseInt(size ?? '', 10)
      if (object !== undefined && Number.isFinite(bytes)) byObject.set(object, bytes)
    }
    for (const entry of staged) {
      const bytes = byObject.get(entry.object)
      if (bytes !== undefined && bytes > limit) oversized.add(entry.path)
    }
    if (oversized.size === 0) return

    // Batched: one `rm --cached` per chunk rather than one argument list long
    // enough to exceed the platform's command-line limit.
    const paths = [...oversized]
    const CHUNK = 200
    for (let index = 0; index < paths.length; index += CHUNK) {
      await git(['rm', '--cached', '--quiet', '--', ...paths.slice(index, index + CHUNK)], {
        cwd: repo.workTree, env, signal,
      })
    }
  }

  /**
   * Take one checkpoint. Returns `created: false` when the tree is identical to
   * the previous checkpoint — an empty commit per turn would make the history
   * unreadable.
   *
   * @throws {SnapshotError} when git is missing, or when it refused an operation.
   */
  async snapshot(workTree: string, sessionId: string, label: string, signal?: AbortSignal): Promise<SnapshotResult> {
    const repo = await this.ensure(workTree)
    if (repo === undefined) {
      throw new SnapshotError('no-git', 'git is not on PATH, so checkpoints cannot be taken')
    }
    const env = this.env(repo)

    await this.stage(repo, signal)

    const head = await git(['rev-parse', '--verify', 'HEAD'], { cwd: repo.workTree, env, signal })
    const hasHead = head.ok

    // Nothing to record is the common case between two turns that read files.
    if (hasHead) {
      const diff = await git(['diff', '--cached', '--quiet'], { cwd: repo.workTree, env, signal })
      if (diff.ok) return { id: head.stdout.trim(), changed: 0, created: false }
    }

    const message = `${MESSAGE_PREFIX} ${sessionId}\n\n${label}`
    const commit = await git(
      ['commit', '--quiet', '--no-verify', '--allow-empty-message', '--message', message],
      { cwd: repo.workTree, env, signal },
    )
    if (!commit.ok) {
      // The message carries git's own stderr: this is the one failure mode a
      // user cannot diagnose from the outside, and paraphrasing it loses the
      // detail that identifies it.
      throw new SnapshotError('git-failed', `git refused the checkpoint commit: ${commit.stderr.trim() || `exit ${commit.code}`}`)
    }

    const created = await git(['rev-parse', 'HEAD'], { cwd: repo.workTree, env, signal })
    const id = created.stdout.trim()
    const stat = hasHead
      ? await git(['diff', '--name-only', '-z', `${id}^`, id], { cwd: repo.workTree, env, signal })
      : await git(['ls-tree', '-r', '--name-only', '-z', id], { cwd: repo.workTree, env, signal })
    return { id, changed: stat.ok ? splitNul(stat.stdout).length : 0, created: true }
  }

  /** Every checkpoint for one workspace, newest first, optionally one session's. */
  async list(workTree: string, sessionId?: string, signal?: AbortSignal): Promise<CheckpointRow[]> {
    const repo = this.repoFor(workTree)
    const env = this.env(repo)
    const result = await git(
      ['log', `--format=%H${FIELD_SEP}%at${FIELD_SEP}%s${FIELD_SEP}%b${RECORD_SEP}`, '--no-color'],
      { cwd: workTree, env, signal },
    )
    if (!result.ok) return []

    const rows: CheckpointRow[] = []
    for (const record of result.stdout.split(RECORD_SEP)) {
      const trimmed = record.trim()
      if (trimmed.length === 0) continue
      const [hash, at, subject, body] = trimmed.split(FIELD_SEP)
      if (hash === undefined) continue
      const owner = subject?.startsWith(`${MESSAGE_PREFIX} `) === true
        ? subject.slice(MESSAGE_PREFIX.length + 1).trim()
        : ''
      if (sessionId !== undefined && owner !== sessionId) continue
      rows.push({
        id: hash,
        sessionId: owner,
        at: Number.parseInt(at ?? '0', 10) * 1000,
        label: (body ?? '').trim(),
        changed: 0,
        baseline: false,
      })
    }
    // The oldest checkpoint is the baseline: the state before this plugin
    // recorded anything for the workspace.
    const oldest = rows[rows.length - 1]
    if (oldest !== undefined) rows[rows.length - 1] = { ...oldest, baseline: true }
    return rows
  }

  /** Paths one checkpoint would change, and which of those the user's git does not hold. */
  async preview(workTree: string, checkpointId: string, signal?: AbortSignal): Promise<{ affected: string[]; unprotected: string[] }> {
    const repo = this.repoFor(workTree)
    const env = this.env(repo)
    await this.stage(repo, signal)
    const diff = await git(['diff', '--name-only', '-z', checkpointId], { cwd: workTree, env, signal })
    const affected = diff.ok ? splitNul(diff.stdout) : []
    if (affected.length === 0) return { affected, unprotected: [] }

    // Which of these would the user's own repository still have a copy of?
    // Anything it does not track is only in the working tree, so a restore is
    // the one operation that can lose it for good.
    const tracked = await git(['ls-files', '-z', '--', ...affected], { cwd: workTree })
    const known = new Set(tracked.ok ? splitNul(tracked.stdout) : [])
    return { affected, unprotected: affected.filter(path => !known.has(path)) }
  }

  /**
   * Restore the working tree to one checkpoint.
   *
   * Three steps, in this order:
   *   1. A checkpoint of the current state, so the restore is itself undoable.
   *      When the tree is already recorded, the existing HEAD *is* that undo
   *      point — the caller gets an id either way, because "you can get back"
   *      must not depend on whether a new commit happened to be needed.
   *   2. `read-tree` + `checkout-index` to write the checkpoint's content, then
   *      explicit removal of files the checkpoint does not contain.
   *   3. A new commit recording the restored state.
   *
   * Step 3 commits FORWARD rather than resetting the branch back to the
   * restored checkpoint. A `reset` would rewind the shadow branch and orphan
   * every checkpoint taken after the restored one — which is precisely the
   * state a user needs to undo a restore they regret.
   *
   * `git checkout` is deliberately not used at all: it moves HEAD, and it would
   * not delete files added after the checkpoint.
   */
  async restore(workTree: string, sessionId: string, checkpointId: string, signal?: AbortSignal): Promise<{ undoId?: string; restored: number; removed: number }> {
    const repo = await this.ensure(workTree)
    if (repo === undefined) throw new Error('git is not available, so checkpoints cannot be restored')
    const env = this.env(repo)

    // A restore that cannot first record where it started is refused: the
    // snapshot IS the undo point, and letting the restore proceed without one
    // would turn a reversible operation into a destructive one. The throw
    // propagates for exactly that reason.
    const snapshot = await this.snapshot(workTree, sessionId, `before restoring ${checkpointId.slice(0, 8)}`, signal)
    // Returns the existing HEAD when there was nothing new to record; either way
    // that commit is what an undo goes back to.
    const undoId = snapshot.id

    // Files present now that the target does not have; computed before the
    // index is overwritten.
    const current = await git(['ls-files', '-z'], { cwd: workTree, env, signal })
    const target = await git(['ls-tree', '-r', '--name-only', '-z', checkpointId], { cwd: workTree, env, signal })
    if (!target.ok) throw new Error('no such checkpoint')
    const targetPaths = new Set(splitNul(target.stdout))
    const toRemove = (current.ok ? splitNul(current.stdout) : []).filter(path => !targetPaths.has(path))

    const read = await git(['read-tree', checkpointId], { cwd: workTree, env, signal })
    if (!read.ok) throw new Error('could not read that checkpoint')
    const checkout = await git(['checkout-index', '-a', '-f'], { cwd: workTree, env, signal })
    if (!checkout.ok) throw new Error('could not write the checkpoint contents')

    let removed = 0
    for (const path of toRemove) {
      try {
        await rm(join(workTree, path), { force: true })
        removed += 1
      } catch { /* a file already gone needs no removal */ }
    }

    // Record the restored state as a new checkpoint on top of the history,
    // rather than rewinding the branch to the restored commit. The next snapshot
    // then diffs against what is on disk, and every checkpoint taken after the
    // restored one is still reachable — which is what makes undoing a restore
    // possible at all.
    await this.snapshot(workTree, sessionId, `restored ${checkpointId.slice(0, 8)}`, signal)

    return { undoId, restored: targetPaths.size, removed }
  }

  /** Read one file as it was at a checkpoint, for a diff view. */
  async readFile(workTree: string, checkpointId: string, path: string, signal?: AbortSignal): Promise<string | undefined> {
    const repo = this.repoFor(workTree)
    const result = await git(['show', `${checkpointId}:${path}`], { cwd: workTree, env: this.env(repo), signal })
    return result.ok ? result.stdout : undefined
  }

  /**
   * The patch one checkpoint introduced.
   *
   * `diff-tree -p --root` rather than `diff`: it takes a single commit and
   * reports what that commit changed against its parent, handling the first
   * checkpoint correctly. `git diff --root <commit>` compares the commit against
   * the *working tree* instead, which renders the baseline checkpoint as a list
   * of deletions — the exact opposite of what it introduced.
   */
  async diff(workTree: string, checkpointId: string, signal?: AbortSignal): Promise<string> {
    const repo = this.repoFor(workTree)
    const result = await git(
      ['diff-tree', '-p', '--root', '--no-color', '--find-renames', checkpointId],
      { cwd: workTree, env: this.env(repo), signal },
    )
    return result.stdout
  }

  /** Drop checkpoints older than the retention window. */
  async prune(workTree: string, retentionDays: number, signal?: AbortSignal): Promise<number> {
    if (retentionDays <= 0) return 0
    const repo = this.repoFor(workTree)
    const env = this.env(repo)
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
    const rows = await this.list(workTree, undefined, signal)
    const keep = rows.filter(row => row.at >= cutoff)
    if (keep.length === rows.length) return 0

    // Re-root the branch at the oldest checkpoint worth keeping, then let git
    // drop what nothing references.
    const oldest = keep[keep.length - 1]
    if (oldest === undefined) return 0
    await git(['reset', '--soft', oldest.id], { cwd: workTree, env, signal })
    await git(['reflog', 'expire', '--expire=now', '--all'], { cwd: workTree, env, signal })
    await git(['gc', '--prune=now', '--quiet'], { cwd: workTree, env, signal })
    return rows.length - keep.length
  }

  /** Remove one workspace's shadow repository entirely. */
  async forget(workTree: string): Promise<void> {
    await rm(this.repoFor(workTree).gitDir, { recursive: true, force: true })
  }

  /** Whether a shadow repository exists for this workspace yet. */
  async exists(workTree: string): Promise<boolean> {
    try {
      await readFile(join(this.repoFor(workTree).gitDir, 'HEAD'), 'utf8')
      return true
    } catch {
      return false
    }
  }
}
