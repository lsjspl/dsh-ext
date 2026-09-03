import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { INDENT, Notice, buttonStyle, rowStyle, token } from './ui.tsx'
import { useT, type Translate } from './use-locale.ts'
import { FileIcon, FolderIcon } from './file-icons.tsx'
import { FilesIcon, ChevronIcon } from './icons.tsx'
import type { ChangeEntry, ExplorerStatus } from '../shared/api-contract.ts'

/**
 * The review tab: the working tree's changed files, filterable by which side
 * of git they changed on, and viewable flat or grouped by folder.
 *
 * Clicking a row opens a diff tab — the same click-opens-a-tab contract as the
 * file browser — rather than rendering the patch inline. Inline patches died
 * with the single-column layout: they pushed the list around, only one could
 * exist, and there was no way back to the file you were reading before.
 */

/** Line-count badges, in git's own colours — additions green, removals red. */
export const countAddedStyle = {
  fontSize: 12,
  color: token.success,
  fontFamily: 'ui-monospace, monospace',
  flex: '0 0 auto',
} as const

export const countRemovedStyle = {
  fontSize: 12,
  color: token.danger,
  fontFamily: 'ui-monospace, monospace',
  flex: '0 0 auto',
} as const

/** The last path segment — what a grouped row is labelled with. */
function baseOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/** Porcelain letters, said in words. */
function describeChange(change: ChangeEntry, t: Translate): string {
  if (change.untracked) return t('change.untracked')
  const letter = change.staged ? change.index : change.worktree
  switch (letter) {
    case 'M': return t(change.staged ? 'change.modifiedStaged' : 'change.modified')
    case 'A': return t('change.added')
    case 'D': return t('change.deleted')
    case 'R': return t('change.renamed')
    case 'C': return t('change.copied')
    case 'U': return t('change.conflicted')
    case 'T': return t('change.typeChanged')
    default: return t(change.staged ? 'change.staged' : 'change.changed')
  }
}

/** Which side of git a review row's figures are drawn from. */
type ReviewFilter = 'all' | 'staged' | 'unstaged'

const FILTERS: readonly ReviewFilter[] = ['all', 'staged', 'unstaged']

function filterKey(filter: ReviewFilter): 'explorer.filterAll' | 'explorer.filterStaged' | 'explorer.filterUnstaged' {
  return filter === 'all' ? 'explorer.filterAll' : filter === 'staged' ? 'explorer.filterStaged' : 'explorer.filterUnstaged'
}

/** The figure a row shows, by filter: total versus HEAD, or that side's delta. */
function countsFor(change: ChangeEntry, filter: ReviewFilter): { added: number; removed: number } | undefined {
  if (filter === 'staged') {
    return change.stagedAdded !== undefined ? { added: change.stagedAdded, removed: change.stagedRemoved ?? 0 } : undefined
  }
  if (filter === 'unstaged') {
    return change.worktreeAdded !== undefined ? { added: change.worktreeAdded, removed: change.worktreeRemoved ?? 0 } : undefined
  }
  return change.added !== undefined ? { added: change.added, removed: change.removed ?? 0 } : undefined
}

const treeStyle = { listStyle: 'none', margin: 0, padding: 0 } as const

/**
 * Persisted review-view preferences.
 *
 * The view is remounted by the panel whenever its tab set re-registers, so
 * component-local `useState` would reset the user's "group by folder" and
 * "which side" choices on every tab switch. These are reading preferences, not
 * transient state — a user who flips to Flat keeps Flat. They are written to
 * localStorage and initialised from it, the same pattern the model menu's
 * collapse groups use.
 */
const VIEW_PREFS_KEY = 'dsh-ext:review-view-prefs'

interface ViewPrefs {
  readonly grouped: boolean
  readonly filter: ReviewFilter
}

function readViewPrefs(): ViewPrefs {
  try {
    const raw = window.localStorage.getItem(VIEW_PREFS_KEY)
    if (raw === null) return { grouped: false, filter: 'all' }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { grouped: false, filter: 'all' }
    const grouped = (parsed as { grouped?: unknown }).grouped === true
    const filter = (parsed as { filter?: unknown }).filter
    const validFilter = filter === 'all' || filter === 'staged' || filter === 'unstaged'
    return { grouped, filter: validFilter ? filter : 'all' }
  } catch {
    return { grouped: false, filter: 'all' }
  }
}

function writeViewPrefs(prefs: ViewPrefs): void {
  try {
    window.localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs))
  } catch { /* a browser refusing storage still gets working prefs, just not sticky */ }
}

