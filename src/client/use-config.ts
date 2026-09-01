import { useCallback, useEffect, useState } from 'react'
import { callApi } from './api.ts'
import { invalidateClientConfig } from './use-client-config.ts'
import type { Config } from '../config.ts'

export interface ConfigView {
  readonly value: Config
  readonly revision: number
  readonly user: unknown
  readonly writable: boolean
}

export interface ConfigStore {
  readonly view: ConfigView | undefined
  readonly error: string | undefined
  readonly busy: boolean
  reload(): void
  set(path: readonly string[], value: unknown): void
}

/**
 * One shared read of this plugin's settings namespace, plus the fenced write
 * path. Every write carries the revision the view was read at, so a concurrent
 * edit from another tab or from `settings.yaml` is refused rather than
 * silently overwritten; a refusal reloads and reports.
 */
export function useConfig(): ConfigStore {
  const [view, setView] = useState<ConfigView | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      const result = await callApi<ConfigView>('/config', { signal: controller.signal })
      if (controller.signal.aborted) return
      if (result.ok) {
        setView(result.value)
        setError(undefined)
      } else if (result.message !== 'cancelled') {
        setError(result.message)
      }
    })()
    return () => { controller.abort() }
  }, [nonce])

  const reload = useCallback(() => { setNonce(n => n + 1) }, [])

  const set = useCallback((path: readonly string[], value: unknown) => {
    setBusy(true)
    void (async () => {
      const current = view
      const result = await callApi<ConfigView>('/config/mutate', {
        body: {
          ops: [{ op: 'set', path, value }],
          expectedRevision: current?.revision,
        },
      })
      setBusy(false)
      if (result.ok) {
        setView(result.value)
        setError(undefined)
        // The conversation surfaces read a separate cache; a switch flipped here
        // has to reach them without a page reload.
        invalidateClientConfig()
      } else {
        setError(result.message)
        reload()
      }
    })()
  }, [view, reload])

  return { view, error, busy, reload, set }
}
