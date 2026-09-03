import { useEffect, useMemo, useRef, useState } from 'react'
import { useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { useClientConfig } from './use-client-config.ts'
import type { BalanceView as BalanceData } from '../shared/api-contract.ts'

/**
 * Feature 3 — the DeepSeek official API account balance.
 *
 * Two presentations of one endpoint: a full card for the settings page and a
 * compact text chip for the composer. Both read the same endpoint; the chip
 * additionally polls on its own cadence so the number moves while a session
 * is burning tokens.
 */

/** Is `now` inside one configured Beijing-time peak window (`HH:MM-HH:MM`)? */
export function isPeakNow(windows: readonly string[], weekdaysOnly: boolean, now = new Date()): boolean {
  // Convert the instant to a synthetic UTC date whose UTC fields are Beijing
  // wall-clock fields. This avoids depending on the machine's local timezone.
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  if (weekdaysOnly) {
    const day = beijing.getUTCDay()
    if (day === 0 || day === 6) return false
  }
  const minutes = beijing.getUTCHours() * 60 + beijing.getUTCMinutes()
  return windows.some(window => {
    const match = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(window)
    if (match === null) return false
    const start = Number(match[1]) * 60 + Number(match[2])
    const end = Number(match[3]) * 60 + Number(match[4])
    // A window may cross midnight; the wrap-around form matches either side.
    return start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end
  })
}

/**
 * The "losing HP" effect: when the balance drops between polls the chip shakes
 * once, its number flashes red, and the spent amount floats up and fades —
 * damage numbers, for your wallet. Styles are injected once because keyframes
 * cannot be written as inline styles.
 */
const HURT_CLASS = 'dsh-ext-hurt'
const DROP_CLASS = 'dsh-ext-drop'
let badgeStylesInjected = false
function injectBadgeStyles(): void {
  if (badgeStylesInjected || typeof document === 'undefined') return
  badgeStylesInjected = true
  const style = document.createElement('style')
  style.dataset.dshPlugin = 'dsh-ext'
  style.textContent = `
@keyframes dsh-ext-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
}
.${HURT_CLASS} { animation: dsh-ext-shake 0.4s ease-in-out 2; }
@keyframes dsh-ext-fall {
  0% { opacity: 1; transform: translateY(2px); }
  100% { opacity: 0; transform: translateY(-16px); }
}
.${DROP_CLASS} {
  position: absolute; top: -8px; right: 0;
  font-size: 10px; font-weight: 600; line-height: 1;
  pointer-events: none; white-space: nowrap;
  animation: dsh-ext-fall 1.3s ease-out forwards;
}
`
  document.head.appendChild(style)
}

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
            <span style={{ fontSize: 11, color: token.textMuted }}>
              {new Date(view.data.fetchedAt).toLocaleTimeString()} · {t('balance.keyFrom', { source: view.data.credentialSource })}
            </span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={view.reload}
              style={buttonStyle}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 6.5A5.5 5.5 0 1 1 4 11.5" />
                <path d="M2.5 3v3.5H6" />
              </svg>
              <span>{t('common.refresh')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * The composer chip. Bare text — no pill, no border — because it sits in a row
 * of real controls and draws the eye only when something changes: the peak or
 * off-peak marker beside the amount, and a shake-and-float "damage" effect
 * whenever the balance drops between polls.
 */
export function BalanceBadge() {
  const t = useT()
  injectBadgeStyles()
  const config = useClientConfig()
  const balance = config?.deepseekBalance
  const pollSeconds = balance?.pollSeconds ?? 30
  const peakWindows = balance?.peakWindowsBeijing ?? ['09:00-12:00', '14:00-18:00']
  const weekdaysOnly = balance?.peakWeekdaysOnly ?? true

  // `refresh=1` bypasses the backend cache — the point of the poll is a fresh
  // number, and a cached one would make the interval a no-op.
  const view = useResource<BalanceData>('/balance?refresh=1')
  const reloadRef = useRef(view.reload)
  reloadRef.current = view.reload
  useEffect(() => {
    if (pollSeconds <= 0) return
    const timer = window.setInterval(() => { reloadRef.current() }, pollSeconds * 1000)
    return () => { window.clearInterval(timer) }
  }, [pollSeconds])

  const primary = view.data?.rows[0]
  const total = useMemo(() => (primary === undefined ? undefined : Number.parseFloat(primary.totalBalance)), [primary])

  // A decrease between polls is "damage": remembered per render, cleared on a
  // timer. The seq key restarts the float animation for back-to-back drops.
  const previous = useRef<number | undefined>(undefined)
  const [drop, setDrop] = useState<{ amount: number; seq: number } | undefined>(undefined)
  useEffect(() => {
    if (total === undefined || Number.isNaN(total)) return
    const before = previous.current
    previous.current = total
    if (before !== undefined && total < before) {
      setDrop({ amount: total - before, seq: Date.now() })
    }
  }, [total])
  useEffect(() => {
    if (drop === undefined) return
    const timer = window.setTimeout(() => { setDrop(undefined) }, 1400)
    return () => { window.clearTimeout(timer) }
  }, [drop])

  const peak = useMemo(
    () => isPeakNow(peakWindows, weekdaysOnly),
    // Re-evaluated whenever the data (and thus roughly the minute) changes;
    // a wall-clock timer for the boundary minute is not worth a tick.
    [peakWindows, weekdaysOnly, view.data],
  )

  if (primary === undefined) return null

  const hurt = drop !== undefined
  const peakText = t(peak ? 'balance.peak' : 'balance.offPeak')
  return (
    <span
      data-dsh-plugin="dsh-ext"
      data-dsh-part="balance-badge"
      title={t('balance.badge.title', {
        windows: peakWindows.join(', '),
        source: view.data?.credentialSource ?? 'unknown',
      })}
      className={hurt ? HURT_CLASS : undefined}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 6,
        fontSize: 11,
        whiteSpace: 'nowrap',
        color: view.data?.available === false ? token.danger : token.textMuted,
      }}
    >
      <span style={{ color: peak ? token.warn : token.success }}>{peakText}</span>
      <span style={hurt ? { color: token.danger } : undefined}>
        {primary.totalBalance} {primary.currency}
      </span>
      {drop !== undefined && (
        <span key={drop.seq} className={DROP_CLASS} style={{ color: token.danger }}>
          {drop.amount.toFixed(2)}
        </span>
      )}
    </span>
  )
}
