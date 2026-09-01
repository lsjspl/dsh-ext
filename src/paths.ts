import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

/** Everything this plugin writes lives under one directory in the harness home. */
export interface PluginPaths {
  /** `$DSH_HOME/dsh-dev-tool-ext`. */
  readonly root: string
  /** Deleted session artifacts awaiting restore or permanent removal. */
  readonly trash: string
  /** Shadow git repositories, one per workspace root. */
  readonly checkpoints: string
  /** Command-review verdict log. */
  readonly auditLog: string
  /** Quarantined bundle list, shared with the `dsh-ext` rescue CLI. */
  readonly quarantine: string
}

export function pluginPaths(): PluginPaths {
  const root = dshHomePath('dsh-dev-tool-ext')
  return {
    root,
    trash: join(root, 'trash'),
    checkpoints: join(root, 'checkpoints'),
    auditLog: join(root, 'command-review.jsonl'),
    quarantine: join(root, 'quarantine.json'),
  }
}

/**
 * Stable per-workspace directory name. A hash rather than the path itself
 * because a workspace root can be long, contain separators, and differ only in
 * case on Windows — none of which makes a good directory name.
 */
export function workspaceKey(root: string): string {
  return createHash('sha256').update(root).digest('hex').slice(0, 16)
}
