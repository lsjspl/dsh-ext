import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import { readFile, rm } from 'node:fs/promises'
import { basename, isAbsolute, join, relative, resolve } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import { git, gitBranchState, repositoryRoot } from '../git.ts'
import type { Config, GitConfig } from '../config.ts'
import { resolveRoot, containedPath } from './explorer.ts'
import type {
  GenerateCommitResult,
  GitBranchesResult,
  GitBranchInfo,
  GitCommitResult,
  GitDiscardResult,
  GitPushResult,
  GitStageResult,
  GitWorktreeInfo,
  GitWorktreesResult,
  SessionBindingResult,
  SessionGitBinding,
} from '../shared/api-contract.ts'

/**
 * Safely cast unknown body to an object dictionary.
 */
function asRecord(val: unknown): Record<string, unknown> {
  return (typeof val === 'object' && val !== null) ? (val as Record<string, unknown>) : {}
}

/**
 * Normalize paths for cross-platform consistency, especially Windows drive letter case
 * and directory separator differences.
 */
export function normalizeGitPath(p: string): string {
  const resolved = resolve(p)
  if (process.platform === 'win32' && resolved.length > 0 && /^[A-Za-z]:[\\/]/.test(resolved)) {
    const drive = resolved[0]?.toLowerCase() ?? ''
    return drive + resolved.slice(1).replace(/\\/g, '/')
  }
  return resolved.replace(/\\/g, '/')
}

/**
 * Session-Git-Binding Persistent Store.
 * Records the bound branch & worktree for each session.
 */
export class SessionBindingStore {
  private bindings = new Map<string, SessionGitBinding>()
  private loaded = false

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    if (this.loaded) return
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.sessionId === 'string' && typeof item.branch === 'string') {
            this.bindings.set(item.sessionId, {
              sessionId: item.sessionId,
              repoRoot: normalizeGitPath(item.repoRoot ?? ''),
              branch: item.branch,
              worktreePath: item.worktreePath ? normalizeGitPath(item.worktreePath) : undefined,
              locked: item.locked === true,
              createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
            })
          }
        }
      }
    } catch {
      // Missing or corrupt file starts with an empty store
    } finally {
      this.loaded = true
    }
  }

  private async persist(): Promise<void> {
    const list = Array.from(this.bindings.values())
    await writeFileAtomic(this.filePath, JSON.stringify(list, null, 2), { mode: 0o600, dirMode: 0o700 })
  }

  async get(sessionId: string): Promise<SessionGitBinding | undefined> {
    await this.load()
    return this.bindings.get(sessionId)
  }

  async set(binding: SessionGitBinding): Promise<void> {
    await this.load()
    this.bindings.set(binding.sessionId, {
      ...binding,
      repoRoot: normalizeGitPath(binding.repoRoot),
      worktreePath: binding.worktreePath ? normalizeGitPath(binding.worktreePath) : undefined,
    })
    await this.persist()
  }

  async countByBranch(repoRoot: string): Promise<Map<string, number>> {
    await this.load()
    const counts = new Map<string, number>()
    const targetRoot = normalizeGitPath(repoRoot)
    for (const b of this.bindings.values()) {
      if (b.repoRoot === targetRoot) {
        counts.set(b.branch, (counts.get(b.branch) ?? 0) + 1)
      }
    }
    return counts
  }

  async findByBranch(repoRoot: string, branch: string): Promise<SessionGitBinding[]> {
    await this.load()
    const targetRoot = normalizeGitPath(repoRoot)
    return Array.from(this.bindings.values()).filter(
      b => b.repoRoot === targetRoot && b.branch === branch,
    )
  }
}

/**
 * List branches in the repository with rich status metadata.
 */
async function listBranches(
  root: string,
  bindingStore: SessionBindingStore,
  signal?: AbortSignal,
): Promise<GitBranchesResult> {
  const branchState = await gitBranchState(root, signal)
  if (branchState.isUnborn) {
    return {
      current: branchState.branch ?? 'main',
      isDetached: false,
      isUnborn: true,
      local: [],
      remote: [],
    }
  }

  // Format: HEAD indicator | full refname | short refname | upstream short | upstream track | commit short | subject
  const format = '%(HEAD)|%(refname)|%(refname:short)|%(upstream:short)|%(upstream:track)|%(objectname:short)|%(subject)'
  const result = await git(['branch', '-a', `--format=${format}`], { cwd: root, signal })
  if (!result.ok) {
    throw new ApiError(500, `git branch failed: ${result.stderr}`)
  }

  const sessionCounts = await bindingStore.countByBranch(root)
  const local: GitBranchInfo[] = []
  const remote: GitBranchInfo[] = []

  const lines = result.stdout.split('\n').filter(line => line.trim().length > 0)
  for (const line of lines) {
    const parts = line.split('|')
    const headMark = parts[0]?.trim()
    const isHead = headMark === '*'
    const refname = parts[1]?.trim() ?? ''
    const shortName = parts[2]?.trim() ?? ''
    const upstream = parts[3]?.trim() || undefined
    const track = parts[4]?.trim() ?? ''
    const commit = parts[5]?.trim() ?? ''
    const subject = parts.slice(6).join('|').trim()

    let ahead = 0
    let behind = 0
    if (track.length > 0) {
      const aheadMatch = /ahead\s+(\d+)/.exec(track)
      if (aheadMatch && aheadMatch[1]) ahead = parseInt(aheadMatch[1], 10)
      const behindMatch = /behind\s+(\d+)/.exec(track)
      if (behindMatch && behindMatch[1]) behind = parseInt(behindMatch[1], 10)
    }

    const isRemote = refname.startsWith('refs/remotes/')
    const info: GitBranchInfo = {
      name: shortName,
      isCurrent: isHead,
      isRemote,
      commit,
      subject,
      upstream,
      ahead: ahead > 0 ? ahead : undefined,
      behind: behind > 0 ? behind : undefined,
      boundSessionCount: sessionCounts.get(shortName) ?? 0,
    }

    if (isRemote) {
      remote.push(info)
    } else {
      local.push(info)
    }
  }

  return {
    current: branchState.branch,
    isDetached: branchState.isDetached,
    isUnborn: false,
    local,
    remote,
  }
}

