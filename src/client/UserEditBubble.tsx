import { useState } from 'react'
import { writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import { callApi } from './api.ts'
import { CheckIcon, EditIcon } from './icons.tsx'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { rewindTurn, resendEditedQuestion, userTextOf, normalizeWorkspacePath, trashSession, type WorkspacesFace } from './rewind.ts'
import type { TurnInfoView } from '../shared/api-contract.ts'

/**
 * The user message bubble, with the hover pencil that edits the question —
 * the composition of 图1/图2.
 *
 * The host's own bubble renderer occupies the `user` cell of the keyed
 * `conversation.chat.node` seat and passes no edit affordance, and that cell
 * cannot be extended from outside — so this registration SHADOWS it at a
 * lower priority and re-draws the same composition (bubble + hover action
 * icons) with one more icon. The trade is stated plainly: a host redesign of
 * the bubble's internals is not inherited — this file owns the bubble's look —
 * and the mirror benefit is that the host cannot take the edit affordance
 * away either.
 *
 * Clicking the pencil turns THIS bubble in place into the composer of 图1:
 * the same rounded box, textarea, and send button, at the message's own
 * position in the flow. Sending maps the message's seq to its turn, restores
 * the files to before that turn, cuts the branch at the previous turn end
 * (the host's own fork — the original session keeps everything), and
 * re-answers with the edited text. All of it reuses the card's rewind engine
 * (`rewind.ts`); nothing here duplicates it.
 */

/** The hover action icons under the bubble — copy, then edit. */
function BubbleActions(props: { text: string; onEdit: () => void; copied: boolean; onCopy: () => void }) {
  const t = useT()
  const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--dsw-alias-label-tertiary, ' + token.textMuted + ')',
    cursor: 'pointer',
    padding: 0,
  } as const
  return (
    <div
      data-dsh-part="user-bubble-actions"
      style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 4, marginRight: 2 }}
    >
      <button
        type="button"
        aria-label={props.copied ? t('turn.copied') : t('turn.copy')}
        title={props.copied ? t('turn.copied') : t('turn.copy')}
        onClick={props.onCopy}
        style={iconStyle}
      >
        {props.copied ? <CheckIcon size={15} /> : (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5.2" y="5.2" width="8" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.8 3.2H4A1.8 1.8 0 0 0 2.2 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label={t('turn.edit')}
        title={t('turn.editTitle')}
        onClick={props.onEdit}
        style={iconStyle}
      >
        <EditIcon size={15} />
      </button>
    </div>
  )
}

const PENCIL_SIZE = 14

