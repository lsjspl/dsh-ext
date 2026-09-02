import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import { CheckpointStore } from '../checkpoint-store.ts'
import type { Config } from '../config.ts'

/**
 * Feature 8 — per-session rollback of the agent's file changes.
 *
 * The store owns the git isolation (see `checkpoint-store.ts`); this module
 * owns *when* a snapshot happens and what the browser can ask for.
 *
 * Snapshots are taken on the way IN to a mutating tool call, not after it. A
 * checkpoint's value is being the state before a change, and a post-hoc
 * snapshot of a half-finished edit is worth much less. Both `snapshotOn` modes
 * use the same hook; the `turn` mode simply coalesces to one snapshot per turn.
 */

/**
 * Tools whose calls change files. A tool not on this list contributes no
 * snapshot — the point is to checkpoint before mutations, and a read does not
 * need one.
 */
const MUTATING_TOOLS = new Set([
  'write_file', 'edit_file', 'str_replace', 'apply_patch', 'create_file',
  'delete_file', 'move_file', 'multi_edit', 'notebook_edit',
  'bash', 'pwsh', 'run_command', 'run_code',
])

/** Read the actual cwd from a live Session. The field is `header`, never `meta`. */
export function liveSessionCwd(session: unknown): string | undefined {
  const cwd = (session as { header?: { cwd?: unknown } } | undefined)?.header?.cwd
  return typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined
}

/** Which workspace a call belongs to. A mutating checkpoint must never guess. */
function workTreeOf(ctx: Context, exec: ToolExecution): string {
  const session = (exec.agent as { session?: unknown } | undefined)?.session
  const cwd = liveSessionCwd(session)
  if (cwd !== undefined) return cwd
  const sessionId = sessionIdOf(exec)
  const owning = ctx.get('workspaceRegistry')?.list()
    .find(row => row.sessionIds.some(id => String(id) === sessionId))
  if (owning !== undefined) return owning.path
  throw new Error(`cannot resolve the workspace for session ${sessionId}; refusing to checkpoint another project`)
}

function sessionIdOf(exec: ToolExecution): string {
  const session = (exec.agent as { session?: { id?: unknown } } | undefined)?.session
  return typeof session?.id === 'string' ? session.id : 'unknown'
}

/**
 * Resolve the durable turn that owns one tool execution.
 *
 * `rootCallId` is the model-requested tool identity; nested code-mode calls
 * preserve it. The live session log's `tool/call` event carries the same id and
 * its turn, which is the stable bridge to the closing assistant message later.
 */
function turnOf(exec: ToolExecution): number | undefined {
  const session = (exec.agent as { session?: { events?: readonly unknown[] } } | undefined)?.session
  const events = session?.events ?? []
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index] as { type?: unknown; data?: { callId?: unknown; turn?: unknown } }
    if (event.type !== 'tool/call' || event.data?.callId !== exec.rootCallId) continue
    return typeof event.data.turn === 'number' ? event.data.turn : undefined
  }
  return undefined
}

/** Machine-readable prefix followed by the human label shown in Settings. */
function turnLabel(turn: number | undefined, tool: string): string {
  return `${turn === undefined ? '' : `turn:${turn} `}before ${tool}`
}

/** Strip the machine turn prefix for user-facing checkpoint lists. */
function displayLabel(label: string): string {
  return label.replace(/^turn:\d+\s+/, '')
}

/** Resolve one finalized assistant message's durable turn from session events. */
export function turnForMessageEvents(events: readonly unknown[], messageId: string): number | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index] as { type?: unknown; data?: { turn?: unknown; message?: { id?: unknown } } }
    if (event.type !== 'assistant/message' || String(event.data?.message?.id ?? '') !== messageId) continue
    return typeof event.data?.turn === 'number' ? event.data.turn : undefined
  }
  return undefined
}

async function requireWorkspace(
  ctx: Context,
  requested: string | null,
  sessionId?: string,
  signal?: AbortSignal,
): Promise<string> {
  if (sessionId !== undefined && sessionId.length > 0 && sessionId !== 'manual') {
    const live = ctx.get('sessions')?.get(sessionId as never)
    const liveCwd = liveSessionCwd(live)
    if (typeof liveCwd === 'string' && liveCwd.length > 0) return liveCwd

    const owning = ctx.get('workspaceRegistry')?.list()
      .find(row => row.sessionIds.some(id => String(id) === sessionId))
    if (owning !== undefined) return owning.path

    const persistence = ctx.get('sessionPersistence')
    if (persistence !== undefined) {
      try {
        const inspection = await persistence.inspect(sessionId as never, signal)
        const storedCwd: unknown = inspection.meta.cwd
        if (typeof storedCwd === 'string' && storedCwd.length > 0) return storedCwd
      } catch { /* fail closed below; never substitute another project */ }
    }

    throw new ApiError(409, `cannot resolve the workspace for session ${sessionId}; refusing to use another project`)
  }

  if (requested !== null && requested.length > 0) {
    const registry = ctx.get('workspaceRegistry')
    const found = registry?.list().find(row => String(row.id) === requested || row.path === requested)
    if (found !== undefined) return found.path
    throw new ApiError(404, 'no such workspace')
  }
  const registry = ctx.get('workspaceRegistry')
  return registry?.list()[0]?.path ?? process.cwd()
}

