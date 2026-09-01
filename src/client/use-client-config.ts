import { useEffect, useState } from 'react'
import { callApi } from './api.ts'
import type { Config } from '../config.ts'

/**
 * One shared read of the plugin's effective config for the *conversation*
 * surfaces.
 *
 * Deliberately a module-level cache rather than a hook-local fetch: the composer
 * has several entries (the rail, the picker button, the explorer dock, the
 * balance chip) that all need the same answer, and every one of them mounts on
 * every session switch. A per-component fetch would mean four requests per
 * switch for a value that changes only when someone edits Settings.
 *
 * Settings edits go through the settings page, which invalidates this cache on a
 * successful write, so a toggle takes effect without a reload.
 */

let cached: Config | undefined
let inFlight: Promise<void> | undefined
const listeners = new Set<() => void>()

function publish(): void {
  for (const listener of listeners) listener()
}

async function load(): Promise<void> {
  const result = await callApi<{ value: Config }>('/config')
  if (result.ok) {
    cached = result.value.value
    publish()
  }
}

function ensure(): void {
  if (cached !== undefined || inFlight !== undefined) return
  inFlight = load().finally(() => { inFlight = undefined })
}

/** Drop the cache and refetch. Called after a settings write commits. */
export function invalidateClientConfig(): void {
  cached = undefined
  inFlight = load().finally(() => { inFlight = undefined })
}

/**
 * The cached config, for callers that are not components.
 *
 * The input-trigger source answers its candidate query in a plain async
 * callback, so it cannot subscribe through the hook below. It also must not
 * block that query on a fetch: the menu is already open by then, and returning
 * late reads as a dropped row. So this returns whatever is cached and kicks off
 * the first load — a menu opened before any surface has mounted misses the
 * entry once, and the next open has it.
 */
export function readClientConfig(): Config | undefined {
  ensure()
  return cached
}

/**
 * The plugin's effective config, or `undefined` until the first read lands.
 *
 * Every caller treats `undefined` as "render nothing": a feature surface that
 * flashed into view before its switch was known would appear for a moment even
 * when it is turned off, which is worse than appearing a moment late.
 */
export function useClientConfig(): Config | undefined {
  const [, bump] = useState(0)

  useEffect(() => {
    const listener = () => { bump(value => value + 1) }
    listeners.add(listener)
    ensure()
    return () => { listeners.delete(listener) }
  }, [])

  return cached
}
