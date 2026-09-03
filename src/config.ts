import z from '@deepseek-ai/schemastery'

/**
 * Every feature carries its own `enabled` switch. A disabled feature registers
 * nothing at all — no listener, no route, no slot — so turning it off leaves no
 * trace in the running composition.
 */

export interface ImageComposerConfig {
  enabled: boolean
  pickerButton: boolean
  dragReorder: boolean
}

export interface ReasoningEffortConfig {
  enabled: boolean
  /** Apply the complete effort ladder to every pi-ai model without an explicit declaration. */
  defaultFullEfforts: boolean
  /** Declare image input for every pi-ai model without an explicit modality declaration. */
  defaultVision: boolean
}

/**
 * The composer's model menu.
 *
 * This plugin occupies that seat unconditionally (a `single` slot has no runtime
 * hand-back once shadowed), so the switch below controls the added behaviour
 * rather than whether the control exists: off means the always-expanded list the
 * shipped selector rendered.
 */
export interface ModelPickerConfig {
  groupCollapse: boolean
}

export interface DeepseekBalanceConfig {
  enabled: boolean
  cacheTtlSeconds: number
  headerBadge: boolean
  /** Badge poll interval in seconds; 0 disables polling. */
  pollSeconds: number
  /** DeepSeek peak windows in Beijing time (`HH:MM-HH:MM`); rates are half outside them. */
  peakWindowsBeijing: string[]
  /** Weekend usage is always off-peak, per the official scheme. */
  peakWeekdaysOnly: boolean
}

export type CommandReviewMode = 'rules-only' | 'rules+llm' | 'all'
export type CommandReviewFallback = 'ask' | 'deny' | 'allow'

export interface CommandReviewConfig {
  enabled: boolean
  /** Whether auto-review is active in chat sessions. When false, commands pass through without review even if commandReview is enabled. */
  autoReview: boolean
  mode: CommandReviewMode
  tools: string[]
  /** Skip tool calls the host classifies as concurrency-safe/read-only. */
  writeOnly: boolean
  /** Shell-command fallbacks considered read-only when tool metadata is unavailable. */
  readPatterns: string[]
  /** Deny recognized deletion operations before model or human review. */
  absoluteDenyDelete: boolean
  /** Regular expressions matched against `tool:<name>\n<arguments/command>`. */
  deletePatterns: string[]
  provider: string
  model: string
  timeoutMs: number
  onFailure: CommandReviewFallback
  denyPatterns: string[]
  auditLimit: number
}

export interface ExplorerConfig {
  enabled: boolean
  side: 'left' | 'right'
  defaultOpen: boolean
  respectGitignore: boolean
  maxEntriesPerDir: number
}

export interface SessionAdminConfig {
  enabled: boolean
  attachmentGc: boolean
}

export interface PluginSafetyConfig {
  enabled: boolean
  quarantine: string[]
}

export interface CheckpointsConfig {
  enabled: boolean
  snapshotOn: 'turn' | 'tool'
  excludes: string[]
  maxFileSizeMb: number
  retentionDays: number
}

export interface Config {
  imageComposer: ImageComposerConfig
  reasoningEffort: ReasoningEffortConfig
  modelPicker: ModelPickerConfig
  deepseekBalance: DeepseekBalanceConfig
  commandReview: CommandReviewConfig
  explorer: ExplorerConfig
  sessionAdmin: SessionAdminConfig
  pluginSafety: PluginSafetyConfig
  checkpoints: CheckpointsConfig
}

/**
 * Shell fragments that are dangerous enough to be worth a second opinion. These
 * are the *screening* rules, not the verdict: a hit only routes the call to the
 * reviewer, which decides. Users extend the list rather than editing code —
 * anything two deployments may want to set differently is configuration.
 */
export const DEFAULT_DENY_PATTERNS: readonly string[] = [
  'rm\\s+(-[a-zA-Z]*\\s+)*-[a-zA-Z]*[rf]',
  '\\bmkfs(\\.|\\s)',
  '\\bdd\\s+if=',
  '>\\s*/dev/[sh]d[a-z]',
  '\\bsudo\\b',
  '\\bchmod\\s+(-R\\s+)?0?777\\b',
  '\\bchown\\s+-R\\b',
  '\\b(curl|wget)\\b[^|]*\\|\\s*(sudo\\s+)?(ba|z|)sh',
  '\\bgit\\s+push\\b[^\\n]*(--force|-f)\\b',
  '\\bgit\\s+(reset\\s+--hard|clean\\s+-[a-zA-Z]*f)',
  '\\bDROP\\s+(TABLE|DATABASE|SCHEMA)\\b',
  '\\bTRUNCATE\\s+TABLE\\b',
  '\\b(shutdown|reboot|halt|poweroff)\\b',
  '\\breg\\s+delete\\b',
  '\\bRemove-Item\\b[^\\n]*-Recurse[^\\n]*-Force',
  '\\bnpm\\s+publish\\b',
  '\\bdocker\\s+(system\\s+prune|rm\\s+-f)',
  '\\bkubectl\\s+delete\\b',
]

