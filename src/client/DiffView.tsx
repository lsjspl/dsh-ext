import { useMemo, useState, type ReactElement } from 'react'
import {
  Diff,
  Hunk,
  expandCollapsedBlockBy,
  expandFromRawCode,
  markEdits,
  parseDiff,
  textLinesToHunk,
  tokenize,
} from 'react-diff-view'
import type { ChangeData, HunkData } from 'react-diff-view'
import { createTwoFilesPatch } from 'diff'
import { refractor } from 'refractor/core'
import typescript from 'refractor/typescript'
import tsx from 'refractor/tsx'
import javascript from 'refractor/javascript'
import json from 'refractor/json'
import python from 'refractor/python'
import rust from 'refractor/rust'
import go from 'refractor/go'
import java from 'refractor/java'
import kotlin from 'refractor/kotlin'
import c from 'refractor/c'
import cpp from 'refractor/cpp'
import csharp from 'refractor/csharp'
import php from 'refractor/php'
import ruby from 'refractor/ruby'
import swift from 'refractor/swift'
import lua from 'refractor/lua'
import bash from 'refractor/bash'
import batch from 'refractor/batch'
import powershell from 'refractor/powershell'
import yaml from 'refractor/yaml'
import ini from 'refractor/ini'
import toml from 'refractor/toml'
import markdown from 'refractor/markdown'
import markup from 'refractor/markup'
import css from 'refractor/css'
import scss from 'refractor/scss'
import less from 'refractor/less'
import sql from 'refractor/sql'
import diffGrammar from 'refractor/diff'
import { useResource } from './use-resource.ts'
import { Notice, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { countAddedStyle, countRemovedStyle } from './ReviewView.tsx'
import type { ReviewDiff } from '../shared/api-contract.ts'

/**
 * The diff tab: one changed file, rendered as a real line-level diff — changed
 * lines coloured in place, unchanged context between them collapsed behind
 * "N unmodified lines" bars that expand on click, every line syntax
 * highlighted, and the exact words that moved within a changed line marked.
 *
 * This is `react-diff-view` — the component library built for exactly this
 * surface — fed from three sources:
 *
 * - the two texts come from `/explorer/review` (git's `HEAD:` side and the
 *   working tree), already newline-normalized, which is what makes the diff
 *   line-level on a Windows checkout: without it every CRLF line "differs";
 * - the patch is generated here with `diff`'s `createTwoFilesPatch` rather
 *   than taken from git, so a new file (no `HEAD:` revision) still renders as
 *   one whole addition and a deleted file as one whole removal;
 * - highlighting is Prism via `refractor`, with a curated grammar set — the
 *   host's own highlighter is a package-internal singleton this bundle cannot
 *   reach, and bundling the ~30 grammars anyone actually diffs costs little.
 *
 * Line counts come from the backend (git numstat), so the header shows the
 * same versus-HEAD figures the review list's flat view does.
 */

const grammars = {
  typescript, tsx, javascript, json, python, rust, go, java, kotlin,
  c, cpp, csharp, php, ruby, swift, lua, bash, batch, powershell,
  yaml, ini, toml, markdown, markup, css, scss, less, sql, diff: diffGrammar,
}
for (const grammar of Object.values(grammars)) refractor.register(grammar)

/**
 * react-diff-view 3 targets the older refractor contract where `highlight()`
 * returned an array of HAST nodes. Refractor 5 returns a Root object instead.
 * The diff tokenizer only calls this one method, so adapt that return shape at
 * the boundary; without it tokenization throws and silently falls back to plain
 * text, which is why the first line-level diff had no syntax colours.
 */
const diffRefractor = {
  highlight(text: string, language: string) {
    const children = refractor.highlight(text, language).children
    // The `markup` grammar (html/xml/svg/vue) nests element nodes several
    // levels deep (tag → inner span → …). react-diff-view's token tree builder
    // expects every non-text node to carry an ARRAY of `children`; a deeper
    // self-closing node (`<br/>`, `<item/>`) can come through with no children,
    // and flattening to a single text token is what keeps those languages from
    // crashing the whole view. We keep the outermost class so the token still
    // takes a colour; nested class detail is sacrificed, never the render.
    if (language === 'markup') return flattenMarkup(children)
    return children
  },
} as unknown as typeof refractor

/**
 * Flatten HAST children into a single level of text tokens. Every element is
 * reduced to one `{ type: 'text', value, properties }` whose value is the
 * concatenation of all its descendant text, so no node below the top has a
 * `children` array react-diff-view would have to walk.
 */
function flattenMarkup(nodes: readonly unknown[]): unknown[] {
  const text = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (node === null || typeof node !== 'object') return ''
    const record = node as { children?: unknown; value?: unknown }
    if (typeof record.value === 'string') return record.value
    if (Array.isArray(record.children)) return record.children.map(text).join('')
    return ''
  }
  return nodes.map(node => {
    const record = node as { properties?: { className?: unknown } }
    return {
      type: 'text',
      value: text(node),
      ...(record.properties === undefined ? {} : { properties: record.properties }),
    }
  })
}

