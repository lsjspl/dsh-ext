import { useCallback, useState } from 'react'
import { callApi } from './api.ts'
import { useResource } from './use-resource.ts'
import { Notice, buttonStyle, dangerButtonStyle, primaryButtonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { DEFAULT_EFFORT_LADDER, THINKING_LEVELS, type EffortProvider, type EffortRung, type ThinkingLevel } from '../shared/api-contract.ts'

/**
 * Feature 2 — declare reasoning-effort levels for a third-party provider's models.
 *
 * What this writes is the pi-ai adapter's own per-model `reasoningEfforts` map,
 * so the effort control the harness already ships appears in the composer for
 * that model. Each row is a level the user will see, paired with the value the
 * provider is actually sent — the two are separate because gateways spell the
 * same level differently (`high`, `ultra`, a token budget), and only the user
 * knows which their endpoint accepts.
 */

interface EffortsResponse {
  readonly providers: readonly EffortProvider[]
  readonly revision: number
  readonly writable: boolean
  readonly ladder: readonly EffortRung[]
}

/** One editable ladder row. */
interface DraftRung {
  id: ThinkingLevel
  wire: string
}

function toDraft(rungs: readonly EffortRung[]): DraftRung[] {
  return rungs.map(rung => ({ id: rung.id, wire: rung.wire ?? '' }))
}

function ModelEditor(props: {
  provider: string
  model: string
  initial: readonly EffortRung[]
  revision: number
  disabled: boolean
  onSaved: () => void
  onClose: () => void
}) {
  const [rungs, setRungs] = useState<DraftRung[]>(() => toDraft(
    props.initial.length > 0 ? props.initial : DEFAULT_EFFORT_LADDER,
  ))
  const t = useT()
  const [error, setError] = useState<string | undefined>(undefined)
  const [busy, setBusy] = useState(false)

  const save = useCallback(async (efforts: unknown) => {
    setBusy(true)
    setError(undefined)
    const result = await callApi('/efforts/set', {
      method: 'POST',
      body: { provider: props.provider, model: props.model, efforts, expectedRevision: props.revision },
    })
    setBusy(false)
    if (result.ok) {
      props.onSaved()
      props.onClose()
    } else {
      setError(result.message)
    }
  }, [props])

  const available = THINKING_LEVELS.filter(level => !rungs.some(rung => rung.id === level))

  return (
    <div style={{ border: `1px solid ${token.accent}`, borderRadius: 6, padding: 10, margin: '4px 0' }}>
      <strong style={{ fontSize: 12 }}>{props.model}</strong>
      <p style={{ fontSize: 11, color: token.textMuted, margin: '4px 0 8px' }}>
        {t('effort.explain')}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 500, fontSize: 11, color: token.textMuted, padding: '0 0 4px' }}>{t('effort.level')}</th>
            <th style={{ textAlign: 'left', fontWeight: 500, fontSize: 11, color: token.textMuted, padding: '0 0 4px' }}>{t('effort.sentAs')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rungs.map((rung, index) => (
            <tr key={rung.id}>
              <td style={{ padding: '2px 6px 2px 0' }}>
                <code>{rung.id}</code>
              </td>
              <td style={{ padding: '2px 6px 2px 0' }}>
                <input
                  type="text"
                  value={rung.wire}
                  placeholder={rung.id === 'off' ? t('effort.sendNothing') : t('effort.required')}
                  aria-label={`Wire value for ${rung.id}`}
                  disabled={props.disabled || busy}
                  onChange={(event) => {
                    const next = [...rungs]
                    const target = next[index]
                    if (target === undefined) return
                    next[index] = { ...target, wire: event.currentTarget.value }
                    setRungs(next)
                  }}
                  style={{
                    font: 'inherit',
                    fontSize: 12,
                    width: '100%',
                    color: token.text,
                    background: 'transparent',
                    border: `1px solid ${token.border}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                  }}
                />
              </td>
              <td style={{ padding: '2px 0', textAlign: 'right' }}>
                <button
                  type="button"
                  disabled={props.disabled || busy}
                  onClick={() => { setRungs(rungs.filter((_, at) => at !== index)) }}
                  style={{ ...buttonStyle, fontSize: 11 }}
                >{t('effort.remove')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {available.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: token.textMuted, alignSelf: 'center' }}>{t('effort.add')}</span>
          {available.map(level => (
            <button
              key={level}
              type="button"
              disabled={props.disabled || busy}
              onClick={() => {
                const known = DEFAULT_EFFORT_LADDER.find(rung => rung.id === level)
                const next = [...rungs, { id: level, wire: known?.wire ?? (level === 'off' ? '' : level) }]
                // Keep escalation order, so the composer's menu reads sensibly.
                next.sort((a, b) => THINKING_LEVELS.indexOf(a.id) - THINKING_LEVELS.indexOf(b.id))
                setRungs(next)
              }}
              style={{ ...buttonStyle, fontSize: 11 }}
            >{level}</button>
          ))}
        </div>
      )}

      {error !== undefined && <div style={{ paddingTop: 8 }}><Notice kind="error">{error}</Notice></div>}

      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button
          type="button"
          disabled={props.disabled || busy}
          onClick={() => { void save(rungs.map(rung => ({ id: rung.id, wire: rung.wire.length === 0 ? null : rung.wire }))) }}
          style={primaryButtonStyle}
        >{busy ? t('common.loading') : t('common.save')}</button>
        <button
          type="button"
          disabled={props.disabled || busy}
          onClick={() => { void save(false) }}
          title={t('effort.noReasoning.hint')}
          style={buttonStyle}
        >{t('effort.noReasoning')}</button>
        <button
          type="button"
          disabled={props.disabled || busy}
          onClick={() => { void save(undefined) }}
          title={t('effort.reset.hint')}
          style={buttonStyle}
        >{t('common.reset')}</button>
        <span style={{ flex: 1 }} />
        <button type="button" disabled={busy} onClick={props.onClose} style={buttonStyle}>{t('common.close')}</button>
      </div>
    </div>
  )
}

export function EffortsPanel(props: { enabled: boolean }) {
  const t = useT()
  const view = useResource<EffortsResponse>('/efforts', props.enabled)
  const [editing, setEditing] = useState<{ provider: string; model: string } | undefined>(undefined)
  const [busyVision, setBusyVision] = useState<string | undefined>(undefined)
  const [visionError, setVisionError] = useState<string | undefined>(undefined)

  /**
   * Declare whether a model takes images.
   *
   * One click rather than a form because there is only one honest answer per
   * model, and the host's refusal message ("当前模型不支持图片") gives the user no way
   * to act on it from where they hit it.
   */
  const toggleVision = useCallback(async (provider: string, model: string, next: boolean) => {
    setBusyVision(model)
    setVisionError(undefined)
    const result = await callApi('/vision/set', {
      method: 'POST',
      body: { provider, model, vision: next, expectedRevision: view.data?.revision },
    })
    setBusyVision(undefined)
    if (result.ok) view.reload()
    else setVisionError(result.message)
  }, [view])

  if (!props.enabled) {
    return <div style={{ fontSize: 12, color: token.textMuted }}>{t('section.effort')}</div>
  }

  const providers = view.data?.providers ?? []
  const readOnly = view.data?.writable === false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {view.error !== undefined && <Notice kind="error">{view.error}</Notice>}
      {readOnly && <Notice kind="info">{t('effort.readonly')}</Notice>}
      {visionError !== undefined && <Notice kind="error">{visionError}</Notice>}

      {view.data !== undefined && providers.length === 0 && (
        <div style={{ fontSize: 12, color: token.textMuted }}>
          {t('effort.none')}
        </div>
      )}

      {providers.map(provider => (
        <div key={provider.provider}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <strong style={{ fontSize: 12 }}>{provider.displayName}</strong>
            <code style={{ fontSize: 10, color: token.textMuted }}>{provider.provider}</code>
            {!provider.live && <span style={{ fontSize: 10, color: token.textMuted }}>{t('effort.notLoaded')}</span>}
          </div>

          <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
            {provider.models.map(model => {
              const isEditing = editing?.provider === provider.provider && editing.model === model.id
              const declared = model.overrideEfforts.length > 0
              const inherited = model.adapterEfforts.length > 0
              return (
                <li key={model.id}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 2px', borderBottom: `1px solid ${token.border}` }}>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {model.id}
                    </span>
                    <span style={{ fontSize: 10, color: token.textMuted, flex: '0 0 auto' }}>
                      {declared
                        ? model.overrideEfforts.map(rung => rung.id).join(' · ')
                        : inherited
                          ? t('effort.fromAdapter', { list: model.adapterEfforts.map(rung => rung.id).join(' · ') })
                          : t('effort.noEfforts')}
                    </span>
                    <button
                      type="button"
                      disabled={readOnly || busyVision === model.id}
                      title={t('vision.hint')}
                      onClick={() => { void toggleVision(provider.provider, model.id, model.vision !== true) }}
                      style={{
                        ...buttonStyle,
                        fontSize: 11,
                        borderColor: model.vision === true ? token.accent : token.border,
                        color: model.vision === true ? token.accent : token.textMuted,
                      }}
                    >{model.vision === true ? t('vision.on') : t('vision.off')}</button>
                    <button
                      type="button"
                      onClick={() => { setEditing(isEditing ? undefined : { provider: provider.provider, model: model.id }) }}
                      style={{ ...buttonStyle, fontSize: 11 }}
                    >{isEditing ? t('common.close') : declared ? t('effort.edit') : t('effort.declare')}</button>
                  </div>

                  {isEditing && view.data !== undefined && (
                    <ModelEditor
                      provider={provider.provider}
                      model={model.id}
                      initial={model.overrideEfforts}
                      revision={view.data.revision}
                      disabled={readOnly}
                      onSaved={view.reload}
                      onClose={() => { setEditing(undefined) }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
