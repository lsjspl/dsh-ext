import { useState } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Declaration-merging imports: these bring `shell.overlay` into the SlotMap and
// `modelDirectories` onto the context. Types only — neither is a runtime import,
// so they add nothing to the bundle.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { ModelSelectInjected } from '@deepseek-ai/dsh-client-ui-model-selection/client'
// Declares `ctx.inputTriggers`, which is how the `+` launcher's menu is joined.
import type { InputTriggerServiceContract } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-remotes/client'
import { SettingsPage } from './SettingsPage.tsx'
import { ComposerImages } from './ComposerImages.tsx'
import { SidePanel } from './SidePanel.tsx'
import { ModelPicker } from './ModelPicker.tsx'
import { BalanceBadge } from './BalanceView.tsx'
import { hasImagePicker, openImagePicker } from './picker-channel.ts'
import { DICTS, LOCALE_NS } from './locales.ts'
import { provideLocale, translate, useT } from './use-locale.ts'
import { PanelLeftIcon, PanelRightIcon, iconButtonStyle } from './icons.tsx'
import { setPanelOpen, usePanelOpen } from './panel-state.ts'
import { readClientConfig, useClientConfig } from './use-client-config.ts'

export const name = 'dsh-dev-tool-ext-client'
/**
 * Only `slots` is declared here — every seat this plugin takes goes through it.
 *
 * `inputTriggers` is deliberately NOT in this list. A name in `inject` is a hard
 * requirement: the whole client half would stay unloaded in a deployment that
 * composes no input-trigger layer, taking the other seven features down with the
 * `+` menu entry. It is instead requested per-feature through `ctx.inject`,
 * which scopes the wait to that one registration.
 */
export const inject = ['slots']

/**
 * Priority for the seats this plugin has to SHADOW rather than merely join.
 *
 * `conversation.input.attachments` is a `single` slot the shipped composer
 * already occupies at the default priority 0. Registering a second entry at the
 * same priority throws by design — that fail-loud is how the framework stops two
 * plugins from silently fighting over one seat. Shadowing rank is ascending and
 * the LOWEST renders, so a negative value puts this plugin's rail in front.
 *
 * Deliberately -10 rather than a very large negative number: it leaves room for
 * another plugin (or a user's own) to shadow this one in turn.
 */
const SHADOW_PRIORITY = -10

/**
 * Register one slot entry without letting its failure reach the loader.
 *
 * A slot registration can throw for reasons outside this plugin's control — most
 * importantly a priority collision with a plugin installed afterwards.
 * Unguarded, one such throw escapes `apply`, the loader entry fails, and the
 * harness reports "Failed to load plugins" for ALL of this plugin's features.
 * That is the blast radius the host half already avoids by wrapping each feature
 * mount, and the browser half had no equivalent until this.
 */
function trySlot(label: string, register: () => void): void {
  try {
    register()
  } catch (error: unknown) {
    // The console is the only channel available: this runs before any of this
    // plugin's own UI exists to display a notice in.
    console.warn(
      `[dsh-dev-tool-ext] the "${label}" surface could not be registered, so that one feature is unavailable. `
      + 'Everything else still loaded.',
      error,
    )
  }
}

export function apply(ctx: Context): void {
  // Copy first: every surface below reads it, and a late dictionary would show
  // raw keys on first paint.
  installLocale(ctx)

  trySlot('settings page', () => {
    ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section',
      id: 'dsh-dev-tool-ext',
      order: 720,
      label: () => (document.documentElement.lang.startsWith('zh') ? '开发工具' : 'Dev Tools'),
    }, SettingsPage))
  })

  registerComposerImages(ctx)
  // Feature 2 declares the effort ladders server-side; the model seat below
  // renders the row that exposes them.
  registerModelPicker(ctx)
  registerBalanceBadge(ctx)
  registerSidePanel(ctx)
  registerExplorerToggles(ctx)
}

/**
 * Register this plugin's dictionaries and hand the runtime to the hook.
 *
 * Both are best-effort: a composition without the locale runtime still renders,
 * in English, rather than failing to load.
 */
