import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { getClientContext } from './index.tsx'

/**
 * Which project directory the panel should describe.
 *
 * ## Why this exists at all
 *
 * The panel sits in `shell.overlay`, a ROOT-scope seat, so it is handed no
 * `sessionId`. With nothing to go on the server falls back to the workspace
 * registry's FIRST entry — its oldest — and the panel then reports that
 * project's file tree and change list as though it were the current one. That
 * is how "不是 git 仓库" appeared for a directory that is plainly a repository:
 * the answer was truthful about the wrong folder.
 *
 * Root-scope slot entries are handed `useWorkspaces`, the same store the
 * sidebar's own workspace list renders from. Its `recentWorkspaceId` is the
 * host's own "most recently active workspace" projection, which is precisely
 * the question the panel needs answered when no session is open. Reading it
 * here means the browser states the workspace outright instead of leaving the
 * server to guess.
 *
 * `path` rather than `workspaceId` is sent on purpose: the server's resolver
 * accepts either, and a path is meaningful even for a directory the registry
 * has no row for.
 */

/** The fields this plugin reads off the host's workspace list snapshot. */
interface WorkspaceListSnapshot {
  readonly items: readonly { readonly workspaceId: string; readonly path: string; readonly title: string }[]
  readonly recentWorkspaceId?: string | undefined
}

/**
 * The shape of the injected hook. Declared structurally rather than imported:
 * the seat's prop bag is assembled by whichever entry registered the slot, so
 * a deployment whose layout package is older simply passes nothing, and this
 * degrades to "let the server decide" instead of failing to render.
 */
export type WorkspacesHook = <T>(select: (state: WorkspaceListSnapshot) => T) => T

/**
 * The active workspace's canonical path, or `undefined` when the host cannot
 * say.
 *
 * Returns `undefined` rather than a guess on every unknown: the server has
 * strictly better information than this hook does whenever a session is in
 * play (that session's own `cwd`), so a wrong hint here would override a right
 * answer there.
 */
let currentWorkspaceRoot: string | undefined
const rootListeners = new Set<() => void>()

export function setActiveWorkspaceRoot(root: string | undefined): void {
  if (currentWorkspaceRoot !== root) {
    currentWorkspaceRoot = root
    for (const fn of rootListeners) fn()
  }
}

export function getActiveWorkspaceRoot(): string | undefined {
  return currentWorkspaceRoot
}

/**
 * Attempt to detect the active workspace from rendered DOM elements.
 * Critical when a workspace is freshly opened or has 0 sessions (Hero phase),
 * where session lists and recentWorkspaceId may not have updated yet.
 */
function findWorkspaceFromDom(items?: readonly any[]): string | undefined {
  if (typeof document === 'undefined' || !items || items.length === 0) return undefined

  const selectors = [
    '[class*="heroWorkspaceRow"]',
    '[class*="heroWorkspace"]',
    '[class*="workspacePicker"]',
    '[class*="workspace-picker"]',
    '[class*="workspaceItem"][class*="active"]',
    '[class*="workspaceItem"][aria-selected="true"]',
    '[class*="workspace"][class*="active"]',
    '[class*="workspace"][aria-selected="true"]',
    '[data-active-workspace="true"]',
    '[data-composer-card]',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (!el) continue

    // 1. Check data attributes for exact workspace ID or path
    const dataId = el.getAttribute('data-workspace-id') || el.getAttribute('data-id')
    if (dataId) {
      const match = items.find(i => i.workspaceId === dataId || i.id === dataId)
      if (match?.path) return match.path
    }
    const dataPath = el.getAttribute('data-path') || el.getAttribute('data-workspace-path')
    if (dataPath) {
      const targetNorm = dataPath.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
      const match = items.find(i => i.path && i.path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase() === targetNorm)
      if (match?.path) return match.path
    }

    // 2. Read text candidates (skip container if it's data-composer-card)
    if (selector === '[data-composer-card]') continue

    const texts = [
      el.getAttribute('title'),
      el.textContent,
    ].filter(Boolean).map(s => s!.trim()).filter(Boolean)

    for (const text of texts) {
      // First pass: exact match with title, name, or folder name
      const exactMatch = items.find(item => {
        const title = (item.title || item.name || '').trim()
        if (title && text.toLowerCase() === title.toLowerCase()) return true
        const folder = item.path ? item.path.split(/[/\\]/).filter(Boolean).pop()?.trim() : undefined
        if (folder && text.toLowerCase() === folder.toLowerCase()) return true
        return false
      })
      if (exactMatch?.path) return exactMatch.path

      // Second pass: match items where title or folder name is contained, prioritized by longest title
      const sortedByLength = [...items].sort((a, b) => {
        const lenA = (a.title || a.name || a.path || '').length
        const lenB = (b.title || b.name || b.path || '').length
        return lenB - lenA
      })
      const subMatch = sortedByLength.find(item => {
        const title = (item.title || item.name || '').trim()
        if (title && text.toLowerCase().includes(title.toLowerCase())) return true
        const folder = item.path ? item.path.split(/[/\\]/).filter(Boolean).pop()?.trim() : undefined
        if (folder && text.toLowerCase().includes(folder.toLowerCase())) return true
        return false
      })
      if (subMatch?.path) return subMatch.path
    }
  }

  return undefined
}

