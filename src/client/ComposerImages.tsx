import { useCallback, useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent } from 'react'
import type { ComposerAttachment, ComposerAttachmentsProps, DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { provideImagePicker } from './picker-channel.ts'
import { token } from './ui.tsx'
import { useT } from './use-locale.ts'

/**
 * The input machine's state and action faces. Taken from the slot's own props
 * type rather than imported: the package exports the props of each seat but not
 * the two interfaces behind the session standard kit, and deriving them here
 * keeps this component pinned to the exact shape the slot actually delivers.
 */
type InputState = ComposerAttachmentsProps['useInput'] extends (selector: (state: infer S) => unknown) => unknown ? S : never
type InputActions = NonNullable<ComposerAttachmentsProps['inputActions']>

/**
 * Feature 1 — the composer's image rail, with a picker button and
 * drag-to-reorder.
 *
 * ## How reordering is possible at all
 *
 * The input machine's public face has `addImages`, `removeImage`, and
 * `pruneImages` — no reorder. But the two removal paths differ in a way that
 * makes reordering expressible:
 *
 *   - the attachments slot's own `onRemoveImage` RELEASES the preview (it is
 *     the user deleting an image);
 *   - `inputActions.removeImage` only drops the id from the draft. The bytes
 *     and the object URL stay in the browser registry.
 *
 * So a reorder is: drop every id through `inputActions`, then `addImages` them
 * back in the new order — which appends in the order given. The previews never
 * flicker because nothing was released, and submission order follows
 * `imageIds`, which is exactly what was rewritten.
 *
 * The machine refuses both calls during a busy admission phase, so a reorder is
 * only attempted while the phase is `plain`. Mid-send is precisely when a
 * silent reorder would change what gets sent.
 */

const THUMB = 56

export interface ComposerImagesProps {
  readonly attachments: readonly ComposerAttachment[]
  readonly canAcceptDrop: boolean
  readonly onAddImages: (files: readonly File[]) => void
  readonly onRemoveImage: (id: DraftAttachmentId) => void
  readonly dropLimits?: { readonly count: number; readonly size: string } | undefined
  /** Live input state; `undefined` before a session is current. */
  readonly input: InputState | undefined
  readonly actions: InputActions | undefined
  readonly dragEnabled: boolean
}

/**
 * Rewrite the draft's image order.
 *
 * Returns false when the machine refused, which the caller reports rather than
 * leaving the rail showing an order the draft does not have.
 */
function applyOrder(
  actions: InputActions,
  current: readonly DraftAttachmentId[],
  next: readonly DraftAttachmentId[],
): boolean {
  if (next.length !== current.length) return false
  // Same set, different sequence — verified before touching the draft so a bug
  // here can never drop an image.
  const currentSet = new Set(current)
  if (next.some(id => !currentSet.has(id))) return false

  for (const id of current) actions.removeImage(id)
  const accepted = actions.addImages(next)
  if (!accepted) {
    // Put the original order back; the machine took the removals but refused
    // the append, and a draft with no images is not what the user asked for.
    actions.addImages(current)
    return false
  }
  return true
}

export function ComposerImages(props: ComposerImagesProps) {
  const { attachments, canAcceptDrop, dropLimits, onAddImages, onRemoveImage, input, actions, dragEnabled } = props
  const t = useT()
  const [dragging, setDragging] = useState<DraftAttachmentId | undefined>(undefined)
  const [over, setOver] = useState<DraftAttachmentId | undefined>(undefined)
  const [fileOver, setFileOver] = useState(false)
  const [refused, setRefused] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)

  // A refusal notice is transient: it explains one failed gesture, and leaving
  // it up would attach it to the next one.
  useEffect(() => {
    if (!refused) return
    const timer = window.setTimeout(() => { setRefused(false) }, 2600)
    return () => { window.clearTimeout(timer) }
  }, [refused])

  const reorderable = dragEnabled
    && actions !== undefined
    && input?.phase === 'plain'
    && attachments.length > 1

  const commitMove = useCallback((from: DraftAttachmentId, to: DraftAttachmentId) => {
    if (actions === undefined || input === undefined || from === to) return
    const ids = [...input.imageIds]
    const fromIndex = ids.indexOf(from)
    const toIndex = ids.indexOf(to)
    if (fromIndex < 0 || toIndex < 0) return
    ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, from)
    if (!applyOrder(actions, input.imageIds, ids)) setRefused(true)
  }, [actions, input])

  /** Keyboard reordering, so the feature is not mouse-only. */
  const nudge = useCallback((id: DraftAttachmentId, delta: -1 | 1) => {
    if (actions === undefined || input === undefined) return
    const ids = [...input.imageIds]
    const index = ids.indexOf(id)
    const target = index + delta
    if (index < 0 || target < 0 || target >= ids.length) return
    const moved = ids[index]
    const displaced = ids[target]
    if (moved === undefined || displaced === undefined) return
    ids[index] = displaced
    ids[target] = moved
    if (!applyOrder(actions, input.imageIds, ids)) setRefused(true)
  }, [actions, input])

  const pick = useCallback(() => { fileInput.current?.click() }, [])

  // Publish the picker for the tool-row button, which has no way to admit a
  // file of its own (see picker-channel.ts).
  useEffect(() => provideImagePicker(pick), [pick])

  const onPicked = useCallback((files: FileList | null) => {
    if (files === null || files.length === 0) return
    const images = [...files].filter(file => file.type.startsWith('image/'))
    if (images.length > 0) onAddImages(images)
    // Reset so choosing the same file twice in a row still fires a change.
    if (fileInput.current !== null) fileInput.current.value = ''
  }, [onAddImages])

  const onDragStart = (id: DraftAttachmentId) => (event: ReactDragEvent<HTMLDivElement>) => {
    if (!reorderable) return
    setDragging(id)
    event.dataTransfer.effectAllowed = 'move'
    // A payload is required for the drag to be valid in Firefox, and marking it
    // as ours keeps a file drop from being read as a reorder.
    event.dataTransfer.setData('application/x-dsh-draft-image', id)
  }

  const onDragOver = (id: DraftAttachmentId) => (event: ReactDragEvent<HTMLDivElement>) => {
    if (!reorderable || dragging === undefined) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setOver(id)
  }

  const onDrop = (id: DraftAttachmentId) => (event: ReactDragEvent<HTMLDivElement>) => {
    if (!reorderable || dragging === undefined) return
    event.preventDefault()
    event.stopPropagation()
    commitMove(dragging, id)
    setDragging(undefined)
    setOver(undefined)
  }

  const endDrag = () => {
    setDragging(undefined)
    setOver(undefined)
  }

  /**
   * File drops from outside the page.
   *
   * Occupying this seat means owning the drop affordance too, not only the
   * thumbnails: the shipped rail this shadows is the composer's drop target, and
   * a replacement that ignored `canAcceptDrop` would quietly remove the ability
   * to drag an image in from the desktop.
   *
   * A reorder drag carries this plugin's own payload type, so the two gestures
   * are told apart by what the drag holds rather than by guessing from state.
   */
  const isFileDrag = (event: ReactDragEvent<HTMLDivElement>): boolean =>
    event.dataTransfer.types.includes('Files')
    && !event.dataTransfer.types.includes('application/x-dsh-draft-image')

  const onFileDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop || !isFileDrag(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setFileOver(true)
  }

  const onFileDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop || !isFileDrag(event)) return
    event.preventDefault()
    setFileOver(false)
    const images = [...event.dataTransfer.files].filter(file => file.type.startsWith('image/'))
    if (images.length > 0) onAddImages(images)
  }

  return (
    <div
      data-dsh-plugin="dsh-dev-tool-ext"
      data-dsh-part="composer-images"
      onDragOver={onFileDragOver}
      onDragLeave={() => { setFileOver(false) }}
      onDrop={onFileDrop}
      style={fileOver
        ? { outline: `2px dashed ${token.accent}`, outlineOffset: 2, borderRadius: 8 }
        : undefined}
    >
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-hidden="true"
        tabIndex={-1}
        onChange={event => { onPicked(event.currentTarget.files) }}
      />

      {attachments.length > 0 && (
        <div
          role="list"
          aria-label={t('images.rail')}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '6px 0 2px' }}
        >
          {attachments.map((attachment, index) => {
            const isOver = over === attachment.id && dragging !== attachment.id
            return (
              <div
                key={attachment.id}
                role="listitem"
                draggable={reorderable}
                onDragStart={onDragStart(attachment.id)}
                onDragOver={onDragOver(attachment.id)}
                onDragLeave={() => { if (over === attachment.id) setOver(undefined) }}
                onDrop={onDrop(attachment.id)}
                onDragEnd={endDrag}
                title={reorderable ? `${attachment.file.name} — drag to reorder` : attachment.file.name}
                style={{
                  position: 'relative',
                  width: THUMB,
                  height: THUMB,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${isOver ? token.accent : token.border}`,
                  outline: isOver ? `2px solid ${token.accent}` : 'none',
                  outlineOffset: -2,
                  opacity: dragging === attachment.id ? 0.4 : 1,
                  cursor: reorderable ? 'grab' : 'default',
                  background: token.surface,
                  transition: 'opacity 120ms ease, outline-color 120ms ease',
                }}
              >
                <img
                  src={attachment.previewUrl}
                  alt={attachment.file.name}
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />

                {reorderable && (
                  // Keyboard equivalent of the drag. Visually quiet, but present
                  // in the tab order: a reorder no one can reach by keyboard is
                  // a reorder half the users do not have.
                  <div style={{ position: 'absolute', left: 2, bottom: 2, display: 'flex', gap: 2 }}>
                    <button
                      type="button"
                      aria-label={`Move ${attachment.file.name} earlier`}
                      disabled={index === 0}
                      onClick={() => { nudge(attachment.id, -1) }}
                      style={nudgeStyle}
                    >‹</button>
                    <button
                      type="button"
                      aria-label={`Move ${attachment.file.name} later`}
                      disabled={index === attachments.length - 1}
                      onClick={() => { nudge(attachment.id, 1) }}
                      style={nudgeStyle}
                    >›</button>
                  </div>
                )}

                <button
                  type="button"
                  aria-label={`Remove ${attachment.file.name}`}
                  onClick={() => { onRemoveImage(attachment.id) }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    lineHeight: '16px',
                    fontSize: 12,
                    padding: 0,
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    background: 'rgba(0,0,0,0.55)',
                  }}
                >×</button>
              </div>
            )
          })}
        </div>
      )}

      {/*
        The drop invitation, shown only while a file is actually over the
        composer. The shipped rail reserves no space when idle, and taking this
        seat should not start costing layout the seat did not cost before.
      */}
      {fileOver && attachments.length === 0 && (
        <div
          role="status"
          style={{
            fontSize: 11,
            color: token.accent,
            padding: '8px 10px',
            textAlign: 'center',
          }}
        >
          {dropLimits === undefined
            ? 'Drop images to attach them'
            : `Drop up to ${dropLimits.count} image(s), ${dropLimits.size} each`}
        </div>
      )}

      {refused && (
        <div role="status" style={{ fontSize: 11, color: token.textMuted, paddingBottom: 4 }}>
          The composer is busy sending; the image order was left as it was.
        </div>
      )}

    </div>
  )
}

const nudgeStyle = {
  width: 16,
  height: 16,
  padding: 0,
  fontSize: 11,
  lineHeight: '14px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  color: '#fff',
  background: 'rgba(0,0,0,0.55)',
} as const