/**
 * List all Git worktrees.
 */
async function listWorktrees(
  ctx: Context,
  root: string,
  signal?: AbortSignal,
): Promise<GitWorktreesResult> {
  const result = await git(['worktree', 'list', '--porcelain'], { cwd: root, signal })
  if (!result.ok) {
    throw new ApiError(500, `git worktree list failed: ${result.stderr}`)
  }

  const dshWorkspaces = ctx.get('workspaceRegistry')?.list() ?? []
  const knownRoots = new Set(dshWorkspaces.map(ws => normalizeGitPath(ws.path)))
  const normalizedCurrentRoot = normalizeGitPath(root)

  const entries = result.stdout.split(/\r?\n\r?\n/).filter(block => block.trim().length > 0)
  const worktrees: GitWorktreeInfo[] = []

  let index = 0
  for (const block of entries) {
    const lines = block.split(/\r?\n/)
    let wtPath = ''
    let head = ''
    let branch: string | undefined
    let bare = false
    let detached = false

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        wtPath = line.slice(9).trim()
      } else if (line.startsWith('HEAD ')) {
        head = line.slice(5).trim()
      } else if (line.startsWith('branch ')) {
        const fullBranch = line.slice(7).trim()
        branch = fullBranch.replace(/^refs\/heads\//, '')
      } else if (line === 'bare') {
        bare = true
      } else if (line === 'detached') {
        detached = true
      }
    }

    if (wtPath.length > 0) {
      const normPath = normalizeGitPath(wtPath)
      const wsMatch = dshWorkspaces.find(ws => normalizeGitPath(ws.path) === normPath)
      worktrees.push({
        path: wtPath,
        head,
        branch,
        bare,
        detached,
        isCurrent: normPath === normalizedCurrentRoot,
        isWorkspace: Boolean(wsMatch) || knownRoots.has(normPath),
        isMain: index === 0,
        workspaceId: wsMatch ? String(wsMatch.id) : undefined,
      })
    }
    index++
  }

  return { worktrees }
}

/**
 * Clean AI commit message by stripping markdown code blocks, quotes, and conversational filler.
 */