/** File extension → refractor grammar name (the host's shiki ids differ). */
const GRAMMAR_BY_EXTENSION: Record<string, string> = {
  ts: 'typescript', mts: 'typescript', cts: 'typescript',
  tsx: 'tsx',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  json: 'json', jsonc: 'json', json5: 'json',
  py: 'python', pyi: 'python',
  rs: 'rust', go: 'go', java: 'java', kt: 'kotlin', kts: 'kotlin',
  c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  cs: 'csharp', php: 'php', rb: 'ruby', swift: 'swift', lua: 'lua',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash',
  bat: 'batch', cmd: 'batch', ps1: 'powershell',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini', conf: 'ini',
  md: 'markdown', markdown: 'markdown', mdx: 'markdown',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup', vue: 'markup',
  css: 'css', scss: 'scss', less: 'less',
  sql: 'sql', diff: 'diff', patch: 'diff',
}

export function grammarFor(path: string): string | undefined {
  const name = path.slice(path.lastIndexOf('/') + 1).toLowerCase()
  const dot = name.lastIndexOf('.')
  const extension = dot <= 0 ? '' : name.slice(dot + 1)
  return GRAMMAR_BY_EXTENSION[extension]
}

/**
 * Drop hunk slots react-diff-view's expansion helpers can leave `undefined`.
 *
 * `Hunk` reads `hunk.oldStart` on render, so a single missing slot becomes a
 * whole-view crash. `expandCollapsedBlockBy`/`expandFromRawCode` keep a parallel
 * index whose length can exceed the hunks actually written, so guard at the
 * call site rather than trusting the library's return.
 */
function safeHunks(hunks: readonly HunkData[]): HunkData[] {
  return hunks.filter((hunk): hunk is HunkData => hunk !== undefined && typeof hunk?.oldStart === 'number')
}

/**
 * Context lines carried around each change cluster, git-style. Gaps between
 * clusters longer than {@link MIN_GAP_LINES} collapse behind an expander bar.
 */
const PATCH_CONTEXT = 3

/** A gap shorter than this renders in full; only longer ones get a bar. */
const MIN_GAP_LINES = 8

/** One collapsed run of unchanged lines, addressed by its first old-side line. */
interface Gap {
  readonly start: number
  readonly end: number
  readonly count: number
}

/**
 * Gaps between (and around) the base hunks, on the old side. `start`/`end` are
 * exactly the range `expandFromRawCode` expects; ids are `start` lines, which
 * stay stable as long as the base hunks do — so an expanded gap can be named
 * by a number and survive re-renders.
 */
