/**
 * A one-slot channel between the composer's image rail and the tool-row button.
 *
 * Why this exists rather than a second file input in the button: creating a
 * browser-owned draft image requires the conversation controller's attachment
 * registry, and the only surface handed that capability is the attachments slot
 * (`onAddImages`). The tool-row slots receive `InputZone` — the conversation
 * snapshot and input state — and nothing that can admit a file. A button with
 * its own `<input type="file">` could read a File but would have nowhere to put
 * it, so the button asks the rail to open the picker it already owns.
 *
 * One composer is on screen at a time, so a single registration is enough. The
 * rail registers on mount and clears on unmount; the button renders as disabled
 * whenever nothing is registered, which is also the honest state while the
 * feature's `dragReorder`/rail half is switched off.
 */

type PickHandler = () => void

let handler: PickHandler | undefined
const listeners = new Set<() => void>()

/** Register the rail's picker. Returns the disposer that clears it. */
export function provideImagePicker(next: PickHandler): () => void {
  handler = next
  for (const listener of listeners) listener()
  return () => {
    if (handler !== next) return
    handler = undefined
    for (const listener of listeners) listener()
  }
}

/** Open the rail's picker. No-op when no rail is mounted. */
export function openImagePicker(): void {
  handler?.()
}

/** `useSyncExternalStore` subscribe half, so the button re-renders when a rail appears. */
export function subscribeImagePicker(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => { listeners.delete(onChange) }
}

/** `useSyncExternalStore` snapshot half. */
export function hasImagePicker(): boolean {
  return handler !== undefined
}
