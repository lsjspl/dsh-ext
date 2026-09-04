import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

import { existsSync } from 'node:fs'

/** Everything this plugin writes lives under one directory in the harness home. */
export interface PluginPaths {
  /** `$DSH_HOME/dsh-ext`. */
  readonly root: string
  /** Shadow git repositories, one per workspace root. */
  readonly checkpoints: string
  /** Command-review verdict log. */
  readonly auditLog: string
  /** Quarantined bundle list, shared with the `dsh-ext` rescue CLI. */
  readonly quarantine: string
  /** Session to git branch/worktree bindings. */
  readonly gitBindings: string
}

export function pluginPaths(): PluginPaths {
  const legacy = dshHomePath('dsh-dev-tool-ext')
  const root = dshHomePath('dsh-ext')
  const activeRoot = (!existsSync(root) && existsSync(legacy)) ? legacy : root
  return {
    root: activeRoot,
    checkpoints: join(activeRoot, 'checkpoints'),
    auditLog: join(activeRoot, 'command-review.jsonl'),
    quarantine: join(activeRoot, 'quarantine.json'),
    gitBindings: join(activeRoot, 'session-git-bindings.json'),
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
