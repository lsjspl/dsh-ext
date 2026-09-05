import { Component, useRef, useState, useCallback, useEffect, type ReactNode } from 'react'
import { Menu, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { useResource } from './use-resource.ts'
import { INDENT, Notice, rowStyle, token, buttonStyle } from './ui.tsx'
import { useT } from './use-locale.ts'
import { FileIcon, FolderIcon } from './file-icons.tsx'
import { ChevronIcon, CloseIcon, CopyIcon, CheckIcon, FilesIcon, GitIcon, LockIcon, PlusIcon, TerminalIcon, VscodeIcon, IdeaIcon, FolderIcon as FolderGlyph, iconButtonStyle } from './icons.tsx'
import { useTabs, bindPanelTabs, type Tab, type TabKind } from './tabs.ts'
import { setPanelOpen } from './panel-state.ts'
import { callApi } from './api.ts'
import { CodeView, DiffView } from './DiffView.tsx'
import { ReviewView } from './ReviewView.tsx'
import { TerminalView } from './TerminalView.tsx'
import { API_PREFIX, type ExplorerStatus, type FileView, type OpenEditorResult, type TreeEntry, type SessionBindingResult } from '../shared/api-contract.ts'

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
  readonly root?: string
  readonly name?: string
  readonly path: string
  readonly entries: readonly TreeEntry[]
}

/**
 * Prominent project path bar displayed at the top of both Files and Review pages.
 * Shows project folder name, canonical path, 1-click copy, and open folder button.
 */
export function ProjectPathBar(props: {
  root?: string
  name?: string
  workspace?: string
  scope?: string
}) {
  const [copied, setCopied] = useState(false)
  const fullPath = props.root ?? props.workspace ?? ''
  const projectName = props.name ?? (fullPath ? fullPath.split(/[\\/]/).filter(Boolean).pop() : '') ?? ''

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!fullPath) return
    navigator.clipboard.writeText(fullPath).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 1500)
    })
  }, [fullPath])

  const handleOpenFolder = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const query = props.scope ? `?editor=explorer&${props.scope}` : '?editor=explorer'
    callApi(`/explorer/open-editor${query}`, { method: 'POST' }).catch((err) => {
      console.warn('Failed to open file explorer:', err)
    })
  }, [props.scope])

  if (!fullPath && !projectName) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 8px',
        marginBottom: 6,
        borderRadius: 6,
        background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
        border: `1px solid ${token.border}`,
        fontSize: 12,
        lineHeight: '18px',
        gap: 6,
        flex: '0 0 auto',
      }}
    >
      <div
        title={fullPath}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <FolderGlyph size={15} style={{ flex: '0 0 auto', color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />
        <span style={{ fontWeight: 600, color: token.text, flex: '0 0 auto' }}>
          {projectName}
        </span>
        <span
          style={{
            color: token.textMuted,
            fontSize: 11,
            fontFamily: 'ui-monospace, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fullPath}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? '已复制项目路径' : '复制项目完整路径'}
          style={{
            ...iconButtonStyle,
            width: 22,
            height: 22,
            borderRadius: 4,
            color: copied ? token.success : token.textMuted,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = token.hover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {copied ? <CheckIcon size={13} style={{ color: token.success }} /> : <CopyIcon size={13} />}
        </button>
        <button
          type="button"
          onClick={handleOpenFolder}
          title="在系统文件资源管理器中打开"
          style={{
            ...iconButtonStyle,
            width: 22,
            height: 22,
            borderRadius: 4,
            color: token.textMuted,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = token.hover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <FolderGlyph size={13} />
        </button>
      </div>
    </div>
  )
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
    console.error('[dsh-ext] a side-panel view crashed:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ fontSize: 12, color: token.textMuted, padding: '8px 0' }}>
          [dsh-ext] view crashed — close this tab and reopen it.
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
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return path.slice(lastSlash + 1)
}

/** Secondary text: row sizes, meta beside a title. */
const metaStyle = { fontSize: 12, color: token.textMuted, fontFamily: 'ui-monospace, monospace' } as const

/** Corner notes: truncation and per-list footnotes. */
const noteStyle = { fontSize: 11.5, color: token.textMuted } as const

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
        ? <ChevronIcon size={13} open={open} />
        : <span aria-hidden="true" style={{ width: 13, flex: '0 0 auto' }} />}
      {entry.kind === 'directory'
        ? <FolderIcon size={16} open={open} />
        : <FileIcon size={16} name={entry.name} />}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13.5, color: token.text }}>{entry.name}</span>
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

/** Image preview component with checkerboard transparency background and dimension metadata. */
function ImageViewer(props: { url: string; name: string; bytes: number }) {
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', padding: '12px 6px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          minHeight: 200,
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
          src={props.url}
          alt={props.name}
          onLoad={(e) => {
            const img = e.currentTarget
            setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
          }}
          style={{
            maxWidth: '100%',
            maxHeight: 520,
            objectFit: 'contain',
            borderRadius: 4,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: token.textMuted, fontFamily: 'ui-monospace, monospace', display: 'flex', gap: 8, alignItems: 'center' }}>
        {dimensions !== null && (
          <>
            <span>{dimensions.w} × {dimensions.h} px</span>
            <span>·</span>
          </>
        )}
        <span>{formatSize(props.bytes)}</span>
      </div>
    </div>
  )
}

/** Video player component with native playback controls, resolution and duration metadata. */
function VideoPlayer(props: { url: string; name: string; bytes: number }) {
  const [meta, setMeta] = useState<{ w: number; h: number; duration: number } | null>(null)

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', padding: '12px 6px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          minHeight: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          borderRadius: 8,
          border: `1px solid ${token.border}`,
          backgroundColor: '#000',
        }}
      >
        <video
          src={props.url}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            setMeta({ w: v.videoWidth, h: v.videoHeight, duration: v.duration })
          }}
          style={{
            maxWidth: '100%',
            maxHeight: 520,
            borderRadius: 4,
            outline: 'none',
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: token.textMuted, fontFamily: 'ui-monospace, monospace', display: 'flex', gap: 8, alignItems: 'center' }}>
        {meta !== null && (
          <>
            <span>{meta.w} × {meta.h} px</span>
            <span>·</span>
            <span>{formatDuration(meta.duration)}</span>
            <span>·</span>
          </>
        )}
        <span>{formatSize(props.bytes)}</span>
      </div>
    </div>
  )
}

