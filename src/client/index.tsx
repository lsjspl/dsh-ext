import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Declaration-merging imports: these bring `shell.overlay` into the SlotMap and
// `modelDirectories` onto the context. Types only — neither is a runtime import,
// so they add nothing to the bundle.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { ModelSelectInjected } from '@deepseek-ai/dsh-client-ui-model-selection/client'
// Declares `ctx.inputTriggers`, the roster the slash menu renders its groups from.
import type { InputTriggerServiceContract } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-remotes/client'
import { SettingsPage } from './SettingsPage.tsx'
import { ComposerImages } from './ComposerImages.tsx'
import { SidePanel } from './SidePanel.tsx'
import { ModelPicker } from './ModelPicker.tsx'
import { BalanceBadge } from './BalanceView.tsx'
import { hasImagePicker, openImagePicker, subscribeImagePicker } from './picker-channel.ts'
import { DICTS, LOCALE_NS } from './locales.ts'
import { provideLocale, translate, useT } from './use-locale.ts'
import { PanelLeftIcon, PanelRightIcon, PaperclipIcon, ShieldCheckIcon, VscodeIcon, iconButtonStyle } from './icons.tsx'
import { Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { callApi } from './api.ts'
import { setPanelOpen, setPanelSession, usePanelOpen } from './panel-state.ts'
import { useActiveWorkspace, type WorkspacesHook } from './use-workspace.ts'
import { readClientConfig, useClientConfig } from './use-client-config.ts'
import { useConfig } from './use-config.ts'
import { token } from './ui.tsx'
import type { OpenEditorResult } from '../shared/api-contract.ts'

export const name = 'dsh-dev-tool-ext-client'
/**
 * Only `slots` is declared here — every seat this plugin takes goes through it.
 *
 * `commandUi` is deliberately NOT in this list. A name in `inject` is a hard
 * requirement: the whole client half would stay unloaded in a deployment that
 * composes no command layer, taking the other seven features down with the
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
  registerToolsGroup(ctx)
  // Feature 2 declares the effort ladders server-side; the model seat below
  // renders the row that exposes them.
  registerModelPicker(ctx)
  registerBalanceBadge(ctx)
  registerAutoReviewMode(ctx)
  registerSidePanel(ctx)
  registerExplorerToggles(ctx)
  registerOpenEditorLauncher(ctx)
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
 * The attach-file button, in the composer tool row beside the `+` launcher.
 *
 * One click opens the OS file dialog — no menu, no popup. The `+` launcher's own
 * menu is not used for this: its only extension seam (`commandUi.register`)
 * offers a single UI kind, `popupSelect`, so any row added there necessarily
 * opens a second layer before anything happens.
 *
 * This deliberately does NOT browse the workspace: `@` already inserts workspace
 * file references, and a second browser for the same files would be a worse
 * duplicate of it. What the OS dialog adds is the thing `@` cannot reach — a
 * file from ANYWHERE on the machine, including outside the workspace.
 *
 * `input.phase` gates it: attaching mid-send would change what is being sent, so
 * the button is disabled during `'adjudicating' | 'claimed' | 'submitting'`.
 */
function registerImageTrigger(ctx: Context): void {
  trySlot('composer attach button', () => {
    ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
      name: 'conversation.input.left',
      id: 'dsh-dev-tool-ext-attach',
      order: 0,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolAttachButton(props) {
      const t = useT()
      const config = useClientConfig()
      const input = props.useInput(state => state)
      const ready = useSyncExternalStore(subscribeImagePicker, hasImagePicker, () => false)
      if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return null

      const busy = input?.phase !== 'plain'
      const disabled = !ready || busy
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={openImagePicker}
          aria-label={t('files.attach')}
          title={t('files.attach')}
          data-dsh-plugin="dsh-dev-tool-ext"
          data-dsh-part="attach-button"
          style={{ ...iconButtonStyle, opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <PaperclipIcon />
        </button>
      )
    }))
  })
}

