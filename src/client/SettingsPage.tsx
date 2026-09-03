import { Component, useState, useLayoutEffect, useRef } from 'react'
import { Notice, NumberField, Row, Section, Select, TextAreaField, TextField, Toggle, buttonStyle, token } from './ui.tsx'
import { useResource } from './use-resource.ts'
import { useConfig, type ConfigOp } from './use-config.ts'
import { BalanceCard } from './BalanceView.tsx'
import { AuditPanel } from './AuditPanel.tsx'
import { PluginsPanel, RescueBox } from './PluginsPanel.tsx'
import { EffortsPanel } from './EffortsPanel.tsx'
import { useT } from './use-locale.ts'
import {
  DEFAULT_CONFIG,
  DEFAULT_DELETE_PATTERNS,
  DEFAULT_READ_PATTERNS,
  type Config,
  type CommandReviewFallback,
  type CommandReviewMode,
} from '../config.ts'
import type { ReviewModels } from '../shared/api-contract.ts'


/**
 * The plugin's settings page: one tab per feature group, the options each
 * feature needs, and each feature's own working surface inside its tab.
 *
 * Tabs replaced the earlier vertical run of eight sections — the page had
 * grown taller than the settings pane scrolls comfortably, and every visit
 * made the user dig past five features they were not there for.
 */

/** A collapsible panel host, so a tab of surfaces is not a second tall page. */
function Disclosure(props: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(props.defaultOpen === true)
  return (
    <div style={{ padding: '14px 0 12px' }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
        style={{
          ...buttonStyle,
          fontSize: 12,
          padding: '6px 14px',
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
          border: `1px solid ${token.border}`,
          color: token.text,
          transition: 'all 140ms ease',
        }}
      >
        <span style={{ fontSize: 10, opacity: 0.7, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}>
          &gt;
        </span>
        {props.label}
      </button>
      {open && <div style={{ paddingTop: 12 }}>{props.children}</div>}
    </div>
  )
}



const TABS = ['input', 'balance', 'review', 'files', 'sessions', 'plugins'] as const

type Tab = (typeof TABS)[number]

/**
 * A crash in one tab's content must degrade to a message, not a blank panel:
 * the host's settings section boundary unmounts the whole section on an
 * uncaught render error, which reads as "the settings page is broken".
 */
class SettingsBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    console.error('[dsh-ext] the settings page crashed:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <Notice kind="error">
          [dsh-ext] 设置页渲染出错：请重启 DeepSeek Harness 让插件前后端版本一致；若仍复现，请把控制台报错反馈给插件作者。
        </Notice>
      )
    }
    return this.props.children
  }
}