function gapsOf(hunks: readonly HunkData[], oldLineCount: number): readonly Gap[] {
  if (hunks.length === 0) return []
  const gaps: Gap[] = []
  const first = hunks[0]!
  if (first.oldStart > 1) {
    gaps.push({ start: 1, end: first.oldStart, count: first.oldStart - 1 })
  }
  for (let index = 1; index < hunks.length; index += 1) {
    const previous = hunks[index - 1]!
    const next = hunks[index]!
    const start = previous.oldStart + previous.oldLines
    const count = next.oldStart - start
    if (count > 0) gaps.push({ start, end: next.oldStart, count })
  }
  const last = hunks[hunks.length - 1]!
  const trailingStart = last.oldStart + last.oldLines
  const trailingCount = oldLineCount - trailingStart + 1
  if (trailingCount > 0) {
    gaps.push({ start: trailingStart, end: oldLineCount + 1, count: trailingCount })
  }
  return gaps
}

/**
 * The expander bar drawn where a collapsed gap sits — a full-width row, like
 * the diff views in IDEs. Expanding is one-way for the tab's lifetime; the
 * tab is cheap to close and reopen.
 */
function GapBar(props: { gap: Gap; onExpand: (start: number) => void }) {
  const t = useT()
  return (
    <tbody className="diff-gap" key={`gap-${props.gap.start}`}>
      <tr>
        <td colSpan={3}>
          <button
            type="button"
            onClick={() => { props.onExpand(props.gap.start) }}
            style={{
              display: 'block',
              width: '100%',
              padding: '2px 8px',
              border: 'none',
              background: 'transparent',
              color: token.textMuted,
              fontSize: 12,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('explorer.unmodified', { n: props.gap.count })}
          </button>
        </td>
      </tr>
    </tbody>
  )
}

// The sheet is react-diff-view's own, adapted once: the class names are the
// library's contract, the colours are derived from the shell's state tokens
// through color-mix, so the washes hold in both themes without duplicating a
// theme here. `.diff-code` already wraps (pre-wrap) — consistent with the
// editor tab.
//
// The second block is the syntax theme. The editor tab's ReadBlock colours
// code through the host's shiki variable theme (`--shiki-token-keyword` and
// friends, defined on the page by the host); react-diff-view instead renders
// Prism token class names and ships no colours, so without this mapping every
// token inherits the plain text colour. Mapping the Prism classes onto the
// SAME `--shiki-*` variables is what makes a diff and the file viewer agree.
const DIFF_CLASS = 'dsh-ext-diff'
let diffStylesInjected = false
function injectDiffStyles(): void {
  if (diffStylesInjected || typeof document === 'undefined') return
  diffStylesInjected = true
  const style = document.createElement('style')
  style.dataset.dshPlugin = 'dsh-ext'
  style.textContent = `
.${DIFF_CLASS} { border-collapse: collapse; table-layout: fixed; width: 100%; font-size: 13px; color: ${token.text}; }
.${DIFF_CLASS} td { padding: 0; vertical-align: top; }
.${DIFF_CLASS} .diff-line { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; line-height: 1.55; }
.${DIFF_CLASS} .diff-gutter-col { width: 4.5ch; }
.${DIFF_CLASS} .diff-gutter { padding: 0 1ch 0 0.5ch; text-align: right; user-select: none; color: ${token.textMuted}; }
.${DIFF_CLASS} .diff-code { padding: 0 0 0 0.5ch; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; min-width: 0; }
.${DIFF_CLASS} .diff-gutter-insert { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 22%, transparent); }
.${DIFF_CLASS} .diff-gutter-delete { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 22%, transparent); }
.${DIFF_CLASS} .diff-code-insert { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 13%, transparent); }
.${DIFF_CLASS} .diff-code-delete { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 13%, transparent); }
.${DIFF_CLASS} .diff-code-insert .diff-code-edit { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 38%, transparent); }
.${DIFF_CLASS} .diff-code-delete .diff-code-edit { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f25a5a) 38%, transparent); }
.${DIFF_CLASS} .diff-gap td { padding: 0; }
.${DIFF_CLASS} .diff-gap button:hover { color: ${token.text}; background: ${token.hover}; }

/* Prism token classes → the host's shiki variable theme, so a diff's syntax
   colours are literally the same custom properties the file viewer reads.
   Fallbacks mirror the shiki sheet's own dark-theme values, in case the host
   theme has not loaded. */
.${DIFF_CLASS} .token.comment,
.${DIFF_CLASS} .token.prolog,
.${DIFF_CLASS} .token.cdata { color: var(--shiki-token-comment, #6a737d); }
.${DIFF_CLASS} .token.punctuation { color: var(--shiki-token-punctuation, #adb5bd); }
.${DIFF_CLASS} .token.doctype,
.${DIFF_CLASS} .token.deleted { color: var(--shiki-token-deleted, #f25a5a); }
.${DIFF_CLASS} .token.keyword,
.${DIFF_CLASS} .token.module,
.${DIFF_CLASS} .token.selector,
.${DIFF_CLASS} .token.important,
.${DIFF_CLASS} .token.atrule { color: var(--shiki-token-keyword, #faa2c1); }
.${DIFF_CLASS} .token.string,
.${DIFF_CLASS} .token.char,
.${DIFF_CLASS} .token.attr-value,
.${DIFF_CLASS} .token.regex { color: var(--shiki-token-string, #8ce99a); }
.${DIFF_CLASS} .token.number,
.${DIFF_CLASS} .token.boolean,
.${DIFF_CLASS} .token.constant,
.${DIFF_CLASS} .token.symbol { color: var(--shiki-token-constant, #ffab70); }
.${DIFF_CLASS} .token.function,
.${DIFF_CLASS} .token.function-variable,
.${DIFF_CLASS} .token.class-name { color: var(--shiki-token-function, #74c0fc); }
.${DIFF_CLASS} .token.property,
.${DIFF_CLASS} .token.attr-name,
.${DIFF_CLASS} .token.tag,
.${DIFF_CLASS} .token.builtin,
.${DIFF_CLASS} .token.variable { color: var(--shiki-token-constant, #ffab70); }
.${DIFF_CLASS} .token.operator,
.${DIFF_CLASS} .token.entity,
.${DIFF_CLASS} .token.url { color: var(--shiki-foreground, #f9fafb); }
`
  document.head.appendChild(style)
}

/**
 * The shared code surface used by both ordinary file previews and git review.
 * A plain file is represented as one all-normal hunk; review uses real
 * insert/delete hunks. Both therefore share the exact same table, gutter,
 * wrapping, refractor tokenizer, Prism→shiki theme mapping, and font metrics.
 */
export function CodeView(props: { path: string; content: string }) {
  injectDiffStyles()
  const language = grammarFor(props.path)
  const lines = useMemo(() => {
    if (props.content.length === 0) return []
    const split = props.content.split('\n')
    if (split[split.length - 1] === '') split.pop()
    return split
  }, [props.content])
  const hunks = useMemo(() => {
    const hunk = textLinesToHunk(lines, 1, 1)
    return safeHunks(hunk === null ? [] : [hunk])
  }, [lines])
  const tokens = useMemo(() => {
    if (language === undefined || hunks.length === 0) return null
    try {
      return tokenize(hunks, {
        oldSource: props.content,
        highlight: true,
        refractor: diffRefractor,
        language,
      })
    } catch {
      return null
    }
  }, [hunks, language, props.content])

  if (hunks.length === 0) return null
  return (
    <div style={{ overflow: 'auto', minWidth: 0 }}>
      <Diff
        className={DIFF_CLASS}
        viewType="unified"
        diffType="modify"
        hunks={hunks}
        tokens={tokens}
      >
        {(rendered: readonly HunkData[]) => rendered.map((hunk, index) => (
          <Hunk key={`plain-${hunk.oldStart}-${index}`} hunk={hunk} />
        ))}
      </Diff>
    </div>
  )
}

/**
 * @param path - workspace-relative path of the reviewed file.
 * @param scope - serialized `workspace`/`session` query parameters.
 */
export function DiffView(props: { path: string; scope: string }) {
  const t = useT()
  injectDiffStyles()
  const review = useResource<ReviewDiff>(
    `/explorer/review?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? '' : `&${props.scope}`}`,
  )

  const data = review.data
  const language = grammarFor(props.path)

  // The whole-file patch, generated here so a new file (no git revision yet)
  // is one whole addition and a deleted file one whole removal. jsdiff
  // separates its file header from the hunks with a `===` banner line that
  // git patches never carry — `parseDiff` reads such a line as content outside
  // any hunk and crashes, taking the whole panel down with it — so the banner
  // is stripped before parsing.
  const patch = useMemo(() => {
    if (data === undefined) return undefined
    const raw = createTwoFilesPatch(
      `a/${props.path}`, `b/${props.path}`,
      data.oldText ?? '', data.newText,
      '', '', { context: PATCH_CONTEXT },
    )
    return raw.split('\n').filter(line => !line.startsWith('===')).join('\n')
  }, [data, props.path])

  const parsedFile = useMemo(() => {
    if (patch === undefined) return undefined
    try {
      return parseDiff(patch)[0]
    } catch {
      // A patch this parser cannot read degrades to the no-diff notice; it
      // must never become a render crash inside the panel's slot.
      return undefined
    }
  }, [patch])
  const baseHunks = parsedFile?.hunks ?? []

  const oldSource = data?.oldText ?? null
  const oldLineCount = useMemo(() => (oldSource ?? '').split('\n').length, [oldSource])

  // Gaps the user has unfolded, named by their first old-side line — stable
  // across renders because the base hunks they were measured against never
  // change within a tab.
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set())
  const onExpand = useMemo(() => (start: number) => {
    setExpanded(previous => new Set(previous).add(start))
  }, [])

  const hunks = useMemo(() => {
    if (oldSource === null) return safeHunks(baseHunks)
    // Short gaps render in full; only the long ones stay behind bars.
    try {
      let result = expandCollapsedBlockBy(baseHunks, oldSource, lines => lines < MIN_GAP_LINES)
      for (const gap of gapsOf(baseHunks, oldLineCount)) {
        if (gap.count >= MIN_GAP_LINES && expanded.has(gap.start)) {
          result = expandFromRawCode(result, oldSource, gap.start, gap.end)
        }
      }
      // `expandCollapsedBlockBy`/`expandFromRawCode` can hand back a hunk slot
      // the caller did not fill (react-diff-view 3 keeps a parallel index whose
      // length can drift from the hunks it wrote), and can even throw when a
      // hunk it builds is incomplete. Passing an `undefined` hunk to `Hunk`
      // reads `hunk.oldStart` and crashes the whole view. Guard both ways: drop
      // the empty slots, and on a throw fall back to the base hunks rather than
      // let the panel die.
      return safeHunks(result)
    } catch {
      return safeHunks(baseHunks)
    }
  }, [baseHunks, oldSource, oldLineCount, expanded])

  const tokens = useMemo(() => {
    if (language === undefined || hunks.length === 0) return null
    try {
      return tokenize(hunks, {
        oldSource: oldSource ?? undefined,
        highlight: true,
        refractor: diffRefractor,
        language,
        enhancers: oldSource === null ? [] : [markEdits(hunks, { type: 'line' })],
      })
    } catch {
      // A grammar hiccup must not take the diff down; plain rows still show it.
      return null
    }
  }, [hunks, oldSource, language])

  if (review.error !== undefined) {
    return <Notice kind="error">{t('explorer.viewFailed', { message: review.error })}</Notice>
  }
  if (data === undefined) {
    return <div style={{ fontSize: 13, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('common.loading')}</div>
  }

  if (data.isImage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            minWidth: 0,
            background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08)))',
            border: `1px solid ${token.border}`,
            borderRadius: 6,
            padding: '5px 9px',
            margin: '0 0 5px',
          }}
        >
          <span
            title={props.path}
            style={{ fontSize: 13, fontWeight: 500, color: token.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >{props.path}</span>
          <span style={{ fontSize: 12, color: token.accent }}>图片已变更</span>
        </div>
        {data.newImageUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${token.border}`,
                backgroundImage: 'linear-gradient(45deg, rgba(125, 125, 125, 0.12) 25%, transparent 25%), linear-gradient(-45deg, rgba(125, 125, 125, 0.12) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(125, 125, 125, 0.12) 75%), linear-gradient(-45deg, transparent 75%, rgba(125, 125, 125, 0.12) 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: 'var(--dsw-alias-bg-base, rgba(0, 0, 0, 0.04))',
              }}
            >
              <img
                src={data.newImageUrl}
                alt={props.path}
                style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (data.isBinary) {
    return (
      <div style={{ fontSize: 13, color: token.textMuted, padding: '32px 16px', textAlign: 'center' }}>
        该文件为二进制文件，已检测到版本变更，但无法生成逐行文本差异。
      </div>
    )
  }

  const changedRows = hunks.reduce(
    (total, hunk) => total + hunk.changes.filter((change: ChangeData) => change.type !== 'normal').length,
    0,
  )
  if (changedRows === 0) {
    return <div style={{ fontSize: 13, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('explorer.noDiff')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          minWidth: 0,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: 'var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08)))',
          border: `1px solid ${token.border}`,
          borderRadius: 6,
          padding: '5px 9px',
          margin: '0 0 5px',
        }}
      >
        <span
          title={props.path}
          style={{ fontSize: 13, fontWeight: 500, color: token.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >{props.path}</span>
        {data.added !== undefined && <span style={countAddedStyle}>+{data.added}</span>}
        {data.removed !== undefined && <span style={countRemovedStyle}>-{data.removed}</span>}
      </div>
      <div style={{ overflow: 'auto', minWidth: 0 }}>
        <Diff
          className={DIFF_CLASS}
          viewType="unified"
          diffType={parsedFile?.type ?? 'modify'}
          hunks={hunks}
          tokens={tokens}
        >
          {(rendered: readonly HunkData[]) => {
            const rows: ReactElement[] = []
            const currentGaps = gapsOf(rendered, oldLineCount)
            for (let index = 0; index < rendered.length; index += 1) {
              const hunk = rendered[index]!
              const gapBefore = currentGaps.find(gap => gap.end === hunk.oldStart && gap.count >= MIN_GAP_LINES)
              if (index === 0 && gapBefore !== undefined) {
                rows.push(<GapBar key={`gap-${gapBefore.start}`} gap={gapBefore} onExpand={onExpand} />)
              } else if (index > 0) {
                const previous = rendered[index - 1]!
                const start = previous.oldStart + previous.oldLines
                const gap = currentGaps.find(candidate => candidate.start === start && candidate.count >= MIN_GAP_LINES)
                if (gap !== undefined) rows.push(<GapBar key={`gap-${gap.start}`} gap={gap} onExpand={onExpand} />)
              }
              rows.push(<Hunk key={`hunk-${hunk.oldStart}-${index}`} hunk={hunk} />)
            }
            const last = rendered[rendered.length - 1]
            if (last !== undefined) {
              const trailingStart = last.oldStart + last.oldLines
              const gap = currentGaps.find(candidate => candidate.start === trailingStart && candidate.count >= MIN_GAP_LINES)
              if (gap !== undefined) rows.push(<GapBar key={`gap-${gap.start}`} gap={gap} onExpand={onExpand} />)
            }
            return rows
          }}
        </Diff>
      </div>
    </div>
  )
}
