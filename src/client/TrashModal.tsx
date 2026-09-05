import { useState, type CSSProperties } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { SessionRow, TrashRow } from '../shared/api-contract.ts'

/**
 * The recycle-bin popover, opened from the sidebar footer's bin entry.
 *
 * Redesigned to match the host DSH native settings card style:
 * - Module platform card background
 * - 10px rounded card borders with subtle dividers
 * - Native icon buttons and clean metadata badges
 * - Safe destructive action confirmation
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
  return Number.isFinite(at) && at > 0 ? new Date(at).toLocaleString() : '未知时间'
}

const secondaryBtnStyle: CSSProperties = {
  ...buttonStyle,
  padding: '6px 14px',
  fontSize: 12,
  borderRadius: 6,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
  color: token.text,
  borderColor: token.border,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 120ms ease',
}

const dangerBtnStyle: CSSProperties = {
  ...buttonStyle,
  padding: '5px 12px',
  fontSize: 12,
  borderRadius: 6,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'rgba(239, 68, 68, 0.08)',
  color: 'var(--dsw-alias-state-danger, #ef4444)',
  borderColor: 'rgba(239, 68, 68, 0.25)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 120ms ease',
}

const primaryDangerBtnStyle: CSSProperties = {
  ...buttonStyle,
  padding: '6px 16px',
  fontSize: 12.5,
  borderRadius: 6,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'var(--dsw-alias-state-danger, #ef4444)',
  color: '#ffffff',
  borderColor: 'var(--dsw-alias-state-danger, #ef4444)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 120ms ease',
}

export function TrashModal(props: { open: boolean; onClose: () => void }) {
  const t = useT()
  const list = useResource<SessionsResponse>('/sessions', props.open)
  const command = useCommand(list.reload)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  if (!props.open) return null

  const trash = list.data?.trash ?? []

  const onConfirmClose = () => {
    if (!busy && !command.busy) setConfirm(null)
  }

  const onDeleteConfirmed = () => {
    if (confirm === null || busy || command.busy) return
    const body = confirm.kind === 'all' ? { all: true } : { sessionId: confirm.id }
    setBusy(true)
    void command.run('/sessions/purge', body).finally(() => {
      list.reload()
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
        onClose={() => {
          if (!busy && !command.busy) props.onClose()
        }}
        footer={(
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div>
              {trash.length > 0 && (
                <button
                  type="button"
                  disabled={busy || command.busy}
                  onClick={() => { setConfirm({ kind: 'all' }) }}
                  style={dangerBtnStyle}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 4.5h11" />
                    <path d="M5.5 4.5V2.5h5v2" />
                    <path d="M4 4.5l.8 9.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L12 4.5" />
                  </svg>
                  <span>{t('sessions.emptyTrash')}</span>
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={busy || command.busy}
              onClick={props.onClose}
              style={secondaryBtnStyle}
            >
              {t('common.close')}
            </button>
          </div>
        )}
      >
        <style>{`
          .dsh-devtool-trash-card {
            width: min(640px, 92vw) !important;
            max-height: min(82vh, 680px) !important;
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '2px 0 4px' }}>
          {list.data === undefined && list.error === undefined && (
            <div style={{ padding: 20, textAlign: 'center', color: token.textMuted, fontSize: 13 }}>
              {t('common.loading')}
            </div>
          )}

          {list.error !== undefined && <Notice kind="error">{list.error}</Notice>}
          {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}

          {list.data !== undefined && trash.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 16px',
                borderRadius: 10,
                background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.05)))',
                border: `1px solid ${token.border}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  color: token.textMuted,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 4.5h11" />
                  <path d="M5.5 4.5V2.5h5v2" />
                  <path d="M4 4.5l.8 9.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L12 4.5" />
                </svg>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: token.text, marginBottom: 4 }}>
                {t('sessions.trashEmpty')}
              </div>
              <div style={{ fontSize: 12, color: token.textMuted, maxWidth: 320, lineHeight: 1.5 }}>
                被撤销、归档或删除的历史会话会暂存在此，支持随时一键恢复或彻底销毁。
              </div>
            </div>
          )}

          {trash.length > 0 && (
            <div
              style={{
                borderRadius: 10,
                background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.06)))',
                border: `1px solid ${token.border}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'min(56vh, 460px)',
              }}
            >
              <div
                style={{
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  flex: '1 1 auto',
                }}
              >
                {trash.map((row, idx) => (
                  <div
                    key={row.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '11px 16px',
                      borderBottom: idx < trash.length - 1 ? `1px solid ${token.border}` : 'none',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.06))'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: '0 0 auto',
                          color: token.textMuted,
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.5 3h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5.5L2.5 14.5V4a1 1 0 0 1 1-1z" />
                        </svg>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: token.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: 3,
                          }}
                        >
                          {row.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 11, color: token.textMuted }}>
                          <span>{t('sessions.updatedAt', { when: stamp(row.updatedAt) })}</span>
                          <span>·</span>
                          <span style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.1))' }}>
                            {size(row.sizeBytes)}
                          </span>
                          {row.workspace !== undefined && (
                            <>
                              <span>·</span>
                              <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {row.workspace}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        disabled={command.busy}
                        onClick={() => {
                          void command.run('/sessions/restore', { sessionId: row.id })
                        }}
                        style={secondaryBtnStyle}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.5 6.5A5.5 5.5 0 1 1 4 11.5" />
                          <path d="M2.5 3v3.5H6" />
                        </svg>
                        <span>{t('common.restore')}</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy || command.busy}
                        onClick={() => { setConfirm({ kind: 'one', id: row.id, title: row.title }) }}
                        style={dangerBtnStyle}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.5 4.5h11" />
                          <path d="M5.5 4.5V2.5h5v2" />
                          <path d="M4 4.5l.8 9.2a1 1 0 0 0 1 .8h4.4a1 1 0 0 0 1-.8L12 4.5" />
                        </svg>
                        <span>{t('sessions.deleteForever')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {confirm !== null && (
        <Modal
          title={confirm.kind === 'all' ? t('sessions.emptyTrash') : t('sessions.deleteForever')}
          open
          onClose={onConfirmClose}
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                disabled={busy || command.busy}
                onClick={onConfirmClose}
                style={secondaryBtnStyle}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={busy || command.busy}
                onClick={onDeleteConfirmed}
                style={primaryDangerBtnStyle}
              >
                {busy ? t('common.loading') : (confirm.kind === 'all' ? '确认清空' : '确认删除')}
              </button>
            </div>
          )}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '6px 0 10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--dsw-alias-state-danger, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 1.5l6.5 12H1.5L8 1.5z" />
                <path d="M8 6v3.5" />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: token.text, paddingTop: 4 }}>
              {confirm.kind === 'all'
                ? t('sessions.emptyTrashConfirm')
                : t('sessions.deleteForeverConfirm', { title: confirm.title })}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
