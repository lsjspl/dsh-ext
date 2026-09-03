import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import { callApi } from './api.ts'
import type { TurnInfoView } from '../shared/api-contract.ts'

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
  | { readonly ok: false; readonly reason: 'no-sessions' | 'restore-failed' | 'fork-failed' | 'new-session-failed' | 'first-turn'; readonly message: string }

/** The workspaces face the first-turn fallback needs (host's `ctx.workspaces`). */
export interface WorkspacesFace {
  /** Connect a workspace to its reusable or fresh blank session. */
  connectWorkspace(workspaceId: string): Promise<string>
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
  if (props.checkpointId === undefined) {
    return { ok: false, reason: 'no-sessions', message: props.firstTurnText }
  }
  const restore = await callApi('/checkpoints/restore', {
    body: { id: props.checkpointId, session: props.sessionId, confirm: true },
  })
  if (!restore.ok) return { ok: false, reason: 'restore-failed', message: restore.message }

  if (undoAnchorSeq === undefined) {
    // First turn: cut nothing — arrive in a fresh session on the same project.
    const workspaceId = props.workspace !== undefined ? props.workspaceIdOf?.(props.workspace) : undefined
    if (props.workspaces !== undefined && workspaceId !== undefined) {
      try {
        const childId = await props.workspaces.connectWorkspace(workspaceId)
        props.sessions.open(childId as never)
        return { ok: true, childId, fresh: true }
      } catch (startError: unknown) {
        console.warn('[dsh-dev-tool-ext] starting the fresh session failed:', startError)
        return { ok: false, reason: 'new-session-failed', message: startError instanceof Error ? startError.message : String(startError) }
      }
    }
    return { ok: false, reason: 'first-turn', message: props.firstTurnText }
  }

  try {
    const childId = await props.sessions.fork({
      sessionId: props.sessionId as never,
      atSeq: undoAnchorSeq,
      increaseTitle: true,
    })
    props.sessions.open(childId as never)
    return { ok: true, childId: String(childId), fresh: false }
  } catch (forkError: unknown) {
    console.warn('[dsh-dev-tool-ext] the chat fork after restore failed:', forkError)
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
  const binding = sessions.binding(childId as never)
  const sent = await binding?.session
    .prompt([{ type: 'text', text }], 'queue')
    .catch((promptError: unknown) => {
      console.warn('[dsh-dev-tool-ext] re-sending the edited question failed:', promptError)
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
