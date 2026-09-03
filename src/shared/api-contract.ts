/**
 * Values both halves of the plugin need to agree on. Kept in its own module so
 * the browser bundle never pulls in a host module (and its node imports) just
 * to learn a path string or the shape of a response.
 */

/** Every endpoint this plugin serves lives under one prefix. */
export const API_PREFIX = '/api/dsh-ext'

/**
 * The settings namespace the host installs and the settings page edits. The
 * seam requires a lowercase-hyphenated identifier and brands the string; the
 * host mints the branded form with `settingsNamespace()` at registration.
 */
export const SETTINGS_NS = 'dsh-ext'

// ── DeepSeek balance ────────────────────────────────────────────────────────

/** One currency row exactly as the DeepSeek `/user/balance` endpoint reports it. */
export interface BalanceRow {
  readonly currency: string
  readonly totalBalance: string
  readonly grantedBalance: string
  readonly toppedUpBalance: string
}

export interface BalanceView {
  /** False when DeepSeek says the account cannot serve requests. */
  readonly available: boolean
  readonly rows: readonly BalanceRow[]
  /** Epoch millis the figures were fetched at; a cached read keeps the original. */
  readonly fetchedAt: number
  /** Where the API key came from, for a "which key is this?" line. Never the key. */
  readonly credentialSource: string
}

// ── Command review ─────────────────────────────────────────────────────────

export type ReviewVerdict = 'allow' | 'deny' | 'ask'

/** One retained decision, as the settings page lists it. */
export interface AuditEntry {
  readonly at: number
  readonly tool: string
  /** The reviewed command, truncated for display. */
  readonly command: string
  readonly verdict: ReviewVerdict
  readonly reason: string
  /** Which stage decided: local patterns, the model, or a failure fallback. */
  readonly decidedBy: 'rules' | 'model' | 'fallback'
  /** Pattern that routed the call to review, when a pattern did. */
  readonly matched?: string
}

// ── Project explorer ───────────────────────────────────────────────────────

export interface TreeEntry {
  readonly name: string
  /** Workspace-relative, `/`-separated, never leading-slash. */
  readonly path: string
  readonly kind: 'file' | 'directory'
  readonly size?: number
  /** True when the directory listing was cut off at the configured cap. */
  readonly truncated?: boolean
}

/** Porcelain-v1 status of one path, split into its two columns. */
export interface ChangeEntry {
  readonly path: string
  /** Original path of a rename, when git reported one. */
  readonly from?: string
  readonly index: string
  readonly worktree: string
  readonly staged: boolean
  readonly untracked: boolean
  /** Lines added versus HEAD (both sides summed), when countable (absent for binary files). */
  readonly added?: number
  /** Lines removed versus HEAD, same caveat as `added`. */
  readonly removed?: number
  /** Lines added on the staged side (index versus HEAD), for the staged filter. */
  readonly stagedAdded?: number
  readonly stagedRemoved?: number
  /** Lines added on the unstaged side (worktree versus index), for the unstaged filter. */
  readonly worktreeAdded?: number
  readonly worktreeRemoved?: number
}

export interface ExplorerStatus {
  /** False when the workspace has no git repository — the tree still works. */
  readonly isRepository: boolean
  readonly branch?: string
  readonly ahead?: number
  readonly behind?: number
  readonly changes: readonly ChangeEntry[]
}

/** One file's content, as the `/explorer/file` viewer returns it. */
export interface FileView {
  /** Workspace-relative path echoed back. */
  readonly path: string
  /** Text content, already cut at the server's line cap when `truncated`. */
  readonly content: string
  /** A shiki grammar id, or '' when the language is unknown (plain monospace). */
  readonly language: string
  /** True when the file was longer than the line cap and only its head came back. */
  readonly truncated: boolean
  readonly bytes: number
}

/** What `/explorer/open-editor` answers: whether a launcher was spawned. */
export interface OpenEditorResult {
  readonly opened: boolean
  /** The launcher binary that was spawned, for a "what ran?" line. */
  readonly editor: string
}