export const DEFAULT_READ_PATTERNS: readonly string[] = [
  '^\\s*(pwd|cd|ls|dir|tree|find|fd|rg|grep|cat|type|head|tail|less|more|wc|stat|file|which|where)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$',
  '^\\s*git\\s+(status|diff|log|show|branch|remote|rev-parse|ls-files)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$',
  '^\\s*(npm|pnpm|yarn)\\s+(list|ls|view|outdated|why)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$',
  '^\\s*(Get-ChildItem|Get-Content|Get-Item|Get-Location|Select-String|Test-Path|Resolve-Path|Get-Command)(?:\\s+[^;&|><`$()\\r\\n]*)?\\s*$',
]

export const DEFAULT_DELETE_PATTERNS: readonly string[] = [
  '^tool:(delete|remove|unlink|trash|rm)(?:_|\\b)',
  '(?:^|\\n|[;&|]\\s*)rm\\s+(?:-[^\\s]+\\s+)*[^;&|]+',
  '(?:^|\\n|[;&|]\\s*)(del|erase|rmdir|rd)\\s+(?:/[^\\s]+\\s+)*[^;&|]+',
  '(?:^|\\n|[;&|]\\s*)Remove-Item\\b',
  '(?:^|\\n|[;&|]\\s*)git\\s+(clean|rm)\\b',
  '\\b(DELETE\\s+FROM|DROP\\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\\s+TABLE)\\b',
  '(?:^|\\n|[;&|]\\s*)docker\\s+(rm|rmi|volume\\s+rm|network\\s+rm|system\\s+prune)\\b',
  '(?:^|\\n|[;&|]\\s*)kubectl\\s+delete\\b',
  '\\*\\*\\*\\s+Delete File\\b',
  '"(?:op|operation|action)"\\s*:\\s*"(?:delete|remove|unlink)"',
  '\\b(unlink|removeSync|rmSync|rmdirSync|os\\.(remove|unlink|rmdir)|shutil\\.rmtree)\\s*\\(',
]

/**
 * Directories a code snapshot should never carry. `.git` is the load-bearing
 * one: the shadow repository has its own GIT_DIR, so the project's `.git` is
 * just an ordinary directory to it and would otherwise be committed wholesale.
 */
export const DEFAULT_CHECKPOINT_EXCLUDES: readonly string[] = [
  '.git/',
  'node_modules/',
  '.venv/',
  '__pycache__/',
  'dist/',
  'build/',
  'target/',
  '.next/',
  '.turbo/',
  '*.log',
]

