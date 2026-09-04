import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
 * The "losing HP" effect: clean game-style damage numbers floating up in red
 * and a subtle recoil on the balance chip when balance drops.
 */
const HURT_CLASS = 'dsh-ext-hp-hit'
const DROP_CLASS = 'dsh-ext-hp-drop'
let badgeStylesInjected = false
export function injectBadgeStyles(): void {
  if (badgeStylesInjected || typeof document === 'undefined') return
  badgeStylesInjected = true
  const style = document.createElement('style')
  style.dataset.dshPlugin = 'dsh-ext'
  style.textContent = `
/* 单段受击轻微震颤 (0.32s) */
@keyframes dsh-hp-shake-single {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(2px, -1px); }
  60% { transform: translate(-1px, 0); }
  80% { transform: translate(1px, 0); }
  100% { transform: translate(0, 0); }
}

/* 5段连击受击抖动 (持续 1.15s，与 5 笔伤害命中 0ms, 200ms, 400ms, 600ms, 800ms 紧密共振) */
@keyframes dsh-hp-shake-flurry {
  /* 第1击命中 (0ms) */
  0% { transform: translate(0, 0); }
  3% { transform: translate(-1.5px, 1px); }
  6% { transform: translate(1.5px, -1px); }
  10% { transform: translate(0, 0); }

  /* 第2击命中 (200ms) */
  17% { transform: translate(1.5px, 1px); }
  21% { transform: translate(-1.5px, -1px); }
  26% { transform: translate(0, 0); }

  /* 第3击命中 (400ms) */
  35% { transform: translate(-2px, 1.5px); }
  39% { transform: translate(2px, -1.5px); }
  45% { transform: translate(0, 0); }

  /* 第4击命中 (600ms) */
  53% { transform: translate(2.5px, -1.5px); }
  58% { transform: translate(-2.5px, 1.5px); }
  64% { transform: translate(0, 0); }

  /* 第5击终结重创暴击 (800ms) - 强力震荡 */
  72% { transform: translate(-3.5px, 2px) scale(1.025); }
  77% { transform: translate(3.5px, -2px) scale(1.025); }
  83% { transform: translate(-2px, 1px); }
  89% { transform: translate(1px, -1px); }
  95% { transform: translate(0, 0); }
  100% { transform: translate(0, 0); }
}

.dsh-ext-hp-shake-single {
  animation: dsh-hp-shake-single 0.32s ease-in-out !important;
}

.dsh-ext-hp-shake-flurry {
  animation: dsh-hp-shake-flurry 1.15s ease-in-out !important;
}

/* 5 段连击散布抛物线 (1.65s ~ 1.75s 优美滞空飘散) */
@keyframes dsh-hp-l1 {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.5) rotate(0deg); }
  14% { opacity: 1; transform: translate(calc(-50% - 14px), -16px) scale(1.18) rotate(-7deg); }
  32% { opacity: 1; transform: translate(calc(-50% - 22px), -24px) scale(1.0) rotate(-5deg); }
  75% { opacity: 0.95; transform: translate(calc(-50% - 28px), -34px) scale(0.96) rotate(-3deg); }
  100% { opacity: 0; transform: translate(calc(-50% - 32px), -44px) scale(0.85) rotate(-1deg); }
}

@keyframes dsh-hp-r1 {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.5) rotate(0deg); }
  14% { opacity: 1; transform: translate(calc(-50% + 14px), -16px) scale(1.18) rotate(7deg); }
  32% { opacity: 1; transform: translate(calc(-50% + 22px), -24px) scale(1.0) rotate(5deg); }
  75% { opacity: 0.95; transform: translate(calc(-50% + 28px), -34px) scale(0.96) rotate(3deg); }
  100% { opacity: 0; transform: translate(calc(-50% + 32px), -44px) scale(0.85) rotate(1deg); }
}

@keyframes dsh-hp-l2 {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.45) rotate(0deg); }
  14% { opacity: 1; transform: translate(calc(-50% - 22px), -20px) scale(1.22) rotate(-11deg); }
  32% { opacity: 1; transform: translate(calc(-50% - 32px), -30px) scale(1.0) rotate(-8deg); }
  75% { opacity: 0.95; transform: translate(calc(-50% - 40px), -42px) scale(0.96) rotate(-5deg); }
  100% { opacity: 0; transform: translate(calc(-50% - 45px), -54px) scale(0.85) rotate(-3deg); }
}

@keyframes dsh-hp-r2 {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.45) rotate(0deg); }
  14% { opacity: 1; transform: translate(calc(-50% + 22px), -20px) scale(1.22) rotate(11deg); }
  32% { opacity: 1; transform: translate(calc(-50% + 32px), -30px) scale(1.0) rotate(8deg); }
  75% { opacity: 0.95; transform: translate(calc(-50% + 40px), -42px) scale(0.96) rotate(5deg); }
  100% { opacity: 0; transform: translate(calc(-50% + 45px), -54px) scale(0.85) rotate(3deg); }
}

@keyframes dsh-hp-apex {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.4) rotate(0deg); }
  14% { opacity: 1; transform: translate(-50%, -24px) scale(1.42) rotate(0deg); }
  32% { opacity: 1; transform: translate(-50%, -34px) scale(1.1) rotate(0deg); }
  75% { opacity: 0.95; transform: translate(-50%, -46px) scale(1.0) rotate(0deg); }
  100% { opacity: 0; transform: translate(-50%, -58px) scale(0.88) rotate(0deg); }
}

.dsh-ext-hp-flurry-l1,
.dsh-ext-hp-flurry-r1,
.dsh-ext-hp-flurry-l2,
.dsh-ext-hp-flurry-r2,
.dsh-ext-hp-flurry-apex {
  position: absolute;
  top: 0;
  left: 50%;
  pointer-events: none;
  white-space: nowrap;
  will-change: transform, opacity;
  z-index: 20;
}

.dsh-ext-hp-flurry-l1 { animation: dsh-hp-l1 1.65s cubic-bezier(0.18, 0.88, 0.32, 1.1) both; }
.dsh-ext-hp-flurry-r1 { animation: dsh-hp-r1 1.65s cubic-bezier(0.18, 0.88, 0.32, 1.1) both; }
.dsh-ext-hp-flurry-l2 { animation: dsh-hp-l2 1.65s cubic-bezier(0.18, 0.88, 0.32, 1.1) both; }
.dsh-ext-hp-flurry-r2 { animation: dsh-hp-r2 1.65s cubic-bezier(0.18, 0.88, 0.32, 1.1) both; }
.dsh-ext-hp-flurry-apex { animation: dsh-hp-apex 1.75s cubic-bezier(0.18, 0.88, 0.32, 1.1) both; }

.dsh-ext-hp-num-normal {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ui-monospace, sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  line-height: 1;
  color: #ef4444;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7), 0 0 4px rgba(239, 68, 68, 0.35);
  letter-spacing: -0.3px;
}

.dsh-ext-hp-num-crit {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ui-monospace, sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  line-height: 1;
  color: #f59e0b;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85), 0 0 6px rgba(245, 158, 11, 0.55);
  letter-spacing: -0.4px;
}

/*
 * The composer's absolute top bar (worktree/git chips, balance chip) floats in
 * the card's top padding. Reserve that space on the card itself so the
 * attachment rail / input never slide underneath it, and remove the old
 * in-scroll padding that used to create the extra blank gap above the textarea.
 */
[data-composer-card][data-has-balance-badge],
[data-composer-card][data-has-git-controls] {
  padding-top: 26px !important;
  gap: 6px !important;
}

[data-composer-card][data-has-balance-badge] [data-input-scroll] {
  padding-top: 0 !important;
  padding-right: 130px !important;
}

[data-composer-card][data-has-git-controls] [data-input-scroll] {
  padding-top: 0 !important;
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
 * Splits damage into up to 5 organic, non-uniform hits with escalating combo pacing.
 * Strictly guarantees that the sum of all elements equals `total` down to the cent.
 */
function splitDamage5(total: number): number[] {
  const cents = Math.round(total * 100)
  if (cents <= 0) return [0]
  const count = Math.min(5, cents)
  if (count === 1) return [total]

  // Escalating combo weights: jabs -> mid strikes -> grand finisher
  const baseWeights = [0.10, 0.14, 0.18, 0.23, 0.35]
  const raw = baseWeights.slice(0, count).map(w => w * (0.85 + Math.random() * 0.3))
  const sumRaw = raw.reduce((a, b) => a + b, 0)
  const normalized = raw.map(w => w / sumRaw)

  const allocated: number[] = []
  let remainingCents = cents
  for (let i = 0; i < count - 1; i++) {
    const share = Math.max(1, Math.round(cents * normalized[i]!))
    const maxAllowed = remainingCents - (count - 1 - i)
    const val = Math.min(share, Math.max(1, maxAllowed))
    allocated.push(val)
    remainingCents -= val
  }
  allocated.push(remainingCents)

  return allocated.map(c => c / 100)
}

interface DamageHit {
  readonly id: string
  readonly amount: string
  readonly delayMs: number
  readonly variant: 'l1' | 'r1' | 'l2' | 'r2' | 'apex'
  readonly isCrit: boolean
}

let inMemoryBalance: BalanceData | undefined
try {
  const saved = typeof window !== 'undefined' ? window.sessionStorage.getItem('dsh-ext:balance') : null
  if (saved) inMemoryBalance = JSON.parse(saved)
} catch {}

/**
 * The composer chip. Bare text — no pill, no border — because it sits in a row
 * of real controls and draws the eye only when something changes: the peak or
 * off-peak marker beside the amount, and a shake-and-float "damage" effect
 * whenever the balance drops between polls.
 */
export function BalanceBadge(props: { cardEl?: HTMLElement | null; inline?: boolean; variant?: 'composer' | 'hero' }) {
  const t = useT()
  injectBadgeStyles()
  const config = useClientConfig()
  const balance = config?.deepseekBalance
  const pollSeconds = balance?.pollSeconds ?? 60
  const peakWindows = balance?.peakWindowsBeijing ?? ['09:00-12:00', '14:00-18:00']
  const weekdaysOnly = balance?.peakWeekdaysOnly ?? true

  const view = useResource<BalanceData>('/balance?refresh=1')
  if (view.data && view.data.rows && view.data.rows.length > 0) {
    inMemoryBalance = view.data
    try {
      window.sessionStorage.setItem('dsh-ext:balance', JSON.stringify(view.data))
    } catch {}
  }

  const reloadRef = useRef(view.reload)
  reloadRef.current = view.reload
  useEffect(() => {
    if (pollSeconds <= 0) return
    const timer = window.setInterval(() => {
      reloadRef.current()
    }, pollSeconds * 1000)
    return () => { window.clearInterval(timer) }
  }, [pollSeconds])

  const activeData = view.data ?? inMemoryBalance
  const primary = activeData?.rows[0]
  const total = useMemo(() => (primary === undefined ? undefined : Number.parseFloat(primary.totalBalance)), [primary])

  // 连续多段扣血飘字状态
  const [hits, setHits] = useState<readonly DamageHit[]>([])
  const [isHurt, setIsHurt] = useState(false)
  const [shakeClass, setShakeClass] = useState<string | undefined>(undefined)
  const clearTimerRef = useRef<number | undefined>(undefined)

  const triggerDamage = useCallback((diff: number, forceCrit?: boolean) => {
    const absDiff = Math.abs(diff)
    if (absDiff <= 0.0001) return

    // 暴击判定：单次扣费 >= 0.10 元算大额暴击，或者由调用方显式指定
    const isCrit = forceCrit !== undefined ? forceCrit : absDiff >= 0.10

    // 5段非均分连击切分（轻击铺垫 -> 终结暴击）
    const parts = splitDamage5(absDiff)
    const count = parts.length

    const variants: readonly ('l1' | 'r1' | 'l2' | 'r2' | 'apex')[] = [
      'l1',
      'r1',
      'l2',
      'r2',
      'apex',
    ]

    const baseId = Date.now()
    const newHits: DamageHit[] = parts.map((amount, i) => {
      const isLast = i === count - 1
      const variant = variants[i % variants.length] ?? 'apex'
      return {
        id: `${baseId}-${i}`,
        amount: amount.toFixed(2),
        delayMs: i * 200, // 0ms, 200ms, 400ms, 600ms, 800ms
        variant,
        isCrit: isLast ? isCrit : false, // 最后一发终结暴击，前面为连续普攻
      }
    })

    setHits(newHits)
    setIsHurt(true)

    // 徽章抖动：单段轻震，5段连击触发 1.15s 持续五重受击共振
    setShakeClass(undefined)
    requestAnimationFrame(() => {
      setShakeClass(count > 1 ? 'dsh-ext-hp-shake-flurry' : 'dsh-ext-hp-shake-single')
    })

    if (clearTimerRef.current !== undefined) {
      window.clearTimeout(clearTimerRef.current)
    }
    // 延迟总时间：第5发延时(800ms) + 飘浮滞空(1750ms) + 衰减缓冲(400ms) = 2950ms (~3秒)
    const totalDuration = (count - 1) * 200 + 1750 + 400
    clearTimerRef.current = window.setTimeout(() => {
      setHits([])
      setIsHurt(false)
      setShakeClass(undefined)
    }, totalDuration)
  }, [])

  const balanceTextRef = useRef<HTMLSpanElement | null>(null)
  const animRafRef = useRef<number | undefined>(undefined)

  // 极速原生 60/120 FPS 无感知 DOM 文本滚轮（无 React 反复 re-render 损耗，彻底告别掉帧卡顿）
  const runRollingNumber = useCallback((from: number, to: number, duration = 480) => {
    if (animRafRef.current !== undefined) {
      cancelAnimationFrame(animRafRef.current)
    }
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const cur = from + (to - from) * ease
      if (balanceTextRef.current) {
        balanceTextRef.current.textContent = cur.toFixed(2)
      }
      if (progress < 1) {
        animRafRef.current = requestAnimationFrame(tick)
      } else {
        if (balanceTextRef.current) {
          balanceTextRef.current.textContent = to.toFixed(2)
        }
        animRafRef.current = undefined
      }
    }
    animRafRef.current = requestAnimationFrame(tick)
  }, [])

  // 监听真实价格变动触发扣血与高帧率滚动
  const previous = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (total === undefined || Number.isNaN(total)) return
    const before = previous.current
    previous.current = total
    if (before !== undefined && total < before) {
      triggerDamage(before - total)
      runRollingNumber(before, total, 1100)
    } else {
      if (balanceTextRef.current) {
        balanceTextRef.current.textContent = total.toFixed(2)
      }
    }
  }, [total, triggerDamage, runRollingNumber])

  const [minuteTick, setMinuteTick] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => { setMinuteTick(t => t + 1) }, 30_000)
    return () => { window.clearInterval(timer) }
  }, [])

  const peak = useMemo(
    () => isPeakNow(peakWindows, weekdaysOnly),
    [peakWindows, weekdaysOnly, activeData, minuteTick],
  )
  const peakText = t(peak ? 'balance.peak' : 'balance.offPeak')

  // 定期查询状态追踪与控制台调试日志
  const [lastQueryTime, setLastQueryTime] = useState<number | undefined>(() => view.data?.fetchedAt)
  const [queryCount, setQueryCount] = useState(0)

  useEffect(() => {
    if (view.data?.fetchedAt) {
      setLastQueryTime(view.data.fetchedAt)
      setQueryCount(c => c + 1)
      console.info(
        `%c[dsh-ext]%c DeepSeek 余额定期查询成功: ${view.data.rows[0]?.totalBalance} ${view.data.rows[0]?.currency} (时段: ${peakText}, 轮询间隔: ${pollSeconds}s, 时间: ${new Date(view.data.fetchedAt).toLocaleTimeString()})`,
        'color: #3b82f6; font-weight: bold;',
        'color: inherit;',
      )
    }
  }, [view.data?.fetchedAt, pollSeconds, peakText])

  if (primary === undefined) return null

  // New-session hero keeps the capsule; old-session composer uses bare text.
  const isCapsule = props.variant === 'hero'

  const handleBadgeClick = (e: React.MouseEvent) => {
    // 双击：触发大额【暴击 (CRIT)】5段扣血重创！
    // Alt/Shift+单击：触发小额【普通扣血 (不暴击)】5段扣血！
    if (e.detail === 2) {
      e.preventDefault()
      e.stopPropagation()
      const sampleDamage = Math.round((Math.random() * 0.35 + 0.18) * 100) / 100
      triggerDamage(sampleDamage, true)

      const currentNum = balanceTextRef.current
        ? Number.parseFloat(balanceTextRef.current.textContent || '0')
        : (total ?? 10)
      const targetNum = Math.max(0, currentNum - sampleDamage)
      runRollingNumber(currentNum, targetNum, 1100)
      return
    }

    if (e.altKey || e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      const sampleDamage = Math.round((Math.random() * 0.05 + 0.05) * 100) / 100
      triggerDamage(sampleDamage, false)

      const currentNum = balanceTextRef.current
        ? Number.parseFloat(balanceTextRef.current.textContent || '0')
        : (total ?? 10)
      const targetNum = Math.max(0, currentNum - sampleDamage)
      runRollingNumber(currentNum, targetNum, 1000)
      return
    }

    // 普通单击聚焦输入框
    e.stopPropagation()
    props.cardEl?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  const queryInfo = lastQueryTime
    ? `上次更新: ${new Date(lastQueryTime).toLocaleTimeString()}`
    : '查询中...'
  const titleText = `${t('balance.badge.title', {
    windows: peakWindows.join(', '),
    source: activeData?.credentialSource ?? 'unknown',
  })}\n定期轮询: 每 ${pollSeconds} 秒自动查询 (运行中)\n${queryInfo}${queryCount > 0 ? ` (已成功查询 ${queryCount} 次)` : ''}\n(双击预览【暴击】，Alt+点击预览【普通扣血】)`

  return (
    <div
      data-dsh-plugin="dsh-ext"
      data-dsh-part="balance-badge"
      title={titleText}
      onClick={handleBadgeClick}
      className={shakeClass}
      style={{
        position: props.inline ? 'relative' : 'absolute',
        top: props.inline ? undefined : 8,
        right: props.inline ? undefined : 14,
        zIndex: props.inline ? undefined : 4,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: isCapsule ? 28 : undefined,
        boxSizing: 'border-box',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        padding: isCapsule ? '0 10px' : '2px 2px',
        borderRadius: isCapsule ? 14 : 0,
        lineHeight: '20px',
        background: isHurt && isCapsule
          ? 'rgba(239, 68, 68, 0.12)'
          : isCapsule
            ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
            : 'transparent',
        border: isHurt && isCapsule
          ? '1px solid rgba(239, 68, 68, 0.55)'
          : isCapsule ? `1px solid ${token.border}` : 'none',
        backdropFilter: isCapsule ? 'blur(8px)' : 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        cursor: 'pointer',
        color: view.data?.available === false ? token.danger : token.textMuted,
        boxShadow: isHurt && isCapsule
          ? '0 0 8px rgba(239, 68, 68, 0.3)'
          : isCapsule
            ? '0 1px 3px rgba(0, 0, 0, 0.08)'
            : 'none',
        transition: 'color 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ color: peak ? token.warn : token.success, fontWeight: 500 }}>{peakText}</span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: isHurt ? '#ff3333' : token.text,
          fontWeight: 600,
          transition: 'color 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 数字正中位置：飘字百分之百精准从数字正中爆出 */}
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <span ref={balanceTextRef}>{primary.totalBalance}</span>

          {/* 5 段非规则抛物线散布扣血飘字 */}
          {hits.map(hit => {
            const cls = `dsh-ext-hp-flurry-${hit.variant}`
            return (
              <span
                key={hit.id}
                className={cls}
                style={{ animationDelay: `${hit.delayMs}ms` }}
              >
                <span className={hit.isCrit ? 'dsh-ext-hp-num-crit' : 'dsh-ext-hp-num-normal'}>
                  -{hit.amount}
                </span>
              </span>
            )
          })}
        </span>

        <span>{primary.currency}</span>
      </span>
    </div>
  )
}