/**
 * One changed file's both sides, for the review tab's inline diff. `oldText` is
 * `null` when git has no prior revision of the path (a new file), which the
 * diff then draws as one whole addition.
 */
export interface ReviewDiff {
  readonly path: string
  readonly oldText: string | null
  readonly newText: string
  /** Lines added versus HEAD, when countable (absent for binary files). */
  readonly added?: number
  /** Lines removed versus HEAD, same caveat as `added`. */
  readonly removed?: number
}

// ── Session records ────────────────────────────────────────────────────────

export interface SessionRow {
  readonly id: string
  readonly title: string
  readonly updatedAt: number
  readonly sizeBytes: number
  readonly workspace?: string
}

/**
 * One archived session, as the recycle bin lists it. Archived sessions are the
 * host's own archive set: they are hidden from the sidebar but still on disk.
 */
export interface TrashRow {
  readonly id: string
  readonly title: string
  /**
   * The session's last activity. The host records no archival timestamp in
   * `workspace.json`, so this uses the artifact's mtime rather than inventing
   * one; it is enough to order the bin rows by recency.
   */
  readonly updatedAt: number
  readonly sizeBytes: number
  /** The workspace the session was open in, when the backend can say. */
  readonly workspace?: string
}

// ── Plugin safety ──────────────────────────────────────────────────────────

export interface PluginRow {
  /** The installable package name, which is what a user recognizes. */
  readonly name: string
  /** True for a package this plugin can tell is part of the harness itself. */
  readonly builtin: boolean
  /** True when every row this package inserts is disabled. */
  readonly quarantined: boolean
  readonly version?: string
  /**
   * Loader row ids this package inserts — what a disable patch actually targets.
   * A package name and its row id are different strings (`dsh-plugin-foo-tool`
   * inserts `foo-tool`), so the quarantine is written in terms of these.
   * Empty when the package declares no bundle patch, which means it contributes
   * no row and cannot be quarantined.
   */
  readonly rows: readonly string[]
  /** True when the profile's `bundles` list names it, rather than only its dependencies. */
  readonly composed: boolean
  /** Which profile it was found in. */
  readonly profile: string
}

export interface SafetyView {
  readonly plugins: readonly PluginRow[]
  readonly quarantine: readonly string[]
  /** Absolute path of the file the rescue CLI reads. Shown so a user can edit it by hand. */
  readonly quarantineFile: string
  /** Absolute path of the bundle file, when this deployment exposes one. */
  readonly bundleFile?: string
}

// ── Checkpoints ────────────────────────────────────────────────────────────

export interface CheckpointRow {
  readonly id: string
  readonly sessionId: string
  readonly at: number
  readonly label: string
  /** Files changed against the previous checkpoint. */
  readonly changed: number
  /** True for the snapshot taken when the session's shadow repo was created. */
  readonly baseline: boolean
}

/** One assistant answer's exact pre-mutation checkpoint, when that turn wrote files. */
export type MessageCheckpoint = CheckpointRow

export interface MessageCheckpointView {
  readonly checkpoint: MessageCheckpoint | null
  /**
   * The session-log position captured when this checkpoint was taken. Used to
   * fork the conversation back to this exact moment after the file restore.
   */
  readonly anchorSeq?: number
}

export interface RestorePreview {
  readonly checkpointId: string
  /** Absolute workspace root the restore will modify. */
  readonly workspace?: string
  /** Paths a restore would overwrite or delete, relative to the workspace. */
  readonly affected: readonly string[]
  /**
   * Paths that changed since the checkpoint and are NOT tracked by the
   * project's own git — a restore is the only copy that would be lost.
   */
  readonly unprotected: readonly string[]
}

/** One file a single turn changed, with its line counts. */
export interface TurnFileChange {
  readonly path: string
  readonly added: number
  readonly removed: number
}

/**
 * What one turn did, as the chat's per-turn changes card renders it.
 *
 * `checkpointId === undefined` means the turn never mutated a tracked file and
 * the card renders nothing. `undoAnchorSeq` is the session-log position a chat
 * fork cuts at to remove this turn and everything after it from the branch;
 * it is undefined for the session's first turn, which has no earlier boundary.
 */
