import { API_PREFIX } from '../shared/api-contract.ts'

export interface ApiFailure {
  readonly ok: false
  readonly message: string
}

export type ApiResult<T> = { readonly ok: true; readonly value: T } | ApiFailure

/**
 * Call one of the plugin's own host endpoints. Never throws for a failed call:
 * a settings surface renders the failure, it does not crash the page around it.
 */
export async function callApi<T>(
  route: string,
  init?: { method?: string; body?: unknown; signal?: AbortSignal },
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_PREFIX}${route}`, {
      method: init?.method ?? (init?.body === undefined ? 'GET' : 'POST'),
      headers: init?.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init?.signal ?? null,
      credentials: 'same-origin',
    })
    const payload = await response.json() as ApiResult<T> | undefined
    if (payload === undefined || typeof payload !== 'object') {
      return { ok: false, message: `unreadable response (HTTP ${response.status})` }
    }
    if (payload.ok && (init?.method === 'POST' || init?.body !== undefined)
      && route.startsWith('/checkpoints/') && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dsh-ext-checkpoints-changed'))
    }
    return payload
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, message: 'cancelled' }
    }
    return { ok: false, message: error instanceof Error ? error.message : String(error) }
  }
}
