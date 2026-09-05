import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'esbuild'

// Exercise shipped callbacks without a live host, real network, or filesystem writes.
const require = createRequire(import.meta.url)
let slots = []
let cursor = 0
let callbacks = []
const react = {
  ...require('react'), useEffect() {},
  useRef(value) { return slots[cursor++] ??= { current: value } },
  useState(value) { return [typeof value === 'function' ? value() : value, () => {}] },
  useCallback(fn) { callbacks.push(fn); return fn },
}
const result = await build({
  stdin: { contents: `
    export { rewindTurn } from './client/rewind.ts'
    export { ComposerImages } from './client/ComposerImages.tsx'
    export { TurnInfoStore } from './client/turn-info-store.ts'
    export { useTabs } from './client/tabs.ts'
    export { Select } from './client/ui.tsx'
    export { reviewFollowsSession, effectiveDeletePolicy, usesReviewModel, DEFAULT_CONFIG } from './config.ts'
    export { DICTS } from './client/locales.ts'
  `, resolveDir: resolve('src'), loader: 'ts' },
  bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external', jsx: 'automatic', logLevel: 'error',
  plugins: [{ name: 'host-boundary-mocks', setup(builder) {
    builder.onResolve({ filter: /^\.\/(use-workspace|use-locale|picker-channel|ui)\.tsx?$/ }, args => ({ path: args.path, namespace: 'mock' }))
    builder.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ loader: 'js', contents:
      args.path.includes('use-workspace') ? 'export const getActiveWorkspaceRoot=()=>undefined;'
        : args.path.includes('use-locale') ? 'export const useT=()=>key=>key;'
          : args.path.includes('picker-channel') ? 'export const provideImagePicker=()=>()=>{};'
            : 'export const token={};',
    }))
  } }],
})
const mod = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(name => name === 'react' ? react : require(name), mod, mod.exports)
const { rewindTurn, ComposerImages, TurnInfoStore, useTabs, Select, reviewFollowsSession } = mod.exports
const originalFetch = globalThis.fetch
const originalWindow = globalThis.window
const events = new EventTarget()
const timers = new Set()
const storage = new Map()
globalThis.window = {
  setInterval: fn => { timers.add(fn); return fn }, clearInterval: fn => timers.delete(fn),
  addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
}
let passed = 0
const test = async (name, run) => { await run(); passed++; console.log(`  PASS  ${name}`) }
const settle = () => new Promise(resolve => setImmediate(resolve))
const base = () => ({
  sessions: { fork: async () => 'child', open() {} }, sessionId: 'source', checkpointId: 'checkpoint',
  detail: { turn: 2, closed: true, undoAnchorSeq: 4 }, forkFailedText: message => message,
  firstTurnText: 'missing boundary', workspace: 'workspace',
})

