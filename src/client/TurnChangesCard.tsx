import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Modal, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import { callApi } from './api.ts'
import { ChevronIcon, UndoIcon, FolderIcon, VscodeIcon, IdeaIcon } from './icons.tsx'
import { FileIcon } from './file-icons.tsx'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { useResource } from './use-resource.ts'
import { useClientConfig } from './use-client-config.ts'
import { rewindTurn } from './rewind.ts'
import { useTurnInfo as useTurnInfoStore } from './turn-info-store.ts'
import { currentPanelScope, openPanelTab, type TabKind } from './tabs.ts'
import { setPanelOpen } from './panel-state.ts'
import type { OpenEditorResult, RestorePreview, TurnInfoView } from '../shared/api-contract.ts'

/**
 * The per-turn changes card, docked at the end of each turn in the chat.
 *
 * This replaces the old per-answer "回滚" button, whose single action carried
 * three meanings (what changed? what gets restored? what happens to the chat?).
 * The card answers all three on its face: the file list IS what the turn
 * changed, 撤销 restores exactly those files and rewinds the branch to before
 * the turn, and 编辑 rewrites the turn's question and re-answers it — the two
 * verbs a user actually wants after reading an answer.
 *
 * The seat is `conversation.chat.turnTail`, the host's own completed-turn
 * footer chain (the row that carries the answer's copy/branch actions), so the
 * card sits under the answer without replacing anything.
 *
 * The chat rewind is the host's own fork: cut at the previous turn's `turn/end`
 * and open the child — no page reload, and the original session keeps every
 * later answer. A session's first turn has no earlier boundary to cut at, so
 * its actions stay disabled with that reason in the tooltip.
 *
 * ## Polling discipline
 *
 * The data is tracked with a SEQUENTIAL adaptive loop, not a fixed interval
 * that fires `reload()`: an interval can abort the request it just launched
 * when the server answers slower than the interval, and a card polling every
 * four seconds against a busy server then never sees a response at all. The
 * loop awaits each answer first — 2s cadence while the turn is running or the
 * data has not landed, 10s once settled — and reads nothing but the shadow git
 * (the endpoint's git-only path). The chat-side fields (question text, fork
 * anchor) cost a session-log read, so they are fetched once, on demand, when a
 * dialog opens.
 */

/** Summary styling for the ± line counts, in git's own colours. */
const countStyle = (color: string) => ({
  fontSize: 12,
  fontFamily: 'ui-monospace, monospace',
  color,
} as const)

function dirOf(path: string): string {
  const slash = path.lastIndexOf('/')
  return slash < 0 ? '' : path.slice(0, slash + 1)
}

/**
 * Compare two workspace paths as the same project regardless of casing or a
 * trailing separator. Windows and the host's workspace registry can render the
 * same folder as `C:\proj`, `c:\proj\`, or `C:/proj`; the first-turn undo
 * fallback uses this only to match a path to a registered workspace id, so a
 * loose comparison is the safe direction (it never matches two DIFFERENT
 * projects, only the same one written differently).
 */