export function useActiveWorkspace(useWorkspaces?: WorkspacesHook | undefined): string | undefined {
  const manualRoot = useSyncExternalStore(
    useCallback(fn => {
      rootListeners.add(fn)
      return () => { rootListeners.delete(fn) }
    }, []),
    () => currentWorkspaceRoot,
  )

  const workspacesService = getClientContext()?.get('workspaces') as any
  const sessionsService = getClientContext()?.get('sessions') as any

  const wsSnap = useSyncExternalStore(
    useCallback(fn => workspacesService?.list?.subscribe ? workspacesService.list.subscribe(fn) : () => {}, [workspacesService]),
    useCallback(() => workspacesService?.list?.getSnapshot ? workspacesService.list.getSnapshot() : null, [workspacesService]),
  )

  const sessionSnap = useSyncExternalStore(
    useCallback(fn => sessionsService?.list?.subscribe ? sessionsService.list.subscribe(fn) : () => {}, [sessionsService]),
    useCallback(() => sessionsService?.list?.getSnapshot ? sessionsService.list.getSnapshot() : null, [sessionsService]),
  )

  const hookSelected = useWorkspaces?.(state => {
    const recent = state.recentWorkspaceId
    const match = recent === undefined
      ? undefined
      : state.items.find(item => item.workspaceId === recent)
    const only = state.items.length === 1 ? state.items[0] : undefined
    return (match ?? only)?.path
  })

  // 1. Active session truth (including newly created blank sessions)
  const curId = sessionSnap?.current
  const curSession = curId ? sessionSnap?.byId?.[curId] : undefined

  // 1a. If the active session is explicitly tied to a workspaceId in the workspaces list
  if (curSession?.workspaceId && wsSnap?.items) {
    const matched = wsSnap.items.find((item: any) => item.workspaceId === curSession.workspaceId || item.id === curSession.workspaceId)
    if (matched?.path) {
      if (currentWorkspaceRoot !== matched.path) {
        currentWorkspaceRoot = matched.path
      }
      return matched.path
    }
  }

  // 1b. If the active session has its own cwd (even if blank/new session!)
  if (curSession?.cwd && curSession.cwd.trim().length > 0) {
    if (currentWorkspaceRoot !== curSession.cwd) {
      currentWorkspaceRoot = curSession.cwd
    }
    return curSession.cwd
  }

  // 2. If an injected hook selector resolved a path
  if (hookSelected !== undefined) {
    if (currentWorkspaceRoot !== hookSelected) {
      currentWorkspaceRoot = hookSelected
    }
    return hookSelected
  }

  // 3. From host workspaces store projection
  if (wsSnap) {
    // 3a. If a session exists and is associated with a workspace in the items list
    if (curId && wsSnap.items) {
      const matched = wsSnap.items.find((item: any) => item.sessionIds?.includes(curId))
      if (matched?.path) {
        if (currentWorkspaceRoot !== matched.path) {
          currentWorkspaceRoot = matched.path
        }
        return matched.path
      }
    }

    // 3b. Active workspace ID on snapshot or workspaces service
    const activeWsId =
      wsSnap.activeWorkspaceId ||
      wsSnap.currentWorkspaceId ||
      wsSnap.selectedWorkspaceId ||
      wsSnap.current ||
      wsSnap.selectedId ||
      workspacesService?.activeWorkspaceId ||
      workspacesService?.currentWorkspaceId ||
      workspacesService?.selectedWorkspaceId ||
      workspacesService?.current ||
      workspacesService?.selectedId ||
      workspacesService?.currentWorkspace?.id ||
      workspacesService?.currentWorkspace?.workspaceId
    if (activeWsId && wsSnap.items) {
      const matched = wsSnap.items.find((item: any) => item.workspaceId === activeWsId || item.id === activeWsId)
      if (matched?.path) {
        if (currentWorkspaceRoot !== matched.path) {
          currentWorkspaceRoot = matched.path
        }
        return matched.path
      }
    }

    // 3c. Active item flag on items list
    if (wsSnap.items) {
      const activeItem = wsSnap.items.find((item: any) =>
        item.active === true ||
        item.selected === true ||
        item.isCurrent === true ||
        item.current === true
      )
      if (activeItem?.path) {
        if (currentWorkspaceRoot !== activeItem.path) {
          currentWorkspaceRoot = activeItem.path
        }
        return activeItem.path
      }
    }

    // 3d. Inspect DOM for workspace indicator (hero row, workspace picker, active item)
    if (wsSnap.items && wsSnap.items.length > 0) {
      const domPath = findWorkspaceFromDom(wsSnap.items)
      if (domPath) {
        if (currentWorkspaceRoot !== domPath) {
          currentWorkspaceRoot = domPath
        }
        return domPath
      }
    }

    // 3e. Otherwise check recentWorkspaceId (used by hero row and workspace picker)
    const recent = wsSnap.recentWorkspaceId
    const match = recent === undefined
      ? undefined
      : wsSnap.items?.find((item: any) => item.workspaceId === recent)
    const only = wsSnap.items?.length === 1 ? wsSnap.items[0] : undefined
    const resolved = (match ?? only)?.path
    if (resolved) {
      if (currentWorkspaceRoot !== resolved) {
        currentWorkspaceRoot = resolved
      }
      return resolved
    }
  }

  return manualRoot ?? currentWorkspaceRoot
}

