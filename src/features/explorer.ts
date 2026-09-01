import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import { readdir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import { git, hasGit, repositoryRoot, splitNul } from '../git.ts'
import type { Config } from '../config.ts'
import type { ChangeEntry, ExplorerStatus, TreeEntry } from '../shared/api-contract.ts'

/**
 * Feature 5 — a side panel showing the workspace directory tree and its
 * uncommitted changes.
 *
 * Strictly read-only. Every git invocation here is a query (`status`,
 * `rev-parse`, `diff --stat`); nothing stages, commits, checks out, or stashes.
 * That is the whole safety story for this feature: the user's repository state
 * is observed, never altered.
 */

/** Directories never worth walking into for a project tree. */
const ALWAYS_HIDDEN = new Set(['.git', 'node_modules', '.venv', '__pycache__', '.DS_Store'])

/**
 * Resolve a client-supplied relative path inside one workspace root.
 *
 * The browser half is same-origin and the server is loopback, but this endpoint
 * still reads the filesystem on behalf of whatever reaches it, so containment
 * is enforced here rather than assumed: the resolved real path must sit inside
 * the resolved real root. Checking after `realpath` is what makes a symlink
 * pointing out of the workspace fail instead of following.
 *
 * @param root - workspace root, already canonical.
 * @param requested - client-supplied workspace-relative path (may be empty).
 * @returns the absolute canonical path to read.
 */
async function containedPath(root: string, requested: string): Promise<string> {
  if (requested.length === 0) return root
  if (isAbsolute(requested) || requested.includes('\0')) {
    throw new ApiError(400, 'path must be relative to the workspace root')
  }
  const candidate = resolve(root, requested)
  let real: string
  try {
    real = await realpath(candidate)
  } catch {
    throw new ApiError(404, 'no such path in this workspace')
  }
  const rootReal = await realpath(root)
  const rel = relative(rootReal, real)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new ApiError(403, 'that path is outside the workspace')
  }
  return real
}

/** Workspace-relative, `/`-separated — the form both halves and git agree on. */
function toPosix(root: string, absolute: string): string {
  return relative(root, absolute).split(sep).join('/')
}

/**
 * Ignored-path check for one directory's children, in a single git call.
 *
 * `check-ignore -z --stdin` answers for a whole batch, which matters because
 * the alternative — one call per entry — turns a 500-entry directory into 500
 * process spawns.
 */
async function ignoredChildren(
  root: string,
  names: readonly string[],
  dir: string,
  signal: AbortSignal,
): Promise<Set<string>> {
  if (names.length === 0) return new Set()
  const relDir = toPosix(root, dir)
  const candidates = names.map(name => (relDir.length === 0 ? name : `${relDir}/${name}`))
  const result = await git(['check-ignore', '-z', '--stdin'], { cwd: root, signal, input: candidates.join('\0') })
  // Exit 1 means "nothing ignored", which is not an error.
  if (!result.ok && result.code !== 1) return new Set()
  return new Set(splitNul(result.stdout))
}

async function listDirectory(
  root: string,
  dir: string,
  config: Config,
  signal: AbortSignal,
): Promise<TreeEntry[]> {
  const cap = config.explorer.maxEntriesPerDir
  let dirents
  try {
    dirents = await readdir(dir, { withFileTypes: true })
  } catch (error: unknown) {
    const code = (error as { code?: string }).code
    if (code === 'ENOTDIR') throw new ApiError(400, 'that path is a file, not a directory')
    if (code === 'EACCES' || code === 'EPERM') throw new ApiError(403, 'that directory cannot be read')
    throw new ApiError(404, 'no such directory in this workspace')
  }

  const visible = dirents.filter(entry => !ALWAYS_HIDDEN.has(entry.name))
  const ignored = config.explorer.respectGitignore
    ? await ignoredChildren(root, visible.map(entry => entry.name), dir, signal)
    : new Set<string>()

  const rows: TreeEntry[] = []
  let truncated = false
  for (const entry of visible) {
    const path = toPosix(root, join(dir, entry.name))
    if (ignored.has(path)) continue
    if (rows.length >= cap) {
      truncated = true
      break
    }
    // A symlink is reported as what it is at this level: following it here is
    // how a tree walk ends up in a cycle or outside the workspace.
    const isDirectory = entry.isDirectory()
    let size: number | undefined
    if (entry.isFile()) {
      try {
        size = (await stat(join(dir, entry.name))).size
      } catch { /* a file that vanished mid-listing simply has no size */ }
    }
    rows.push({ name: entry.name, path, kind: isDirectory ? 'directory' : 'file', size })
  }

  // Directories first, then case-insensitive by name — the ordering every file
  // tree a developer has used already has.
  rows.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' })
  })
  const last = rows[rows.length - 1]
  if (truncated && last !== undefined) rows[rows.length - 1] = { ...last, truncated: true }
  return rows
}

