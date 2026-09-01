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

const STORAGE_KEY = 'dsh-dev-tool-ext:side-panel-open'

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
