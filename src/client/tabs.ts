import { useEffect, useState } from 'react'

/**
 * The side panel's open tabs.
 *
 * The panel is a tab strip rather than a fixed two-pane layout because the
 * things it shows are unrelated jobs: a file browser is something you keep open
 * while reading, a change list is something you glance at, and a diff is
 * transient. Forcing them to share one scroll column meant the file tree was
 * always half a panel tall.
 *
 * Tabs are a persisted list, not component state: which views a user keeps open
 * is a preference, and losing it on every reload would make the `+` menu feel
 * like busywork.
 */

/** The views a tab can hold. */
export type TabKind = 'files' | 'changes' | 'editor'

export interface Tab {
  /** Stable across renders and reorders, so React keys and the active id agree. */
  readonly id: string
  readonly kind: TabKind
  /**
   * Workspace-relative path, for an `editor` tab. Absent on the singleton views,
   * which describe the whole workspace.
   */
  readonly path?: string
}

interface TabState {
  readonly tabs: readonly Tab[]
  readonly activeId: string
}

const STORAGE_KEY = 'dsh-dev-tool-ext:side-panel-tabs'

/**
 * The opening layout: the file browser, because that is the view the panel is
 * most often opened *for*, and the change list beside it.
 */
function initial(): TabState {
  return {
    tabs: [{ id: 'files', kind: 'files' }, { id: 'changes', kind: 'changes' }],
    activeId: 'files',
  }
}

/**
 * Editor tabs are keyed by path so opening the same file twice focuses the
 * existing tab instead of stacking duplicates — the behaviour every editor has.
 */
function tabId(kind: TabKind, path?: string): string {
  return kind === 'editor' ? `editor:${path ?? ''}` : kind
}

let state: TabState | undefined
const listeners = new Set<() => void>()

function read(): TabState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return initial()
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return initial()
    const raw = (parsed as { tabs?: unknown }).tabs
    if (!Array.isArray(raw)) return initial()
    const tabs = raw.flatMap((entry): Tab[] => {
      if (typeof entry !== 'object' || entry === null) return []
      const kind = (entry as { kind?: unknown }).kind
      const path = (entry as { path?: unknown }).path
      if (kind !== 'files' && kind !== 'changes' && kind !== 'editor') return []
      // An editor tab with no path could never render anything; drop it rather
      // than showing an empty pane with a close button.
      if (kind === 'editor' && typeof path !== 'string') return []
      return [{ id: tabId(kind, typeof path === 'string' ? path : undefined), kind, ...(typeof path === 'string' ? { path } : {}) }]
    })
    if (tabs.length === 0) return initial()
    const storedActive = (parsed as { activeId?: unknown }).activeId
    const activeId = typeof storedActive === 'string' && tabs.some(tab => tab.id === storedActive)
      ? storedActive
      : tabs[0]!.id
    return { tabs, activeId }
  } catch {
    return initial()
  }
}

function commit(next: TabState): void {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* a browser refusing storage still gets working tabs */ }
  for (const listener of [...listeners]) listener()
}

function current(): TabState {
  if (state === undefined) state = read()
  return state
}

/** Open a view, or focus it when it is already open. */
export function openTab(kind: TabKind, path?: string): void {
  const now = current()
  const id = tabId(kind, path)
  const existing = now.tabs.find(tab => tab.id === id)
  if (existing !== undefined) {
    if (now.activeId !== id) commit({ ...now, activeId: id })
    return
  }
  const tab: Tab = { id, kind, ...(path === undefined ? {} : { path }) }
  commit({ tabs: [...now.tabs, tab], activeId: id })
}

/** Focus an already-open tab. */
export function selectTab(id: string): void {
  const now = current()
  if (now.activeId === id || !now.tabs.some(tab => tab.id === id)) return
  commit({ ...now, activeId: id })
}

/**
 * Close a tab.
 *
 * Focus moves to the neighbour on the left, matching every tabbed editor: the
 * tab that was *next to* the one you closed is the one you were most likely
 * working with. Closing the last tab leaves the panel empty rather than
 * resurrecting a default — an empty panel with a `+` is self-explanatory, and
 * silently reopening a view the user just closed is not.
 */
export function closeTab(id: string): void {
  const now = current()
  const index = now.tabs.findIndex(tab => tab.id === id)
  if (index < 0) return
  const tabs = now.tabs.filter(tab => tab.id !== id)
  if (now.activeId !== id) {
    commit({ tabs, activeId: now.activeId })
    return
  }
  const neighbour = tabs[Math.max(0, index - 1)]
  commit({ tabs, activeId: neighbour?.id ?? '' })
}

/** Subscribe to the tab list. */
export function useTabs(): TabState {
  const [, bump] = useState(0)
  const now = current()

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  return now
}
