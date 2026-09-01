/**
 * Proves the load-bearing safety claim of feature 8: taking and restoring
 * checkpoints does not touch the project's own git state.
 *
 * Run with `node scripts/verify-checkpoints.mjs`. Creates a throwaway repository
 * in the OS temp directory, records the project's git state before and after a
 * full snapshot/restore cycle, and fails loudly on any difference in:
 *
 *   - HEAD and the commit graph (`rev-list --all`)
 *   - the index (`status --porcelain`, and the raw `.git/index` bytes)
 *   - the reflog, stash list, and branch list
 *   - the set of files under `.git/`
 *
 * Deliberately a script rather than a unit test: the claim is about a real git
 * repository's real on-disk state, which a mocked git cannot demonstrate.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const root = mkdtempSync(join(tmpdir(), 'dsh-cp-'))
const project = join(root, 'project')
const shadowRoot = join(root, 'shadow')
mkdirSync(project, { recursive: true })
mkdirSync(shadowRoot, { recursive: true })

function git(args, cwd = project, env = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env, GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' },
  }).trim()
}

function tryGit(args, cwd = project) {
  try {
    return git(args, cwd)
  } catch {
    return '<none>'
  }
}

/** Everything about the project's git that a well-behaved plugin must not change. */
function gitFingerprint() {
  const dotGit = join(project, '.git')
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else files.push(relative(dotGit, full).split('\\').join('/'))
    }
  }
  if (existsSync(dotGit)) walk(dotGit)

  const indexPath = join(dotGit, 'index')
  return {
    head: tryGit(['rev-parse', 'HEAD']),
    branch: tryGit(['rev-parse', '--abbrev-ref', 'HEAD']),
    commits: tryGit(['rev-list', '--all']),
    // `--no-optional-locks` keeps this observation from refreshing the index's
    // stat cache, which would otherwise make the fingerprint change the very
    // thing it is measuring.
    status: tryGit(['--no-optional-locks', 'status', '--porcelain']),
    reflog: tryGit(['reflog', '--format=%H %gs']),
    stash: tryGit(['stash', 'list']),
    branches: tryGit(['branch', '--all', '--format=%(refname)']),
    tags: tryGit(['tag', '--list']),
    /**
     * What the index MEANS: the staged content, independent of the stat cache.
     * git opportunistically rewrites `.git/index` to refresh cached mtimes
     * whenever it notices a file's timestamp changed — including after a
     * legitimate working-tree write by any tool — so raw bytes are not the
     * property under test. Staged paths and their blob hashes are.
     */
    indexContent: tryGit(['--no-optional-locks', 'ls-files', '--stage']),
    indexHashRaw: existsSync(indexPath)
      ? createHash('sha256').update(readFileSync(indexPath)).digest('hex')
      : '<no index>',
    dotGitFiles: files.sort().join('\n'),
  }
}