function installLocale(ctx: Context): void {
  try {
    const locale = ctx.get('locale') as {
      register?: (ns: string, id: string, dict: Record<string, string>) => () => void
      getSnapshot?: () => unknown
      subscribe?: (fn: () => void) => () => void
      getLocale?: () => { id?: unknown } | undefined
    } | undefined
    if (locale === undefined) return

    if (typeof locale.register === 'function') {
      for (const [id, dict] of Object.entries(DICTS)) {
        // The untyped three-argument form: this namespace is not merged into the
        // shell's LocaleNamespaceMap, which is the documented case for it.
        ctx.effect(() => locale.register!(LOCALE_NS, id, dict as Record<string, string>), `dsh-dev-tool-ext: ${id} dictionary`)
      }
    }
    if (typeof locale.subscribe === 'function' && typeof locale.getSnapshot === 'function') {
      provideLocale({
        getSnapshot: locale.getSnapshot.bind(locale),
        subscribe: locale.subscribe.bind(locale),
        getLocale: (locale.getLocale ?? (() => undefined)).bind(locale),
      })
    }
  } catch (error: unknown) {
    console.warn('[dsh-dev-tool-ext] the locale runtime was unavailable; text stays in English.', error)
  }
}

/** Feature 1 — the draft-image rail and its picker button. */
function registerComposerImages(ctx: Context): void {
  // A `single` slot the shipped composer already occupies, so this SHADOWS it.
  // Taking the seat means owning the rail: previews, removal, and the drop
  // target all have to be reproduced, not just the reorder gesture.
  trySlot('composer image rail', () => {
    ctx.slots.inject('conversation.input.attachments', () => ctx.slots.register({
      name: 'conversation.input.attachments',
      priority: SHADOW_PRIORITY,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolAttachments(props) {
      const config = useClientConfig()
      const input = props.useInput(state => state)
      if (config?.imageComposer.enabled !== true) return null
      return (
        <ComposerImages
          attachments={props.attachments}
          canAcceptDrop={props.canAcceptDrop}
          onAddImages={props.onAddImages}
          onRemoveImage={props.onRemoveImage}
          dropLimits={props.dropLimits}
          input={input}
          actions={props.inputActions}
          dragEnabled={config.imageComposer.dragReorder}
        />
      )
    }))
  })

  registerImageTrigger(ctx)
}

/**
 * The image entry inside the `+` launcher's menu.
 *
 * The `+` button is the input-trigger launcher: it opens the same grouped
 * candidate menu that typing `/` produces, over a synthetic selection span. Its
 * groups are not a slot — they are the `ctx.inputTriggers` source roster — so the
 * way in is to register a source rather than to look for a seat inside the popup.
 *
 * `order: -1` puts this group above the command roster (which registers at the
 * default 0), which is what "at the very top" asks for. `showGroupTitle: false`
 * keeps it a single flat row instead of a one-item section with a heading.
 *
 * `onPick` returns `'handled'`: the pick opens the OS file dialog and consumes
 * the token itself, with no draft text to insert and no host command to run.
 *
 * The registration is wrapped in `ctx.inject` rather than reading the service
 * directly, because the trigger layer is a sibling plugin with no load-order
 * guarantee against this one: a bare `ctx.get` runs once, before the service
 * exists, and silently registers nothing. `ctx.inject` defers this body until
 * `inputTriggers` is up and re-runs it if the layer ever reloads.
 */
function registerImageTrigger(ctx: Context): void {
  trySlot('composer image command', () => {
    ctx.inject(['inputTriggers'], (scoped) => {
      const triggers = scoped.inputTriggers as InputTriggerServiceContract | undefined
      if (triggers?.registerSource === undefined) return

      scoped.effect(() => triggers.registerSource({
        trigger: '/',
        name: 'dsh-dev-tool-ext-image',
        order: -1,
        showGroupTitle: false,
        candidates: async (_session, req) => {
          // Both switches are read per query rather than at registration:
          // settings are hot-reloaded, and a source disposed/re-registered on
          // every toggle would race the menu that is currently reading it.
          const config = readClientConfig()
          if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return []
          // The picker channel is published by the attachment rail. Without it
          // the pick would open a dialog whose files have nowhere to land.
          if (!hasImagePicker()) return []

          // The launcher seeds this source with an empty query; a typed `/`
          // filters it. Answering nothing for a non-matching query keeps the row
          // out of an unrelated command search rather than pinning it above
          // every result.
          const query = req.query.trim().toLowerCase()
          const label = translate('images.add')
          if (query.length > 0 && !'image'.startsWith(query) && !'图片'.startsWith(query)
            && !label.toLowerCase().startsWith(query)) return []
          return [{ name: label, description: translate('images.pickHint') }]
        },
        onPick: () => {
          openImagePicker()
          return 'handled'
        },
      }), 'dsh-dev-tool-ext: image trigger source')
    })
  })
}

/**
 * The composer model seat — the shipped selector, plus collapsible groups.
 *
 * Feature 2 (effort ladders) stays server-side: it writes each model's
 * `reasoningEffort` into the pi-ai adapter's catalog, and the effort ROW in this
 * menu then lists them. There is deliberately no second effort control anywhere
 * — an earlier revision put one in `conversation.input.right` and it read stale
 * the moment the user picked in the menu instead.
 *
 * Taking this seat is about the model list itself: the shipped menu groups by
 * provider but expands every group permanently, which with several routes
 * configured is a single long scroll. `ModelPicker` reproduces the whole
 * affordance — both panes, every error state, the keyboard model — and adds
 * collapse plus a filter. See ModelPicker.tsx for the full list of obligations
 * that come with occupying a `single` seat.
 */
function registerModelPicker(ctx: Context): void {
  trySlot('composer model select', () => {
    // `modelDirectories` and `sessions` are required here, not optional extras:
    // a seat's injected face is built by whichever entry registers it, NOT
    // handed down by the seat's owner. Shadowing therefore means reproducing
    // ui-model-selection's own `inject` — the same per-session directory
    // instance the /model popup reads, so a switch made in either surface is
    // what the other shows next. An earlier revision read these four fields off
    // the incoming props and crashed on `directory.getSnapshot()` being
    // undefined, because nothing upstream ever put them there.
    ctx.inject(['slots', 'modelDirectories', 'sessions'], (scope: Context) => {
      const models = scope.modelDirectories
      // One tsconfig compiles both halves of this plugin, so the host's own
      // `sessions` service (dsh-session's `SessionStore`) and the browser's
      // (`ISessions`) merge into a single `Context` declaration and the host
      // one wins the lookup. This file only ever runs in the browser, where the
      // client face is what is actually mounted.
      const sessions = scope.sessions as unknown as ISessions
      scope.slots.inject('conversation.input.model', () => scope.slots.register({
        name: 'conversation.input.model',
        priority: SHADOW_PRIORITY,
        registrant: 'dsh-dev-tool-ext',
        inject: (sessionId) => {
          const directory = models.directoryFor(sessionId)
          // An addressed subagent session cannot have its model reassigned; the
          // host's own entry reports that as unavailable rather than hiding the
          // control, and the menu explains why.
          const available = sessions.subagentAddress(sessionId) === undefined
          return {
            available,
            directory: directory.store,
            load: () => {
              if (available) directory.load().catch(() => {})
            },
            select: (selection: ModelSelection) => available
              ? directory.select(selection).then(() => true, () => false)
              : Promise.resolve(false),
          }
        },
      }, function DevToolModelSelect(props) {
      const config = useClientConfig()
      // This entry always renders. Shadowing a `single` seat retires the
      // resident occupant outright — there is no runtime hand-back, and
      // returning null here would leave the composer with NO model control at
      // all. So the switch cannot gate registration (config arrives
      // asynchronously, long after apply) and instead gates the added
      // behaviour: off, or still loading, means the classic always-expanded
      // list, which is exactly what the shipped selector rendered.
      return (
        <ModelPicker
          locked={props.locked}
          available={props.available}
          directory={props.directory}
          load={props.load}
          select={props.select}
          collapsible={config?.modelPicker.groupCollapse ?? false}
        />
      )
      }))
    })
  })
}

/**
 * Feature 3 — the balance chip, immediately left of the model select.
 *
 * `conversation.input.right` is the seat for it rather than the session header:
 * the balance is what a user checks while choosing a model, so it belongs beside
 * that choice. Despite the seat's "before the send button" description, the
 * composer renders this seat FIRST in its trailing group — ahead of the model
 * select, the context meter, and send — so an entry here lands exactly to the
 * model control's left.
 */
function registerBalanceBadge(ctx: Context): void {
  trySlot('balance badge', () => {
    ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
      name: 'conversation.input.right',
      id: 'dsh-dev-tool-ext-balance',
      order: 0,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolBalanceBadge() {
      const config = useClientConfig()
      if (config?.deepseekBalance.enabled !== true || !config.deepseekBalance.headerBadge) return null
      return <BalanceBadge />
    }))
  })
}

