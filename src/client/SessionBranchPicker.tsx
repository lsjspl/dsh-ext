import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { token } from './ui.tsx'
import { useT } from './use-locale.ts'
import { GitIcon, LockIcon, ChevronIcon } from './icons.tsx'
import { useResource } from './use-resource.ts'
import { BranchWorktreeModal } from './BranchWorktreeModal.tsx'
import { useActiveWorkspace } from './use-workspace.ts'
import { useClientConfig } from './use-client-config.ts'
import type { SessionBindingResult, ExplorerStatus } from '../shared/api-contract.ts'

export function SessionBranchPicker(props: {
  sessionId?: string
  workspace?: string
  onBranchBound?: (branch: string) => void
}) {
  const t = useT()
  const config = useClientConfig()
  const [modalOpen, setModalOpen] = useState(false)
  const activeWorkspace = useActiveWorkspace(undefined)
  const workspaceRoot = props.workspace || activeWorkspace

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

  // Container on the Hero page (top row where `📁 workspace ˅` lives)
  const [heroRowEl, setHeroRowEl] = useState<Element | null>(null)

  useEffect(() => {
    const locateHeroRow = () => {
      const wsChip = document.querySelector('button[aria-label*="workspace" i]')
        || document.querySelector('[aria-label="Choose workspace"]')
      const row = wsChip?.parentElement || document.querySelector('[class*="heroWorkspaceRow"]')
      setHeroRowEl(row || null)
    }

    locateHeroRow()
    const timer = setInterval(locateHeroRow, 500)
    return () => clearInterval(timer)
  }, [status.data?.root, workspaceRoot])

  if (config?.git.enabled !== true) return null
  if (!status.data?.isRepository) return null

  const isLocked = binding.data?.binding?.locked === true
  const currentBranch = binding.data?.binding?.branch || status.data.branch || 'main'
  const ahead = status.data.ahead ?? 0
  const behind = status.data.behind ?? 0

  return (
    <>
      {/* 1. Hero page companion chip: rendered directly next to `📁 workspace ˅` on the new-session screen */}
      {heroRowEl && createPortal(
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title={isLocked ? `${t('git.lockedSession')} (${currentBranch})` : `${t('git.branches')} / ${t('git.worktrees')}: ${currentBranch}`}
          data-dsh-plugin="dsh-ext"
          data-dsh-part="hero-git-chip"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 12px',
            borderRadius: 16,
            background: 'var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.08))',
            border: `1px solid ${isLocked ? 'rgba(234, 179, 8, 0.45)' : 'var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.15))'}`,
            color: 'var(--dsw-alias-label-primary, inherit)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 120ms ease',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            marginLeft: 4,
          }}
        >
          <GitIcon size={14} style={{ color: isLocked ? 'var(--dsw-alias-state-warning, #eab308)' : 'inherit' }} />
          {isLocked && <LockIcon size={11} style={{ color: 'var(--dsw-alias-state-warning, #eab308)' }} />}
          <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentBranch}
          </span>
          {ahead > 0 && <span style={{ color: token.success, fontSize: 11 }}>↑{ahead}</span>}
          {behind > 0 && <span style={{ color: token.warn, fontSize: 11 }}>↓{behind}</span>}
          <ChevronIcon size={11} open={modalOpen} />
        </button>,
        heroRowEl
      )}

      {/* 2. Composer bottom tool row button (beside Auto-Review pill in conversation.input.left) */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title={isLocked ? `${t('git.lockedSession')} (${currentBranch})` : `${t('git.currentBranch')}: ${currentBranch} (${t('git.branches')})`}
        data-dsh-plugin="dsh-ext"
        data-dsh-part="composer-git-chip"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          height: 28,
          padding: '0 8px',
          borderRadius: 6,
          background: isLocked ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
          border: `1px solid ${isLocked ? 'rgba(234, 179, 8, 0.4)' : token.border}`,
          color: token.text,
          fontSize: 12,
          fontFamily: 'ui-monospace, monospace',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
      >
        <GitIcon size={13} style={{ color: isLocked ? 'var(--dsw-alias-state-warning, #eab308)' : 'inherit' }} />
        {isLocked && <LockIcon size={11} style={{ color: 'var(--dsw-alias-state-warning, #eab308)' }} />}
        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {currentBranch}
        </span>
        {ahead > 0 && <span style={{ color: token.success, fontSize: 11 }}>↑{ahead}</span>}
        {behind > 0 && <span style={{ color: token.warn, fontSize: 11 }}>↓{behind}</span>}
        <ChevronIcon size={10} open={modalOpen} />
      </button>

      {/* 3. Branch & Worktree Management Modal */}
      <BranchWorktreeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workspaceRoot={status.data.root || workspaceRoot}
        sessionId={props.sessionId}
        onBranchSwitched={(b) => {
          status.reload()
          binding.reload?.()
          props.onBranchBound?.(b)
        }}
      />
    </>
  )
}
