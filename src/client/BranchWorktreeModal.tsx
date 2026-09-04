import { useState, useMemo, useCallback, useSyncExternalStore } from 'react'
import { Modal, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { useResource, useCommand } from './use-resource.ts'
import { Notice, buttonStyle, token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { GitIcon, LockIcon, PlusIcon, FolderIcon, VscodeIcon, IdeaIcon, CheckIcon, CloseIcon } from './icons.tsx'
import { callApi } from './api.ts'
import { getClientContext } from './index.tsx'
import type {
  GitBranchesResult,
  GitWorktreesResult,
  SessionBindingResult,
  GitBranchInfo,
  GitWorktreeInfo,
  OpenEditorResult,
} from '../shared/api-contract.ts'

export interface BranchWorktreeModalProps {
  open: boolean
  onClose: () => void
  workspaceRoot?: string
  sessionId?: string
  onBranchSwitched?: (branch: string) => void
}

const secondaryBtnStyle = {
  ...buttonStyle,
  padding: '5px 12px',
  fontSize: 12,
  borderRadius: 6,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))',
  color: token.text,
  borderColor: token.border,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 120ms ease',
} as const

const primaryBtnStyle = {
  ...buttonStyle,
  padding: '5px 14px',
  fontSize: 12,
  borderRadius: 6,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'var(--dsw-alias-state-business-primary, #2563eb)',
  color: '#ffffff',
  borderColor: 'var(--dsw-alias-state-business-primary, #2563eb)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  transition: 'all 120ms ease',
} as const

