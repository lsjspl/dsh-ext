import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { basename, isAbsolute } from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'
import { ApiError, installRoutes, isSameOrigin, type ApiHandler } from '../http.ts'
import { resolveRoot } from './explorer.ts'
import type { Config, TerminalConfig } from '../config.ts'
import type { TerminalShellOption, TerminalShells } from '../shared/api-contract.ts'

/**
 * Feature — the side panel's terminal.
 *
 * Each terminal tab the browser opens owns one real PTY on the machine running
 * the harness, streamed over a WebSocket at {@link TERMINAL_WS_PATH}. The input
 * is the user's own keystrokes and the output is the shell's; nothing here
 * screens or restricts commands, exactly like the terminal in an editor. That
 * is the trust model: whoever can reach the web server can already run the
 * harness's own tools, and the loopback bind plus the same-origin fence are the
 * same boundaries every other feature of this plugin relies on.
 *
 * ## The open-source stack, and why these pieces
 *
 * - `@xterm/xterm` draws the terminal in the browser. It is the emulator behind
 *   VS Code, Hyper, and Tabby — building a VT/ANSI emulator from scratch is a
 *   multi-year project, and this one is the standard.
 * - `@lydell/node-pty` spawns the shell with a real pseudo-terminal: ConPTY on
 *   Windows, forkpty on macOS and Linux — the same layering VS Code uses. The
 *   fork exists to ship prebuilt binaries for all six platform/arch pairs as
 *   optionalDependencies, so installing never needs node-gyp, Python, or a
 *   compiler (upstream `node-pty` builds from source on install).
 * - `ws` carries the frames. Pure JavaScript, no native parts.
 *
 * The PTY module is loaded lazily through `createRequire` rather than a static
 * import: a machine where the optional prebuild did not install must lose this
 * one feature, not fail the whole plugin at load.
 */

/** The exact pathname the web server's upgrade registry matches. */
export const TERMINAL_WS_PATH = '/api/dsh-ext/terminal/ws'

const require = createRequire(import.meta.url)

type PtyModule = typeof import('@lydell/node-pty')

let pty: PtyModule | undefined
let ptyError: string | undefined
try {
  pty = require('@lydell/node-pty') as PtyModule
} catch (error) {
  ptyError = error instanceof Error ? error.message : String(error)
}

// ── Shell discovery ────────────────────────────────────────────────────────

interface ShellPreset {
  readonly id: string
  readonly label: string
  /** Candidate executables; the first that exists on disk wins. */
  readonly candidates: readonly string[]
  readonly args: readonly string[]
}

/** Windows environment variables a candidate path may name. */
function expand(path: string): string {
  return path.replace(/%([^%]+)%/g, (whole, name: string) => process.env[name] ?? whole)
}

function winRoot(): string {
  return process.env.SystemRoot ?? process.env.windir ?? 'C:\\Windows'
}

const WINDOWS_PRESETS: readonly ShellPreset[] = [
  {
    id: 'pwsh',
    label: 'PowerShell 7',
    candidates: [
      '%ProgramFiles%\\PowerShell\\7\\pwsh.exe',
      '%ProgramFiles%\\PowerShell\\7-preview\\pwsh.exe',
    ],
    args: ['-NoLogo'],
  },
  {
    id: 'powershell',
    label: 'Windows PowerShell',
    candidates: ['%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'],
    args: ['-NoLogo'],
  },
  {
    id: 'cmd',
    label: 'CMD',
    candidates: ['%SystemRoot%\\System32\\cmd.exe'],
    args: [],
  },
  {
    id: 'gitbash',
    label: 'Git Bash',
    candidates: [
      '%ProgramFiles%\\Git\\bin\\bash.exe',
      '%ProgramFiles(x86)%\\Git\\bin\\bash.exe',
      '%LocalAppData%\\Programs\\Git\\bin\\bash.exe',
    ],
    // A login shell so PATH and HOME are set the way a Git Bash shortcut sets them.
    args: ['-i', '-l'],
  },
  {
    id: 'wsl',
    label: 'WSL',
    candidates: ['%SystemRoot%\\System32\\wsl.exe'],
    args: [],
  },
]

