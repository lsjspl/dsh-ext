import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { Notice, buttonStyle, rowStyle, token } from './ui.tsx'
import { useT, type Translate } from './use-locale.ts'
import { FileIcon, FolderIcon } from './file-icons.tsx'
import { ChevronIcon, ListFlatIcon, ListTreeIcon, UndoIcon } from './icons.tsx'
import { callApi } from './api.ts'
import type {
  ChangeEntry,
  ExplorerStatus,
  GitCommitResult,
  GitPushResult,
  GenerateCommitResult,
} from '../shared/api-contract.ts'

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

/** The figure a row shows: staged delta or unstaged delta. */
function countsFor(change: ChangeEntry, side: 'staged' | 'unstaged'): { added: number; removed: number } | undefined {
  if (side === 'staged') {
    if (change.stagedAdded !== undefined) {
      return { added: change.stagedAdded, removed: change.stagedRemoved ?? 0 }
    }
    if (change.staged && change.added !== undefined) {
      return { added: change.added, removed: change.removed ?? 0 }
    }
    return undefined
  }
  if (side === 'unstaged') {
    if (change.worktreeAdded !== undefined) {
      return { added: change.worktreeAdded, removed: change.worktreeRemoved ?? 0 }
    }
    if (!change.staged && change.added !== undefined) {
      return { added: change.added, removed: change.removed ?? 0 }
    }
    return undefined
  }
  return undefined
}

const treeStyle = { listStyle: 'none', margin: 0, padding: 0 } as const

/** One indent step for in-place tree expansion, matching VS Code's 16px hierarchy. */
const TREE_INDENT = 16

/**
 * Persisted review-view preferences.
 */
const VIEW_PREFS_KEY = 'dsh-ext:review-view-prefs'

interface ViewPrefs {
  readonly grouped: boolean
  readonly openStaged?: boolean
  readonly openUnstaged?: boolean
}

function readViewPrefs(): ViewPrefs {
  try {
    const raw = window.localStorage.getItem(VIEW_PREFS_KEY)
    if (raw === null) return { grouped: false, openStaged: true, openUnstaged: true }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { grouped: false, openStaged: true, openUnstaged: true }
    const grouped = (parsed as { grouped?: unknown }).grouped === true
    const openStaged = (parsed as { openStaged?: unknown }).openStaged !== false
    const openUnstaged = (parsed as { openUnstaged?: unknown }).openUnstaged !== false
    return { grouped, openStaged, openUnstaged }
  } catch {
    return { grouped: false, openStaged: true, openUnstaged: true }
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
  onStage?: (path: string | string[], stage: boolean) => void
  onDiscard?: (path: string) => void
  stageBusy?: boolean
}) {
  const t = useT()
  const [hovered, setHovered] = useState(false)
  const { change, counts } = props
  const statusLetter = change.staged
    ? (change.index !== ' ' ? change.index : 'M')
    : (change.untracked ? 'U' : (change.worktree !== ' ' ? change.worktree : 'M'))
  const statusColor = change.untracked
    ? token.accent
    : statusLetter === 'A'
      ? token.success
      : statusLetter === 'D'
        ? token.danger
        : statusLetter === 'M'
          ? token.warn
          : token.accent

  return (
    <li
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <button
          type="button"
          onClick={() => { props.onOpenDiff(change.path) }}
          title={`${change.path} (${describeChange(change, t)})`}
          style={{ ...rowStyle, paddingLeft: 8 + props.depth * TREE_INDENT, flex: 1, minWidth: 0 }}
        >
          <FileIcon size={16} name={baseOf(change.path)} />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, color: token.text }}>
            {change.from !== undefined && (
              <span style={{ color: token.textMuted }}>{change.from} → </span>
            )}
            {props.label}
          </span>
          {counts?.added !== undefined && <span style={countAddedStyle}>+{counts.added}</span>}
          {counts?.removed !== undefined && <span style={countRemovedStyle}>-{counts.removed}</span>}
          <span
            aria-hidden="true"
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              fontWeight: 600,
              color: statusColor,
              width: 18,
              textAlign: 'center',
              flex: '0 0 auto',
              marginLeft: 4,
            }}
          >
            {statusLetter}
          </span>
        </button>

        <div
          style={{
            display: hovered ? 'inline-flex' : 'none',
            alignItems: 'center',
            gap: 2,
            marginRight: 6,
            flex: '0 0 auto',
          }}
        >
          {!change.staged && props.onDiscard && (
            <button
              type="button"
              aria-label={t('git.discardChange')}
              title={t('git.discardChange')}
              disabled={props.stageBusy}
              onClick={(e) => {
                e.stopPropagation()
                props.onDiscard?.(change.path)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: token.text,
                cursor: props.stageBusy ? 'not-allowed' : 'pointer',
                opacity: props.stageBusy ? 0.4 : 0.85,
                transition: 'all 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!props.stageBusy) {
                  e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.2))'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = props.stageBusy ? '0.4' : '0.85'
              }}
            >
              <UndoIcon size={12} />
            </button>
          )}

          {props.onStage && (
            <button
              type="button"
              aria-label={change.staged ? t('git.unstageFile') : t('git.stageFile')}
              title={change.staged ? t('git.unstageFile') : t('git.stageFile')}
              disabled={props.stageBusy}
              onClick={(e) => {
                e.stopPropagation()
                props.onStage?.(change.path, !change.staged)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: token.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: props.stageBusy ? 'not-allowed' : 'pointer',
                opacity: props.stageBusy ? 0.4 : 0.85,
                transition: 'all 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!props.stageBusy) {
                  e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.2))'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = props.stageBusy ? '0.4' : '0.85'
              }}
            >
              {change.staged ? '−' : '+'}
            </button>
          )}
        </div>
      </div>
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

