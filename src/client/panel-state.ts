import { useEffect, useState } from 'react'

/**
 * Open/closed state for the explorer panel, shared between two slot entries.
 *
 * The toggle button lives in the session header (`…header.utilities`) and the
 * panel itself lives in `shell.overlay` — two separate registrations with no
 * common React ancestor, so the state cannot be a hook in either one. A tiny
 * module-level store is the honest shape for that: one source of truth, both
 * entries subscribe.
 *
 * Persisted to `localStorage`, so the panel is where the user left it after a
 * reload rather than reverting to the configured default every time.
 */

const STORAGE_KEY = 'dsh-ext:side-panel-open'

let open: boolean | undefined
const listeners = new Set<() => void>()

function read(fallback: boolean): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? fallback : stored === '1'
  } catch {
    return fallback
  }
}

/** Set the panel's state and notify both entries. */
export function setPanelOpen(next: boolean): void {
  if (open === next) return
  open = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch { /* a browser refusing storage still gets a working toggle */ }
  for (const listener of [...listeners]) listener()
}

/**
 * Subscribe to the panel's open state.
 *
 * @param fallback - the configured default, used only until the user has
 *   toggled it once (or when `localStorage` is unavailable).
 */
export function usePanelOpen(fallback: boolean): boolean {
  const [, bump] = useState(0)
  if (open === undefined) open = read(fallback)

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  return open
}

/**
 * The session the explorer should answer about.
 *
 * The panel sits in `shell.overlay`, a ROOT-scope seat: it is handed no
 * `sessionId`, and `scopeOf()` returns undefined for root contexts. Without a
 * session the host resolves the workspace from the registry's first entry —
 * the oldest workspace it knows — so the panel confidently showed an unrelated
 * project's tree and change list.
 *
 * The toggle button is session-scoped and re-renders per session, so it is the
 * one entry that knows the answer. It publishes here; the panel reads it. Not
 * persisted: which session is on screen is this tab's live state, and a stale
 * id from a previous visit would reintroduce exactly the wrong-project bug.
 */
let sessionId: string | undefined
const sessionListeners = new Set<() => void>()

/** Publish the session on screen. Called from the session-scoped header seat. */
export function setPanelSession(next: string | undefined): void {
  if (sessionId === next) return
  sessionId = next
  for (const listener of [...sessionListeners]) listener()
}

/** The session on screen, or undefined before a session-scoped seat has rendered. */
export function usePanelSession(): string | undefined {
  const [, bump] = useState(0)

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    sessionListeners.add(listener)
    return () => { sessionListeners.delete(listener) }
  }, [])

  return sessionId
}
