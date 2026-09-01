import { useState } from 'react'
import { Notice, NumberField, Row, Section, Select, TextField, Toggle, buttonStyle, token } from './ui.tsx'
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

/**
 * The plugin's settings page: one switch per feature, the options each feature
 * needs, and each feature's own working surface behind a disclosure.
 *
 * The surfaces live here rather than only in the conversation because several of
 * them are administrative — deleting sessions, quarantining a plugin, restoring
 * a checkpoint — and belong where a user goes deliberately, not beside the
 * composer where a mis-click is cheap.
 */

/** A collapsible panel host, so a page of eight features is not eight screens tall. */
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

export function SettingsPage() {
  const t = useT()
  const { view, error, busy, set } = useConfig()

  if (view === undefined) {
    return (
      <div style={{ padding: 16, fontSize: 13, color: token.textMuted }}>
        {error === undefined ? t('common.loading') : error}
      </div>
    )
  }

  const c = view.value
  const disabled = busy || !view.writable

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

      <Section
        title={t('section.images')}
        description={t('section.images.desc')}
      >
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

      <Section
        title={t('section.effort')}
        description={t('section.effort.desc')}
      >
        <Row
          label={t('common.enabled')}
          control={<Toggle label={t('section.effort')} checked={c.reasoningEffort.enabled} disabled={disabled}
            onChange={next => { set(['reasoningEffort', 'enabled'], next) }} />}
        />
        <Disclosure label={t('effort.models')}>
          <EffortsPanel enabled={c.reasoningEffort.enabled} />
        </Disclosure>
      </Section>

      <Section
        title={t('section.modelPicker')}
        description={t('section.modelPicker.desc')}
      >
        <Row
          label={t('modelPicker.collapse')}
          hint={t('modelPicker.collapse.hint')}
          control={<Toggle label={t('modelPicker.collapse')} checked={c.modelPicker.groupCollapse} disabled={disabled}
            onChange={next => { set(['modelPicker', 'groupCollapse'], next) }} />}
        />
      </Section>

      <Section
        title={t('section.balance')}
        description={t('section.balance.desc')}
      >
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
        {c.deepseekBalance.enabled && (
          <div style={{ paddingTop: 4 }}><BalanceCard enabled /></div>
        )}
      </Section>

      <Section
        title={t('section.review')}
        description={t('section.review.desc')}
      >
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
          label={t('review.provider')}
          hint={t('review.provider.hint')}
          control={<TextField
            label={t('review.provider')}
            value={c.commandReview.provider}
            disabled={disabled || !c.commandReview.enabled}
            onCommit={next => { set(['commandReview', 'provider'], next) }} />}
        />
        <Row
          label={t('review.model')}
          hint={t('review.model.hint')}
          control={<TextField
            label={t('review.model')}
            value={c.commandReview.model}
            disabled={disabled || !c.commandReview.enabled}
            onCommit={next => { set(['commandReview', 'model'], next) }} />}
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

      <Section
        title={t('section.explorer')}
        description={t('section.explorer.desc')}
      >
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

      <Section
        title={t('section.sessions')}
        description={t('section.sessions.desc')}
      >
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

      <Section
        title={t('section.plugins')}
        description={t('section.plugins.desc')}
      >
        <Row
          label={t('common.enabled')}
          control={<Toggle label={t('section.plugins')} checked={c.pluginSafety.enabled} disabled={disabled}
            onChange={next => { set(['pluginSafety', 'enabled'], next) }} />}
        />
        <Disclosure label={t('plugins.list')} defaultOpen={c.pluginSafety.quarantine.length > 0}>
          <PluginsPanel enabled={c.pluginSafety.enabled} />
        </Disclosure>
      </Section>

      <Section
        title={t('section.checkpoints')}
        description={t('section.checkpoints.desc')}
      >
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
    </div>
  )
}