/** Collect all changed files recursively contained within a folder node */
function allFilesInFolder(node: FolderNode): ChangeEntry[] {
  const result: ChangeEntry[] = [...node.files]
  for (const dir of node.dirs) {
    result.push(...allFilesInFolder(dir))
  }
  return result
}

function FolderRow(props: {
  node: FolderNode
  depth: number
  collapsed: ReadonlySet<string>
  onToggle: (path: string) => void
  countsFor: (change: ChangeEntry) => { added: number; removed: number } | undefined
  onStage?: (paths: string | string[], stage: boolean) => void
  onDiscard?: (node: FolderNode) => void
  stageBusy?: boolean
}) {
  const { node, depth } = props
  const [hovered, setHovered] = useState(false)
  const t = useT()
  const open = !props.collapsed.has(node.path)
  const counts = sumCounts(node, props.countsFor)
  const files = useMemo(() => allFilesInFolder(node), [node])
  const allStaged = files.length > 0 && files.every(f => f.staged)

  return (
    <li
      style={{ position: 'relative' }}
      onMouseEnter={() => { setHovered(true) }}
      onMouseLeave={() => { setHovered(false) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <button
          type="button"
          onClick={() => { props.onToggle(node.path) }}
          style={{ ...rowStyle, paddingLeft: 8 + depth * TREE_INDENT, flex: 1, minWidth: 0 }}
        >
          <ChevronIcon size={13} open={open} />
          <FolderIcon size={16} open={open} />
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, color: token.text }}>{node.name}</span>
          {counts?.added !== undefined && <span style={countAddedStyle}>+{counts.added}</span>}
          {counts?.removed !== undefined && <span style={countRemovedStyle}>-{counts.removed}</span>}
        </button>

        <div
          style={{
            display: hovered ? 'inline-flex' : 'none',
            alignItems: 'center',
            gap: 2,
            marginRight: 6,
            flex: '0 0 auto',
          }}
        >
          {!allStaged && props.onDiscard && files.length > 0 && (
            <button
              type="button"
              aria-label={t('git.discardFolder')}
              title={t('git.discardFolder')}
              disabled={props.stageBusy}
              onClick={(e) => {
                e.stopPropagation()
                props.onDiscard?.(node)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: token.text,
                cursor: props.stageBusy ? 'not-allowed' : 'pointer',
                opacity: props.stageBusy ? 0.4 : 0.85,
                transition: 'all 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!props.stageBusy) {
                  e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.2))'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = props.stageBusy ? '0.4' : '0.85'
              }}
            >
              <UndoIcon size={12} />
            </button>
          )}

          {props.onStage && files.length > 0 && (
            <button
              type="button"
              aria-label={allStaged ? t('git.unstageFolder') : t('git.stageFolder')}
              title={allStaged ? t('git.unstageFolder') : t('git.stageFolder')}
              disabled={props.stageBusy}
              onClick={(e) => {
                e.stopPropagation()
                const filePaths = files.map(f => f.path)
                props.onStage?.(filePaths.length > 0 ? filePaths : [node.path], !allStaged)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: token.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: props.stageBusy ? 'not-allowed' : 'pointer',
                opacity: props.stageBusy ? 0.4 : 0.85,
                transition: 'all 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!props.stageBusy) {
                  e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.2))'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = props.stageBusy ? '0.4' : '0.85'
              }}
            >
              {allStaged ? '−' : '+'}
            </button>
          )}
        </div>
      </div>
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
  onStage?: (paths: string | string[], stage: boolean) => void
  onDiscardFolder?: (node: FolderNode) => void
  onDiscardFile?: (path: string) => void
  stageBusy?: boolean
}) {
  const { node, depth } = props
  const rows: ReactNode[] = []
  const dirs = [...node.dirs].sort((a, b) => a.name.localeCompare(b.name))
  const files = [...node.files].sort((a, b) => baseOf(a.path).localeCompare(baseOf(b.path)))
  for (const dir of dirs) {
    rows.push(
      <FolderRow
        key={dir.path}
        node={dir}
        depth={depth}
        collapsed={props.collapsed}
        onToggle={props.onToggle}
        countsFor={props.countsFor}
        onStage={props.onStage}
        onDiscard={props.onDiscardFolder}
        stageBusy={props.stageBusy}
      />,
    )
    if (!props.collapsed.has(dir.path)) {
      rows.push(
        // The children live in their own list item so the whole subtree keeps
        // the folder's key and collapses with it.
        <li key={`children-${dir.path}`}>
          <ul style={treeStyle}>
            <FolderNodes
              node={dir}
              depth={depth + 1}
              collapsed={props.collapsed}
              onToggle={props.onToggle}
              countsFor={props.countsFor}
              onOpenDiff={props.onOpenDiff}
              onStage={props.onStage}
              onDiscardFolder={props.onDiscardFolder}
              onDiscardFile={props.onDiscardFile}
              stageBusy={props.stageBusy}
            />
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
        onStage={props.onStage}
        onDiscard={props.onDiscardFile}
        stageBusy={props.stageBusy}
      />,
    )
  }
  return <>{rows}</>
}

function CommitBox(props: {
  workspace?: string
  session?: string
  stagedCount: number
  unstagedCount: number
  ahead?: number
  onReload?: () => void
  grouped?: boolean
  onToggleGrouped?: () => void
}) {
  const t = useT()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [statusNotice, setStatusNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setStatusNotice(null)
    try {
      // Find active model and provider from composer if rendered
      const modelPickerEl = document.querySelector('[data-dsh-part="model-picker"]')
      const activeProvider = modelPickerEl?.getAttribute('data-provider') || undefined
      const activeModel = modelPickerEl?.getAttribute('data-model') || undefined

      const res = await callApi<GenerateCommitResult>('/explorer/git/generate-commit', {
        body: {
          workspace: props.workspace,
          session: props.session,
          provider: activeProvider,
          model: activeModel,
        },
      })
      if (res.ok && res.value?.ok && res.value?.fullMessage) {
        setMessage(res.value.fullMessage)
      } else {
        const errText = !res.ok
          ? res.message
          : (res.value?.error || t('git.generateFailed', { message: '返回内容为空' }))
        setStatusNotice({ kind: 'error', text: errText })
      }
    } catch (err: unknown) {
      setStatusNotice({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setGenerating(false)
    }
  }

  const handleCommit = async (andPush = false) => {
    const trimmed = message.trim()
    if (!trimmed) return
    setBusy(true)
    setStatusNotice(null)
    try {
      const res = await callApi<GitCommitResult>('/explorer/git/commit', {
        body: {
          workspace: props.workspace,
          session: props.session,
          message: trimmed,
          autoStage: true,
        },
      })
      if (res.ok) {
        setMessage('')
        const hash = res.value.commitHash || ''
        setStatusNotice({ kind: 'info', text: t('git.committed', { hash }) })
        props.onReload?.()

        if (andPush) {
          const pushRes = await callApi<GitPushResult>('/explorer/git/push', {
            body: {
              workspace: props.workspace,
              session: props.session,
            },
          })
          if (pushRes.ok && pushRes.value.ok) {
            setStatusNotice({ kind: 'info', text: `${t('git.committed', { hash })} · ${t('git.pushed')}` })
            props.onReload?.()
          } else {
            const errText = pushRes.ok ? (pushRes.value.message || 'Push rejected') : pushRes.message
            setStatusNotice({ kind: 'error', text: errText })
          }
        }
      } else {
        setStatusNotice({ kind: 'error', text: res.message || t('git.commitFailed', { message: 'Commit failed' }) })
      }
    } catch (err: unknown) {
      setStatusNotice({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setBusy(false)
    }
  }

  const handlePushOnly = async () => {
    setBusy(true)
    setStatusNotice(null)
    try {
      const res = await callApi<GitPushResult>('/explorer/git/push', {
        body: {
          workspace: props.workspace,
          session: props.session,
        },
      })
      if (res.ok && res.value.ok) {
        setStatusNotice({ kind: 'info', text: t('git.pushed') })
        props.onReload?.()
      } else {
        const errText = res.ok ? (res.value.message || 'Push rejected') : res.message
        setStatusNotice({ kind: 'error', text: errText })
      }
    } catch (err: unknown) {
      setStatusNotice({ kind: 'error', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
        border: `1px solid ${token.border}`,
        marginBottom: 6,
      }}
    >
      {/* Top row: Staged summary & Actions (Tree/Flat toggle + AI generate) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ color: props.stagedCount > 0 ? token.success : token.textMuted, fontWeight: props.stagedCount > 0 ? 600 : 400 }}>
            {t('git.stagedCount', { n: props.stagedCount })}
          </span>
          <span style={{ color: token.textMuted }}>·</span>
          <span style={{ color: props.unstagedCount > 0 ? token.warn : token.textMuted }}>
            {t('git.unstagedCount', { n: props.unstagedCount })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {props.onToggleGrouped && (
            <button
              type="button"
              aria-label={props.grouped ? t('explorer.reviewFlat') : t('explorer.reviewGroup')}
              title={props.grouped ? t('explorer.reviewFlat') : t('explorer.reviewGroup')}
              onClick={props.onToggleGrouped}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                padding: 0,
                border: `1px solid ${token.border}`,
                borderRadius: 5,
                background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                color: token.textMuted,
                cursor: 'pointer',
                flex: '0 0 auto',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = token.text; e.currentTarget.style.background = token.hover }}
              onMouseLeave={e => { e.currentTarget.style.color = token.textMuted; e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))' }}
            >
              {props.grouped ? <ListFlatIcon size={14} /> : <ListTreeIcon size={14} />}
            </button>
          )}

          <button
            type="button"
            disabled={generating || busy}
            onClick={handleGenerate}
            title={t('git.aiGenerate')}
            style={{
              ...buttonStyle,
              padding: '3px 9px',
              fontSize: 11.5,
              borderRadius: 5,
              fontWeight: 500,
              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
              color: '#ffffff',
              border: 'none',
              cursor: generating || busy ? 'not-allowed' : 'pointer',
              opacity: generating || busy ? 0.6 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 120ms ease',
            }}
          >
            <span>{generating ? t('git.aiGenerating') : t('git.aiGenerate')}</span>
          </button>
        </div>
      </div>

      {/* Commit message textarea */}
      <textarea
        value={message}
        rows={3}
        disabled={busy}
        placeholder={t('git.commitPlaceholder')}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            void handleCommit(false)
          }
        }}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '6px 8px',
          borderRadius: 6,
          border: `1px solid ${token.border}`,
          background: 'var(--dsw-alias-bg-layer-1, transparent)',
          color: token.text,
          fontSize: 12.5,
          lineHeight: '18px',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* Bottom action row: Commit / Commit & Push / Push */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            disabled={busy || !message.trim()}
            onClick={() => void handleCommit(false)}
            style={{
              ...buttonStyle,
              padding: '4px 12px',
              fontSize: 12,
              borderRadius: 5,
              fontWeight: 500,
              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
              color: '#ffffff',
              border: 'none',
              cursor: busy || !message.trim() ? 'not-allowed' : 'pointer',
              opacity: busy || !message.trim() ? 0.5 : 1,
            }}
          >
            {t('git.commit')}
          </button>
          <button
            type="button"
            disabled={busy || !message.trim()}
            onClick={() => void handleCommit(true)}
            style={{
              ...buttonStyle,
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 5,
              fontWeight: 500,
              background: 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.12))',
              color: token.text,
              border: `1px solid ${token.border}`,
              cursor: busy || !message.trim() ? 'not-allowed' : 'pointer',
              opacity: busy || !message.trim() ? 0.5 : 1,
            }}
          >
            {t('git.commitAndPush')}
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handlePushOnly}
          style={{
            ...buttonStyle,
            padding: '4px 10px',
            fontSize: 12,
            borderRadius: 5,
            fontWeight: 500,
            background: (props.ahead ?? 0) > 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
            color: (props.ahead ?? 0) > 0 ? token.success : token.textMuted,
            border: `1px solid ${(props.ahead ?? 0) > 0 ? 'rgba(34, 197, 94, 0.3)' : token.border}`,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          {(props.ahead ?? 0) > 0 ? t('git.pushCount', { n: props.ahead! }) : t('git.push')}
        </button>
      </div>

      {statusNotice && (
        <Notice kind={statusNotice.kind}>
          {statusNotice.text}
        </Notice>
      )}
    </div>
  )
}

export interface SectionHeaderAction {
  readonly icon: ReactNode
  readonly title: string
  readonly onAction: () => void
  readonly disabled?: boolean
}

function SectionHeader(props: {
  title: string
  count: number
  open: boolean
  onToggle: () => void
  actions?: readonly SectionHeaderAction[]
  actionIcon?: ReactNode
  actionTitle?: string
  onAction?: () => void
  actionDisabled?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const actions: readonly SectionHeaderAction[] = props.actions ?? (
    props.actionIcon && props.onAction
      ? [{ icon: props.actionIcon, title: props.actionTitle ?? '', onAction: props.onAction, disabled: props.actionDisabled }]
      : []
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={props.onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          props.onToggle()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        height: 26,
        userSelect: 'none',
        cursor: 'pointer',
        background: hovered
          ? 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.14))'
          : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.06))',
        borderTop: `1px solid ${token.border}`,
        borderBottom: `1px solid ${token.border}`,
        marginTop: -1,
        transition: 'background 100ms ease',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <ChevronIcon size={12} open={props.open} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: token.text,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            opacity: 0.9,
          }}
        >
          {props.title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 120ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {actions.map((act, i) => (
            <button
              key={i}
              type="button"
              title={act.title}
              aria-label={act.title}
              disabled={act.disabled}
              onClick={(e) => {
                e.stopPropagation()
                act.onAction()
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                padding: 0,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: token.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: act.disabled ? 'not-allowed' : 'pointer',
                opacity: act.disabled ? 0.35 : 0.85,
                transition: 'all 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (!act.disabled) {
                  e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.2))'
                  e.currentTarget.style.opacity = '1'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = act.disabled ? '0.35' : '0.85'
              }}
            >
              {act.icon}
            </button>
          ))}
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '1px 6px',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: props.count > 0
              ? 'var(--dsw-alias-state-business-primary, #2563eb)'
              : 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.16))',
            color: props.count > 0 ? '#ffffff' : token.textMuted,
            textAlign: 'center',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            lineHeight: 1,
          }}
        >
          {props.count}
        </span>
      </div>
    </div>
  )
}