/**
 * A width the user can drag, persisted across reloads.
 *
 * Kept in this module because it is the same class of fact as the workspace:
 * something the panel needs on first paint and must not re-derive per render.
 */
const WIDTH_KEY = 'dsh-dev-tool-ext:side-panel-width'

/** Bounds. Narrower than ~220px cannot show a file name. The right panel has no upper bound so it can be dragged as far left as the user wants; the left panel keeps a cap so it cannot crowd out the chat. */
export const MIN_PANEL_WIDTH = 220
export const MAX_PANEL_WIDTH = 900
export const DEFAULT_PANEL_WIDTH = 340

function readWidth(side?: 'left' | 'right'): number {
  try {
    const stored = window.localStorage.getItem(WIDTH_KEY)
    if (stored === null) return DEFAULT_PANEL_WIDTH
    const parsed = Number(stored)
    if (!Number.isFinite(parsed)) return DEFAULT_PANEL_WIDTH
    return clampWidth(parsed, side)
  } catch {
    return DEFAULT_PANEL_WIDTH
  }
}

export function clampWidth(value: number, side?: 'left' | 'right'): number {
  const rounded = Math.max(MIN_PANEL_WIDTH, Math.round(value))
  return side === 'right' ? rounded : Math.min(MAX_PANEL_WIDTH, rounded)
}

let width: number | undefined
const widthListeners = new Set<() => void>()

/** Publish a new width to every subscriber, and remember it. */
export function setPanelWidth(next: number, side?: 'left' | 'right'): void {
  const clamped = clampWidth(next, side)
  if (width === clamped) return
  width = clamped
  try {
    window.localStorage.setItem(WIDTH_KEY, String(clamped))
  } catch { /* a browser refusing storage still gets a working drag */ }
  for (const listener of [...widthListeners]) listener()
}

/**
 * The panel's current width.
 *
 * Module-level rather than component state for the same reason the open flag is:
 * the drag handle, the panel, and the effect that reserves room on the
 * conversation column are not in one React tree.
 */
export function usePanelWidth(side?: 'left' | 'right'): number {
  const [, bump] = useState(0)
  if (width === undefined) width = readWidth(side)

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    widthListeners.add(listener)
    return () => { widthListeners.delete(listener) }
  }, [])

  return width
}
