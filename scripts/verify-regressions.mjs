import assert from 'node:assert/strict'
import { execFile, execFileSync } from 'node:child_process'
import { promisify } from 'node:util'
import { EventEmitter } from 'node:events'
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { build } from 'esbuild'

// Bundle in memory; test artifacts and every Git mutation stay in this unique directory.
const fixture = await mkdtemp(join(tmpdir(), 'dsh-regressions-'))
const result = await build({
  stdin: {
    contents: `
      export { isSameOrigin } from './http.ts'
      export { DEFAULT_CONFIG } from './config.ts'
      export { askReviewer, AuditLog } from './features/command-review.ts'
      export { clearLlmCache } from './features/llm-cache.ts'
      export { resolveRoot, containedPath, mountExplorer } from './features/explorer.ts'
      export { CheckpointStore } from './checkpoint-store.ts'
      export { mountCheckpoints } from './features/checkpoints.ts'
      export { SessionBindingStore, mountGitOps } from './features/git-ops.ts'
      export { mountSessionAdmin } from './features/session-admin.ts'
      export { settingsRoutes } from './features/settings-api.ts'
      export { updateQuarantine, readQuarantine } from './quarantine.ts'
      export { balanceRoutes } from './features/deepseek-balance.ts'
    `,
    resolveDir: resolve('src'), loader: 'ts',
  },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'error',
})
const mod = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports)
const api = mod.exports
let passed = 0
const test = async (name, run) => {
  await run()
  passed++
  console.log(`  PASS  ${name}`)
}
const config = () => structuredClone(api.DEFAULT_CONFIG)
const request = (body = {}, query = {}, method = 'POST') => ({
  body, query: new URLSearchParams(query), method, req: new EventEmitter(), res: new EventEmitter(),
})
const log = { warn() {}, info() {} }
const context = (services = {}, hooks = {}) => ({
  get: name => services[name], logger: () => log,
  on: (name, fn) => { hooks[name] = fn; return () => { delete hooks[name] } },
})
const signal = () => new AbortController().signal
const git = (cwd, args, extra = {}) => execFileSync('git', args, {
  cwd, encoding: 'utf8', windowsHide: true,
  env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0', ...extra },
}).trim()
async function repo(name) {
  const dir = join(fixture, name)
  await mkdir(dir)
  git(dir, ['init', '-q', '--initial-branch=main'])
  git(dir, ['config', 'user.name', 'Regression Test'])
  git(dir, ['config', 'user.email', 'test@example.invalid'])
  git(dir, ['config', 'core.autocrlf', 'false'])
  await writeFile(join(dir, 'tracked.txt'), 'original\n')
  git(dir, ['add', '.'])
  git(dir, ['commit', '-qm', 'initial'])
  return dir
}
function registry(root) {
  return { list: () => [{ id: 'workspace', path: root, sessionIds: ['session'] }] }
}
const rejectsStatus = (operation, status) => assert.rejects(operation, error => error.status === status)