const UNIX_PRESETS: readonly ShellPreset[] = [
  {
    id: 'zsh',
    label: 'zsh',
    candidates: ['/bin/zsh', '/usr/bin/zsh', '/usr/local/bin/zsh', '/opt/homebrew/bin/zsh'],
    args: [],
  },
  {
    id: 'bash',
    label: 'bash',
    candidates: ['/bin/bash', '/usr/bin/bash', '/usr/local/bin/bash', '/opt/homebrew/bin/bash'],
    args: [],
  },
  {
    id: 'fish',
    label: 'fish',
    candidates: ['/bin/fish', '/usr/bin/fish', '/usr/local/bin/fish', '/opt/homebrew/bin/fish'],
    args: [],
  },
  {
    id: 'sh',
    label: 'sh',
    candidates: ['/bin/sh', '/usr/bin/sh'],
    args: [],
  },
]

function presetsForPlatform(): readonly ShellPreset[] {
  if (process.platform === 'win32') return WINDOWS_PRESETS
  return UNIX_PRESETS
}

/**
 * Probe every preset once per mount. File-existence checks only — fast enough
 * to redo per settings-page visit, and caching would go stale across installs.
 */
function listShells(): { shells: TerminalShellOption[]; auto: TerminalShellOption } {
  const shells: TerminalShellOption[] = []
  for (const preset of presetsForPlatform()) {
    const path = preset.candidates.map(expand).find(candidate => existsSync(candidate)) ?? ''
    shells.push({
      id: preset.id,
      label: preset.label,
      path,
      args: preset.args,
      available: path !== '',
    })
  }
  // The user's configured login shell, when it is not already a preset row.
  if (process.platform !== 'win32') {
    const login = process.env.SHELL
    if (login !== undefined && login !== '' && !shells.some(shell => shell.path === login && shell.available)) {
      shells.unshift({ id: 'login', label: `${basename(login)} ($SHELL)`, path: login, args: [], available: existsSync(login) })
    }
  }
  return { shells, auto: resolveAuto(shells) }
}

/** What `auto` means on this machine, decided the same way at spawn time. */
function resolveAuto(shells: readonly TerminalShellOption[]): TerminalShellOption {
  const pick = (id: string): TerminalShellOption | undefined =>
    shells.find(shell => shell.id === id && shell.available)
  let found: TerminalShellOption | undefined
  if (process.platform === 'win32') {
    found = pick('pwsh') ?? pick('powershell') ?? pick('cmd')
  } else if (process.platform === 'darwin') {
    found = pick('login') ?? pick('zsh') ?? pick('bash')
  } else {
    found = pick('login') ?? pick('bash') ?? pick('sh')
  }
  return found ?? { id: 'auto', label: 'auto', path: '', args: [], available: false }
}

/**
 * Turn the configured `terminal.shell` into an executable and argv, or a
 * reason it cannot run. Three accepted spellings: `auto`, a preset id, or an
 * absolute path (the settings page writes a path when the user types one).
 */
function resolveShell(config: TerminalConfig): { path: string; args: readonly string[]; label: string } {
  const { shells, auto } = listShells()
  if (config.shell === '' || config.shell === 'auto') {
    if (auto.path === '') throw new ApiError(409, 'no usable shell found on this machine')
    return { path: auto.path, args: [...auto.args, ...config.shellArgs], label: auto.label }
  }
  const preset = shells.find(shell => shell.id === config.shell)
  if (preset !== undefined) {
    if (!preset.available) throw new ApiError(409, `shell "${preset.label}" is not installed on this machine`)
    return { path: preset.path, args: [...preset.args, ...config.shellArgs], label: preset.label }
  }
  if (!isAbsolute(config.shell)) {
    throw new ApiError(400, `terminal.shell must be 'auto', a preset id, or an absolute path (got "${config.shell}")`)
  }
  if (!existsSync(config.shell)) throw new ApiError(409, `shell executable not found: ${config.shell}`)
  return { path: config.shell, args: [...config.shellArgs], label: basename(config.shell) }
}

