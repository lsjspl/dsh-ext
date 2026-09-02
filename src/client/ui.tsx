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

export function Section(props: { title: string; description?: string; children: ReactNode }) {
  return (
    <section
      data-dsh-plugin="dsh-dev-tool-ext"
      data-dsh-part="section"
      style={{ borderBottom: `1px solid ${token.border}`, padding: '16px 0', color: token.text }}
    >
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: token.text }}>{props.title}</h3>
      {props.description !== undefined && (
        <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.5, color: token.textMuted }}>
          {props.description}
        </p>
      )}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {props.children}
      </div>
    </section>
  )
}

export function Row(props: { label: string; hint?: string; control: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: token.text }}>{props.label}</div>
        {props.hint !== undefined && (
          <div style={{ fontSize: 11, color: token.textMuted, marginTop: 2 }}>{props.hint}</div>
        )}
      </div>
      <div style={{ flex: '0 0 auto' }}>{props.control}</div>
    </div>
  )
}

export function Toggle(props: { checked: boolean; disabled?: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: props.disabled === true ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled === true}
        aria-label={props.label}
        onChange={event => { props.onChange(event.currentTarget.checked) }}
        // The accent keeps the native control on-theme; without it a checkbox
        // renders in the browser's own blue regardless of the skin.
        style={{ accentColor: token.accent, cursor: 'inherit' }}
      />
    </label>
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
