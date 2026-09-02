import { useCallback, useEffect, useRef } from 'react'
import { ExplorerPanel } from './ExplorerPanel.tsx'
import { token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { setPanelOpen, usePanelOpen, usePanelSession } from './panel-state.ts'
import {
  MAX_PANEL_WIDTH,
  MIN_PANEL_WIDTH,
  clampWidth,
  setPanelWidth,
  usePanelWidth,
} from './use-workspace.ts'

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

export interface SidePanelProps {
  readonly side: 'left' | 'right'
  readonly defaultOpen: boolean
  /**
   * The workspace the panel should describe, when the browser knows it.
   *
   * This seat is root-scoped, so it is handed no session. Without either hint the
   * server falls back to the registry's oldest entry and the panel truthfully
   * describes the wrong project — which is how "不是 git 仓库" appeared for a
   * directory that plainly is one.
   */
  readonly workspace?: string
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
  const width = usePanelWidth()
  // Read by the padding effect to suppress its transition mid-drag. A ref, not
  // state: it must not itself trigger the render it is describing.
  const dragging = useRef(false)
  // This seat is root-scoped and gets no `sessionId`; the session-scoped header
  // toggle publishes it. Without it the host falls back to the registry's oldest
  // workspace and the panel describes an unrelated project.
  const session = usePanelSession()

  // Reserve the panel's width on the conversation column, and give it back on
  // close or unmount. Written as a layout effect's sibling rather than inside
  // render because it touches a DOM node this component does not own.
  useEffect(() => {
    const centre = centreColumn()
    if (centre === undefined) return
    const edge = props.side === 'right' ? 'paddingInlineEnd' : 'paddingInlineStart'
    const previous = centre.style[edge]
    centre.style[edge] = open ? `${width}px` : previous
    // A transition matching the frame's own column animation, so opening the
    // panel reads as one movement with the rest of the shell.
    const previousTransition = centre.style.transition
    // No transition while a drag is live: animating each pointermove would make
    // the column lag a pointer the user is still moving.
    centre.style.transition = dragging.current
      ? 'none'
      : 'padding var(--ds-transition-duration-slow, 200ms) var(--ds-ease-in-out, ease)'
    return () => {
      centre.style[edge] = previous
      centre.style.transition = previousTransition
    }
  }, [open, props.side, width])

  // Escape closes it, like every other transient surface in the shell.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPanelOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [open])

  /**
   * Resize by dragging the panel's inner edge.
   *
   * Pointer capture rather than document-level listeners: capture keeps every
   * move event addressed to the handle even when the pointer outruns it, which is
   * exactly what happens on a fast drag. Without it the drag silently stops the
   * moment the cursor crosses into the conversation.
   */
  const onHandleDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const handle = event.currentTarget
    const startX = event.clientX
    const startWidth = width
    dragging.current = true
    handle.setPointerCapture(event.pointerId)

    const onMove = (move: PointerEvent) => {
      // A right-docked panel grows as the pointer moves LEFT, so the delta is
      // signed by the side rather than taken absolutely.
      const delta = props.side === 'right' ? startX - move.clientX : move.clientX - startX
      setPanelWidth(clampWidth(startWidth + delta))
    }
    const onUp = () => {
      dragging.current = false
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }, [props.side, width])

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
        width,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        padding: 12,
        gap: 8,
        // The host's compact-surface size: its read cards and search blocks set
        // 13px, and a panel that guesses smaller reads as fine print against
        // them. Family stays inherited, so the face is always the shell's own.
        fontSize: 13,
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
      <div
        role="separator"
        aria-label={t('explorer.resize')}
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_PANEL_WIDTH}
        aria-valuemax={MAX_PANEL_WIDTH}
        onPointerDown={onHandleDown}
        onKeyDown={(event) => {
          // Keyboard resizing, because a pointer-only affordance is unreachable
          // for anyone who cannot use one. 16px matches the shell's own step.
          const step = event.shiftKey ? 64 : 16
          if (event.key === 'ArrowLeft') setPanelWidth(width + (props.side === 'right' ? step : -step))
          else if (event.key === 'ArrowRight') setPanelWidth(width + (props.side === 'right' ? -step : step))
          else return
          event.preventDefault()
        }}
        tabIndex={0}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          ...(props.side === 'right' ? { left: -3 } : { right: -3 }),
          width: 7,
          cursor: 'col-resize',
          // Above the panel's own content so the grab area is never stolen by a
          // row that happens to sit against the edge.
          zIndex: 1,
          touchAction: 'none',
        }}
      />
      <ExplorerPanel sessionId={session} workspace={props.workspace} />
    </div>
  )
}
