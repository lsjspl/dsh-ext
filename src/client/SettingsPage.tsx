import { Component, useState } from 'react'
import { Notice, NumberField, Row, Section, Select, TextField, Toggle, buttonStyle, token } from './ui.tsx'
import { useResource } from './use-resource.ts'
import { useConfig } from './use-config.ts'
import { BalanceCard } from './BalanceView.tsx'
import { AuditPanel } from './AuditPanel.tsx'
import { SessionsPanel } from './SessionsPanel.tsx'
import { PluginsPanel } from './PluginsPanel.tsx'
import { EffortsPanel } from './EffortsPanel.tsx'
import { CheckpointsPanel } from './CheckpointsPanel.tsx'
import { ExplorerPanel } from './ExplorerPanel.tsx'
import { useT } from './use-locale.ts'
import type { CommandReviewFallback, CommandReviewMode } from '../config.ts'
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
    <div style={{ paddingTop: 4 }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
        style={{ ...buttonStyle, fontSize: 11, padding: '2px 8px' }}
      >
        {open ? '▾' : '▸'} {props.label}
      </button>
      {open && <div style={{ paddingTop: 8 }}>{props.children}</div>}
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
    console.error('[dsh-dev-tool-ext] the settings page crashed:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <Notice kind="error">
          [dsh-dev-tool-ext] 设置页渲染出错：请重启 DeepSeek Harness 让插件前后端版本一致；若仍复现，请把控制台报错反馈给插件作者。
        </Notice>
      )
    }
    return this.props.children
  }
}

