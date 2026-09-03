import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import type z from '@deepseek-ai/schemastery'

import { SETTINGS_NS } from './shared/api-contract.ts'

export { SETTINGS_NS }

/** The branded form the settings seam takes. Minted once, reused everywhere. */
export const NAMESPACE = settingsNamespace(SETTINGS_NS)

export interface SettingsBinding<T> {
  /** The currently authoritative config: the settings layer, or the composition entry. */
  current(): T
}

/**
 * Wire this plugin's config to the user settings document when a settings
 * provider is mounted, and fall back to the composition entry when it is not.
 *
 * This is deliberately a local reimplementation of the harness's own
 * `installSettingsSection` rather than a runtime import of it. The helper is
 * pure wiring over the public `ctx.settings` service, and keeping it here means
 * the plugin's runtime dependency surface stays at three tiny packages — which
 * matters for a plugin whose whole job includes *not* being the reason someone's
 * harness fails to boot.
 *
 * @param ctx - the plugin context owning the registration.
 * @param schema - the plugin Config schema, used as the namespace schema.
 * @param entry - the composition-supplied config, used as the `base` layer.
 * @param onChange - called after attach, detach, and every committed change.
 * @returns a binding whose `current()` always returns the authoritative config.
 */
export function bindSettings<T>(
  ctx: Context,
  schema: z<T>,
  entry: T,
  onChange: () => void,
): SettingsBinding<T> {
  let source = () => entry
  let unloading = false

  ctx.effect(() => () => { unloading = true }, 'dsh-ext: settings unload guard')

  ctx.inject(['settings'], (sctx) => {
    const scope = sctx.settings.register(NAMESPACE, schema, { base: entry })
    source = () => scope.get()

    sctx.effect(() => () => {
      // A provider detach must not look like a config change during teardown.
      if (unloading) return
      source = () => entry
      onChange()
    }, 'dsh-ext: settings detach')

    onChange()
    scope.watch(() => {
      if (unloading) return
      onChange()
    })
  })

  return { current: () => source() }
}