/** One row, in the file tree's anatomy: porcelain letters, icon, name, counts, kind. */
function ReviewRow(props: {
  change: ChangeEntry
  label: string
  depth: number
  counts: { added: number; removed: number } | undefined
  onOpenDiff: (path: string) => void
}) {
  const t = useT()
  const { change, counts } = props
  return (
    <li>
      <button
        type="button"
        onClick={() => { props.onOpenDiff(change.path) }}
        title={t('explorer.preview')}
        style={{ ...rowStyle, paddingLeft: 4 + props.depth * INDENT }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            color: change.untracked ? token.textMuted : token.accent,
            flex: '0 0 auto',
          }}
        >
          {change.index}{change.worktree}
        </span>
        <FileIcon size={16} name={baseOf(change.path)} />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {change.from !== undefined && (
            <span style={{ color: token.textMuted }}>{change.from} → </span>
          )}
          {props.label}
        </span>
        {counts?.added !== undefined && <span style={countAddedStyle}>+{counts.added}</span>}
        {counts?.removed !== undefined && <span style={countRemovedStyle}>-{counts.removed}</span>}
        <span style={{ fontSize: 12, color: token.textMuted, flex: '0 0 auto' }}>
          {describeChange(change, t)}
        </span>
      </button>
    </li>
  )
}

/** A directory in the grouped view: only folders that contain changed files exist. */
interface FolderNode {
  readonly name: string
  readonly path: string
  readonly dirs: FolderNode[]
  readonly files: ChangeEntry[]
}

function buildTree(changes: readonly ChangeEntry[]): FolderNode {
  const root: FolderNode = { name: '', path: '', dirs: [], files: [] }
  const index = new Map<string, FolderNode>([['', root]])
  for (const change of changes) {
    const segments = change.path.split('/')
    segments.pop()
    let current = root
    let accumulated = ''
    for (const segment of segments) {
      accumulated = accumulated.length === 0 ? segment : `${accumulated}/${segment}`
      let next = index.get(accumulated)
      if (next === undefined) {
        next = { name: segment, path: accumulated, dirs: [], files: [] }
        index.set(accumulated, next)
        current.dirs.push(next)
      }
      current = next
    }
    current.files.push(change)
  }
  return root
}

/** Lines changed beneath a folder, summed from whatever rows would show. */
function sumCounts(
  node: FolderNode,
  countsFor: (change: ChangeEntry) => { added: number; removed: number } | undefined,
): { added: number; removed: number } | undefined {
  let added: number | undefined
  let removed: number | undefined
  const add = (counts: { added: number; removed: number } | undefined) => {
    if (counts === undefined) return
    added = (added ?? 0) + counts.added
    removed = (removed ?? 0) + counts.removed
  }
  for (const file of node.files) add(countsFor(file))
  for (const dir of node.dirs) {
    const nested = sumCounts(dir, countsFor)
    if (nested !== undefined) add(nested)
  }
  return added === undefined ? undefined : { added, removed: removed ?? 0 }
}

function FolderRow(props: {
  node: FolderNode
  depth: number
  collapsed: ReadonlySet<string>
  onToggle: (path: string) => void
  countsFor: (change: ChangeEntry) => { added: number; removed: number } | undefined
}) {
  const { node, depth } = props
  const open = !props.collapsed.has(node.path)
  const counts = sumCounts(node, props.countsFor)
  return (
    <li>
      <button
        type="button"
        onClick={() => { props.onToggle(node.path) }}
        style={{ ...rowStyle, paddingLeft: 4 + depth * INDENT }}
      >
        <ChevronIcon size={14} open={open} />
        <FolderIcon size={16} open={open} />
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        {counts?.added !== undefined && <span style={countAddedStyle}>+{counts.added}</span>}
        {counts?.removed !== undefined && <span style={countRemovedStyle}>-{counts.removed}</span>}
      </button>
    </li>
  )
}

function FolderNodes(props: {
  node: FolderNode
  depth: number
  collapsed: ReadonlySet<string>
  onToggle: (path: string) => void
  countsFor: (change: ChangeEntry) => { added: number; removed: number } | undefined
  onOpenDiff: (path: string) => void
}) {
  const { node, depth } = props
  const rows: ReactNode[] = []
  const dirs = [...node.dirs].sort((a, b) => a.name.localeCompare(b.name))
  const files = [...node.files].sort((a, b) => baseOf(a.path).localeCompare(baseOf(b.path)))
  for (const dir of dirs) {
    rows.push(<FolderRow key={dir.path} node={dir} depth={depth} collapsed={props.collapsed} onToggle={props.onToggle} countsFor={props.countsFor} />)
    if (!props.collapsed.has(dir.path)) {
      rows.push(
        // The children live in their own list item so the whole subtree keeps
        // the folder's key and collapses with it.
        <li key={`children-${dir.path}`}>
          <ul style={treeStyle}>
            <FolderNodes node={dir} depth={depth + 1} collapsed={props.collapsed} onToggle={props.onToggle} countsFor={props.countsFor} onOpenDiff={props.onOpenDiff} />
          </ul>
        </li>,
      )
    }
  }
  for (const file of files) {
    rows.push(
      <ReviewRow
        key={file.path}
        change={file}
        label={baseOf(file.path)}
        depth={depth}
        counts={props.countsFor(file)}
        onOpenDiff={props.onOpenDiff}
      />,
    )
  }
  return <>{rows}</>
}