/**
 * A `工具` group in the slash menu, above the shipped `命令` group.
 *
 * ## Why this is the `/` menu and not the `+` menu
 *
 * The `+` button cannot host it. Its handler calls
 * `inputTriggers.toggleSource('command', hit)`, and `toggleSource` filters the
 * roster to `sources(trigger).find(item => item.name === source)` — one source,
 * selected by that literal name. Every other registered source is dropped
 * before the menu is seeded, whatever its `order`. Registering a second source
 * called `command` is not an escape either: the roster throws on a duplicate
 * trigger/name pair, which would take the shipped command menu down with it.
 *
 * The typed `/` path is different: it seeds from the FULL roster
 * (`roster.sources(hit.trigger)` with no name filter), renders one titled group
 * per source, and orders them by `order` — so a source registered below the
 * command source's default 0 lands above it. That is what this does.
 *
 * `onPick` returns `'handled'`: the row is a button, not a submenu. Picking it
 * opens the OS file dialog immediately, with no second layer in between.
 */
function registerToolsGroup(ctx: Context): void {
  trySlot('slash tools group', () => {
    ctx.inject(['inputTriggers'], (scoped: Context) => {
      const triggers = scoped.inputTriggers as InputTriggerServiceContract | undefined
      if (triggers?.registerSource === undefined) return

      scoped.effect(() => triggers.registerSource({
        trigger: '/',
      // The slash menu titles a group with `t(source.name)` against the host's
      // own `slash.menu` namespace. Contributing a key there is impossible:
      // `locale.register` throws when a namespace already carries that locale,
      // and ui-input-trigger registers both en and zh at boot. A missing key
      // falls back to the key verbatim, so the source is NAMED with the text it
      // should display — the language is fixed at registration, which is also
      // when the shell picks up the group.
      name: document.documentElement.lang.startsWith('zh') ? '工具' : 'Tools',
        // The shipped command source registers no order, so it sits at 0.
        order: -10,
        candidates: async (_session, req) => {
          const config = readClientConfig()
          if (config?.imageComposer.enabled !== true || !config.imageComposer.pickerButton) return []
          // The rail publishes the dialog; without it the row would open nothing.
          if (!hasImagePicker()) return []
          const label = translate('files.attach')
          // The source owns its own filtering — the pipeline hands the typed
          // query through rather than matching on the source's behalf.
          const query = req.query.trim().toLowerCase()
          if (query.length > 0 && !label.toLowerCase().includes(query) && !'file'.startsWith(query)) return []
          return [{ name: label, description: translate('files.attachHint') }]
        },
        onPick: () => {
          openImagePicker()
          return 'handled'
        },
      }), 'dsh-dev-tool-ext: slash tools group')
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
 * Feature 4's composer affordance — 自动审核 as a permission-style mode.
 *
 * The host's permission-mode select (read-only / workspace-write /
 * danger-full-access) is data-driven, but its option list is projected from the
 * session and a plugin cannot append to it — and the one seat inside that
 * cluster (`conversation.input.plan`) is already occupied by the plan plugin.
 * The nearest free seat is `conversation.input.left`, which the composer
 * renders immediately after the mode cluster on the same row — the affordance
 * therefore sits flush against the permission select, in the mode family's own
 * visual style.
 *
 * Turning it on writes the whole auto-review contract in one fenced write:
 * every covered tool call goes to the reviewer model (`mode: 'all'`), and a
 * verdict the model cannot reach — or a timeout, or an error — escalates to
 * the user (`onFailure: 'ask'`). Turning it off only clears `enabled`, so the
 * model/timeout choices survive for next time.
 */
function registerAutoReviewMode(ctx: Context): void {
  trySlot('auto review mode', () => {
    ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
      name: 'conversation.input.left',
      id: 'dsh-dev-tool-ext-auto-review',
      order: 0,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolAutoReviewMode() {
      const t = useT()
      const { view, busy, setMany } = useConfig()
      if (view === undefined) return null
      const review = view.value.commandReview
      const enabled = review.enabled === true && review.mode === 'all'
      return (
        <button
          type="button"
          aria-pressed={enabled}
          title={t('review.autoChip.hint')}
          disabled={busy}
          onClick={() => {
            setMany(enabled
              ? [{ path: ['commandReview', 'enabled'], value: false }]
              : [
                  { path: ['commandReview', 'enabled'], value: true },
                  { path: ['commandReview', 'mode'], value: 'all' },
                  { path: ['commandReview', 'onFailure'], value: 'ask' },
                ])
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            padding: '3px 9px',
            border: `1px solid ${enabled ? token.accent : token.border}`,
            borderRadius: 999,
            background: enabled ? 'var(--dsw-alias-interactive-bg-hover, transparent)' : 'transparent',
            color: enabled ? token.accent : token.textMuted,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <ShieldCheckIcon size={13} />
          {t('review.autoChip')}
        </button>
      )
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
    }, function DevToolSidePanel(props: { useWorkspaces?: WorkspacesHook }) {
      const config = useClientConfig()
      // Root-scope seats get `useWorkspaces`; it is the only reliable answer to
      // "which project is the user looking at" when no session is open, so the
      // panel stops falling back to the registry's oldest workspace.
      const workspace = useActiveWorkspace(props.useWorkspaces)
      if (config?.explorer.enabled !== true) return null
      return (
        <SidePanel
          side={config.explorer.side}
          defaultOpen={config.explorer.defaultOpen}
          workspace={workspace}
        />
      )
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
    }, function DevToolExplorerToggle(props: { sessionId?: string }) {
      const t = useT()
      const config = useClientConfig()
      const open = usePanelOpen(config?.explorer.defaultOpen ?? false)
      // This seat is session-scoped; the panel's `shell.overlay` seat is not.
      // Publishing here is what lets the panel ask about the right project.
      useEffect(() => { setPanelSession(props.sessionId) }, [props.sessionId])
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

/**
 * Feature 5's launcher — an "open the project in VS Code" button in the session
 * header.
 *
 * It lives in this seat rather than the panel's own toolbar because the launch
 * target is the session's project, not a view inside the panel; and its `order`
 * sits directly above the session-log-export plugin's (order 1), so the two
 * project-level buttons read as neighbours.
 *
 * The session id is the launch argument: the backend resolves the workspace
 * from that session's own cwd, so VS Code opens the project this conversation
 * is actually about. A failed launch is announced with the host's toast — a
 * header button has no panel beneath it to print an error into.
 */
function registerOpenEditorLauncher(ctx: Context): void {
  trySlot('explorer open-editor launcher', () => {
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
      name: 'conversation.session.header.utilities',
      id: 'dsh-dev-tool-ext-open-editor',
      order: 2,
      registrant: 'dsh-dev-tool-ext',
    }, function DevToolOpenEditorLauncher(props: { sessionId?: string }) {
      const t = useT()
      const config = useClientConfig()
      const [busy, setBusy] = useState(false)
      const [failure, setFailure] = useState<{ text: string; seq: number } | undefined>(undefined)
      if (config?.explorer.enabled !== true) return null

      const open = async () => {
        setBusy(true)
        setFailure(undefined)
        const session = props.sessionId !== undefined && props.sessionId.length > 0
          ? `?session=${encodeURIComponent(props.sessionId)}`
          : ''
        const result = await callApi<OpenEditorResult>(`/explorer/open-editor${session}`)
        setBusy(false)
        if (!result.ok) {
          setFailure({ text: t('explorer.openEditorFailed', { message: result.message }), seq: Date.now() })
        }
      }

      return (
        <>
          <button
            type="button"
            aria-label={t('explorer.openEditor')}
            title={t('explorer.openEditor')}
            disabled={busy}
            onClick={() => { void open() }}
            style={iconButtonStyle}
          >
            <VscodeIcon size={16} />
          </button>
          {failure !== undefined && (
            // Keyed by a per-show sequence: re-showing restarts the fade.
            <Toast key={failure.seq} text={failure.text} onDone={() => { setFailure(undefined) }} />
          )}
        </>
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
