/**
 * Borrow the host's own CSS-module classes at runtime.
 *
 * Shadowing `conversation.input.model` means rendering the whole model
 * affordance ourselves, and a hand-drawn menu beside the composer's other
 * controls would read as a foreign object: the host's menu has a specific
 * radius, shadow, row height, hover wash, and selected tick, all of which live
 * in a CSS module compiled into its bundle.
 *
 * Reproducing those by hand drifts the moment the host restyles. Importing them
 * is impossible — the module is internal, and a plugin cannot reach another
 * package's compiled `.module.css`. What IS reachable is the stylesheet the host
 * already put in the document: its rules are right there in `document.styleSheets`
 * under a build-time hash prefix (`_7KE1Ra_option`, and so on).
 *
 * So this probes for that prefix rather than hard-coding it. A hash is a build
 * artifact and will change; a probe that looks for the *shape* of the class set
 * survives that, and when it finds nothing the caller falls back to this
 * plugin's own tokens-based styling. The result is memoized because scanning
 * every rule in every sheet is not free and the answer cannot change without a
 * reload.
 */

/**
 * Class names the model menu is built from. A candidate prefix must supply all
 * of these to be accepted: a partial match means the host reorganized its
 * stylesheet, and half-borrowed styling looks worse than none.
 */
const REQUIRED = [
  'root', 'trigger', 'triggerLabel', 'triggerEffort', 'chevron', 'chevronOpen',
  'menu', 'cell', 'cellLabel', 'cellValue', 'cellChevron',
  'groups', 'group', 'groupTitle', 'option', 'optionCopy', 'selected',
  'modelName', 'description', 'check', 'empty', 'status', 'error', 'warning', 'retry',
] as const

export type HostClassName = typeof REQUIRED[number]
export type HostClasses = Readonly<Record<HostClassName, string>>

let resolved: HostClasses | null | undefined

/**
 * Find the hashed prefix the model-select module was compiled under.
 *
 * Cross-origin sheets throw on `cssRules`, which is expected rather than
 * exceptional: the harness serves its own CSS same-origin, so a sheet that
 * refuses inspection is someone else's and is skipped.
 */
function probe(): HostClasses | null {
  if (typeof document === 'undefined') return null

  // prefix -> the set of REQUIRED names seen under it.
  const seen = new Map<string, Set<string>>()
  const pattern = /\.((?:_[A-Za-z0-9]+_)|(?:[A-Za-z0-9]+_))([A-Za-z][A-Za-z0-9]*)\b/g

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      const selector = (rule as CSSStyleRule).selectorText
      if (selector === undefined || selector === null) continue
      for (const match of selector.matchAll(pattern)) {
        const [, prefix, local] = match
        if (prefix === undefined || local === undefined) continue
        if (!(REQUIRED as readonly string[]).includes(local)) continue
        let bucket = seen.get(prefix)
        if (bucket === undefined) {
          bucket = new Set()
          seen.set(prefix, bucket)
        }
        bucket.add(local)
      }
    }
  }

  for (const [prefix, names] of seen) {
    if (names.size !== REQUIRED.length) continue
    const table = {} as Record<HostClassName, string>
    for (const name of REQUIRED) table[name] = `${prefix}${name}`
    return table
  }
  return null
}

/**
 * The host's model-menu classes, or `null` when this build's stylesheet does not
 * match. Probed once per page.
 */
export function hostModelClasses(): HostClasses | null {
  if (resolved === undefined) {
    try {
      resolved = probe()
    } catch {
      // A browser that refuses stylesheet inspection entirely still gets a
      // working, if plainer, menu.
      resolved = null
    }
  }
  return resolved
}
