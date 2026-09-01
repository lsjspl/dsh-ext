import { useCallback, useEffect, useState } from 'react'
import { callApi } from './api.ts'
import { useResource } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT, type Translate } from './use-locale.ts'
import type { ChangeEntry, ExplorerStatus, TreeEntry } from '../shared/api-contract.ts'

/**
 * Feature 5 — the project explorer: a directory tree and the workspace's
 * uncommitted changes.
 *
 * Read-only by construction. Every endpoint behind it is a git query, so there
 * is no button here that can change the user's repository — the panel shows
 * state, and the agent or the user's own terminal changes it.
 */

interface TreeResponse {
  readonly workspace: string
  readonly path: string
  readonly entries: readonly TreeEntry[]
}

/** Human-readable size, for the file rows. */
function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

function ChangeList(props: { status: ExplorerStatus; onOpenDiff: (change: ChangeEntry) => void }) {
  const t = useT()
  const { status } = props
  if (!status.isRepository) {
    return <div style={{ fontSize: 12, color: token.textMuted, padding: '8px 0' }}>{t('explorer.noRepo')}</div>
  }
  if (status.changes.length === 0) {
    return <div style={{ fontSize: 12, color: token.textMuted, padding: '8px 0' }}>{t('explorer.noChanges')}</div>
  }
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {status.changes.map(change => (
        <li key={`${change.index}${change.worktree} ${change.path}`}>
          <button
            type="button"
            onClick={() => { props.onOpenDiff(change) }}
            style={{
              ...buttonStyle,
              display: 'flex',
              width: '100%',
              gap: 8,
              alignItems: 'baseline',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              padding: '3px 4px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                color: change.untracked ? token.textMuted : token.accent,
                flex: '0 0 auto',
              }}
            >
              {change.index}{change.worktree}
            </span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {change.from !== undefined && (
                <span style={{ color: token.textMuted }}>{change.from} → </span>
              )}
              {change.path}
            </span>
            <span style={{ fontSize: 10, color: token.textMuted, flex: '0 0 auto' }}>
              {describeChange(change, t)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function Tree(props: { workspace: string | undefined; sessionId: string | undefined }) {
  const t = useT()
  const [path, setPath] = useState('')
  const scope = [
    props.workspace === undefined ? undefined : `&workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === undefined ? undefined : `&session=${encodeURIComponent(props.sessionId)}`,
  ].filter(Boolean).join('')
  const tree = useResource<TreeResponse>(`/explorer/tree?path=${encodeURIComponent(path)}${scope}`)

  const segments = path.length === 0 ? [] : path.split('/')

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', fontSize: 11, paddingBottom: 4 }}>
        <button type="button" onClick={() => { setPath('') }} style={crumbStyle}>{t('explorer.workspace')}</button>
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <span style={{ color: token.textMuted }}>/</span>
            <button
              type="button"
              onClick={() => { setPath(segments.slice(0, index + 1).join('/')) }}
              style={crumbStyle}
            >{segment}</button>
          </span>
        ))}
      </div>

      {tree.error !== undefined && <Notice kind="error">{tree.error}</Notice>}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {path.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => { setPath(segments.slice(0, -1).join('/')) }}
              style={{ ...rowStyle, color: token.textMuted }}
            >{t('explorer.up')}</button>
          </li>
        )}
        {(tree.data?.entries ?? []).map(entry => (
          <li key={entry.path}>
            {entry.kind === 'directory' ? (
              <button type="button" onClick={() => { setPath(entry.path) }} style={rowStyle}>
                <span aria-hidden="true" style={{ color: token.accent }}>▸</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</span>
              </button>
            ) : (
              <div style={{ ...rowStyle, cursor: 'default' }}>
                <span aria-hidden="true" style={{ opacity: 0 }}>▸</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</span>
                <span style={{ fontSize: 10, color: token.textMuted }}>{formatSize(entry.size)}</span>
              </div>
            )}
            {entry.truncated === true && (
              <div style={{ fontSize: 10, color: token.textMuted, padding: '2px 4px' }}>
                {t('explorer.truncated')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const crumbStyle = {
  ...buttonStyle,
  border: 'none',
  background: 'transparent',
  padding: '1px 3px',
  fontSize: 11,
  color: token.accent,
} as const

const rowStyle = {
  ...buttonStyle,
  display: 'flex',
  width: '100%',
  gap: 6,
  alignItems: 'center',
  border: 'none',
  background: 'transparent',
  textAlign: 'left' as const,
  padding: '3px 4px',
  fontSize: 12,
}

/**
 * @param sessionId - the session this panel is rendered for. Sent so the host
 *   resolves the workspace from that session's own cwd; without it the host can
 *   only guess, and its guess is the registry's oldest entry — some other project.
 */
export function ExplorerPanel(props: { workspace?: string; sessionId?: string }) {
  const t = useT()
  const [tab, setTab] = useState<'changes' | 'files'>('changes')
  const [diff, setDiff] = useState<{ path: string; patch: string } | undefined>(undefined)
  const scope = [
    props.workspace === undefined ? undefined : `workspace=${encodeURIComponent(props.workspace)}`,
    props.sessionId === undefined ? undefined : `session=${encodeURIComponent(props.sessionId)}`,
  ].filter(Boolean).join('&')
  const query = scope.length === 0 ? '' : `?${scope}`
  const status = useResource<ExplorerStatus>(`/explorer/status${query}`)

  // The changes list is the one thing here that goes stale on its own: the agent
  // edits files while the panel is open. A slow poll is enough — this is a
  // read-only view, not a watcher.
  useEffect(() => {
    const timer = window.setInterval(() => { status.reload() }, 5000)
    return () => { window.clearInterval(timer) }
  }, [status.reload])

  const openDiff = useCallback(async (change: ChangeEntry) => {
    setDiff({ path: change.path, patch: t('common.loading') })
    const result = await callApi<{ path: string; patch: string }>(
      `/explorer/diff?path=${encodeURIComponent(change.path)}&staged=${change.staged ? '1' : '0'}${scope.length === 0 ? '' : `&${scope}`}`,
    )
    setDiff(result.ok
      ? { path: change.path, patch: result.value.patch.length === 0 ? t('explorer.noDiff') : result.value.patch }
      : { path: change.path, patch: t('explorer.diffFailed', { message: result.message }) })
    // `scope` is a real dependency: it names the workspace the diff is asked
    // about, so a stale capture would fetch from the previous session's project.
  }, [scope])

  return (
    <div data-dsh-plugin="dsh-dev-tool-ext" data-dsh-part="explorer" style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {(['changes', 'files'] as const).map(name => (
          <button
            key={name}
            type="button"
            onClick={() => { setTab(name) }}
            aria-pressed={tab === name}
            style={{
              ...buttonStyle,
              fontSize: 11,
              padding: '2px 8px',
              borderColor: tab === name ? token.accent : token.border,
              color: tab === name ? token.accent : token.text,
            }}
          >{name === 'changes' ? t('explorer.changes') : t('explorer.files')}</button>
        ))}
        <span style={{ flex: 1 }} />
        {status.data?.branch !== undefined && (
          <span style={{ fontSize: 11, color: token.textMuted }}>
            {status.data.branch}
            {(status.data.ahead ?? 0) > 0 && ` ↑${status.data.ahead}`}
            {(status.data.behind ?? 0) > 0 && ` ↓${status.data.behind}`}
          </span>
        )}
      </div>

      {status.error !== undefined && <Notice kind="error">{status.error}</Notice>}

      <div style={{ overflow: 'auto', minHeight: 0 }}>
        {tab === 'changes'
          ? (status.data === undefined
              ? <div style={{ fontSize: 12, color: token.textMuted }}>{t('common.loading')}</div>
              : <ChangeList status={status.data} onOpenDiff={openDiff} />)
          : <Tree workspace={props.workspace} sessionId={props.sessionId} />}
      </div>

      {diff !== undefined && (
        <div style={{ borderTop: `1px solid ${token.border}`, paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <strong style={{ fontSize: 11, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {diff.path}
            </strong>
            <button type="button" onClick={() => { setDiff(undefined) }} style={{ ...buttonStyle, fontSize: 11 }}>{t('common.close')}</button>
          </div>
          <pre style={{
            margin: 0,
            maxHeight: 220,
            overflow: 'auto',
            fontSize: 11,
            lineHeight: 1.45,
            fontFamily: 'ui-monospace, monospace',
            color: token.text,
          }}>{diff.patch}</pre>
        </div>
      )}
    </div>
  )
}
