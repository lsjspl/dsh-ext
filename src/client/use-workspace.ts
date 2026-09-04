import { useEffect, useState } from 'react'

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

export function setActiveWorkspaceRoot(root: string | undefined): void {
  currentWorkspaceRoot = root
}

export function getActiveWorkspaceRoot(): string | undefined {
  return currentWorkspaceRoot
}

export function useActiveWorkspace(useWorkspaces: WorkspacesHook | undefined): string | undefined {
  // Two calls into one selector: the hook is only legal to call during render,
  // and calling it conditionally would break the hook order the moment a
  // deployment started or stopped supplying it.
  const selected = useWorkspaces?.(state => {
    const recent = state.recentWorkspaceId
    const match = recent === undefined
      ? undefined
      : state.items.find(item => item.workspaceId === recent)
    // One workspace and no recency yet is the fresh-install case; it is the
    // only workspace there is, so naming it is not a guess.
    const only = state.items.length === 1 ? state.items[0] : undefined
    return (match ?? only)?.path
  })
  if (selected !== undefined) {
    currentWorkspaceRoot = selected
  }
  return selected ?? currentWorkspaceRoot
}

/**
 * A width the user can drag, persisted across reloads.
 *
 * Kept in this module because it is the same class of fact as the workspace:
 * something the panel needs on first paint and must not re-derive per render.
 */
const WIDTH_KEY = 'dsh-dev-tool-ext:side-panel-width'

/** Bounds. Narrower than ~220px cannot show a file name; wider than 900 crowds out the chat. */
export const MIN_PANEL_WIDTH = 220
export const MAX_PANEL_WIDTH = 900
export const DEFAULT_PANEL_WIDTH = 340

function readWidth(): number {
  try {
    const stored = window.localStorage.getItem(WIDTH_KEY)
    if (stored === null) return DEFAULT_PANEL_WIDTH
    const parsed = Number(stored)
    if (!Number.isFinite(parsed)) return DEFAULT_PANEL_WIDTH
    return clampWidth(parsed)
  } catch {
    return DEFAULT_PANEL_WIDTH
  }
}

export function clampWidth(value: number): number {
  return Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, Math.round(value)))
}

let width: number | undefined
const widthListeners = new Set<() => void>()

/** Publish a new width to every subscriber, and remember it. */
export function setPanelWidth(next: number): void {
  const clamped = clampWidth(next)
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
export function usePanelWidth(): number {
  const [, bump] = useState(0)
  if (width === undefined) width = readWidth()

  useEffect(() => {
    const listener = () => { bump(n => n + 1) }
    widthListeners.add(listener)
    return () => { widthListeners.delete(listener) }
  }, [])

  return width
}
