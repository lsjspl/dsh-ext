import { useCallback, useEffect, useState } from 'react'

/**
 * The side panel's open tabs, isolated per workspace.
 *
 * File paths are workspace-relative, so a tab from project A is meaningless in
 * project B. Each workspace owns a separate state, subscriber set, and storage
 * key. There is deliberately no module-global "active scope": the settings
 * preview and the real panel can be mounted together without stealing each
 * other's tab operations.
 */

export type TabKind = 'files' | 'review' | 'editor' | 'diff'

export interface Tab {
  readonly id: string
  readonly kind: TabKind
  readonly path?: string
}

export interface TabStore {
  readonly tabs: readonly Tab[]
  readonly activeId: string
  open(kind: TabKind, path?: string): void
  select(id: string): void
  close(id: string): void
}

interface TabState {
  readonly tabs: readonly Tab[]
  readonly activeId: string
}

const STORAGE_PREFIX = 'dsh-dev-tool-ext:side-panel-tabs:'
const LEGACY_STORAGE_KEY = 'dsh-dev-tool-ext:side-panel-tabs'
const DEFAULT_SCOPE = 'unscoped'

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(scope)}`
}

function initial(): TabState {
  return {
    tabs: [{ id: 'files', kind: 'files' }, { id: 'review', kind: 'review' }],
    activeId: 'files',
  }
}

function tabId(kind: TabKind, path?: string): string {
  return kind === 'editor' || kind === 'diff' ? `${kind}:${path ?? ''}` : kind
}

function parseState(stored: string | null): TabState | undefined {
  if (stored === null) return undefined
  try {
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return undefined
    const raw = (parsed as { tabs?: unknown }).tabs
    if (!Array.isArray(raw)) return undefined
    const tabs = raw.flatMap((entry): Tab[] => {
      if (typeof entry !== 'object' || entry === null) return []
      const rawKind = (entry as { kind?: unknown }).kind
      const kind = rawKind === 'changes' ? 'review' : rawKind
      const path = (entry as { path?: unknown }).path
      if (kind !== 'files' && kind !== 'review' && kind !== 'editor' && kind !== 'diff') return []
      if ((kind === 'editor' || kind === 'diff') && typeof path !== 'string') return []
      return [{
        id: tabId(kind, typeof path === 'string' ? path : undefined),
        kind,
        ...(typeof path === 'string' ? { path } : {}),
      }]
    })
    if (tabs.length === 0) return undefined
    const storedActive = (parsed as { activeId?: unknown }).activeId
    const activeId = typeof storedActive === 'string' && tabs.some(tab => tab.id === storedActive)
      ? storedActive
      : tabs[0]!.id
    return { tabs, activeId }
  } catch {
    return undefined
  }
}

function read(scope: string): TabState {
  try {
    const own = parseState(window.localStorage.getItem(storageKey(scope)))
    if (own !== undefined) return own

    // The old key has no workspace identity. Migrating it would copy project A's
    // relative file tabs into whichever project happens to load first — exactly
    // the corruption this scoped store fixes. Drop it and start this workspace
    // from Files/Review instead.
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY) !== null) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  } catch { /* unavailable storage gets an in-memory default */ }
  return initial()
}

const states = new Map<string, TabState>()
const listeners = new Map<string, Set<() => void>>()

function current(scope: string): TabState {
  let state = states.get(scope)
  if (state === undefined) {
    state = read(scope)
    states.set(scope, state)
  }
  return state
}

function commit(scope: string, next: TabState): void {
  states.set(scope, next)
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(next))
  } catch { /* a browser refusing storage still gets working tabs */ }
  for (const listener of [...(listeners.get(scope) ?? [])]) listener()
}

function open(scope: string, kind: TabKind, path?: string): void {
  const now = current(scope)
  const id = tabId(kind, path)
  if (now.tabs.some(tab => tab.id === id)) {
    if (now.activeId !== id) commit(scope, { ...now, activeId: id })
    return
  }
  const tab: Tab = { id, kind, ...(path === undefined ? {} : { path }) }
  commit(scope, { tabs: [...now.tabs, tab], activeId: id })
}

function select(scope: string, id: string): void {
  const now = current(scope)
  if (now.activeId === id || !now.tabs.some(tab => tab.id === id)) return
  commit(scope, { ...now, activeId: id })
}

function close(scope: string, id: string): void {
  const now = current(scope)
  const index = now.tabs.findIndex(tab => tab.id === id)
  if (index < 0) return
  const tabs = now.tabs.filter(tab => tab.id !== id)
  if (now.activeId !== id) {
    commit(scope, { tabs, activeId: now.activeId })
    return
  }
  const neighbour = tabs[Math.max(0, index - 1)]
  commit(scope, { tabs, activeId: neighbour?.id ?? '' })
}

export function useTabs(scope: string | undefined): TabStore {
  const [, bump] = useState(0)
  const key = scope ?? DEFAULT_SCOPE
  const now = current(key)

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    let scoped = listeners.get(key)
    if (scoped === undefined) {
      scoped = new Set()
      listeners.set(key, scoped)
    }
    scoped.add(listener)
    return () => {
      scoped.delete(listener)
      if (scoped.size === 0) listeners.delete(key)
    }
  }, [key])

  const openBound = useCallback((kind: TabKind, path?: string) => { open(key, kind, path) }, [key])
  const selectBound = useCallback((id: string) => { select(key, id) }, [key])
  const closeBound = useCallback((id: string) => { close(key, id) }, [key])

  return { ...now, open: openBound, select: selectBound, close: closeBound }
}

// ── The conversation → panel bridge ────────────────────────────────────────
//
// The per-turn changes card lives in the host's chat and needs to open a diff
// or editor tab in THIS panel, which is a different component tree. The store
// is module-level, so the panel publishes its scope on mount and any caller
// can open into it. The last bound scope survives the panel being closed
// (unmounted): a tab written then simply shows when the panel reopens.

let panelScope: string | undefined

/** Publish the mounted panel's tab scope. Returns the unbind disposer. */
export function bindPanelTabs(scope: string): () => void {
  panelScope = scope
  return () => { if (panelScope === scope) panelScope = undefined }
}

/** The scope the side panel last published, for opening a tab from outside it. */
export function currentPanelScope(): string | undefined {
  return panelScope
}

/** Open a tab in the panel's store directly — works while the panel is closed. */
export function openPanelTab(scope: string, kind: TabKind, path?: string): void {
  open(scope, kind, path)
}
