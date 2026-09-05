import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import xtermCss from '@xterm/xterm/css/xterm.css'
import { token } from './ui.tsx'
import { useT, translate } from './use-locale.ts'
import { effectiveBackground, surfaceScheme, type SurfaceScheme } from './theme.ts'

/**
 * One terminal tab: xterm.js drawing a real PTY that runs in the harness's
 * host process, streamed over a WebSocket.
 *
 * ## Why the pieces are what they are
 *
 * The emulator is `@xterm/xterm` — the same one VS Code renders with — because
 * a VT/ANSI emulator is not a weekend component: cursor addressing, scroll
 * regions, wide characters, mouse reporting, and the long tail of application
 * escape sequences are exactly the part not worth rebuilding. Its stylesheet is
 * bundled as text and injected once (the DSH loader artifact is a single CJS
 * factory, so a separate CSS file has no way to reach the page).
 *
 * The websocket speaks the compact JSON frame protocol defined in
 * `features/terminal.ts`: keystrokes up as `{t:'i', d}`, output down as base64
 * in `{t:'o', d}`. Output is transported base64 rather than text so a chunk
 * boundary can never split a multibyte character (the server reads the PTY
 * raw and the client hands xterm bytes).
 *
 * Reconnection is deliberately boring: the PTY outlives the browser tab. A
 * refresh, a tab switch, or a dropped socket reattaches to the same shell and
 * the server replays its ring buffer, so the screen comes back — the same
 * behaviour an SSH client's reconnect offers, and the reason scrollback size
 * is a server-side setting.
 */

type Phase = 'connecting' | 'ready' | 'exited' | 'failed'

let stylesInjected = false
function ensureXtermStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  const style = document.createElement('style')
  style.dataset.dshPlugin = 'dsh-ext'
  style.textContent = xtermCss
  document.head.appendChild(style)
}

/**
 * ANSI colours for a light canvas. Shell-side colour schemes (PowerShell's
 * PSReadLine among them) hardcode "bright yellow means a command" against a
 * dark background, so a terminal that merely inherits the light panel's white
 * canvas renders those colours invisible — a light theme needs its own
 * palette, the way VS Code's Light+ ships one. Values are VS Code Light+'s.
 */
const LIGHT_ANSI = {
  black: '#000000',
  red: '#cd3131',
  green: '#00bc00',
  yellow: '#949800',
  blue: '#0451a5',
  magenta: '#bc05bc',
  cyan: '#0598bc',
  white: '#555555',
  brightBlack: '#666666',
  brightRed: '#cd3131',
  brightGreen: '#14ce14',
  brightYellow: '#b5ba00',
  brightBlue: '#0451a5',
  brightMagenta: '#bc05bc',
  brightCyan: '#0598bc',
  brightWhite: '#a5a5a5',
} as const

