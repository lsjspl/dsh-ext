import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { Config } from './config.ts'
import { installRoutes, serveApi, type ApiHandler } from './http.ts'
import { bindSettings, SETTINGS_NS } from './settings.ts'
import { pluginPaths } from './paths.ts'
import { settingsRoutes } from './features/settings-api.ts'
import { balanceRoutes } from './features/deepseek-balance.ts'
import { mountCommandReview } from './features/command-review.ts'
import { mountExplorer } from './features/explorer.ts'
import { mountGitOps } from './features/git-ops.ts'
import { mountSessionAdmin } from './features/session-admin.ts'
import { mountPluginSafety } from './features/plugin-safety.ts'
import { mountCheckpoints } from './features/checkpoints.ts'
import { mountReasoningEffort } from './features/reasoning-effort.ts'
import { RESCUE_SENTINEL_SCRIPT } from './sentinel.ts'


export { Config } from './config.ts'
export const name = 'dsh-ext'

/**
 * `webServer` is the only hard requirement: it carries the browser half's API.
 *
 * Cordis's `inject` is a list of REQUIRED service names (or a name → intercept
 * config map — not a `{required, optional}` pair, which it would read as two
 * services literally named that and then wait forever for them). Optional
 * dependencies therefore are not declared here at all: every feature resolves
 * what it needs with `ctx.get(...)` at mount time, and `bindSettings` uses
 * `ctx.inject([...])` for the part that must wait. A composition missing (say)
 * an approval service loses exactly one feature instead of failing to load.
 */
export const inject = ['webServer']

export function apply(ctx: Context, entry: Config): void {
  const log = ctx.logger('dsh-ext')
  const paths = pluginPaths()

  const routes: Record<string, ApiHandler> = {
    '/': () => ({ plugin: name, namespace: SETTINGS_NS }),
  }

  // Features re-read config on every call rather than capturing it, so a
  // settings edit takes effect without a reload. `mounted` is the set of
  // feature fibers currently up; a toggle disposes and remounts just that one.
  const mounted = new Map<string, () => void>()

  const settings = bindSettings(ctx, Config, entry, () => {
    try {
      reconcile()
    } catch (error: unknown) {
      log.warn('failed to apply a settings change: %o', error)
    }
  })

  /** One row per switchable feature. */
  const FEATURES: readonly FeatureRow[] = [
    {
      id: 'reasoningEffort',
      enabled: config => config.reasoningEffort.enabled,
      mount: () => mountReasoningEffort(ctx, settings.current, routes),
    },
    {
      id: 'deepseekBalance',
      enabled: config => config.deepseekBalance.enabled,
      mount: () => installRoutes(routes, balanceRoutes(ctx, settings.current)),
    },
    {
      id: 'commandReview',
      enabled: config => config.commandReview.enabled,
      mount: () => mountCommandReview(ctx, settings.current, routes, paths.auditLog),
    },
    {
      id: 'explorer',
      enabled: config => config.explorer.enabled,
      mount: () => mountExplorer(ctx, settings.current, routes),
    },
    {
      id: 'gitOps',
      enabled: config => config.git.enabled && config.explorer.enabled,
      mount: () => mountGitOps(ctx, settings.current, routes, paths.gitBindings),
    },
    {
      id: 'sessionAdmin',
      enabled: config => config.sessionAdmin.enabled,
      mount: () => mountSessionAdmin(ctx, settings.current, routes),
    },
    {
      id: 'pluginSafety',
      enabled: config => config.pluginSafety.enabled,
      mount: () => mountPluginSafety(ctx, settings.current, routes, paths.quarantine),
    },
    {
      id: 'checkpoints',
      enabled: config => config.checkpoints.enabled,
      mount: () => mountCheckpoints(ctx, settings.current, routes, paths.checkpoints),
    },
  ]

  function reconcile(): void {
    const config = settings.current()
    for (const feature of FEATURES) {
      const wanted = feature.enabled(config)
      const live = mounted.get(feature.id)
      if (wanted && live === undefined) {
        try {
          mounted.set(feature.id, feature.mount())
        } catch (error: unknown) {
          // One broken feature must never take the plugin — let alone the
          // harness — down with it.
          log.warn('feature %s failed to mount: %o', feature.id, error)
        }
      } else if (!wanted && live !== undefined) {
        mounted.delete(feature.id)
        try {
          live()
        } catch (error: unknown) {
          log.warn('feature %s failed to unmount: %o', feature.id, error)
        }
      }
    }
  }

  installRoutes(routes, settingsRoutes(ctx, settings.current))
  serveApi(ctx, routes)

  // In-browser rescue sentinel: injected via webserver/index-inject into index.html
  // so whenever DSH boots up with a failed plugin card, the rescue UI is ready.
  ctx.on('webserver/index-inject', (table: unknown) => {
    if (settings.current().pluginSafety.enabled && Array.isArray(table)) {
      table.push({
        kind: 'script',
        placement: 'body',
        text: RESCUE_SENTINEL_SCRIPT,
      })
    }
  })


  ctx.effect(() => () => {
    for (const dispose of mounted.values()) {
      try {
        dispose()
      } catch { /* teardown is best-effort */ }
    }
    mounted.clear()
  }, 'dsh-ext: feature teardown')

  log.info('mounted; data directory %s', paths.root)
  reconcile()
}

interface FeatureRow {
  readonly id: string
  enabled(config: Config): boolean
  /** Mount the feature and return its exact disposer. */
  mount(): () => void
}
