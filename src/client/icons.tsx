/**
 * Inline SVG icons, in the host's own visual language.
 *
 * Emoji were the first attempt and were wrong: `🖼` (U+1F5BC) has no
 * variation-selector-16 and no glyph in the UI font stack, so the composer
 * rendered a tofu box rather than a picture. The host ships no icon module a
 * plugin can import either — its own buttons inline their paths — so these are
 * inline paths too, traced to match: 16×16 viewBox, `fill="currentColor"`, and
 * `aria-hidden` because every caller supplies its own accessible label.
 *
 * `panelRight` and `panelLeft` are the frame's own panel-toggle silhouette (the
 * one the sidebar's 收起侧边栏 button uses), mirrored per side, so the explorer's
 * toggle reads as part of the shell instead of a plugin's guess at one.
 */

interface IconProps {
  /** Edge length in px; the viewBox is square. */
  readonly size?: number
}

/** The host's 28px circular icon-button chrome, so plugin toggles match it. */
export const iconButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  border: 0,
  borderRadius: '50%',
  background: 'transparent',
  color: 'var(--dsw-alias-label-primary, currentColor)',
  cursor: 'pointer',
} as const

/** A framed panel with its right column filled — "open the right panel". */
export function PanelRightIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.68" y="1.2" width="14.64" height="13.6" rx="2.6" stroke="currentColor" strokeWidth="1.36" />
      <path d="M10.46 1.88V14.12" stroke="currentColor" strokeWidth="1.36" />
      <path d="M11.14 2.56H14.64V13.44H11.14V2.56Z" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

/** The same frame mirrored — "open the left panel". */
export function PanelLeftIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.68" y="1.2" width="14.64" height="13.6" rx="2.6" stroke="currentColor" strokeWidth="1.36" />
      <path d="M5.54 1.88V14.12" stroke="currentColor" strokeWidth="1.36" />
      <path d="M1.36 2.56H4.86V13.44H1.36V2.56Z" fill="currentColor" opacity="0.55" />
    </svg>
  )
}

/** A picture: frame, sun, and horizon. Replaces the tofu emoji. */
export function ImageIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.75" y="2.25" width="14.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.6" cy="6.4" r="1.35" fill="currentColor" />
      <path
        d="M1.4 12.1L5.05 8.9C5.5 8.5 6.18 8.52 6.6 8.95L8.6 11L10.6 8.6C11.05 8.06 11.88 8.06 12.33 8.6L14.6 11.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A file tree, for the explorer's own tab. */
export function FilesIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.4 2.2H6.2L7.4 3.8H13.6V13.2H2.4V2.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2.4 6.4H13.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/**
 * A disclosure chevron, rotated by `open`.
 *
 * One glyph rather than a down/right pair: rotating a single path is what lets
 * the arrow animate between the two states, and it keeps the collapsed and
 * expanded affordance identical in weight.
 */
export function ChevronIcon(props: IconProps & { readonly open: boolean }) {
  const size = props.size ?? 14
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        flex: '0 0 auto',
        transform: props.open ? 'rotate(90deg)' : 'none',
        transition: 'transform 120ms ease',
      }}
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The tick the host puts beside a chosen row. */
export function CheckIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.2 8.6L6.1 11.5L12.8 4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A plus, for the tab strip's "add a view" launcher. */
export function PlusIcon(props: IconProps) {
  const size = props.size ?? 14
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.4V12.6M3.4 8H12.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** An X, for closing one tab. Smaller weight than the host's dialog close. */
export function CloseIcon(props: IconProps) {
  const size = props.size ?? 12
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.2 4.2L11.8 11.8M11.8 4.2L4.2 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** VS Code's mark, for the "open this project in the editor" button. */
export function VscodeIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.55 1.05L6.5 5.85L3.6 3.65L2.05 4.35L4.75 7.05C5.05 7.35 5.05 7.85 4.75 8.15L2.05 10.85L3.6 11.55L6.5 9.35L11.55 14.15C12.05 14.6 12.85 14.35 12.95 13.7V1.5C12.85 0.85 12.05 0.6 11.55 1.05Z"
        fill="currentColor"
      />
      <path d="M11.5 4.35V10.85L7.85 7.6L11.5 4.35Z" fill="var(--dsw-alias-bg-base, #101014)" />
    </svg>
  )
}

/** A paperclip: the universal "attach a file" glyph. */
export function PaperclipIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12.4 7.3L7.7 12a2.9 2.9 0 0 1-4.1-4.1l5-5a1.95 1.95 0 0 1 2.75 2.75l-5 5a0.97 0.97 0 0 1-1.38-1.38l4.4-4.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A history arrow around a checkpoint dot — restore this answer's workspace. */
export function RestoreIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.1 5.2H6.2V2.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 5.1A5.4 5.4 0 1 1 2.8 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1.45" fill="currentColor" />
    </svg>
  )
}

/** A branch with two commits, for the changes tab. */
export function GitIcon(props: IconProps) {
  const size = props.size ?? 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4.2" cy="3.6" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.2" cy="12.4" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.8" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.2 5.5V10.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.9 8H7.6C5.72 8 4.2 6.48 4.2 4.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A shield with a check inside — the auto-review affordance. The shield keeps
 * it in the permission-mode family (the host's own mode glyphs are shields);
 * the check says "adjudicated", not merely guarded.
 */
export function ShieldCheckIcon(props: IconProps) {
  const size = props.size ?? 14
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8.2 1L14.8 3.5V7C14.8 12 11.05 14.2 8.2 15.1C5.35 14.2 1.6 12 1.6 7V3.5L8.2 1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M5.4 7.7L7.4 9.7L11 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
