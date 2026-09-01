import { useEffect } from 'react'
import { ExplorerPanel } from './ExplorerPanel.tsx'
import { token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { setPanelOpen, usePanelOpen } from './panel-state.ts'

/**
 * The explorer's docked side panel — a real column, not a floating overlay.
 *
 * ## Why the panel reserves width instead of covering the conversation
 *
 * The frame is a CSS grid: `${sidebar}px minmax(0, 1fr) ${details}px`. The centre
 * track is `1fr`, so it genuinely reflows — but the right track's slot (`details`)
 * is `single` and owned by ui-conversation's DetailsPanel, which declares the
 * tool-details seat *inside itself* and feeds it from a package-private chat
 * store. Registering there replaces the column and takes tool details down with
 * it, and abdication is crash-only, so the loss would be permanent. Trading away
 * working tool details to gain a placement is not a trade worth making.
 *
 * So the panel mounts in `shell.overlay` (the documented frame-wide seat) but
 * does not behave like an overlay: while it is open it sets `padding-inline-end`
 * on the centre column, which shrinks the conversation's own content box by
 * exactly the panel's width. The chat is pushed to the middle and nothing is
 * covered — the visible result the `details` column would have given, without
 * dismantling a host feature to get it.
 *
 * The padding is written directly on the host's centre-column element and removed
 * on close, because the alternative — a stylesheet keyed to the host's hashed
 * class name — would break the first time the host rebuilt its CSS modules.
 */

const PANEL_WIDTH = 340

export interface SidePanelProps {
  readonly side: 'left' | 'right'
  readonly defaultOpen: boolean
}

/** The host's centre column: the element whose content box must shrink. */
function centreColumn(): HTMLElement | undefined {
  const overlay = document.querySelector('[data-shell-overlay]')
  const frame = overlay?.parentElement
  if (frame === null || frame === undefined) return undefined
  // The centre track is the second grid child; identify it structurally rather
  // than by the host's hashed class name, which is not a stable contract.
  const columns = [...frame.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement && !child.hasAttribute('data-shell-overlay'),
  )
  return columns[1]
}

export function SidePanel(props: SidePanelProps) {
  const t = useT()
  const open = usePanelOpen(props.defaultOpen)

  // Reserve the panel's width on the conversation column, and give it back on
  // close or unmount. Written as a layout effect's sibling rather than inside
  // render because it touches a DOM node this component does not own.
  useEffect(() => {
    const centre = centreColumn()
    if (centre === undefined) return
    const edge = props.side === 'right' ? 'paddingInlineEnd' : 'paddingInlineStart'
    const previous = centre.style[edge]
    centre.style[edge] = open ? `${PANEL_WIDTH}px` : previous
    // A transition matching the frame's own column animation, so opening the
    // panel reads as one movement with the rest of the shell.
    const previousTransition = centre.style.transition
    centre.style.transition = 'padding var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease)'
    return () => {
      centre.style[edge] = previous
      centre.style.transition = previousTransition
    }
  }, [open, props.side])

  // Escape closes it, like every other transient surface in the shell.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPanelOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!open) return null

  return (
    <div
      data-dsh-plugin="dsh-dev-tool-ext"
      data-dsh-part="side-panel"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        ...(props.side === 'right' ? { right: 0 } : { left: 0 }),
        width: PANEL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        padding: 10,
        gap: 8,
        color: token.text,
        background: token.surfaceBase,
        borderLeft: props.side === 'right' ? `1px solid ${token.border}` : 'none',
        borderRight: props.side === 'left' ? `1px solid ${token.border}` : 'none',
        overflow: 'hidden',
        // The overlay layer is click-through; this subtree opts back in.
        pointerEvents: 'auto',
      }}
      aria-label={t('explorer.title')}
    >
      <ExplorerPanel />
    </div>
  )
}
