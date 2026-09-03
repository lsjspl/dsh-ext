import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-settings'
import { settingsNamespace, type SettingsPathOp } from '@deepseek-ai/dsh-settings'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import type { Config } from '../config.ts'
import {
  DEFAULT_EFFORT_LADDER,
  THINKING_LEVELS,
  type EffortModel,
  type EffortProvider,
  type EffortRung,
  type ThinkingLevel,
} from '../shared/api-contract.ts'

/**
 * Feature 2 — reasoning effort for third-party providers.
 *
 * The harness already has an effort control: the composer's model picker offers
 * a model its own levels whenever the resolved model reports any. What it does
 * not have is a way to *declare* those levels for a provider whose endpoint
 * cannot be interrogated for them — an OpenAI-compatible gateway, a relay, a
 * self-hosted server. The shipped Models page says so in as many words: it has
 * no effort control because effort is a per-model capability and a
 * provider-scoped one could only be wrong.
 *
 * So this feature does not invent a parallel effort mechanism. It writes the
 * adapter's OWN per-model field — `llm-pi-ai`'s `reasoningEfforts` — into
 * `providers.<route>.modelOverrides.<model>`, and the effort menu the harness
 * already ships then appears for that model on its own.
 *
 * `modelOverrides` rather than the `models` array on purpose: any entry in
 * `models` REPLACES the route's built-in catalog, so writing there would
 * silently drop every model the user had not listed. An override is keyed by
 * model id and layers over whatever the catalog says.
 */

/** The adapter family this feature edits. */
const PI_AI_NS = 'llm-pi-ai'
const PI_AI_NAMESPACE = settingsNamespace(PI_AI_NS)

/** One model's stored efforts, as the adapter's dict spells them. */
type StoredEfforts = Record<string, string | null> | false

interface PiAiModelEntry {
  readonly id?: unknown
  readonly name?: unknown
  readonly reasoningEfforts?: unknown
  readonly inputModalities?: unknown
}

/**
 * The per-model fields this feature writes.
 *
 * `reasoningEfforts` is feature 2's own. `inputModalities` is here because the
 * two share one hard-won piece of knowledge — *where* a pi-ai route's per-model
 * fields may legally be written (see `modelFieldPath`) — and duplicating that
 * placement logic for a second field is how the two would drift apart.
 *
 * `inputModalities` matters because the host gates image attachments on it: the
 * server answers `MODEL_DOES_NOT_SUPPORT_IMAGES` when a model's catalog entry
 * does not list `image`, so a genuinely multimodal third-party route refuses
 * pictures until someone says so. That is the "当前模型不支持图片" a user hits on a
 * vision model, and it is configuration rather than a bug.
 */
type ModelField = 'reasoningEfforts' | 'inputModalities'

/** The complete adapter map written when a model has no explicit ladder. */
function defaultStoredEfforts(): Record<string, string | null> {
  return Object.fromEntries(DEFAULT_EFFORT_LADDER.map(rung => [rung.id, rung.wire]))
}

interface PiAiProfile {
  readonly displayName?: unknown
  readonly models?: unknown
  readonly modelOverrides?: unknown
}

function readProfiles(value: unknown): Record<string, PiAiProfile> {
  if (typeof value !== 'object' || value === null) return {}
  const providers = (value as { providers?: unknown }).providers
  if (typeof providers !== 'object' || providers === null) return {}
  return providers as Record<string, PiAiProfile>
}

/** Turn a stored `reasoningEfforts` value into the display rungs the page shows. */
function readEfforts(stored: unknown): EffortRung[] {
  if (stored === false) return []
  if (typeof stored !== 'object' || stored === null) return []
  const rungs: EffortRung[] = []
  for (const level of THINKING_LEVELS) {
    if (!(level in stored)) continue
    const wire = (stored as Record<string, unknown>)[level]
    if (wire !== null && typeof wire !== 'string') continue
    const known = DEFAULT_EFFORT_LADDER.find(rung => rung.id === level)
    rungs.push({
      id: level,
      name: known?.name ?? level,
      description: known?.description,
      wire: wire ?? null,
    })
  }
  return rungs
}