export interface TurnInfoView {
  readonly turn: number
  /** False while the turn is still running; actions stay disabled then. */
  readonly closed: boolean
  /** The user text that started this turn, for the edit affordance. */
  readonly question: string | undefined
  readonly checkpointId: string | undefined
  readonly undoAnchorSeq: number | undefined
  /** The workspace the paths are relative to, for the side panel's tab scope. */
  readonly workspace: string
  readonly files: readonly TurnFileChange[]
  readonly added: number
  readonly removed: number
}

/**
 * One model the reviewer can run on, flattened from the live provider routes.
 * `name` falls back to the id when the route advertises none.
 */
export interface ReviewModelRow {
  readonly provider: string
  readonly model: string
  readonly name: string
}

/** What `/review/models` answers. */
export interface ReviewModels {
  readonly models: readonly ReviewModelRow[]
}

// ── Reasoning effort ───────────────────────────────────────────────────────

export interface EffortOption {
  readonly id: string
  readonly name: string
  readonly description?: string
}

/** One provider route whose per-model efforts this plugin can edit. */
export interface EffortProvider {
  readonly provider: string
  readonly displayName: string
  readonly settingsNs: string
  readonly settingsPath: readonly string[]
  /** True when the route is registered right now (not merely configurable). */
  readonly live: boolean
  readonly models: readonly EffortModel[]
}

export interface EffortModel {
  readonly id: string
  readonly name: string
  /**
   * Efforts the adapter already exposes for this model, when it exposes any.
   * Read-only here: they belong to the adapter, and the editor offers to
   * override them rather than to edit them in place.
   */
  readonly adapterEfforts: readonly EffortRung[]
  /**
   * Efforts stored as this model's own override. Carries the wire spelling
   * because that is what the editor round-trips — a level with no wire value
   * is a different statement from one whose value happens to match its name.
   */
  readonly overrideEfforts: readonly EffortRung[]
  readonly defaultEffort?: string
  /**
   * Whether this model is declared to accept images, or `undefined` when nothing
   * says either way.
   *
   * The host's server refuses an image attachment unless the resolved model info
   * lists the `image` input modality, so a multimodal third-party route rejects
   * pictures until its catalog entry says so. This field is what the settings
   * page reads to offer that declaration.
   */
  readonly vision?: boolean
  /** True when `vision` came from a stored override rather than the adapter. */
  readonly visionOverridden: boolean
}

/**
 * The pi-ai thinking-level vocabulary, in escalation order. These exact names
 * are the only keys its `reasoningEfforts` dict accepts, so the plugin's ladder
 * is expressed in them rather than in an invented set.
 */
export const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'] as const
export type ThinkingLevel = typeof THINKING_LEVELS[number]

/**
 * The default ladder, modelled on Claude's effort control: an explicit off plus
 * four named rungs. A provider that already publishes its own efforts keeps
 * them; this is the starting point offered to one that publishes none.
 *
 * `wire` is the value the provider is actually sent. `off` is the one level
 * allowed to send nothing, which is what makes "no thinking" expressible on a
 * provider whose API has no off switch.
 */
export interface EffortRung extends EffortOption {
  readonly id: ThinkingLevel
  /** Wire spelling sent to the provider; `null` sends nothing at all. */
  readonly wire: string | null
}

export const DEFAULT_EFFORT_LADDER: readonly EffortRung[] = [
  { id: 'off', name: 'Off', description: 'No reasoning budget; send nothing.', wire: null },
  { id: 'minimal', name: 'Minimal', description: 'The smallest non-zero reasoning effort.', wire: 'minimal' },
  { id: 'low', name: 'Low', description: 'A short think before answering.', wire: 'low' },
  { id: 'medium', name: 'Medium', description: 'Balanced reasoning for everyday work.', wire: 'medium' },
  { id: 'high', name: 'High', description: 'Long reasoning for hard problems.', wire: 'high' },
  { id: 'xhigh', name: 'Extra high', description: 'Extended reasoning beyond high.', wire: 'xhigh' },
  { id: 'max', name: 'Max', description: 'The most reasoning the model will do.', wire: 'max' },
]
