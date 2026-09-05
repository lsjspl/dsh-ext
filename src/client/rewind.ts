import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import { callApi } from './api.ts'
import type { TurnInfoView } from '../shared/api-contract.ts'
import { getActiveWorkspaceRoot } from './use-workspace.ts'

/**
 * The rewind engine shared by the two "go back to before this turn" surfaces:
 * the turn-tail changes card's 撤销, and the user-bubble edit pencil that
 * re-answers a turn. Both do the same three steps and differ only in what they
 * send into the branched session afterwards.
 *
 * The chat rewind is the host's own fork: cut at the previous turn's
 * `turn/end` and open the child — no page reload, and the original session
 * keeps every later answer. The anchor comes from the endpoint's detail read;
 * the session's first turn has no earlier boundary, so it reports
 * {@link RewindFailure.firstTurn}.
 */

export type RewindOutcome =
  | { readonly ok: true; readonly childId: string; readonly fresh: boolean }
  | { readonly ok: false; readonly reason: 'no-sessions' | 'restore-failed' | 'fork-failed' | 'new-session-failed' | 'first-turn' | 'turn-running'; readonly message: string }

/** The workspaces face the first-turn fallback needs (host's `ctx.workspaces`). */
export interface WorkspacesFace {
  /** Connect a workspace to its reusable or fresh blank session. */
  connectWorkspace(workspaceId: string): Promise<string>
  archiveSession?(sessionId: string): Promise<void>
  list?: {
    getSnapshot(): {
      items?: readonly { workspaceId: string; path: string; sessionIds?: readonly string[] }[]
      recentWorkspaceId?: string
    }
  }
}

