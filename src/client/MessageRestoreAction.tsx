import { useState } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { callApi } from './api.ts'
import { RestoreIcon } from './icons.tsx'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useResource } from './use-resource.ts'
import { useT } from './use-locale.ts'
import type { MessageCheckpointView, RestorePreview } from '../shared/api-contract.ts'

/**
 * One finalized assistant answer's restore action.
 *
 * The backend maps this message id through the durable session log to its exact
 * turn, then to the checkpoint taken before that turn's first mutation. No time
 * proximity or DOM order is involved. Answers that did not mutate files render
 * no button.
 */
export function MessageRestoreAction(props: { messageId: string; sessionId: string }) {
  const t = useT()
  const route = `/checkpoints/for-message?session=${encodeURIComponent(props.sessionId)}&message=${encodeURIComponent(props.messageId)}`
  const resource = useResource<MessageCheckpointView>(route)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<RestorePreview | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const checkpoint = resource.data?.checkpoint
  const available = checkpoint !== undefined && checkpoint !== null

  // Every finalized answer gets the same action position. An answer that did
  // not mutate files keeps a disabled affordance instead of making the action
  // row jump or leaving the user wondering whether checkpoints are broken.
  const label = available ? t('cp.restoreAnswer') : t('cp.restoreAnswerUnavailable')

  const askRestore = async () => {
    if (checkpoint === undefined || checkpoint === null) return
    setOpen(true)
    setPreview(undefined)
    setError(undefined)
    const result = await callApi<RestorePreview>(`/checkpoints/preview?id=${encodeURIComponent(checkpoint.id)}&session=${encodeURIComponent(props.sessionId)}`)
    if (result.ok) setPreview(result.value)
    else setError(result.message)
  }

  const restore = async () => {
    if (checkpoint === undefined || checkpoint === null) return
    setBusy(true)
    setError(undefined)
    const result = await callApi('/checkpoints/restore', {
      body: {
        id: checkpoint.id,
        session: props.sessionId,
        confirm: true,
      },
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    // A restore changes workspace files behind every visible projection. Reload
    // all of them together rather than leaving stale file trees/diffs/chat chrome.
    window.location.reload()
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={!available}
        onClick={() => { void askRestore() }}
        style={{
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          border: 'none',
          borderRadius: 28,
          background: 'transparent',
          color: token.textMuted,
          cursor: available ? 'pointer' : 'default',
          opacity: available ? 1 : 0.35,
        }}
      >
        <RestoreIcon size={16} />
      </button>

      {open && (
        <Modal
          title={t('cp.restoreAnswerTitle')}
          open
          onClose={() => { if (!busy) setOpen(false) }}
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" disabled={busy} onClick={() => { setOpen(false) }} style={buttonStyle}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={busy || preview === undefined}
                onClick={() => { void restore() }}
                style={{ ...buttonStyle, borderColor: token.danger, color: token.danger }}
              >
                {busy ? t('cp.restoring') : t('common.restore')}
              </button>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {preview === undefined && error === undefined && (
              <div style={{ color: token.textMuted }}>{t('common.loading')}</div>
            )}
            {preview !== undefined && (
              <>
                <p style={{ margin: 0, lineHeight: 1.55, color: token.textSecondary }}>
                  {t('cp.restoreAnswerHint', { n: preview.affected.length })}
                </p>
                {preview.unprotected.length > 0 && (
                  <Notice kind="error">
                    {t('cp.unprotected', { n: preview.unprotected.length })}
                  </Notice>
                )}
                {preview.affected.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 20, maxHeight: 220, overflow: 'auto', color: token.textMuted }}>
                    {preview.affected.slice(0, 60).map(path => <li key={path}>{path}</li>)}
                    {preview.affected.length > 60 && <li>{t('cp.andMore', { n: preview.affected.length - 60 })}</li>}
                  </ul>
                )}
              </>
            )}
            {error !== undefined && <Notice kind="error">{error}</Notice>}
          </div>
        </Modal>
      )}
    </>
  )
}