try {
  await test('opaque and foreign origins are refused; native and same-origin calls remain valid', async () => {
    const req = origin => ({ headers: { host: 'localhost:3000', ...(origin === undefined ? {} : { origin }) } })
    assert.equal(api.isSameOrigin(req('null')), false)
    assert.equal(api.isSameOrigin(req('https://foreign.invalid')), false)
    assert.equal(api.isSameOrigin(req('http://localhost:3000')), true)
    assert.equal(api.isSameOrigin(req(undefined)), true)
    assert.equal(api.isSameOrigin({ headers: { host: 'localhost:3000', 'sec-fetch-site': 'cross-site' } }), false)
  })

  await test('review always uses the selected safety model and instructions, without chat tools', async () => {
    api.clearLlmCache()
    let captured
    const ctx = context({ llm: { stream: async function* (value) {
      captured = value
      yield { type: 'text-delta', text: '{"verdict":"ask","reason":"confirm"}' }
    } } })
    const settings = { ...config().commandReview, provider: 'review-provider', model: 'review-model' }
    const session = {
      id: 'session',
      requestHeader: () => ({ system: 'Chat instructions', config: { provider: 'chat', model: 'chat' }, tools: [{}] }),
      deriveMessages: () => [{ role: 'user', content: [] }],
    }
    const verdict = await api.askReviewer(ctx, settings, 'bash', 'sudo build', signal(), session)
    assert.equal(verdict.verdict, 'ask')
    assert.equal(captured.provider, 'review-provider')
    assert.equal(captured.model, 'review-model')
    assert.match(captured.system, /command safety reviewer/)
    assert.match(captured.system, /verdict/)
    assert.equal(captured.tools, undefined)
    assert.equal(captured.messages.length, 1)
    assert.equal(await api.askReviewer(ctx, settings, 'bash', 'x'.repeat(8001), signal(), session), undefined)
  })

  await test('failed review streams are not accepted or cached', async () => {
    api.clearLlmCache()
    let calls = 0
    const ctx = context({ llm: { stream: async function* () {
      calls++
      yield { type: 'text-delta', text: '{"verdict":"allow"}' }
      yield { type: 'finish', reason: { kind: 'error' } }
    } } })
    for (let i = 0; i < 2; i++) assert.equal(await api.askReviewer(ctx, config().commandReview, 'bash', 'review-error', signal()), undefined)
    assert.equal(calls, 2)
  })

  await test('audit reads, compaction, appends and clearing use one ordered queue', async () => {
    const file = join(fixture, 'audit.jsonl')
    const audit = new api.AuditLog(file, () => {})
    const row = at => ({ at, tool: 'bash', command: String(at), verdict: 'ask', reason: 'test', decidedBy: 'rules' })
    for (let i = 0; i < 5; i++) audit.record(row(i))
    const compacting = audit.read(2)
    audit.record(row(5))
    audit.record(row(6))
    await compacting
    assert.deepEqual((await audit.read(0)).map(r => r.at), [6, 5, 4, 3])
    const bytes = await readFile(file, 'utf8')
    await audit.read(2)
    assert.equal(await readFile(file, 'utf8'), bytes, 'at twice the cap, a read must not compact again')
    const clearing = audit.clear()
    audit.record(row(7))
    await clearing
    assert.deepEqual((await audit.read(0)).map(r => r.at), [7])
  })

  const project = await repo('project')
  const ctx = context({ workspaceRegistry: registry(project) })
  await test('concurrent Web and CLI quarantine updates share the writer lock', async () => {
    const home = join(fixture, 'rescue-home')
    const record = join(home, 'dsh-ext', 'quarantine.json')
    const patch = join(home, 'cordis.patch.yml')
    const run = promisify(execFile)
    await Promise.all([
      api.updateQuarantine(record, patch, rows => [...rows, 'web-a']),
      api.updateQuarantine(record, patch, rows => [...rows, 'web-b']),
      run(process.execPath, [resolve('bin/dsh-ext.mjs'), 'skip', 'cli-a'], { env: { ...process.env, DSH_HOME: home }, windowsHide: true }),
      run(process.execPath, [resolve('bin/dsh-ext.mjs'), 'skip', 'cli-b'], { env: { ...process.env, DSH_HOME: home }, windowsHide: true }),
    ])
    assert.deepEqual((await api.readQuarantine(record)).rows, ['cli-a', 'cli-b', 'web-a', 'web-b'])
    const content = await readFile(patch, 'utf8')
    for (const id of ['cli-a', 'cli-b', 'web-a', 'web-b']) assert.ok(content.includes(`- id: ${id}`))
    await writeFile(record, 'corrupt record')
    await assert.rejects(api.updateQuarantine(record, patch, () => []))
    assert.equal(await readFile(patch, 'utf8'), content)
  })
  await test('explicit workspace and session misses never select the first project', async () => {
    await rejectsStatus(() => api.resolveRoot(ctx, 'unknown-workspace', null, signal()), 404)
    await rejectsStatus(() => api.resolveRoot(ctx, null, 'unknown-session', signal()), 409)
    assert.equal((await api.resolveRoot(ctx, project, null, signal())).root, project)
    await rejectsStatus(() => api.resolveRoot(ctx, join(project, 'tracked.txt'), null, signal()), 404)
    const live = context({ sessions: { get: () => ({ header: { cwd: project } }) } })
    assert.equal((await api.resolveRoot(live, null, 'live', signal())).root, project)
  })

  await test('deleted-file diff works while missing paths through external links are refused', async () => {
    await rm(join(project, 'tracked.txt'))
    const routes = {}
    api.mountExplorer(ctx, config, routes)
    const review = await routes['/explorer/review'](request({}, { workspace: 'workspace', path: 'tracked.txt' }, 'GET'))
    assert.equal(review.oldText, 'original\n')
    assert.equal(review.newText, '')
    const diff = await routes['/explorer/diff'](request({}, { workspace: 'workspace', path: 'tracked.txt' }, 'GET'))
    assert.match(diff.patch, /-original/)
    await rejectsStatus(() => api.containedPath(project, '../missing.txt', true), 403)
    await symlink(fixture, join(project, 'outside'), process.platform === 'win32' ? 'junction' : 'dir')
    await rejectsStatus(() => api.containedPath(project, 'outside/missing.txt', true), 403)
    await rm(join(project, 'outside'))
    git(project, ['checkout', '--', 'tracked.txt'])
  })

  const gitSettings = config()
  const gitRoutes = {}
  const bindingFile = join(fixture, 'bindings.json')
  api.mountGitOps(ctx, () => gitSettings, gitRoutes, bindingFile)
  await test('branch names and start points cannot become Git options', async () => {
    git(project, ['branch', 'victim'])
    const before = git(project, ['show-ref'])
    for (const body of [
      { name: '-D', startPoint: 'victim', checkout: false },
      { name: 'new', startPoint: '--force', checkout: false },
      { name: '@{-1}', checkout: false },
    ]) await rejectsStatus(() => gitRoutes['/explorer/git/branch-create'](request({ workspace: 'workspace', ...body })), 400)
    await rejectsStatus(() => gitRoutes['/explorer/git/checkout'](request({ workspace: 'workspace', branch: '-f' })), 400)
    assert.equal(git(project, ['show-ref']), before)
  })
  await test('partial staging shows HEAD-to-index and index-to-working-tree independently', async () => {
    const routes = {}
    api.mountExplorer(ctx, config, routes)
    await writeFile(join(project, 'tracked.txt'), 'staged\n')
    git(project, ['add', 'tracked.txt'])
    await writeFile(join(project, 'tracked.txt'), 'working\n')
    const staged = await routes['/explorer/review'](request({}, { workspace: 'workspace', path: 'tracked.txt', side: 'staged' }, 'GET'))
    const unstaged = await routes['/explorer/review'](request({}, { workspace: 'workspace', path: 'tracked.txt', side: 'unstaged' }, 'GET'))
    assert.equal(staged.oldText, 'original\n')
    assert.equal(staged.newText, 'staged\n')
    assert.equal(unstaged.oldText, 'staged\n')
    assert.equal(unstaged.newText, 'working\n')
    await rm(join(project, 'tracked.txt'))
    assert.equal((await routes['/explorer/review'](request({}, { workspace: 'workspace', path: 'tracked.txt', side: 'staged' }, 'GET'))).newText, 'staged\n')
    git(project, ['reset', 'HEAD', '--', 'tracked.txt'])
    git(project, ['checkout', '--', 'tracked.txt'])
  })
  await test('discard requires explicit scope and never cleans on empty or invalid paths', async () => {
    await writeFile(join(project, 'untracked.txt'), 'keep me')
    await writeFile(join(project, 'tracked.txt'), 'modified\n')
    for (const body of [{}, { paths: [] }, { paths: [null] }, { paths: [''] }, { paths: ['.'] }]) {
      await rejectsStatus(() => gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', ...body })), 400)
    }
    await rejectsStatus(() => gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', all: true }, {}, 'GET')), 405)
    await rejectsStatus(() => gitRoutes['/explorer/git/discard'](request({ all: true })), 400)
    assert.equal(await readFile(join(project, 'untracked.txt'), 'utf8'), 'keep me')
    assert.equal(await readFile(join(project, 'tracked.txt'), 'utf8'), 'modified\n')
    await gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', paths: ['untracked.txt'] }))
    await assert.rejects(stat(join(project, 'untracked.txt')), { code: 'ENOENT' })
    assert.equal(await readFile(join(project, 'tracked.txt'), 'utf8'), 'modified\n')
    await gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', all: true }))
    assert.equal(await readFile(join(project, 'tracked.txt'), 'utf8'), 'original\n')
  })

  await test('discard handles mixed directories and treats wildcard-looking filenames literally', async () => {
    await mkdir(join(project, 'mixed'))
    await writeFile(join(project, 'mixed', 'tracked.txt'), 'base\n')
    await writeFile(join(project, '[x].txt'), 'literal\n')
    await writeFile(join(project, 'x.txt'), 'ordinary\n')
    git(project, ['add', '.'])
    git(project, ['commit', '-qm', 'mixed files'])
    await writeFile(join(project, 'mixed', 'tracked.txt'), 'changed\n')
    await writeFile(join(project, 'mixed', 'new.txt'), 'untracked')
    await gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', paths: ['mixed'] }))
    assert.equal(await readFile(join(project, 'mixed', 'tracked.txt'), 'utf8'), 'base\n')
    await assert.rejects(stat(join(project, 'mixed', 'new.txt')), { code: 'ENOENT' })
    await writeFile(join(project, '[x].txt'), 'changed\n')
    await writeFile(join(project, 'x.txt'), 'keep\n')
    await gitRoutes['/explorer/git/discard'](request({ workspace: 'workspace', paths: ['[x].txt'] }))
    assert.equal(await readFile(join(project, '[x].txt'), 'utf8'), 'literal\n')
    assert.equal(await readFile(join(project, 'x.txt'), 'utf8'), 'keep\n')
    git(project, ['checkout', '--', '.'])
  })

  await test('automatic alignment honors its switch and refuses dirty/running workspaces', async () => {
    git(project, ['branch', 'bound'])
    const bindings = new api.SessionBindingStore(bindingFile)
    await bindings.set({ sessionId: 'session', repoRoot: project, branch: 'bound', locked: true, createdAt: Date.now() })
    gitSettings.git.autoAlignBranch = false
    await gitRoutes['/explorer/git/align'](request({ session: 'session' }))
    assert.equal(git(project, ['branch', '--show-current']), 'main')
    gitSettings.git.autoAlignBranch = true
    await writeFile(join(project, 'tracked.txt'), 'dirty\n')
    await rejectsStatus(() => gitRoutes['/explorer/git/align'](request({ session: 'session' })), 409)
    git(project, ['checkout', '--', '.'])
    await gitRoutes['/explorer/git/align'](request({ session: 'session' }))
    assert.equal(git(project, ['branch', '--show-current']), 'bound')
    git(project, ['checkout', '-q', 'main'])
    const activeCtx = context({ workspaceRegistry: registry(project), sessions: {
      get: () => ({ header: { cwd: project } }),
      list: () => [{ header: { cwd: project }, events: [{ type: 'turn/start' }] }],
    } })
    const activeRoutes = {}
    api.mountGitOps(activeCtx, () => gitSettings, activeRoutes, bindingFile)
    await rejectsStatus(() => activeRoutes['/explorer/git/align'](request({ session: 'session' })), 409)
    assert.equal(git(project, ['branch', '--show-current']), 'main')
  })

  await test('worktree auto-registration respects both the setting and explicit override', async () => {
    let registrations = 0
    const wtCtx = context({ workspaceRegistry: { ...registry(project), create: async () => { registrations++; return { id: 'new-workspace' } } } })
    const routes = {}
    gitSettings.git.worktreeAutoRegister = false
    api.mountGitOps(wtCtx, () => gitSettings, routes, bindingFile)
    await routes['/explorer/git/worktree-add'](request({ workspace: 'workspace', branch: 'wt-one', newBranch: true, path: join(fixture, 'wt-one') }))
    assert.equal(registrations, 0)
    await routes['/explorer/git/worktree-add'](request({ workspace: 'workspace', branch: 'wt-two', newBranch: true, path: join(fixture, 'wt-two'), openAsWorkspace: true }))
    assert.equal(registrations, 1)
  })

  const shadowRoot = join(fixture, 'shadow')
  let excludes = []
  let maxSize = 1
  const store = new api.CheckpointStore(shadowRoot, () => excludes, () => maxSize)
  const shadow = await store.ensure(project)
  const shadowEnv = { GIT_DIR: shadow.gitDir, GIT_WORK_TREE: project, GIT_INDEX_FILE: join(shadow.gitDir, 'dsh-index') }
  await test('oversized files are excluded before blob creation and changed limits apply immediately', async () => {
    const big = Buffer.alloc(2 * 1024 * 1024, 'x')
    await writeFile(join(project, 'large.bin'), big)
    await writeFile(join(project, 'small.txt'), 'small\n')
    const hash = git(project, ['hash-object', '--no-filters', 'large.bin'])
    await store.snapshot(project, 'session', 'bounded')
    const objects = git(project, ['cat-file', '--batch-all-objects', '--batch-check=%(objectname)'], shadowEnv)
    assert.equal(objects.includes(hash), false, 'oversized content must not even enter the object database')
    maxSize = 4
    const withLarge = await store.snapshot(project, 'session', 'larger cap')
    assert.match(git(project, ['ls-tree', '-r', '--name-only', 'HEAD'], shadowEnv), /large.bin/)
    excludes = ['small.txt']
    await store.snapshot(project, 'session', 'changed excludes')
    assert.equal(git(project, ['ls-tree', '-r', '--name-only', 'HEAD'], shadowEnv).includes('small.txt'), false)
    excludes = []
    maxSize = 1
    await writeFile(join(project, 'large.bin'), Buffer.alloc(2 * 1024 * 1024, 'y'))
    await assert.rejects(store.restore(project, 'session', withLarge.id), /excluded from the undo checkpoint/)
    assert.equal((await readFile(join(project, 'large.bin')))[0], 'y'.charCodeAt(0))
    await rm(join(project, 'large.bin'))
  })

  await test('retention keeps HEAD/recent IDs, expires old refs, and preserves restore/undo', async () => {
    const project = await repo('retention-project')
    const store = new api.CheckpointStore(join(fixture, 'retention-shadow'), [], 1)
    const shadow = await store.ensure(project)
    const shadowEnv = { GIT_DIR: shadow.gitDir, GIT_WORK_TREE: project, GIT_INDEX_FILE: join(shadow.gitDir, 'dsh-index') }
    await store.snapshot(project, 'session', 'baseline')
    const before = git(project, ['rev-parse', 'HEAD'])
    const index = git(project, ['ls-files', '--stage'])
    const age = async days => {
      const date = new Date(Date.now() - days * 86400000).toISOString()
      git(project, ['commit', '--amend', '--no-edit', '--date', date], {
        ...shadowEnv, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
        GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
      })
      return git(project, ['rev-parse', 'HEAD'], shadowEnv)
    }
    const expired = await age(50)
    await store.linkTurn(project, 'old-session', 1, expired)
    await store.linkTurnEnd(project, 'old-session', 1, expired)
    await store.linkAnchor(project, 'old-session', expired, 10)
    await writeFile(join(project, 'tracked.txt'), 'recent\n')
    await store.snapshot(project, 'session', 'recent')
    const recent = await age(2)
    await store.linkTurn(project, 'session', 2, recent)
    await writeFile(join(project, 'tracked.txt'), 'newest\n')
    const newest = await store.snapshot(project, 'session', 'newest')
    const removed = await store.prune(project, 30)
    assert.ok(removed > 0)
    assert.equal(git(project, ['rev-parse', 'HEAD'], shadowEnv), newest.id)
    assert.deepEqual((await store.list(project)).map(row => row.id), [newest.id, recent])
    assert.equal(await store.resolveTurn(project, 'old-session', 1), undefined)
    assert.equal(await store.resolveTurnEnd(project, 'old-session', 1), undefined)
    assert.equal(await store.resolveAnchor(project, 'old-session', expired), undefined)
    assert.equal(await store.resolveTurn(project, 'session', 2), recent)
    const restored = await store.restore(project, 'session', recent)
    assert.equal(await readFile(join(project, 'tracked.txt'), 'utf8'), 'recent\n')
    await store.restore(project, 'session', restored.undoId)
    assert.equal(await readFile(join(project, 'tracked.txt'), 'utf8'), 'newest\n')
    assert.equal(git(project, ['rev-parse', 'HEAD']), before)
    assert.equal(git(project, ['ls-files', '--stage']), index)
    assert.equal(await store.prune(project, 30), 0)
    await age(60)
    await store.prune(project, 1)
    assert.ok((await store.list(project)).length >= 1, 'retain a last recovery baseline')
  })

  await test('same-turn calls wait for the first snapshot; failed snapshots can retry', async () => {
    const proto = api.CheckpointStore.prototype
    const originals = Object.fromEntries(['snapshot', 'linkTurn', 'linkAnchor'].map(name => [name, proto[name]]))
    const hooks = {}
    const settings = config()
    settings.checkpoints.retentionDays = 0
    let release
    const gate = new Promise(resolve => { release = resolve })
    let snapshots = 0
    let allowed = 0
    proto.snapshot = async () => { snapshots++; await gate; return { id: 'a'.repeat(40) } }
    proto.linkTurn = async () => {}
    proto.linkAnchor = async () => {}
    const dispose = api.mountCheckpoints(context({}, hooks), () => settings, {}, shadowRoot)
    const exec = { name: 'write', rootCallId: 'call', agent: { session: {
      id: 'parallel', header: { cwd: project }, events: [{ type: 'tool/call', data: { callId: 'call', turn: 1 } }],
    } } }
    try {
      const next = async () => { allowed++; return { kind: 'allow' } }
      const first = hooks['tools/pre-execute'](exec, next)
      const second = hooks['tools/pre-execute'](exec, next)
      await new Promise(resolve => setImmediate(resolve))
      assert.equal(allowed, 0)
      release()
      await Promise.all([first, second])
      assert.equal(allowed, 2)
      assert.equal(snapshots, 1)
      exec.agent.session.events[0].data.turn = 2
      proto.snapshot = async () => { throw new Error('simulated failure') }
      await hooks['tools/pre-execute'](exec, next)
      proto.snapshot = async () => { snapshots++; return { id: 'b'.repeat(40) } }
      await hooks['tools/pre-execute'](exec, next)
      assert.equal(snapshots, 2)
    } finally {
      release()
      dispose()
      Object.assign(proto, originals)
    }
  })

  await test('fork lineage uses inherited events and cannot leak later parent turns', async () => {
    const proto = api.CheckpointStore.prototype
    const originals = Object.fromEntries(['turnRefs', 'turnEndRefs', 'turnChanges'].map(name => [name, proto[name]]))
    let refReads = 0
    proto.turnRefs = async (_root, id) => { refReads++; return id === 'parent' ? new Map([[1, 'a'.repeat(40)], [2, 'b'.repeat(40)]]) : new Map() }
    proto.turnEndRefs = async () => { refReads++; return new Map() }
    proto.turnChanges = async () => ({ files: [], added: 0, removed: 0 })
    const inherited = Array.from({ length: 10 }, (_, seq) => ({ seq, type: seq === 9 ? 'turn/end' : 'other', data: { turn: 1 } }))
    const child = { header: { cwd: project, parentSession: 'parent', seedLength: 10 }, events: [...inherited, { seq: 10, type: 'turn/end', data: { turn: 2 } }] }
    const parent = { header: { cwd: project }, events: inherited }
    const settings = config()
    settings.checkpoints.retentionDays = 0
    const routes = {}
    const dispose = api.mountCheckpoints(context({ sessions: { get: id => id === 'child' ? child : parent } }), () => settings, routes, shadowRoot)
    try {
      const one = await routes['/checkpoints/turn-info'](request({}, { session: 'child', turn: '1' }, 'GET'))
      const two = await routes['/checkpoints/turn-info'](request({}, { session: 'child', turn: '2' }, 'GET'))
      assert.equal(one.checkpointId, 'a'.repeat(40))
      assert.equal(two.checkpointId, undefined)
      const batchRequest = request({}, { session: 'child' }, 'GET')
      batchRequest.query.append('turn', '1')
      batchRequest.query.append('turn', '2')
      const batch = await routes['/checkpoints/turns'](batchRequest)
      assert.equal(batch.turns.length, 2)
      assert.equal(refReads, 4, 'all cards share one pre/end ref read per lineage member')
      assert.equal(batchRequest.req.listenerCount('close'), 1)
    } finally { dispose(); Object.assign(proto, originals) }
  })

  await test('the restore endpoint rejects running turns before touching files', async () => {
    const original = api.CheckpointStore.prototype.restore
    let called = false
    api.CheckpointStore.prototype.restore = async () => { called = true; return {} }
    const live = { header: { cwd: project }, events: [{ type: 'turn/start', data: { turn: 1 } }] }
    const settings = config()
    settings.checkpoints.retentionDays = 0
    const routes = {}
    const dispose = api.mountCheckpoints(context({ sessions: { get: () => live, list: () => [live] } }), () => settings, routes, shadowRoot)
    try {
      await rejectsStatus(() => routes['/checkpoints/restore'](request({ session: 'session', id: 'a'.repeat(40), confirm: true })), 409)
      assert.equal(called, false)
    } finally { dispose(); api.CheckpointStore.prototype.restore = original }
  })

  await test('preview, prune and forget wait behind snapshots, including across remounts', async () => {
    const proto = api.CheckpointStore.prototype
    const originals = Object.fromEntries(['snapshot', 'preview', 'prune', 'forget'].map(name => [name, proto[name]]))
    let release
    const gate = new Promise(resolve => { release = resolve })
    const order = []
    proto.snapshot = async () => { order.push('snapshot-start'); await gate; order.push('snapshot-end'); return { id: 'a'.repeat(40) } }
    proto.preview = async () => { order.push('preview'); return { affected: [], unprotected: [] } }
    proto.prune = async () => { order.push('prune'); return 0 }
    proto.forget = async () => { order.push('forget') }
    const settings = config()
    settings.checkpoints.retentionDays = 0
    const routes = {}
    let dispose = api.mountCheckpoints(ctx, () => settings, routes, shadowRoot)
    const jobs = []
    try {
      jobs.push(routes['/checkpoints/snapshot'](request({}, { workspace: 'workspace' })))
      await new Promise(resolve => setImmediate(resolve))
      assert.deepEqual(order, ['snapshot-start'])
      dispose()
      dispose = api.mountCheckpoints(ctx, () => settings, routes, shadowRoot)
      jobs.push(routes['/checkpoints/preview'](request({}, { workspace: 'workspace', id: 'a'.repeat(40) }, 'GET')))
      jobs.push(routes['/checkpoints/prune'](request({}, { workspace: 'workspace' })))
      jobs.push(routes['/checkpoints/forget'](request({ confirm: true }, { workspace: 'workspace' })))
      await new Promise(resolve => setImmediate(resolve))
      assert.deepEqual(order, ['snapshot-start'])
      release()
      await Promise.all(jobs)
      assert.deepEqual(order, ['snapshot-start', 'snapshot-end', 'preview', 'prune', 'forget'])
    } finally {
      release()
      await Promise.allSettled(jobs)
      dispose()
      Object.assign(proto, originals)
    }
  })

  await test('purge failures retain archive entries; successful deletion only removes the artifact', async () => {
    const file = join(fixture, 'session-artifact.jsonl')
    await writeFile(file, 'session artifact')
    let state = { initialized: true, workspaceIds: [], archivedSessionIds: ['session'] }
    let fault = true
    let live = false
    const reg = {
      get archivedSessionIds() { return state.archivedSessionIds },
      entities: new Map(), list: () => [],
      requireState: () => state, setState: async next => { state = next },
      enqueueOperation: async fn => fn(),
    }
    const persistence = {
      list: async () => { if (fault) throw new Error('storage unavailable'); return [{ id: 'session' }] },
      locate: () => ({ path: file }),
    }
    const routes = {}
    api.mountSessionAdmin(context({ workspaceRegistry: reg, sessionPersistence: persistence, sessions: { get: () => live ? {} : undefined } }), config, routes)
    await assert.rejects(routes['/sessions/purge'](request({ sessionId: 'session' })), /storage unavailable/)
    assert.deepEqual(state.archivedSessionIds, ['session'])
    fault = false
    live = true
    await rejectsStatus(() => routes['/sessions/purge'](request({ sessionId: 'session' })), 409)
    assert.deepEqual(state.archivedSessionIds, ['session'])
    live = false
    await rm(file)
    await mkdir(file)
    await rejectsStatus(() => routes['/sessions/purge'](request({ sessionId: 'session' })), 409)
    assert.deepEqual(state.archivedSessionIds, ['session'])
    await rm(file, { recursive: true })
    await writeFile(file, 'session artifact')
    assert.equal((await routes['/sessions/purge'](request({ sessionId: 'session' }))).purged, 1)
    assert.deepEqual(state.archivedSessionIds, [])
    await assert.rejects(stat(file), { code: 'ENOENT' })
    await rejectsStatus(() => routes['/sessions/purge'](request({ sessionId: 'not-archived' })), 409)
  })

  await test('unsupported attachment GC is explicitly refused rather than silently accepted', async () => {
    const routes = api.settingsRoutes(context({ settings: {} }), config)
    for (const [path, value] of [[['sessionAdmin', 'attachmentGc'], true], [['sessionAdmin'], { attachmentGc: true }], [[], { sessionAdmin: { attachmentGc: true } }]]) {
      await rejectsStatus(() => routes['/config/mutate'](request({ ops: [{ op: 'set', path, value }] })), 409)
    }
  })

  await test('restoring a session creates a missing workspace, and retains archive on attachment failure', async () => {
    let state = { archivedSessionIds: ['restore-session'] }
    let created = 0
    let attached = 0
    let fail = true
    const reg = {
      entities: new Map(), list: () => [], requireState: () => state,
      get archivedSessionIds() { return state.archivedSessionIds },
      setState: async next => { state = next }, enqueueOperation: async fn => fn(),
      resolveByPath: async () => undefined,
      create: async () => { created++; return { attachSession: async () => { if (fail) throw new Error('attach failed'); attached++ } } },
    }
    const routes = {}
    api.mountSessionAdmin(context({ workspaceRegistry: reg, sessionPersistence: {
      list: async () => [{ id: 'restore-session', cwd: project }], locate: () => ({ path: join(project, 'tracked.txt') }),
    } }), config, routes)
    await rejectsStatus(() => routes['/sessions/restore'](request({ sessionId: 'restore-session' })), 409)
    assert.deepEqual(state.archivedSessionIds, ['restore-session'])
    fail = false
    await routes['/sessions/restore'](request({ sessionId: 'restore-session' }))
    assert.equal(created, 2)
    assert.equal(attached, 1)
    assert.deepEqual(state.archivedSessionIds, [])
  })

  await test('balance requests time out, release the shared request and label stale fallback', async () => {
    const originalFetch = globalThis.fetch
    const originalNow = Date.now
    let now = originalNow()
    Date.now = () => now
    const routes = api.balanceRoutes(context({ credentials: { resolve: async () => ({ value: 'test-only-key' }) } }), config, 20)
    try {
      globalThis.fetch = async () => new Promise(() => {})
      await rejectsStatus(() => routes['/balance'](request({}, {}, 'GET')), 504)
      globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '12' }] }) })
      assert.equal((await routes['/balance'](request({}, {}, 'GET'))).rows[0].totalBalance, '12')
      now += 65_000
      globalThis.fetch = async () => { throw new Error('offline') }
      const stale = await routes['/balance'](request({}, { refresh: '1' }, 'GET'))
      assert.equal(stale.stale, true)
      assert.ok(stale.error)
      assert.equal(stale.rows[0].totalBalance, '12')
    } finally { globalThis.fetch = originalFetch; Date.now = originalNow }
  })

  console.log(`\nAll ${passed} regression scenarios passed.`)
} finally {
  // fixture is the exact mkdtemp result, never a user-selected path.
  await rm(fixture, { recursive: true, force: true })
}
