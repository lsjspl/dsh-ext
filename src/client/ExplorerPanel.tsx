import { Component, useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { Menu, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { useResource } from './use-resource.ts'
import { INDENT, Notice, rowStyle, token, buttonStyle } from './ui.tsx'
import { useT } from './use-locale.ts'
import { FileIcon, FolderIcon } from './file-icons.tsx'
import { ChevronIcon, CloseIcon, FilesIcon, GitIcon, PlusIcon, VscodeIcon, IdeaIcon, FolderIcon as FolderGlyph, iconButtonStyle } from './icons.tsx'
import { useTabs, bindPanelTabs, type Tab, type TabKind } from './tabs.ts'
import { callApi } from './api.ts'
import { CodeView, DiffView } from './DiffView.tsx'
import { ReviewView } from './ReviewView.tsx'
import type { ExplorerStatus, FileView, OpenEditorResult, TreeEntry } from '../shared/api-contract.ts'

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
 * Typography follows the host's own scale rather than this file's taste: rows
 * render at 14px (the size of the host's own sidebar and menu rows — probed
 * from its compiled stylesheets), secondary text at 13px, and corner notes at
 * 12px (the host's smallest size). The older draft used 11–13px throughout and
 * read as fine print against everything around it.
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
class ViewBoundary extends Component<{ children: ReactNode }, { failed: boolean; message: string }> {
  state = { failed: false, message: '' }
  static getDerivedStateFromError(error: Error) {
    return { failed: true, message: error.message }
  }
  componentDidCatch(error: Error) {
    console.error('[dsh-dev-tool-ext] a side-panel view crashed:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ fontSize: 12, color: token.textMuted, padding: '8px 0' }}>
          [dsh-dev-tool-ext] view crashed — close this tab and reopen it.
          {this.state.message.length > 0 && (
            <div style={{ marginTop: 6, color: token.danger, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.message}
            </div>
          )}
        </div>
      )
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
const metaStyle = { fontSize: 13, color: token.textMuted } as const

/** Corner notes: truncation and per-list footnotes. */
const noteStyle = { fontSize: 12, color: token.textMuted } as const

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
  onOpenFile: (path: string) => void
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
      onClick={() => { entry.kind === 'directory' ? props.onToggle(entry.path) : props.onOpenFile(entry.path) }}
      title={entry.kind === 'file' ? t('explorer.preview') : undefined}
      style={{ ...rowStyle, paddingLeft: 4 + depth * INDENT }}
    >
      {entry.kind === 'directory'
        ? <ChevronIcon size={14} open={open} />
        : <span aria-hidden="true" style={{ width: 14, flex: '0 0 auto' }} />}
      {entry.kind === 'directory'
        ? <FolderIcon size={16} open={open} />
        : <FileIcon size={16} name={entry.name} />}
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
                      onOpenFile={props.onOpenFile}
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
function FilesView(props: { workspace: string | undefined; sessionId: string | undefined; onOpenFile: (path: string) => void }) {
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
    return <div style={{ fontSize: 14, color: token.textMuted }}>{t('common.loading')}</div>
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
            onOpenFile={props.onOpenFile}
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
  // The "open in editor/explorer" affordance, mirroring the turn-changes card
  // and the session-header launcher: a small label button opening the same
  // /explorer/open-editor endpoint. State lives above the early returns so a
  // failed file read never costs the hook order.
  const [menuOpen, setMenuOpen] = useState(false)
  const [failure, setFailure] = useState<{ text: string; seq: number } | undefined>(undefined)

  async function openExternal(editor: 'explorer' | 'vscode' | 'idea') {
    const parts = [
      props.scope.length === 0 ? null : props.scope,
      `path=${encodeURIComponent(props.path)}`,
      `editor=${editor}`,
    ].filter((part): part is string => part !== null)
    const result = await callApi<OpenEditorResult>(`/explorer/open-editor?${parts.join('&')}`)
    setMenuOpen(false)
    if (result.ok) return
    setFailure({ text: t('explorer.openEditorFailed', { message: result.message }), seq: Date.now() })
  }

  if (file.error !== undefined) {
    return <Notice kind="error">{t('explorer.viewFailed', { message: file.error })}</Notice>
  }
  if (file.data === undefined) {
    return <div style={{ fontSize: 14, color: token.textMuted }}>{t('common.loading')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          // The panel scrolls the whole view, so the header row (path, size,
          // and the "open" menu) would ride away with the file content. Sticky
          // pins it to the top while the content below scrolls — the same
          // treatment the review list's filter row gets. An opaque background
          // hides content passing underneath, and a z-index keeps it above them.
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: token.surfaceBase,
          padding: '6px 0 2px',
          margin: '-6px 0 0',
        }}
      >
        <span
          title={props.path}
          style={{ fontSize: 13, color: token.textMuted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >{props.path}</span>
        <span style={noteStyle}>{formatSize(file.data.bytes)}</span>
        <Menu
          open={menuOpen}
          onClose={() => { setMenuOpen(false) }}
          onSelect={(id) => { void openExternal(id as 'explorer' | 'vscode' | 'idea') }}
          align="end"
          // The panel scrolls inside an overflow container, which crops an
          // in-place list (the menu would be cut at the panel edge). Portal
          // renders the list into the body, fixed-positioned from the anchor
          // rect, so the three "open in" rows are never clipped.
          portal
          items={[
            { id: 'explorer', label: t('explorer.openWith.explorer'), icon: <FolderGlyph size={14} /> },
            { id: 'vscode', label: t('explorer.openWith.vscode'), icon: <VscodeIcon size={14} /> },
            { id: 'idea', label: t('explorer.openWith.idea'), icon: <IdeaIcon size={14} /> },
          ]}
          anchor={
            <button
              type="button"
              aria-label={t('explorer.openEditor')}
              title={t('explorer.openEditor')}
              aria-expanded={menuOpen}
              onClick={() => { setMenuOpen(value => !value) }}
              style={{ ...buttonStyle, height: 22, minHeight: 0, padding: '0 7px', fontSize: 12, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>{t('turn.open')}</span>
              <ChevronIcon size={11} open={menuOpen} />
            </button>
          }
        />
      </div>
      <CodeView path={props.path} content={file.data.content} />
      {file.data.truncated && (
        <div style={noteStyle}>{t('explorer.truncatedFile', { lines: file.data.content.split('\n').length })}</div>
      )}
      {failure !== undefined && (
        <Toast key={failure.seq} text={failure.text} onDone={() => { setFailure(undefined) }} />
      )}
    </div>
  )
}

/**
 * The tab strip: one tab per open view, a close X on each, and a `+` launcher
 * offering the two workspace-wide views. Editor tabs are not on the `+` menu —
 * they exist per file and are opened from the tree, the way an editor does it.
 */
function TabStrip(props: {
  tabs: readonly Tab[]
  activeId: string
  onOpen: (kind: TabKind, path?: string) => void
  onSelect: (id: string) => void
  onClose: (id: string) => void
}) {
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
            onClick={() => { props.onSelect(tab.id) }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                props.onSelect(tab.id)
                event.preventDefault()
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              maxWidth: '38%',
              padding: '6px 7px 6px 10px',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              userSelect: 'none',
              color: active ? token.text : token.textMuted,
              background: active ? token.hover : 'transparent',
              border: `1px solid ${active ? token.border : 'transparent'}`,
              flex: '0 1 auto',
              minWidth: 0,
            }}
          >
            {tab.kind === 'files' && <FilesIcon size={16} />}
            {(tab.kind === 'review' || tab.kind === 'diff') && <GitIcon size={16} />}
            {tab.kind === 'editor' && <FileIcon size={16} name={baseOf(tab.path ?? '')} />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            <button
              type="button"
              aria-label={`${t('explorer.closeTab')}: ${label}`}
              onClick={(event) => {
                event.stopPropagation()
                props.onClose(tab.id)
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
              <CloseIcon size={12} />
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
          props.onOpen(id === 'files' ? 'files' : 'review')
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
            style={{ ...iconButtonStyle, width: 26, height: 26, flex: '0 0 auto' }}
          >
            <PlusIcon size={16} />
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
  // Tabs contain workspace-relative paths, so their persistence scope must be
  // the workspace identity. A session id is a safe fallback while the browser
  // has not resolved a workspace; the settings preview gets an isolated scope.
  const tabScope = props.workspace ?? (props.sessionId === undefined ? 'settings-preview' : `session:${props.sessionId}`)
  const { tabs, activeId, open: openPanelTab, select: selectPanelTab, close: closePanelTab } = useTabs(tabScope)
  // Publish the scope so the conversation's per-turn changes card can open a
  // diff or editor tab here from outside this tree.
  useEffect(() => bindPanelTabs(tabScope), [tabScope])
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
        <TabStrip
          tabs={tabs}
          activeId={activeId}
          onOpen={openPanelTab}
          onSelect={selectPanelTab}
          onClose={closePanelTab}
        />
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
              ? <div style={{ fontSize: 14, color: token.textMuted }}>{t('common.loading')}</div>
              : <ReviewView status={status.data} onOpenDiff={(path) => { openPanelTab('diff', path) }} />
          )}
          {active?.kind === 'files' && (
            <FilesView
              workspace={props.workspace}
              sessionId={props.sessionId}
              onOpenFile={(path) => { openPanelTab('editor', path) }}
            />
          )}
          {active?.kind === 'editor' && active.path !== undefined && <EditorView path={active.path} scope={scope} />}
          {active?.kind === 'diff' && active.path !== undefined && <DiffView path={active.path} scope={scope} />}
        </ViewBoundary>
      </div>
    </div>
  )
}
