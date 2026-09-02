import { Component, useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { useResource } from './use-resource.ts'
import { INDENT, Notice, rowStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { FileIcon, FolderIcon } from './file-icons.tsx'
import { ChevronIcon, CloseIcon, FilesIcon, GitIcon, PlusIcon, iconButtonStyle } from './icons.tsx'
import { closeTab, openTab, selectTab, useTabs, type Tab } from './tabs.ts'
import { CodeView, DiffView } from './DiffView.tsx'
import { ReviewView } from './ReviewView.tsx'
import type { ExplorerStatus, FileView, TreeEntry } from '../shared/api-contract.ts'

/**
 * Feature 5 — the project explorer: a tabbed panel holding the workspace's file
 * browser, the review list of its uncommitted changes, any file the user opens
 * from the tree, and any changed file opened from the review.
 *
 * The tabs themselves live in `tabs.ts` (a persisted module store) because the
 * panel is remounted by the shell whenever its slot re-registers, and the open
 * set is a preference, not component state. This file only draws: the strip,
 * the four view kinds a tab can hold, and nothing else.
 *
 * Typography follows the host's own scale rather than this file's taste: the
 * panel root renders at 13px (the size the host's own compact surfaces — read
 * cards, search blocks — are set at), secondary text at 12px, and corner notes
 * at 11px. The older draft used 10–12px throughout and read as fine print
 * against everything around it.
 *
 * Read-only by construction. Every endpoint behind it is a git query or a file
 * read, so there is no button here that can change the user's repository — the
 * panel shows state, and the agent or the user's own terminal changes it.
 */

interface TreeResponse {
  readonly workspace: string
  readonly path: string
  readonly entries: readonly TreeEntry[]
}

/**
 * One failed view must cost one tab, not the whole panel.
 *
 * The panel renders inside the host's `shell.overlay` slot, and a throw during
 * a view's render makes the host's own slot-level boundary unmount the entire
 * overlay — the panel vanishes and, to the user, "won't open". This boundary
 * sits under that one and confines the damage to the active view's content.
 */
class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    console.error('[dsh-dev-tool-ext] a side-panel view crashed:', error)
  }
  render() {
    if (this.state.failed) {
      return <div style={{ fontSize: 12, color: token.textMuted, padding: '8px 0' }}>[dsh-dev-tool-ext] view crashed — close this tab and reopen it.</div>
    }
    return this.props.children
  }
}

/** Human-readable size, for the file rows. */
function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** The last path segment — what an editor tab is labelled with. */
function baseOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/** Secondary text: row sizes, meta beside a title. */
const metaStyle = { fontSize: 12, color: token.textMuted } as const

/** Corner notes: truncation and per-list footnotes. */
const noteStyle = { fontSize: 11, color: token.textMuted } as const

const treeStyle = { listStyle: 'none', margin: 0, padding: 0 } as const

/**
 * One row of the tree, and — when a directory row is expanded — its children.
 *
 * Expansion is in place rather than navigational on purpose: a navigation tree
 * loses the parent's context on every click and forces a breadcrumb trail to
 * find the way back, while an expanding tree reads like the file panel in every
 * editor. Each expanded directory fetches only its own listing (`enabled` gates
 * the fetch, so a collapsed row costs nothing), and collapsing does not discard
 * scroll position elsewhere in the panel.
 */
function TreeRow(props: {
  entry: TreeEntry
  depth: number
  scope: string
  expanded: ReadonlySet<string>
  onToggle: (path: string) => void
}) {
  const t = useT()
  const { entry, depth } = props
  const open = entry.kind === 'directory' && props.expanded.has(entry.path)
  const children = useResource<TreeResponse>(
    `/explorer/tree?path=${encodeURIComponent(entry.path)}${props.scope}`,
    open,
  )

  const row = (
    <button
      type="button"
      onClick={() => { entry.kind === 'directory' ? props.onToggle(entry.path) : openTab('editor', entry.path) }}
      title={entry.kind === 'file' ? t('explorer.preview') : undefined}
      style={{ ...rowStyle, paddingLeft: 4 + depth * INDENT }}
    >
      {entry.kind === 'directory'
        ? <ChevronIcon size={12} open={open} />
        : <span aria-hidden="true" style={{ width: 12, flex: '0 0 auto' }} />}
      {entry.kind === 'directory'
        ? <FolderIcon size={15} open={open} />
        : <FileIcon size={15} name={entry.name} />}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</span>
      {entry.kind === 'file' && <span style={metaStyle}>{formatSize(entry.size)}</span>}
    </button>
  )

  if (entry.kind !== 'directory') return <li>{row}</li>

  const notePad = `2px 4px 2px ${4 + (depth + 1) * INDENT}px`
  return (
    <li>
      {row}
      {open && (
        children.error !== undefined
          ? <div style={{ ...noteStyle, padding: notePad }}><Notice kind="error">{children.error}</Notice></div>
          : children.data === undefined
            ? <div style={{ ...noteStyle, padding: notePad }}>{t('common.loading')}</div>
            : (
              <>
                <ul style={treeStyle}>
                  {children.data.entries.map(child => (
                    <TreeRow
                      key={child.path}
                      entry={child}
                      depth={depth + 1}
                      scope={props.scope}
                      expanded={props.expanded}
                      onToggle={props.onToggle}
                    />
                  ))}
                </ul>
                {children.data.entries.some(child => child.truncated === true) && (
                  <div style={{ ...noteStyle, padding: notePad }}>{t('explorer.truncated')}</div>
                )}
              </>
            )
      )}
    </li>
  )
}