export function BranchWorktreeModal(props: {
  open: boolean
  onClose: () => void
  workspaceRoot?: string
  sessionId?: string
  onBranchSwitched?: (branch: string) => void
}) {
  const t = useT()
  const [tab, setTab] = useState<'branches' | 'worktrees'>('branches')
  const [search, setSearch] = useState('')
  const [toastText, setToastText] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // New branch form state
  const [showNewBranch, setShowNewBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [newBranchStartPoint, setNewBranchStartPoint] = useState('')

  // New worktree form state
  const [showNewWorktree, setShowNewWorktree] = useState(false)
  const [newWorktreeBranch, setNewWorktreeBranch] = useState('')
  const [newWorktreePath, setNewWorktreePath] = useState('')
  const [newWorktreeRegisterDsh, setNewWorktreeRegisterDsh] = useState(true)

  // Confirm delete worktree
  const [confirmDeleteWorktree, setConfirmDeleteWorktree] = useState<string | null>(null)

  const queryParts = [
    props.workspaceRoot ? `workspace=${encodeURIComponent(props.workspaceRoot)}` : '',
    props.sessionId ? `session=${encodeURIComponent(props.sessionId)}` : '',
  ].filter(Boolean).join('&')
  const query = queryParts ? `?${queryParts}` : ''

  const branchesRes = useResource<GitBranchesResult>(`/explorer/git/branches${query}`, props.open)
  const worktreesRes = useResource<GitWorktreesResult>(`/explorer/git/worktrees${query}`, props.open && tab === 'worktrees')
  const bindingRes = useResource<SessionBindingResult>(
    props.sessionId ? `/explorer/git/session-binding?session=${encodeURIComponent(props.sessionId)}` : '/explorer/git/session-binding',
    props.open && Boolean(props.sessionId)
  )

  const sessionsService = getClientContext()?.get('sessions') as any
  const sessionSnap = useSyncExternalStore(
    useCallback(fn => sessionsService?.list?.subscribe ? sessionsService.list.subscribe(fn) : () => {}, [sessionsService]),
    useCallback(() => {
      if (!props.sessionId || !sessionsService?.list?.getSnapshot) return undefined
      return sessionsService.list.getSnapshot().byId?.[props.sessionId]
    }, [props.sessionId, sessionsService]),
  )
  const isBlank = !props.sessionId || sessionSnap?.blank === true
  const isLocked = !isBlank && bindingRes.data?.binding?.locked === true
  const lockedBranch = bindingRes.data?.binding?.branch ?? branchesRes.data?.current

  const repoName = useMemo(() => {
    const r = props.workspaceRoot || ''
    return r.split(/[\\/]/).filter(Boolean).pop() || 'repo'
  }, [props.workspaceRoot])

  const handleBranchChangeName = (val: string) => {
    setNewWorktreeBranch(val)
    if (val && !newWorktreePath) {
      setNewWorktreePath(`../${repoName}-${val.replace(/[^a-zA-Z0-9._-]/g, '-')}`)
    }
  }

  // Filter branches by search query
  const filteredLocal = useMemo(() => {
    const list = branchesRes.data?.local ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(b => b.name.toLowerCase().includes(q))
  }, [branchesRes.data?.local, search])

  const filteredRemote = useMemo(() => {
    const list = branchesRes.data?.remote ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(b => b.name.toLowerCase().includes(q))
  }, [branchesRes.data?.remote, search])

  const handleNewSessionOnBranch = async (branchName: string) => {
    setBusy(true)
    setActionError(null)
    try {
      const workspaces = getClientContext()?.get('workspaces') as any
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/checkout', {
        body: {
          workspace: props.workspaceRoot,
          branch: branchName,
          force: true,
        },
      })
      if (!res.ok) {
        setActionError(res.message || 'Checkout failed')
        return
      }
      if (workspaces?.startSession) {
        workspaces.startSession()
      }
      props.onClose()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCheckout = async (branchName: string) => {
    if (isLocked) {
      await handleNewSessionOnBranch(branchName)
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/checkout', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          branch: branchName,
          force: isBlank,
        },
      })
      if (res.ok) {
        setToastText(t('git.checkoutSuccess', { branch: branchName }))
        branchesRes.reload()
        bindingRes.reload()
        props.onBranchSwitched?.(branchName)
      } else {
        setActionError(res.message || 'Checkout failed')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranchName.trim()) return
    setBusy(true)
    setActionError(null)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/branch-create', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          name: newBranchName.trim(),
          startPoint: newBranchStartPoint.trim() || undefined,
          checkout: !isLocked,
        },
      })
      if (res.ok) {
        setToastText(t('git.checkoutSuccess', { branch: newBranchName.trim() }))
        setShowNewBranch(false)
        setNewBranchName('')
        setNewBranchStartPoint('')
        branchesRes.reload()
        if (!isLocked) {
          props.onBranchSwitched?.(newBranchName.trim())
        }
      } else {
        setActionError(res.message || 'Create branch failed')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCreateWorktree = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorktreePath.trim()) return
    setBusy(true)
    setActionError(null)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/worktree-add', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          branch: newWorktreeBranch.trim() || undefined,
          path: newWorktreePath.trim(),
          openAsWorkspace: newWorktreeRegisterDsh,
        },
      })
      if (res.ok) {
        setToastText('Worktree created successfully')
        setShowNewWorktree(false)
        setNewWorktreeBranch('')
        setNewWorktreePath('')
        worktreesRes.reload()
        branchesRes.reload()
      } else {
        setActionError(res.message || 'Create worktree failed')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveWorktree = async (path: string) => {
    setBusy(true)
    setActionError(null)
    try {
      const res = await callApi<{ ok: boolean; message?: string }>('/explorer/git/worktree-remove', {
        body: {
          workspace: props.workspaceRoot,
          session: props.sessionId,
          path,
          force: false,
        },
      })
      if (res.ok) {
        setToastText('Worktree removed')
        setConfirmDeleteWorktree(null)
        worktreesRes.reload()
      } else {
        setActionError(res.message || 'Remove worktree failed')
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleOpenEditor = async (path: string, editor: 'explorer' | 'vscode' | 'idea') => {
    try {
      await callApi<OpenEditorResult>(`/explorer/open-editor?path=${encodeURIComponent(path)}&editor=${editor}`, {
        method: 'POST',
      })
    } catch (err: unknown) {
      console.warn('Failed to open editor:', err)
    }
  }

  if (!props.open) return null

  return (
    <>
      <Modal
        title={tab === 'branches' ? t('git.branches') : t('git.worktrees')}
        open
        className="dsh-devtool-git-modal"
        onClose={() => { if (!busy) props.onClose() }}
        footer={(
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: token.textMuted }}>
              <GitIcon size={14} />
              <span>{branchesRes.data?.current ? `${t('git.currentBranch')}: ${branchesRes.data.current}` : ''}</span>
              {isLocked && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: token.warn }}>
                  <LockIcon size={12} />
                  {t('git.lockedSession')}
                </span>
              )}
            </div>
            <button type="button" disabled={busy} onClick={props.onClose} style={secondaryBtnStyle}>
              {t('common.close')}
            </button>
          </div>
        )}
      >
        <style>{`
          .dsh-devtool-git-modal {
            width: min(680px, 94vw) !important;
            max-height: min(84vh, 720px) !important;
          }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${token.border}`, paddingBottom: 8 }}>
            <button
              type="button"
              onClick={() => { setTab('branches'); setActionError(null) }}
              style={{
                ...buttonStyle,
                padding: '6px 14px',
                fontSize: 13,
                borderRadius: 6,
                fontWeight: tab === 'branches' ? 600 : 400,
                background: tab === 'branches' ? 'var(--dsw-alias-state-business-primary, #2563eb)' : 'transparent',
                color: tab === 'branches' ? '#ffffff' : token.textMuted,
                border: `1px solid ${tab === 'branches' ? 'var(--dsw-alias-state-business-primary, #2563eb)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {t('git.branches')}
            </button>
            <button
              type="button"
              onClick={() => { setTab('worktrees'); setActionError(null) }}
              style={{
                ...buttonStyle,
                padding: '6px 14px',
                fontSize: 13,
                borderRadius: 6,
                fontWeight: tab === 'worktrees' ? 600 : 400,
                background: tab === 'worktrees' ? 'var(--dsw-alias-state-business-primary, #2563eb)' : 'transparent',
                color: tab === 'worktrees' ? '#ffffff' : token.textMuted,
                border: `1px solid ${tab === 'worktrees' ? 'var(--dsw-alias-state-business-primary, #2563eb)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {t('git.worktrees')}
            </button>
          </div>

          {actionError && <Notice kind="error">{actionError}</Notice>}
          {branchesRes.error && <Notice kind="error">{branchesRes.error}</Notice>}

          {/* Current Branch Banner & Session Lock notice */}
          {isLocked && tab === 'branches' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                color: token.text,
                fontSize: 12.5,
                lineHeight: '18px',
              }}
            >
              <LockIcon size={16} style={{ color: 'var(--dsw-alias-state-warning, #eab308)', flex: '0 0 auto' }} />
              <div>
                {t('git.cannotSwitchInSession', { branch: lockedBranch || '' })}
              </div>
            </div>
          )}

          {/* ===================== TAB: BRANCHES ===================== */}
          {tab === 'branches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Toolbar: search & new branch button */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                <input
                  type="text"
                  placeholder={t('git.searchBranches')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: `1px solid ${token.border}`,
                    background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                    color: token.text,
                    fontSize: 12.5,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewBranch(!showNewBranch)}
                  style={showNewBranch ? secondaryBtnStyle : primaryBtnStyle}
                >
                  <PlusIcon size={13} />
                  <span>{t('git.createBranch')}</span>
                </button>
              </div>

              {/* Create branch inline form */}
              {showNewBranch && (
                <form
                  onSubmit={handleCreateBranch}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                    border: `1px solid ${token.border}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: token.text }}>
                    {t('git.createBranch')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder={t('git.branchName')}
                      value={newBranchName}
                      required
                      autoFocus
                      onChange={e => setNewBranchName(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: 160,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${token.border}`,
                        background: 'var(--dsw-alias-bg-layer-1, transparent)',
                        color: token.text,
                        fontSize: 12.5,
                      }}
                    />
                    <input
                      type="text"
                      placeholder={t('git.startPoint')}
                      value={newBranchStartPoint}
                      onChange={e => setNewBranchStartPoint(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: 160,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${token.border}`,
                        background: 'var(--dsw-alias-bg-layer-1, transparent)',
                        color: token.text,
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" onClick={() => setShowNewBranch(false)} style={secondaryBtnStyle}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={busy || !newBranchName.trim()} style={primaryBtnStyle}>
                      {t('git.createBranchBtn')}
                    </button>
                  </div>
                </form>
              )}

              {/* Branch Lists */}
              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Local branches */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: token.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('git.localBranches')} ({filteredLocal.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {filteredLocal.map(b => (
                      <div
                        key={b.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: b.isCurrent
                            ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.14))'
                            : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.04))',
                          border: `1px solid ${b.isCurrent ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.border}`,
                          fontSize: 13,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                          <GitIcon size={14} style={{ color: b.isCurrent ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.textMuted, flex: '0 0 auto' }} />
                          <span style={{ fontWeight: b.isCurrent ? 600 : 400, color: token.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.name}
                          </span>
                          {b.isCurrent && (
                            <span
                              style={{
                                fontSize: 10.5,
                                padding: '1px 6px',
                                borderRadius: 10,
                                background: 'var(--dsw-alias-state-business-primary, #2563eb)',
                                color: '#ffffff',
                                flex: '0 0 auto',
                              }}
                            >
                              {t('git.currentBranch')}
                            </span>
                          )}
                          {(b.ahead ?? 0) > 0 && <span style={{ color: token.success, fontSize: 11, flex: '0 0 auto' }}>↑{b.ahead}</span>}
                          {(b.behind ?? 0) > 0 && <span style={{ color: token.warn, fontSize: 11, flex: '0 0 auto' }}>↓{b.behind}</span>}
                          {b.upstream && (
                            <span style={{ fontSize: 11, color: token.textMuted, flex: '0 0 auto' }}>
                              [{b.upstream}]
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                          {!b.isCurrent && (
                            <button
                              type="button"
                              disabled={busy}
                              title={isLocked ? t('git.newSessionForBranch') : t('git.checkoutBranch')}
                              onClick={() => handleCheckout(b.name)}
                              style={{
                                ...secondaryBtnStyle,
                                cursor: 'pointer',
                              }}
                            >
                              {isLocked ? t('git.newSessionForBranch') : t('git.checkoutBranch')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredLocal.length === 0 && (
                      <div style={{ fontSize: 12, color: token.textMuted, padding: 12, textAlign: 'center' }}>
                        No local branches found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Remote branches */}
                {filteredRemote.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: token.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('git.remoteBranches')} ({filteredRemote.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filteredRemote.map(b => (
                        <div
                          key={b.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.04))',
                            border: `1px solid ${token.border}`,
                            fontSize: 13,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                            <GitIcon size={14} style={{ color: token.textMuted, flex: '0 0 auto' }} />
                            <span style={{ color: token.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={busy}
                            title={isLocked ? t('git.newSessionForBranch') : t('git.checkoutBranch')}
                            onClick={() => {
                              // Remote branch format origin/foo -> local foo
                              const localName = b.name.replace(/^[^/]+\//, '')
                              handleCheckout(localName)
                            }}
                            style={{
                              ...secondaryBtnStyle,
                              cursor: 'pointer',
                            }}
                          >
                            {isLocked ? t('git.newSessionForBranch') : t('git.checkoutBranch')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB: WORKTREES ===================== */}
          {tab === 'worktrees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewWorktree(!showNewWorktree)}
                  style={showNewWorktree ? secondaryBtnStyle : primaryBtnStyle}
                >
                  <PlusIcon size={13} />
                  <span>{t('git.createWorktree')}</span>
                </button>
              </div>

              {/* Create worktree inline form */}
              {showNewWorktree && (
                <form
                  onSubmit={handleCreateWorktree}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.08))',
                    border: `1px solid ${token.border}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: token.text }}>
                    {t('git.createWorktree')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.branchName')}</label>
                    <input
                      type="text"
                      placeholder="e.g. feature-v2"
                      value={newWorktreeBranch}
                      onChange={e => handleBranchChangeName(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${token.border}`,
                        background: 'var(--dsw-alias-bg-layer-1, transparent)',
                        color: token.text,
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, color: token.textMuted }}>{t('git.worktreePath')}</label>
                    <input
                      type="text"
                      placeholder={`../${repoName}-feature`}
                      value={newWorktreePath}
                      required
                      onChange={e => setNewWorktreePath(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${token.border}`,
                        background: 'var(--dsw-alias-bg-layer-1, transparent)',
                        color: token.text,
                        fontSize: 12.5,
                      }}
                    />
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: token.text, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newWorktreeRegisterDsh}
                      onChange={e => setNewWorktreeRegisterDsh(e.target.checked)}
                    />
                    <span>{t('git.worktreeAutoRegister')}</span>
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => setShowNewWorktree(false)} style={secondaryBtnStyle}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={busy || !newWorktreePath.trim()} style={primaryBtnStyle}>
                      {t('git.createWorktree')}
                    </button>
                  </div>
                </form>
              )}

              {/* Worktree List */}
              <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(worktreesRes.data?.worktrees ?? []).map(wt => (
                  <div
                    key={wt.path}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: 10,
                      borderRadius: 8,
                      background: wt.isCurrent
                        ? 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.12))'
                        : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.04))',
                      border: `1px solid ${wt.isCurrent ? 'var(--dsw-alias-state-business-primary, #2563eb)' : token.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <FolderIcon size={15} style={{ color: 'var(--dsw-alias-state-business-primary, #3b82f6)', flex: '0 0 auto' }} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: token.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {wt.branch || (wt.head ? t('git.detached', { sha: wt.head.slice(0, 7) }) : 'Worktree')}
                        </span>
                        {wt.isMain && (
                          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: 'var(--dsw-alias-bg-layer-3, rgba(125, 125, 125, 0.15))', color: token.textMuted, flex: '0 0 auto' }}>
                            {t('git.worktreeMain')}
                          </span>
                        )}
                        {wt.isWorkspace && (
                          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: 'rgba(34, 197, 94, 0.15)', color: token.success, flex: '0 0 auto' }}>
                            DSH Workspace
                          </span>
                        )}
                        {wt.isCurrent && (
                          <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: 'var(--dsw-alias-state-business-primary, #2563eb)', color: '#ffffff', flex: '0 0 auto' }}>
                            {t('git.currentBranch')}
                          </span>
                        )}
                      </div>

                      {/* External editor launcher and switch workspace */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
                        {wt.isWorkspace && wt.workspaceId && !wt.isCurrent && (
                          <button
                            type="button"
                            title={document.documentElement.lang.startsWith('zh') ? '切换到此工作空间开启会话' : 'Switch to this workspace'}
                            onClick={async () => {
                              try {
                                const workspaces = getClientContext()?.get('workspaces') as any
                                if (workspaces?.connectWorkspace && wt.workspaceId) {
                                  await workspaces.connectWorkspace(wt.workspaceId)
                                  props.onClose()
                                }
                              } catch (err: unknown) {
                                setActionError(err instanceof Error ? err.message : String(err))
                              }
                            }}
                            style={{
                              ...primaryBtnStyle,
                              padding: '3px 8px',
                              fontSize: 11,
                              height: 25,
                              marginRight: 2,
                            }}
                          >
                            {document.documentElement.lang.startsWith('zh') ? '切换工作区' : 'Switch'}
                          </button>
                        )}
                        <button
                          type="button"
                          title={t('explorer.openWith.explorer')}
                          onClick={() => handleOpenEditor(wt.path, 'explorer')}
                          style={{ ...secondaryBtnStyle, padding: '4px 8px' }}
                        >
                          <FolderIcon size={13} />
                        </button>
                        <button
                          type="button"
                          title={t('explorer.openWith.vscode')}
                          onClick={() => handleOpenEditor(wt.path, 'vscode')}
                          style={{ ...secondaryBtnStyle, padding: '4px 8px' }}
                        >
                          <VscodeIcon size={13} />
                        </button>
                        <button
                          type="button"
                          title={t('explorer.openWith.idea')}
                          onClick={() => handleOpenEditor(wt.path, 'idea')}
                          style={{ ...secondaryBtnStyle, padding: '4px 8px' }}
                        >
                          <IdeaIcon size={13} />
                        </button>
                        {!wt.isMain && !wt.isCurrent && (
                          <button
                            type="button"
                            disabled={busy}
                            title={t('git.removeWorktree')}
                            onClick={() => setConfirmDeleteWorktree(wt.path)}
                            style={{
                              ...secondaryBtnStyle,
                              padding: '4px 8px',
                              color: 'var(--dsw-alias-state-danger, #ef4444)',
                              borderColor: 'rgba(239, 68, 68, 0.25)',
                            }}
                          >
                            <CloseIcon size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: token.textMuted, fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wt.path}
                    </div>

                    {/* Confirm deletion inline prompt */}
                    {confirmDeleteWorktree === wt.path && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: token.danger }}>
                          {t('git.removeWorktreeConfirm', { path: wt.path })}
                        </span>
                        <div style={{ display: 'flex', gap: 6, flex: '0 0 auto' }}>
                          <button type="button" onClick={() => setConfirmDeleteWorktree(null)} style={secondaryBtnStyle}>
                            {t('common.cancel')}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleRemoveWorktree(wt.path)}
                            style={{
                              ...buttonStyle,
                              padding: '4px 10px',
                              fontSize: 12,
                              borderRadius: 6,
                              background: 'var(--dsw-alias-state-danger, #ef4444)',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {t('git.removeWorktree')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toastText && (
        <Toast text={toastText} onDone={() => setToastText(null)} />
      )}
    </>
  )
}