/**
 * Validate a ladder the page sent before it becomes settings.
 *
 * The adapter's own rules, checked here so a refusal names the problem while
 * the user is still looking at the form rather than at a boot failure: keys come
 * from the fixed vocabulary, only `off` may send nothing, and a ladder must
 * offer at least one thinking level (otherwise the honest statement is
 * `false` — a non-reasoning model — which this endpoint also accepts).
 */
function toStoredEfforts(raw: unknown): StoredEfforts {
  if (raw === false || raw === null) return false
  if (!Array.isArray(raw)) throw new ApiError(400, 'efforts must be an array of rungs, or false for a non-reasoning model')
  if (raw.length === 0) return false

  const stored: Record<string, string | null> = {}
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) throw new ApiError(400, 'each rung must be an object')
    const { id, wire } = entry as { id?: unknown; wire?: unknown }
    if (typeof id !== 'string' || !(THINKING_LEVELS as readonly string[]).includes(id)) {
      throw new ApiError(400, `unknown effort level; expected one of ${THINKING_LEVELS.join(', ')}`)
    }
    if (id in stored) throw new ApiError(400, `the level ${id} is listed twice`)
    if (wire === null || wire === undefined || wire === '') {
      if (id !== 'off') {
        throw new ApiError(400, `the level ${id} needs the value the provider should be sent; only "off" may be empty`)
      }
      stored[id] = null
    } else {
      if (typeof wire !== 'string') throw new ApiError(400, `the wire value for ${id} must be a string`)
      stored[id] = wire
    }
  }
  if (!Object.keys(stored).some(level => level !== 'off')) {
    throw new ApiError(400, 'a ladder needs at least one thinking level beyond "off"; send false for a non-reasoning model')
  }
  return stored
}

/** Model ids are settings-path segments, so a hostile one must not become a path. */
function assertModelId(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 200) {
    throw new ApiError(400, 'a model id is required')
  }
  // The dict key is written verbatim; refuse anything that is not plainly one.
  if (!/^[\w.:@/+-]+$/.test(value)) throw new ApiError(400, 'that model id contains characters this plugin will not write')
  return value
}

function assertProvider(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9][\w.-]{0,80}$/.test(value)) {
    throw new ApiError(400, 'a provider route is required')
  }
  return value
}

/**
 * Where a route's per-model fields belong, which is not one fixed place.
 *
 * pi-ai refuses `modelOverrides` beside an explicit `models` list (its own
 * words: "models already replaces the served catalog, so declare the fields on
 * its entries"), and equally refuses `modelOverrides` for a route the installed
 * catalog does not describe. So a profile that spells its models out must be
 * edited in place, on the matching entry, and only a catalog-backed route uses
 * the overrides dict. Writing the wrong one is not a soft failure — it makes the
 * whole provider section invalid, which is a boot error rather than a bad form.
 *
 * A models-list route is edited by rewriting the whole list rather than by
 * descending into it: the settings provider treats every path segment as a
 * dictionary key, so a numeric segment would turn `models` from an array into an
 * object — which is exactly the shape its own schema then rejects.
 *
 * @returns how to reach that model's ladder — either a direct path to write the
 *   ladder at, or the models array to rewrite with the ladder spliced in.
 */
function modelFieldPath(profile: PiAiProfile | undefined, provider: string, model: string, field: ModelField): {
  readonly path: readonly string[]
  readonly inModelsList: boolean
  /** Present only for a models-list route: rebuilds the whole array. */
  readonly rewriteModels?: (value: unknown) => readonly PiAiModelEntry[]
} {
  const models = Array.isArray(profile?.models) ? profile.models as readonly PiAiModelEntry[] : undefined
  if (models === undefined) {
    return { path: ['providers', provider, 'modelOverrides', model, field], inModelsList: false }
  }
  const index = models.findIndex(entry => typeof entry?.id === 'string' && entry.id === model)
  if (index < 0) {
    throw new ApiError(404, `this route lists its own models and "${model}" is not among them; add it on the Models page first`)
  }
  return {
    path: ['providers', provider, 'models'],
    inModelsList: true,
    rewriteModels: (value) => models.map((entry, at) => {
      if (at !== index) return entry
      // `undefined` means "drop the override and inherit the adapter's answer",
      // so the key is removed rather than written as a null.
      const { [field]: _drop, ...rest } = entry as Record<string, unknown>
      return (value === undefined ? rest : { ...rest, [field]: value }) as PiAiModelEntry
    }),
  }
}

