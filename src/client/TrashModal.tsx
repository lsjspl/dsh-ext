import { useState } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { SessionRow, TrashRow } from '../shared/api-contract.ts'

/**
 * The recycle-bin popover, opened from the sidebar footer's bin entry.
 *
 * Session admin surfaces the host's archive set: sessions the user archived (or
 * that undo/edit moved to the bin by archiving them) are hidden from the sidebar
 * but kept on disk, and this modal shows them. Each row can be restored (the
 * archive flag is cleared, which broadcasts a live update so the session returns
 * to the sidebar immediately) or deleted for good (the artifact is removed and
 * the id dropped from the archive set). A footer button empties the whole bin.
 *
 * Deleting is irreversible, so both 清空 and 永久删除 ask for confirmation in a
 * second modal before they run.
 */

interface SessionsResponse {
  readonly sessions: readonly SessionRow[]
  readonly trash: readonly TrashRow[]
}

/** A pending destructive action awaiting confirmation. */
type Confirm =
  | { readonly kind: 'all' }
  | { readonly kind: 'one'; readonly id: string; readonly title: string }

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function stamp(at: number): string {
  return Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString() : 'unknown'
}

export function TrashModal(props: { open: boolean; onClose: () => void }) {
  const t = useT()
  // Enabled while open; the session admin feature being off reports an error,
  // which the modal shows rather than silently rendering an empty bin.
  const list = useResource<SessionsResponse>('/sessions', props.open)
  const command = useCommand(list.reload)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  if (!props.open) return null

  const trash = list.data?.trash ?? []

  const onConfirmClose = () => { if (!busy && !command.busy) setConfirm(null) }
  const onDeleteConfirmed = () => {
    if (confirm === null || busy || command.busy) return
    const body = confirm.kind === 'all' ? { all: true } : { sessionId: confirm.id }
    setBusy(true)
    void command.run('/sessions/purge', body).finally(() => {
      setBusy(false)
      setConfirm(null)
    })
  }

  return (
    <>
    <Modal
      title={t('sessions.trashCount', { n: trash.length })}
      open
      className="dsh-devtool-trash-card"
      onClose={() => { if (!busy && !command.busy) props.onClose() }}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            disabled={busy || command.busy || trash.length === 0}
            onClick={() => { setConfirm({ kind: 'all' }) }}
            style={{ ...buttonStyle, fontSize: 12, borderColor: token.danger, color: token.danger }}
          >
            {t('sessions.emptyTrash')}
          </button>
          <button type="button" disabled={busy || command.busy} onClick={props.onClose} style={buttonStyle}>
            {t('common.close')}
          </button>
        </div>
      )}
    >
      <style>{`.dsh-devtool-trash-card { width: min(560px, 92vw); max-height: min(80vh, 640px); } .dsh-devtool-trash-card .dsh-devtool-trash-body { max-height: min(56vh, 420px); }`}</style>
      <div className="dsh-devtool-trash-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
        {list.data === undefined && list.error === undefined && (
          <div style={{ color: token.textMuted }}>{t('common.loading')}</div>
        )}
        {list.data !== undefined && trash.length === 0 && (
          <div style={{ color: token.textMuted }}>{t('sessions.trashEmpty')}</div>
        )}
        {list.error !== undefined && <Notice kind="error">{list.error}</Notice>}
        {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto', flex: '1 1 auto', minHeight: 0, overscrollBehavior: 'contain' }}>
          {trash.map(row => (
            <li key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '5px 2px', borderBottom: `1px solid ${token.border}` }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
                <span style={{ fontSize: 10, color: token.textMuted }}>
                  {t('sessions.updatedAt', { when: stamp(row.updatedAt) })} · {size(row.sizeBytes)}
                  {row.workspace !== undefined && ` · ${row.workspace}`}
                </span>
              </span>
              <button
                type="button"
                disabled={command.busy}
                onClick={() => {
                  void command.run('/sessions/restore', { sessionId: row.id }).then((ok) => {
                    // Restoring removes the id from the host's in-memory archive
                    // set, which broadcasts a live update so the session returns
                    // to the sidebar immediately — no reload needed.
                  })
                }}
                style={{ ...buttonStyle, fontSize: 11, whiteSpace: 'nowrap' }}
              >{t('common.restore')}</button>
              <button
                type="button"
                disabled={busy || command.busy}
                onClick={() => { setConfirm({ kind: 'one', id: row.id, title: row.title }) }}
                style={{ ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger, whiteSpace: 'nowrap' }}
              >{t('sessions.deleteForever')}</button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>

    {confirm !== null && (
      <Modal
        title={confirm.kind === 'all' ? t('sessions.emptyTrash') : t('sessions.deleteForever')}
        open
        onClose={onConfirmClose}
        footer={(
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" disabled={busy || command.busy} onClick={onConfirmClose} style={buttonStyle}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={busy || command.busy}
              onClick={onDeleteConfirmed}
              style={{ ...buttonStyle, borderColor: token.danger, color: token.danger }}
            >
              {busy ? t('common.loading') : t('sessions.deleteForever')}
            </button>
          </div>
        )}
      >
        <div style={{ fontSize: 13, lineHeight: 1.55, color: token.textSecondary }}>
          {confirm.kind === 'all'
            ? t('sessions.emptyTrashConfirm')
            : t('sessions.deleteForeverConfirm', { title: confirm.title })}
        </div>
      </Modal>
    )}
    </>
  )
}
