/**
 * Per-extension file icons, in the shape editors have trained everyone to read.
 *
 * ## Why these are drawn here rather than pulled from a package
 *
 * The obvious dependency is one of the `*-icon-theme` sets, and they are all the
 * wrong shape for this: they ship hundreds of individual SVG *files* addressed
 * through a JSON manifest, which a plugin bundle would have to either inline
 * wholesale (hundreds of KB for the dozen types anyone actually sees in a
 * project tree) or fetch at runtime from a path the harness does not serve.
 *
 * So the palette below is the compromise that keeps the useful half of an icon
 * theme — *colour* carries the file type at a glance, which is the thing the
 * user asked for — while the glyph stays one shared document outline. Twelve
 * bytes of colour per extension does the recognition work; a bespoke glyph per
 * language would not add much beyond it.
 *
 * Colours are literal hex rather than theme tokens on purpose: a language's
 * brand colour is not part of the shell's palette, and mapping TypeScript blue
 * onto `--dsw-alias-brand-primary` would recolour it per skin and destroy the
 * recognition. They are chosen bright enough to hold contrast on both the light
 * and dark surfaces.
 */

interface IconProps {
  readonly size?: number
}

/** Extension → accent colour. Lower-case, no leading dot. */
const COLOURS: Record<string, string> = {
  ts: '#3178c6', tsx: '#3178c6', mts: '#3178c6', cts: '#3178c6',
  js: '#f0db4f', jsx: '#f0db4f', mjs: '#f0db4f', cjs: '#f0db4f',
  json: '#cbcb41', jsonc: '#cbcb41', json5: '#cbcb41',
  py: '#3572a5', pyi: '#3572a5',
  rs: '#dea584',
  go: '#00add8',
  java: '#e76f00', kt: '#a97bff', kts: '#a97bff',
  c: '#649ad2', h: '#649ad2', cpp: '#f34b7d', cc: '#f34b7d', hpp: '#f34b7d',
  cs: '#68217a',
  rb: '#cc342d',
  php: '#8892bf',
  swift: '#ff5b32',
  sh: '#89e051', bash: '#89e051', zsh: '#89e051', fish: '#89e051',
  bat: '#c1f12e', cmd: '#c1f12e', ps1: '#5391fe',
  html: '#e34c26', htm: '#e34c26',
  css: '#563d7c', scss: '#c6538c', sass: '#c6538c', less: '#1d365d',
  vue: '#41b883', svelte: '#ff3e00',
  md: '#7ec7ff', mdx: '#7ec7ff', txt: '#9aa0a6', rst: '#9aa0a6',
  yml: '#cb171e', yaml: '#cb171e', toml: '#9c4221', ini: '#9aa0a6', env: '#e8d44d',
  xml: '#f1662a', svg: '#ffb13b',
  sql: '#dd8500', db: '#dd8500', sqlite: '#dd8500',
  png: '#a074c4', jpg: '#a074c4', jpeg: '#a074c4', gif: '#a074c4',
  webp: '#a074c4', ico: '#a074c4', bmp: '#a074c4', avif: '#a074c4',
  pdf: '#e5252a',
  zip: '#f9c33c', tar: '#f9c33c', gz: '#f9c33c', rar: '#f9c33c', '7z': '#f9c33c',
  lock: '#8b8b8b',
  exe: '#a3a3a3', dll: '#a3a3a3', so: '#a3a3a3', dylib: '#a3a3a3',
}

/** Whole-filename matches, which beat the extension (`Dockerfile` has none). */
const BY_NAME: Record<string, string> = {
  'dockerfile': '#0db7ed',
  '.gitignore': '#f14e32',
  '.gitattributes': '#f14e32',
  '.gitmodules': '#f14e32',
  'license': '#d9b430',
  'license.md': '#d9b430',
  'readme.md': '#7ec7ff',
  'makefile': '#89e051',
  'package.json': '#8bc34a',
  'pnpm-lock.yaml': '#f9ad00',
  'package-lock.json': '#8b8b8b',
  'tsconfig.json': '#3178c6',
  '.npmrc': '#cb3837',
  '.editorconfig': '#9aa0a6',
}

/** The muted grey an unrecognised file gets — visible, but not claiming a type. */
const FALLBACK = 'var(--dsw-alias-label-caption, #9aa0a6)'

export function extensionOf(name: string): string {
  const at = name.lastIndexOf('.')
  // A leading dot is the whole name (`.gitignore`), not an extension.
  if (at <= 0) return ''
  return name.slice(at + 1).toLowerCase()
}

/** The accent colour for one file name. */
export function colourFor(name: string): string {
  return BY_NAME[name.toLowerCase()] ?? COLOURS[extensionOf(name)] ?? FALLBACK
}

/**
 * A document outline tinted by file type, with the extension's first two letters
 * inside it.
 *
 * The letters are what make this readable at 16px without a per-language glyph:
 * colour narrows it to a family and the label names it exactly, which together
 * beat a generic page icon repeated down the whole tree.
 */
export function FileIcon(props: IconProps & { readonly name: string }) {
  const size = props.size ?? 16
  const colour = colourFor(props.name)
  const ext = extensionOf(props.name)
  // Two characters is what fits legibly; three crowd the fold and stop reading
  // as letters at all.
  const label = ext.slice(0, 2).toUpperCase()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flex: '0 0 auto' }}
    >
      {/* The page, with its corner folded. */}
      <path
        d="M3.6 1.9H9.1L12.9 5.6V14.1H3.6V1.9Z"
        stroke={colour}
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill={colour}
        fillOpacity="0.13"
      />
      <path d="M9 2.1V5.7H12.7" stroke={colour} strokeWidth="1.2" strokeLinejoin="round" />
      {label.length > 0 && (
        <text
          x="8.2"
          y="11.9"
          textAnchor="middle"
          // 5.4px is small, but it is a shape cue more than prose — and it is the
          // largest size that fits two characters between the fold and the edge.
          style={{ font: 'bold 5.4px ui-sans-serif, system-ui, sans-serif' }}
          fill={colour}
        >{label}</text>
      )}
    </svg>
  )
}

/** A folder, open or closed, in the shell's own accent. */
export function FolderIcon(props: IconProps & { readonly open: boolean }) {
  const size = props.size ?? 16
  const colour = 'var(--dsw-alias-brand-primary, #6aa9ff)'
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      {props.open ? (
        <path
          d="M1.7 4.1H6.1L7.3 5.7H13.1V6.7H4.2L2.2 13.1H1.7V4.1Z M4.9 7.7H14.6L12.8 13.4H3.1L4.9 7.7Z"
          stroke={colour}
          strokeWidth="1.2"
          strokeLinejoin="round"
          fill={colour}
          fillOpacity="0.16"
        />
      ) : (
        <path
          d="M1.9 3.6H6.3L7.5 5.2H14.1V13.1H1.9V3.6Z"
          stroke={colour}
          strokeWidth="1.2"
          strokeLinejoin="round"
          fill={colour}
          fillOpacity="0.16"
        />
      )}
    </svg>
  )
}