function normalizeWorkspacePath(path: string | undefined): string {
  if (path === undefined) return ''
  return path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

/**
 * Archive a session into the bin by marking it with the host's own archive set.
 * This is how undo/edit removes the original session from the sidebar: the host
 * hides it from grouping surfaces but keeps its log, and the recycle bin lists
 * it. Best-effort — returns false when the feature is off or the call fails, so
 * a first-turn undo still succeeds (the fresh session is already open) and
 * simply leaves the original in place.
 */
async function trashSession(sessionId: string, archive: (id: string) => Promise<unknown>): Promise<boolean> {
  try {
    await archive(sessionId)
    return true
  } catch (error: unknown) {
    console.warn('[dsh-dev-tool-ext] archiving the original session failed:', error)
    return false
  }
}

function nameOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/**
 * The card's own error boundary, wrapping the framework's.
 *
 * The tail seat is elect-one: when this card crashes, the framework's boundary
 * renders a dead cell that also takes the host's deliverables row down with
 * it. Catching here means one broken card costs exactly itself — the row
 * behind it in the election would have rendered had the card declined instead
 * of crashed (an election happens before mounting, so a crash is the only way
 * to lose that property; degrading to null inside is the closest repair).
 */
export class CardBoundary extends Component<{ children: ReactNode }, { failed: boolean; message: string }> {
  state = { failed: false, message: '' }
  static getDerivedStateFromError(error: Error) {
    return { failed: true, message: error.message }
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error('[dsh-dev-tool-ext] the turn-changes card crashed and hid itself:', error, info)
  }
  render() {
    if (this.state.failed) {
      // TEMP diagnostics: visible instead of silent-null.
      return (
        <div style={{ border: '1px solid #f59e0b', borderRadius: 8, padding: '4px 8px', margin: '6px 0', fontSize: 11, color: '#f59e0b' }}>
          {`[card-crash] ${this.state.message.slice(0, 300)}`}
        </div>
      )
    }
    return this.props.children
  }
}

export function TurnChangesCard(props: {
  sessionId: string
  turn: number
  /** The host's own TurnLocation status — the truth about whether this turn ended. */
  status: 'open' | 'closed' | 'unknown'
  /** Workspace rows from the host's global feed, for the first-turn fallback. */
  workspaceItems?: readonly { workspaceId: string; path: string }[]
  /** The host's workspaces service, for the first-turn fresh-session fallback and the undo archive. */
  workspaces?: { connectWorkspace(workspaceId: string): Promise<string>; archiveSession(sessionId: string): Promise<void> }
  /** True while the plugin config is still loading; renders the placeholder only. */
  disabled?: boolean
  sessions?: ISessions
}) {
  const t = useT()
  const turn = Number(props.turn)
  const [expanded, setExpanded] = useState(false)
  const [dialog, setDialog] = useState<'none' | 'undo'>('none')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  // Which file row's open-options menu is expanded, and the external-launch
  // failure (keyed by a per-show sequence so a re-show restarts the Toast fade).
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null)
  const [failure, setFailure] = useState<{ text: string; seq: number } | undefined>(undefined)

  const detailRoute = `/checkpoints/turn-info?session=${encodeURIComponent(props.sessionId)}&turn=${turn}&detail=1`

  // Turn info lives in the module-level store (`turn-info-store.ts`): the tail
  // seat gets remounted by the host's own render churn, and component-local
  // fetch state would die with each unmount — the card would refetch from
  // zero and reappear late. The store outlives the component, so a remount
  // shows the data that already landed.
  const info = useTurnInfoStore(props.sessionId, turn).data

  // The chat-side fields, one read when a dialog opens. The dialog closing
  // aborts the read; reopening starts a fresh one.
  const detail = useResource<TurnInfoView>(detailRoute, dialog !== 'none')

  // The undo dialog's affected-path preview. Same on-demand contract.
  const preview = useResource<RestorePreview>(
    dialog === 'undo' && info?.checkpointId !== undefined
      ? `/checkpoints/preview?id=${encodeURIComponent(info.checkpointId)}&session=${encodeURIComponent(props.sessionId)}`
      : '/checkpoints/preview',
    dialog === 'undo' && info?.checkpointId !== undefined,
  )

  if (!Number.isSafeInteger(turn)) return null
  const data = info
  // The seat is elect-one: while this component holds the slot it must render
  // a face even when it has nothing to say yet (config loading, first probe in
  // flight), because returning null hands the slot to nothing and the card
  // never comes back. The quiet placeholder is that face — data arriving a
  // beat later swaps it in place.
  if (props.disabled === true || data === undefined) {
    return (
      <div
        data-dsh-plugin="dsh-dev-tool-ext"
        data-dsh-part="turn-changes"
        style={{
          border: `1px solid color-mix(in srgb, ${token.border} 60%, transparent)`,
          borderRadius: 10,
          padding: '5px 10px',
          marginTop: 6,
          fontSize: 12,
          color: token.textMuted,
        }}
      >
        {t('turn.checking')}
      </div>
    )
  }
  if (data.checkpointId === undefined || data.files.length === 0) return null

  // The buttons wait only on facts the client already has. Whether this turn
  // CAN be cut (a previous turn/end exists in the durable log) is learned from
  // the dialog's detail read. The rewind engine handles the session's FIRST
  // turn specially: with no earlier boundary to cut at it restores the files
  // and opens a fresh session on the same workspace (see rewindTurn), so the
  // first turn is NOT uncuttable — its undo must stay clickable, not disabled.
  const running = props.status === 'open'
  const detailReady = detail.data !== undefined
  // Only truly blocked when we cannot rewind at all: no sessions service, or
  // the detail read failed so we have no undo anchor to reason about. A first
  // turn (undoAnchorSeq undefined) is allowed through to the fallback path.
  const canRewind = props.sessions !== undefined && detailReady
  const firstTurn = detail.data !== undefined && detail.data.undoAnchorSeq === undefined
  const actionable = !running && props.sessions !== undefined

  /** Open a workspace-relative path in the side panel, revealing it if closed. */
  const openInPanel = (kind: TabKind, path: string) => {
    const scope = currentPanelScope()
      ?? (data.workspace.length > 0 ? data.workspace : `session:${props.sessionId}`)
    openPanelTab(scope, kind, path)
    setPanelOpen(true)
  }

  /**
   * Open a workspace-relative path in an external editor (VS Code / IDEA) or the
   * system file explorer. Delegates to the same `/explorer/open-editor` endpoint
   * the session header launcher uses, so the two surfaces cannot drift. A failed
   * launch shows a Toast — a card row has no panel beneath it to print into.
   */
  const openExternal = async (path: string, editor: 'explorer' | 'vscode' | 'idea') => {
    const query = [
      `session=${encodeURIComponent(props.sessionId)}`,
      `path=${encodeURIComponent(path)}`,
      `editor=${editor}`,
    ].join('&')
    const result = await callApi<OpenEditorResult>(`/explorer/open-editor?${query}`)
    if (result.ok) return
    setFailure({ text: t('explorer.openEditorFailed', { message: result.message }), seq: Date.now() })
  }

  /**
   * Restore the files, then rewind the chat to before this turn. Delegates to
   * the shared rewind engine (`rewind.ts`) — the bubble edit pencil runs the
   * same three steps, so the two surfaces cannot drift. The workspace lookup
   * powers the first-turn fallback: with nothing to fork to, the "branch" is a
   * fresh session on the same project.
   */
  const workspaceItems = props.workspaceItems
  const rewind = async (): Promise<{ ok: true; childId: string } | { ok: false; message: string }> => {
    if (props.sessions === undefined) return { ok: false, message: t('turn.firstTurnNoFork') }
    const result = await rewindTurn({
      sessions: props.sessions,
      workspaces: props.workspaces,
      sessionId: props.sessionId,
      checkpointId: data.checkpointId,
      detail: detail.data,
      forkFailedText: message => t('cp.forkFailed', { message }),
      firstTurnText: t('turn.firstTurnNoFork'),
      workspace: data.workspace,
      // The backend's workspace path and the host's registered workspace path
      // can differ in casing or a trailing separator even when they are the
      // same project. Match loosely (case-insensitive, ignore a trailing slash)
      // so the first-turn fallback finds the id it needs to open a fresh
      // session; exact-match-only used to leave it undefined and fail the undo.
      workspaceIdOf: (path) => {
        const target = normalizeWorkspacePath(path)
        return workspaceItems?.find(item => normalizeWorkspacePath(item.path) === target)?.workspaceId
      },
    })
    return result
  }

  const undo = async () => {
    setBusy(true)
    setError(undefined)
    const result = await rewind()
    setBusy(false)
    if (!result.ok) { setError(result.message); return }
    // After any successful undo the user is now in a branch (a fork for a
    // normal turn, a fresh session for the first turn). The original session's
    // remaining history was carried into that branch, so the original is no
    // longer needed — archive it into the host's archive set (hidden from the
    // sidebar, listed in the recycle bin), whether this was a fork or a
    // first-turn fresh start. Best-effort: a disabled session admin feature
    // must not make the undo itself fail. Archiving happens AFTER the new
    // session is live so a failed archive only leaves the original in the
    // list, never strands the user without a session.
    const trashed = await trashSession(props.sessionId, async (id) => { await props.workspaces?.archiveSession(id as never) })
    // Archiving marks the session in the host's archive set; the host refreshes
    // its list baseline on the next reconnect. The narrow ISessions face hides
    // refresh; call it only if the runtime object actually has it (a fallback
    // that silently keeps the stale list is still better than crashing).
    if (trashed) {
      const sessionsRef = props.sessions as unknown as { refresh?: () => Promise<void> }
      await sessionsRef.refresh?.().catch(() => {})
    }
    if (!trashed) setFailure({ text: t('turn.trashFailed'), seq: Date.now() })
    setDialog('none')
  }

  const openUndo = () => {
    setError(undefined)
    setDialog('undo')
  }

  return (
    <>
      <div
        data-dsh-plugin="dsh-dev-tool-ext"
        data-dsh-part="turn-changes"
        style={{
          border: `1px solid ${token.border}`,
          borderRadius: 10,
          background: token.surface,
          padding: '6px 10px',
          marginTop: 6,
          fontSize: 13,
          color: token.text,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 28 }}>
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={t('turn.toggleList')}
            onClick={() => { setExpanded(value => !value) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: 2,
              border: 'none', background: 'transparent', color: token.textSecondary,
              cursor: 'pointer', font: 'inherit', fontWeight: 500, flex: '0 1 auto', minWidth: 0,
            }}
          >
            <ChevronIcon size={13} open={expanded} />
            <span style={{ whiteSpace: 'nowrap' }}>{t('turn.filesChanged', { n: data.files.length })}</span>
          </button>
          <span style={countStyle(token.success)}>+{data.added}</span>
          <span style={countStyle(token.danger)}>-{data.removed}</span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            disabled={!actionable}
            title={running ? t('turn.stillRunning') : t('turn.undo')}
            aria-label={t('turn.undo')}
            onClick={openUndo}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px',
              border: 'none', borderRadius: 6, background: 'transparent',
              color: actionable ? token.textSecondary : 'color-mix(in srgb, currentColor 35%, transparent)',
              cursor: actionable ? 'pointer' : 'default', fontSize: 12, whiteSpace: 'nowrap',
            }}
          >
            <UndoIcon size={14} />
            {t('turn.undo')}
          </button>
        </div>

        {expanded && (
          <ul style={{ listStyle: 'none', margin: '2px 0 4px', padding: 0, display: 'flex', flexDirection: 'column' }}>
            {data.files.map(file => {
              const slash = file.path.lastIndexOf('/')
              return (
                <li
                  key={file.path}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: 27, padding: '1px 0', borderTop: `1px solid color-mix(in srgb, ${token.border} 45%, transparent)` }}
                >
                  <FileIcon size={15} name={nameOf(file.path)} />
                  <button
                    type="button"
                    onClick={() => { openInPanel('diff', file.path) }}
                    title={t('explorer.preview')}
                    style={{
                      font: 'inherit', color: 'inherit', textAlign: 'left',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
                    }}
                  >{nameOf(file.path)}</button>
                  {slash > 0 && (
                    <span style={{ fontSize: 12, color: token.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dirOf(file.path)}
                    </span>
                  )}
                  <span style={countStyle(token.success)}>+{file.added}</span>
                  <span style={countStyle(token.danger)}>-{file.removed}</span>
                  <span style={{ flex: 1 }} />
                  <button
                    type="button"
                    onClick={() => { openInPanel('diff', file.path) }}
                    title={t('explorer.preview')}
                    style={{ ...buttonStyle, height: 22, minHeight: 0, padding: '0 9px', fontSize: 12, borderRadius: 6 }}
                  >
                    {t('turn.review')}
                  </button>
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <button
                      type="button"
                      onClick={() => { openInPanel('editor', file.path) }}
                      title={t('explorer.preview')}
                      style={{ ...buttonStyle, height: 22, minHeight: 0, padding: '0 9px', fontSize: 12, borderRadius: '6px 0 0 6px', borderRightWidth: 0 }}
                    >
                      {t('turn.open')}
                    </button>
                    <button
                      type="button"
                      aria-expanded={openMenuFor === file.path}
                      aria-label={t('explorer.openEditor')}
                      onClick={() => { setOpenMenuFor(openMenuFor === file.path ? null : file.path) }}
                      style={{ ...buttonStyle, height: 22, minHeight: 0, padding: '0 5px', fontSize: 12, borderRadius: '0 6px 6px 0' }}
                    >
                      <ChevronIcon size={11} open={openMenuFor === file.path} />
                    </button>
                    {openMenuFor === file.path && (
                      <>
                        <div
                          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                          onClick={() => { setOpenMenuFor(null) }}
                        />
                        <div
                          style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 4,
                            background: 'var(--dsw-alias-bg-layer-2, #1a1d24)',
                            border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))',
                            borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            minWidth: 170, zIndex: 1000, overflow: 'hidden', padding: 2,
                          }}
                        >
                          {([
                            { type: 'explorer' as const, icon: FolderIcon, label: t('explorer.openWith.explorer') },
                            { type: 'vscode' as const, icon: VscodeIcon, label: t('explorer.openWith.vscode') },
                            { type: 'idea' as const, icon: IdeaIcon, label: t('explorer.openWith.idea') },
                          ]).map(({ type, icon: Icon, label }) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => { setOpenMenuFor(null); void openExternal(file.path, type) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                                padding: '7px 10px', border: 'none', borderRadius: 6,
                                background: 'transparent', color: 'var(--dsw-alias-label-primary, #e8eaed)',
                                fontSize: 12, cursor: 'pointer', textAlign: 'left',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <Icon size={14} />
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {dialog !== 'none' && (
        <Modal
          title={t('turn.undoTitle')}
          open
          onClose={() => { if (!busy) setDialog('none') }}
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" disabled={busy} onClick={() => { setDialog('none') }} style={buttonStyle}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={busy || !canRewind}
                onClick={() => { void undo() }}
                style={{ ...buttonStyle, borderColor: token.danger, color: token.danger }}
              >
                {busy ? t('cp.restoring') : t('turn.undo')}
              </button>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {data.workspace.length > 0 && (
              <div style={{ fontSize: 11, color: token.textMuted }}>{t('cp.restoreWorkspace', { path: data.workspace })}</div>
            )}
            <p style={{ margin: 0, lineHeight: 1.55, color: token.textSecondary }}>
              {t('turn.undoHint', { n: data.files.length })}
            </p>
            {preview.data !== undefined && preview.data.unprotected.length > 0 && (
              <Notice kind="error">{t('cp.unprotected', { n: preview.data.unprotected.length })}</Notice>
            )}
            {detail.error !== undefined && <Notice kind="error">{detail.error}</Notice>}
            {firstTurn && <Notice kind="info">{t('turn.firstTurnUndo')}</Notice>}
            {error !== undefined && <Notice kind="error">{error}</Notice>}
          </div>
        </Modal>
      )}

      {failure !== undefined && (
        <Toast key={failure.seq} text={failure.text} onDone={() => { setFailure(undefined) }} />
      )}
    </>
  )
}