/**
 * The files tab: the workspace as an expanding tree.
 *
 * The root listing loads once; every directory below it loads the first time it
 * is expanded, the way an editor's file panel does.
 */
function FilesView(props: { workspace: string | undefined; sessionId: string | undefined }) {
  const t = useT()
  const scope = [
    props.workspace === undefined ? undefined : `&workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === undefined ? undefined : `&session=${encodeURIComponent(props.sessionId)}`,
  ].filter(Boolean).join('')
  const tree = useResource<TreeResponse>(`/explorer/tree?path=${scope}`)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())

  const toggle = useCallback((path: string) => {
    setExpanded(previous => {
      const next = new Set(previous)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  if (tree.error !== undefined) return <Notice kind="error">{tree.error}</Notice>
  if (tree.data === undefined) {
    return <div style={{ fontSize: 13, color: token.textMuted }}>{t('common.loading')}</div>
  }

  return (
    <div>
      <ul style={treeStyle}>
        {tree.data.entries.map(entry => (
          <TreeRow
            key={entry.path}
            entry={entry}
            depth={0}
            scope={scope}
            expanded={expanded}
            onToggle={toggle}
          />
        ))}
      </ul>
      {tree.data.entries.some(entry => entry.truncated === true) && (
        <div style={{ ...noteStyle, padding: `2px 4px 2px ${4 + INDENT}px` }}>{t('explorer.truncated')}</div>
      )}
    </div>
  )
}

/**
 * The editor tab: one file's content, read-only.
 *
 * It uses the same `CodeView` as review: one react-diff-view table, one
 * refractor tokenizer, one Prism→shiki colour mapping, and the same gutter and
 * wrapping rules. Review only adds insert/delete hunks and git backgrounds.
 */
function EditorView(props: { path: string; scope: string }) {
  const t = useT()
  const file = useResource<FileView>(
    `/explorer/file?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? '' : `&${props.scope}`}`,
  )

  if (file.error !== undefined) {
    return <Notice kind="error">{t('explorer.viewFailed', { message: file.error })}</Notice>
  }
  if (file.data === undefined) {
    return <div style={{ fontSize: 13, color: token.textMuted }}>{t('common.loading')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          title={props.path}
          style={{ fontSize: 12, color: token.textMuted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >{props.path}</span>
        <span style={noteStyle}>{formatSize(file.data.bytes)}</span>
      </div>
      <CodeView path={props.path} content={file.data.content} />
      {file.data.truncated && (
        <div style={noteStyle}>{t('explorer.truncatedFile', { lines: file.data.content.split('\n').length })}</div>
      )}
    </div>
  )
}

/**
 * The tab strip: one tab per open view, a close X on each, and a `+` launcher
 * offering the two workspace-wide views. Editor tabs are not on the `+` menu —
 * they exist per file and are opened from the tree, the way an editor does it.
 */
function TabStrip(props: { tabs: readonly Tab[]; activeId: string }) {
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      role="tablist"
      style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, minWidth: 0, overflow: 'hidden' }}
    >
      {props.tabs.map(tab => {
        const active = tab.id === props.activeId
        const label = tab.kind === 'editor' || tab.kind === 'diff'
          ? baseOf(tab.path ?? '')
          : tab.kind === 'files' ? t('explorer.files') : t('explorer.changes')
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            title={tab.kind === 'editor' || tab.kind === 'diff' ? tab.path : undefined}
            onClick={() => { selectTab(tab.id) }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                selectTab(tab.id)
                event.preventDefault()
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              maxWidth: '38%',
              padding: '5px 6px 5px 9px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              userSelect: 'none',
              color: active ? token.text : token.textMuted,
              background: active ? token.hover : 'transparent',
              border: `1px solid ${active ? token.border : 'transparent'}`,
              flex: '0 1 auto',
              minWidth: 0,
            }}
          >
            {tab.kind === 'files' && <FilesIcon size={14} />}
            {(tab.kind === 'review' || tab.kind === 'diff') && <GitIcon size={14} />}
            {tab.kind === 'editor' && <FileIcon size={14} name={baseOf(tab.path ?? '')} />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            <button
              type="button"
              aria-label={`${t('explorer.closeTab')}: ${label}`}
              onClick={(event) => {
                event.stopPropagation()
                closeTab(tab.id)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                color: 'inherit',
                opacity: 0.6,
                cursor: 'pointer',
                flex: '0 0 auto',
              }}
            >
              <CloseIcon size={11} />
            </button>
          </div>
        )
      })}
      <Menu
        open={menuOpen}
        onClose={() => { setMenuOpen(false) }}
        onSelect={(id) => {
          setMenuOpen(false)
          // `openTab` focuses an already-open view instead of stacking a
          // duplicate, so selecting `files` twice is harmless.
          openTab(id === 'files' ? 'files' : 'review')
        }}
        align="start"
        // The strip sits inside the panel's scroll column; an in-place list
        // would be cropped by it, so the menu renders through a portal.
        portal
        items={[
          { type: 'label', id: 'views', text: t('explorer.views') },
          { id: 'files', label: t('explorer.files'), icon: <FilesIcon size={14} /> },
          { id: 'changes', label: t('explorer.changes'), icon: <GitIcon size={14} /> },
        ]}
        anchor={
          <button
            type="button"
            aria-label={t('explorer.newTab')}
            title={t('explorer.newTab')}
            aria-expanded={menuOpen}
            onClick={() => { setMenuOpen(value => !value) }}
            style={{ ...iconButtonStyle, width: 24, height: 24, flex: '0 0 auto' }}
          >
            <PlusIcon size={14} />
          </button>
        }
      />
    </div>
  )
}

/**
 * @param sessionId - the session this panel is rendered for. Sent so the host
 *   resolves the workspace from that session's own cwd; without it the host can
 *   only guess, and its guess is the registry's oldest entry — some other project.
 */
export function ExplorerPanel(props: { workspace?: string; sessionId?: string }) {
  const t = useT()
  const { tabs, activeId } = useTabs()
  const active = tabs.find(tab => tab.id === activeId)
  const scope = [
    props.workspace === undefined ? undefined : `workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === undefined ? undefined : `session=${encodeURIComponent(props.sessionId)}`,
  ].filter(Boolean).join('&')
  const query = scope.length === 0 ? '' : `?${scope}`
  const status = useResource<ExplorerStatus>(`/explorer/status${query}`)

  // The changes list is the one thing here that goes stale on its own: the agent
  // edits files while the panel is open. A slow poll is enough — this is a
  // read-only view, not a watcher.
  //
  // The timer is keyed to `query`, NOT to the resource. `useResource` hands back a
  // fresh object whenever `data`/`error`/`loading` move, so depending on it (even
  // on its `reload`) re-ran this effect on every settled fetch — and since a
  // reload itself changes `loading`, each tick tore down and rebuilt the interval
  // mid-flight. That is what turned one panel open into nine requests. `reload` is
  // referentially stable, so reading it through a ref keeps the timer single.
  const reloadRef = useRef(status.reload)
  reloadRef.current = status.reload
  useEffect(() => {
    const timer = window.setInterval(() => { reloadRef.current() }, 5000)
    return () => { window.clearInterval(timer) }
  }, [query])

  // The VS Code launcher lives in the session header (see `index.tsx`), not in
  // this toolbar: its target is the session's project, not a view of the panel.

  return (
    // `flex: 1` and `minHeight: 0` together: the first claims the panel's full
    // height instead of collapsing to content, the second lets the scrolling
    // children shrink below their intrinsic size rather than overflowing it.
    <div data-dsh-plugin="dsh-dev-tool-ext" data-dsh-part="explorer" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <TabStrip tabs={tabs} activeId={activeId} />
        {status.data?.branch !== undefined && (
          <span style={{ ...metaStyle, flex: '0 0 auto' }}>
            {status.data.branch}
            {(status.data.ahead ?? 0) > 0 && ` ↑${status.data.ahead}`}
            {(status.data.behind ?? 0) > 0 && ` ↓${status.data.behind}`}
          </span>
        )}
      </div>

      {status.error !== undefined && <Notice kind="error">{status.error}</Notice>}

      <div style={{ overflow: 'auto', minHeight: 0 }}>
        <ViewBoundary key={active?.id ?? 'none'}>
          {active?.kind === 'review' && (
            status.data === undefined
              ? <div style={{ fontSize: 13, color: token.textMuted }}>{t('common.loading')}</div>
              : <ReviewView status={status.data} />
          )}
          {active?.kind === 'files' && <FilesView workspace={props.workspace} sessionId={props.sessionId} />}
          {active?.kind === 'editor' && active.path !== undefined && <EditorView path={active.path} scope={scope} />}
          {active?.kind === 'diff' && active.path !== undefined && <DiffView path={active.path} scope={scope} />}
        </ViewBoundary>
      </div>
    </div>
  )
}