function terminalTheme(container: HTMLElement): {
  background: string
  foreground: string
  selectionBackground: string
  selectionInactiveBackground: string
} & Partial<typeof LIGHT_ANSI> {
  const scheme: SurfaceScheme = surfaceScheme(container)
  const background = effectiveBackground(container)
  const foreground = getComputedStyle(container).color
  return scheme === 'light'
    ? {
        background,
        foreground,
        ...LIGHT_ANSI,
        // Selection the eye can find on white: the accent blue, thinned out.
        selectionBackground: 'rgba(4, 81, 165, 0.28)',
        selectionInactiveBackground: 'rgba(4, 81, 165, 0.14)',
      }
    : {
        background,
        foreground,
        selectionBackground: 'rgba(174, 197, 255, 0.30)',
        selectionInactiveBackground: 'rgba(174, 197, 255, 0.15)',
      }
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function TerminalView(props: { termId: string; workspace?: string; sessionId?: string }) {
  const t = useT()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [phase, setPhase] = useState<Phase>('connecting')
  const [exitCode, setExitCode] = useState<number | undefined>(undefined)
  const [fatal, setFatal] = useState<string | undefined>(undefined)
  // Bumping this rebuilds the whole terminal — the restart affordance.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return
    ensureXtermStyles()

    let disposed = false
    let socket: WebSocket | undefined
    let reconnectTimer: number | undefined
    let retries = 0
    let sawReady = false
    let sawExit = false
    let sawFatal = false

    const term = new Terminal({
      fontSize: 12.5,
      lineHeight: 1.15,
      fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, Menlo, "Courier New", monospace',
      cursorBlink: true,
      scrollback: 2000,
      theme: terminalTheme(container),
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(container)
    try { fit.fit() } catch { /* a zero-size container (mid-layout) retries via the observer */ }

    const disposables: Array<{ dispose(): void }> = [
      term.onData(data => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ t: 'i', d: data }))
      }),
      term.onResize(({ cols, rows }) => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ t: 's', c: cols, r: rows }))
      }),
    ]

    const observer = new ResizeObserver(() => {
      try { fit.fit() } catch { /* the panel briefly reports zero size mid-drag */ }
    })
    observer.observe(container)

    const connect = (): void => {
      if (disposed) return
      setPhase('connecting')
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const parts = [
        `id=${encodeURIComponent(props.termId)}`,
        props.workspace === undefined || props.workspace === '' ? '' : `workspace=${encodeURIComponent(props.workspace)}`,
        props.sessionId === undefined || props.sessionId === '' ? '' : `session=${encodeURIComponent(props.sessionId)}`,
        `cols=${term.cols}`,
        `rows=${term.rows}`,
      ].filter(Boolean)
      const ws = new WebSocket(`${proto}//${location.host}/api/dsh-ext/terminal/ws?${parts.join('&')}`)
      socket = ws
      ws.onmessage = (event) => {
        let frame: { t?: string; d?: string; c?: number; m?: string }
        try { frame = JSON.parse(String(event.data)) } catch { return }
        if (frame.t === 'o' && typeof frame.d === 'string' && frame.d.length > 0) {
          term.write(base64ToBytes(frame.d))
        } else if (frame.t === 'r') {
          sawReady = true
          retries = 0
          setFatal(undefined)
          setPhase('ready')
          // The server sized the PTY from the URL; sync anyway in case the
          // panel changed between the socket opening and the attach.
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ t: 's', c: term.cols, r: term.rows }))
        } else if (frame.t === 'x') {
          sawExit = true
          const code = typeof frame.c === 'number' ? frame.c : 0
          setExitCode(code)
          setPhase('exited')
          term.write(`\r\n\x1b[2m${translate('terminal.exit', { code })}\x1b[0m\r\n`)
        } else if (frame.t === 'e') {
          sawFatal = true
          setFatal(typeof frame.m === 'string' ? frame.m : 'unknown error')
          setPhase('failed')
        }
      }
      ws.onclose = () => {
        if (disposed || socket !== ws) return
        socket = undefined
        // A fatal frame or an exited process means reconnecting cannot help —
        // the user restarts deliberately. Everything else is a dropped pipe:
        // the shell is still alive server-side, so try again with a backoff.
        if (sawExit || sawFatal) {
          setPhase(sawExit ? 'exited' : 'failed')
          return
        }
        if (retries < 5) {
          retries += 1
          setPhase('connecting')
          reconnectTimer = window.setTimeout(connect, Math.min(400 * retries, 3000))
          return
        }
        setFatal(translate('terminal.disconnected'))
        setPhase('failed')
      }
      ws.onerror = () => { try { ws.close() } catch { /* close is all the error handling a socket gets */ } }
    }
    connect()

    return () => {
      disposed = true
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
      observer.disconnect()
      for (const disposable of disposables) disposable.dispose()
      socket?.close()
      term.dispose()
    }
  }, [props.termId, props.workspace, props.sessionId, attempt])

  return (
    <div
      data-dsh-plugin="dsh-ext"
      data-dsh-part="terminal"
      style={{ position: 'relative', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
      {phase === 'connecting' && (
        <div style={overlayCornerStyle}>{t('terminal.connecting')}</div>
      )}
      {phase === 'exited' && (
        <div style={overlayCornerStyle}>
          <span style={{ color: token.textMuted }}>{t('terminal.exitShort', exitCode === undefined ? undefined : { code: exitCode })}</span>
          <button type="button" style={restartButtonStyle} onClick={() => { setAttempt(n => n + 1) }}>
            {t('terminal.restart')}
          </button>
        </div>
      )}
      {phase === 'failed' && (
        <div style={overlayCenterStyle}>
          <div style={{ fontSize: 12, color: token.danger, maxWidth: '100%', overflowWrap: 'anywhere' }}>
            {t('terminal.failed', { message: fatal ?? '' })}
          </div>
          <button type="button" style={restartButtonStyle} onClick={() => { setAttempt(n => n + 1) }}>
            {t('terminal.restart')}
          </button>
        </div>
      )}
    </div>
  )
}

const overlayCornerStyle = {
  position: 'absolute',
  top: 6,
  right: 10,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '3px 10px',
  borderRadius: 999,
  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.14))',
  border: `1px solid ${token.border}`,
  fontSize: 12,
  color: token.textMuted,
  pointerEvents: 'auto',
} as const

const overlayCenterStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: 16,
  background: 'color-mix(in srgb, currentColor 4%, transparent)',
  pointerEvents: 'auto',
} as const

const restartButtonStyle = {
  font: 'inherit',
  fontSize: 12,
  padding: '2px 10px',
  borderRadius: 5,
  border: `1px solid ${token.border}`,
  background: 'transparent',
  color: token.text,
  cursor: 'pointer',
} as const
