import { useState, useMemo, useEffect, useRef, useCallback, useSyncExternalStore, Component, type ReactNode, type ErrorInfo } from 'react'
import { createPortal } from 'react-dom'
import { Modal, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { useResource } from './use-resource.ts'
import { useT } from './use-locale.ts'
import { token, buttonStyle } from './ui.tsx'
import { FolderIcon, GitIcon, LockIcon, ChevronIcon, CheckIcon, PlusIcon } from './icons.tsx'

export class GitErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[dsh-ext] Git controls error:', error, info)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
import { callApi } from './api.ts'
import { getClientContext } from './index.tsx'
import { useActiveWorkspace } from './use-workspace.ts'
import { useClientConfig } from './use-client-config.ts'
import type {
  ExplorerStatus,
  GitBranchesResult,
  GitWorktreesResult,
  SessionBindingResult,
  GitBranchInfo,
  GitWorktreeInfo,
} from '../shared/api-contract.ts'

const heroChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 28,
  padding: '0 10px',
  borderRadius: 14,
  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
  border: '1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.15))',
  color: 'var(--dsw-alias-label-primary, inherit)',
  fontSize: 12.5,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 120ms ease',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  marginLeft: 4,
}

const badgeChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 28,
  boxSizing: 'border-box',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  padding: '0 10px',
  borderRadius: 14,
  lineHeight: '20px',
  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
  border: `1px solid ${token.border}`,
  backdropFilter: 'blur(8px)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  cursor: 'pointer',
  color: token.text,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'all 120ms ease',
}

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  minWidth: 260,
  maxWidth: 380,
  background: 'var(--dsw-alias-bg-layer-1, #1e1e1e)',
  border: `1px solid ${token.border}`,
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  padding: '6px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  backdropFilter: 'blur(16px)',
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: token.text,
  textAlign: 'left',
  width: '100%',
  transition: 'background 100ms ease',
}

const bottomActionBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: 'var(--dsw-alias-state-business-primary, #3b82f6)',
  transition: 'background 100ms ease',
}

/**
 * Dedicated Create Branch Modal
 */
