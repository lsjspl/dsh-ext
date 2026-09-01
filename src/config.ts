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
}

export type CommandReviewMode = 'rules-only' | 'rules+llm' | 'all'
export type CommandReviewFallback = 'ask' | 'deny' | 'allow'

export interface CommandReviewConfig {
  enabled: boolean
  mode: CommandReviewMode
  tools: string[]
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
  trashEnabled: boolean
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
  }),

  modelPicker: z.object({
    groupCollapse: z.boolean().default(true).description('Let the composer\'s model menu collapse each provider group, and filter models by name.'),
  }),

  deepseekBalance: z.object({
    enabled: z.boolean().default(true).description('Show the DeepSeek official API account balance.'),
    cacheTtlSeconds: z.number().step(1).min(5).max(3600).default(60).description('How long a fetched balance is reused before refetching.'),
    headerBadge: z.boolean().default(true).description('Also show a compact balance chip in the composer, immediately left of the model selector.'),
  }),

  commandReview: z.object({
    enabled: z.boolean().default(false).description('Have a second model review high-risk tool calls before they run.'),
    mode: z.union([
      z.const('rules-only').description('Screen with local patterns only; never call a model.'),
      z.const('rules+llm').description('Screen locally, then send hits to the reviewer model.'),
      z.const('all').description('Send every covered tool call to the reviewer model.'),
    ]).default('rules+llm'),
    tools: z.array(z.string()).default(['bash', 'pwsh', 'run_command']).description('Tool names subject to review.'),
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
    enabled: z.boolean().default(true).description('Delete session records, with a restorable trash.'),
    trashEnabled: z.boolean().default(true).description('Move deleted sessions to trash instead of removing them immediately.'),
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