/** Audio player component with native playback controls. */
function AudioPlayer(props: { url: string; name: string; bytes: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        gap: 12,
        borderRadius: 8,
        border: `1px solid ${token.border}`,
        background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.04))',
        margin: '12px 0',
      }}
    >
      <FileIcon size={40} name={props.name} />
      <div style={{ fontSize: 13, fontWeight: 600, color: token.text }}>
        {props.name}
      </div>
      <div style={{ fontSize: 12, color: token.textMuted }}>
        {formatSize(props.bytes)}
      </div>
      <audio
        src={props.url}
        controls
        preload="metadata"
        style={{ width: '100%', maxWidth: 360, marginTop: 8 }}
      />
    </div>
  )
}

/** Binary file card with one-click external launcher. */
function BinaryFileView(props: { name: string; bytes: number; onOpen: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        gap: 12,
        borderRadius: 8,
        border: `1px dashed ${token.border}`,
        background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.04))',
        margin: '16px 0',
      }}
    >
      <FileIcon size={36} name={props.name} />
      <div style={{ fontSize: 13, fontWeight: 600, color: token.text }}>
        {props.name}
      </div>
      <div style={{ fontSize: 12, color: token.textMuted, textAlign: 'center', maxWidth: 320, lineHeight: '18px' }}>
        该文件为二进制文件 ({formatSize(props.bytes)})，无法以纯文本代码显示。请使用系统默认程序或 IDE 打开。
      </div>
      <button
        type="button"
        onClick={props.onOpen}
        style={{
          ...buttonStyle,
          fontSize: 12,
          padding: '5px 14px',
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 6,
        }}
      >
        <FolderGlyph size={14} />
        <span>在外部程序中打开</span>
      </button>
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
    return <div style={{ fontSize: 12, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('common.loading')}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
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
        <FileIcon size={15} name={baseOf(props.path)} />
        <span
          title={props.path}
          style={{ fontSize: 13, fontWeight: 500, color: token.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >{props.path}</span>
        <span style={{ fontSize: 12, color: token.textMuted, fontFamily: 'ui-monospace, monospace' }}>{formatSize(file.data.bytes)}</span>
        <Menu
          open={menuOpen}
          onClose={() => { setMenuOpen(false) }}
          onSelect={(id) => { void openExternal(id as 'explorer' | 'vscode' | 'idea') }}
          align="end"
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
              style={{ ...buttonStyle, height: 24, minHeight: 0, padding: '0 8px', fontSize: 12, borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>{t('turn.open')}</span>
              <ChevronIcon size={11} open={menuOpen} />
            </button>
          }
        />
      </div>
      {file.data.isVideo ? (
        <VideoPlayer
          url={file.data.mediaUrl && file.data.mediaUrl.includes('&') ? file.data.mediaUrl : `${API_PREFIX}/explorer/raw?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? '' : `&${props.scope}`}`}
          name={baseOf(props.path)}
          bytes={file.data.bytes}
        />
      ) : file.data.isAudio ? (
        <AudioPlayer
          url={file.data.mediaUrl && file.data.mediaUrl.includes('&') ? file.data.mediaUrl : `${API_PREFIX}/explorer/raw?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? '' : `&${props.scope}`}`}
          name={baseOf(props.path)}
          bytes={file.data.bytes}
        />
      ) : file.data.isImage && (file.data.imageUrl || file.data.mediaUrl) ? (
        <ImageViewer
          url={file.data.imageUrl ?? `${API_PREFIX}/explorer/raw?path=${encodeURIComponent(props.path)}${props.scope.length === 0 ? '' : `&${props.scope}`}`}
          name={baseOf(props.path)}
          bytes={file.data.bytes}
        />
      ) : file.data.isBinary ? (
        <BinaryFileView
          name={baseOf(props.path)}
          bytes={file.data.bytes}
          onOpen={() => { void openExternal('explorer') }}
        />
      ) : (
        <>
          <CodeView path={props.path} content={file.data.content} />
          {file.data.truncated && (
            <div style={noteStyle}>{t('explorer.truncatedFile', { lines: file.data.content.split('\n').length })}</div>
          )}
        </>
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
          ? `${baseOf(tab.path ?? '')}${tab.side ? ` (${t(tab.side === 'staged' ? 'git.stagedChanges' : 'git.unstagedChanges')})` : ''}`
          : tab.kind === 'terminal'
            ? `${t('terminal.tab')} ${tab.path ?? ''}`
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
              padding: '5px 9px 5px 10px',
              borderRadius: 6,
              fontSize: 13,
              lineHeight: '20px',
              fontWeight: active ? 500 : 400,
              cursor: 'pointer',
              userSelect: 'none',
              color: active ? token.text : token.textMuted,
              background: active ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))' : 'transparent',
              border: `1px solid ${active ? token.border : 'transparent'}`,
              boxShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              flex: '0 1 auto',
              minWidth: 0,
              transition: 'all 120ms ease',
            }}
          >
            {tab.kind === 'files' && <FilesIcon size={15} />}
            {(tab.kind === 'review' || tab.kind === 'diff') && <GitIcon size={15} />}
            {tab.kind === 'editor' && <FileIcon size={15} name={baseOf(tab.path ?? '')} />}
            {tab.kind === 'terminal' && <TerminalIcon size={15} />}
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
                width: 18,
                height: 18,
                padding: 0,
                border: 'none',
                borderRadius: 3,
                background: 'transparent',
                color: 'inherit',
                opacity: active ? 0.7 : 0.4,
                cursor: 'pointer',
                flex: '0 0 auto',
                transition: 'all 100ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(125, 125, 125, 0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = active ? '0.7' : '0.4'; e.currentTarget.style.background = 'transparent' }}
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
          if (id === 'files') props.onOpen('files')
          else if (id === 'changes') props.onOpen('review')
          else if (id === 'terminal') props.onOpen('terminal')
        }}
        align="start"
        portal
        items={[
          { type: 'label', id: 'views', text: t('explorer.views') },
          { id: 'files', label: t('explorer.files'), icon: <FilesIcon size={14} /> },
          { id: 'changes', label: t('explorer.changes'), icon: <GitIcon size={14} /> },
          { id: 'terminal', label: t('terminal.newTab'), icon: <TerminalIcon size={14} /> },
        ]}
        anchor={
          <button
            type="button"
            aria-label={t('explorer.newTab')}
            title={t('explorer.newTab')}
            aria-expanded={menuOpen}
            onClick={() => { setMenuOpen(value => !value) }}
            style={{ ...iconButtonStyle, width: 26, height: 26, borderRadius: 6, flex: '0 0 auto' }}
          >
            <PlusIcon size={15} />
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
  const { tabs, activeId, open: openTabInStore, select: selectPanelTab, close: closeTabInStore } = useTabs(tabScope)
  // Publish the scope so the conversation's per-turn changes card can open a
  // diff or editor tab here from outside this tree.
  useEffect(() => bindPanelTabs(tabScope), [tabScope])
  // Closing a terminal tab kills its shell: an invisibly running process with
  // no way back from this UI is a leak, not a convenience.
  const closePanelTab = useCallback((id: string) => {
    const tab = tabs.find(entry => entry.id === id)
    closeTabInStore(id)
    if (tab?.kind === 'terminal') {
      void callApi('/terminal/kill', { body: { id } })
    }
  }, [tabs, closeTabInStore])
  const active = tabs.find(tab => tab.id === activeId)
  const scope = [
    props.workspace === undefined ? undefined : `workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === undefined ? undefined : `session=${encodeURIComponent(props.sessionId)}`,
  ].filter(Boolean).join('&')
  const query = scope.length === 0 ? '' : `?${scope}`
  const status = useResource<ExplorerStatus>(`/explorer/status${query}`)

  const reloadRef = useRef(status.reload)
  reloadRef.current = status.reload
  useEffect(() => {
    const timer = window.setInterval(() => { reloadRef.current() }, 5000)
    return () => { window.clearInterval(timer) }
  }, [query])

  const binding = useResource<SessionBindingResult>(
    props.sessionId ? `/explorer/git/session-binding?session=${encodeURIComponent(props.sessionId)}` : '/explorer/git/session-binding',
    Boolean(props.sessionId)
  )
  const isLocked = binding.data?.binding?.locked === true

  return (
    <div data-dsh-plugin="dsh-ext" data-dsh-part="explorer" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
        <TabStrip
          tabs={tabs}
          activeId={activeId}
          onOpen={openTabInStore}
          onSelect={selectPanelTab}
          onClose={closePanelTab}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
          {status.data?.branch !== undefined && (
            <div
              title={t('git.sessionLockedTooltip', { branch: status.data.branch })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                color: token.text,
                background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                borderRadius: 12,
                padding: '2px 8px',
                flex: '0 0 auto',
                lineHeight: '18px',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              <GitIcon size={13} />
              <LockIcon size={11} style={{ color: token.warn }} />
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {status.data.branch}
              </span>
              {(status.data.ahead ?? 0) > 0 && <span style={{ color: token.success }}>↑{status.data.ahead}</span>}
              {(status.data.behind ?? 0) > 0 && <span style={{ color: token.warn }}>↓{status.data.behind}</span>}
            </div>
          )}
          {/* Dedicated Close Button for the Sidebar */}
          <button
            type="button"
            aria-label="关闭侧边栏"
            title="关闭侧边栏 (Esc)"
            onClick={() => { setPanelOpen(false) }}
            style={{
              ...iconButtonStyle,
              width: 24,
              height: 24,
              borderRadius: 6,
              color: token.textMuted,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flex: '0 0 auto',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = token.text
              e.currentTarget.style.backgroundColor = token.hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = token.textMuted
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>

      {status.error !== undefined && <Notice kind="error">{status.error}</Notice>}

      {/* 固定项目路径栏：位于滚动视口外部，无论文件列表如何滚动始终固定置顶 */}
      {(active?.kind === 'review' || active?.kind === 'files') && (
        <ProjectPathBar
          root={status.data?.root}
          name={status.data?.name}
          workspace={props.workspace}
          scope={scope}
        />
      )}

      <div style={{ overflow: 'auto', minHeight: 0, flex: 1 }}>
        <ViewBoundary key={active?.id ?? 'none'}>
          {active?.kind === 'review' && (
            status.data === undefined
              ? <div style={{ fontSize: 12, color: token.textMuted, padding: '16px 8px', textAlign: 'center' }}>{t('common.loading')}</div>
              : (
                <ReviewView
                  status={status.data}
                  workspaceRoot={status.data?.root}
                  sessionId={props.sessionId}
                  scope={scope}
                  onReload={() => {
                    status.reload()
                    binding.reload?.()
                  }}
                  onOpenDiff={(path, side) => { openTabInStore('diff', path, side) }}
                />
              )
          )}
          {active?.kind === 'files' && (
            <FilesView
              workspace={props.workspace}
              sessionId={props.sessionId}
              onOpenFile={(path) => { openTabInStore('editor', path) }}
            />
          )}
          {active?.kind === 'editor' && active.path !== undefined && <EditorView path={active.path} scope={scope} />}
          {active?.kind === 'diff' && active.path !== undefined && <DiffView path={active.path} scope={scope} side={active.side} />}
          {active?.kind === 'terminal' && (
            <TerminalView
              termId={active.id}
              workspace={props.workspace}
              sessionId={props.sessionId}
            />
          )}
        </ViewBoundary>
      </div>
    </div>
  )
}
