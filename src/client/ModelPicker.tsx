import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ModelSelectInjected } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { ChevronIcon, CheckIcon } from './icons.tsx'
import { hostModelClasses } from './host-css.ts'
import { token } from './ui.tsx'
import { useT } from './use-locale.ts'

/**
 * Feature 9 — the composer's model selector, with collapsible provider groups.
 *
 * ## Why this shadows the shipped selector instead of adding to it
 *
 * The host's `ModelSelect` already groups by provider — it renders a `<section>`
 * per group with a heading — but every group is expanded at all times and the
 * menu has no collapse affordance. With several routes configured, the model
 * pane becomes one long scroll where the model you want is indistinguishable
 * from the eighty you don't. There is no child slot inside that menu, so the
 * only way to add collapsing is to occupy the seat.
 *
 * `conversation.input.model` is `single`, so this registers at a negative
 * priority to shadow the resident occupant (see SHADOW_PRIORITY in index.tsx).
 *
 * ## What taking the seat obliges
 *
 * Everything the shipped selector did, because nothing else renders it any more:
 *
 *   - the two-level menu (root → model / effort), so feature 2's declared effort
 *     ladders stay reachable — that row is the whole point of feature 2, and
 *     dropping it here would silently delete a feature;
 *   - `locked` honoured by refusing interaction;
 *   - the loading, per-provider failure, whole-request error, and empty states,
 *     each with the retry the host offered;
 *   - roving arrow-key focus, Escape to back out one pane then close, and
 *     click-outside/blur dismissal;
 *   - `role="menuitemradio"` + `aria-checked` on every choice.
 *
 * Styling is borrowed from the host's own CSS module at runtime (see
 * host-css.ts) so the menu is visually the same object it replaced; when that
 * probe fails, the fallback below is plain but themed.
 */

type Directory = ModelSelectInjected['directory']
type DirectoryState = ReturnType<Directory['getSnapshot']>
type Group = DirectoryState['groups'][number]
type Model = Group['models'][number]
type Selection = Parameters<ModelSelectInjected['select']>[0]
type Effort = NonNullable<Selection['reasoningEffort']>

export type ModelPickerProps = Omit<ModelSelectInjected, 't'> & {
  readonly locked: boolean
  /**
   * Whether groups may be collapsed and filtered.
   *
   * False renders the always-expanded list the shipped selector rendered. This
   * entry cannot decline the seat (see registerModelPicker), so "feature off"
   * has to mean "behave like the thing I replaced" rather than "render nothing".
   */
  readonly collapsible: boolean
}

/** Which pane the menu is showing. Mirrors the host's own three states. */
type Pane = 'root' | 'model' | 'effort'

/** Persisted collapse state, so the menu reopens the way it was left. */
const COLLAPSE_KEY = 'dsh-ext:model-groups-collapsed'

function readCollapsed(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(COLLAPSE_KEY)
    if (raw === null) return new Set()
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((id): id is string => typeof id === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function writeCollapsed(ids: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...ids]))
  } catch { /* a browser refusing storage still gets working collapse, just not sticky */ }
}