export function sanitizeCommitMessage(text: string): { fullMessage: string; title: string; body: string } {
  let cleaned = text.trim()

  // Strip markdown code fences e.g. ```git ... ``` or inline backticks `...`
  cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\r?\n/, '')
  cleaned = cleaned.replace(/\r?\n```\s*$/, '')
  cleaned = cleaned.replace(/^`+|`+$/g, '')
  cleaned = cleaned.trim()

  // Strip conversational preambles or lead-in text
  cleaned = cleaned.replace(/^(?:["']|commit message:?|here is the commit message:?|(?:以下是(?:生成的)?)?(?:git\s*)?提交(?:信息|说明)[：:]?)\s*/i, '')
  cleaned = cleaned.replace(/["']\s*$/, '')
  cleaned = cleaned.trim()

  const lines = cleaned.split(/\r?\n/)
  const firstLine = lines[0]
  const title: string = typeof firstLine === 'string' ? firstLine.trim() : ''
  const body = lines.slice(1).join('\n').trim()

  return {
    fullMessage: cleaned,
    title,
    body,
  }
}

/**
 * If a reasoning model (like R1) output only reasoning deltas or finished in reasoning,
 * extract the commit message from the reasoning text.
 */
export function extractCommitFromReasoning(reasoning: string): string {
  const trimmed = reasoning.trim()
  // Look for code blocks inside reasoning, e.g. ```git ... ```
  const codeBlockMatch = trimmed.match(/```(?:git|diff|commit|text)?\s*\r?\n([\s\S]*?)\r?\n```/)
  if (codeBlockMatch && codeBlockMatch[1]?.trim()) {
    return codeBlockMatch[1].trim()
  }

  // Look for conventional commit pattern from bottom up
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const conventionalRegex = /^(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\([a-zA-Z0-9_.-]+\))?:\s*.+/i
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!
    if (conventionalRegex.test(line)) {
      return lines.slice(i).join('\n')
    }
  }

  // Fallback to the last non-empty paragraph
  const paragraphs = trimmed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  return paragraphs[paragraphs.length - 1] ?? trimmed
}

/**
 * Smart diff budgeter and compressor:
 * 1. Limits each file's diff to `maxPerFileChars` so single large files don't starve other files.
 * 2. Limits overall diff to `maxTotalChars` so LLM tokens and latency remain strictly bounded.
 * 3. Informs the model about any truncated files so it knows the full scope.
 */
export function prepareOptimizedDiff(
  rawDiff: string,
  maxTotalChars = 16000,
  maxPerFileChars = 1500,
): { diff: string; truncatedFileCount: number; omittedFileCount: number; totalFileCount: number } {
  const trimmed = rawDiff.trim()
  if (!trimmed) {
    return { diff: '', truncatedFileCount: 0, omittedFileCount: 0, totalFileCount: 0 }
  }

  // Split by git diff file headers
  const parts = trimmed.split(/(?=^diff --git )/m).filter(p => p.trim().length > 0)
  const totalFileCount = parts.length

  let accumulated = ''
  let truncatedFileCount = 0
  let omittedFileCount = 0

  for (let i = 0; i < parts.length; i++) {
    const fileDiff = parts[i]!
    let fileSnippet = fileDiff

    if (fileSnippet.length > maxPerFileChars) {
      fileSnippet = `${fileSnippet.slice(0, maxPerFileChars)}\n... [diff truncated for this file]`
      truncatedFileCount++
    }

    if (accumulated.length + fileSnippet.length > maxTotalChars) {
      omittedFileCount = parts.length - i
      break
    }

    accumulated += (accumulated.length > 0 ? '\n\n' : '') + fileSnippet
  }

  if (omittedFileCount > 0) {
    accumulated += `\n\n[... and ${omittedFileCount} more file(s) omitted from detailed diff. Refer to Changed Files Summary above for complete file list.]`
  }

  return {
    diff: accumulated,
    truncatedFileCount,
    omittedFileCount,
    totalFileCount,
  }
}

/**
 * Compact stat summary for repositories with massive number of changed files.
 */
export function limitStatText(statText: string, maxLines = 60): string {
  const trimmed = statText.trim()
  if (!trimmed) return ''
  const lines = trimmed.split(/\r?\n/)
  if (lines.length <= maxLines + 5) return trimmed

  const topLines = lines.slice(0, maxLines)
  const summaryLine = lines[lines.length - 1] ?? ''
  const omitted = lines.length - maxLines - 1

  return `${topLines.join('\n')}\n... [${omitted} more files omitted from summary list]\n${summaryLine}`
}

/**
 * Generate a clean, effective Conventional Commit prompt.
 */
function buildCommitPrompt(
  diffText: string,
  statText: string,
  style: string,
  lang: string,
): { system: string; user: string } {
  const isEn = lang === 'en'

  let formatInstruction = ''
  if (style === 'simple') {
    formatInstruction = isEn
      ? 'Output ONLY a single concise summary line under 50 characters (e.g. feat: ... or fix: ...).'
      : '仅输出单行简要摘要（50 字符以内，如 feat: ... 或 fix: ...）。'
  } else if (style === 'detailed') {
    formatInstruction = isEn
      ? `Follow this structure:
<type>(<scope>): <summary>

- <detailed explanation of key change 1>
- <detailed explanation of key change 2>`
      : `遵循以下格式结构：
<type>(<scope>): <简要总结>

- <详细说明关键改动点 1>
- <详细说明关键改动点 2>`
  } else {
    // conventional (default)
    formatInstruction = isEn
      ? `Follow this structure:
<type>(<scope>): <summary>

[Optional brief bullet points if there are multiple key changes]`
      : `遵循以下格式结构：
<type>(<scope>): <简要总结>

[若有多项重要改动，空一行后附带 2-3 条要点说明]`
  }

  const system = isEn
    ? `You are an expert software developer and Git commit specialist.
Analyze the provided staged code changes and generate an accurate, professional Git commit message.

Rules:
1. Follow Conventional Commits format with types: feat, fix, refactor, docs, style, perf, test, chore, build.
2. ${formatInstruction}
3. Output ONLY the raw commit message directly without markdown code blocks (\`\`\`), conversational intros, or explanations.`
    : `你是一名资深的研发工程师与 Git 提交规范专家。
请根据提供的代码改动总结核心意图，生成一条专业、准确且符合规范的 Git Commit 提交说明。

规范要求：
1. 必须遵循 Conventional Commits 规范，类型与作用域保持英文（常用类型：feat, fix, refactor, docs, style, perf, test, chore, build 等）。
2. 提交说明的主体描述使用中文（简体中文）。
3. ${formatInstruction}
4. 严禁输出任何客套寒暄、解释说明或 markdown 代码块（\`\`\`）包裹，直接输出最终的提交说明文本内容。`

  let user = isEn
    ? `Please summarize the following staged code changes and generate a commit message:\n\n`
    : `请总结以下暂存区代码变动，并生成一条规范的 Git 提交说明：\n\n`

  if (statText.trim().length > 0) {
    user += isEn
      ? `Changed Files Summary:\n${statText}\n\n`
      : `变更文件概览：\n${statText}\n\n`
  }

  user += isEn
    ? `Staged Git Diff:\n\`\`\`diff\n${diffText}\n\`\`\`\n\nCommit Message:`
    : `暂存区代码变动（Git Diff）：\n\`\`\`diff\n${diffText}\n\`\`\`\n\n请直接输出提交说明：`

  return { system, user }
}

/**
 * Mount all Git Operations routes onto the Cordis API router.
 */
export function mountGitOps(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
  bindingFilePath: string,
): () => void {
  const bindingStore = new SessionBindingStore(bindingFilePath)

  async function isSessionBlank(sessionId?: string, signal?: AbortSignal): Promise<boolean> {
    if (!sessionId) return true
    try {
      const live = ctx.get('sessions')?.get(sessionId as never) as {
        blank?: boolean
        turns?: unknown[]
        events?: unknown[]
      } | undefined
      if (live) {
        if (live.blank === true) return true
        if (Array.isArray(live.turns) && live.turns.length > 0) return false
        if (Array.isArray(live.events) && live.events.length > 0) return false
      }
      const persistence = ctx.get('sessionPersistence')
      if (persistence) {
        const inspection = await persistence.inspect(sessionId as never, signal)
        if (inspection && Array.isArray(inspection.events) && inspection.events.length > 0) {
          return false
        }
      }
    } catch {
      return true
    }
    return true
  }

  const handleBinding: ApiHandler = async ({ query, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const sessionId = query.get('session')
    const { root } = await resolveRoot(ctx, query.get('workspace'), sessionId, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) {
      return { isRepository: false } as SessionBindingResult
    }

    const branchState = await gitBranchState(repo, controller.signal)
    const isBlank = sessionId ? await isSessionBlank(sessionId, controller.signal) : true
    let binding = sessionId ? await bindingStore.get(sessionId) : undefined
    if (sessionId) {
      if (!binding && branchState.branch) {
        binding = {
          sessionId,
          repoRoot: repo,
          branch: branchState.branch,
          locked: !isBlank,
          createdAt: Date.now(),
        }
        await bindingStore.set(binding)
      } else if (binding) {
        if (isBlank && binding.locked) {
          binding = { ...binding, locked: false }
          await bindingStore.set(binding)
        } else if (!isBlank && !binding.locked) {
          binding = { ...binding, locked: true }
          await bindingStore.set(binding)
        }
      }
    }

    return {
      isRepository: true,
      binding,
      currentBranch: branchState.branch,
      isDetached: branchState.isDetached,
      isUnborn: branchState.isUnborn,
    } as SessionBindingResult
  }

  const handleBind: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const sessionId = typeof data.session === 'string' ? data.session : undefined
    if (!sessionId) throw new ApiError(400, 'session ID is required')

    const { root } = await resolveRoot(ctx, typeof data.workspace === 'string' ? data.workspace : null, sessionId, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const branch = typeof data.branch === 'string' ? data.branch.trim() : ''
    if (!branch) throw new ApiError(400, 'branch name is required')

    // Check if session is already locked
    const isBlank = await isSessionBlank(sessionId, controller.signal)
    const existing = await bindingStore.get(sessionId)
    if (!isBlank && existing?.locked && config().git.sessionBinding === 'strict' && existing.branch !== branch && data.force !== true) {
      throw new ApiError(403, `当前会话已锁定在分支 [${existing.branch}]，严禁切换。如需在分支 [${branch}] 开发，请开启新会话。`)
    }

    const lockNow = data.lockNow === true
    const worktreePath = typeof data.worktreePath === 'string' ? data.worktreePath : undefined

    // If requested to create branch
    if (data.createBranch === true) {
      const startPoint = typeof data.startPoint === 'string' ? data.startPoint : undefined
      const result = await git(['checkout', '-b', branch, ...(startPoint ? [startPoint] : [])], { cwd: repo, signal: controller.signal })
      if (!result.ok) {
        throw new ApiError(400, `创建分支失败: ${result.stderr}`)
      }
    }

    const newBinding: SessionGitBinding = {
      sessionId,
      repoRoot: repo,
      branch,
      worktreePath,
      locked: !isBlank ? (lockNow || (existing ? existing.locked : false)) : false,
      createdAt: existing?.createdAt ?? Date.now(),
    }

    await bindingStore.set(newBinding)
    return { ok: true, binding: newBinding }
  }

  const handleBranches: ApiHandler = async ({ query, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    return await listBranches(repo, bindingStore, controller.signal)
  }

  const handleBranchCreate: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const name = typeof data.name === 'string' ? data.name.trim() : (typeof data.branch === 'string' ? data.branch.trim() : '')
    if (!name) throw new ApiError(400, 'branch name is required')

    const checkout = data.checkout !== false
    const startPoint = typeof data.startPoint === 'string' ? data.startPoint.trim() : undefined

    const args = checkout
      ? ['checkout', '-b', name, ...(startPoint ? [startPoint] : [])]
      : ['branch', name, ...(startPoint ? [startPoint] : [])]

    const result = await git(args, { cwd: repo, signal: controller.signal })
    if (!result.ok) {
      throw new ApiError(400, `创建分支失败: ${result.stderr}`)
    }

    if (sess && checkout) {
      const existing = await bindingStore.get(sess)
      const isBlank = await isSessionBlank(sess, controller.signal)
      await bindingStore.set({
        sessionId: sess,
        repoRoot: repo,
        branch: name,
        worktreePath: existing?.worktreePath,
        locked: !isBlank,
        createdAt: existing?.createdAt ?? Date.now(),
      })
    }

    return { ok: true, branch: name }
  }

  const handleCheckout: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const sessionId = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : undefined)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const { root } = await resolveRoot(ctx, ws, sessionId, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const branch = typeof data.branch === 'string' ? data.branch.trim() : (typeof data.name === 'string' ? data.name.trim() : '')
    if (!branch) throw new ApiError(400, 'branch name is required')

    // Check session lock: once a session has started conversation, branch switching is locked
    if (sessionId && data.force !== true) {
      const isBlank = await isSessionBlank(sessionId, controller.signal)
      if (!isBlank) {
        const binding = await bindingStore.get(sessionId)
        const currentBranchState = await gitBranchState(repo, controller.signal)
        const lockedBranch = binding?.branch || currentBranchState.branch
        if (lockedBranch && lockedBranch !== branch) {
          throw new ApiError(403, `当前会话已锁定在分支 [${lockedBranch}]，严禁在此会话切换分支。如需在其他分支开发，请开启新会话。`)
        }
      }
    }

    const result = await git(['checkout', branch], { cwd: repo, signal: controller.signal })
    if (!result.ok) {
      if (result.stderr.includes('would be overwritten by checkout')) {
        throw new ApiError(409, '存在未提交的代码修改，与目标分支发生冲突。请先暂存或提交改动后再切换。')
      }
      throw new ApiError(400, `切换分支失败: ${result.stderr}`)
    }

    if (sessionId) {
      const existing = await bindingStore.get(sessionId)
      const isBlank = await isSessionBlank(sessionId, controller.signal)
      await bindingStore.set({
        sessionId,
        repoRoot: repo,
        branch,
        worktreePath: existing?.worktreePath,
        locked: !isBlank,
        createdAt: existing?.createdAt ?? Date.now(),
      })
    }

    return { ok: true, branch }
  }

  const handleWorktrees: ApiHandler = async ({ query, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    return await listWorktrees(ctx, repo, controller.signal)
  }

  const handleWorktreeAdd: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const targetPath = typeof data.path === 'string' ? data.path.trim() : (typeof data.worktreePath === 'string' ? data.worktreePath.trim() : '')
    if (!targetPath) throw new ApiError(400, 'worktree path is required')

    const absoluteTarget = isAbsolute(targetPath) ? resolve(targetPath) : resolve(repo, targetPath)
    const branch = typeof data.branch === 'string' ? data.branch.trim() : (typeof data.name === 'string' ? data.name.trim() : undefined)
    const newBranch = data.newBranch === true

    // Verify mutual exclusion: ensure branch is not checked out in another worktree
    if (branch && !newBranch) {
      const wtList = await listWorktrees(ctx, repo, controller.signal)
      const found = wtList.worktrees.find(w => w.branch === branch)
      if (found) {
        throw new ApiError(409, `分支 [${branch}] 已在工作区 [${found.path}] 中检出。每个分支同时只能存在于一个 Worktree 中。`)
      }
    }

    const args = ['worktree', 'add']
    if (newBranch && branch) {
      args.push('-b', branch)
    }
    args.push(absoluteTarget)
    if (!newBranch && branch) {
      args.push(branch)
    }

    const result = await git(args, { cwd: repo, signal: controller.signal })
    if (!result.ok) {
      throw new ApiError(400, `创建 Worktree 失败: ${result.stderr}`)
    }

    let workspaceId: string | undefined
    const openAsWorkspace = data.openAsWorkspace !== false
    if (openAsWorkspace) {
      try {
        const ws = await ctx.get('workspaceRegistry')?.create(absoluteTarget, basename(absoluteTarget))
        workspaceId = ws ? String(ws.id) : undefined
      } catch (wsErr) {
        ctx.logger('dsh-ext').warn('Failed to auto-register worktree as workspace: %o', wsErr)
      }
    }

    return { ok: true, path: absoluteTarget, branch, workspaceId }
  }

  const handleWorktreeRemove: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const targetPath = typeof data.path === 'string' ? data.path.trim() : (typeof data.worktreePath === 'string' ? data.worktreePath.trim() : '')
    if (!targetPath) throw new ApiError(400, 'target path is required')

    const absoluteTarget = isAbsolute(targetPath) ? resolve(targetPath) : resolve(repo, targetPath)
    const force = data.force === true

    const result = await git(['worktree', 'remove', ...(force ? ['--force'] : []), absoluteTarget], { cwd: repo, signal: controller.signal })
    if (!result.ok) {
      throw new ApiError(400, `移除 Worktree 失败: ${result.stderr}`)
    }

    // Cleanup from workspaceRegistry if registered
    const reg = ctx.get('workspaceRegistry')
    if (reg) {
      const normTarget = normalizeGitPath(absoluteTarget)
      const match = reg.list().find(ws => normalizeGitPath(ws.path) === normTarget)
      if (match) {
        await reg.delete(match.id).catch(() => {})
      }
    }

    return { ok: true }
  }

  const handleRegisterWorkspace: ApiHandler = async ({ body }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const data = asRecord(body)
    const targetPath = typeof data.path === 'string' ? data.path.trim() : ''
    if (!targetPath) throw new ApiError(400, 'worktree path is required')
    const absoluteTarget = resolve(targetPath)
    const reg = ctx.get('workspaceRegistry')
    if (!reg) throw new ApiError(500, 'workspaceRegistry unavailable')
    const normTarget = normalizeGitPath(absoluteTarget)
    const match = reg.list().find(ws => normalizeGitPath(ws.path) === normTarget)
    if (match) {
      return { ok: true, workspaceId: String(match.id) }
    }
    const created = await reg.create(absoluteTarget, basename(absoluteTarget))
    return { ok: true, workspaceId: String(created.id) }
  }

  const handleStage: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const stage = data.stage !== false
    const rawPaths = Array.isArray(data.paths) ? (data.paths as unknown[]) : []
    const paths: string[] = rawPaths.filter((p): p is string => typeof p === 'string' && p.length > 0)

    if (stage) {
      const args = paths.length === 0 ? ['add', '-A'] : ['add', '--', ...paths]
      const result = await git(args, { cwd: repo, signal: controller.signal })
      if (!result.ok) throw new ApiError(400, `暂存文件失败: ${result.stderr}`)
    } else {
      const args = paths.length === 0 ? ['reset', 'HEAD'] : ['reset', 'HEAD', '--', ...paths]
      const result = await git(args, { cwd: repo, signal: controller.signal })
      if (!result.ok) throw new ApiError(400, `取消暂存失败: ${result.stderr}`)
    }

    const statusRes = await git(['status', '--porcelain', '-z'], { cwd: repo, signal: controller.signal })
    let stagedCount = 0
    let unstagedCount = 0
    if (statusRes.ok) {
      const entries = statusRes.stdout.split('\0').filter(e => e.length > 0)
      for (const entry of entries) {
        const indexChar = entry[0]
        const worktreeChar = entry[1]
        if (indexChar !== ' ' && indexChar !== '?') stagedCount++
        if (worktreeChar !== ' ' || indexChar === '?') unstagedCount++
      }
    }

    return { ok: true, stagedCount, unstagedCount } as GitStageResult
  }

  const handleDiscard: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const all = data.all === true
    const rawPaths = Array.isArray(data.paths) ? (data.paths as unknown[]) : []
    const paths: string[] = rawPaths.filter((p): p is string => typeof p === 'string' && p.length > 0)

    if (all || paths.length === 0) {
      // Discard all unstaged changes in the working tree:
      // 1. Revert tracked modified files back to index (staged changes remain intact)
      const checkoutRes = await git(['checkout', '--', '.'], { cwd: repo, signal: controller.signal })
      // 2. Clean all untracked files and directories
      const cleanRes = await git(['clean', '-f', '-d'], { cwd: repo, signal: controller.signal })
      if (!checkoutRes.ok && !cleanRes.ok) {
        throw new ApiError(400, `放弃更改失败: ${checkoutRes.stderr || cleanRes.stderr}`)
      }
    } else {
      // Query git status to distinguish between tracked and untracked files
      const statusRes = await git(['status', '--porcelain', '-z'], { cwd: repo, signal: controller.signal })
      const untrackedSet = new Set<string>()
      if (statusRes.ok) {
        const entries = statusRes.stdout.split('\0').filter(Boolean)
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          if (!entry) continue
          const code = entry.slice(0, 2)
          const p = entry.slice(3)
          if (code === '??' || code === '!!') {
            untrackedSet.add(p)
          }
          if (code[0] === 'R' || code[0] === 'C') {
            i++ // skip rename original path
          }
        }
      }

      const trackedPaths: string[] = []
      const untrackedPaths: string[] = []

      for (const p of paths) {
        let isUntracked = untrackedSet.has(p)
        if (!isUntracked) {
          const prefix = p.endsWith('/') ? p : `${p}/`
          for (const u of untrackedSet) {
            if (u.startsWith(prefix)) {
              isUntracked = true
              break
            }
          }
        }
        if (isUntracked) {
          untrackedPaths.push(p)
        } else {
          trackedPaths.push(p)
        }
      }

      if (trackedPaths.length > 0) {
        const res = await git(['checkout', '--', ...trackedPaths], { cwd: repo, signal: controller.signal })
        if (!res.ok) {
          ctx.logger('dsh-ext').warn('git checkout failed for %o: %s', trackedPaths, res.stderr)
        }
      }

      if (untrackedPaths.length > 0) {
        const res = await git(['clean', '-f', '-d', '--', ...untrackedPaths], { cwd: repo, signal: controller.signal })
        if (!res.ok) {
          ctx.logger('dsh-ext').warn('git clean failed for %o: %s', untrackedPaths, res.stderr)
          for (const up of untrackedPaths) {
            await rm(resolve(repo, up), { recursive: true, force: true }).catch(() => {})
          }
        }
      }
    }

    return { ok: true } as GitDiscardResult
  }

  const handleCommit: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const message = typeof data.message === 'string' ? data.message.trim() : ''
    if (!message) throw new ApiError(400, 'Commit message is required')

    const amend = data.amend === true
    const autoStage = data.autoStage === true || config().git.autoStageAll

    // If nothing is staged and autoStage is on, stage everything first
    if (autoStage) {
      const diffCached = await git(['diff', '--cached', '--quiet'], { cwd: repo, signal: controller.signal })
      if (diffCached.code === 0 && !amend) {
        await git(['add', '-A'], { cwd: repo, signal: controller.signal })
      }
    }

    const args = ['commit', ...(amend ? ['--amend'] : []), '-m', message]
    const result = await git(args, { cwd: repo, signal: controller.signal })
    if (!result.ok) {
      throw new ApiError(400, `提交失败: ${result.stderr || result.stdout}`)
    }

    const rev = await git(['rev-parse', '--short', 'HEAD'], { cwd: repo, signal: controller.signal })
    const hash = rev.ok ? rev.stdout.trim() : ''

    return {
      ok: true,
      commitHash: hash,
      summary: message.split('\n')[0],
      message: result.stdout,
    } as GitCommitResult
  }

  const handlePush: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const gitSettings = config().git
    const remote = typeof data.remote === 'string' ? data.remote.trim() : 'origin'
    const branchState = await gitBranchState(repo, controller.signal)
    const branch = typeof data.branch === 'string' ? data.branch.trim() : branchState.branch

    const setUpstream = data.setUpstream === true || gitSettings.pushAutoSetUpstream
    const args = ['push']
    if (setUpstream && branch) {
      args.push('-u', remote, branch)
    }

    const timeoutMs = (gitSettings.pushTimeoutSeconds || 60) * 1000
    const result = await git(args, { cwd: repo, timeoutMs, signal: controller.signal })

    if (!result.ok) {
      const errText = result.stderr || result.stdout
      if (errText.includes('terminal prompts disabled') || errText.includes('could not read Username') || errText.includes('Authentication failed')) {
        return {
          ok: false,
          needAuth: true,
          message: '推送失败：Git 凭据未就绪（需要终端交互认证）。请在系统终端中运行一次 git push 登录或配置 Git 凭据管理器 (Credential Manager)。',
        } as GitPushResult
      }
      if (errText.includes('fetch first') || errText.includes('non-fast-forward') || errText.includes('Updates were rejected')) {
        return {
          ok: false,
          rejected: true,
          message: '推送被拒绝：远端分支包含您本地尚未拉取的更新。请先在终端拉取并合并 (git pull) 处理冲突后再推送。',
        } as GitPushResult
      }
      throw new ApiError(400, `推送失败: ${errText}`)
    }

    return { ok: true, message: result.stdout || '推送成功' } as GitPushResult
  }

  const handleGenerateCommit: ApiHandler = async ({ body, req }) => {
    if (!config().explorer.enabled || !config().git.enabled) {
      throw new ApiError(404, 'Git operations are switched off')
    }
    const controller = new AbortController()
    req.on('close', () => { controller.abort() })

    const data = asRecord(body)
    const ws = typeof data.workspace === 'string' ? data.workspace : (typeof data.workspaceRoot === 'string' ? data.workspaceRoot : null)
    const sess = typeof data.session === 'string' ? data.session : (typeof data.sessionId === 'string' ? data.sessionId : null)
    const { root } = await resolveRoot(ctx, ws, sess, controller.signal)
    const repo = await repositoryRoot(root, controller.signal)
    if (!repo) throw new ApiError(400, 'Current workspace is not a git repository')

    const gitSettings = config().git

    // Exclude large compiled bundles, lockfiles, and binary assets so real source code diffs are prioritized
    const EXCLUDE_PATHSPECS = [
      '--',
      '.',
      ':(exclude)lib/**',
      ':(exclude)dist/**',
      ':(exclude)build/**',
      ':(exclude)out/**',
      ':(exclude)*.min.js',
      ':(exclude)*.bundle.js',
      ':(exclude)*.map',
      ':(exclude)package-lock.json',
      ':(exclude)pnpm-lock.yaml',
      ':(exclude)yarn.lock',
      ':(exclude)*.png',
      ':(exclude)*.jpg',
      ':(exclude)*.jpeg',
      ':(exclude)*.gif',
      ':(exclude)*.svg',
      ':(exclude)*.webp',
      ':(exclude)*.ico',
      ':(exclude)*.woff',
      ':(exclude)*.woff2',
      ':(exclude)*.ttf',
      ':(exclude)*.eot',
      ':(exclude)*.wasm',
      ':(exclude)*.pdf',
      ':(exclude)*.zip',
      ':(exclude)*.tar.gz',
    ]

    // Check cached diff first (prioritizing source files)
    let diffRes = await git(['diff', '--cached', ...EXCLUDE_PATHSPECS], { cwd: repo, signal: controller.signal })
    let diffText = diffRes.stdout

    if (diffText.trim().length === 0) {
      diffRes = await git(['diff', '--cached'], { cwd: repo, signal: controller.signal })
      diffText = diffRes.stdout
    }

    // If no staged diff, check if autoStageAll is allowed
    if (diffText.trim().length === 0) {
      if (gitSettings.autoStageAll) {
        await git(['add', '-A'], { cwd: repo, signal: controller.signal })
        diffRes = await git(['diff', '--cached', ...EXCLUDE_PATHSPECS], { cwd: repo, signal: controller.signal })
        diffText = diffRes.stdout
        if (diffText.trim().length === 0) {
          diffRes = await git(['diff', '--cached'], { cwd: repo, signal: controller.signal })
          diffText = diffRes.stdout
        }
      }
      // If still no diff, check diff against HEAD or working tree
      if (diffText.trim().length === 0) {
        const headDiff = await git(['diff', 'HEAD', ...EXCLUDE_PATHSPECS], { cwd: repo, signal: controller.signal })
        diffText = headDiff.stdout
        if (diffText.trim().length === 0) {
          const rawHead = await git(['diff', 'HEAD'], { cwd: repo, signal: controller.signal })
          diffText = rawHead.stdout
        }
      }
    }

    if (diffText.trim().length === 0) {
      const untracked = await git(['status', '--porcelain'], { cwd: repo, signal: controller.signal })
      if (untracked.stdout.trim().length === 0) {
        return {
          ok: false,
          fullMessage: '',
          error: '当前没有检测到任何代码改动，无需生成提交信息。',
        } as GenerateCommitResult
      }
      diffText = `Untracked / Changed files:\n${untracked.stdout.trim()}`
    }

    // Stat summary (bounded by limitStatText)
    let statRes = await git(['diff', '--cached', '--stat', ...EXCLUDE_PATHSPECS], { cwd: repo, signal: controller.signal })
    if (!statRes.ok || statRes.stdout.trim().length === 0) {
      statRes = await git(['diff', '--cached', '--stat'], { cwd: repo, signal: controller.signal })
    }
    const rawStatText = statRes.ok ? statRes.stdout.trim() : ''
    const statText = limitStatText(rawStatText, 60)

    // Smart multi-tier diff budgeting: prevents large-file starvation and caps total tokens
    const { diff: truncatedDiff } = prepareOptimizedDiff(diffText, 16000, 1500)

    // Select model
    const llm = ctx.get('llm')
    if (!llm) {
      throw new ApiError(503, 'LLM 服务不可用，无法自动生成 Commit 信息')
    }
    const llmService = llm

    const providers = llm.listProviders()
    if (providers.length === 0) {
      throw new ApiError(503, '未检测到任何可用的 LLM 服务提供商，请先配置模型')
    }

    const requestedProvider = typeof data.provider === 'string' && data.provider.trim().length > 0
      ? data.provider.trim()
      : undefined

    const candidateProviders = [
      requestedProvider,
      gitSettings.provider?.trim() || undefined,
      config().commandReview.provider?.trim() || undefined,
      'deepseek-official',
    ].filter((p): p is string => Boolean(p))

    let chosenProvider = candidateProviders.find(cp => providers.some(p => p.id === cp))
    if (!chosenProvider) {
      chosenProvider = providers[0]?.id
    }
    if (!chosenProvider) {
      throw new ApiError(503, '未找到可用的 LLM 服务提供商')
    }

    const availableModels = await llm.listModels(chosenProvider).catch(() => [])

    const requestedModel = typeof data.model === 'string' && data.model.trim().length > 0
      ? data.model.trim()
      : undefined

    let chosenModel: string | undefined

    if (requestedModel) {
      const match = availableModels.find(m => m.id.toLowerCase() === requestedModel.toLowerCase())
      chosenModel = match ? match.id : requestedModel
    } else if (gitSettings.model?.trim()) {
      const match = availableModels.find(m => m.id.toLowerCase() === gitSettings.model.trim().toLowerCase())
      chosenModel = match ? match.id : gitSettings.model.trim()
    } else if (availableModels.length > 0) {
      const flash = availableModels.find(m => m.id.toLowerCase().includes('flash'))
      const chat = availableModels.find(m => m.id.toLowerCase().includes('chat'))
      const deepseek = availableModels.find(m => m.id.toLowerCase().includes('deepseek'))
      chosenModel = (flash ?? chat ?? deepseek ?? availableModels[0])?.id
    } else {
      const crModel = config().commandReview.model?.trim()
      if (crModel && crModel !== 'deepseek-v4-flash') {
        chosenModel = crModel
      } else {
        chosenModel = chosenProvider.includes('deepseek') ? 'deepseek-chat' : 'gpt-4o-mini'
      }
    }

    const finalModel = chosenModel || (chosenProvider.includes('deepseek') ? 'deepseek-chat' : 'gpt-4o-mini')

    const style = typeof data.style === 'string' ? data.style : gitSettings.commitStyle
    const lang = typeof data.lang === 'string' ? data.lang : gitSettings.commitLanguage

    const { system, user } = buildCommitPrompt(truncatedDiff, statText, style, lang)

    async function streamCommit(prov: string, mod: string): Promise<string> {
      let textAnswer = ''
      let reasoningAnswer = ''
      let blockEndText = ''
      let streamError: string | null = null
      let hitMaxTokens = false

      const stream = llmService.stream({
        provider: prov,
        model: mod,
        system,
        messages: [{
          id: `msg-commit-${Date.now()}` as never,
          role: 'user',
          content: [{ type: 'text', text: user }],
        }] as never,
        maxTokens: 2048,
        temperature: 0.2,
        signal: controller.signal,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'text-delta') {
          textAnswer += chunk.text
        } else if (chunk.type === 'reasoning-delta') {
          reasoningAnswer += chunk.text
        } else if (chunk.type === 'block-end') {
          const b = (chunk as { block?: { type?: string; text?: string } }).block
          if (b?.type === 'text' && typeof b.text === 'string' && b.text.trim().length > 0) {
            blockEndText = b.text
          } else if (b?.type === 'reasoning' && typeof b.text === 'string' && b.text.trim().length > 0) {
            if (!reasoningAnswer) reasoningAnswer = b.text
          }
        } else if (chunk.type === 'finish') {
          if (chunk.reason.kind === 'error') {
            streamError = (chunk.reason as { failure?: { message?: string } }).failure?.message || 'LLM 提供商返回错误'
          } else if (chunk.reason.kind === 'aborted') {
            streamError = (chunk.reason as { failure?: { message?: string } }).failure?.message || 'LLM 请求被中断'
          } else if (chunk.reason.kind === 'max-tokens') {
            hitMaxTokens = true
          }
        }
      }

      if (streamError) {
        throw new Error(streamError)
      }

      let answer = textAnswer.trim()
      if (!answer && blockEndText.trim()) {
        answer = blockEndText.trim()
      }
      if (!answer && reasoningAnswer.trim()) {
        answer = extractCommitFromReasoning(reasoningAnswer)
      }

      if (!answer) {
        if (hitMaxTokens) {
          throw new Error('模型输出超出 Token 限制且未生成有效提交说明')
        }
        throw new Error('模型返回的提交说明为空')
      }

      return answer
    }

    try {
      let answer = ''
      let activeModel = finalModel
      try {
        answer = await streamCommit(chosenProvider, finalModel)
      } catch (firstErr: unknown) {
        if (chosenProvider.includes('deepseek') && finalModel !== 'deepseek-chat') {
          try {
            activeModel = 'deepseek-chat'
            answer = await streamCommit(chosenProvider, 'deepseek-chat')
          } catch {
            throw firstErr
          }
        } else {
          throw firstErr
        }
      }

      const sanitized = sanitizeCommitMessage(answer)
      if (!sanitized.fullMessage.trim()) {
        throw new Error('LLM 生成的提交说明为空，请检查模型响应或更换模型重试')
      }

      return {
        ok: true,
        fullMessage: sanitized.fullMessage,
        title: sanitized.title,
        body: sanitized.body,
      } as GenerateCommitResult
    } catch (err: unknown) {
      throw new ApiError(500, `LLM 生成 Commit 失败 (${chosenProvider}/${finalModel}): ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return installRoutes(routes, {
    // 1. Session-Git Binding Query
    '/explorer/git/binding': handleBinding,
    '/explorer/git/session-binding': handleBinding,

    // 2. Set Session-Git Binding (and optionally create branch / worktree)
    '/explorer/git/bind': handleBind,
    '/explorer/git/session-bind': handleBind,

    // 3. List Branches
    '/explorer/git/branches': handleBranches,

    // 4. Create Branch
    '/explorer/git/branch-create': handleBranchCreate,
    '/explorer/git/create-branch': handleBranchCreate,

    // 5. Checkout Branch (subject to strict lock mode checks)
    '/explorer/git/checkout': handleCheckout,

    // 6. List Worktrees
    '/explorer/git/worktrees': handleWorktrees,

    // 7. Add Worktree
    '/explorer/git/worktree-add': handleWorktreeAdd,
    '/explorer/git/add-worktree': handleWorktreeAdd,

    // 8. Remove Worktree
    '/explorer/git/worktree-remove': handleWorktreeRemove,
    '/explorer/git/remove-worktree': handleWorktreeRemove,
    '/explorer/git/register-workspace': handleRegisterWorkspace,

    // 9. Stage / Unstage / Discard Files
    '/explorer/git/stage': handleStage,
    '/explorer/git/discard': handleDiscard,

    // 10. Commit
    '/explorer/git/commit': handleCommit,

    // 11. Push
    '/explorer/git/push': handlePush,

    // 12. Generate Commit Message via LLM
    '/explorer/git/generate-commit': handleGenerateCommit,
    '/explorer/git/generate-commit-message': handleGenerateCommit,
  })
}