// ── Sessions ───────────────────────────────────────────────────────────────

/** Live terminal cap: ten shells is already generous for a side panel. */
const MAX_SESSIONS = 10
/** When the last browser leaves a terminal, its shell gets this long before it is killed. */
const IDLE_KILL_MS = 10 * 60_000
/** An exited terminal's record is kept briefly so a reconnecting client sees the exit status. */
const EXITED_TTL_MS = 2 * 60_000

/**
 * The last N output bytes of one terminal, for replaying to a client that
 * reattaches (page refresh, tab switch, reconnecting websocket).
 */
class ReplayBuffer {
  private chunks: Buffer[] = []
  private start = 0
  private size = 0
  constructor(private readonly limit: number) {}

  push(chunk: Buffer): void {
    this.chunks.push(chunk)
    this.size += chunk.length
    while (this.size > this.limit && this.chunks.length > 1) {
      this.size -= this.chunks[this.start]!.length
      this.start += 1
      // Compact rather than leak: the array itself never shrinks past its peak otherwise.
      if (this.start > 64) {
        this.chunks.splice(0, this.start)
        this.start = 0
      }
    }
  }

  snapshot(): Buffer {
    return Buffer.concat(this.chunks.slice(this.start))
  }
}

interface TerminalSession {
  /** `${normalizedRoot}::${termId}` — the same tab id in two projects is two shells. */
  readonly key: string
  readonly termId: string
  readonly root: string
  readonly shellLabel: string
  pty: import('@lydell/node-pty').IPty | undefined
  exited: boolean
  clients: Set<WebSocket>
  replay: ReplayBuffer
  /** Timer that kills a detached shell (IDLE_KILL_MS) or drops an exited record (EXITED_TTL_MS). */
  timer: NodeJS.Timeout | undefined
}

/** Every live terminal of this mount, keyed by session key. */
const sessions = new Map<string, TerminalSession>()

function sessionKey(root: string, termId: string): string {
  const normalized = process.platform === 'win32' ? root.toLowerCase().replace(/\\/g, '/') : root.replace(/\\/g, '/')
  return `${normalized}::${termId}`
}

function disposeSession(session: TerminalSession): void {
  if (session.timer !== undefined) clearTimeout(session.timer)
  session.timer = undefined
  sessions.delete(session.key)
  const ptyInstance = session.pty
  session.pty = undefined
  if (ptyInstance !== undefined) {
    try {
      // No signal argument: the Windows implementation throws for signals.
      ptyInstance.kill()
    } catch { /* already gone */ }
  }
  for (const client of session.clients) {
    try { client.close(1000, 'terminal disposed') } catch { /* already closing */ }
  }
  session.clients.clear()
}

/** Make room for a new session by dropping the least valuable existing one. */
function evictOneSession(): void {
  let victim: TerminalSession | undefined
  for (const session of sessions.values()) {
    // Exited records first, then terminals nobody is watching, both oldest-activity first.
    if (victim === undefined
      || (session.exited && !victim.exited)
      || (session.exited === victim.exited && session.clients.size < victim.clients.size)) {
      victim = session
    }
  }
  if (victim !== undefined && victim.clients.size === 0) disposeSession(victim)
}

function dropTerminal(client: WebSocket, session: TerminalSession): void {
  session.clients.delete(client)
  if (session.clients.size > 0 || session.exited) return
  session.timer ??= setTimeout(() => disposeSession(session), IDLE_KILL_MS)
}

// ── The WebSocket frame protocol ───────────────────────────────────────────
//
// JSON text frames both ways, one object per message, terse keys because every
// keystroke crosses this wire:
//   client → server: {t:'i', d} keystrokes · {t:'s', c, r} resize · {t:'k'} kill
//   server → client: {t:'o', d} output (base64) · {t:'r', s} ready (shell label)
//                    {t:'x', c} exit code · {t:'e', m} fatal error

const TERMINAL_ID_PATTERN = /^[A-Za-z0-9:_-]{1,80}$/

function send(client: WebSocket, frame: object): void {
  if (client.readyState !== WebSocket.OPEN) return
  try { client.send(JSON.stringify(frame)) } catch { /* a closing socket drops the frame */ }
}

