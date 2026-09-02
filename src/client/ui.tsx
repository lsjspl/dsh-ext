import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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
  textSecondary: 'var(--dsw-alias-label-secondary, color-mix(in srgb, currentColor 80%, transparent))',
  /** De-emphasized text: hints, timestamps, counts. */
  textMuted: 'var(--dsw-alias-label-caption, color-mix(in srgb, currentColor 60%, transparent))',
  /** Hairline borders and dividers. */
  border: 'var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 20%, transparent))',
  /** Slightly raised surface, for cards and inputs. */
  surface: 'var(--dsw-alias-bg-layer-2, transparent)',
  /** Recessed page background. */
  surfaceBase: 'var(--dsw-alias-bg-base, transparent)',
  /** Hover wash for rows and buttons. */
  hover: 'var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent))',
  /** Accent, for links and the active state. */
  accent: 'var(--dsw-alias-brand-primary, currentColor)',
  /** Destructive and error. */
  danger: 'var(--dsw-alias-state-error-primary, #f25a5a)',
  /** Caution. */
  warn: 'var(--dsw-alias-state-warn-primary, #f59e0b)',
  /** Success. */
  success: 'var(--dsw-alias-state-success-primary, #22c55e)',
} as const

export function Section(props: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section
      data-dsh-plugin="dsh-dev-tool-ext"
      data-dsh-part="section"
      style={{ padding: '18px 0 20px', color: token.text }}
    >
      <div
        data-dsh-part="section-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 12px',
          borderLeft: `3px solid ${token.accent}`,
          background: token.hover,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 15, lineHeight: 1.35, fontWeight: 600, color: token.text }}>
            {props.title}
          </h3>
          {props.description !== undefined && (
            <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.5, color: token.textMuted }}>
              {props.description}
            </p>
          )}
        </div>
        {props.action !== undefined && <div style={{ flex: '0 0 auto', alignSelf: 'flex-start', paddingTop: 1 }}>{props.action}</div>}
      </div>
      <div
        data-dsh-part="section-items"
        style={{
          marginLeft: 15,
          paddingLeft: 14,
          borderLeft: `1px solid ${token.border}`,
          display: 'flex',
          flexDirection: 'column',
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
        gap: 18,
        justifyContent: 'space-between',
        minHeight: 42,
        padding: '9px 4px 9px 0',
        borderBottom: `1px solid color-mix(in srgb, ${token.border} 55%, transparent)`,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, lineHeight: 1.35, fontWeight: 500, color: token.text }}>{props.label}</div>
        {props.hint !== undefined && (
          <div style={{ fontSize: 11, lineHeight: 1.45, color: token.textMuted, marginTop: 3 }}>{props.hint}</div>
        )}
      </div>
      <div style={{ flex: '0 0 auto', maxWidth: '55%' }}>{props.control}</div>
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
        width: 36,
        height: 20,
        padding: 2,
        border: `1px solid ${props.checked ? token.accent : token.border}`,
        borderRadius: 999,
        background: props.checked ? token.accent : token.surface,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background 140ms ease, border-color 140ms ease, opacity 140ms ease',
        flex: '0 0 auto',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: props.checked ? 'var(--dsw-alias-bg-base, #fff)' : token.textMuted,
          boxShadow: '0 1px 2px color-mix(in srgb, #000 35%, transparent)',
          transform: props.checked ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 140ms ease, background 140ms ease',
        }}
      />
    </button>
  )
}

export function Select<T extends string>(props: {
  value: T
  options: readonly { value: T; label: string }[]
  disabled?: boolean
  label: string
  onChange: (next: T) => void
}) {
  return (
    <select
      value={props.value}
      disabled={props.disabled === true}
      aria-label={props.label}
      onChange={event => { props.onChange(event.currentTarget.value as T) }}
      style={{ ...inputStyle, minWidth: 140 }}
    >
      {props.options.map(option => (
        // A native option list is painted by the OS, which does not read our
        // tokens; the explicit pair keeps it legible under a dark theme.
        <option key={option.value} value={option.value} style={{ color: token.text, background: token.surface }}>
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
  background: token.surface,
  border: `1px solid ${token.border}`,
  borderRadius: 6,
  padding: '4px 8px',
}

export const buttonStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  userSelect: 'none',
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
  gap: 6,
  alignItems: 'center',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  padding: '4px 6px',
  fontSize: 13,
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
      style={{ ...inputStyle, width: props.width ?? 180 }}
    />
  )
}

/** A bounded number field. Same commit-on-blur contract as {@link TextField}. */
export function TextAreaField(props: {
  value: string
  disabled?: boolean
  placeholder?: string
  label: string
  width?: number
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
        width: props.width ?? 320,
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
  onCommit: (next: number) => void
}) {
  const [draft, setDraft] = useState(String(props.value))
  const [editing, setEditing] = useState(false)
  if (!editing && draft !== String(props.value)) setDraft(String(props.value))

  return (
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
      style={{ ...inputStyle, width: 100 }}
    />
  )
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