export function CreateBranchModal(props: {
  open: boolean
  onClose: () => void
  workspaceRoot?: string
  sessionId?: string
  currentBranch?: string
  isLocked?: boolean
  onBranchCreated?: (name: string) => void
}) {
  const t = useT()
  const [name, setName] = useState('')
  const [startPoint, setStartPoint] = useState('')
  const [checkout, setCheckout] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (props.open) {
      setName('')
      setStartPoint('')
      setCheckout(!props.isLocked)
      setError(null)
    }
  }, [props.open, props.isLocked])

  if (!props.open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/branch-create', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          name: trimmed,
          startPoint: startPoint.trim() || undefined,
          checkout: checkout && !props.isLocked,
        },
      })
      if (res.ok) {
        props.onBranchCreated?.(trimmed)
        props.onClose()
      } else {
        setError(res.message || 'Create branch failed')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={t('git.createBranch')}
      open
      onClose={() => { if (!busy) props.onClose() }}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <button type="button" disabled={busy} onClick={props.onClose} style={buttonStyle}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={handleSubmit}
            style={{
              ...buttonStyle,
              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
              color: '#ffffff',
              borderColor: 'var(--dsw-alias-state-business-primary, #2563eb)',
            }}
          >
            {t('git.createBranch')}
          </button>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && (
          <div style={{ color: token.danger, fontSize: 12, padding: '6px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.branchName')} *</label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. feature/login-flow"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${token.border}`,
              background: 'var(--dsw-alias-bg-layer-1, transparent)',
              color: token.text,
              fontSize: 13,
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.startPoint')}</label>
          <input
            type="text"
            placeholder={props.currentBranch ? `基于当前分支 (${props.currentBranch})` : '留空基于当前 HEAD'}
            value={startPoint}
            onChange={e => setStartPoint(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${token.border}`,
              background: 'var(--dsw-alias-bg-layer-1, transparent)',
              color: token.text,
              fontSize: 13,
            }}
          />
        </div>
        {!props.isLocked && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: token.text, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checkout}
              onChange={e => setCheckout(e.target.checked)}
            />
            <span>{t('git.checkoutAfterCreate')}</span>
          </label>
        )}
      </form>
    </Modal>
  )
}

/**
 * Dedicated Create Worktree Modal
 */
export function CreateWorktreeModal(props: {
  open: boolean
  onClose: () => void
  workspaceRoot?: string
  sessionId?: string
  localBranches: readonly GitBranchInfo[]
  worktrees: readonly GitWorktreeInfo[]
  onWorktreeCreated?: (path: string, branch?: string, workspaceId?: string) => void
}) {
  const t = useT()
  const [branchMode, setBranchMode] = useState<'existing' | 'new'>('existing')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [newBranchName, setNewBranchName] = useState('')
  const [path, setPath] = useState('')
  const [autoRegister, setAutoRegister] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const repoName = useMemo(() => {
    const r = props.workspaceRoot || ''
    return r.split(/[\\/]/).filter(Boolean).pop() || 'repo'
  }, [props.workspaceRoot])

  // Branches that are NOT currently checked out in any worktree
  const availableBranches = useMemo(() => {
    const checkedOutBranches = new Set(props.worktrees.map(w => w.branch).filter(Boolean))
    return props.localBranches.filter(b => !checkedOutBranches.has(b.name))
  }, [props.localBranches, props.worktrees])

  useEffect(() => {
    if (props.open) {
      setError(null)
      if (availableBranches.length > 0) {
        setBranchMode('existing')
        setSelectedBranch(availableBranches[0]?.name ?? '')
        setPath(`../${repoName}-${(availableBranches[0]?.name ?? 'wt').replace(/[^a-zA-Z0-9._-]/g, '-')}`)
      } else {
        setBranchMode('new')
        setSelectedBranch('')
        setNewBranchName('')
        setPath(`../${repoName}-feature`)
      }
      setAutoRegister(true)
    }
  }, [props.open, availableBranches, repoName])

  const handleBranchSelect = (b: string) => {
    setSelectedBranch(b)
    setPath(`../${repoName}-${b.replace(/[^a-zA-Z0-9._-]/g, '-')}`)
  }

  const handleNewBranchChange = (b: string) => {
    setNewBranchName(b)
    if (b) {
      setPath(`../${repoName}-${b.replace(/[^a-zA-Z0-9._-]/g, '-')}`)
    }
  }

  if (!props.open) return null

  const targetBranch = branchMode === 'existing' ? selectedBranch : newBranchName.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!path.trim() || !targetBranch) return
    setBusy(true)
    setError(null)
    try {
      const res = await callApi<{ ok: boolean; path: string; branch?: string; workspaceId?: string; message?: string }>(
        '/explorer/git/worktree-add',
        {
          body: {
            workspace: props.workspaceRoot,
            session: props.sessionId,
            branch: targetBranch,
            newBranch: branchMode === 'new',
            path: path.trim(),
            openAsWorkspace: autoRegister,
          },
        }
      )
      if (res.ok) {
        props.onWorktreeCreated?.(res.value.path, res.value.branch, res.value.workspaceId)
        props.onClose()
      } else {
        setError(res.message || 'Create worktree failed')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={t('git.createWorktree')}
      open
      onClose={() => { if (!busy) props.onClose() }}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, width: '100%' }}>
          <button type="button" disabled={busy} onClick={props.onClose} style={buttonStyle}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={busy || !path.trim() || !targetBranch}
            onClick={handleSubmit}
            style={{
              ...buttonStyle,
              background: 'var(--dsw-alias-state-business-primary, #2563eb)',
              color: '#ffffff',
              borderColor: 'var(--dsw-alias-state-business-primary, #2563eb)',
            }}
          >
            {t('git.createWorktree')}
          </button>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && (
          <div style={{ color: token.danger, fontSize: 12, padding: '6px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)' }}>
            {error}
          </div>
        )}

        {/* Branch selection mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.branches')} *</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="branchMode"
                checked={branchMode === 'existing'}
                onChange={() => setBranchMode('existing')}
                disabled={availableBranches.length === 0}
              />
              <span>{t('git.useExistingBranch')} ({availableBranches.length})</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="branchMode"
                checked={branchMode === 'new'}
                onChange={() => setBranchMode('new')}
              />
              <span>{t('git.createNewBranch')}</span>
            </label>
          </div>

          {branchMode === 'existing' ? (
            <select
              value={selectedBranch}
              onChange={e => handleBranchSelect(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${token.border}`,
                background: 'var(--dsw-alias-bg-layer-1, transparent)',
                color: token.text,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {availableBranches.map(b => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              autoFocus
              placeholder="e.g. feature-v2"
              value={newBranchName}
              onChange={e => handleNewBranchChange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${token.border}`,
                background: 'var(--dsw-alias-bg-layer-1, transparent)',
                color: token.text,
                fontSize: 13,
                marginTop: 4,
              }}
            />
          )}
        </div>

        {/* Worktree Directory Path */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.worktreePath')} *</label>
          <input
            type="text"
            required
            value={path}
            onChange={e => setPath(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${token.border}`,
              background: 'var(--dsw-alias-bg-layer-1, transparent)',
              color: token.text,
              fontSize: 13,
            }}
          />
        </div>

        {/* Auto Register as DSH workspace */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: token.text, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRegister}
            onChange={e => setAutoRegister(e.target.checked)}
          />
          <span>{t('git.autoRegisterDsh')}</span>
        </label>
      </form>
    </Modal>
  )
}

/**
 * Main Composer Git Controls:
 * Positioned to the immediate left of the balance badge inside [data-composer-card].
 * Features Worktree dropdown + Branch dropdown, each with dedicated creation modals.
 */
export function ComposerGitControlsInner(props: {
  workspaceRoot?: string
  sessionId?: string
  variant?: 'composer' | 'hero'
  onBranchSwitched?: (branch: string) => void
}) {
  const t = useT()
  const config = useClientConfig()
  const activeWorkspace = useActiveWorkspace(undefined)
  const workspaceRoot = props.workspaceRoot || activeWorkspace

  const queryParts = [
    workspaceRoot ? `workspace=${encodeURIComponent(workspaceRoot)}` : '',
    props.sessionId ? `session=${encodeURIComponent(props.sessionId)}` : '',
  ].filter(Boolean).join('&')
  const query = queryParts ? `?${queryParts}` : ''

  const status = useResource<ExplorerStatus>(`/explorer/status${query}`, true)
  const binding = useResource<SessionBindingResult>(
    props.sessionId ? `/explorer/git/session-binding?session=${encodeURIComponent(props.sessionId)}` : '/explorer/git/session-binding',
    Boolean(props.sessionId)
  )
  const branches = useResource<GitBranchesResult>(`/explorer/git/branches${query}`, Boolean(status.data?.isRepository))
  const worktrees = useResource<GitWorktreesResult>(`/explorer/git/worktrees${query}`, Boolean(status.data?.isRepository))

  // Dropdown states
  const [worktreeOpen, setWorktreeOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)
  const [branchSearch, setBranchSearch] = useState('')
  const [toastText, setToastText] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Modals
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [createWorktreeOpen, setCreateWorktreeOpen] = useState(false)

  // Container refs for click-outside dismissal
  const worktreeRef = useRef<HTMLDivElement | null>(null)
  const branchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (worktreeRef.current && !worktreeRef.current.contains(target)) {
        setWorktreeOpen(false)
      }
      if (branchRef.current && !branchRef.current.contains(target)) {
        setBranchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered local branches - MUST be called unconditionally before any early returns!
  const localList = branches.data?.local ?? []
  const filteredLocal = useMemo(() => {
    let list = [...localList]
    list.sort((a, b) => {
      const isMainA = a.name === 'master' || a.name === 'main'
      const isMainB = b.name === 'master' || b.name === 'main'
      if (isMainA && !isMainB) return -1
      if (!isMainA && isMainB) return 1
      return a.name.localeCompare(b.name)
    })
    if (!branchSearch.trim()) return list
    const q = branchSearch.toLowerCase()
    return list.filter(b => b.name.toLowerCase().includes(q))
  }, [localList, branchSearch])

  // Sessions store subscriber - MUST be called unconditionally before any early returns!
  const sessionsService = getClientContext()?.get('sessions') as any
  const sessionSnap = useSyncExternalStore(
    useCallback(fn => sessionsService?.list?.subscribe ? sessionsService.list.subscribe(fn) : () => {}, [sessionsService]),
    useCallback(() => {
      if (!props.sessionId || !sessionsService?.list?.getSnapshot) return undefined
      return sessionsService.list.getSnapshot().byId?.[props.sessionId]
    }, [props.sessionId, sessionsService]),
  )

  const isHero = typeof document !== 'undefined' && Boolean(
    document.querySelector('[data-phase="hero"]') ||
    document.querySelector('[class*="heroWorkspaceRow"]')
  )
  const isNewSession = isHero || !props.sessionId || sessionSnap?.blank === true
  const isLocked = !isNewSession || binding.data?.binding?.locked === true

  // Force close popovers when locked - MUST be called unconditionally before any early returns!
  useEffect(() => {
    if (isLocked) {
      setWorktreeOpen(false)
      setBranchOpen(false)
    }
  }, [isLocked])

  // Early returns ONLY AFTER ALL HOOKS HAVE BEEN CALLED!
  if (config?.git.enabled !== true) return null
  if (!status.data?.isRepository) return null

  const currentBranch = (!isHero && binding.data?.binding?.branch) || branches.data?.current || status.data.branch || 'main'
  const ahead = status.data.ahead ?? 0
  const behind = status.data.behind ?? 0

  const allWorktrees = worktrees.data?.worktrees ?? []
  const currentWt = allWorktrees.find(w => w.isCurrent)
  const isMainWorktree = currentWt ? currentWt.isMain : true

  const repoName = (status.data.root || workspaceRoot || '').split(/[\\/]/).filter(Boolean).pop() || 'repo'
  const worktreeDisplayName = currentWt
    ? (currentWt.isMain ? repoName : currentWt.path.split(/[\\/]/).filter(Boolean).pop() || currentWt.branch || 'worktree')
    : repoName

  // Set of branches currently checked out in linked worktrees
  const branchesInWorktrees = new Map<string, GitWorktreeInfo>()
  for (const wt of allWorktrees) {
    if (wt.branch) {
      branchesInWorktrees.set(wt.branch, wt)
    }
  }

  // Switch Workspace action (Only allowed in new session)
  const handleSwitchWorkspace = async (wt: GitWorktreeInfo) => {
    if (isLocked) return
    setBusy(true)
    try {
      let wsId = wt.workspaceId
      if (!wsId) {
        // Register it dynamically if not registered yet
        const regRes = await callApi<{ ok: boolean; workspaceId: string }>('/explorer/git/register-workspace', {
          body: { path: wt.path },
        })
        if (regRes.ok) wsId = regRes.value.workspaceId
      }
      if (wsId) {
        const workspaces = getClientContext()?.get('workspaces') as { connectWorkspace?(id: string): Promise<void> } | undefined
        if (workspaces?.connectWorkspace) {
          await workspaces.connectWorkspace(wsId)
          setWorktreeOpen(false)
          setToastText(`已切换工作区: ${wt.path}`)
          return
        }
      }
      setToastText(`已切换工作区: ${wt.path}`)
      setWorktreeOpen(false)
    } catch (err: unknown) {
      setToastText(`切换工作区失败: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
    }
  }

  // Checkout Branch action in main worktree (Only allowed in new session)
  const handleCheckoutBranch = async (targetBranch: string) => {
    if (targetBranch === currentBranch || isLocked) {
      setBranchOpen(false)
      return
    }
    setBusy(true)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/checkout', {
        body: {
          workspace: status.data?.root || workspaceRoot,
          session: isHero ? undefined : props.sessionId,
          branch: targetBranch,
          force: isNewSession,
        },
      })
      if (res.ok) {
        setToastText(t('git.checkoutSuccess', { branch: targetBranch }))
        status.reload()
        binding.reload?.()
        branches.reload()
        setBranchOpen(false)
        props.onBranchSwitched?.(targetBranch)
      } else {
        setToastText(res.message || 'Checkout failed')
      }
    } catch (err: unknown) {
      setToastText(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {toastText && (
        <Toast text={toastText} onDone={() => setToastText(null)} />
      )}

      <div
        data-dsh-part="composer-git-controls"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {/* 1. Worktree Dropdown / Locked Chip */}
        <div ref={worktreeRef} style={{ position: 'relative', display: 'inline-block' }}>
          {isLocked ? (
            <div
              role="status"
              title={`工作区: ${worktreeDisplayName} (当前会话已锁定，不可切换)`}
              style={{
                ...(props.variant === 'hero' ? heroChipStyle : badgeChipStyle),
                cursor: 'not-allowed',
                opacity: 0.88,
                userSelect: 'none',
              }}
            >
              <FolderIcon size={13} style={{ color: 'inherit' }} />
              <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {worktreeDisplayName}
              </span>
              {isMainWorktree && (
                <span style={{ fontSize: 10, opacity: 0.75, padding: '1px 4px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.2))' }}>
                  {t('git.worktreeMain')}
                </span>
              )}
              <LockIcon size={11} style={{ opacity: 0.65, marginLeft: 1 }} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setWorktreeOpen(v => !v)
                setBranchOpen(false)
              }}
              title={`工作区: ${worktreeDisplayName} (${isMainWorktree ? '主目录' : 'Worktree'})`}
              style={{
                ...(props.variant === 'hero' ? heroChipStyle : badgeChipStyle),
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = props.variant === 'hero'
                  ? 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.22))'
                  : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.22))'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = props.variant === 'hero'
                  ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
                  : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
              }}
            >
              <FolderIcon size={13} style={{ color: 'inherit' }} />
              <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {worktreeDisplayName}
              </span>
              {isMainWorktree && (
                <span style={{ fontSize: 10, opacity: 0.75, padding: '1px 4px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.2))' }}>
                  {t('git.worktreeMain')}
                </span>
              )}
              <ChevronIcon size={9} open={worktreeOpen} />
            </button>
          )}

          {/* Worktree Popover (Only in New Session) */}
          {!isLocked && worktreeOpen && (
            <div style={{ ...popoverStyle, left: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: token.textMuted, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('git.worktreeDropdown')}
              </div>

              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Main Worktree */}
                {allWorktrees.filter(w => w.isMain).map(wt => (
                  <button
                    key={wt.path}
                    type="button"
                    disabled={busy || wt.isCurrent}
                    onClick={() => handleSwitchWorkspace(wt)}
                    style={{
                      ...menuItemStyle,
                      background: wt.isCurrent ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.16))' : 'transparent',
                      fontWeight: wt.isCurrent ? 600 : 400,
                    }}
                    onMouseEnter={e => { if (!wt.isCurrent) e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))' }}
                    onMouseLeave={e => { if (!wt.isCurrent) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <FolderIcon size={13} style={{ color: 'inherit', flex: '0 0 auto' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {repoName}
                      </span>
                      <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.2))', color: token.textMuted }}>
                        {t('git.mainWorkspace')}
                      </span>
                    </div>
                    {wt.isCurrent && <CheckIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />}
                  </button>
                ))}

                {/* Linked Worktrees */}
                {allWorktrees.filter(w => !w.isMain).map(wt => {
                  const name = wt.path.split(/[\\/]/).filter(Boolean).pop() || 'worktree'
                  return (
                    <button
                      key={wt.path}
                      type="button"
                      disabled={busy || wt.isCurrent}
                      onClick={() => handleSwitchWorkspace(wt)}
                      style={{
                        ...menuItemStyle,
                        background: wt.isCurrent ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.16))' : 'transparent',
                        fontWeight: wt.isCurrent ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (!wt.isCurrent) e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))' }}
                      onMouseLeave={e => { if (!wt.isCurrent) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <GitIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)', flex: '0 0 auto' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                        {wt.branch && (
                          <span style={{ fontSize: 10, color: token.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ({wt.branch})
                          </span>
                        )}
                      </div>
                      {wt.isCurrent && <CheckIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />}
                    </button>
                  )
                })}

                {allWorktrees.filter(w => !w.isMain).length === 0 && (
                  <div style={{ fontSize: 11, color: token.textMuted, padding: '4px 8px', textAlign: 'center' }}>
                    {t('git.noOtherWorktrees')}
                  </div>
                )}
              </div>

              {/* Create Worktree Button */}
              <div style={{ borderTop: `1px solid ${token.border}`, paddingTop: 4, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    setWorktreeOpen(false)
                    setCreateWorktreeOpen(true)
                  }}
                  style={bottomActionBtnStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <PlusIcon size={13} />
                  <span>{t('git.createWorktreeAction')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Branch Dropdown / Locked Chip */}
        <div ref={branchRef} style={{ position: 'relative', display: 'inline-block' }}>
          {isLocked ? (
            <div
              role="status"
              title={`Git 分支: ${currentBranch} (当前会话已锁定，不可切换)`}
              style={{
                ...(props.variant === 'hero' ? heroChipStyle : badgeChipStyle),
                cursor: 'not-allowed',
                opacity: 0.88,
                userSelect: 'none',
              }}
            >
              <GitIcon size={13} style={{ color: 'inherit' }} />
              <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentBranch}
              </span>
              {ahead > 0 && <span style={{ color: token.success, fontSize: 10.5, fontWeight: 600 }}>↑{ahead}</span>}
              {behind > 0 && <span style={{ color: token.warn, fontSize: 10.5, fontWeight: 600 }}>↓{behind}</span>}
              <LockIcon size={11} style={{ opacity: 0.65, marginLeft: 1 }} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setBranchOpen(v => !v)
                setWorktreeOpen(false)
              }}
              title={
                !isMainWorktree
                  ? `已绑定此 Worktree (${currentBranch})`
                  : `${t('git.currentBranch')}: ${currentBranch}`
              }
              style={{
                ...(props.variant === 'hero' ? heroChipStyle : badgeChipStyle),
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = props.variant === 'hero'
                  ? 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.22))'
                  : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.22))'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = props.variant === 'hero'
                  ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
                  : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
              }}
            >
              <GitIcon size={13} style={{ color: 'inherit' }} />
              <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentBranch}
              </span>
              {ahead > 0 && <span style={{ color: token.success, fontSize: 10.5, fontWeight: 600 }}>↑{ahead}</span>}
              {behind > 0 && <span style={{ color: token.warn, fontSize: 10.5, fontWeight: 600 }}>↓{behind}</span>}
              <ChevronIcon size={9} open={branchOpen} />
            </button>
          )}

          {/* Branch Popover (Only in New Session) */}
          {!isLocked && branchOpen && (
            <div style={{ ...popoverStyle, left: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: token.textMuted, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('git.branchDropdown')}
              </div>

              {/* Case 1: In linked worktree -> branch is strictly bound to this worktree */}
              {!isMainWorktree ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 8px' }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: token.textMuted,
                      background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                      padding: '8px 10px',
                      borderRadius: 6,
                      lineHeight: '16px',
                    }}
                  >
                    {t('git.boundToWorktreeNotice', { branch: currentBranch })}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.14))',
                      fontSize: 12,
                      fontWeight: 600,
                      color: token.text,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GitIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />
                      <span>{currentBranch}</span>
                    </div>
                    <CheckIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />
                  </div>
                </div>
              ) : (
                /* Case 2: In main worktree -> can switch branch */
                <>
                  {/* Search branches if many */}
                  {localList.length > 4 && (
                    <div style={{ padding: '0 4px 4px' }}>
                      <input
                        type="text"
                        placeholder={t('git.searchBranches')}
                        value={branchSearch}
                        onChange={e => setBranchSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${token.border}`,
                          background: 'var(--dsw-alias-bg-layer-1, transparent)',
                          color: token.text,
                          fontSize: 11.5,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  {/* Local branches list */}
                  <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredLocal.map(b => {
                      const isCurrent = b.name === currentBranch
                      const checkedOutInWt = branchesInWorktrees.get(b.name)
                      const isOtherWt = checkedOutInWt && !checkedOutInWt.isMain

                      return (
                        <button
                          key={b.name}
                          type="button"
                          disabled={busy || isCurrent || Boolean(isOtherWt)}
                          title={
                            isOtherWt
                              ? `该分支已被 Worktree [${checkedOutInWt?.path}] 检出`
                              : `切换到分支 ${b.name}`
                          }
                          onClick={() => handleCheckoutBranch(b.name)}
                          style={{
                            ...menuItemStyle,
                            background: isCurrent ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.16))' : 'transparent',
                            fontWeight: isCurrent ? 600 : 400,
                            opacity: isOtherWt ? 0.5 : 1,
                            cursor: isOtherWt ? 'not-allowed' : 'pointer',
                          }}
                          onMouseEnter={e => {
                            if (!isCurrent && !isOtherWt) {
                              e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))'
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isCurrent) e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <GitIcon
                              size={13}
                              style={{ color: isCurrent ? 'var(--dsw-alias-state-business-primary, #3b82f6)' : 'inherit', flex: '0 0 auto' }}
                            />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.name}
                            </span>
                            {isOtherWt && (
                              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(234, 179, 8, 0.15)', color: 'var(--dsw-alias-state-warning, #eab308)' }}>
                                {t('git.checkedOutInWorktree')}
                              </span>
                            )}
                          </div>
                          {isCurrent && <CheckIcon size={13} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)' }} />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Create Branch Button */}
                  <div style={{ borderTop: `1px solid ${token.border}`, paddingTop: 4, marginTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setBranchOpen(false)
                        setCreateBranchOpen(true)
                      }}
                      style={bottomActionBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <PlusIcon size={13} />
                      <span>{t('git.createBranchAction')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Modals */}
      <CreateBranchModal
        open={createBranchOpen}
        onClose={() => setCreateBranchOpen(false)}
        workspaceRoot={status.data.root || workspaceRoot}
        sessionId={props.sessionId}
        currentBranch={currentBranch}
        isLocked={isLocked}
        onBranchCreated={(newBranch) => {
          setToastText(t('git.checkoutSuccess', { branch: newBranch }))
          branches.reload()
          status.reload()
          props.onBranchSwitched?.(newBranch)
        }}
      />

      <CreateWorktreeModal
        open={createWorktreeOpen}
        onClose={() => setCreateWorktreeOpen(false)}
        workspaceRoot={status.data.root || workspaceRoot}
        sessionId={props.sessionId}
        localBranches={branches.data?.local ?? []}
        worktrees={allWorktrees}
        onWorktreeCreated={async (newPath, newBranch, wsId) => {
          setToastText(`Worktree 创建成功: ${newPath}`)
          worktrees.reload()
          branches.reload()
          if (wsId) {
            const workspaces = getClientContext()?.get('workspaces') as { connectWorkspace?(id: string): Promise<void> } | undefined
            if (workspaces?.connectWorkspace) {
              await workspaces.connectWorkspace(wsId).catch(() => {})
            }
          }
        }}
      />
    </>
  )
}

export function ComposerGitControls(props: {
  workspaceRoot?: string
  sessionId?: string
  variant?: 'composer' | 'hero'
  onBranchSwitched?: (branch: string) => void
}) {
  return (
    <GitErrorBoundary>
      <ComposerGitControlsInner {...props} />
    </GitErrorBoundary>
  )
}

/**
 * Portals git worktree and branch chips into the Hero workspace row
 * (the row with WorkspaceChip on the new-session blank screen).
 */
export function HeroGitControls() {
  return null
}