/** The tab strip matching DSH native settings tabs style with smooth sliding indicator. */
function TabStrip(props: { active: Tab; onSelect: (tab: Tab) => void }) {
  const t = useT()
  const labels: Record<Tab, string> = {
    input: t('tab.input'),
    balance: t('tab.balance'),
    review: t('tab.review'),
    files: t('tab.files'),
    sessions: t('tab.sessions'),
    plugins: t('tab.plugins'),
  }

  const containerRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  })

  useLayoutEffect(() => {
    const el = tabRefs.current[props.active]
    const container = containerRef.current
    if (el && container) {
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        ready: true,
      })
    }
  }, [props.active])

  return (
    <div
      ref={containerRef}
      role="tablist"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 20,
        borderBottom: `1px solid ${token.border}`,
      }}
    >
      {TABS.map(tab => {
        const active = tab === props.active
        return (
          <button
            key={tab}
            ref={el => { tabRefs.current[tab] = el }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => { props.onSelect(tab) }}
            style={{
              appearance: 'none',
              background: 'transparent',
              border: 'none',
              padding: '8px 4px 10px',
              fontSize: 13.5,
              lineHeight: '20px',
              fontWeight: active ? 600 : 400,
              color: active ? token.text : token.textMuted,
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 160ms ease',
            }}
          >
            {labels[tab]}
          </button>
        )
      })}
      {/* Smooth sliding active indicator line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          height: 2,
          borderRadius: '2px 2px 0 0',
          background: 'var(--dsw-alias-state-business-primary, var(--dsw-alias-label-primary, #2563eb))',
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          transition: indicator.ready
            ? 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1), width 240ms cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'none',
          opacity: indicator.ready && indicator.width > 0 ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}


/**
 * 匹配官方 DeepSeek Flash 模型：
 * 1. 提供方为官方 (provider.includes('deepseek') 或 provider === 'deepseek-official')
 * 2. 模型 ID 开头必定是 deepseek
 * 3. 模型 ID 包含 flash
 * 4. 若有多个匹配，按最小匹配（字符长度最短的那个，如 deepseek-v4-flash < deepseek-v4-flash-version）
 */
function findDefaultOfficialFlash(models: readonly { provider: string; model: string; name: string }[]): { provider: string; model: string } | undefined {
  const matched = models.filter(m => {
    const p = m.provider.toLowerCase()
    const id = m.model.toLowerCase()
    const isOfficial = p === 'deepseek-official' || p.includes('deepseek')
    const isDeepSeekPrefix = id.startsWith('deepseek')
    const hasFlash = id.includes('flash')
    return isOfficial && isDeepSeekPrefix && hasFlash
  })

  if (matched.length === 0) return undefined
  matched.sort((a, b) => a.model.length - b.model.length)
  const first = matched[0]
  if (!first) return undefined
  return { provider: first.provider, model: first.model }
}

export function SettingsPage() {
  const t = useT()
  const { view, error, busy, set, setMany } = useConfig()
  const [tab, setTab] = useState<Tab>('input')
  const [direction, setDirection] = useState<'right' | 'left'>('right')
  const [ruleSubTab, setRuleSubTab] = useState<'deny' | 'read' | 'delete'>('deny')

  const handleSelectTab = (nextTab: Tab) => {
    if (nextTab === tab) return
    const prevIdx = TABS.indexOf(tab)
    const nextIdx = TABS.indexOf(nextTab)
    setDirection(nextIdx > prevIdx ? 'right' : 'left')
    setTab(nextTab)
  }

  // The reviewer model picker's rows. Read unconditionally (a hook), used only
  // by the review tab: one dropdown over every model the live routes advertise.
  const reviewModels = useResource<ReviewModels>('/review/models')

  // 当可用模型列表加载后，若当前配置不在列表中，自动最小匹配官方 deepseek flash
  useLayoutEffect(() => {
    if (view && reviewModels.data?.models && reviewModels.data.models.length > 0) {
      const currentValid = reviewModels.data.models.some(
        m => m.provider === view.value.commandReview.provider && m.model === view.value.commandReview.model
      )
      if (!currentValid) {
        const best = findDefaultOfficialFlash(reviewModels.data.models)
        if (best) {
          setMany([
            { path: ['commandReview', 'provider'], value: best.provider },
            { path: ['commandReview', 'model'], value: best.model },
          ])
        }
      }
    }
  }, [view, reviewModels.data?.models])

  if (view === undefined) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: token.textMuted }}>
        {error === undefined ? t('common.loading') : error}
      </div>
    )
  }

  const c = view.value
  const disabled = busy || !view.writable
  const currentModelKey = `${c.commandReview.provider}::${c.commandReview.model}`


  const resetSection = (key: keyof Config) => {
    if (disabled) return
    const defaults = { ...DEFAULT_CONFIG[key] }
    if (key === 'commandReview' && reviewModels.data?.models) {
      const best = findDefaultOfficialFlash(reviewModels.data.models)
      if (best) {
        ;(defaults as any).provider = best.provider
        ;(defaults as any).model = best.model
      }
    }
    const ops: ConfigOp[] = Object.entries(defaults).map(([subKey, value]) => ({
      path: [key, subKey],
      value,
    }))
    setMany(ops)
  }


  return (
    <div style={{ padding: '0 2px 48px', color: token.text }} data-dsh-plugin="dsh-ext">
      {!view.writable && (
        <div style={{ paddingTop: 10 }}>
          <Notice kind="info">
            {t('common.readonly')}
          </Notice>
        </div>
      )}
      {error !== undefined && (
        <div style={{ paddingTop: 10 }}>
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      <div
        data-dsh-part="settings-sticky-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'var(--dsw-alias-bg-layer-2, #2c2c2e)',
          padding: '8px 0 0',
        }}
      >
        <TabStrip active={tab} onSelect={handleSelectTab} />
      </div>

      <style>{`
        @keyframes dsh-tab-from-right {
          from {
            opacity: 0;
            transform: translateX(18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes dsh-tab-from-left {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div style={{ overflowX: 'clip', minHeight: 380, paddingTop: 14, paddingLeft: 1, paddingRight: 1 }}>
        <div
          key={tab}
          style={{
            animation: `${direction === 'right' ? 'dsh-tab-from-right' : 'dsh-tab-from-left'} 200ms cubic-bezier(0.16, 1, 0.3, 1) both`,
            willChange: 'transform, opacity',
          }}
        >
          <SettingsBoundary>

        {tab === 'input' && (
          <>
            <Section
              title={t('section.images')}
              description={t('section.images.desc')}
              action={<Toggle label={t('section.images')} checked={c.imageComposer.enabled} disabled={disabled}
                onChange={next => { set(['imageComposer', 'enabled'], next) }} />}
              onReset={() => { resetSection('imageComposer') }}
            >
              <Row
                label={t('images.button')} hint={t('images.button.hint')}
                control={<Toggle label={t('images.button')} checked={c.imageComposer.pickerButton} disabled={disabled || !c.imageComposer.enabled}
                  onChange={next => { set(['imageComposer', 'pickerButton'], next) }} />}
              />
              <Row
                label={t('images.drag')}
                hint={t('images.drag.hint')}
                control={<Toggle label={t('images.drag')} checked={c.imageComposer.dragReorder} disabled={disabled || !c.imageComposer.enabled}
                  onChange={next => { set(['imageComposer', 'dragReorder'], next) }} />}
              />
            </Section>

            <Section
              title={t('section.effort')}
              description={t('section.effort.desc')}
              action={<Toggle label={t('section.effort')} checked={c.reasoningEffort.enabled} disabled={disabled}
                onChange={next => { set(['reasoningEffort', 'enabled'], next) }} />}
              onReset={() => { resetSection('reasoningEffort') }}
            >
              <Row
                label={t('effort.defaultFull')} hint={t('effort.defaultFull.hint')}
                control={<Toggle label={t('effort.defaultFull')} checked={c.reasoningEffort.defaultFullEfforts ?? true} disabled={disabled || !c.reasoningEffort.enabled}
                  onChange={next => { set(['reasoningEffort', 'defaultFullEfforts'], next) }} />}
              />
              <Row
                label={t('vision.defaultAll')} hint={t('vision.defaultAll.hint')}
                control={<Toggle label={t('vision.defaultAll')} checked={c.reasoningEffort.defaultVision ?? true} disabled={disabled || !c.reasoningEffort.enabled}
                  onChange={next => { set(['reasoningEffort', 'defaultVision'], next) }} />}
              />
              <Disclosure label={t('effort.models')}>
                <EffortsPanel enabled={c.reasoningEffort.enabled} />
              </Disclosure>
            </Section>

            <Section
              title={t('section.modelPicker')}
              description={t('section.modelPicker.desc')}
              onReset={() => { resetSection('modelPicker') }}
            >
              <Row
                label={t('modelPicker.collapse')}
                hint={t('modelPicker.collapse.hint')}
                control={<Toggle label={t('modelPicker.collapse')} checked={c.modelPicker.groupCollapse} disabled={disabled}
                  onChange={next => { set(['modelPicker', 'groupCollapse'], next) }} />}
              />
            </Section>
          </>
        )}

        {tab === 'balance' && (
          <Section
            title={t('section.balance')}
            description={t('section.balance.desc')}
            action={<Toggle label={t('section.balance')} checked={c.deepseekBalance.enabled} disabled={disabled}
              onChange={next => { set(['deepseekBalance', 'enabled'], next) }} />}
            onReset={() => { resetSection('deepseekBalance') }}
          >
            <Row
              label={t('balance.badge')} hint={t('balance.badge.hint')}
              control={<Toggle label={t('balance.badge')} checked={c.deepseekBalance.headerBadge} disabled={disabled || !c.deepseekBalance.enabled}
                onChange={next => { set(['deepseekBalance', 'headerBadge'], next) }} />}
            />
            <Row
              label={t('balance.poll')} hint={t('balance.poll.hint')}
              control={<NumberField
                label={t('balance.poll')}
                value={c.deepseekBalance.pollSeconds ?? 30}
                min={0} max={600} step={5}
                suffix="秒"
                disabled={disabled || !c.deepseekBalance.enabled}
                onCommit={next => { set(['deepseekBalance', 'pollSeconds'], next) }} />}
            />
            <Row
              label={t('balance.peakWindows')} hint={t('balance.peakWindows.hint')}
              control={<TextField
                label={t('balance.peakWindows')}
                value={(c.deepseekBalance.peakWindowsBeijing ?? ['09:00-12:00', '14:00-18:00']).join(', ')}
                disabled={disabled || !c.deepseekBalance.enabled}
                width={220}
                onCommit={next => {
                  const windows = next.split(',').map(window => window.trim()).filter(window => window.length > 0)
                  set(['deepseekBalance', 'peakWindowsBeijing'], windows)
                }} />}
            />
            <Row
              label={t('balance.peakWeekdays')} hint={t('balance.peakWeekdays.hint')}
              control={<Toggle label={t('balance.peakWeekdays')} checked={c.deepseekBalance.peakWeekdaysOnly ?? true} disabled={disabled || !c.deepseekBalance.enabled}
                onChange={next => { set(['deepseekBalance', 'peakWeekdaysOnly'], next) }} />}
            />
            {c.deepseekBalance.enabled && (
              <div style={{ paddingTop: 8, paddingBottom: 6 }}><BalanceCard enabled /></div>
            )}
          </Section>
        )}

        {tab === 'review' && (
          <>
            {/* 1. 审核模式与模型策略 */}
            <Section
              title={t('section.review')}
              description={t('section.review.desc')}
              action={<Toggle label={t('section.review')} checked={c.commandReview.enabled} disabled={disabled}
                onChange={next => { set(['commandReview', 'enabled'], next) }} />}
              onReset={() => { resetSection('commandReview') }}
            >
              <Row
                label={t('review.autoReview')}
                hint={t('review.autoReview.hint')}
                control={<Toggle label={t('review.autoReview')} checked={c.commandReview.autoReview ?? false} disabled={disabled || !c.commandReview.enabled}
                  onChange={next => { set(['commandReview', 'autoReview'], next) }} />}
              />

              <div style={{ padding: '10px 0 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: token.text, marginBottom: 8 }}>
                  审核模式
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {([
                    {
                      value: 'rules+llm' as const,
                      title: '规则初筛 + 模型复审',
                      desc: '先用本地轻量正则规则秒级初筛，命中可疑指令后再交给大模型深度分析判定。兼顾高安全性与低 API 消耗。',
                      tag: '推荐',
                    },
                    {
                      value: 'rules-only' as const,
                      title: '仅本地规则拦截',
                      desc: '纯离线阻断。完全依据本地正则表达式黑白名单进行拦截或放行，不调用任何第二模型，零额外 Token 消耗、零延迟。',
                    },
                    {
                      value: 'all' as const,
                      title: '全量模型审查',
                      desc: '最高防护级别。将覆盖范围内的每一个工具调用无差别提交给大模型进行语义审核裁决，适合极其严苛的安全场景。',
                    },
                  ]).map(m => {
                    const isSelected = c.commandReview.mode === m.value
                    return (
                      <div
                        key={m.value}
                        onClick={() => {
                          if (!disabled && c.commandReview.enabled) {
                            set(['commandReview', 'mode'], m.value)
                          }
                        }}
                        style={{
                          border: isSelected
                            ? '1.5px solid var(--dsw-alias-state-business-primary, #2563eb)'
                            : `1px solid ${token.border}`,
                          borderRadius: 8,
                          padding: '12px 14px',
                          background: isSelected
                            ? 'var(--dsw-alias-bg-layer-2, rgba(37, 99, 235, 0.06))'
                            : 'var(--dsw-alias-bg-layer-1, transparent)',
                          cursor: disabled || !c.commandReview.enabled ? 'default' : 'pointer',
                          transition: 'all 120ms ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isSelected ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.text,
                          }}>
                            {m.title}
                          </span>
                          {m.tag && (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 10,
                              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
                              color: '#fff',
                            }}>
                              {m.tag}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 11.5, color: token.textMuted, lineHeight: 1.5 }}>
                          {m.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {c.commandReview.mode !== 'rules-only' && (
                <>
                  <Row
                    label={t('review.modelPick')} hint={t('review.modelPick.hint')}
                    control={(() => {
                      const list = reviewModels.data?.models ?? []
                      const map = new Map<string, { value: string; label: string }[]>()
                      for (const row of list) {
                        const groupName = row.provider
                        if (!map.has(groupName)) {
                          map.set(groupName, [])
                        }
                        map.get(groupName)!.push({
                          value: `${row.provider}::${row.model}`,
                          label: row.name || row.model,
                        })
                      }

                      // Ensure current selection is present in its provider group if dormant
                      if (currentModelKey) {
                        const separator = currentModelKey.indexOf('::')
                        const p = separator >= 0 ? currentModelKey.slice(0, separator) : c.commandReview.provider
                        const m = separator >= 0 ? currentModelKey.slice(separator + 2) : c.commandReview.model
                        const currentGroup = map.get(p)
                        if (currentGroup) {
                          if (!currentGroup.some(item => item.value === currentModelKey)) {
                            currentGroup.unshift({ value: currentModelKey, label: m })
                          }
                        } else {
                          map.set(p, [{ value: currentModelKey, label: m }])
                        }
                      }

                      const groups = Array.from(map.entries()).map(([group, options]) => ({
                        group,
                        options,
                      }))

                      return (
                        <Select
                          label={t('review.modelPick')}
                          value={currentModelKey}
                          disabled={disabled || !c.commandReview.enabled}
                          onChange={next => {
                            const separator = next.indexOf('::')
                            setMany([
                              { path: ['commandReview', 'provider'], value: next.slice(0, separator) },
                              { path: ['commandReview', 'model'], value: next.slice(separator + 2) },
                            ])
                          }}
                          width={220}
                          maxWidth="100%"
                          groups={groups}
                        />
                      )
                    })()}
                  />
                  <Row
                    label={t('review.timeout')}
                    hint={t('review.timeout.hint')}
                    control={<NumberField
                      label={t('review.timeout')}
                      value={c.commandReview.timeoutMs}
                      min={1000} max={120000} step={500}
                      suffix="毫秒"
                      disabled={disabled || !c.commandReview.enabled}
                      onCommit={next => { set(['commandReview', 'timeoutMs'], next) }} />}
                  />
                  <Row
                    label={t('review.onFailure')}
                    hint={t('review.onFailure.hint')}
                    control={<Select<CommandReviewFallback>
                      label={t('review.onFailure')} value={c.commandReview.onFailure} disabled={disabled || !c.commandReview.enabled}
                      onChange={next => { set(['commandReview', 'onFailure'], next) }}
                      options={[
                        { value: 'ask', label: t('review.onFailure.ask') },
                        { value: 'deny', label: t('review.onFailure.deny') },
                        { value: 'allow', label: t('review.onFailure.allow') },
                      ]} />}
                  />
                </>
              )}
            </Section>

            {/* 2. 命令拦截与放行策略 */}
            <Section
              title="过滤与阻断策略"
              description="在调用审查前进行前置规则过滤，可跳过只读查询或直接拒绝危险删除操作。"
            >
              <Row
                label={t('review.writeOnly')} hint={t('review.writeOnly.hint')}
                control={<Toggle label={t('review.writeOnly')} checked={c.commandReview.writeOnly ?? true} disabled={disabled || !c.commandReview.enabled}
                  onChange={next => { set(['commandReview', 'writeOnly'], next) }} />}
              />
              <Row
                label={t('review.absoluteDelete')} hint={t('review.absoluteDelete.hint')}
                control={<Toggle label={t('review.absoluteDelete')} checked={c.commandReview.absoluteDenyDelete ?? true} disabled={disabled || !c.commandReview.enabled}
                  onChange={next => { set(['commandReview', 'absoluteDenyDelete'], next) }} />}
              />
              <Row
                label={t('review.tools')}
                hint={t('review.tools.hint')}
                control={<TextField
                  label={t('review.tools')}
                  value={(c.commandReview.tools ?? ['bash', 'pwsh', 'run_command']).join(', ')}
                  width={220}
                  disabled={disabled || !c.commandReview.enabled}
                  onCommit={next => {
                    const tools = next.split(',').map(s => s.trim()).filter(Boolean)
                    set(['commandReview', 'tools'], tools)
                  }}
                />}
              />

            </Section>

            {/* 3. 自定义正则规则 */}
            <Section
              title="自定义正则规则"
              description="自定义高危拦截、只读放行与绝对删除特征的正则表达式规则词表。"
            >
              <div style={{ padding: '12px 0 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {[
                    { id: 'deny' as const, label: t('review.denyPatterns') },
                    { id: 'read' as const, label: t('review.readPatterns') },
                    { id: 'delete' as const, label: t('review.deletePatterns') },
                  ].map(tabItem => {
                    const active = ruleSubTab === tabItem.id
                    return (
                      <button
                        key={tabItem.id}
                        type="button"
                        onClick={() => { setRuleSubTab(tabItem.id) }}
                        style={{
                          ...buttonStyle,
                          padding: '6px 14px',
                          fontSize: 12.5,
                          borderRadius: 6,
                          fontWeight: active ? 600 : 400,
                          border: active
                            ? '1px solid var(--dsw-alias-state-business-primary, #2563eb)'
                            : `1px solid ${token.border}`,
                          background: active
                            ? 'var(--dsw-alias-state-business-primary, #2563eb)'
                            : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                          color: active ? '#ffffff' : token.text,
                          transition: 'all 140ms ease',
                          cursor: 'pointer',
                        }}
                      >
                        {tabItem.label}
                      </button>
                    )
                  })}
                </div>

                {ruleSubTab === 'deny' && (
                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: 12, color: token.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
                      每行一条正则表达式。命中此列表特征的命令将被识别为高危操作，进入第二模型深度审核流程。
                    </div>
                    <TextAreaField
                      label={t('review.denyPatterns')}
                      value={c.commandReview.denyPatterns.join('\n')}
                      disabled={disabled || !c.commandReview.enabled}
                      rows={6}
                      onCommit={next => {
                        set(['commandReview', 'denyPatterns'], next.split('\n').map(line => line.trim()).filter(Boolean))
                      }}
                    />
                  </div>
                )}

                {ruleSubTab === 'read' && (
                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: 12, color: token.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
                      每行一条正则表达式。命中此列表特征的命令将被识别为纯只读查询，直接跳过模型审核并放行。
                    </div>
                    <TextAreaField
                      label={t('review.readPatterns')}
                      value={(c.commandReview.readPatterns ?? DEFAULT_READ_PATTERNS).join('\n')}
                      disabled={disabled || !c.commandReview.enabled || !(c.commandReview.writeOnly ?? true)}
                      rows={6}
                      onCommit={next => {
                        set(['commandReview', 'readPatterns'], next.split('\n').map(line => line.trim()).filter(Boolean))
                      }}
                    />
                  </div>
                )}

                {ruleSubTab === 'delete' && (
                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: 12, color: token.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
                      每行一条正则表达式。命中此列表特征的删除操作将直接拒绝执行，彻底阻断破坏性操作。
                    </div>
                    <TextAreaField
                      label={t('review.deletePatterns')}
                      value={(c.commandReview.deletePatterns ?? DEFAULT_DELETE_PATTERNS).join('\n')}
                      disabled={disabled || !c.commandReview.enabled || !(c.commandReview.absoluteDenyDelete ?? true)}
                      rows={6}
                      onCommit={next => {
                        set(['commandReview', 'deletePatterns'], next.split('\n').map(line => line.trim()).filter(Boolean))
                      }}
                    />
                  </div>
                )}
              </div>
            </Section>

            {/* 4. 审核判定记录 */}
            <Section
              title={t('review.verdicts')}
              description="第二审查模型与本地规则对历史工具调用执行审核判定的日志记录与处置理由。"
            >
              <div style={{ padding: '6px 0 12px' }}>
                <AuditPanel enabled={c.commandReview.enabled} />
              </div>
            </Section>
          </>
        )}



        {tab === 'files' && (
          <Section
            title={t('section.explorer')}
            description={t('section.explorer.desc')}
            action={<Toggle label={t('section.explorer')} checked={c.explorer.enabled} disabled={disabled}
              onChange={next => { set(['explorer', 'enabled'], next) }} />}
            onReset={() => { resetSection('explorer') }}
          >
            <Row
              label={t('explorer.side')}
              control={<Select<'left' | 'right'>
                label={t('explorer.side')} value={c.explorer.side} disabled={disabled || !c.explorer.enabled}
                onChange={next => { set(['explorer', 'side'], next) }}
                options={[{ value: 'left', label: t('explorer.side.left') }, { value: 'right', label: t('explorer.side.right') }]} />}
            />
            <Row
              label={t('explorer.defaultOpen')}
              control={<Toggle label={t('explorer.defaultOpen')} checked={c.explorer.defaultOpen} disabled={disabled || !c.explorer.enabled}
                onChange={next => { set(['explorer', 'defaultOpen'], next) }} />}
            />
            <Row
              label={t('explorer.gitignore')}
              control={<Toggle label={t('explorer.gitignore')} checked={c.explorer.respectGitignore} disabled={disabled || !c.explorer.enabled}
                onChange={next => { set(['explorer', 'respectGitignore'], next) }} />}
            />
          </Section>
        )}

        {tab === 'sessions' && (
          <>
            <Section
              title={t('section.checkpoints')}
              description={t('section.checkpoints.desc')}
              action={<Toggle label={t('section.checkpoints')} checked={c.checkpoints.enabled} disabled={disabled}
                onChange={next => { set(['checkpoints', 'enabled'], next) }} />}
              onReset={() => { resetSection('checkpoints') }}
            >
              <Row
                label={t('cp.snapshotOn')}
                control={<Select<'turn' | 'tool'>
                  label={t('cp.snapshotOn')} value={c.checkpoints.snapshotOn} disabled={disabled || !c.checkpoints.enabled}
                  onChange={next => { set(['checkpoints', 'snapshotOn'], next) }}
                  options={[
                    { value: 'turn', label: t('cp.snapshotOn.turn') },
                    { value: 'tool', label: t('cp.snapshotOn.tool') },
                  ]} />}
              />
              <Row
                label={t('cp.retention')}
                hint={t('cp.retention.hint')}
                control={<NumberField
                  label={t('cp.retention')}
                  value={c.checkpoints.retentionDays}
                  min={0} max={3650} step={1}
                  suffix="天"
                  disabled={disabled || !c.checkpoints.enabled}
                  onCommit={next => { set(['checkpoints', 'retentionDays'], next) }} />}
              />
              <Row
                label={t('cp.maxSize')}
                control={<NumberField
                  label={t('cp.maxSize')}
                  value={c.checkpoints.maxFileSizeMb}
                  min={1} max={1024} step={1}
                  suffix="MB"
                  disabled={disabled || !c.checkpoints.enabled}
                  onCommit={next => { set(['checkpoints', 'maxFileSizeMb'], next) }} />}
              />
            </Section>

            <Section
              title={t('section.sessions')}
              description={t('section.sessions.desc')}
              action={<Toggle label={t('section.sessions')} checked={c.sessionAdmin.enabled} disabled={disabled}
                onChange={next => { set(['sessionAdmin', 'enabled'], next) }} />}
              onReset={() => { resetSection('sessionAdmin') }}
            >
              <Row
                label={t('sessions.gc')}
                hint={t('sessions.gc.hint')}
                control={<Toggle label={t('sessions.gc')} checked={c.sessionAdmin.attachmentGc} disabled={disabled || !c.sessionAdmin.enabled}
                  onChange={next => { set(['sessionAdmin', 'attachmentGc'], next) }} />}
              />
            </Section>
          </>
        )}

        {tab === 'plugins' && (
          <>
            <Section
              title={t('section.plugins')}
              description={t('section.plugins.desc')}
              action={<Toggle label={t('section.plugins')} checked={c.pluginSafety.enabled} disabled={disabled}
                onChange={next => { set(['pluginSafety', 'enabled'], next) }} />}
              onReset={() => { resetSection('pluginSafety') }}
            >
              <div style={{ paddingTop: 6, paddingBottom: 6 }}>
                <PluginsPanel enabled={c.pluginSafety.enabled} />
              </div>
            </Section>

            <Section
              title={t('plugins.rescueTitle')}
              description="当第三方插件导致 Harness 启动失败或异常白屏时，可通过以下脱困机制进行快速修复："
            >
              <RescueBox />
            </Section>
          </>
        )}
        </SettingsBoundary>
        </div>
      </div>
    </div>
  )
}