/**
 * Parse `git status --porcelain=v1 -z`.
 *
 * `-z` is required, not a preference: the default output quotes and escapes
 * paths containing spaces or non-ASCII bytes, and a rename record carries two
 * paths. With `-z` each record is `XY<space><path>` and a rename appends its
 * original path as the *following* NUL-delimited field.
 */
export function parseStatus(stdout: string): ChangeEntry[] {
  const fields = splitNul(stdout)
  const changes: ChangeEntry[] = []
  for (let index = 0; index < fields.length; index += 1) {
    const record = fields[index]
    if (record === undefined || record.length < 4) continue
    const index0 = record[0] ?? ' '
    const worktree = record[1] ?? ' '
    const path = record.slice(3)
    let from: string | undefined
    if (index0 === 'R' || index0 === 'C') {
      // The original path is its own field, consumed here so it is not read as
      // the next status record.
      index += 1
      from = fields[index]
    }
    changes.push({
      path,
      from,
      index: index0,
      worktree,
      staged: index0 !== ' ' && index0 !== '?',
      untracked: index0 === '?' && worktree === '?',
    })
  }
  return changes
}

/** Branch, upstream distance, and the working tree's changes. */
async function readStatus(root: string, signal: AbortSignal): Promise<ExplorerStatus> {
  if (!await hasGit(root)) return { isRepository: false, changes: [] }
  const repo = await repositoryRoot(root, signal)
  if (repo === undefined) return { isRepository: false, changes: [] }

  const [statusResult, branchResult, trackingResult] = await Promise.all([
    git(['status', '--porcelain=v1', '-z', '--untracked-files=normal'], { cwd: root, signal }),
    git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, signal }),
    git(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], { cwd: root, signal }),
  ])

  let ahead: number | undefined
  let behind: number | undefined
  if (trackingResult.ok) {
    // `--left-right --count` prints "<behind>\t<ahead>" for upstream...HEAD.
    const [left, right] = trackingResult.stdout.trim().split(/\s+/)
    const parsedBehind = Number.parseInt(left ?? '', 10)
    const parsedAhead = Number.parseInt(right ?? '', 10)
    if (Number.isFinite(parsedBehind)) behind = parsedBehind
    if (Number.isFinite(parsedAhead)) ahead = parsedAhead
  }

  const branch = branchResult.ok ? branchResult.stdout.trim() : undefined
  return {
    isRepository: true,
    // A repository with no commits yet reports `HEAD`; that is not a branch name.
    branch: branch === undefined || branch.length === 0 || branch === 'HEAD' ? undefined : branch,
    ahead,
    behind,
    changes: statusResult.ok ? parseStatus(statusResult.stdout) : [],
  }
}

/**
 * The workspaces this deployment knows, in registry order.
 *
 * The working directory is appended as a fallback whenever the registry is
 * absent OR empty. Empty is the ordinary state of a fresh install: the registry
 * is built from session history, so a harness that has never held a session
 * knows no workspaces, and an explorer that reported "nothing to explore" on
 * first launch would look broken rather than new.
 */
