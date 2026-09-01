/**
 * A one-slot channel between the composer's image rail and the surfaces that
 * need to reach it.
 *
 * Why this exists rather than a file input in each caller: creating a
 * browser-owned draft image requires the conversation controller's attachment
 * registry, and the only surface handed that capability is the attachments slot
 * (`onAddImages`). Writing the draft needs `inputActions`, which likewise
 * arrives only on a session-scoped seat. The command popup, by contract,
 * receives nothing but a `sessionId` — so the rail publishes both verbs here and
 * the popup borrows them.
 *
 * One composer is on screen at a time, so a single registration is enough. The
 * rail registers on mount and clears on unmount; callers treat an absent
 * registration as "the feature is not available right now", which is also the
 * honest state while the rail half is switched off.
 */

/** What the mounted rail publishes for other surfaces to use. */
export interface PickerChannel {
  /** Open the rail's own file dialog (image attachment path). */
  readonly pick: () => void
  /** Append text to the composer draft, returning false when the machine refused. */
  readonly insertText: (text: string) => boolean
}

let channel: PickerChannel | undefined
const listeners = new Set<() => void>()

/** Register the rail's verbs. Returns the disposer that clears them. */
export function provideImagePicker(next: PickerChannel): () => void {
  channel = next
  for (const listener of listeners) listener()
  return () => {
    if (channel !== next) return
    channel = undefined
    for (const listener of listeners) listener()
  }
}

/** Open the rail's picker. No-op when no rail is mounted. */
export function openImagePicker(): void {
  channel?.pick()
}

/**
 * Append text to the composer draft.
 *
 * @returns false when no rail is mounted or the input machine refused the write.
 */
export function insertComposerText(text: string): boolean {
  return channel?.insertText(text) ?? false
}

/** `useSyncExternalStore` subscribe half, so callers re-render when a rail appears. */
export function subscribeImagePicker(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => { listeners.delete(onChange) }
}

/** `useSyncExternalStore` snapshot half. */
export function hasImagePicker(): boolean {
  return channel !== undefined
}