/** The tab strip: an underline on the active tab, in the host's own accent. */
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
  return (
    <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${token.border}`, overflowX: 'auto' }}>
      {TABS.map(tab => {
        const active = tab === props.active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => { props.onSelect(tab) }}
            style={{
              ...buttonStyle,
              border: 'none',
              borderBottom: `2px solid ${active ? token.accent : 'transparent'}`,
              borderRadius: 0,
              background: 'transparent',
              padding: '6px 10px',
              fontSize: 12,
              color: active ? token.text : token.textMuted,
            }}
          >
            {labels[tab]}
          </button>
        )
      })}
    </div>
  )
}

export function SettingsPage() {
  const t = useT()
  const { view, error, busy, set, setMany } = useConfig()
  const [tab, setTab] = useState<Tab>('input')
  // The reviewer model picker's rows. Read unconditionally (a hook), used only
  // by the review tab: one dropdown over every model the live routes advertise.
  const reviewModels = useResource<ReviewModels>('/review/models')

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

  return (
    <div style={{ padding: '0 4px 24px', color: token.text }} data-dsh-plugin="dsh-dev-tool-ext">
      {!view.writable && (
        <div style={{ paddingTop: 12 }}>
          <Notice kind="info">
            {t('common.readonly')}
          </Notice>
        </div>
      )}
      {error !== undefined && (
        <div style={{ paddingTop: 12 }}>
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      <div style={{ paddingTop: 8 }}>
        <TabStrip active={tab} onSelect={setTab} />
      </div>

      <div style={{ paddingTop: 12, paddingLeft: 8 }}>
        <SettingsBoundary>
        {tab === 'input' && (
          <>
            <Section title={t('section.images')} description={t('section.images.desc')}>
              <Row
                label={t('common.enabled')}
                control={<Toggle label={t('section.images')} checked={c.imageComposer.enabled} disabled={disabled}
                  onChange={next => { set(['imageComposer', 'enabled'], next) }} />}
              />
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

            <Section title={t('section.effort')} description={t('section.effort.desc')}>
              <Row
                label={t('common.enabled')}
                control={<Toggle label={t('section.effort')} checked={c.reasoningEffort.enabled} disabled={disabled}
                  onChange={next => { set(['reasoningEffort', 'enabled'], next) }} />}
              />
              <Disclosure label={t('effort.models')}>
                <EffortsPanel enabled={c.reasoningEffort.enabled} />
              </Disclosure>
            </Section>

            <Section title={t('section.modelPicker')} description={t('section.modelPicker.desc')}>
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
          <Section title={t('section.balance')} description={t('section.balance.desc')}>
            <Row
              label={t('common.enabled')}
              control={<Toggle label={t('section.balance')} checked={c.deepseekBalance.enabled} disabled={disabled}
                onChange={next => { set(['deepseekBalance', 'enabled'], next) }} />}
            />
            <Row
              label={t('balance.badge')} hint={t('balance.badge.hint')}
              control={<Toggle label={t('balance.badge')} checked={c.deepseekBalance.headerBadge} disabled={disabled || !c.deepseekBalance.enabled}
                onChange={next => { set(['deepseekBalance', 'headerBadge'], next) }} />}
            />
            <Row
              label={t('balance.poll')} hint={t('balance.poll.hint')}
              control={<NumberField
                label={t('balance.poll')}
                // `?? defaults` throughout: a running backend that predates
                // these fields answers without them, and a hard read would
                // crash the whole settings section blank.
                value={c.deepseekBalance.pollSeconds ?? 30}
                min={0} max={600} step={5}
                disabled={disabled || !c.deepseekBalance.enabled}
                onCommit={next => { set(['deepseekBalance', 'pollSeconds'], next) }} />}
            />
            <Row
              label={t('balance.peakWindows')} hint={t('balance.peakWindows.hint')}
              control={<TextField
                label={t('balance.peakWindows')}
                value={(c.deepseekBalance.peakWindowsUtc ?? []).join(', ')}
                disabled={disabled || !c.deepseekBalance.enabled}
                width={220}
                onCommit={next => {
                  const windows = next.split(',').map(window => window.trim()).filter(window => window.length > 0)
                  set(['deepseekBalance', 'peakWindowsUtc'], windows)
                }} />}
            />
            <Row
              label={t('balance.peakWeekdays')} hint={t('balance.peakWeekdays.hint')}
              control={<Toggle label={t('balance.peakWeekdays')} checked={c.deepseekBalance.peakWeekdaysOnly ?? true} disabled={disabled || !c.deepseekBalance.enabled}
                onChange={next => { set(['deepseekBalance', 'peakWeekdaysOnly'], next) }} />}
            />
            {c.deepseekBalance.enabled && (
              <div style={{ paddingTop: 4 }}><BalanceCard enabled /></div>
            )}
          </Section>
        )}

        {tab === 'review' && (
          <Section title={t('section.review')} description={t('section.review.desc')}>
            <Row
              label={t('common.enabled')}
              control={<Toggle label={t('section.review')} checked={c.commandReview.enabled} disabled={disabled}
                onChange={next => { set(['commandReview', 'enabled'], next) }} />}
            />
            <Row
              label={t('review.mode')}
              control={<Select<CommandReviewMode>
                label={t('review.mode')} value={c.commandReview.mode} disabled={disabled || !c.commandReview.enabled}
                onChange={next => { set(['commandReview', 'mode'], next) }}
                options={[
                  { value: 'rules-only', label: t('review.mode.rules') },
                  { value: 'rules+llm', label: t('review.mode.rulesLlm') },
                  { value: 'all', label: t('review.mode.all') },
                ]} />}
            />
            <Row
              label={t('review.modelPick')} hint={t('review.modelPick.hint')}
              control={(() => {
                // One dropdown over the configured routes; choosing a row sets
                // provider and model together, in one fenced write. A stored
                // choice whose route is dormant stays visible at the top.
                const options = reviewModels.data?.models.map(row => ({
                  value: `${row.provider}::${row.model}`,
                  label: row.name === row.model ? `${row.name} · ${row.provider}` : `${row.name} · ${row.provider} / ${row.model}`,
                })) ?? []
                if (!options.some(option => option.value === currentModelKey)) {
                  options.unshift({ value: currentModelKey, label: `${c.commandReview.model} · ${c.commandReview.provider}` })
                }
                if (options.length <= 1) {
                  return <span style={{ fontSize: 11, color: token.textMuted }}>{currentModelKey}</span>
                }
                return <Select
                  label={t('review.modelPick')} value={currentModelKey} disabled={disabled || !c.commandReview.enabled}
                  onChange={next => {
                    const separator = next.indexOf('::')
                    setMany([
                      { path: ['commandReview', 'provider'], value: next.slice(0, separator) },
                      { path: ['commandReview', 'model'], value: next.slice(separator + 2) },
                    ])
                  }}
                  options={options} />
              })()}
            />
            <Row
              label={t('review.timeout')}
              hint={t('review.timeout.hint')}
              control={<NumberField
                label={t('review.timeout')}
                value={c.commandReview.timeoutMs}
                min={1000} max={120000} step={500}
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
            <Row
              label={t('review.tools')}
              hint={t('review.tools.hint')}
              control={<span style={{ fontSize: 11, color: token.textMuted }}>{c.commandReview.tools.join(', ')}</span>}
            />
            <Disclosure label={t('review.verdicts')}>
              <AuditPanel enabled={c.commandReview.enabled} />
            </Disclosure>
          </Section>
        )}

        {tab === 'files' && (
          <Section title={t('section.explorer')} description={t('section.explorer.desc')}>
            <Row
              label={t('common.enabled')}
              control={<Toggle label={t('section.explorer')} checked={c.explorer.enabled} disabled={disabled}
                onChange={next => { set(['explorer', 'enabled'], next) }} />}
            />
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
            {c.explorer.enabled && (
              <Disclosure label={t('explorer.preview')}>
                <div style={{ border: `1px solid ${token.border}`, borderRadius: 8, padding: 8, maxHeight: 300, overflow: 'hidden', display: 'flex' }}>
                  <ExplorerPanel />
                </div>
              </Disclosure>
            )}
          </Section>
        )}

        {tab === 'sessions' && (
          <>
            <Section title={t('section.sessions')} description={t('section.sessions.desc')}>
              <Row
                label={t('common.enabled')}
                control={<Toggle label={t('section.sessions')} checked={c.sessionAdmin.enabled} disabled={disabled}
                  onChange={next => { set(['sessionAdmin', 'enabled'], next) }} />}
              />
              <Row
                label={t('sessions.trash')} hint={t('sessions.trash.hint')}
                control={<Toggle label={t('sessions.trash')} checked={c.sessionAdmin.trashEnabled} disabled={disabled || !c.sessionAdmin.enabled}
                  onChange={next => { set(['sessionAdmin', 'trashEnabled'], next) }} />}
              />
              <Row
                label={t('sessions.gc')}
                hint={t('sessions.gc.hint')}
                control={<Toggle label={t('sessions.gc')} checked={c.sessionAdmin.attachmentGc} disabled={disabled || !c.sessionAdmin.enabled}
                  onChange={next => { set(['sessionAdmin', 'attachmentGc'], next) }} />}
              />
              <Disclosure label={t('sessions.stored')}>
                <SessionsPanel enabled={c.sessionAdmin.enabled} trashEnabled={c.sessionAdmin.trashEnabled} />
              </Disclosure>
            </Section>

            <Section title={t('section.checkpoints')} description={t('section.checkpoints.desc')}>
              <Row
                label={t('common.enabled')}
                control={<Toggle label={t('section.checkpoints')} checked={c.checkpoints.enabled} disabled={disabled}
                  onChange={next => { set(['checkpoints', 'enabled'], next) }} />}
              />
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
                control={<span style={{ fontSize: 11, color: token.textMuted }}>{c.checkpoints.retentionDays} {t('common.days')}</span>}
              />
              <Row
                label={t('cp.maxSize')}
                control={<span style={{ fontSize: 11, color: token.textMuted }}>{c.checkpoints.maxFileSizeMb} MB</span>}
              />
              <Disclosure label={t('cp.list')}>
                <CheckpointsPanel enabled={c.checkpoints.enabled} />
              </Disclosure>
            </Section>
          </>
        )}

        {tab === 'plugins' && (
          <Section title={t('section.plugins')} description={t('section.plugins.desc')}>
            <Row
              label={t('common.enabled')}
              control={<Toggle label={t('section.plugins')} checked={c.pluginSafety.enabled} disabled={disabled}
                onChange={next => { set(['pluginSafety', 'enabled'], next) }} />}
            />
            <Disclosure label={t('plugins.list')} defaultOpen={c.pluginSafety.quarantine.length > 0}>
              <PluginsPanel enabled={c.pluginSafety.enabled} />
            </Disclosure>
          </Section>
        )}
        </SettingsBoundary>
      </div>
    </div>
  )
}