try {
  await test('independent policies have four choices and dynamic detailed descriptions', async () => {
    const page = readFileSync(resolve('src/client/SettingsPage.tsx'), 'utf8')
    const deletion = page.indexOf("label={t('review.deleteCommand')} hint=")
    const push = page.indexOf("label={t('review.gitPushCommand')} hint=")
    assert.ok(deletion >= 0 && push > deletion)
    assert.match(page.slice(deletion, push), /Select<CommandPolicy>/)
    assert.match(page.slice(push, push + 600), /Select<CommandPolicy>/)
    assert.match(page, /set\(\['commandReview', 'deletePolicy'\], next\)/)
    assert.match(page, /set\(\['commandReview', 'gitPushPolicy'\], next\)/)
    assert.ok(page.includes('review.deletePolicy.${effectiveDeletePolicy(c.commandReview)}.hint'))
    assert.ok(page.includes("review.gitPushPolicy.${c.commandReview.gitPushPolicy ?? 'expected'}.hint"))
    assert.ok(page.includes('usesReviewModel(c.commandReview)'))
    for (const current of ['deny', 'ask', 'expected', 'allow']) {
      let selected
      const selector = Select({ value: current, label: 'Command policy',
        options: ['deny', 'ask', 'expected', 'allow'].map(value => ({ value, label: value })),
        onChange: value => { selected = value },
      })
      assert.equal(selector.props.value, current)
      assert.deepEqual(selector.props.children[0].map(option => option.props.value), ['deny', 'ask', 'expected', 'allow'])
      selector.props.onChange({ currentTarget: { value: current } })
      assert.equal(selected, current)
      for (const locale of ['en', 'zh']) {
        assert.ok(mod.exports.DICTS[locale][`review.deletePolicy.${current}.hint`].length > 50)
        assert.ok(mod.exports.DICTS[locale][`review.gitPushPolicy.${current}.hint`].length > 50)
      }
    }
    assert.equal(mod.exports.effectiveDeletePolicy({ absoluteDenyDelete: false }), 'allow')
    assert.equal(mod.exports.effectiveDeletePolicy({ absoluteDenyDelete: true, deletePolicy: 'ask' }), 'ask')
    assert.equal(mod.exports.effectiveDeletePolicy({}), 'expected')
    for (const mode of ['expected', 'rules+llm', 'rules-only', 'all']) {
      assert.ok(mod.exports.DICTS.zh[`review.mode.${mode}.hint`].length > 50)
    }
    const settings = { ...mod.exports.DEFAULT_CONFIG.commandReview, mode: 'rules-only', deletePolicy: 'allow', gitPushPolicy: 'deny' }
    assert.equal(mod.exports.usesReviewModel(settings), false)
    assert.equal(mod.exports.usesReviewModel({ ...settings, deletePolicy: 'expected' }), true)
    assert.equal(mod.exports.usesReviewModel({ ...settings, gitPushPolicy: 'expected' }), true)
  })
  await test('review selectors show a persistent automatic choice above provider groups', async () => {
    assert.equal(reviewFollowsSession({ provider: '', model: '' }), true)
    assert.equal(reviewFollowsSession({ provider: 'provider', model: 'fixed' }), false)
    let selected
    const selector = Select({
      value: '', label: 'Reviewer model', options: [{ value: '', label: 'Follow session' }],
      groups: [{ group: 'provider', options: [{ value: 'provider::fixed', label: 'Fixed' }] }],
      onChange: value => { selected = value },
    })
    assert.equal(selector.props.value, '')
    const [options, groups] = selector.props.children
    assert.equal(options[0].props.value, '')
    assert.equal(groups[0].props.children[0].props.value, 'provider::fixed')
    selector.props.onChange({ currentTarget: { value: 'provider::fixed' } })
    assert.equal(selected, 'provider::fixed')
    selector.props.onChange({ currentTarget: { value: '' } })
    assert.equal(selected, '')
  })
  await test('running/unknown turns never restore files or create a fork', async () => {
    globalThis.fetch = async () => { throw new Error('must not fetch') }
    for (const closed of [false, undefined]) {
      const props = base()
      props.detail.closed = closed
      props.sessions.fork = async () => { throw new Error('must not fork') }
      assert.equal((await rewindTurn(props)).reason, 'turn-running')
    }
  })
  await test('a failed chat fork performs no file restore', async () => {
    let calls = 0
    globalThis.fetch = async () => { calls++; throw new Error('must not fetch') }
    const props = base()
    props.sessions.fork = async () => { throw new Error('fork failed') }
    assert.equal((await rewindTurn(props)).reason, 'fork-failed')
    assert.equal(calls, 0)
  })
  await test('a failed open compensates the file restore using its undo checkpoint', async () => {
    const order = []
    globalThis.fetch = async (_url, init) => {
      order.push(JSON.parse(init.body).id)
      return { json: async () => ({ ok: true, value: { undoId: 'undo' } }) }
    }
    const props = base()
    props.sessions.fork = async () => { order.push('fork'); return 'child' }
    props.sessions.open = () => { throw new Error('open failed') }
    assert.equal((await rewindTurn(props)).ok, false)
    assert.deepEqual(order, ['fork', 'checkpoint', 'undo'])
  })
  await test('multiple text files append once to the latest draft, preserving typing during reads', async () => {
    slots = []
    let draft = 'original'
    const actions = { setDraft: value => { draft = value } }
    const props = { attachments: [], canAcceptDrop: true, onAddImages() {}, onRemoveImage() {},
      input: { draft, imageIds: [], phase: 'plain' }, actions, dragEnabled: true }
    const render = () => { cursor = 0; callbacks = []; ComposerImages(props) }
    render()
    let release
    const first = new Promise(resolve => { release = resolve })
    const picking = callbacks.find(fn => fn.constructor.name === 'AsyncFunction')([
      { name: 'one.txt', type: 'text/plain', size: 5, text: () => first },
      { name: 'two.txt', type: 'text/plain', size: 6, text: async () => 'SECOND' },
    ])
    props.input = { ...props.input, draft: 'typed while loading' }
    render()
    release('FIRST')
    await picking
    assert.ok(draft.startsWith('typed while loading'))
    assert.ok(draft.includes('FIRST') && draft.includes('SECOND'))
    assert.ok(draft.indexOf('FIRST') < draft.indexOf('SECOND'))
  })
  await test('staged and unstaged diffs have independent persistent tabs', async () => {
    let tabs = useTabs('workspace')
    tabs.open('diff', 'file.ts', 'staged')
    tabs.open('diff', 'file.ts', 'unstaged')
    tabs = useTabs('workspace')
    const diffs = tabs.tabs.filter(tab => tab.kind === 'diff')
    assert.equal(diffs.length, 2)
    assert.notEqual(diffs[0].id, diffs[1].id)
    assert.deepEqual(diffs.map(tab => tab.side), ['staged', 'unstaged'])
  })
  await test('turn requests batch by session, slow down when closed, and clear expired checkpoints', async () => {
    let calls = 0
    let expired = false
    const store = new TurnInfoStore(async (_session, turns) => {
      calls++
      return { ok: true, value: { turns: turns.map(turn => ({ turn, closed: true, checkpointId: expired ? undefined : 'id', files: [] })) } }
    })
    const one = store.subscribe('session', 1, () => {})
    const two = store.subscribe('session', 2, () => {})
    await settle()
    assert.equal(calls, 1)
    assert.equal(timers.size, 1)
    await store.refresh()
    assert.equal(calls, 1)
    expired = true
    store.invalidate()
    await settle()
    assert.equal(store.read('session', 1).data.checkpointId, undefined)
    one(); two()
    assert.equal(timers.size, 0)
    for (let turn = 3; turn < 600; turn++) store.read('old-session', turn)
    assert.ok(store.entries.size <= 200)
  })
  await test('an invalidation during a request cannot reinstall an old checkpoint', async () => {
    let release
    let calls = 0
    const delayed = new Promise(resolve => { release = resolve })
    const store = new TurnInfoStore(async () => {
      calls++
      if (calls === 1) return delayed
      return { ok: true, value: { turns: [{ turn: 1, closed: true, files: [] }] } }
    })
    const stop = store.subscribe('session', 1, () => {})
    await settle()
    store.invalidate()
    release({ ok: true, value: { turns: [{ turn: 1, closed: true, checkpointId: 'old', files: [] }] } })
    await settle()
    assert.equal(calls, 2)
    assert.equal(store.read('session', 1).data.checkpointId, undefined)
    stop()
    assert.equal(timers.size, 0)
  })
  console.log(`\nAll ${passed} client regression scenarios passed.`)
} finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow }
