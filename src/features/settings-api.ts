import type { Context } from '@deepseek-ai/cordis'
import type { SettingsPathOp } from '@deepseek-ai/dsh-settings'
import { ApiError, type ApiHandler } from '../http.ts'
import { NAMESPACE } from '../settings.ts'
import { SETTINGS_NS } from '../shared/api-contract.ts'
import type { Config } from '../config.ts'

/** What the settings page needs to render a form and fence its writes. */
export interface ConfigView {
  /** Resolved config: composition entry under the user's overrides. */
  readonly value: Config
  /** Revision to send back as `expectedRevision`; -1 when no provider is mounted. */
  readonly revision: number
  /** Raw user layer — a key's *presence* marks that field as overridden. */
  readonly user: unknown
  /** True when a settings provider is mounted and writes can be persisted. */
  readonly writable: boolean
}

function isPathOp(value: unknown): value is SettingsPathOp {
  if (typeof value !== 'object' || value === null) return false
  const op = value as { op?: unknown; path?: unknown }
  if (op.op !== 'set' && op.op !== 'unset') return false
  return Array.isArray(op.path) && op.path.every(segment => typeof segment === 'string')
}

/**
 * Read and write this plugin's own settings namespace.
 *
 * The write path lives on the host rather than in the browser so the page never
 * has to reproduce the seam's revision-fencing protocol: it sends path ops and
 * the revision it read, and the seam refuses a stale write.
 */
export function settingsRoutes(ctx: Context, config: () => Config): Record<string, ApiHandler> {
  const describe = (): ConfigView => {
    const settings = ctx.get('settings')
    if (settings === undefined) {
      return { value: config(), revision: -1, user: undefined, writable: false }
    }
    const descriptor = settings.describe().find(row => row.ns === SETTINGS_NS)
    if (descriptor === undefined) {
      return { value: config(), revision: -1, user: undefined, writable: false }
    }
    return {
      value: descriptor.value as Config,
      revision: descriptor.revision,
      user: descriptor.user,
      writable: true,
    }
  }

  return {
    '/config': () => describe(),

    '/config/mutate': async ({ body }) => {
      const settings = ctx.get('settings')
      if (settings === undefined) {
        throw new ApiError(409, 'no settings provider is mounted; this deployment cannot store preferences')
      }
      const request = body as { ops?: unknown; expectedRevision?: unknown } | undefined
      const ops = request?.ops
      if (!Array.isArray(ops) || ops.length === 0 || !ops.every(isPathOp)) {
        throw new ApiError(400, 'expected a non-empty `ops` array of {op,path[,value]}')
      }
      const expected = typeof request?.expectedRevision === 'number' ? request.expectedRevision : undefined

      try {
        await settings.mutate(NAMESPACE, ops, expected)
      } catch (error: unknown) {
        // A conflict is an ordinary outcome (another tab, or a settings.yaml
        // edit), not a defect: the page reloads and retries.
        const message = error instanceof Error ? error.message : String(error)
        throw new ApiError(409, message)
      }
      return describe()
    },
  }
}
