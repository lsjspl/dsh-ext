/**
 * Small in-process TTL cache for auxiliary LLM calls.
 *
 * This is not the provider's automatic context/prefix cache; it is a local
 * memoization for identical one-shot requests (commit generation, command
 * review) so the same expensive model call is not repeated within a short
 * window. It only stores successful outcomes — errors are never cached.
 */

import { createHash } from 'node:crypto'

interface CacheEntry {
  readonly value: unknown
  readonly expiresAt: number
}

const MAX_ENTRIES = 500

const store = new Map<string, CacheEntry>()

/** Deterministic SHA-256 hash, used to keep cache keys small and collision-safe. */
export function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * Drop trailing assistant tool-call messages that have no matching tool-result
 * messages yet. When a tool is still being reviewed/executed, the derived
 * history may already contain the assistant message that requested it; appending
 * a new user message after an unresolved tool-call block is not a valid provider
 * message ordering, and it also removes the part of the history that was not in
 * the last routed request that warmed the cache.
 */
export function trimUnresolvedToolCalls(history: readonly unknown[]): readonly unknown[] {
  const out = [...history]
  while (out.length > 0) {
    const last = out[out.length - 1] as { role?: unknown; content?: readonly { type?: unknown }[] } | undefined
    if (last?.role === 'assistant' && Array.isArray(last.content) && last.content.some(block => block?.type === 'tool-call')) {
      out.pop()
      continue
    }
    break
  }
  return out
}

/**
 * Return a cached successful value when the key is still fresh, otherwise run
 * `compute`, store its successful resolution, and return it.
 */
export function cached<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = store.get(key)
  if (hit !== undefined && hit.expiresAt > now) {
    return Promise.resolve(hit.value as T)
  }
  if (hit !== undefined) {
    store.delete(key)
  }

  return compute().then((value: T) => {
    if (store.size >= MAX_ENTRIES) {
      const oldest = store.keys().next().value
      if (oldest !== undefined) store.delete(oldest)
    }
    store.set(key, { value, expiresAt: Date.now() + ttlMs })
    return value
  })
}

/** Drop all cached LLM results (used by tests or a future settings reset). */
export function clearLlmCache(): void {
  store.clear()
}