async function attachClient(
  ctx: Context,
  config: () => Config,
  ws: WebSocket,
  query: URLSearchParams,
  bindSession: (session: TerminalSession | undefined) => void,
): Promise<void> {
  const termId = query.get('id') ?? ''
  if (!TERMINAL_ID_PATTERN.test(termId)) {
    send(ws, { t: 'e', m: 'invalid terminal id' })
    ws.close()
    return
  }

  // Resolve the cwd before anything session-shaped happens: the resolution is
  // async, and every session access after it stays synchronous so no PTY output
  // event can interleave between the replay snapshot and the client attach.
  let root: string
  try {
    // A never-aborted controller: the upgrade socket has no `req`-close hook to
    // forward, and the resolution only awaits one backend listing.
    const controller = new AbortController()
    const resolved = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
    root = resolved.root
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'could not resolve the workspace for this terminal'
    send(ws, { t: 'e', m: message })
    ws.close()
    return
  }

  const settings = config()
  if (!settings.terminal.enabled) {
    send(ws, { t: 'e', m: 'the terminal is switched off' })
    ws.close()
    return
  }
  if (pty === undefined) {
    send(ws, { t: 'e', m: `the PTY module failed to load: ${ptyError ?? 'unknown error'}` })
    ws.close()
    return
  }

  const cols = Math.min(Math.max(Number.parseInt(query.get('cols') ?? '80', 10) || 80, 2), 500)
  const rows = Math.min(Math.max(Number.parseInt(query.get('rows') ?? '24', 10) || 24, 2), 300)

  const key = sessionKey(root, termId)
  const existing = sessions.get(key)
  if (existing !== undefined && !existing.exited) {
    // Reattach: same shell, replay what was missed. The client's size wins —
    // the browser may have been resized while it was gone.
    try { existing.pty?.resize(cols, rows) } catch { /* a dead pty exits on its own */ }
    if (existing.timer !== undefined) {
      clearTimeout(existing.timer)
      existing.timer = undefined
    }
    send(ws, { t: 'o', d: existing.replay.snapshot().toString('base64') })
    existing.clients.add(ws)
    bindSession(existing)
    send(ws, { t: 'r', s: existing.shellLabel })
    return
  }
  if (existing !== undefined) disposeSession(existing)

  let shell: { path: string; args: readonly string[]; label: string }
  try {
    shell = resolveShell(settings.terminal)
  } catch (error) {
    send(ws, { t: 'e', m: error instanceof ApiError ? error.message : 'could not resolve the shell' })
    ws.close()
    return
  }

  if (sessions.size >= MAX_SESSIONS) evictOneSession()
  if (sessions.size >= MAX_SESSIONS) {
    send(ws, { t: 'e', m: `too many open terminals (limit ${MAX_SESSIONS}); close one first` })
    ws.close()
    return
  }

  let instance: import('@lydell/node-pty').IPty
  try {
    instance = pty.spawn(shell.path, [...shell.args], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: root,
      env: { ...process.env, TERM: 'xterm-256color' },
      // Raw buffers, not decoded strings: a multibyte character split across
      // two reads would otherwise be corrupted by a per-chunk utf8 decode.
      encoding: null,
    })
  } catch (error) {
    send(ws, { t: 'e', m: `could not start ${shell.label}: ${error instanceof Error ? error.message : String(error)}` })
    ws.close()
    return
  }

  const session: TerminalSession = {
    key,
    termId,
    root,
    shellLabel: shell.label,
    pty: instance,
    exited: false,
    clients: new Set(),
    replay: new ReplayBuffer(Math.min(Math.max(settings.terminal.scrollbackLines * 128, 16 * 1024), 4 * 1024 * 1024)),
    timer: undefined,
  }
  sessions.set(key, session)

  instance.onData((chunk: string | Buffer) => {
    const data = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk
    session.replay.push(data)
    const frame = JSON.stringify({ t: 'o', d: data.toString('base64') })
    for (const client of session.clients) {
      try { client.send(frame) } catch { /* dropped frames to a closing socket are fine */ }
    }
  })
  instance.onExit(({ exitCode }) => {
    session.exited = true
    session.pty = undefined
    for (const client of session.clients) send(client, { t: 'x', c: exitCode })
    session.timer ??= setTimeout(() => disposeSession(session), EXITED_TTL_MS)
  })

  session.clients.add(ws)
  bindSession(session)
  send(ws, { t: 'r', s: shell.label })
}

