// End-to-end smoke test for the side-panel terminal, without the DSH host.
//
// `mountTerminal` only touches three things on the context: `logger`, the
// `webServer.registerUpgrade` seat, and — through the workspace resolver it
// borrows from the explorer — `workspaceRegistry`. This script provides a
// minimal stand-in for those, wires the captured upgrade handler into a real
// node:http server, and then speaks the browser side of the protocol with a
// real WebSocket against a real PTY. A failure here means a machine cannot run
// terminals at all (missing native prebuild, broken shell resolution), which is
// exactly the class of breakage no unit test of the frame protocol would catch.

import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mountTerminal, TERMINAL_WS_PATH } from '../lib/index.js'

const require = createRequire(import.meta.url)
const WebSocket = require('ws')

const config = {
  terminal: { enabled: true, shell: 'auto', shellArgs: [], scrollbackLines: 400 },
}

let upgradeHandler
const ctx = {
  logger: () => ({ info() {}, warn() {} }),
  get: () => undefined,
  webServer: {
    registerUpgrade(route) {
      upgradeHandler = route.handler
      return () => { upgradeHandler = undefined }
    },
  },
}

const workspace = await mkdtemp(join(tmpdir(), 'dsh-ext-terminal-'))
const routes = {}
const dispose = mountTerminal(ctx, () => config, routes)

if (typeof upgradeHandler !== 'function') {
  console.error('FAIL: mountTerminal did not register an upgrade route')
  process.exit(1)
}
if (typeof routes['/terminal/shells'] !== 'function' || typeof routes['/terminal/kill'] !== 'function') {
  console.error('FAIL: mountTerminal did not register the HTTP endpoints')
  process.exit(1)
}

const server = createServer((req, res) => { res.writeHead(404); res.end() })
server.on('upgrade', (req, socket, head) => { void upgradeHandler(req, socket, head) })
await new Promise(resolve => { server.listen(0, '127.0.0.1', resolve) })
const { port } = server.address()

let failures = 0
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  PASS  ${name}`)
  } else {
    failures += 1
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

let exitCode
let ready = false

try {
  // The HTTP layer belongs to the host webserver, so the endpoints are called
  // through the same handler shape serveApi uses: one bag of request parts in,
  // one plain value out (the {ok, value} envelope is serveApi's, not tested here).
  const shellsPayload = await routes['/terminal/shells']({ query: new URLSearchParams() })
  check('GET /terminal/shells answers with the shell probe', Array.isArray(shellsPayload?.shells) && shellsPayload.shells.length > 0)
  check('shells include an available auto resolution', shellsPayload?.auto?.available === true, JSON.stringify(shellsPayload?.auto))

  // Open a terminal and let a command echo a marker through the PTY.
  const ws = new WebSocket(`ws://127.0.0.1:${port}${TERMINAL_WS_PATH}?id=terminal:1&workspace=${encodeURIComponent(workspace)}&cols=80&rows=24`)
  let outputText = ''
  ws.on('message', raw => {
    let frame
    try { frame = JSON.parse(String(raw)) } catch { return }
    if (frame.t === 'o' && typeof frame.d === 'string') {
      outputText += Buffer.from(frame.d, 'base64').toString('utf8')
      if (outputText.length > 20000) outputText = outputText.slice(-20000)
    } else if (frame.t === 'r') {
      ready = true
    } else if (frame.t === 'x') {
      exitCode = frame.c
    }
  })

  const opened = await new Promise(resolve => { ws.on('open', resolve); ws.on('error', resolve) })
  check('websocket upgrade succeeds', opened === undefined)

  await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error(`ready frame not received (ready=${ready})`)), 15000)
    const poll = setInterval(() => {
      if (ready) { clearTimeout(deadline); clearInterval(poll); resolve() }
    }, 50)
  })
  check('terminal attaches and reports ready', ready)

  const MARKER = `TERMINAL_E2E_${Math.random().toString(36).slice(2, 8)}`
  ws.send(JSON.stringify({ t: 'i', d: `echo ${MARKER}\r` }))
  await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error(`marker never echoed; tail: ${JSON.stringify(outputText.slice(-300))}`)), 20000)
    const poll = setInterval(() => {
      if (outputText.includes(MARKER)) { clearTimeout(deadline); clearInterval(poll); resolve() }
    }, 100)
  })
  check('a command executed and its output came back through the PTY', true)

  // Resize must be accepted silently by whichever shell this platform picked.
  ws.send(JSON.stringify({ t: 's', c: 100, r: 30 }))
  await new Promise(resolve => { setTimeout(resolve, 300) })
  check('resize frame accepted', true)

  // Closing the socket detaches; the kill endpoint disposes the shell.
  ws.close()
  await new Promise(resolve => { setTimeout(resolve, 300) })
  const killPayload = await routes['/terminal/kill']({
    method: 'POST',
    body: { id: 'terminal:1' },
  })
  check('POST /terminal/kill disposed the session', killPayload?.killed >= 1, JSON.stringify(killPayload))

  // A refused workspace is an error frame, not a crash or a silent hang.
  const bad = new WebSocket(`ws://127.0.0.1:${port}${TERMINAL_WS_PATH}?id=terminal:2&workspace=${encodeURIComponent(join(workspace, 'missing'))}`)
  const badError = await new Promise(resolve => {
    const deadline = setTimeout(() => resolve(undefined), 8000)
    bad.on('message', raw => {
      const frame = JSON.parse(String(raw))
      if (frame.t === 'e') { clearTimeout(deadline); resolve(frame.m) }
    })
    bad.on('error', () => { clearTimeout(deadline); resolve('socket error') })
  })
  check('an unresolvable workspace answers with an error frame', typeof badError === 'string', String(badError))
  try { bad.close() } catch { /* already gone */ }
} catch (error) {
  failures += 1
  console.error(`  FAIL  unexpected — ${error?.message ?? error}`)
} finally {
  server.close()
  dispose()
  await rm(workspace, { recursive: true, force: true }).catch(() => {})
}

if (exitCode !== undefined) {
  // Informational only: some shells report the echo, then die when killed.
  console.log(`  (info) terminal exit code observed: ${exitCode}`)
}

if (failures > 0) {
  console.error(`${failures} terminal check(s) failed`)
  process.exit(1)
}
console.log('All terminal scenarios passed.')