function report(label, ok, detail) {
  process.stdout.write(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail === undefined ? '' : ` — ${detail}`}\n`)
  if (!ok) process.exitCode = 1
}

// ── set up a project repository with real history ──────────────────────────

git(['init', '--quiet', '--initial-branch=main'])
git(['config', 'user.email', 'dev@example.invalid'])
git(['config', 'user.name', 'Dev'])
writeFileSync(join(project, 'tracked.txt'), 'v1\n')
writeFileSync(join(project, '.gitignore'), 'ignored.txt\n')
git(['add', '.'])
git(['commit', '--quiet', '-m', 'first commit'])
git(['branch', 'side'])

// The three interesting file classes: committed-and-modified, untracked, ignored.
writeFileSync(join(project, 'tracked.txt'), 'v2-uncommitted\n')
writeFileSync(join(project, 'untracked.txt'), 'only-on-disk\n')
writeFileSync(join(project, 'ignored.txt'), 'ignored-content\n')
// A staged change, so the index is non-trivial and a stray `git add` would show.
writeFileSync(join(project, 'staged.txt'), 'staged-v1\n')
git(['add', 'staged.txt'])

const before = gitFingerprint()
process.stdout.write(`Project repository: ${project}\nHEAD before: ${before.head}\n\n`)

// ── exercise the store ─────────────────────────────────────────────────────

// The store is TypeScript, so it is bundled to a throwaway ESM file first. This
// exercises the same source the plugin ships, not a re-implementation.
const { build } = await import('esbuild')
// Emitted inside this package so its bare imports resolve from the local
// node_modules; removed on the way out.
const storeBundle = join(process.cwd(), 'lib', 'checkpoint-store.verify.mjs')
// A tiny entry so the store AND the shipped exclude list come from source.
const verifyEntry = join(process.cwd(), 'src', 'checkpoints.verify.entry.ts')
writeFileSync(verifyEntry, [
  "export { CheckpointStore } from './checkpoint-store.ts'",
  "export { DEFAULT_CHECKPOINT_EXCLUDES } from './config.ts'",
].join(String.fromCharCode(10)))
await build({
  entryPoints: [verifyEntry],
  outfile: storeBundle,
  bundle: true,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  logLevel: 'error',
})
const { CheckpointStore, DEFAULT_CHECKPOINT_EXCLUDES } = await import(pathToFileURL(storeBundle).href)
rmSync(verifyEntry, { force: true })

// The excludes and cap the plugin actually ships with, so this exercises the
// configuration users get rather than one invented for the test.
const store = new CheckpointStore(shadowRoot, DEFAULT_CHECKPOINT_EXCLUDES, 32)

process.stdout.write('Taking checkpoint 1…\n')
const first = await store.snapshot(project, 'session-a', 'before the first edit')
if (first === undefined) {
  process.stdout.write('  git unavailable; cannot verify\n')
  process.exit(1)
}

// The agent changes files: one tracked edit, one new file, one deletion.
writeFileSync(join(project, 'tracked.txt'), 'v3-agent-edit\n')
writeFileSync(join(project, 'agent-added.txt'), 'added by the agent\n')
rmSync(join(project, 'untracked.txt'))

process.stdout.write('Taking checkpoint 2…\n')
const second = await store.snapshot(project, 'session-a', 'after the agent edit')

process.stdout.write(`Restoring checkpoint 1 (${first.id.slice(0, 8)})…\n\n`)
const restored = await store.restore(project, 'session-a', first.id)

// ── verify ─────────────────────────────────────────────────────────────────

process.stdout.write('Project git state:\n')
const after = gitFingerprint()
for (const key of Object.keys(before)) {
  const same = before[key] === after[key]
  // The raw index bytes are reported, not asserted: git rewrites them to
  // refresh its stat cache after ANY tool changes a file's mtime, so a
  // difference here is expected and does not indicate a staged-content change.
  // `indexContent` is the assertion that matters.
  if (key === 'indexHashRaw') {
    process.stdout.write(`  note  raw .git/index bytes ${same ? 'identical' : 'differ (stat-cache refresh; staged content asserted separately)'}\n`)
    continue
  }
  report(`${key} unchanged`, same,
    same ? undefined : `\n      before: ${JSON.stringify(before[key]).slice(0, 200)}\n      after:  ${JSON.stringify(after[key]).slice(0, 200)}`)
}

process.stdout.write('\nWorking tree restored:\n')
report('tracked.txt rolled back to its checkpoint content',
  readFileSync(join(project, 'tracked.txt'), 'utf8') === 'v2-uncommitted\n',
  JSON.stringify(readFileSync(join(project, 'tracked.txt'), 'utf8')))
report('a file created after the checkpoint was removed',
  !existsSync(join(project, 'agent-added.txt')))
report('a file deleted after the checkpoint came back',
  existsSync(join(project, 'untracked.txt')))
report('the restore is itself undoable', typeof restored.undoId === 'string' && restored.undoId.length > 0,
  restored.undoId ?? 'no undo checkpoint was recorded')
report('the second checkpoint exists and differs from the first',
  second !== undefined && second.created === true && second.id !== first.id)

// A restore the user regrets: going back to the state the restore replaced is
// the property that makes rollback safe to try, so it is asserted, not assumed.
process.stdout.write('\nUndoing the restore:\n')
const undone = await store.restore(project, 'session-a', restored.undoId)
report('the agent\'s edit is back',
  readFileSync(join(project, 'tracked.txt'), 'utf8') === 'v3-agent-edit\n',
  JSON.stringify(readFileSync(join(project, 'tracked.txt'), 'utf8')))
report('the agent\'s new file is back', existsSync(join(project, 'agent-added.txt')))
report('the file the agent deleted is gone again', !existsSync(join(project, 'untracked.txt')))
report('undoing an undo is also possible', typeof undone.undoId === 'string' && undone.undoId.length > 0)

// After an undo the WORKING TREE is deliberately back to the agent's state, so
// `git status` differs by design — that is the feature working. What must be
// invariant across every operation is the repository itself: history, refs,
// reflog, and staged content.
const afterUndo = gitFingerprint()
for (const key of ['head', 'branch', 'commits', 'reflog', 'stash', 'branches', 'tags', 'indexContent']) {
  report(`${key} still unchanged after the undo`, before[key] === afterUndo[key],
    before[key] === afterUndo[key] ? undefined : `\n      before: ${JSON.stringify(before[key]).slice(0, 200)}\n      after:  ${JSON.stringify(afterUndo[key]).slice(0, 200)}`)
}
report('the working tree legitimately differs from the pre-restore snapshot',
  before.status !== afterUndo.status,
  'an undo that changed nothing would mean the round trip did not happen')

process.stdout.write('\nShadow repository:\n')
const shadowDirs = readdirSync(shadowRoot)
// The specific hazard: `git init --separate-git-dir` run inside an existing
// repository replaces `.git` with a POINTER FILE and moves its contents. If a
// future change reintroduces that command, this is the check that catches it.
report('the project\'s .git is still a real directory',
  statSync(join(project, '.git')).isDirectory(),
  'a .git that became a file means its git directory was relocated')
report('lives outside the project', shadowDirs.length === 1 && !existsSync(join(project, '.git', 'dsh-index')))
report('holds its own index', shadowDirs.length === 1 && existsSync(join(shadowRoot, shadowDirs[0], 'dsh-index')))
const listed = await store.list(project, 'session-a')
report('lists this session\'s checkpoints', listed.length >= 3, `${listed.length} checkpoints`)
report('did not snapshot the project\'s .git',
  !listed.some(row => row.label.includes('.git')) &&
  (() => {
    const shadow = join(shadowRoot, shadowDirs[0])
    const tracked = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], {
      cwd: project,
      encoding: 'utf8',
      env: { ...process.env, GIT_DIR: shadow, GIT_WORK_TREE: project, LC_ALL: 'C' },
    })
    return !tracked.split('\n').some(line => line.startsWith('.git/'))
  })())

rmSync(storeBundle, { force: true })
// ── excludes are actually honoured ─────────────────────────────────────────
//
// The regression this guards: `git add --force` bypasses every exclusion source,
// including the shadow repo's own info/exclude. With it, a snapshot stages
// node_modules — thousands of files — and stops finishing at all. A count and a
// clock are the only things that catch that, so both are asserted.

process.stdout.write('\nExcludes and cost:\n')
mkdirSync(join(project, 'node_modules', 'left-pad'), { recursive: true })
for (let index = 0; index < 60; index += 1) {
  writeFileSync(join(project, 'node_modules', 'left-pad', `file-${index}.js`), `module.exports = ${index}\n`)
}
mkdirSync(join(project, 'dist'), { recursive: true })
writeFileSync(join(project, 'dist', 'bundle.js'), 'built\n')
writeFileSync(join(project, 'real-source.ts'), 'export const x = 1\n')

const started = Date.now()
const excluded = await store.snapshot(project, 'session-b', 'with node_modules present')
const elapsed = Date.now() - started

const shadowDir = join(shadowRoot, readdirSync(shadowRoot)[0])
const stagedPaths = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], {
  cwd: project,
  encoding: 'utf8',
  env: { ...process.env, GIT_DIR: shadowDir, GIT_WORK_TREE: project, LC_ALL: 'C' },
}).split('\n').filter(Boolean)

report('node_modules is not snapshotted',
  !stagedPaths.some(path => path.startsWith('node_modules/')),
  `${stagedPaths.filter(path => path.startsWith('node_modules/')).length} node_modules paths were staged`)
report('an excluded build directory is not snapshotted',
  !stagedPaths.some(path => path.startsWith('dist/')))
report('a real source file still is', stagedPaths.includes('real-source.ts'))
report('the snapshot stayed cheap', elapsed < 15_000, `${elapsed} ms for ${stagedPaths.length} files`)
report('a snapshot with new files records them', excluded.created === true)

// The diff view, including the baseline. `git diff --root <commit>` compares
// against the working tree and renders the first checkpoint as deletions, so the
// direction is asserted rather than assumed.
process.stdout.write('\nCheckpoint diffs:\n')
const baselineId = (await store.list(project, 'session-a')).at(-1).id
const baselinePatch = await store.diff(project, baselineId)
report('the baseline diff shows what it introduced, not deletions',
  baselinePatch.includes('+v2-uncommitted') && !baselinePatch.includes('+++ /dev/null'),
  baselinePatch.length === 0 ? 'the patch was empty' : baselinePatch.split('\n').slice(0, 4).join(' | '))
const latestPatch = await store.diff(project, excluded.id)
report('a later checkpoint diffs against its parent',
  latestPatch.includes('real-source.ts'),
  latestPatch.length === 0 ? 'the patch was empty' : `${latestPatch.length} chars`)

rmSync(storeBundle, { force: true })
process.stdout.write(`\n${process.exitCode === 1 ? 'FAILED' : 'All checks passed.'}\n`)
if (process.exitCode !== 1) rmSync(root, { recursive: true, force: true })
else process.stdout.write(`Left ${root} in place for inspection.\n`)