export const Config: z<Config> = z.object({
  imageComposer: z.object({
    enabled: z.boolean().default(true).description('Composer image entry in the + menu and drag-to-reorder draft images.'),
    pickerButton: z.boolean().default(true).description('Add an "Add images" entry at the top of the composer + menu.'),
    dragReorder: z.boolean().default(true).description('Replace the draft-image rail with a drag-reorderable one.'),
  }),

  reasoningEffort: z.object({
    enabled: z.boolean().default(true).description('Edit per-model reasoning efforts for third-party (pi-ai) providers from the Models page.'),
    defaultFullEfforts: z.boolean().default(true).description('Apply the complete effort ladder to every pi-ai model without an explicit declaration.'),
    defaultVision: z.boolean().default(true).description('Declare image input for every pi-ai model without an explicit modality declaration.'),
  }),

  modelPicker: z.object({
    groupCollapse: z.boolean().default(true).description('Let the composer\'s model menu collapse each provider group, and filter models by name.'),
  }),

  deepseekBalance: z.object({
    enabled: z.boolean().default(true).description('Show the DeepSeek official API account balance.'),
    cacheTtlSeconds: z.number().step(1).min(5).max(3600).default(60).description('How long a fetched balance is reused before refetching.'),
    headerBadge: z.boolean().default(true).description('Also show a compact balance chip in the composer, immediately left of the model selector.'),
    pollSeconds: z.number().step(1).min(0).max(600).default(30).description('Refresh the balance chip every N seconds. 0 disables polling.'),
    peakWindowsBeijing: z.array(z.string()).default(['09:00-12:00', '14:00-18:00']).description('DeepSeek peak windows in Beijing time (HH:MM-HH:MM); official defaults converted from UTC. Outside them rates are half.'),
    peakWeekdaysOnly: z.boolean().default(true).description('Weekend usage is always off-peak, per the official scheme.'),
  }),

  commandReview: z.object({
    enabled: z.boolean().default(true).description('Have a second model review high-risk tool calls before they run.'),
    autoReview: z.boolean().default(false).description('Chat auto-review switch. When false, command review is paused in chat.'),
    mode: z.union([
      z.const('rules-only').description('Screen with local patterns only; never call a model.'),
      z.const('rules+llm').description('Screen locally, then send hits to the reviewer model.'),
      z.const('all').description('Send every covered tool call to the reviewer model.'),
    ]).default('rules+llm'),
    tools: z.array(z.string()).default(['bash', 'pwsh', 'run_command']).description('Tool names subject to review.'),
    writeOnly: z.boolean().default(true).description('Skip read-only calls; use host tool metadata first and readPatterns as a shell fallback.'),
    readPatterns: z.array(z.string()).default([...DEFAULT_READ_PATTERNS]).description('Regular expressions that recognize read-only shell commands when tool metadata is unavailable.'),
    absoluteDenyDelete: z.boolean().default(true).description('Deny recognized deletion operations immediately, without model or human review.'),
    deletePatterns: z.array(z.string()).default([...DEFAULT_DELETE_PATTERNS]).description('Regular expressions matched against tool name plus command/arguments to recognize deletion operations.'),
    provider: z.string().default('deepseek-official').description('Provider route the reviewer model runs on.'),
    model: z.string().default('deepseek-v4-flash').description('Reviewer model id.'),
    timeoutMs: z.number().step(1).min(1000).max(120000).default(20000).description('Reviewer deadline.'),
    onFailure: z.union([
      z.const('ask').description('Escalate to the user (fail-safe).'),
      z.const('deny').description('Refuse the call (fail-closed).'),
      z.const('allow').description('Let the call through and log it (fail-open).'),
    ]).default('ask').description('What to do when the reviewer times out, errors, or has no credential.'),
    denyPatterns: z.array(z.string()).default([...DEFAULT_DENY_PATTERNS]).description('Regular expressions that mark a command as high-risk.'),
    auditLimit: z.number().step(1).min(0).max(10000).default(500).description('How many past verdicts to retain for the settings page.'),
  }),

  explorer: z.object({
    enabled: z.boolean().default(true).description('Project explorer panel: directory tree plus uncommitted changes.'),
    side: z.union([z.const('left'), z.const('right')]).default('right'),
    defaultOpen: z.boolean().default(false),
    respectGitignore: z.boolean().default(true).description('Hide ignored files from the directory tree.'),
    maxEntriesPerDir: z.number().step(1).min(50).max(5000).default(500).description('Cap on entries returned for one directory.'),
  }),

  sessionAdmin: z.object({
    enabled: z.boolean().default(true).description('Surface the recycle bin and let undo/edit archive the original session.'),
    attachmentGc: z.boolean().default(false).description('On permanent delete, remove attachment blobs no remaining session references. Scans every session log, so it is off by default.'),
  }),

  pluginSafety: z.object({
    enabled: z.boolean().default(true).description('Plugin inventory, quarantine list, and safe-mode helpers.'),
    quarantine: z.array(z.string()).default([]).description('Bundle package names to disable on the next start.'),
  }),

  checkpoints: z.object({
    enabled: z.boolean().default(true).description('Per-session rollback via a shadow git repository. Never touches the project\'s own git history.'),
    snapshotOn: z.union([
      z.const('turn').description('One snapshot before the turn\'s first mutation and one at turn end.'),
      z.const('tool').description('A snapshot before every mutating tool call.'),
    ]).default('turn'),
    excludes: z.array(z.string()).default([...DEFAULT_CHECKPOINT_EXCLUDES]).description('Shadow-repository exclude patterns (git ignore syntax).'),
    maxFileSizeMb: z.number().step(1).min(1).max(1024).default(32).description('Skip files larger than this in a snapshot.'),
    retentionDays: z.number().step(1).min(0).max(3650).default(30).description('Prune checkpoints older than this. 0 keeps everything.'),
  }),
})

export const DEFAULT_CONFIG: Config = {
  imageComposer: {
    enabled: true,
    pickerButton: true,
    dragReorder: true,
  },
  reasoningEffort: {
    enabled: true,
    defaultFullEfforts: true,
    defaultVision: true,
  },
  modelPicker: {
    groupCollapse: true,
  },
  deepseekBalance: {
    enabled: true,
    cacheTtlSeconds: 60,
    headerBadge: true,
    pollSeconds: 30,
    peakWindowsBeijing: ['09:00-12:00', '14:00-18:00'],
    peakWeekdaysOnly: true,
  },
  commandReview: {
    enabled: true,
    autoReview: false,
    mode: 'rules+llm',
    tools: ['bash', 'pwsh', 'run_command'],
    writeOnly: true,
    readPatterns: [...DEFAULT_READ_PATTERNS],
    absoluteDenyDelete: true,
    deletePatterns: [...DEFAULT_DELETE_PATTERNS],
    provider: 'deepseek-official',
    model: 'deepseek-v4-flash',
    timeoutMs: 20000,
    onFailure: 'ask',
    denyPatterns: [...DEFAULT_DENY_PATTERNS],
    auditLimit: 500,
  },
  explorer: {
    enabled: true,
    side: 'right',
    defaultOpen: false,
    respectGitignore: true,
    maxEntriesPerDir: 500,
  },
  sessionAdmin: {
    enabled: true,
    attachmentGc: false,
  },
  pluginSafety: {
    enabled: true,
    quarantine: [],
  },
  checkpoints: {
    enabled: true,
    snapshotOn: 'turn',
    excludes: [...DEFAULT_CHECKPOINT_EXCLUDES],
    maxFileSizeMb: 32,
    retentionDays: 30,
  },
}
