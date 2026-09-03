import { useCallback, useSyncExternalStore } from 'react'
import { callApi } from './api.ts'
import type { TurnInfoView } from '../shared/api-contract.ts'

/**
 * Module-level cache behind the per-turn changes card.
 *
 * The tail seat this card renders into is an elect-one chain that the host
 * re-renders on its own schedule; a card mounted during the page's first
 * seconds can be unmounted by that churn and remounted later. Component-local
 * fetch state would die with each unmount — the card would refetch from zero
 * on every remount, which is exactly the "appears late" behaviour under
 * investigation. This store outlives the components: one in-flight fetch per
 * key, results cached with a timestamp, subscribers notified, and a single
 * module-level ticker refreshing the keys some subscriber still wants.
 */

interface Entry {
  readonly key: string
  data: TurnInfoView | undefined
  fetchedAt: number
  error: string | undefined
  /** Subscriber count; the ticker refreshes only keys with a live subscriber. */
  refs: number
  inFlight: Promise<void> | undefined
  /**
   * Bumped on every data/error change. `useSyncExternalStore` re-renders only
   * when its getSnapshot VALUE changes, and mutating one entry object in place
   * never changes a reference — the version is the observable snapshot.
   */
  version: number
}

const STORE = new Map<string, Entry>()
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of [...listeners]) listener()
}

function keyOf(session: string, turn: number): string {
  return `${session}\n${turn}`
}

/** One refresh pass: refetch every subscribed key older than maxAge. */
function refresh(maxAgeMs: number): void {
  const now = Date.now()
  for (const entry of STORE.values()) {
    // Skip entries with no active subscribers
    if (entry.refs <= 0) continue
    if (now - entry.fetchedAt < maxAgeMs) continue
    if (entry.inFlight !== undefined) continue
    entry.inFlight = callApi<TurnInfoView>(`/checkpoints/turn-info?session=${encodeURIComponent(entryKeySession(entry.key))}&turn=${entryKeyTurn(entry.key)}`)
      .then(result => {
        if (result.ok) {
          // Keep the last good view over a transient empty answer — a fork
          // boundary or a busy server must not blank a card.
          const current = entry.data
          const next = result.value
          entry.data = current !== undefined && current.checkpointId !== undefined && next.checkpointId === undefined
            ? current
            : next
          entry.error = undefined
        } else {
          entry.error = result.message
        }
        entry.fetchedAt = Date.now()
        entry.version += 1
        notify()
      })
      .catch(() => { /* network hiccups try again on the next pass */ })
      .finally(() => { entry.inFlight = undefined })
  }
}

let ticker: number | undefined

function ensureTicker(): void {
  if (ticker !== undefined) return
  // AGGRESSIVE POLLING FIX: Reduce interval from 10s to 2s while a turn is
  // running (data === undefined), so the card appears promptly when the turn
  // finishes. Once all subscribed entries have data, the ticker can back off
  // to 10s. The server-side cache makes frequent polling cheap.
  ticker = window.setInterval(() => {
    const hasRunningTurns = [...STORE.values()].some(e => e.refs > 0 && e.data === undefined)
    refresh(hasRunningTurns ? 2_000 : 10_000)
  }, 2_000)
}

function entryKeySession(key: string): string {
  return key.slice(0, key.lastIndexOf('\n'))
}

function entryKeyTurn(key: string): number {
  return Number(key.slice(key.lastIndexOf('\n') + 1))
}

function entryOf(key: string): Entry {
  let entry = STORE.get(key)
  if (entry === undefined) {
    entry = { key, data: undefined, fetchedAt: 0, error: undefined, refs: 0, inFlight: undefined, version: 0 }
    STORE.set(key, entry)
  }
  return entry
}

/**
 * The store's listener registry, handed to `useTurnInfo` by its caller. Kept
 * as a stable module-level function so the hook's subscribe argument never
 * changes identity.
 */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

/**
 * Subscribe to one turn's info. Returns the current snapshot and keeps the
 * caller updated; the module ticker refetches every 2-10s while subscribed.
 * The first read for an unknown key fetches immediately — and, because the
 * cache is module-level, a remount reads the answer that is already landing.
 */
export function useTurnInfo(session: string, turn: number): {
  data: TurnInfoView | undefined
  error: string | undefined
} {
  const key = keyOf(session, turn)

  // Stable subscribe function that properly manages ref counting and triggers
  // immediate fetch for cold entries.
  const subscribeKey = useCallback((fn: () => void) => {
    const entry = entryOf(key)
    entry.refs += 1
    ensureTicker()

    // IMMEDIATE FETCH FIX: Check if this is a cold entry (no data, no fetch
    // in flight) regardless of ref count. The old `entry.refs === 1` check
    // failed when the component remounted with a cached entry object that
    // already had refs > 0 from a prior mount — the card would wait 10s for
    // the ticker instead of fetching immediately.
    if (entry.data === undefined && entry.inFlight === undefined) {
      refresh(0)
    }

    // Subscribe to global notifications
    const unsubscribeGlobal = subscribe(fn)

    // Return cleanup that decrements ref count and unsubscribes
    return () => {
      entry.refs -= 1
      unsubscribeGlobal()
    }
  }, [key]) // Depend on key, not entry, so the function is stable per turn

  // The version number IS the snapshot: it changes exactly when the entry's
  // data changed, which is the re-render signal useSyncExternalStore needs.
  // Read from STORE directly to avoid stale closure over entry reference.
  const getSnapshot = useCallback(() => {
    const entry = entryOf(key)
    return entry.version
  }, [key])

  useSyncExternalStore(subscribeKey, getSnapshot)

  // Read current state from STORE, not from a potentially stale entry reference
  const entry = entryOf(key)
  return { data: entry.data, error: entry.error }
}