/**
 * @param status - the workspace's git status, refreshed by the panel's poll.
 */
export function ReviewView(props: { status: ExplorerStatus; onOpenDiff: (path: string) => void }) {
  const t = useT()
  const [filter, setFilter] = useState<ReviewFilter>(() => readViewPrefs().filter)
  const [grouped, setGrouped] = useState(() => readViewPrefs().grouped)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set())

  // Persist the preferences whenever they move, so a user who flips to Flat or
  // to Staged keeps that view when the panel remounts or another tab is picked.
  useEffect(() => { writeViewPrefs({ grouped, filter }) }, [grouped, filter])

  const { changes } = props.status
  const filtered = useMemo(
    () => changes.filter(change => filter === 'all' || (filter === 'staged' ? change.staged : !change.staged)),
    [changes, filter],
  )
  const sideCounts = useMemo(() => ({
    all: changes.length,
    staged: changes.filter(change => change.staged).length,
    unstaged: changes.filter(change => !change.staged).length,
  }), [changes])

  const tree = useMemo(() => (grouped ? buildTree(filtered) : undefined), [grouped, filtered])
  // The row figures, bound to the active filter so rows and folders agree on
  // which side of git they are reporting.
  const rowCounts = useMemo(() => (change: ChangeEntry) => countsFor(change, filter), [filter])
  const onToggle = useMemo(() => (path: string) => {
    setCollapsed(previous => {
      const next = new Set(previous)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  if (!props.status.isRepository) {
    return <div style={{ fontSize: 14, color: token.textMuted, padding: '8px 0' }}>{t('explorer.noRepo')}</div>
  }
  if (changes.length === 0) {
    return <div style={{ fontSize: 14, color: token.textMuted, padding: '8px 0' }}>{t('explorer.noChanges')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          flexWrap: 'wrap',
          // The panel scrolls the whole view (the file browser and review list
          // share that overflow container), so the filter row would ride away
          // with the list. Sticky keeps it pinned to the top of the panel while
          // the list scrolls underneath. Needs an opaque background so a list
          // row passing under it does not show through the gaps between
          // buttons, and a z-index to sit above those rows.
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: token.surfaceBase,
          padding: '2px 0',
        }}
      >
        {FILTERS.map(name => {
          const active = filter === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => { setFilter(name) }}
              aria-pressed={active}
              style={{
                ...buttonStyle,
                fontSize: 13,
                padding: '4px 12px',
                borderColor: active ? token.accent : token.border,
                color: active ? token.accent : token.text,
              }}
            >
              {t(filterKey(name))} {sideCounts[name]}
            </button>
          )
        })}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          aria-label={grouped ? t('explorer.reviewFlat') : t('explorer.reviewGroup')}
          title={grouped ? t('explorer.reviewFlat') : t('explorer.reviewGroup')}
          onClick={() => { setGrouped(value => !value) }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            padding: 0,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: token.textMuted,
            cursor: 'pointer',
            flex: '0 0 auto',
          }}
        >
          {/* The icon names the view a click SWITCHES to, like every editor's layout toggle. */}
          {grouped ? <FilesIcon size={16} /> : <FolderIcon size={16} open={false} />}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ fontSize: 14, color: token.textMuted, padding: '8px 0' }}>{t('explorer.noChanges')}</div>
      ) : grouped && tree !== undefined ? (
        <ul style={treeStyle}>
          <FolderNodes node={tree} depth={0} collapsed={collapsed} onToggle={onToggle} countsFor={rowCounts} onOpenDiff={props.onOpenDiff} />
        </ul>
      ) : (
        <ul style={treeStyle}>
          {filtered.map(change => (
            <ReviewRow
              key={`${change.index}${change.worktree} ${change.path}`}
              change={change}
              label={change.path}
              depth={0}
              counts={rowCounts(change)}
              onOpenDiff={props.onOpenDiff}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