export function mountReasoningEffort(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
): () => void {
  function piAiSection(): { value: unknown; revision: number; writable: boolean } {
    const settings = ctx.get('settings')
    if (settings === undefined) return { value: undefined, revision: -1, writable: false }
    const descriptor = settings.describe().find(row => row.ns === PI_AI_NS)
    if (descriptor === undefined) return { value: undefined, revision: -1, writable: false }
    return { value: descriptor.value, revision: descriptor.revision, writable: true }
  }

  /**
   * Materialize the global defaults into the pi-ai namespace.
   *
   * Defaults must reach the adapter's model metadata, not merely decorate this
   * settings page: the host gates image attachments and the composer effort
   * picker against resolved model info. Missing fields are filled; any explicit
   * per-model statement — including `false` reasoning or text-only modalities —
   * wins and is never overwritten.
   */
  async function reconcileDefaults(signal?: AbortSignal): Promise<void> {
    const settings = ctx.get('settings')
    const defaults = config().reasoningEffort
    const fullEfforts = defaults.defaultFullEfforts ?? true
    const vision = defaults.defaultVision ?? true
    if (settings === undefined || (!fullEfforts && !vision)) return

    const section = piAiSection()
    if (!section.writable) return
    const profiles = readProfiles(section.value)
    const llm = ctx.get('llm')
    const ops: SettingsPathOp[] = []

    for (const [route, profile] of Object.entries(profiles)) {
      const declared = Array.isArray(profile.models) ? profile.models as readonly PiAiModelEntry[] : undefined
      if (declared !== undefined) {
        let changed = false
        const models = declared.map(entry => {
          let next = entry
          if (fullEfforts && entry.reasoningEfforts === undefined) {
            next = { ...next, reasoningEfforts: defaultStoredEfforts() }
            changed = true
          }
          if (vision && entry.inputModalities === undefined) {
            next = { ...next, inputModalities: ['text', 'image'] }
            changed = true
          }
          return next
        })
        if (changed) {
          ops.push({ op: 'set', path: ['providers', route, 'models'], value: models as never })
        }
        continue
      }

      const overrides = typeof profile.modelOverrides === 'object' && profile.modelOverrides !== null
        ? profile.modelOverrides as Record<string, PiAiModelEntry>
        : {}
      const ids = new Set(Object.keys(overrides))
      if (llm !== undefined) {
        try {
          for (const model of await llm.listModels(route)) {
            if (signal?.aborted === true) return
            ids.add(model.id)
          }
        } catch { /* dormant route: its existing overrides are still reconciled */ }
      }
      for (const id of ids) {
        const override = overrides[id]
        if (fullEfforts && override?.reasoningEfforts === undefined) {
          ops.push({
            op: 'set',
            path: ['providers', route, 'modelOverrides', id, 'reasoningEfforts'],
            value: defaultStoredEfforts() as never,
          })
        }
        if (vision && override?.inputModalities === undefined) {
          ops.push({
            op: 'set',
            path: ['providers', route, 'modelOverrides', id, 'inputModalities'],
            value: ['text', 'image'] as never,
          })
        }
      }
    }

    if (ops.length === 0) return
    try {
      await settings.mutate(PI_AI_NAMESPACE, ops, section.revision)
    } catch (error: unknown) {
      // A concurrent Models-page write wins. The next directory update or page
      // read retries from the fresh revision rather than clobbering it.
      ctx.logger('dsh-ext').warn('could not apply default model capabilities: %o', error)
    }
  }

  async function describe(signal?: AbortSignal): Promise<{ providers: EffortProvider[]; revision: number; writable: boolean; ladder: readonly EffortRung[] }> {
    const section = piAiSection()
    const profiles = readProfiles(section.value)
    const llm = ctx.get('llm')

    // Which routes are actually registered right now, so the page can say
    // "configured but not loaded" rather than showing them identically.
    const live = new Set<string>()
    try {
      for (const info of llm?.listProviders() ?? []) live.add(info.id)
    } catch { /* an unavailable runtime simply means nothing is known to be live */ }

    const providers: EffortProvider[] = []
    for (const [route, profile] of Object.entries(profiles)) {
      const overrides = typeof profile.modelOverrides === 'object' && profile.modelOverrides !== null
        ? profile.modelOverrides as Record<string, PiAiModelEntry>
        : {}
      const declared = Array.isArray(profile.models) ? profile.models as PiAiModelEntry[] : []

      // The union of what the profile lists, what the adapter's catalog serves,
      // and what already has an override. A model the user can pick in the
      // composer must be editable here.
      const ids = new Map<string, string>()
      for (const entry of declared) {
        if (typeof entry.id === 'string') ids.set(entry.id, typeof entry.name === 'string' ? entry.name : entry.id)
      }
      if (declared.length === 0 && llm !== undefined) {
        try {
          for (const info of await llm.listModels(route)) ids.set(info.id, info.name)
        } catch { /* a dormant route cannot be listed; its overrides still show */ }
      }
      for (const id of Object.keys(overrides)) if (!ids.has(id)) ids.set(id, id)

      const models: EffortModel[] = []
      for (const [id, name] of ids) {
        const declaredEntry = declared.find(entry => entry.id === id)
        const overrideEntry = overrides[id]
        // The override wins, exactly as the adapter layers them.
        const effective = overrideEntry?.reasoningEfforts
          ?? declaredEntry?.reasoningEfforts
          ?? (config().reasoningEffort.defaultFullEfforts ? defaultStoredEfforts() : undefined)
        let adapterEfforts: EffortRung[] = []
        if (live.has(route) && llm !== undefined && effective === undefined) {
          try {
            const resolved = await llm.resolveModelInfo(route, id, signal)
            adapterEfforts = (resolved.reasoning?.efforts ?? []).map(effort => ({
              id: effort.id as unknown as ThinkingLevel,
              name: effort.name,
              description: effort.description,
              wire: String(effort.id),
            }))
          } catch { /* a model the adapter cannot resolve simply reports none */ }
        }
        // Whether this model is declared to take images, and whether that came
        // from the user or from the catalog. The page needs the distinction: a
        // `true` it can clear is a different control from one it cannot.
        const declaredModalities = overrideEntry?.inputModalities ?? declaredEntry?.inputModalities
        let vision: boolean | undefined = Array.isArray(declaredModalities)
          ? declaredModalities.includes('image')
          : config().reasoningEffort.defaultVision ? true : undefined
        if (vision === undefined && live.has(route) && llm !== undefined) {
          try {
            const resolved = await llm.resolveModelInfo(route, id, signal)
            const modalities = (resolved as { inputModalities?: unknown }).inputModalities
            if (Array.isArray(modalities)) vision = modalities.includes('image')
          } catch { /* unresolvable: reported as unknown, which the page shows as inherited */ }
        }

        models.push({
          id,
          name,
          adapterEfforts,
          overrideEfforts: readEfforts(effective),
          defaultEffort: undefined,
          vision,
          visionOverridden: Array.isArray(declaredModalities),
        })
      }
      models.sort((a, b) => a.id.localeCompare(b.id))

      providers.push({
        provider: route,
        displayName: typeof profile.displayName === 'string' ? profile.displayName : route,
        settingsNs: PI_AI_NS,
        settingsPath: ['providers', route],
        live: live.has(route),
        models,
      })
    }
    providers.sort((a, b) => a.provider.localeCompare(b.provider))
    return { providers, revision: section.revision, writable: section.writable, ladder: DEFAULT_EFFORT_LADDER }
  }

  /**
   * Store one per-model field on a pi-ai route.
   *
   * Shared by the effort ladder and the modality list because the risky part is
   * not the value — it is knowing which of the adapter's two mutually exclusive
   * shapes this route uses. Writing the wrong one invalidates the whole provider
   * section, which surfaces as a boot failure rather than a rejected form.
   */
  async function writeModelField(
    field: ModelField,
    request: { provider?: unknown; model?: unknown; expectedRevision?: unknown } | undefined,
    value: unknown,
  ): Promise<Awaited<ReturnType<typeof describe>>> {
    const settings = ctx.get('settings')
    if (settings === undefined) throw new ApiError(409, 'no settings provider is mounted, so this cannot be stored')

    const provider = assertProvider(request?.provider)
    const model = assertModelId(request?.model)

    // The route must already exist: creating a provider is the Models page's
    // job, and writing a profile from here could produce an invalid one.
    const profiles = readProfiles(piAiSection().value)
    if (profiles[provider] === undefined) throw new ApiError(404, 'no such pi-ai provider route')

    const { path, rewriteModels } = modelFieldPath(profiles[provider], provider, model, field)
    const op: SettingsPathOp = rewriteModels !== undefined
      // A models-list route: the array is rewritten with this one entry changed,
      // because a numeric path segment would reshape the array into an object.
      ? { op: 'set', path: path as string[], value: rewriteModels(value) as never }
      : value === undefined
        ? { op: 'unset', path: path as string[] }
        : { op: 'set', path: path as string[], value: value as never }

    try {
      await settings.mutate(
        PI_AI_NAMESPACE,
        [op],
        typeof request?.expectedRevision === 'number' ? request.expectedRevision : undefined,
      )
    } catch (error: unknown) {
      // A schema refusal is the adapter telling us the value is invalid;
      // a revision refusal is another writer. Both are the caller's to retry.
      throw new ApiError(409, error instanceof Error ? error.message : String(error))
    }
    return await describe()
  }

  // Apply immediately and whenever the live model directory changes, so a
  // provider added after plugin startup receives the same defaults.
  const defaultController = new AbortController()
  void reconcileDefaults(defaultController.signal)
  const disposeAdapters = ctx.on('llm/adapters-updated', () => {
    void reconcileDefaults(defaultController.signal)
  })

  const disposeRoutes = installRoutes(routes, {
    '/efforts': async ({ req }) => {
      if (!config().reasoningEffort.enabled) throw new ApiError(404, 'the reasoning-effort editor is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      await reconcileDefaults(controller.signal)
      return await describe(controller.signal)
    },

    '/efforts/set': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to set a model’s efforts')
      if (!config().reasoningEffort.enabled) throw new ApiError(404, 'the reasoning-effort editor is switched off')
      const request = body as { provider?: unknown; model?: unknown; efforts?: unknown; expectedRevision?: unknown } | undefined
      const value = request?.efforts === undefined ? undefined : toStoredEfforts(request.efforts)
      return await writeModelField('reasoningEfforts', request, value)
    },

    /**
     * Feature 4's companion: declare that a model accepts images.
     *
     * Separate from `/efforts/set` only in the value it validates — the placement
     * rules are shared, which is the whole reason `modelFieldPath` is generic.
     */
    '/vision/set': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to set a model’s modalities')
      if (!config().reasoningEffort.enabled) throw new ApiError(404, 'the model editor is switched off')
      const request = body as { provider?: unknown; model?: unknown; vision?: unknown; expectedRevision?: unknown } | undefined
      // `undefined` drops the override; otherwise the adapter wants the full
      // modality list, and `text` stays in it — a model that took images but not
      // text would be a stranger claim than the one the user is making.
      const value = request?.vision === undefined
        ? undefined
        : request.vision === true ? ['text', 'image']
          : request.vision === false ? ['text']
            : (() => { throw new ApiError(400, 'vision must be true, false, or omitted') })()
      return await writeModelField('inputModalities', request, value)
    },
  })

  return () => {
    defaultController.abort()
    disposeAdapters()
    disposeRoutes()
  }
}
