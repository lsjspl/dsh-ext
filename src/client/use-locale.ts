import { useSyncExternalStore } from 'react'
import { en, zh, type LocaleKey } from './locales.ts'

/**
 * The plugin's own translator.
 *
 * The shell's `LocaleRuntime` is the authority on which language is active, and
 * a slot entry that declares `locale: NS` gets a framework-injected `t`. But
 * several surfaces here are plain components nested inside those entries (panels
 * reached through a disclosure, the shared `Row`/`Section` chrome), and passing
 * `t` down through every one of them would put a prop on components whose only
 * reason to have it is plumbing.
 *
 * So the runtime is read directly and subscribed to. Same source of truth, same
 * re-render on a language switch; the difference is only how the components
 * reach it.
 */

interface LocaleFace {
  getSnapshot(): unknown
  subscribe(fn: () => void): () => void
  getLocale(): { id?: unknown } | undefined
}

/** The shell publishes its runtime on the client context; the browser sees it here. */
function runtime(): LocaleFace | undefined {
  const holder = globalThis as { __dshLocale__?: LocaleFace }
  return holder.__dshLocale__
}

/**
 * Publish the shell's locale runtime for the hook below.
 *
 * Called once from `apply`, which is the only place with a context to read it
 * from. A module-level handoff rather than React context because these
 * components are mounted by the slot machinery, not by a tree this plugin owns.
 */
export function provideLocale(face: LocaleFace): void {
  ;(globalThis as { __dshLocale__?: LocaleFace }).__dshLocale__ = face
}

const NO_SUBSCRIBE = () => () => { /* nothing to unsubscribe from */ }

/** Active locale id, re-read whenever the shell announces a change. */
function useLocaleId(): 'zh' | 'en' {
  const face = runtime()
  const id = useSyncExternalStore(
    face === undefined ? NO_SUBSCRIBE : (fn: () => void) => face.subscribe(fn),
    () => {
      const active = face?.getLocale()?.id
      return typeof active === 'string' ? active : documentLanguage()
    },
    () => documentLanguage(),
  )
  // Anything that is not Chinese falls to English, matching the shell's own
  // fallback rule rather than inventing a third behaviour.
  return id.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/**
 * The document's own language, used before the runtime is available.
 *
 * `<html lang>` is set by the shell from the same preference, so reading it
 * avoids a flash of English on first paint for a Chinese user.
 */
function documentLanguage(): string {
  try {
    return document.documentElement.lang || 'en'
  } catch {
    return 'en'
  }
}

/** Fill `{name}` placeholders. */
function interpolate(text: string, values?: Readonly<Record<string, string | number>>): string {
  if (values === undefined) return text
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = values[key]
    return value === undefined ? whole : String(value)
  })
}

export type Translate = (key: LocaleKey, values?: Readonly<Record<string, string | number>>) => string

/**
 * Translate outside React.
 *
 * The input-trigger source builds its menu row in a plain async callback, not in
 * a component, so it cannot hold a hook. This reads the same runtime the hook
 * does and applies the same zh/en fallback — the only difference is that it
 * samples the locale once per call instead of subscribing, which is correct here
 * because the menu re-queries its candidates every time it opens.
 */
export function translate(key: LocaleKey, values?: Readonly<Record<string, string | number>>): string {
  const active = runtime()?.getLocale()?.id
  const id = typeof active === 'string' ? active : documentLanguage()
  const dict = id.toLowerCase().startsWith('zh') ? zh : en
  return interpolate(dict[key] ?? en[key] ?? key, values)
}

/**
 * Translate in the active locale, falling back per key to English.
 *
 * A missing key returns the key itself rather than an empty string — the same
 * fail-loud choice the shell makes, because blank UI text is a bug that hides
 * itself.
 */
export function useT(): Translate {
  const locale = useLocaleId()
  const dict = locale === 'zh' ? zh : en
  return (key, values) => interpolate(dict[key] ?? en[key] ?? key, values)
}