function workspaceRoots(ctx: Context): { id: string; title: string; root: string }[] {
  const listed = ctx.get('workspaceRegistry')?.list() ?? []
  if (listed.length === 0) {
    return [{ id: 'cwd', title: 'Working directory', root: process.cwd() }]
  }
  return listed.map(workspace => ({
    id: String(workspace.id),
    title: workspace.title ?? workspace.path,
    root: workspace.path,
  }))
}

/**
 * The directory one session is working in.
 *
 * A session's own `cwd` is the only correct answer to "which project is the user
 * looking at". The registry's first entry is merely the oldest workspace it
 * knows, so defaulting to it shows an arbitrary OTHER project — which is worse
 * than showing nothing, because a changes list that belongs to a different
 * repository looks authoritative and is not.
 */
function sessionRoot(ctx: Context, sessionId: string): string | undefined {
  // `sessions.get` answers only for a LIVE session, which is exactly the case
  // that matters: the explorer is asking on behalf of the session on screen.
  const session = ctx.get('sessions')?.get(sessionId as never)
  const cwd = (session as { meta?: { cwd?: unknown } } | undefined)?.meta?.cwd
  return typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined
}

/**
 * Decide which directory to answer about, most authoritative source first.
 *
 *   1. The requesting session's own `cwd` — the project the user is demonstrably
 *      working in. Only a materialized session has one.
 *   2. The workspace the client named. For a blank session (no `cwd` yet, because
 *      nothing has been sent) the browser passes the most recently active
 *      workspace, which is what the user last chose.
 *   3. The registry's first entry, as a last resort.
 *
 * Step 3 alone used to be the whole implementation, and it was wrong in the
 * common case: the registry's first entry is its OLDEST workspace, so a fresh
 * session showed some unrelated project's file tree and change list as though it
 * were the current one.
 */
function resolveRoot(ctx: Context, requestedId: string | null, sessionId?: string | null): { id: string; root: string } {
  const roots = workspaceRoots(ctx)
  const first = roots[0]
  if (first === undefined) throw new ApiError(409, 'this deployment has no workspace to explore')

  if (sessionId !== undefined && sessionId !== null && sessionId.length > 0) {
    const root = sessionRoot(ctx, sessionId)
    if (root !== undefined) {
      // Report the registry's id for it when there is one, so the client can pin
      // the same workspace on later calls.
      const known = roots.find(row => row.root === root)
      return { id: known?.id ?? root, root }
    }
  }

  if (requestedId !== null && requestedId.length > 0) {
    const found = roots.find(row => row.id === requestedId || row.root === requestedId)
    if (found === undefined) throw new ApiError(404, 'no such workspace')
    return { id: found.id, root: found.root }
  }

  return { id: first.id, root: first.root }
}

export function mountExplorer(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
): () => void {
  return installRoutes(routes, {
    '/explorer/workspaces': () => ({ workspaces: workspaceRoots(ctx) }),

    '/explorer/tree': async ({ query, req }) => {
      const settings = config()
      if (!settings.explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const { id, root } = resolveRoot(ctx, query.get('workspace'), query.get('session'))
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const dir = await containedPath(root, query.get('path') ?? '')
      return {
        workspace: id,
        path: toPosix(root, dir),
        entries: await listDirectory(root, dir, settings, controller.signal),
      }
    },

    '/explorer/status': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const { id, root } = resolveRoot(ctx, query.get('workspace'), query.get('session'))
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      return { workspace: id, ...await readStatus(root, controller.signal) }
    },

    '/explorer/diff': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const { root } = resolveRoot(ctx, query.get('workspace'), query.get('session'))
      const requested = query.get('path')
      if (requested === null || requested.length === 0) throw new ApiError(400, 'a path is required')
      // Validate containment before handing the path to git, then pass it after
      // `--` so a path that looks like an option cannot become one.
      await containedPath(root, requested)
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const staged = query.get('staged') === '1'
      const result = await git(
        ['diff', ...(staged ? ['--cached'] : []), '--no-color', '--', requested],
        { cwd: root, signal: controller.signal },
      )
      if (!result.ok && result.stdout.length === 0) {
        throw new ApiError(409, 'git could not produce a diff for that path')
      }
      return { path: requested, staged, patch: result.stdout }
    },
  })
}
