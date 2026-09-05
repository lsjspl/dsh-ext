/**
 * Read the surface a component lands on, for the places that must pick real
 * colours instead of inheriting them.
 *
 * The panel's own chrome adapts to the shell's theme through `--dsw-alias-*`
 * variables. Two things cannot: the terminal paints its own canvas and needs
 * an ANSI palette that contrasts with that canvas, and the syntax theme needs
 * to know whether its dark-sheet fallbacks would end up on a white background.
 * Both decide by measuring the first opaque background walking up the tree —
 * computed styles resolve `var()` for us, so the measurement follows whatever
 * theme the shell currently renders, light or dark, with no second source of
 * truth about the theme.
 */

/**
 * The first non-transparent background colour walking up from `el`, as a
 * computed `rgb()/rgba()` string. Falls back to near-black, the shell's own
 * default in its dark sheet.
 */
export function effectiveBackground(el: HTMLElement | null): string {
  let node: HTMLElement | null = el
  while (node !== null) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg !== '' && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg
    node = node.parentElement
  }
  return '#1c1c1f'
}

/** Perceived luminance 0..1 of a computed CSS colour (`rgb()`, `rgba()`, hex). */
function luminance(cssColor: string): number {
  let match = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(cssColor)
  let r = 0
  let g = 0
  let b = 0
  if (match !== null) {
    r = Number(match[1])
    g = Number(match[2])
    b = Number(match[3])
  } else {
    match = /^#([0-9a-f]{3,8})$/i.exec(cssColor.trim())
    if (match === null) return 0
    const hex = match[1] ?? ''
    const expand = (part: string): number => Number.parseInt(part.length === 1 ? part + part : part.slice(0, 2), 16)
    r = expand(hex.slice(0, hex.length >= 5 ? 2 : 1))
    g = expand(hex.slice(hex.length >= 5 ? 2 : 1, hex.length >= 5 ? 4 : 2))
    b = expand(hex.slice(hex.length >= 5 ? 4 : 2, hex.length >= 5 ? 6 : 3))
  }
  // WCAG relative luminance: sRGB channels are gamma-linearized first, so a
  // mid-grey and a saturated colour land where the eye puts them.
  const channel = (value: number): number => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export type SurfaceScheme = 'light' | 'dark'

/**
 * Whether the surface behind `el` renders light. Terminal canvases and syntax
 * sheets are tuned per answer; the threshold sits well above mid-grey because
 * the shell's themes are near-black or near-white with nothing between.
 */
export function surfaceScheme(el: HTMLElement | null): SurfaceScheme {
  return luminance(effectiveBackground(el)) > 0.56 ? 'light' : 'dark'
}
