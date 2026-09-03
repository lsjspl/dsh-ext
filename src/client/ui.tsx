import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useT } from './use-locale.ts'

/**
 * The Web client routes every colour through `--dsw-alias-*` custom properties
 * so themes and skins can restyle a page they have never seen.
 *
 * Two things about these tokens are easy to get wrong, and getting either wrong
 * produces black-on-black text in the dark theme:
 *
 * 1. **The names are not guessable.** Text is `label-*`, not `text-*`; surfaces
 *    are `bg-layer-N`, not `bg-lN`; the accent is `brand-primary`, not
 *    `text-brand`. A wrong name silently resolves to nothing and the `var()`
 *    fallback takes over.
 * 2. **They are declared on `body`, not `:root`.** That does not affect `var()`
 *    lookups from inside the tree (they inherit), but it does mean a probe
 *    against `documentElement` reports them all missing.
 *
 * The fallbacks are therefore written to stay correct in BOTH themes rather
 * than hard-coding a light-theme hex: `currentColor` inherits whatever the
 * surrounding page already uses, and `color-mix` derives the muted and accent
 * variants from it. A missing token then degrades to "same colour as the text
 * around me", which is never invisible.
 */
export const token = {
  /** Primary body text. */
  text: 'var(--dsw-alias-label-primary, currentColor)',
  /** Secondary text: labels, values beside a primary line. */
  textSecondary: 'var(--dsw-alias-label-secondary, currentColor)',
  /** De-emphasized text: hints, timestamps, counts. */
  textMuted: 'var(--dsw-alias-label-tertiary, var(--dsw-alias-label-caption, color-mix(in srgb, currentColor 60%, transparent)))',
  /** Hairline borders and dividers. */
  border: 'var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 14%, transparent))',
  /** Slightly raised surface, for cards and inputs. */
  surface: 'var(--dsw-alias-bg-layer-2, transparent)',
  /** Higher layer surface (e.g. for card background). */
  surfaceRaised: 'var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-layer-2, transparent))',
  /** Module platform background (subtle secondary panel). */
  surfaceModule: 'var(--dsw-alias-bg-module-platform, color-mix(in srgb, currentColor 4%, transparent))',
  /** Recessed page background. */
  surfaceBase: 'var(--dsw-alias-bg-base, transparent)',
  /** Hover wash for rows and buttons. */
  hover: 'var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 6%, transparent))',
  /** Accent, for links and the active state. */
  accent: 'var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #2563eb))',
  /** Destructive and error. */
  danger: 'var(--dsw-alias-state-error-primary, #f25a5a)',
  /** Caution. */
  warn: 'var(--dsw-alias-state-warn-primary, #f59e0b)',
  /** Success. */
  success: 'var(--dsw-alias-state-success-primary, #22c55e)',
} as const