function handleMessage(session: TerminalSession | undefined, raw: string): void {
  if (session === undefined) return
  let frame: { t?: unknown; d?: unknown; c?: unknown; r?: unknown }
  try {
    frame = JSON.parse(raw)
  } catch {
    return
  }
  if (frame.t === 'i' && typeof frame.d === 'string') {
    try { session.pty?.write(frame.d) } catch { /* the exit event reports the death */ }
  } else if (frame.t === 's' && typeof frame.c === 'number' && typeof frame.r === 'number') {
    const cols = Math.min(Math.max(Math.round(frame.c), 2), 500)
    const rows = Math.min(Math.max(Math.round(frame.r), 2), 300)
    try { session.pty?.resize(cols, rows) } catch { /* ditto */ }
  } else if (frame.t === 'k') {
    disposeSession(session)
  }
}

// ── Mount ──────────────────────────────────────────────────────────────────

export function mountTerminal(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
): () => void {
  if (ptyError !== undefined) {
    ctx.logger('dsh-ext').warn('terminal: the PTY module (@lydell/node-pty) failed to load, terminals are unavailable: %s', ptyError)
  }

  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 })

  /**
   * Which session a socket is currently attached to, so `message` and `close`
   * find their way back without the attach path having to stay synchronous.
   */
  const socketSessions = new WeakMap<WebSocket, TerminalSession | undefined>()

  const unregisterUpgrade = ctx.webServer.registerUpgrade({
    path: TERMINAL_WS_PATH,
    handler: (req, socket, head) => {
      // The terminal executes arbitrary commands, so the same-origin fence is
      // load-bearing here in a way it is merely prudent for the read endpoints.
      if (!isSameOrigin(req) || pty === undefined || !config().terminal.enabled) {
        socket.destroy()
        return
      }
      const query = new URL(req.url ?? '/', 'http://localhost').searchParams
      wss.handleUpgrade(req, socket, head, ws => {
        socketSessions.set(ws, undefined)
        ws.on('message', raw => {
          // Only text frames are sent by this protocol.
          handleMessage(socketSessions.get(ws), raw.toString('utf8'))
        })
        ws.on('close', () => {
          const session = socketSessions.get(ws)
          socketSessions.set(ws, undefined)
          if (session !== undefined) dropTerminal(ws, session)
        })
        ws.on('error', () => { try { ws.close() } catch { /* already failing */ } })
        void attachClient(ctx, config, ws, query, session => { socketSessions.set(ws, session) })
      })
    },
  })

  const disposeRoutes = installRoutes(routes, {
    '/terminal/shells': (): TerminalShells => {
      if (!config().terminal.enabled) throw new ApiError(404, 'the terminal is switched off')
      const { shells, auto } = listShells()
      return {
        shells,
        auto,
        ptyAvailable: pty !== undefined,
        ...(ptyError !== undefined ? { ptyError } : {}),
      }
    },

    '/terminal/kill': ({ body }) => {
      if (!config().terminal.enabled) throw new ApiError(404, 'the terminal is switched off')
      const id = (body as { id?: unknown } | undefined)?.id
      if (typeof id !== 'string' || !TERMINAL_ID_PATTERN.test(id)) throw new ApiError(400, 'a terminal id is required')
      let killed = 0
      for (const session of [...sessions.values()]) {
        if (session.termId === id) {
          disposeSession(session)
          killed += 1
        }
      }
      return { killed }
    },
  })

  return () => {
    unregisterUpgrade()
    disposeRoutes()
    wss.clients.forEach(client => { try { client.close(1001, 'terminal service stopped') } catch { /* closing */ } })
    wss.close()
    for (const session of [...sessions.values()]) disposeSession(session)
  }
}
