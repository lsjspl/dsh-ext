import { useCallback, useState } from 'react'
import { callApi } from './api.ts'
import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, dangerButtonStyle, primaryButtonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { CheckpointRow, RestorePreview } from '../shared/api-contract.ts'

/**
 * Feature 8 — per-session rollback.
 *
 * The one screen that can overwrite a user's working tree, so the restore is a
 * two-step: the first click asks the host what the restore would touch, and only
 * a second click on that answer performs it. The answer separates files the
 * user's own git still holds a copy of from files it does not — the second list
 * is the only real risk, so it is the one shown loudest.
 */

interface CheckpointsResponse {
  readonly workspace: string
  readonly exists: boolean
  readonly checkpoints: readonly CheckpointRow[]
}

interface Relative { justNow: string; mins(n: number): string; hours(n: number): string }

function when(at: number, relative: Relative): string {
  if (!Number.isFinite(at) || at <= 0) return '—'
  const date = new Date(at)
  const elapsed = Date.now() - at
  if (elapsed < 60_000) return relative.justNow
  if (elapsed < 3_600_000) return relative.mins(Math.round(elapsed / 60_000))
  if (elapsed < 86_400_000) return relative.hours(Math.round(elapsed / 3_600_000))
  return date.toLocaleString()
}

export function CheckpointsPanel(props: { sessionId?: string; enabled: boolean }) {
  const t = useT()
  // Relative times are built from the dictionary rather than formatted inline:
  // "3 分钟前" puts the unit after the number where English puts it before.
  const relative: Relative = {
    justNow: t('cp.justNow'),
    mins: n => t('cp.minsAgo', { n }),
    hours: n => t('cp.hoursAgo', { n }),
  }
  const scope = props.sessionId === undefined ? '' : `?session=${encodeURIComponent(props.sessionId)}`
  const list = useResource<CheckpointsResponse>(`/checkpoints${scope}`, props.enabled)
  const command = useCommand(list.reload)

  const [pending, setPending] = useState<RestorePreview | undefined>(undefined)
  const [previewing, setPreviewing] = useState(false)
  const [diff, setDiff] = useState<{ id: string; patch: string } | undefined>(undefined)
  const [note, setNote] = useState<string | undefined>(undefined)

  const askPreview = useCallback(async (id: string) => {
    setPreviewing(true)
    setNote(undefined)
    const scope = props.sessionId === undefined ? '' : `&session=${encodeURIComponent(props.sessionId)}`
    const result = await callApi<RestorePreview>(`/checkpoints/preview?id=${encodeURIComponent(id)}${scope}`)
    setPreviewing(false)
    if (result.ok) setPending(result.value)
    else setNote(t('cp.previewFailed', { message: result.message }))
  }, [])

  const confirmRestore = useCallback(async () => {
    if (pending === undefined) return
    const ok = await command.run('/checkpoints/restore', {
      id: pending.checkpointId,
      session: props.sessionId,
      confirm: true,
    })
    if (ok) {
      setNote(t('cp.restored'))
      setPending(undefined)
    }
  }, [command, pending, props.sessionId])

  const showDiff = useCallback(async (id: string) => {
    setDiff({ id, patch: 'Loading…' })
    const scope = props.sessionId === undefined ? '' : `&session=${encodeURIComponent(props.sessionId)}`
    const result = await callApi<{ patch: string }>(`/checkpoints/diff?id=${encodeURIComponent(id)}${scope}`)
    setDiff({
      id,
      patch: result.ok
        ? (result.value.patch.length === 0 ? t('cp.emptyDiff') : result.value.patch)
        : `Could not read the diff: ${result.message}`,
    })
  }, [])

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('cp.off')}</div>
  }

  return (
    <div data-dsh-plugin="dsh-ext" data-dsh-part="checkpoints" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          disabled={command.busy}
          onClick={() => { void command.run('/checkpoints/snapshot', { session: props.sessionId, label: 'manual checkpoint' }) }}
          style={primaryButtonStyle}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
          {t('cp.take')}
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={list.reload} style={buttonStyle}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.5 6.5A5.5 5.5 0 1 1 4 11.5" />
            <path d="M2.5 3v3.5H6" />
          </svg>
          {t('common.refresh')}
        </button>
      </div>

      {list.error !== undefined && <Notice kind="error">{list.error}</Notice>}
      {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}
      {note !== undefined && <Notice kind="info">{note}</Notice>}

      {pending !== undefined && (
        <div style={{ border: `1px solid ${token.danger}`, borderRadius: 6, padding: 10 }}>
          <strong style={{ fontSize: 12, color: token.text }}>
            {t('cp.restoreTitle', { id: pending.checkpointId.slice(0, 8) })}
          </strong>
          <p style={{ fontSize: 12, color: token.textMuted, margin: '6px 0' }}>
            {pending.affected.length === 0
              ? t('cp.restoreNoop')
              : t('cp.restoreCount', { n: pending.affected.length })}
          </p>

          {pending.unprotected.length > 0 && (
            <div style={{ margin: '6px 0' }}>
              <div style={{ fontSize: 12, color: token.danger }}>
                {t('cp.unprotected', { n: pending.unprotected.length })}
              </div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 11, color: token.textMuted, maxHeight: 120, overflow: 'auto' }}>
                {pending.unprotected.slice(0, 40).map(path => <li key={path}>{path}</li>)}
                {pending.unprotected.length > 40 && <li>{t('cp.andMore', { n: pending.unprotected.length - 40 })}</li>}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              type="button"
              disabled={command.busy}
              onClick={() => { void confirmRestore() }}
              style={dangerButtonStyle}
            >
              {command.busy ? t('cp.restoring') : t('common.restore')}
            </button>
            <button type="button" onClick={() => { setPending(undefined) }} style={buttonStyle}>{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {list.data?.exists === false && (
        <Notice kind="info">
          {t('cp.none')}
        </Notice>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(list.data?.checkpoints ?? []).map(row => (
          <li
            key={row.id}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'baseline',
              padding: '4px 2px',
              borderBottom: `1px solid ${token.border}`,
            }}
          >
            <code style={{ fontSize: 11, color: token.accent, flex: '0 0 auto' }}>{row.id.slice(0, 8)}</code>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.label.length === 0 ? t('cp.noLabel') : row.label}
              {row.baseline && <span style={{ color: token.textMuted }}> · {t('cp.baseline')}</span>}
            </span>
            <span style={{ fontSize: 10, color: token.textMuted, flex: '0 0 auto' }}>{when(row.at, relative)}</span>
            <button type="button" onClick={() => { void showDiff(row.id) }} style={{ ...buttonStyle, fontSize: 11 }}>{t('cp.diff')}</button>
            <button
              type="button"
              disabled={previewing || command.busy}
              onClick={() => { void askPreview(row.id) }}
              style={{ ...buttonStyle, fontSize: 11 }}
            >{t('cp.restore')}</button>
          </li>
        ))}
      </ul>

      {diff !== undefined && (
        <div style={{ borderTop: `1px solid ${token.border}`, paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <strong style={{ fontSize: 11 }}>{t('cp.checkpointN', { id: diff.id.slice(0, 8) })}</strong>
            <span style={{ flex: 1 }} />
            <button type="button" onClick={() => { setDiff(undefined) }} style={{ ...buttonStyle, fontSize: 11 }}>{t('common.close')}</button>
          </div>
          <pre style={{
            margin: 0,
            maxHeight: 260,
            overflow: 'auto',
            fontSize: 11,
            lineHeight: 1.45,
            fontFamily: 'ui-monospace, monospace',
            color: token.text,
          }}>{diff.patch}</pre>
        </div>
      )}
    </div>
  )
}
