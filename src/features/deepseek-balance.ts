import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-credentials'
import type { CredentialRef, ApiKeyRecord } from '@deepseek-ai/dsh-credentials/types'
import { ApiError, type ApiHandler } from '../http.ts'
import type { Config } from '../config.ts'
import type { BalanceRow, BalanceView } from '../shared/api-contract.ts'

/**
 * Feature 3 — the DeepSeek official API account balance.
 *
 * DeepSeek publishes `GET /user/balance`, which answers for whoever holds the
 * key. The whole feature is therefore: find the key the harness is already
 * using for the official route, ask, and cache the answer briefly.
 *
 * The key itself never leaves this module — not into a response, not into a
 * log line, not into an error message. The page learns only where the key came
 * from, which is what a user needs to answer "is this the account I think?".
 */

const BALANCE_URL = 'https://api.deepseek.com/user/balance'

/** Environment names the official route is configured under, in preference order. */
const KEY_REFS: readonly string[] = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_APIKEY',
  'DEEPSEEK_TOKEN',
]

/** Record scopes whose id looks like the official DeepSeek route. */
const OFFICIAL_ROUTE = /^deepseek(-official|-api)?$/i

interface ResolvedKey {
  readonly key: string
  /** Human-readable provenance: an environment name or a stored record address. */
  readonly source: string
}

/**
 * Find the official-route API key without asking the user to type it again.
 *
 * Two key spaces answer two different questions, and both are tried: a
 * `CredentialRef` says what is behind an environment name, a `CredentialKey`
 * says what an adapter stored for its route. A deployment configured either
 * way resolves; one configured neither way reports that plainly.
 */
async function resolveKey(ctx: Context): Promise<ResolvedKey | undefined> {
  const credentials = ctx.get('credentials')
  if (credentials === undefined) return undefined

  for (const name of KEY_REFS) {
    const resolved = await credentials.resolve(name as CredentialRef)
    const value = resolved?.value?.trim()
    if (value !== undefined && value.length > 0) {
      return { key: value, source: `${name} (${resolved?.source ?? 'environment'})` }
    }
  }

  // The adapter's own stored record. `listRecords` is the only discovery path:
  // nothing else can tell us which scope owns the official route.
  let records: readonly { key: string; tag?: string }[]
  try {
    records = await credentials.listRecords() as readonly { key: string; tag?: string }[]
  } catch {
    return undefined
  }

  for (const entry of records) {
    const id = entry.key.slice(entry.key.indexOf('/') + 1)
    if (!OFFICIAL_ROUTE.test(id)) continue
    const record = await credentials.readRecord(entry.key as never)
    if (record === undefined || record.kind !== 'api-key') continue
    const value = (record as ApiKeyRecord).key?.trim()
    if (value !== undefined && value.length > 0) {
      return { key: value, source: `stored credential ${entry.key}` }
    }
  }
  return undefined
}

/** The endpoint's payload, named as DeepSeek names it. */
interface BalancePayload {
  is_available?: unknown
  balance_infos?: unknown
}

function readRows(payload: BalancePayload): BalanceRow[] {
  if (!Array.isArray(payload.balance_infos)) return []
  const rows: BalanceRow[] = []
  for (const raw of payload.balance_infos) {
    if (typeof raw !== 'object' || raw === null) continue
    const row = raw as Record<string, unknown>
    rows.push({
      currency: typeof row.currency === 'string' ? row.currency : '',
      totalBalance: typeof row.total_balance === 'string' ? row.total_balance : '0',
      grantedBalance: typeof row.granted_balance === 'string' ? row.granted_balance : '0',
      toppedUpBalance: typeof row.topped_up_balance === 'string' ? row.topped_up_balance : '0',
    })
  }
  return rows
}

export function balanceRoutes(ctx: Context, config: () => Config, timeoutMs = 10_000): Record<string, ApiHandler> {
  // One cached answer, shared by the settings page and the header badge so two
  // surfaces showing the same number cost one request.
  let cached: BalanceView | undefined
  let inFlight: Promise<BalanceView> | undefined

  async function fetchBalance(signal: AbortSignal): Promise<BalanceView> {
    const resolved = await resolveKey(ctx)
    if (resolved === undefined) {
      throw new ApiError(
        409,
        'no DeepSeek official API key is configured; set DEEPSEEK_API_KEY or configure the official provider',
      )
    }

    let response: Response
    try {
      response = await fetch(BALANCE_URL, {
        headers: { authorization: `Bearer ${resolved.key}`, accept: 'application/json' },
        signal,
      })
    } catch (error: unknown) {
      // Never let a fetch error carry the request headers into a response.
      throw new ApiError(502, `could not reach the DeepSeek API: ${error instanceof Error ? error.name : 'network error'}`)
    }

    if (response.status === 401 || response.status === 403) {
      throw new ApiError(401, 'the DeepSeek API rejected the configured key')
    }
    if (!response.ok) {
      throw new ApiError(502, `the DeepSeek API answered HTTP ${response.status}`)
    }

    let payload: BalancePayload
    try {
      payload = await response.json() as BalancePayload
    } catch {
      throw new ApiError(502, 'the DeepSeek API answered with something that is not JSON')
    }

    return {
      available: payload.is_available === true,
      rows: readRows(payload),
      fetchedAt: Date.now(),
      credentialSource: resolved.source,
    }
  }

  return {
    '/balance': async ({ query }) => {
      const settings = config().deepseekBalance
      if (!settings.enabled) throw new ApiError(404, 'the balance feature is switched off')

      const force = query.get('refresh') === '1'
      const ttl = settings.cacheTtlSeconds * 1000
      const now = Date.now()
      // If cached and fresh (or force-refreshed less than 5 seconds ago), return cache
      if (cached !== undefined && (!force && now - cached.fetchedAt < ttl || force && now - cached.fetchedAt < 5000)) {
        return cached
      }

      // Collapse concurrent asks onto one request: the settings page and the
      // header badge mounting together must not open two connections.
      if (inFlight === undefined) {
        const controller = new AbortController()
        let timer: ReturnType<typeof setTimeout>
        const deadline = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            controller.abort()
            reject(new ApiError(504, 'balance request timed out'))
          }, timeoutMs)
        })
        inFlight = Promise.race([fetchBalance(controller.signal), deadline])
          .then(value => { cached = value; return value })
          .finally(() => { clearTimeout(timer); inFlight = undefined })
      }
      try {
        return await inFlight
      } catch (err) {
        // Fallback to cached data if available rather than failing the UI
        if (cached !== undefined) return { ...cached, stale: true, error: err instanceof ApiError ? err.message : 'balance refresh failed' }
        throw err
      }
    },
  }
}
