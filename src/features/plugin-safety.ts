import type { Context } from '@deepseek-ai/cordis'
import { readFile, readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import { bundleManifestPath, bundleRowIds } from '../bundle-rows.ts'
import { isRowId, readQuarantine, updateQuarantine } from '../quarantine.ts'
import type { Config } from '../config.ts'
import type { PluginRow, SafetyView } from '../shared/api-contract.ts'

/**
 * Feature 7 — start a harness that a third-party plugin prevents from booting.
 *
 * The honest constraint first: this plugin is composed into the same tree as
 * the plugin that breaks the boot, so nothing running *inside* the harness can
 * rescue it. That is why the feature has two halves, and why the half that
 * matters most is not in this file:
 *
 *   - Here (harness up): an inventory, and a quarantine list a user can add to
 *     from Settings, which takes effect on the next start.
 *   - `bin/dsh-ext.mjs` (harness down): the same quarantine store, written from
 *     a standalone CLI that imports nothing from the harness. That is the
 *     `--skip-plugin` / `--safe` path a user reaches from a failed-start page.
 *
 * Both write `$DSH_HOME/cordis.patch.yml`, whose layer the launcher composes
 * after every bundle layer and after the profile's own — so a disable row there
 * outranks whatever enabled the plugin, without this plugin having loaded.
 */

/** Bundles that ship with dsh itself; never offered for quarantine. */
const BUILTIN_BUNDLES = new Set([
  '@deepseek-ai/dsh-base',
  '@deepseek-ai/dsh-web-app',
  '@deepseek-ai/dsh-headless',
])

function isBuiltin(name: string): boolean {
  return BUILTIN_BUNDLES.has(name) || name.startsWith('@deepseek-ai/dsh-')
}

interface ProfileManifest {
  readonly dir: string
  readonly name: string
  readonly bundles: readonly string[]
  readonly dependencies: Readonly<Record<string, string>>
}

/**
 * Read one profile's manifest. The bundles list is the composition; the
 * dependency map is what pnpm installed for it, which is how an out-of-tree
 * plugin that is installed but not composed still shows up in the inventory.
 */
async function readProfile(dir: string): Promise<ProfileManifest | undefined> {
  try {
    const parsed = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) as {
      dsh?: { profile?: { bundles?: unknown } }
      dependencies?: unknown
    }
    const bundles = parsed.dsh?.profile?.bundles
    const dependencies = parsed.dependencies
    return {
      dir,
      name: basename(dir),
      bundles: Array.isArray(bundles) ? bundles.filter((row): row is string => typeof row === 'string') : [],
      dependencies: typeof dependencies === 'object' && dependencies !== null
        ? dependencies as Record<string, string>
        : {},
    }
  } catch {
    return undefined
  }
}

/** Every profile directory under the harness home. */
async function listProfiles(): Promise<ProfileManifest[]> {
  const root = dshHomePath('profiles')
  let names: string[]
  try {
    names = await readdir(root)
  } catch {
    return []
  }
  const profiles: ProfileManifest[] = []
  for (const name of names) {
    const manifest = await readProfile(join(root, name))
    if (manifest !== undefined) profiles.push(manifest)
  }
  return profiles
}

/**
 * Build the inventory from the PROFILE MANIFESTS, not from the running registry.
 *
 * The registry does expose live plugin runtimes, but their names are internal
 * fiber names — `AgentLoop`, `activationOwner` — which are neither packages nor
 * quarantinable rows, and which cannot be told apart from a third-party row by
 * inspection. Listing them would offer a user a button to "disable" the agent
 * loop. The profile manifests name exactly the installable bundles, and each
 * bundle's own patch file names exactly the rows it inserts.
 */
