import type { Context } from '@deepseek-ai/cordis'
import { readClientConfig } from './use-client-config.ts'
import { getActiveWorkspaceRoot, setActiveWorkspaceRoot } from './use-workspace.ts'
import { getPanelSession, setPanelOpen } from './panel-state.ts'
import { currentPanelScope, openPanelTab } from './tabs.ts'

/**
 * File tools whose summary argument is known to be a file path.
 */
const FILE_TOOL_NAMES = new Set([
  'write',
  'read',
  'edit',
  'write_to_file',
  'read_file',
  'edit_file',
  'create_file',
  'new_file',
  'save_file',
  'patch_file',
  'str_replace_editor',
  'str-replace-editor',
  'view_file',
  'replace_file_content',
])

function normalizePath(path: string): string {
  let p = path.trim().replace(/^['"`]|['"`]$/g, '').trim().replace(/\\/g, '/')
  if (p.startsWith('file:///')) p = p.slice(8)
  else if (p.startsWith('file://')) p = p.slice(7)
  p = p.replace(/^\/([a-zA-Z]:)/, '$1')
  return p
}

interface WorkspaceService {
  openPath?: (path: string) => Promise<void>
  list?: {
    getSnapshot?: () => {
      recentWorkspaceId?: string
      items?: readonly { workspaceId: string; path: string }[]
    }
  }
}

let wsServiceRef: WorkspaceService | undefined

function resolveActiveWorkspace(): string | undefined {
  const current = getActiveWorkspaceRoot()
  if (current) return current

  if (wsServiceRef?.list?.getSnapshot) {
    const snap = wsServiceRef.list.getSnapshot()
    const recent = snap?.recentWorkspaceId
    const match = recent ? snap?.items?.find(i => i.workspaceId === recent) : undefined
    const path = (match ?? snap?.items?.[0])?.path
    if (path) {
      setActiveWorkspaceRoot(path)
      return path
    }
  }
  return undefined
}

/**
 * Try to open a file path in the side panel's editor tab.
 * Returns true if the file was handled and the panel opened.
 */
export function tryOpenFileInPanel(filePath: string): boolean {
  if (!filePath) return false

  const config = readClientConfig()
  if (config?.explorer?.enabled === false) return false
  if (config?.explorer?.openLinksInPanel === false) return false

  let clean = normalizePath(filePath)
  const ws = resolveActiveWorkspace()
  const session = getPanelSession()

  // If active workspace is known and target path is inside it, strip the workspace prefix
  if (ws) {
    const cleanWs = normalizePath(ws).replace(/\/+$/, '')
    if (clean.toLowerCase().startsWith(cleanWs.toLowerCase() + '/')) {
      clean = clean.slice(cleanWs.length + 1)
    }
  }

  const scope = currentPanelScope() ?? ws ?? (session ? `session:${session}` : 'unscoped')
  openPanelTab(scope, 'editor', clean)
  setPanelOpen(true)
  return true
}

/**
 * Test if a tool name and summary text indicate a file path.
 */
function isFileToolOrPath(title: string | undefined, text: string): boolean {
  if (!text) return false
  const trimmed = text.trim().replace(/^['"`]|['"`]$/g, '').trim()
  if (trimmed.length === 0 || trimmed.length > 260 || trimmed.includes('\n')) return false

  const t = title?.toLowerCase()
  if (t && FILE_TOOL_NAMES.has(t)) {
    // If the tool is a known file tool, the summary is the target file
    return true
  }

  // File path test: allows Chinese/unicode characters, dots, slashes, valid filename chars
  return /^[^\s:*?"<>|]+\.[a-zA-Z0-9_-]+$/.test(trimmed)
}

/**
 * Find the summary element and title in a tool call card row, if target is inside one.
 */
function findToolCardParts(target: HTMLElement | null): { summaryEl: HTMLElement; title: string } | null {
  if (!target) return null
  const summaryEl = target.closest<HTMLElement>('span[class*="_summary"]')
  if (!summaryEl) return null

  const row = summaryEl.closest<HTMLElement>('div[class*="_row"]')
  if (!row) return null

  const titleEl = row.querySelector<HTMLElement>('div[class*="_title"]')
  const title = titleEl?.textContent?.trim() ?? ''
  return { summaryEl, title }
}

/**
 * Find a markdown file mention button if target is inside one.
 */
function findMentionButton(target: HTMLElement | null): HTMLElement | null {
  if (!target) return null
  return target.closest<HTMLElement>('button[class*="fileMention"], button[class*="file-mention"]')
}

/**
 * Install DOM listeners to enhance tool call headers (e.g. `Write · 刀奴.txt`)
 * and chat markdown file mentions:
 * - Hover shows underline & pointer cursor with tooltip
 * - Click directly opens the file in the side panel editor
 */
function installToolSummaryLinkEnhancer(): void {
  // 1. Mouse hover styling
  document.addEventListener(
    'mouseover',
    (event) => {
      const config = readClientConfig()
      if (config?.explorer?.enabled === false || config?.explorer?.openLinksInPanel === false) return

      const target = event.target as HTMLElement | null
      const parts = findToolCardParts(target)
      if (parts) {
        const text = parts.summaryEl.textContent?.trim() ?? ''
        if (isFileToolOrPath(parts.title, text)) {
          parts.summaryEl.style.cursor = 'pointer'
          parts.summaryEl.style.textDecoration = 'underline'
          parts.summaryEl.style.color = 'var(--dsw-alias-state-business-primary, #2563eb)'
          if (!parts.summaryEl.title) {
            parts.summaryEl.title = `在侧边栏打开 ${text}`
          }
        }
        return
      }

      const mentionBtn = findMentionButton(target)
      if (mentionBtn) {
        mentionBtn.style.cursor = 'pointer'
      }
    },
    true,
  )

  document.addEventListener(
    'mouseout',
    (event) => {
      const parts = findToolCardParts(event.target as HTMLElement | null)
      if (!parts) return

      parts.summaryEl.style.cursor = ''
      parts.summaryEl.style.textDecoration = ''
      parts.summaryEl.style.color = ''
    },
    true,
  )

  // 2. Click handler in capture phase to open file before disclosure toggle
  document.addEventListener(
    'click',
    (event) => {
      const config = readClientConfig()
      if (config?.explorer?.enabled === false || config?.explorer?.openLinksInPanel === false) return

      const target = event.target as HTMLElement | null

      // Check tool card summary click
      const parts = findToolCardParts(target)
      if (parts) {
        const text = parts.summaryEl.textContent?.trim() ?? ''
        if (isFileToolOrPath(parts.title, text)) {
          event.stopPropagation()
          event.preventDefault()
          tryOpenFileInPanel(text)
          return
        }
      }

      // Check file mention button click in markdown
      const mentionBtn = findMentionButton(target)
      if (mentionBtn) {
        const targetPath = mentionBtn.getAttribute('title') || mentionBtn.textContent?.trim() || ''
        if (targetPath) {
          event.stopPropagation()
          event.preventDefault()
          tryOpenFileInPanel(targetPath)
        }
      }
    },
    true,
  )
}

/**
 * Install the workspaces.openPath interceptor and tool card summary click handler.
 */
export function installFileLinkInterceptor(ctx: Context): void {
  // 1. Intercept workspaces.openPath
  ctx.inject(['workspaces'], (scope) => {
    const wsService = (scope as unknown as { workspaces?: WorkspaceService }).workspaces
    if (!wsService || typeof wsService.openPath !== 'function') return

    wsServiceRef = wsService

    const originalOpenPath = wsService.openPath.bind(wsService)
    wsService.openPath = async (filePath: string) => {
      try {
        if (tryOpenFileInPanel(filePath)) {
          return
        }
      } catch (err) {
        console.warn('[dsh-ext] Failed to open file in panel, falling back to OS openPath:', err)
      }
      return originalOpenPath(filePath)
    }
  })

  // 2. Install tool card summary and file mention link enhancer
  installToolSummaryLinkEnhancer()
}