export function Section(props: {
  title: string
  description?: string
  action?: ReactNode
  onReset?: () => void
  children: ReactNode
}) {
  const t = useT()
  return (
    <section
      data-dsh-plugin="dsh-ext"
      data-dsh-part="section"
      style={{
        margin: '0 0 18px',
        color: token.text,
        background: 'var(--dsw-alias-bg-layer-1, var(--dsw-alias-bg-base, transparent))',
        border: `1px solid ${token.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}

    >
      <div
        data-dsh-part="section-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '13px 18px',
          borderBottom: `1px solid ${token.border}`,
          background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.1)))',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 3.5,
                height: 14,
                borderRadius: 2,
                background: 'var(--dsw-alias-state-business-primary, #2563eb)',
                flexShrink: 0,
              }}
            />
            <h3 style={{ margin: 0, fontSize: 14.5, lineHeight: 1.4, fontWeight: 600, color: token.text, letterSpacing: '0.01em' }}>
              {props.title}
            </h3>
          </div>
          {props.description !== undefined && (
            <p style={{ margin: '4px 0 0 12.5px', fontSize: 12, lineHeight: 1.5, color: token.textMuted }}>
              {props.description}
            </p>
          )}
        </div>
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {props.onReset !== undefined && (
            <button
              type="button"
              onClick={props.onReset}
              title={t('common.reset')}
              style={{
                appearance: 'none',
                background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
                border: `1px solid ${token.border}`,
                borderRadius: 14,
                padding: '3px 10px',
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 500,
                color: token.textMuted,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = token.text
                e.currentTarget.style.borderColor = 'var(--dsw-alias-border-l1, rgba(125,125,125,0.4))'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = token.textMuted
                e.currentTarget.style.borderColor = token.border
              }}
            >
              {t('common.reset')}
            </button>
          )}
          {props.action !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '3px 8px 3px 12px',
                borderRadius: 20,
                background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
                border: `1px solid ${token.border}`,
              }}
            >
              <span style={{ fontSize: 12, color: token.textSecondary, userSelect: 'none', fontWeight: 500 }}>
                {t('common.enabled')}
              </span>
              {props.action}
            </div>
          )}
        </div>
      </div>

      <style>{`
        [data-dsh-part="section-items"] > [data-dsh-part="setting-row"]:last-child {
          border-bottom: none !important;
        }
      `}</style>
      <div
        data-dsh-part="section-items"
        style={{
          padding: '2px 18px 14px',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
        }}
      >
        {props.children}
      </div>

    </section>
  )
}




export function Row(props: { label: string; hint?: string; control: ReactNode }) {
  return (
    <div
      data-dsh-part="setting-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        justifyContent: 'space-between',
        minHeight: 44,
        padding: '10px 0',
        borderBottom: `1px solid ${token.border}`,
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 auto' }}>
        <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500, color: token.text }}>{props.label}</div>
        {props.hint !== undefined && (
          <div style={{ fontSize: 11.5, lineHeight: 1.45, color: token.textMuted, marginTop: 2 }}>{props.hint}</div>
        )}
      </div>
      <div
        style={{
          flex: '0 1 auto',
          minWidth: 0,
          maxWidth: '60%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {props.control}
      </div>
    </div>
  )
}

export function Toggle(props: { checked: boolean; disabled?: boolean; onChange: (next: boolean) => void; label: string }) {
  const disabled = props.disabled === true
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      disabled={disabled}
      onClick={() => { props.onChange(!props.checked) }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 38,
        height: 22,
        padding: 2,
        border: props.checked
          ? '1px solid var(--dsw-alias-state-business-primary, #2563eb)'
          : `1px solid ${token.border}`,
        borderRadius: 999,
        background: props.checked
          ? 'var(--dsw-alias-state-business-primary, #2563eb)'
          : 'var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 18%, transparent))',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'background 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        flex: '0 0 auto',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
          transform: props.checked ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  )
}

export function Select<T extends string>(props: {
  value: T
  options?: readonly { value: T; label: string }[]
  groups?: readonly { group: string; options: readonly { value: T; label: string }[] }[]
  disabled?: boolean
  label: string
  width?: number | string
  maxWidth?: number | string
  onChange: (next: T) => void
}) {
  return (
    <select
      value={props.value}
      disabled={props.disabled === true}
      aria-label={props.label}
      onChange={event => { props.onChange(event.currentTarget.value as T) }}
      style={{
        ...inputStyle,
        display: 'inline-block',
        width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : 'auto',
        maxWidth: props.maxWidth ? (typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth) : '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >

      {props.groups !== undefined
        ? props.groups.map(group => (
            <optgroup
              key={group.group}
              label={group.group}
              style={{ color: token.text, background: token.surface, fontWeight: 600 }}
            >
              {group.options.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ color: token.text, background: token.surface, fontWeight: 400 }}
                >
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))
        : props.options?.map(option => (
            <option
              key={option.value}
              value={option.value}
              style={{ color: token.text, background: token.surface }}
            >
              {option.label}
            </option>
          ))}
    </select>
  )
}

export const inputStyle: CSSProperties = {
  font: 'inherit',
  fontSize: 12,
  color: token.text,
  background: 'var(--dsw-alias-bg-base, transparent)',
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: '5px 9px',
  outline: 'none',
  boxSizing: 'border-box',
}


export const buttonStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  userSelect: 'none',
  background: 'var(--dsw-alias-bg-layer-2, color-mix(in srgb, currentColor 5%, transparent))',
}



/** One indent step for in-place tree expansion (file tree, review folders). */
export const INDENT = 14

/**
 * One list row inside the side panel — the anatomy the file tree and the
 * review list share, so the two read as one panel rather than two designs.
 */
export const rowStyle: CSSProperties = {
  ...buttonStyle,
  display: 'flex',
  width: '100%',
  gap: 7,
  alignItems: 'center',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  padding: '5px 6px',
  fontSize: 15,
}

/**
 * A text field that commits on blur or Enter, not on every keystroke.
 *
 * Each commit is a settings write that round-trips to disk and re-renders the
 * page, so a per-keystroke field would fight the user for the caret. The local
 * buffer resyncs when the stored value changes underneath it — which happens
 * when a write lands, or when another window edits the same setting.
 */
export function TextField(props: {
  value: string
  disabled?: boolean
  placeholder?: string
  label: string
  width?: number
  onCommit: (next: string) => void
}) {
  const [draft, setDraft] = useState(props.value)
  const [editing, setEditing] = useState(false)
  if (!editing && draft !== props.value) setDraft(props.value)

  const commit = () => {
    setEditing(false)
    const next = draft.trim()
    if (next !== props.value) props.onCommit(next)
  }

  return (
    <input
      type="text"
      value={draft}
      aria-label={props.label}
      placeholder={props.placeholder}
      disabled={props.disabled}
      onFocus={() => { setEditing(true) }}
      onChange={(event) => { setDraft(event.currentTarget.value) }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') { event.currentTarget.blur() }
        if (event.key === 'Escape') { setDraft(props.value); setEditing(false) }
      }}
      style={{
        ...inputStyle,
        width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : 180,
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    />
  )
}


/** A bounded number field. Same commit-on-blur contract as {@link TextField}. */
export function TextAreaField(props: {
  value: string
  disabled?: boolean
  placeholder?: string
  label: string
  width?: number | string
  rows?: number
  onCommit: (next: string) => void
}) {
  const [draft, setDraft] = useState(props.value)
  const [editing, setEditing] = useState(false)
  if (!editing && draft !== props.value) setDraft(props.value)

  const commit = () => {
    setEditing(false)
    const next = draft.trim()
    if (next !== props.value) props.onCommit(next)
  }

  return (
    <textarea
      value={draft}
      aria-label={props.label}
      placeholder={props.placeholder}
      disabled={props.disabled}
      rows={props.rows ?? 6}
      onFocus={() => { setEditing(true) }}
      onChange={(event) => { setDraft(event.currentTarget.value) }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { setDraft(props.value); setEditing(false); event.currentTarget.blur() }
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') event.currentTarget.blur()
      }}
      style={{
        ...inputStyle,
        display: 'block',
        width: props.width !== undefined ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        resize: 'vertical',
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        lineHeight: 1.45,
      }}
    />
  )
}


export function NumberField(props: {
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  label: string
  suffix?: string
  width?: number
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState(String(props.value))
  const [editing, setEditing] = useState(false)
  if (!editing && draft !== String(props.value)) setDraft(String(props.value))

  const inputEl = (
    <input
      type="number"
      value={draft}
      min={props.min}
      max={props.max}
      step={props.step ?? 1}
      aria-label={props.label}
      disabled={props.disabled}
      onFocus={() => { setEditing(true) }}
      onChange={(event) => { setDraft(event.currentTarget.value) }}
      onBlur={() => {
        setEditing(false)
        const parsed = Number(draft)
        // Out-of-range or non-numeric input reverts rather than clamping: the
        // schema would refuse it anyway, and a silent clamp reads as accepted.
        if (!Number.isFinite(parsed) || parsed < props.min || parsed > props.max) {
          setDraft(String(props.value))
          return
        }
        if (parsed !== props.value) props.onCommit(parsed)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') { event.currentTarget.blur() }
        if (event.key === 'Escape') { setDraft(String(props.value)); setEditing(false) }
      }}
      style={{
        ...inputStyle,
        width: props.width ?? (props.suffix ? 84 : 96),
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    />
  )

  if (props.suffix) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {inputEl}
        <span style={{ fontSize: 12, color: token.textMuted, whiteSpace: 'nowrap' }}>{props.suffix}</span>
      </div>
    )
  }

  return inputEl
}

export function Notice(props: { kind: 'error' | 'info'; children: ReactNode }) {
  return (
    <div
      role={props.kind === 'error' ? 'alert' : 'status'}
      style={{
        fontSize: 12,
        lineHeight: 1.5,
        color: props.kind === 'error' ? token.danger : token.textMuted,
        border: `1px solid ${props.kind === 'error' ? token.danger : token.border}`,
        borderRadius: 6,
        padding: '6px 10px',
      }}
    >
      {props.children}
    </div>
  )
}