/** Normalize workspace path for robust platform-agnostic matching. */
export function normalizeWorkspacePath(path: string | undefined): string {
  if (path === undefined) return ''
  return path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

/**
 * Archive a session into the bin by marking it with the host's own archive set.
 * Best-effort: returns false if archive fails or is unavailable.
 */
export async function trashSession(
  sessionId: string,
  archive?: (id: string) => Promise<unknown>,
): Promise<boolean> {
  if (!archive) return false
  try {
    await archive(sessionId)
    return true
  } catch (error: unknown) {
    console.warn('[dsh-ext] archiving the session failed:', error)
    return false
  }
}

/**
 * Resolve the registered workspace ID through multiple cascading heuristics:
 * caller-provided lookup, workspaces snapshot store, session ID membership,
 * normalized path matching, session cwd matching, active workspace root, or recent workspace.
 */
export function resolveWorkspaceId(props: {
  workspaces?: WorkspacesFace
  sessions?: ISessions
  sessionId?: string
  workspace?: string
  workspaceIdOf?: (path: string) => string | undefined
}): string | undefined {
  // 1. Caller-provided lookup
  if (props.workspace !== undefined && props.workspaceIdOf !== undefined) {
    const fromCaller = props.workspaceIdOf(props.workspace)
    if (fromCaller !== undefined) return fromCaller
  }

  // 2. Query workspaces snapshot store
  const snapshot = props.workspaces?.list?.getSnapshot?.()
  const items = snapshot?.items
  if (items !== undefined && items.length > 0) {
    // 2a. Match by session ID in workspace.sessionIds
    if (props.sessionId !== undefined) {
      const matchBySession = items.find(w => w.sessionIds?.includes(props.sessionId!))
      if (matchBySession !== undefined) return matchBySession.workspaceId
    }

    // 2b. Match by workspace path
    if (props.workspace !== undefined) {
      const target = normalizeWorkspacePath(props.workspace)
      const matchByPath = items.find(w => normalizeWorkspacePath(w.path) === target)
      if (matchByPath !== undefined) return matchByPath.workspaceId
    }

    // 2c. Match by session cwd from sessions.list
    if (props.sessionId !== undefined && props.sessions !== undefined) {
      const sessionsSnapshot = (props.sessions as unknown as { list?: { getSnapshot(): { byId?: Record<string, { cwd?: string }> } } })
        .list?.getSnapshot?.()
      const cwd = sessionsSnapshot?.byId?.[props.sessionId]?.cwd
      if (cwd !== undefined) {
        const target = normalizeWorkspacePath(cwd)
        const matchByCwd = items.find(w => normalizeWorkspacePath(w.path) === target)
        if (matchByCwd !== undefined) return matchByCwd.workspaceId
      }
    }

    // 2d. Match by active workspace root
    const activeRoot = getActiveWorkspaceRoot()
    if (activeRoot !== undefined) {
      const target = normalizeWorkspacePath(activeRoot)
      const matchByActive = items.find(w => normalizeWorkspacePath(w.path) === target)
      if (matchByActive !== undefined) return matchByActive.workspaceId
    }

    // 2e. Match recentWorkspaceId
    if (snapshot?.recentWorkspaceId !== undefined) {
      const matchRecent = items.find(w => w.workspaceId === snapshot.recentWorkspaceId)
      if (matchRecent !== undefined) return matchRecent.workspaceId
    }

    // 2f. If only one workspace exists, it is unambiguously that one
    if (items.length === 1) {
      return items[0]?.workspaceId
    }
  }

  return undefined
}

/**
 * Files back to the checkpoint, chat cut to before the turn, branch opened.
 *
 * The session's FIRST turn has no earlier `turn/end` to cut at, so there is
 * nothing to fork to — there, the "branch" is a brand-new session on the same
 * workspace (the host's own blank-session flow). Either way the caller gets an
 * open session whose log starts at or before this turn, which is what both
 * consumers (undo, edit-and-re-answer) need.
 */
export async function rewindTurn(props: {
  sessions: ISessions
  workspaces?: WorkspacesFace
  sessionId: string
  checkpointId: string | undefined
  detail: TurnInfoView | undefined
  forkFailedText: (message: string) => string
  firstTurnText: string
  /** Workspace path for the first-turn fresh-session fallback. */
  workspace: string | undefined
  /** Resolve the workspace id for {@link props.workspace}; enables the fallback. */
  workspaceIdOf?: (path: string) => string | undefined
}): Promise<RewindOutcome> {
  const undoAnchorSeq = props.detail?.undoAnchorSeq
  const isFirstTurn = props.detail?.turn === 1 || (props.detail?.turn === undefined && undoAnchorSeq === undefined)
  if (props.detail?.closed !== true) {
    return { ok: false, reason: 'turn-running', message: 'Wait for the turn to finish before rewinding.' }
  }
  if (!isFirstTurn && undoAnchorSeq === undefined) return { ok: false, reason: 'fork-failed', message: props.firstTurnText }

  // Prepare the chat target first: a failed fork must not change any files.
  async function finish(childId: string, fresh: boolean): Promise<RewindOutcome> {
    let undoId: string | undefined
    if (props.checkpointId !== undefined) {
      const restored = await callApi<{ undoId?: string }>('/checkpoints/restore', {
        body: { id: props.checkpointId, session: props.sessionId, confirm: true },
      })
      if (!restored.ok) return { ok: false, reason: 'restore-failed', message: restored.message }
      undoId = restored.value.undoId
    }
    try {
      props.sessions.open(childId as never)
      return { ok: true, childId, fresh }
    } catch (error) {
      let message = String(error)
      if (undoId !== undefined) {
        const undone = await callApi('/checkpoints/restore', {
          body: { id: undoId, session: props.sessionId, confirm: true },
        })
        if (!undone.ok) message += `; files could not be recovered: ${undone.message}. Recovery checkpoint: ${undoId}`
      }
      return { ok: false, reason: 'fork-failed', message: props.forkFailedText(message) }
    }
  }

  if (isFirstTurn) {
    // First turn: cut nothing — arrive in a fresh session on the same project.
    const workspaceId = resolveWorkspaceId({
      workspaces: props.workspaces,
      sessions: props.sessions,
      sessionId: props.sessionId,
      workspace: props.workspace,
      workspaceIdOf: props.workspaceIdOf,
    })

    if (props.workspaces !== undefined && workspaceId !== undefined) {
      try {
        const childId = await props.workspaces.connectWorkspace(workspaceId)
        return await finish(childId, true)
      } catch (startError: unknown) {
        console.warn('[dsh-ext] starting the fresh session via connectWorkspace failed:', startError)
      }
    }

    // Fallback: create session directly via sessions.create
    if (props.sessions !== undefined) {
      try {
        const sessionsSnapshot = (props.sessions as unknown as { list?: { getSnapshot(): { byId?: Record<string, { cwd?: string }> } } })
          .list?.getSnapshot?.()
        const cwd = props.workspace ?? sessionsSnapshot?.byId?.[props.sessionId]?.cwd
        const createOpts = workspaceId !== undefined
          ? { workspaceId }
          : cwd !== undefined
            ? { cwd }
            : {}
        const childId = await (props.sessions as unknown as { create(opts?: unknown): Promise<string> }).create(createOpts)
        return await finish(childId, true)
      } catch (createError: unknown) {
        console.warn('[dsh-ext] creating fresh session via sessions.create failed:', createError)
        return { ok: false, reason: 'new-session-failed', message: createError instanceof Error ? createError.message : String(createError) }
      }
    }

    return { ok: false, reason: 'first-turn', message: props.firstTurnText }
  }

  if (undoAnchorSeq === undefined) {
    return { ok: false, reason: 'fork-failed', message: props.firstTurnText }
  }

  try {
    const childId = await props.sessions.fork({
      sessionId: props.sessionId as never,
      atSeq: undoAnchorSeq,
      increaseTitle: true,
    })
    return await finish(String(childId), false)
  } catch (forkError: unknown) {
    console.warn('[dsh-ext] the chat rewind failed:', forkError)
    return {
      ok: false,
      reason: 'fork-failed',
      message: props.forkFailedText(forkError instanceof Error ? forkError.message : String(forkError)),
    }
  }
}

/** Send the edited question into the branched session as its next turn. */
export async function resendEditedQuestion(
  sessions: ISessions,
  childId: string,
  text: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  let binding = sessions.binding(childId as never)
  if (binding?.session === undefined) {
    await new Promise(resolve => setTimeout(resolve, 50))
    binding = sessions.binding(childId as never)
  }
  const sent = await binding?.session
    .prompt([{ type: 'text', text }], 'queue')
    .catch((promptError: unknown) => {
      console.warn('[dsh-ext] re-sending the edited question failed:', promptError)
      return undefined
    })
  if (sent === undefined || sent.ok !== true) {
    const detail = sent !== undefined && sent.ok === false ? sent.error?.message : undefined
    return { ok: false, message: detail ?? 'prompt rejected' }
  }
  return { ok: true }
}

/** The durable text of a user message node's content blocks. */
export function userTextOf(content: readonly unknown[]): string {
  let text = ''
  for (const block of content) {
    if (typeof block === 'object' && block !== null && (block as { type?: unknown }).type === 'text') {
      const value = (block as { text?: unknown }).text
      if (typeof value === 'string') text += value
    }
  }
  return text
}