async function buildView(quarantineFile: string): Promise<SafetyView> {
  const [profiles, record] = await Promise.all([listProfiles(), readQuarantine(quarantineFile)])
  const quarantined = new Set(record.rows)

  const seen = new Map<string, PluginRow>()
  for (const profile of profiles) {
    const names = new Set([...profile.bundles, ...Object.keys(profile.dependencies)])
    for (const name of names) {
      // The mapping that makes a disable row actually match; see bundle-rows.ts.
      const rows = await bundleRowIds(bundleManifestPath(profile.dir, name))
      const existing = seen.get(name)
      const merged: PluginRow = {
        name,
        builtin: isBuiltin(name),
        // Quarantined when every row it contributes is disabled — a bundle that
        // inserts several rows is only truly off when none of them load.
        quarantined: rows.length > 0 && rows.every(row => quarantined.has(row)),
        version: profile.dependencies[name] ?? existing?.version,
        rows,
        composed: profile.bundles.includes(name) || (existing?.composed ?? false),
        profile: existing?.profile ?? profile.name,
      }
      seen.set(name, merged)
    }
  }

  const plugins = [...seen.values()].sort((a, b) => {
    if (a.builtin !== b.builtin) return a.builtin ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return {
    plugins,
    quarantine: record.rows,
    quarantineFile: dshHomePath('cordis.patch.yml'),
    bundleFile: profiles[0]?.dir === undefined ? undefined : join(profiles[0].dir, 'package.json'),
  }
}

export function mountPluginSafety(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
  quarantineFile: string,
): () => void {
  const log = ctx.logger('dsh-ext')
  const patchFile = dshHomePath('cordis.patch.yml')

  function requireEnabled(): void {
    if (!config().pluginSafety.enabled) throw new ApiError(404, 'plugin safety is switched off')
  }

  return installRoutes(routes, {
    '/plugins': async () => {
      requireEnabled()
      return await buildView(quarantineFile)
    },

    '/plugins/quarantine': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to change the quarantine list')
      requireEnabled()
      const request = body as { name?: unknown; quarantined?: unknown } | undefined
      if (!isRowId(request?.name)) throw new ApiError(400, 'name must be a plugin package name')
      const name = request.name
      if (isBuiltin(name)) {
        // Refusing this is the difference between a rescue tool and a way to
        // break your own harness from its own settings page.
        throw new ApiError(400, 'that is part of the harness itself and cannot be quarantined here')
      }

      // Resolve the package to the rows a disable patch has to name.
      // Match either by package name or by the loader row ID.
      const view = await buildView(quarantineFile)
      const target = view.plugins.find(row => row.name === name || row.rows.includes(name))
      const targetRows = target && target.rows.length > 0 ? target.rows : [name]

      const wanted = request?.quarantined !== false
      const record = await updateQuarantine(quarantineFile, patchFile, rows => (
        wanted
          ? [...rows, ...targetRows]
          : rows.filter(existing => !targetRows.includes(existing))
      ))
      log.info(
        '%s %s (rows: %s); effective on the next start',
        wanted ? 'quarantined' : 'released', name, targetRows.join(', '),
      )
      return { quarantine: record.rows, rows: targetRows, restartRequired: true }
    },

    '/plugins/safe-mode': async ({ method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to enable safe mode')
      requireEnabled()
      const view = await buildView(quarantineFile)
      const thirdPartyRows = view.plugins.filter(p => !p.builtin).flatMap(p => p.rows)
      const record = await updateQuarantine(quarantineFile, patchFile, rows => [
        ...new Set([...rows, ...thirdPartyRows]),
      ])
      log.info('safe mode activated; quarantined all third-party plugins (%d rows)', thirdPartyRows.length)
      return { quarantine: record.rows, rows: thirdPartyRows, restartRequired: true }
    },

    '/plugins/quarantine/clear': async ({ method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to clear the quarantine list')
      requireEnabled()
      const record = await updateQuarantine(quarantineFile, patchFile, () => [])
      return { quarantine: record.rows, restartRequired: true }
    },
  })
}