export function mountCheckpoints(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
  checkpointRoot: string,
): () => void {
  const log = ctx.logger('dsh-dev-tool-ext')
  const settings = config().checkpoints
  const store = new CheckpointStore(checkpointRoot, settings.excludes, settings.maxFileSizeMb)

  /** Sessions already checkpointed during the current turn, for `snapshotOn: 'turn'`. */
  const turnSnapshots = new Set<string>()
  /** Serializes snapshots per workspace: two concurrent tool calls must not stage at once. */
  const queues = new Map<string, Promise<unknown>>()

  function serialize<T>(workTree: string, operation: () => Promise<T>): Promise<T> {
    const previous = queues.get(workTree) ?? Promise.resolve()
    const next = previous.then(operation, operation)
    queues.set(workTree, next.catch(() => undefined))
    return next
  }

  /** Stable turn identity of one finalized assistant message in the session log. */
  async function turnForMessage(sessionId: string, messageId: string, signal?: AbortSignal): Promise<number | undefined> {
  const persistence = ctx.get('sessionPersistence')
  if (persistence === undefined) return undefined
  const inspection = await persistence.inspect(sessionId as never, signal)
  return turnForMessageEvents(inspection.events, messageId)
}

  /** The checkpoint created before this turn's first mutation. */
  async function checkpointForTurn(
    workTree: string,
    sessionId: string,
    turn: number,
    signal?: AbortSignal,
  ) {
    const linked = await store.resolveTurn(workTree, sessionId, turn, signal)
    if (linked !== undefined) {
      const rows = await store.list(workTree, sessionId, signal)
      const known = rows.find(row => row.id === linked)
      return known ?? {
        id: linked,
        sessionId,
        at: 0,
        label: `turn:${turn} checkpoint`,
        changed: 0,
        baseline: false,
      }
    }

    // Compatibility for checkpoints created during the short-lived labelled
    // implementation before turn refs were introduced.
    const rows = await store.list(workTree, sessionId, signal)
    const prefix = `turn:${turn} `
    return rows.filter(row => row.label.startsWith(prefix)).at(-1)
  }

  const disposeHook = ctx.on('tools/pre-execute', async function (exec: ToolExecution, next) {
    const current = config().checkpoints
    if (!current.enabled) return await next()
    if (!MUTATING_TOOLS.has(exec.name)) return await next()

    const sessionId = sessionIdOf(exec)

    // A snapshot must never fail a tool call: workspace resolution and git work
    // are both conveniences. Crucially, a failed resolution is logged and
    // SKIPPED — never redirected to another project's first registry row.
    try {
      const workTree = workTreeOf(ctx, exec)
      const turn = turnOf(exec)

      if (current.snapshotOn === 'turn') {
        // Turn is part of the key: clearing on a sentinel tool name (`stop`) is
        // not a turn boundary and left later turns permanently coalesced. The
        // event-derived turn is the real boundary, so every mutating answer gets
        // exactly one pre-mutation checkpoint.
        const key = `${workTree}\0${sessionId}\0${turn ?? `call:${String(exec.rootCallId)}`}`
        if (turnSnapshots.has(key)) return await next()
        turnSnapshots.add(key)
      }

      await serialize(workTree, async () => {
        const snapshot = await store.snapshot(workTree, sessionId, turnLabel(turn, exec.name))
        if (turn !== undefined) await store.linkTurn(workTree, sessionId, turn, snapshot.id)
      })
    } catch (error: unknown) {
      log.warn('checkpoints: snapshot before %s failed: %o', exec.name, error)
    }
    return await next()
  })

  const contributed = installRoutes(routes, {
    '/checkpoints': async ({ query, req }) => {
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const sessionId = query.get('session') ?? undefined
      const workTree = await requireWorkspace(ctx, query.get('workspace'), sessionId, controller.signal)
      return {
        workspace: workTree,
        exists: await store.exists(workTree),
        checkpoints: (await store.list(workTree, sessionId, controller.signal)).map(row => ({
          ...row,
          label: displayLabel(row.label),
        })),
      }
    },

    '/checkpoints/for-message': async ({ query, req }) => {
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const sessionId = query.get('session')
      const messageId = query.get('message')
      if (sessionId === null || sessionId.length === 0) throw new ApiError(400, 'a session id is required')
      if (messageId === null || messageId.length === 0) throw new ApiError(400, 'a message id is required')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workTree = await requireWorkspace(ctx, query.get('workspace'), sessionId, controller.signal)
      const turn = await turnForMessage(sessionId, messageId, controller.signal)
      if (turn === undefined) return { checkpoint: null }
      const checkpoint = await checkpointForTurn(workTree, sessionId, turn, controller.signal)
      if (checkpoint === undefined) return { checkpoint: null }
      return {
        checkpoint: {
          ...checkpoint,
          label: displayLabel(checkpoint.label),
        },
      }
    },

    '/checkpoints/snapshot': async ({ body, method, query }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to take a checkpoint')
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const request = body as { session?: unknown; label?: unknown } | undefined
      const sessionId = typeof request?.session === 'string' ? request.session : 'manual'
      const workTree = await requireWorkspace(ctx, query.get('workspace'), sessionId)
      const label = typeof request?.label === 'string' && request.label.trim().length > 0
        ? request.label.trim()
        : 'manual checkpoint'
      try {
        return await serialize(workTree, () => store.snapshot(workTree, sessionId, label))
      } catch (error: unknown) {
        // The store distinguishes "no git" from "git refused"; both are the
        // caller's to see verbatim, because they lead to different fixes.
        throw new ApiError(409, error instanceof Error ? error.message : 'the checkpoint could not be taken')
      }
    },

    '/checkpoints/preview': async ({ query, req }) => {
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const id = query.get('id')
      if (id === null) throw new ApiError(400, 'a checkpoint id is required')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workTree = await requireWorkspace(ctx, query.get('workspace'), query.get('session') ?? undefined, controller.signal)
      const { affected, unprotected } = await store.preview(workTree, id, controller.signal)
      return { checkpointId: id, workspace: workTree, affected, unprotected }
    },

    '/checkpoints/diff': async ({ query, req }) => {
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const id = query.get('id')
      if (id === null) throw new ApiError(400, 'a checkpoint id is required')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workTree = await requireWorkspace(ctx, query.get('workspace'), query.get('session') ?? undefined, controller.signal)
      return { checkpointId: id, patch: await store.diff(workTree, id, controller.signal) }
    },

    '/checkpoints/restore': async ({ body, method, query, req }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to restore a checkpoint')
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const request = body as { id?: unknown; session?: unknown; confirm?: unknown } | undefined
      if (typeof request?.id !== 'string' || request.id.length === 0) {
        throw new ApiError(400, 'a checkpoint id is required')
      }
      // A restore overwrites working-tree files. The page has to say it meant
      // it, so a mis-routed request cannot rewrite someone's files.
      if (request?.confirm !== true) throw new ApiError(400, 'a restore requires confirm: true')

      const sessionId = typeof request.session === 'string' ? request.session : 'manual'
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workTree = await requireWorkspace(ctx, query.get('workspace'), sessionId, controller.signal)
      try {
        const result = await serialize(workTree, () => store.restore(workTree, sessionId, request.id as string, controller.signal))
        log.info('restored checkpoint %s in %s', request.id, workTree)
        return result
      } catch (error: unknown) {
        throw new ApiError(409, error instanceof Error ? error.message : 'the restore failed')
      }
    },

    '/checkpoints/prune': async ({ method, query }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to prune checkpoints')
      const current = config().checkpoints
      if (!current.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const workTree = await requireWorkspace(ctx, query.get('workspace'))
      return { pruned: await store.prune(workTree, current.retentionDays) }
    },

    '/checkpoints/forget': async ({ method, query, body }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to discard a checkpoint history')
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      if ((body as { confirm?: unknown } | undefined)?.confirm !== true) {
        throw new ApiError(400, 'discarding a checkpoint history requires confirm: true')
      }
      const workTree = await requireWorkspace(ctx, query.get('workspace'))
      await store.forget(workTree)
      return { forgotten: workTree }
    },
  })

  // Retention runs once at mount rather than on a timer: a plugin that wakes up
  // to run `git gc` on someone's disk unprompted is a worse neighbour than one
  // that prunes when it loads.
  const retention = config().checkpoints.retentionDays
  if (retention > 0) {
    const workTree = ctx.get('workspaceRegistry')?.list()[0]?.path
    if (workTree !== undefined) {
      void store.prune(workTree, retention).catch((error: unknown) => {
        log.warn('checkpoints: retention pass failed: %o', error)
      })
    }
  }

  return () => {
    disposeHook()
    contributed()
    turnSnapshots.clear()
    queues.clear()
  }
}
