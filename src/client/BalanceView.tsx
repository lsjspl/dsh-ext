import { useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import type { BalanceView as BalanceData } from '../shared/api-contract.ts'

/**
 * Feature 3 — the DeepSeek official API account balance.
 *
 * Two presentations of one endpoint: a full card for the settings page and a
 * compact chip for the session header. Both read the same cached value, so the
 * badge being on costs no extra request.
 */

export function BalanceCard(props: { enabled: boolean }) {
  const t = useT()
  const view = useResource<BalanceData>('/balance', props.enabled)

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('section.balance')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {view.error !== undefined && <Notice kind="error">{view.error}</Notice>}

      {view.data === undefined && view.error === undefined && (
        <div style={{ fontSize: 12, color: token.textMuted }}>{t('balance.reading')}</div>
      )}

      {view.data !== undefined && (
        <>
          {!view.data.available && (
            <Notice kind="error">
              {t('balance.unavailable')}
            </Notice>
          )}

          {view.data.rows.length === 0 ? (
            <div style={{ fontSize: 12, color: token.textMuted }}>{t('balance.noRows')}</div>
          ) : (
            <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {[t('balance.currency'), t('balance.total'), t('balance.granted'), t('balance.toppedUp')].map(heading => (
                    <th
                      key={heading}
                      style={{ textAlign: 'left', fontWeight: 500, fontSize: 11, color: token.textMuted, padding: '0 12px 4px 0' }}
                    >{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.data.rows.map(row => (
                  <tr key={row.currency}>
                    <td style={{ padding: '2px 12px 2px 0' }}>{row.currency}</td>
                    <td style={{ padding: '2px 12px 2px 0', color: token.accent }}>{row.totalBalance}</td>
                    <td style={{ padding: '2px 12px 2px 0', color: token.textMuted }}>{row.grantedBalance}</td>
                    <td style={{ padding: '2px 12px 2px 0', color: token.textMuted }}>{row.toppedUpBalance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: token.textMuted }}>
              {new Date(view.data.fetchedAt).toLocaleTimeString()} · {t('balance.keyFrom', { source: view.data.credentialSource })}
            </span>
            <span style={{ flex: 1 }} />
            <button type="button" onClick={view.reload} style={{ ...buttonStyle, fontSize: 11 }}>{t('common.refresh')}</button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * The header chip. Renders nothing at all until a balance is known: a header is
 * shared space, and an error or a spinner there would be noise about a feature
 * the user did not ask a question of.
 */
export function BalanceBadge() {
  const view = useResource<BalanceData>('/balance')
  const primary = view.data?.rows[0]
  if (primary === undefined) return null
  return (
    <span
      data-dsh-plugin="dsh-dev-tool-ext"
      data-dsh-part="balance-badge"
      title={`DeepSeek balance · key from ${view.data?.credentialSource ?? 'unknown source'}`}
      style={{
        fontSize: 11,
        color: view.data?.available === false ? token.danger : token.textMuted,
        padding: '2px 6px',
        border: `1px solid ${token.border}`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {primary.totalBalance} {primary.currency}
    </span>
  )
}