export function ModelPicker(props: ModelPickerProps) {
  const { locked, available, directory, load, select, collapsible } = props
  const t = useT()
  const host = hostModelClasses()
  const state = useSyncExternalStore(
    useCallback((fn: () => void) => directory.subscribe(fn), [directory]),
    useCallback(() => directory.getSnapshot(), [directory]),
  )

  const [open, setOpen] = useState(false)
  const [pane, setPane] = useState<Pane>('root')
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(readCollapsed)
  const [filter, setFilter] = useState('')
  const lastAction = useRef<'load' | 'select'>('load')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const id = useId()

  const current = state.current
  const currentModel = useMemo(() => {
    if (current === null) return undefined
    for (const group of state.groups) {
      if (group.id !== current.provider) continue
      for (const model of group.models) if (model.id === current.model) return model
    }
    return undefined
  }, [state.groups, current])

  const reasoning = currentModel?.reasoning
  const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort
  const effortLabel = reasoning === undefined
    ? undefined
    : effectiveEffort === undefined
      ? t('picker.providerDefault')
      : reasoning.efforts.find(level => level.id === effectiveEffort)?.name ?? effectiveEffort

  const effortChoices = useMemo(() => {
    if (reasoning === undefined) return []
    const rows: { key: string; effort: Effort | undefined; label: string; description?: string }[] = []
    // The host offers an explicit "provider default" row only when the model
    // declares no default of its own; keeping that rule means the effort pane
    // reads the same as before this shadowed it.
    if (reasoning.defaultEffort === undefined) {
      rows.push({ key: 'provider-default', effort: undefined, label: t('picker.providerDefault') })
    }
    for (const effort of reasoning.efforts) {
      rows.push({
        key: `effort:${effort.id}`,
        effort: effort.id as Effort,
        label: effort.name,
        ...(effort.description === undefined ? {} : { description: effort.description }),
      })
    }
    return rows
  }, [reasoning, t])

  const busy = state.status === 'selecting'
  const modelLabel = currentModel?.name ?? t('picker.chooseModel')
  // The trigger shows "provider · model" so a user can tell whose model they
  // have picked without opening the menu. The provider name is the display name
  // of the group holding the current selection; faint, so the model name stays
  // the headline.
  const providerName = current === null
    ? undefined
    : state.groups.find(group => group.id === current.provider)?.name

  const reload = useCallback(() => {
    lastAction.current = 'load'
    load()
  }, [load])

  useEffect(() => {
    if (available) reload()
  }, [available, reload])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node) !== true) setOpen(false)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => { document.removeEventListener('mousedown', closeOutside) }
  }, [open])

  if (!available) return null

  const close = (restoreFocus = false) => {
    setOpen(false)
    setPane('root')
    setFilter('')
    if (restoreFocus) queueMicrotask(() => { triggerRef.current?.focus() })
  }

  const show = () => {
    setPane('root')
    setOpen(true)
    reload()
  }

  const settle = (accepted: boolean) => { if (accepted && rootRef.current !== null) close(true) }

  const choose = (selection: Selection) => {
    if (current?.provider === selection.provider && current.model === selection.model) {
      close(true)
      return
    }
    lastAction.current = 'select'
    void select(selection).then(settle)
  }

  const chooseEffort = (effort: Effort | undefined) => {
    if (current === null) return
    if (effectiveEffort === effort) {
      close(true)
      return
    }
    lastAction.current = 'select'
    void select({
      provider: current.provider,
      model: current.model,
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
    }).then(settle)
  }

  const toggleGroup = (groupId: string) => {
    const next = new Set(collapsed)
    if (next.has(groupId)) next.delete(groupId)
    else next.add(groupId)
    setCollapsed(next)
    writeCollapsed(next)
  }

  const setAll = (collapse: boolean) => {
    const next = collapse ? new Set(state.groups.map(group => group.id)) : new Set<string>()
    setCollapsed(next)
    writeCollapsed(next)
  }

  const moveFocus = (offset: number) => {
    const items = itemRefs.current.filter((item): item is HTMLElement => item !== null)
    if (items.length === 0) return
    const active = items.findIndex(item => item === document.activeElement)
    items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus()
  }

  const onRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      if (pane !== 'root') setPane('root')
      else close(true)
      return
    }
    if (!open) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(event.key === 'ArrowDown' ? 1 : -1)
    }
  }

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget) === true) return
    close()
  }

  itemRefs.current = []
  const itemRef = () => {
    const at = itemRefs.current.length
    itemRefs.current.push(null)
    return (node: HTMLElement | null) => { itemRefs.current[at] = node }
  }

  /**
   * Free-text narrowing across every group.
   *
   * Collapsing alone does not solve "I have eight routes and know the model's
   * name"; while a filter is active the matching groups are force-expanded, so
   * a hit is never hidden behind a collapsed heading.
   */
  const needle = filter.trim().toLowerCase()
  const visible = useMemo(() => state.groups.map(group => ({
    group,
    models: needle.length === 0
      ? group.models
      : group.models.filter(model =>
        model.name.toLowerCase().includes(needle) || model.id.toLowerCase().includes(needle)),
  })).filter(entry => needle.length === 0 || entry.models.length > 0), [state.groups, needle])

  const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ')
  const fb = host === null ? fallback : undefined

  return (
    <div
      ref={rootRef}
      className={host?.root}
      style={fb?.root}
      onKeyDown={onRootKeyDown}
      onBlur={onBlur}
      data-dsh-plugin="dsh-ext"
      data-dsh-part="model-picker"
    >
      <button
        ref={triggerRef}
        type="button"
        className={host?.trigger}
        style={fb?.trigger}
        aria-label={effortLabel === undefined
          ? t('picker.triggerAria', { model: modelLabel })
          : t('picker.triggerAriaEffort', { model: modelLabel, effort: effortLabel })}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        title={effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`}
        disabled={locked}
        onClick={() => { if (open) close(); else show() }}
      >
        <span className={host?.triggerLabel} style={fb?.triggerLabel}>
          {providerName !== undefined && providerName.length > 0 && (
            <span
              aria-hidden="true"
              style={{
                fontWeight: 400,
                opacity: 0.55,
                marginRight: 5,
                fontSize: '0.92em',
              }}
            >{providerName}</span>
          )}
          {modelLabel}
        </span>
        {effortLabel !== undefined && (
          <span className={host?.triggerEffort} style={fb?.triggerEffort}>{effortLabel}</span>
        )}
        <span className={cx(host?.chevron, open && host?.chevronOpen)} style={fb?.chevron}>
          <ChevronIcon open={open} size={14} />
        </span>
      </button>

      {open && (
        <div
          id={`${id}-menu`}
          className={host?.menu}
          style={fb?.menu}
          role="menu"
          aria-label={t('picker.menuAria')}
          aria-busy={state.status === 'loading' || busy}
        >
          {pane === 'root' && (
            <>
              <button
                ref={itemRef()}
                type="button"
                role="menuitem"
                className={host?.cell}
                style={fb?.cell}
                onClick={() => { setPane('model') }}
              >
                <span className={host?.cellLabel} style={fb?.cellLabel}>{t('picker.model')}</span>
                <span className={host?.cellValue} style={fb?.cellValue}>{modelLabel}</span>
                <span className={host?.cellChevron} style={fb?.cellChevron}><ChevronIcon open={false} size={14} /></span>
              </button>
              {reasoning !== undefined && (
                <button
                  ref={itemRef()}
                  type="button"
                  role="menuitem"
                  className={host?.cell}
                  style={fb?.cell}
                  onClick={() => { setPane('effort') }}
                >
                  <span className={host?.cellLabel} style={fb?.cellLabel}>{t('picker.effort')}</span>
                  <span className={host?.cellValue} style={fb?.cellValue}>{effortLabel}</span>
                  <span className={host?.cellChevron} style={fb?.cellChevron}><ChevronIcon open={false} size={14} /></span>
                </button>
              )}
            </>
          )}

          {pane === 'model' && (
            <>
              {state.status === 'loading' && (
                <div className={host?.status} style={fb?.status}>{t('picker.loading')}</div>
              )}
              {state.error !== null && lastAction.current === 'load' && (
                <div className={host?.error} style={fb?.error}>
                  <span>{t('picker.actionFailed', { message: state.error })}</span>
                  <button type="button" className={host?.retry} style={fb?.retry} onClick={reload}>
                    {t('picker.reload')}
                  </button>
                </div>
              )}
              {state.failures.map(failure => (
                <div key={failure.id} className={host?.warning} style={fb?.warning}>
                  <span>{t('picker.groupFailed', { name: failure.name, message: failure.message })}</span>
                  <button type="button" className={host?.retry} style={fb?.retry} onClick={reload}>
                    {t('picker.reload')}
                  </button>
                </div>
              ))}

              {collapsible && state.groups.length > 1 && (
                <div style={toolbarStyle}>
                  <input
                    type="text"
                    value={filter}
                    placeholder={t('picker.filter')}
                    aria-label={t('picker.filter')}
                    onChange={event => { setFilter(event.currentTarget.value) }}
                    style={filterStyle}
                  />
                  <button type="button" onClick={() => { setAll(true) }} style={miniButtonStyle}>
                    {t('picker.collapseAll')}
                  </button>
                  <button type="button" onClick={() => { setAll(false) }} style={miniButtonStyle}>
                    {t('picker.expandAll')}
                  </button>
                </div>
              )}

              <div className={cx(host?.groups, 'scrollable')} style={fb?.groups}>
                {visible.map(({ group, models }) => {
                  const headingId = `${id}-${group.id}`
                  // A filter hit must never sit behind a collapsed heading, and
                  // with the feature off nothing is ever collapsed.
                  const shut = collapsible && collapsed.has(group.id) && needle.length === 0
                  const holdsCurrent = current?.provider === group.id
                  return (
                    <section
                      key={group.id}
                      role="group"
                      aria-labelledby={headingId}
                      className={host?.group}
                      style={fb?.group}
                    >
                      {collapsible
                        ? (
                          <button
                            ref={itemRef()}
                            type="button"
                            id={headingId}
                            aria-expanded={!shut}
                            onClick={() => { toggleGroup(group.id) }}
                            className={host?.groupTitle}
                            style={{ ...groupHeaderStyle, ...(fb === undefined ? {} : fb.groupTitle) }}
                          >
                            <ChevronIcon open={!shut} size={12} />
                            <span style={groupNameStyle}>{group.name}</span>
                            <span style={countStyle}>{models.length}</span>
                            {/* A collapsed group holding the active model still says so. */}
                            {shut && holdsCurrent && <span style={dotStyle} aria-hidden="true">●</span>}
                          </button>
                        )
                        : (
                          // Feature off: a plain heading, exactly as the shipped
                          // selector rendered it. A button that collapses nothing
                          // would still take a tab stop and still look pressable.
                          <div id={headingId} className={host?.groupTitle} style={fb?.groupTitle}>
                            {group.name}
                          </div>
                        )}

                      {!shut && models.map(model => {
                        const selected = current?.provider === group.id && current.model === model.id
                        return (
                          <button
                            key={model.id}
                            ref={itemRef()}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            className={cx(host?.option, selected && host?.selected)}
                            style={fb === undefined ? undefined : { ...fb.option, ...(selected ? fb.selected : {}) }}
                            title={model.name}
                            disabled={busy}
                            onClick={() => { choose({ provider: group.id, model: model.id }) }}
                          >
                            <span className={host?.optionCopy} style={fb?.optionCopy}>
                              <span className={host?.modelName} style={fb?.modelName}>{model.name}</span>
                              {model.description !== undefined && (
                                <span className={host?.description} style={fb?.description}>{model.description}</span>
                              )}
                            </span>
                            <span className={host?.check} style={fb?.check}>
                              {selected ? <CheckIcon size={16} /> : null}
                            </span>
                          </button>
                        )
                      })}
                    </section>
                  )
                })}
              </div>

              {state.status === 'ready' && visible.length === 0 && (
                <div className={host?.empty} style={fb?.empty}>
                  {needle.length === 0 ? t('picker.noModels') : t('picker.noMatch')}
                </div>
              )}
            </>
          )}

          {pane === 'effort' && (
            <>
              {state.error !== null && lastAction.current === 'load' && (
                <div className={host?.error} style={fb?.error}>
                  <span>{t('picker.actionFailed', { message: state.error })}</span>
                  <button type="button" className={host?.retry} style={fb?.retry} onClick={reload}>
                    {t('picker.reload')}
                  </button>
                </div>
              )}
              {effortChoices.length === 0
                ? <div className={host?.empty} style={fb?.empty}>{t('picker.noEfforts')}</div>
                : effortChoices.map(level => {
                  const selected = effectiveEffort === level.effort
                  return (
                    <button
                      key={level.key}
                      ref={itemRef()}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      className={cx(host?.option, selected && host?.selected)}
                      style={fb === undefined ? undefined : { ...fb.option, ...(selected ? fb.selected : {}) }}
                      disabled={busy}
                      onClick={() => { chooseEffort(level.effort) }}
                    >
                      <span className={host?.optionCopy} style={fb?.optionCopy}>
                        <span className={host?.modelName} style={fb?.modelName}>{level.label}</span>
                        {level.description !== undefined && (
                          <span className={host?.description} style={fb?.description}>{level.description}</span>
                        )}
                      </span>
                      <span className={host?.check} style={fb?.check}>
                        {selected ? <CheckIcon size={16} /> : null}
                      </span>
                    </button>
                  )
                })}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Chrome this plugin adds on top of the host's own (always applied) ────────

const groupHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
  color: token.textMuted,
} as const

const groupNameStyle = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'left',
} as const

const countStyle = {
  fontSize: 10,
  opacity: 0.7,
  fontVariantNumeric: 'tabular-nums',
} as const

const dotStyle = { fontSize: 8, color: token.accent } as const

const toolbarStyle = {
  display: 'flex',
  gap: 4,
  padding: '4px 6px 6px',
  borderBottom: `1px solid ${token.border}`,
} as const

const filterStyle = {
  flex: 1,
  minWidth: 0,
  font: 'inherit',
  fontSize: 12,
  color: token.text,
  background: token.surface,
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: '3px 7px',
} as const

const miniButtonStyle = {
  font: 'inherit',
  fontSize: 11,
  color: token.textSecondary,
  background: 'transparent',
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: '3px 6px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
} as const

/**
 * Styling used only when the host's stylesheet could not be probed. Plain, but
 * themed and legible — never the browser default menu on a dark background.
 */
const fallback = {
  root: { position: 'relative', display: 'inline-flex' },
  trigger: {
    display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: 260,
    font: 'inherit', fontSize: 12, color: token.text, background: token.surface,
    border: `1px solid ${token.border}`, borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
  },
  triggerLabel: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  triggerEffort: { fontSize: 11, color: token.textMuted },
  chevron: { display: 'inline-flex', color: token.textMuted },
  menu: {
    position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 30,
    minWidth: 300, maxWidth: 380, padding: 4,
    background: 'var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-layer-2, #1e1e1e))',
    border: `1px solid ${token.border}`, borderRadius: 10,
    boxShadow: '0 8px 28px rgba(0,0,0,0.34)',
  },
  cell: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    font: 'inherit', fontSize: 12, color: token.text,
    background: 'transparent', border: 0, borderRadius: 6, padding: '7px 8px', cursor: 'pointer',
  },
  cellLabel: { flex: '0 0 auto', color: token.textMuted },
  cellValue: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' },
  cellChevron: { display: 'inline-flex', color: token.textMuted },
  groups: { maxHeight: 320, overflowY: 'auto', display: 'block' },
  group: { display: 'block', padding: '2px 0' },
  groupTitle: { padding: '5px 6px' },
  option: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    font: 'inherit', fontSize: 12, color: token.text, textAlign: 'left',
    background: 'transparent', border: 0, borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
  },
  selected: { background: token.hover, color: token.accent },
  optionCopy: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 },
  modelName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  description: { fontSize: 10, color: token.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  check: { flex: '0 0 auto', display: 'inline-flex', color: token.accent, width: 16 },
  empty: { fontSize: 12, color: token.textMuted, padding: '8px 10px' },
  status: { fontSize: 12, color: token.textMuted, padding: '6px 8px' },
  error: { display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: token.danger, padding: '6px 8px' },
  warning: { display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: token.warn, padding: '6px 8px' },
  retry: {
    font: 'inherit', fontSize: 11, color: token.accent, background: 'transparent',
    border: `1px solid ${token.border}`, borderRadius: 5, padding: '1px 5px', cursor: 'pointer',
  },
} as const satisfies Record<string, React.CSSProperties>
