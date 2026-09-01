import { useCommand, useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { AuditEntry } from '../shared/api-contract.ts'

/**
 * Feature 4's readout — what the command reviewer has decided.
 *
 * The log is the feature's accountability surface: a review that silently denies
 * a call would leave a user with an agent that mysteriously cannot work, so
 * every verdict is recorded with the reason and which stage produced it.
 */

interface AuditResponse {
  readonly entries: readonly AuditEntry[]
  readonly limit: number
}

const VERDICT_COLOUR = {
  allow: 'textMuted',
  ask: 'accent',
  deny: 'danger',
} as const

export function AuditPanel(props: { enabled: boolean }) {
  const t = useT()
  const view = useResource<AuditResponse>('/review/audit', props.enabled)
  const command = useCommand(view.reload)

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('review.off')}</div>
  }

  const entries = view.data?.entries ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {view.error !== undefined && <Notice kind="error">{view.error}</Notice>}
      {command.error !== undefined && <Notice kind="error">{command.error}</Notice>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: token.textMuted }}>
          {entries.length === 0 ? t('review.empty') : t('review.count', { n: entries.length })}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={view.reload} style={{ ...buttonStyle, fontSize: 11 }}>{t('common.refresh')}</button>
        {entries.length > 0 && (
          <button
            type="button"
            disabled={command.busy}
            onClick={() => { void command.run('/review/audit/clear') }}
            style={{ ...buttonStyle, fontSize: 11 }}
          >{t('common.clear')}</button>
        )}
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflow: 'auto' }}>
        {entries.map((entry, index) => (
          <li
            key={`${entry.at}-${index}`}
            style={{ borderBottom: `1px solid ${token.border}`, paddingBottom: 4 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: token[VERDICT_COLOUR[entry.verdict]] }}>
                {entry.verdict}
              </span>
              <code style={{ fontSize: 10, color: token.textMuted }}>{entry.tool}</code>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: token.textMuted }}>
                {entry.decidedBy} · {new Date(entry.at).toLocaleTimeString()}
              </span>
            </div>
            <pre style={{
              margin: '2px 0 0',
              fontSize: 11,
              lineHeight: 1.4,
              fontFamily: 'ui-monospace, monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: token.text,
            }}>{entry.command}</pre>
            <div style={{ fontSize: 11, color: token.textMuted }}>{entry.reason}</div>
            {entry.matched !== undefined && (
              <div style={{ fontSize: 10, color: token.textMuted }}>
                {t('review.matched')} <code>{entry.matched}</code>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
