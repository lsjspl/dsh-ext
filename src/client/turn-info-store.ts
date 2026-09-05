import { useCallback, useSyncExternalStore } from 'react'
import { callApi, type ApiResult } from './api.ts'
import type { TurnInfoView } from '../shared/api-contract.ts'

interface Entry {
  session: string
  turn: number
  data?: TurnInfoView
  error?: string
  fetchedAt: number
  touchedAt: number
  version: number
  listeners: Set<() => void>
}

type FetchTurns = (session: string, turns: readonly number[]) => Promise<ApiResult<{ turns: TurnInfoView[] }>>

/** One batched poll per session; only subscribed entries keep the timer alive. */
export class TurnInfoStore {
  private readonly entries = new Map<string, Entry>()
  private readonly inFlight = new Set<string>()
  private timer: number | undefined
  private queued = false
  private generation = 0

  constructor(private readonly fetchTurns: FetchTurns) {}

  private entry(session: string, turn: number): Entry {
    const key = `${session}\n${turn}`
    let entry = this.entries.get(key)
    if (!entry) {
      this.prune()
      entry = { session, turn, fetchedAt: 0, touchedAt: Date.now(), version: 0, listeners: new Set() }
      this.entries.set(key, entry)
    }
    return entry
  }

  private prune(): void {
    const idle = [...this.entries.entries()].filter(([, entry]) => entry.listeners.size === 0)
      .sort((a, b) => a[1].touchedAt - b[1].touchedAt)
    for (const [key, entry] of idle) {
      if (this.entries.size < 200 && Date.now() - entry.touchedAt < 60_000) break
      this.entries.delete(key)
    }
  }

  read(session: string, turn: number): Entry { return this.entry(session, turn) }

  subscribe(session: string, turn: number, listener: () => void): () => void {
    const entry = this.entry(session, turn)
    if (entry.listeners.size === 0) entry.fetchedAt = 0
    entry.listeners.add(listener)
    entry.touchedAt = Date.now()
    if (this.timer === undefined) {
      this.timer = window.setInterval(() => { void this.refresh() }, 2_000)
      window.addEventListener('dsh-ext-checkpoints-changed', this.invalidate)
    }
    if (!this.queued) {
      this.queued = true
      queueMicrotask(() => { this.queued = false; void this.refresh() })
    }
    return () => {
      entry.listeners.delete(listener)
      entry.touchedAt = Date.now()
      this.prune()
      if (![...this.entries.values()].some(item => item.listeners.size > 0) && this.timer !== undefined) {
        window.clearInterval(this.timer)
        this.timer = undefined
        window.removeEventListener('dsh-ext-checkpoints-changed', this.invalidate)
      }
    }
  }

  readonly invalidate = (): void => {
    this.generation++
    for (const entry of this.entries.values()) entry.fetchedAt = 0
    void this.refresh()
  }

  async refresh(): Promise<void> {
    const groups = new Map<string, Entry[]>()
    const now = Date.now()
    for (const entry of this.entries.values()) {
      const maxAge = entry.data?.closed === true ? 60_000 : 2_000
      if (entry.listeners.size === 0 || this.inFlight.has(entry.session) || now - entry.fetchedAt < maxAge) continue
      const group = groups.get(entry.session) ?? []
      group.push(entry)
      groups.set(entry.session, group)
    }
    await Promise.all([...groups].map(async ([session, entries]) => {
      const generation = this.generation
      this.inFlight.add(session)
      try {
        for (let at = 0; at < entries.length; at += 100) {
          const batch = entries.slice(at, at + 100)
          const result = await this.fetchTurns(session, batch.map(entry => entry.turn))
          if (generation !== this.generation) return
          for (const entry of batch) {
            if (result.ok) {
              const next = result.value.turns.find(row => row.turn === entry.turn)
              if (next) {
                // Successful absence is authoritative, including expiry/forget.
                entry.data = next
                entry.error = undefined
              } else entry.error = 'missing turn in response'
            } else entry.error = result.message
            entry.fetchedAt = Date.now()
            entry.version++
            for (const listener of entry.listeners) listener()
          }
        }
      } catch (error) {
        for (const entry of entries) {
          entry.error = String(error)
          entry.fetchedAt = Date.now()
          entry.version++
          for (const listener of entry.listeners) listener()
        }
      } finally {
        this.inFlight.delete(session)
        if (generation !== this.generation) void this.refresh()
      }
    }))
  }
}

const store = new TurnInfoStore((session, turns) => {
  const query = new URLSearchParams({ session })
  for (const turn of turns) query.append('turn', String(turn))
  return callApi(`/checkpoints/turns?${query}`, { signal: AbortSignal.timeout(20_000) })
})

export function useTurnInfo(session: string, turn: number): { data?: TurnInfoView; error?: string } {
  const subscribe = useCallback((listener: () => void) => store.subscribe(session, turn, listener), [session, turn])
  const snapshot = useCallback(() => store.read(session, turn).version, [session, turn])
  useSyncExternalStore(subscribe, snapshot)
  const entry = store.read(session, turn)
  return { data: entry.data, error: entry.error }
}
