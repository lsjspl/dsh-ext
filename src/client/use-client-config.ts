import { useEffect, useState } from 'react'
import { callApi } from './api.ts'
import type { Config } from '../config.ts'

/**
 * One shared read of the plugin's effective config for the *conversation*
 * surfaces.
 *
 * Deliberately a module-level cache rather than a hook-local fetch: the composer
 * has several entries (the rail, the picker button, the explorer dock, the
 * balance chip, auto-review toggle) that all need the same answer, and every one
 * of them mounts on session switch.
 *
 * Settings edits go through the settings page, which invalidates this cache on a
 * successful write, so a toggle takes effect immediately without a reload.
 */

interface ConfigResponse {
  readonly value: Config
  readonly revision: number
  readonly user: unknown
  readonly writable: boolean
}

let cached: Config | undefined
let inFlight: Promise<void> | undefined
const listeners = new Set<() => void>()

function publish(): void {
  for (const listener of listeners) {
    try {
      listener()
    } catch {}
  }
}

async function load(): Promise<void> {
  const result = await callApi<ConfigResponse>('/config')
  if (result.ok) {
    cached = result.value.value
    publish()
  }
}

function ensure(): void {
  if (cached !== undefined || inFlight !== undefined) return
  inFlight = load().finally(() => { inFlight = undefined })
}

/** Drop the cache and refetch, or apply immediately if nextConfig is provided. */
export function invalidateClientConfig(nextConfig?: Config): void {
  if (nextConfig !== undefined) {
    cached = nextConfig
    publish()
    return
  }
  cached = undefined
  inFlight = load().finally(() => { inFlight = undefined })
}

/** Subscribe to client config changes. */
export function subscribeClientConfig(listener: () => void): () => void {
  listeners.add(listener)
  ensure()
  return () => { listeners.delete(listener) }
}

/** Mutate config directly from conversation surfaces and publish instantly. */
export async function mutateClientConfig(ops: readonly { path: readonly string[]; value: unknown }[]): Promise<boolean> {
  // Optimistically apply to cache for instant UI feedback
  if (cached !== undefined) {
    const next = JSON.parse(JSON.stringify(cached)) as Record<string, any>
    for (const op of ops) {
      if (op.path.length === 2) {
        const [sec, key] = op.path
        if (sec && key && next[sec]) {
          next[sec][key] = op.value
        }
      }
    }
    cached = next as unknown as Config
    publish()
  }

  const result = await callApi<ConfigResponse>('/config/mutate', {
    body: {
      ops: ops.map(op => ({ op: 'set', path: op.path, value: op.value })),
    },
  })

  if (result.ok) {
    cached = result.value.value
    publish()
    return true
  }

  // Refetch if mutate failed
  invalidateClientConfig()
  return false
}

/**
 * The cached config, for callers that are not components.
 */
export function readClientConfig(): Config | undefined {
  ensure()
  return cached
}

/**
 * The plugin's effective config, or `undefined` until the first read lands.
 * Automatically triggers a re-render whenever the config changes.
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
