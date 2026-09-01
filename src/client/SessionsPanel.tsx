import { useState } from 'react'
import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { SessionRow, TrashRow } from '../shared/api-contract.ts'

/**
 * Feature 6 — delete session records, with a restorable trash.
 *
 * Deleting is behind a per-row confirmation rather than a modal: the rows are
 * small and a mis-click on a list of sessions is easy, so the confirm replaces
 * the row's own button instead of covering the page.
 */

interface SessionsResponse {
  readonly sessions: readonly SessionRow[]
  readonly trash: readonly TrashRow[]
}

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function stamp(at: number): string {
  return Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString() : 'unknown'
}

export function SessionsPanel(props: { enabled: boolean; trashEnabled: boolean }) {
  const t = useT()
  const list = useResource<SessionsResponse>('/sessions', props.enabled)
  const command = useCommand(list.reload)
  const [confirming, setConfirming] = useState<string | undefined>(undefined)
  const [note, setNote] = useState<string | undefined>(undefined)

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('sessions.off')}</div>
  }

  const trash = list.data?.trash ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {list.error !== undefined && <Notice kind="error">{list.error}</Notice>}
      {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}
      {note !== undefined && <Notice kind="info">{note}</Notice>}

      {list.data === undefined && list.error === undefined && (
        <div style={{ fontSize: 12, color: token.textMuted }}>{t('common.loading')}</div>
      )}

      {list.data !== undefined && list.data.sessions.length === 0 && (
        <div style={{ fontSize: 12, color: token.textMuted }}>{t('sessions.none')}</div>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {(list.data?.sessions ?? []).map(row => (
          <li
            key={row.id}
            style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '5px 2px', borderBottom: `1px solid ${token.border}` }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.title}
              </span>
              <span style={{ fontSize: 10, color: token.textMuted }}>
                {stamp(row.updatedAt)} · {size(row.sizeBytes)}
                {row.workspace !== undefined && ` · ${row.workspace}`}
              </span>
            </span>

            {confirming === row.id ? (
              <>
                <span style={{ fontSize: 11, color: token.danger }}>
                  {t(props.trashEnabled ? 'sessions.confirmTrash' : 'sessions.confirmDelete')}
                </span>
                <button
                  type="button"
                  disabled={command.busy}
                  onClick={() => {
                    void command.run('/sessions/delete', { sessionId: row.id }).then((ok) => {
                      setConfirming(undefined)
                      if (ok) {
                        setNote(props.trashEnabled
                          ? t('sessions.movedToTrash')
                          : t('sessions.deleted'))
                      }
                    })
                  }}
                  style={{ ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger }}
                >{t('common.yes')}</button>
                <button type="button" onClick={() => { setConfirming(undefined) }} style={{ ...buttonStyle, fontSize: 11 }}>{t('common.no')}</button>
              </>
            ) : (
              <button
                type="button"
                disabled={command.busy}
                onClick={() => { setConfirming(row.id) }}
                style={{ ...buttonStyle, fontSize: 11 }}
              >{t('common.delete')}</button>
            )}
          </li>
        ))}
      </ul>

      {trash.length > 0 && (
        <div style={{ paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 12 }}>{t('sessions.trashCount', { n: trash.length })}</strong>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              disabled={command.busy}
              onClick={() => { void command.run('/sessions/trash/purge', { all: true }) }}
              style={{ ...buttonStyle, fontSize: 11, borderColor: token.danger, color: token.danger }}
            >{t('sessions.emptyTrash')}</button>
          </div>
          <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
            {trash.map(row => (
              <li key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '4px 2px' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.title}
                  </span>
                  <span style={{ fontSize: 10, color: token.textMuted }}>{t('sessions.deletedAt', { when: stamp(row.deletedAt) })} · {size(row.sizeBytes)}</span>
                </span>
                <button
                  type="button"
                  disabled={command.busy}
                  onClick={() => {
                    void command.run('/sessions/restore', { trashId: row.id }).then((ok) => {
                      if (ok) setNote(t('sessions.restored'))
                    })
                  }}
                  style={{ ...buttonStyle, fontSize: 11 }}
                >{t('common.restore')}</button>
                <button
                  type="button"
                  disabled={command.busy}
                  onClick={() => { void command.run('/sessions/trash/purge', { trashId: row.id }) }}
                  style={{ ...buttonStyle, fontSize: 11 }}
                >{t('sessions.deleteForever')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