interface DiscardModalState {
  title: string
  message: string
  onConfirm: () => Promise<void>
}

/**
 * @param status - the workspace's git status, refreshed by the panel's poll.
 */
export function ReviewView(props: {
  status: ExplorerStatus
  onOpenDiff: (path: string) => void
  workspaceRoot?: string
  sessionId?: string
  scope?: string
  onReload?: () => void
}) {
  const t = useT()
  const [grouped, setGrouped] = useState(() => readViewPrefs().grouped)
  const [openStaged, setOpenStaged] = useState(() => readViewPrefs().openStaged ?? true)
  const [openUnstaged, setOpenUnstaged] = useState(() => readViewPrefs().openUnstaged ?? true)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set())
  const [stageBusy, setStageBusy] = useState(false)
  const [discardModal, setDiscardModal] = useState<DiscardModalState | null>(null)

  // Persist the preferences whenever they move, so a user keeps their view when the panel remounts
  useEffect(() => {
    writeViewPrefs({ grouped, openStaged, openUnstaged })
  }, [grouped, openStaged, openUnstaged])

  const { changes } = props.status
  const isStaged = (c: ChangeEntry) => c.index !== ' ' && c.index !== '?'
  const isUnstaged = (c: ChangeEntry) => c.worktree !== ' ' || c.untracked

  const stagedChanges = useMemo(() => {
    return changes.filter(isStaged).map(c => ({ ...c, staged: true }))
  }, [changes])

  const unstagedChanges = useMemo(() => {
    return changes.filter(isUnstaged).map(c => ({ ...c, staged: false }))
  }, [changes])

  const sideCounts = useMemo(() => ({
    all: changes.length,
    staged: stagedChanges.length,
    unstaged: unstagedChanges.length,
  }), [changes.length, stagedChanges.length, unstagedChanges.length])

  const handleStageFile = async (filePath: string | string[], stage: boolean) => {
    setStageBusy(true)
    try {
      await callApi('/explorer/git/stage', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          stage,
          paths: Array.isArray(filePath) ? filePath : [filePath],
        },
      })
      props.onReload?.()
    } catch (err) {
      console.warn('Failed to stage file:', err)
    } finally {
      setStageBusy(false)
    }
  }

  const handleStageAll = async (stage: boolean) => {
    setStageBusy(true)
    try {
      await callApi('/explorer/git/stage', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          stage,
          all: true,
        },
      })
      props.onReload?.()
    } catch (err) {
      console.warn('Failed to stage all:', err)
    } finally {
      setStageBusy(false)
    }
  }

  const handleDiscardAll = () => {
    if (sideCounts.unstaged === 0 || stageBusy) return
    setDiscardModal({
      title: t('git.discardAllChanges'),
      message: t('git.confirmDiscardAll', { n: sideCounts.unstaged }),
      onConfirm: async () => {
        setStageBusy(true)
        try {
          await callApi('/explorer/git/discard', {
            body: {
              workspace: props.workspaceRoot,
              session: props.sessionId,
              all: true,
            },
          })
          props.onReload?.()
        } catch (err) {
          console.warn('Failed to discard all changes:', err)
        } finally {
          setStageBusy(false)
        }
      },
    })
  }

  const handleDiscardFile = (filePath: string) => {
    if (stageBusy) return
    setDiscardModal({
      title: `${t('git.discardChange')}: ${baseOf(filePath)}`,
      message: t('git.confirmDiscardFile', { file: baseOf(filePath) }),
      onConfirm: async () => {
        setStageBusy(true)
        try {
          await callApi('/explorer/git/discard', {
            body: {
              workspace: props.workspaceRoot,
              session: props.sessionId,
              paths: [filePath],
            },
          })
          props.onReload?.()
        } catch (err) {
          console.warn('Failed to discard file changes:', err)
        } finally {
          setStageBusy(false)
        }
      },
    })
  }

  const handleDiscardFolder = (node: FolderNode) => {
    if (stageBusy) return
    const unstagedFiles = allFilesInFolder(node).filter(f => !f.staged)
    if (unstagedFiles.length === 0) return
    setDiscardModal({
      title: `${t('git.discardFolder')}: ${node.name}`,
      message: t('git.confirmDiscardFolder', { folder: node.name, n: unstagedFiles.length }),
      onConfirm: async () => {
        setStageBusy(true)
        try {
          await callApi('/explorer/git/discard', {
            body: {
              workspace: props.workspaceRoot,
              session: props.sessionId,
              paths: unstagedFiles.map(f => f.path),
            },
          })
          props.onReload?.()
        } catch (err) {
          console.warn('Failed to discard folder changes:', err)
        } finally {
          setStageBusy(false)
        }
      },
    })
  }

  const stagedTree = useMemo(() => (grouped ? buildTree(stagedChanges) : undefined), [grouped, stagedChanges])
  const unstagedTree = useMemo(() => (grouped ? buildTree(unstagedChanges) : undefined), [grouped, unstagedChanges])

  const stagedRowCounts = useMemo(() => (change: ChangeEntry) => countsFor(change, 'staged'), [])
  const unstagedRowCounts = useMemo(() => (change: ChangeEntry) => countsFor(change, 'unstaged'), [])

  const onToggle = useMemo(() => (path: string) => {
    setCollapsed(previous => {
      const next = new Set(previous)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  if (!props.status.isRepository) {
    return <div style={{ fontSize: 12, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('explorer.noRepo')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* AI Commit and Push box */}
      <CommitBox
        workspace={props.workspaceRoot}
        session={props.sessionId}
        stagedCount={sideCounts.staged}
        unstagedCount={sideCounts.unstaged}
        ahead={props.status.ahead}
        onReload={props.onReload}
        grouped={grouped}
        onToggleGrouped={() => { setGrouped(value => !value) }}
      />

      {changes.length === 0 ? (
        <div style={{ fontSize: 13, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('explorer.noChanges')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Section 1: Staged Changes */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              title={t('git.stagedChanges')}
              count={sideCounts.staged}
              open={openStaged}
              onToggle={() => setOpenStaged(v => !v)}
              actionIcon="−"
              actionTitle={t('git.unstageAllChanges')}
              onAction={() => void handleStageAll(false)}
              actionDisabled={stageBusy || sideCounts.staged === 0}
            />
            {openStaged && (
              sideCounts.staged === 0 ? (
                <div style={{ padding: '6px 12px 6px 24px', fontSize: 12, color: token.textMuted, fontStyle: 'italic' }}>
                  {t('git.noStagedChanges')}
                </div>
              ) : grouped && stagedTree !== undefined ? (
                <ul style={treeStyle}>
                  <FolderNodes
                    node={stagedTree}
                    depth={1}
                    collapsed={collapsed}
                    onToggle={onToggle}
                    countsFor={stagedRowCounts}
                    onOpenDiff={props.onOpenDiff}
                    onStage={handleStageFile}
                    stageBusy={stageBusy}
                  />
                </ul>
              ) : (
                <ul style={treeStyle}>
                  {stagedChanges.map(change => (
                    <ReviewRow
                      key={`staged-${change.index}${change.worktree}-${change.path}`}
                      change={change}
                      label={change.path}
                      depth={1}
                      counts={stagedRowCounts(change)}
                      onOpenDiff={props.onOpenDiff}
                      onStage={handleStageFile}
                      stageBusy={stageBusy}
                    />
                  ))}
                </ul>
              )
            )}
          </div>

          {/* Section 2: Changes */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionHeader
              title={t('git.changes')}
              count={sideCounts.unstaged}
              open={openUnstaged}
              onToggle={() => setOpenUnstaged(v => !v)}
              actions={[
                {
                  icon: <UndoIcon size={13} />,
                  title: t('git.discardAllChanges'),
                  onAction: () => void handleDiscardAll(),
                  disabled: stageBusy || sideCounts.unstaged === 0,
                },
                {
                  icon: '+',
                  title: t('git.stageAllChanges'),
                  onAction: () => void handleStageAll(true),
                  disabled: stageBusy || sideCounts.unstaged === 0,
                },
              ]}
            />
            {openUnstaged && (
              sideCounts.unstaged === 0 ? (
                <div style={{ padding: '6px 12px 6px 24px', fontSize: 12, color: token.textMuted, fontStyle: 'italic' }}>
                  {t('git.noUnstagedChanges')}
                </div>
              ) : grouped && unstagedTree !== undefined ? (
                <ul style={treeStyle}>
                  <FolderNodes
                    node={unstagedTree}
                    depth={1}
                    collapsed={collapsed}
                    onToggle={onToggle}
                    countsFor={unstagedRowCounts}
                    onOpenDiff={props.onOpenDiff}
                    onStage={handleStageFile}
                    onDiscardFolder={handleDiscardFolder}
                    onDiscardFile={handleDiscardFile}
                    stageBusy={stageBusy}
                  />
                </ul>
              ) : (
                <ul style={treeStyle}>
                  {unstagedChanges.map(change => (
                    <ReviewRow
                      key={`unstaged-${change.index}${change.worktree}-${change.path}`}
                      change={change}
                      label={change.path}
                      depth={1}
                      counts={unstagedRowCounts(change)}
                      onOpenDiff={props.onOpenDiff}
                      onStage={handleStageFile}
                      onDiscard={handleDiscardFile}
                      stageBusy={stageBusy}
                    />
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      )}

      {discardModal && (
        <Modal
          title={discardModal.title}
          open
          onClose={() => { if (!stageBusy) setDiscardModal(null) }}
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
              <button
                type="button"
                disabled={stageBusy}
                onClick={() => setDiscardModal(null)}
                style={buttonStyle}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={stageBusy}
                onClick={async () => {
                  try {
                    await discardModal.onConfirm()
                    setDiscardModal(null)
                  } catch (err) {
                    console.warn('Discard failed:', err)
                  }
                }}
                style={{
                  ...buttonStyle,
                  background: 'var(--dsw-alias-state-danger, #ef4444)',
                  color: '#ffffff',
                  borderColor: 'var(--dsw-alias-state-danger, #ef4444)',
                  fontWeight: 500,
                }}
              >
                {stageBusy ? t('common.loading') : (t('git.confirmDiscardAction') || '放弃更改')}
              </button>
            </div>
          )}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0 12px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--dsw-alias-state-danger, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <UndoIcon size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: token.text, lineHeight: '20px' }}>
                {discardModal.message}
              </div>
              <div style={{ fontSize: 12, color: token.textMuted, lineHeight: '18px' }}>
                {t('git.discardIrreversible')}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