export function UserEditBubble(props: {
  /** The framework-injected session id of the scoped slot. */
  sessionId: string
  sessions: ISessions
  /** The user node from the chat store: seq, time, content blocks. */
  node: { seq: number; time: number; content: readonly unknown[] }
  /** The framework's global workspace feed; enables the first-turn fallback. */
  useWorkspaces?: <T>(select: (state: { items: readonly { workspaceId: string; path: string }[] }) => T) => T
  /** The host's workspaces service, for the first-turn fresh-session fallback and the undo archive. */
  workspaces?: WorkspacesFace & { archiveSession?(sessionId: string): Promise<void> }
}) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const text = userTextOf(props.node.content)
  const workspaceItems = props.useWorkspaces?.(state => state.items)
    ?? props.workspaces?.list?.getSnapshot?.()?.items

  const startEdit = () => {
    setDraft(text)
    setError(undefined)
    setEditing(true)
  }

  const copy = () => {
    void writeClipboard(text).then(ok => {
      if (!ok) return
      setCopied(true)
      window.setTimeout(() => { setCopied(false) }, 1000)
    })
  }

  const send = async () => {
    const value = draft.trim()
    if (value.length === 0 || busy) return
    setBusy(true)
    setError(undefined)
    // Map this message's durable seq to its turn, with the chat fields the
    // rewind needs. One endpoint call; the server owns the log mapping.
    const mapped = await callApi<{ turn: number; checkpointId?: string; undoAnchorSeq?: number; workspace?: string }>(
      `/checkpoints/turn-info?session=${encodeURIComponent(props.sessionId)}&seq=${props.node.seq}&detail=1`,
    )
    if (!mapped.ok) {
      setBusy(false)
      setError(mapped.message)
      return
    }
    const info = mapped.value as TurnInfoView & { turn: number }
    const result = await rewindTurn({
      sessions: props.sessions,
      workspaces: props.workspaces,
      sessionId: props.sessionId,
      checkpointId: info.checkpointId,
      detail: info,
      forkFailedText: message => t('cp.forkFailed', { message }),
      firstTurnText: t('turn.firstTurnNoFork'),
      workspace: info.workspace,
      workspaceIdOf: path => {
        const target = normalizeWorkspacePath(path)
        return workspaceItems?.find(item => normalizeWorkspacePath(item.path) === target)?.workspaceId
      },
    })
    if (!result.ok) {
      setBusy(false)
      setError(result.message)
      return
    }
    const sent = await resendEditedQuestion(props.sessions, result.childId, value)
    setBusy(false)
    if (!sent.ok) setError(t('turn.editSendFailed', { message: sent.message }))
    else {
      // The original session's history was carried into the new branch, so it is
      // no longer needed — archive it into the host's archive set (hidden from
      // the sidebar, listed in the recycle bin). Best-effort: a failed archive
      // only leaves the original in the list, never fails the re-answer.
      try {
        const trashed = await trashSession(props.sessionId, async (id) => {
          await props.workspaces?.archiveSession?.(id as never)
        })
        if (trashed) {
          const sessionsRef = props.sessions as unknown as { refresh?: () => Promise<void> }
          await sessionsRef.refresh?.().catch(() => {})
        }
      } catch (archiveError: unknown) {
        console.warn('[dsh-ext] archiving the original session after edit failed:', archiveError)
      }
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div data-dsh-plugin="dsh-ext" data-dsh-part="user-edit" style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '6px 0 10px' }}>
        <div
          style={{
            borderRadius: 22,
            border: `1px solid ${token.border}`,
            background: 'var(--dsw-specific-bubble, var(--dsw-alias-bg-layer-2, transparent))',
            padding: '10px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <textarea
            value={draft}
            autoFocus
            disabled={busy}
            rows={Math.min(10, Math.max(2, draft.split('\n').length))}
            onChange={event => { setDraft(event.currentTarget.value) }}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
              if (event.key === 'Escape' && !busy) setEditing(false)
            }}
            style={{
              font: 'inherit',
              fontSize: 14,
              lineHeight: 1.5,
              color: token.text,
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              padding: 0,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              disabled={busy}
              onClick={() => { setEditing(false) }}
              style={{ ...buttonStyle, height: 26, width: 26, borderRadius: 999, padding: 0, border: 'none', background: 'transparent', color: token.textSecondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={t('common.cancel')}
              title={t('common.cancel')}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              disabled={busy || draft.trim().length === 0}
              onClick={() => { void send() }}
              title={busy ? t('cp.restoring') : t('turn.sendEdit')}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 999, border: 'none', padding: 0,
                background: 'var(--dsw-alias-brand-primary, ' + token.accent + ')',
                color: 'var(--dsw-alias-bg-base, #fff)',
                cursor: busy || draft.trim().length === 0 ? 'default' : 'pointer',
                opacity: busy || draft.trim().length === 0 ? 0.45 : 1,
              }}
            >
              {busy
                ? (
                  // A fixed 30px circle while restoring: text like 恢复中 would
                  // stretch it mid-edit, so the state is just a spinning ring.
                  <span
                    aria-hidden="true"
                    style={{
                      width: 13,
                      height: 13,
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'dsh-devtool-spin 900ms linear infinite',
                    }}
                  />
                )
                : (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 13V3M8 3L3.8 7.2M8 3l4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              <style>{'@keyframes dsh-devtool-spin { to { transform: rotate(360deg) } }'}</style>
            </button>
          </div>
        </div>
        {error !== undefined && <Notice kind="error">{error}</Notice>}
      </div>
    )
  }

  return (
    <div
      data-dsh-plugin="dsh-ext"
      data-dsh-part="user-bubble"
      className="__dsh_user_row__"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', margin: '8px 0' }}
    >
      <style>{`
        .__dsh_user_row__ [data-dsh-part="user-bubble-actions"] { opacity: 0; transition: opacity 120ms ease; }
        .__dsh_user_row__:hover [data-dsh-part="user-bubble-actions"] { opacity: 1; }
      `}</style>
      {text.length > 0 && (
        <div
          style={{
            maxWidth: 'min(525px, 82%)',
            background: 'var(--dsw-specific-bubble, var(--dsw-alias-bg-layer-2, transparent))',
            color: token.text,
            borderRadius: 22,
            padding: '10px 16px',
            fontSize: 16,
            lineHeight: '24px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
          }}
        >
          {text}
        </div>
      )}
      <BubbleActions text={text} copied={copied} onCopy={copy} onEdit={startEdit} />
    </div>
  )
}