/**
 * Feature 5 — the explorer, docked to a frame edge.
 *
 * `shell.overlay` is a root-scope `list` seat spanning the whole frame, which is
 * what lets this be a real side panel. See `SidePanel.tsx` for why the `details`
 * column itself is not taken, and how the panel reflows the conversation instead
 * of covering it.
 */
function registerSidePanel(ctx: Context): void {
  trySlot('project side panel', () => {
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
      name: 'shell.overlay',
      id: 'dsh-dev-tool-ext-explorer',
      order: 40,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolSidePanel() {
      const config = useClientConfig()
      if (config?.explorer.enabled !== true) return null
      return <SidePanel side={config.explorer.side} defaultOpen={config.explorer.defaultOpen} />
    }))
  })
}

/**
 * Feature 5's opener — a panel-toggle button in the session header.
 *
 * The header's right-aligned `utilities` seat is where the shell already puts its
 * own small icon buttons, so this is the seat a user reaches for. The icon is the
 * frame's own panel silhouette rather than a vertical rail of text down the edge:
 * a rail costs 30px of conversation width permanently to save one click, which is
 * the wrong trade for a panel most sessions never open.
 */
function registerExplorerToggles(ctx: Context): void {
  trySlot('explorer toggle', () => {
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
      name: 'conversation.session.header.utilities',
      id: 'dsh-dev-tool-ext-explorer-toggle',
      order: 70,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolExplorerToggle() {
      const t = useT()
      const config = useClientConfig()
      const open = usePanelOpen(config?.explorer.defaultOpen ?? false)
      if (config?.explorer.enabled !== true) return null
      const Icon = config.explorer.side === 'right' ? PanelRightIcon : PanelLeftIcon
      return (
        <button
          type="button"
          aria-label={t('explorer.title')}
          aria-pressed={open}
          title={t('explorer.title')}
          onClick={() => { setPanelOpen(!open) }}
          style={{
            ...iconButtonStyle,
            color: open
              ? 'var(--dsw-alias-label-primary, currentColor)'
              : 'var(--dsw-alias-label-secondary, currentColor)',
            background: open ? 'var(--dsw-alias-button-floating-fill, transparent)' : 'transparent',
          }}
        >
          <Icon />
        </button>
      )
    }))
  })
}

/** Kept for the settings page's inline preview, which reuses the same disclosure. */
export function useLocalToggle(key: string, fallback: boolean): [boolean, (next: boolean) => void] {
  const read = () => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? fallback : stored === '1'
    } catch {
      return fallback
    }
  }
  const [open, setOpen] = useState(read)
  const write = (next: boolean) => {
    setOpen(next)
    try {
      window.localStorage.setItem(key, next ? '1' : '0')
    } catch { /* a browser refusing storage still gets a working toggle */ }
  }
  return [open, write]
}
