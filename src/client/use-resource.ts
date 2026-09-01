import { useCallback, useEffect, useMemo, useState } from 'react'
import { callApi } from './api.ts'

export interface Resource<T> {
  readonly data: T | undefined
  readonly error: string | undefined
  readonly loading: boolean
  reload(): void
}

/**
 * Read one of the plugin's endpoints, with reload and abort-on-unmount.
 *
 * Every surface in this plugin is optional chrome inside someone else's page, so
 * a failed read renders a message and nothing else: no thrown error, no
 * suspense boundary, no effect on the page around it.
 *
 * @param route - endpoint path under the plugin's API prefix.
 * @param enabled - false leaves the resource idle (a switched-off feature).
 */
export function useResource<T>(route: string, enabled = true): Resource<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setData(undefined)
      setError(undefined)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    void (async () => {
      const result = await callApi<T>(route, { signal: controller.signal })
      if (controller.signal.aborted) return
      setLoading(false)
      if (result.ok) {
        setData(result.value)
        setError(undefined)
      } else if (result.message !== 'cancelled') {
        setError(result.message)
      }
    })()
    return () => { controller.abort() }
  }, [route, enabled, nonce])

  const reload = useCallback(() => { setNonce(value => value + 1) }, [])
  return useMemo(() => ({ data, error, loading, reload }), [data, error, loading, reload])
}

export interface Command {
  readonly busy: boolean
  readonly error: string | undefined
  /** Run one write. Resolves true on success; the error is held for rendering. */
  run(route: string, body?: unknown): Promise<boolean>
  clearError(): void
}

/** The write half: one in-flight guard and one held failure, shared by a panel's buttons. */
export function useCommand(onSettled?: () => void): Command {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const run = useCallback(async (route: string, body?: unknown): Promise<boolean> => {
    setBusy(true)
    setError(undefined)
    const result = await callApi<unknown>(route, { method: 'POST', body: body ?? {} })
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return false
    }
    onSettled?.()
    return true
  }, [onSettled])

  const clearError = useCallback(() => { setError(undefined) }, [])
  return useMemo(() => ({ busy, error, run, clearError }), [busy, error, run, clearError])
}
