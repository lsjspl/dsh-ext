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
  // The host's real file-tool names (dsh-tool-fs registers `write`/`edit`;
  // the display names "Write"/"Edit" are capitalised presentation).
  'write', 'edit',
  'str_replace', 'str_replace_editor', 'apply_patch', 'multi_edit', 'notebook_edit',
  // Legacy / alternative spellings, so a host that renames tools degrades to
  // over-checkpointing instead of silent gaps.
  'write_file', 'edit_file', 'create_file', 'delete_file', 'move_file',
  'bash', 'pwsh', 'run_command', 'run_code',
])

/** Set membership, case-insensitively: display names capitalise, exec names don't. */
function isMutatingTool(name: string): boolean {
  return MUTATING_TOOLS.has(name.toLowerCase())
}

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

/**
 * The session-log position to anchor a chat fork at: the last event seq at the
 * moment this checkpoint was taken. Forking here reproduces the conversation
 * exactly as it was before this turn's mutations.
 */
function turnSeqOf(exec: ToolExecution): number | undefined {
  const session = (exec.agent as { session?: { seq?: unknown } } | undefined)?.session
  return typeof session?.seq === 'number' ? session.seq : undefined
}

/** Strip the machine turn prefix for user-facing checkpoint lists. */
function displayLabel(label: string): string {
  return label.replace(/^turn:\d+\s+/, '')
}

/** Resolve one finalized assistant message's durable turn from session events. */
export function turnForMessageEvents(events: readonly unknown[], messageId: string): number | undefined {
  return messagePositionOfEvents(events, messageId)?.turn
}

/**
 * The durable turn AND log position of one finalized assistant message.
 *
 * `seq` is what a chat fork needs: forking at the answer's own event seq cuts
 * at that answer's `turn/end` — the child conversation ends exactly at the
 * rolled-back answer. Derived from the persisted log, so it works for every
 * checkpoint regardless of whether an anchor was captured at snapshot time.
 */
export function messagePositionOfEvents(
  events: readonly unknown[],
  messageId: string,
): { turn: number; seq: number } | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index] as { type?: unknown; seq?: unknown; data?: { turn?: unknown; message?: { id?: unknown } } }
    if (event.type !== 'assistant/message' || String(event.data?.message?.id ?? '') !== messageId) continue
    const turn = typeof event.data?.turn === 'number' ? event.data.turn : undefined
    const seq = typeof event.seq === 'number' ? event.seq : undefined
    if (turn === undefined || seq === undefined) return undefined
    return { turn, seq }
  }
  return undefined
}

/** The text of one content block, when it carries any. */
function blockText(block: unknown): string {
  if (typeof block !== 'object' || block === null) return ''
  const raw = (block as { type?: unknown; text?: unknown }).text
  return typeof raw === 'string' ? raw : ''
}

/**
 * The turn one durable event belongs to, with the chat context a bubble-side
 * edit needs. The user message's own seq sits inside its turn's
 * `[turn/start, turn/end]` window, so the log answers the mapping directly.
 */
export function seqTurnOfEvents(
  events: readonly unknown[],
  seq: number,
): { turn: number; closed: boolean; question: string | undefined; undoAnchorSeq: number | undefined } | undefined {
  let turn: number | undefined
  for (const raw of events) {
    const event = raw as { type?: unknown; seq?: unknown; data?: { turn?: unknown } }
    const eventSeq = typeof event.seq === 'number' ? event.seq : undefined
    if (eventSeq === undefined) continue
    if (event.type === 'turn/start' && eventSeq <= seq) {
      const candidate = typeof event.data?.turn === 'number' ? event.data.turn : undefined
      if (candidate !== undefined && (turn === undefined || candidate > turn)) {
        turn = candidate
      }
    }
  }
  if (turn === undefined) {
    for (const raw of events) {
      const event = raw as { type?: unknown; seq?: unknown; data?: { turn?: unknown } }
      const eventSeq = typeof event.seq === 'number' ? event.seq : undefined
      if (eventSeq === seq && typeof event.data?.turn === 'number') {
        turn = event.data.turn
        break
      }
      if (event.type === 'turn/start' && typeof event.data?.turn === 'number') {
        turn = event.data.turn
        break
      }
    }
  }
  if (turn === undefined) return undefined
  const context = turnContextOfEvents(events, turn)
  return {
    turn,
    closed: context.closed,
    question: context.question,
    undoAnchorSeq: context.undoAnchorSeq,
  }
}

/**
 * One turn's chat context, read from the durable log.
 *
 * - `closed`: a `turn/end` exists, so undo/edit actions are safe to offer.
 * - `undoAnchorSeq`: the `turn/end` of the PREVIOUS turn — forking there cuts
 *   the branch right before this turn starts, removing the turn and everything
 *   after it. Anchoring on an earlier event inside this turn would keep this
 *   turn's own end as the boundary instead. The session's first turn has no
 *   earlier boundary, so it cannot be cut and reports undefined.
 * - `question`: the text blocks of the `user/message` events inside the turn's
 *   window (the event payload is the message itself, so the position in the
 *   log is the only attribution it has).
 */
export function turnContextOfEvents(
  events: readonly unknown[],
  turn: number,
): { closed: boolean; undoAnchorSeq: number | undefined; question: string | undefined } {
  let startSeq: number | undefined
  let endSeq: number | undefined
  let previousEndSeq: number | undefined
  for (const raw of events) {
    const event = raw as { type?: unknown; seq?: unknown; data?: { turn?: unknown } }
    const seq = typeof event.seq === 'number' ? event.seq : undefined
    if (seq === undefined) continue
    if (event.type === 'turn/start' && event.data?.turn === turn) startSeq = startSeq ?? seq
    if (event.type === 'turn/end' && event.data?.turn === turn) endSeq = seq
    if (event.type === 'turn/end' && event.data?.turn === turn - 1) previousEndSeq = seq
  }
  if (previousEndSeq === undefined && startSeq !== undefined && turn > 1) {
    for (const raw of events) {
      const event = raw as { type?: unknown; seq?: unknown }
      const seq = typeof event.seq === 'number' ? event.seq : undefined
      if (seq === undefined) continue
      if (event.type === 'turn/end' && seq < startSeq) {
        if (previousEndSeq === undefined || seq > previousEndSeq) {
          previousEndSeq = seq
        }
      }
    }
  }
  const closed = endSeq !== undefined
  const windowEnd = endSeq ?? Number.MAX_SAFE_INTEGER

  const parts: string[] = []
  if (startSeq !== undefined) {
    for (const raw of events) {
      const event = raw as { type?: unknown; seq?: unknown; data?: { content?: unknown } }
      if (event.type !== 'user/message') continue
      const seq = typeof event.seq === 'number' ? event.seq : undefined
      if (seq === undefined || seq < startSeq || seq > windowEnd) continue
      const content = event.data?.content
      if (Array.isArray(content)) for (const block of content) parts.push(blockText(block))
    }
  }
  const question = parts.length > 0 ? parts.join('').trim() : undefined
  return {
    closed,
    undoAnchorSeq: turn > 1 ? previousEndSeq : undefined,
    question: question !== undefined && question.length > 0 ? question : undefined,
  }
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
  const log = ctx.logger('dsh-ext')
  const settings = config().checkpoints
  const store = new CheckpointStore(checkpointRoot, settings.excludes, settings.maxFileSizeMb)

  /** Sessions already checkpointed during the current turn, for `snapshotOn: 'turn'`. */
  const turnSnapshots = new Set<string>()
  /** Serializes snapshots per workspace: two concurrent tool calls must not stage at once. */
  const queues = new Map<string, Promise<unknown>>()

  /**
   * Cache for turnChanges results to avoid expensive git operations on every poll.
   * Key: `${workTree}\n${sessionId}\n${turn}`, Value: { result, timestamp }
   *
   * Invalidation: cleared when a new checkpoint is taken in that workspace.
   * TTL: 30 seconds to handle the case where files change outside checkpoints.
   */
  interface TurnChangesCache {
    result: { files: { path: string; added: number; removed: number }[]; added: number; removed: number } | undefined
    timestamp: number
    /** The refs map hash at the time of computation, to detect new checkpoints. */
    refsHash: string
  }
  const turnChangesCache = new Map<string, TurnChangesCache>()
  const TURN_CHANGES_TTL = 30_000 // 30 seconds

  function turnChangesCacheKey(workTree: string, sessionId: string, turn: number): string {
    return `${workTree}\n${sessionId}\n${turn}`
  }

  function refsMapHash(refs: ReadonlyMap<number, string>): string {
    return [...refs.entries()].map(([t, id]) => `${t}:${id}`).join(',')
  }

  function invalidateTurnChangesCache(workTree: string): void {
    // When a new checkpoint is taken, invalidate all cached results for this workspace
    for (const key of turnChangesCache.keys()) {
      if (key.startsWith(`${workTree}\n`)) {
        turnChangesCache.delete(key)
      }
    }
  }

  function serialize<T>(workTree: string, operation: () => Promise<T>): Promise<T> {
    const previous = queues.get(workTree) ?? Promise.resolve()
    const next = previous.then(operation, operation)
    queues.set(workTree, next.catch(() => undefined))
    return next
  }

  /** The durable turn and log position of one finalized assistant message. */
  async function messagePosition(
    sessionId: string,
    messageId: string,
    signal?: AbortSignal,
  ): Promise<{ turn: number; seq: number } | undefined> {
    const persistence = ctx.get('sessionPersistence')
    if (persistence === undefined) return undefined
    const inspection = await persistence.inspect(sessionId as never, signal)
    return messagePositionOfEvents(inspection.events, messageId)
  }

  /** The fork lineage fields of one session: live header first, durable header as fallback. */
  async function sessionLineage(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<{ parentSession: string | undefined; seedLength: number | undefined }> {
    const live = ctx.get('sessions')?.get(sessionId as never) as {
      header?: { parentSession?: unknown; seedLength?: unknown }
    } | undefined
    const fromLive = live?.header
    if (fromLive !== undefined) {
      return {
        parentSession: typeof fromLive.parentSession === 'string' ? fromLive.parentSession : undefined,
        seedLength: typeof fromLive.seedLength === 'number' ? fromLive.seedLength : undefined,
      }
    }
    const persistence = ctx.get('sessionPersistence')
    if (persistence === undefined) return { parentSession: undefined, seedLength: undefined }
    try {
      const inspection = await persistence.inspect(sessionId as never, signal)
      const header = inspection.meta
      return {
        parentSession: typeof header.parentSession === 'string' ? header.parentSession : undefined,
        seedLength: typeof header.seedLength === 'number' ? header.seedLength : undefined,
      }
    } catch {
      return { parentSession: undefined, seedLength: undefined }
    }
  }

  /**
   * The turn refs of one session, merged across its fork lineage.
   *
   * A fork's child inherits the parent's log under a NEW session id, while
   * every turn ref was written under the id that ran the turn — so right after
   * a rollback switches the chat to a forked branch, the child's own ref
   * namespace is empty and every inherited turn must be resolved through the
   * parent chain. A parent's ref counts only for turns the child actually
   * inherited (at or below that child's `seedLength`), and the child's own
   * refs always win for turns it checkpointed itself.
   */
  async function mergedTurnRefs(
    workTree: string,
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<Map<number, string>> {
    const merged = new Map<number, string>()
    let current: string | undefined = sessionId
    let inheritedLimit = Number.POSITIVE_INFINITY
    for (let depth = 0; current !== undefined && depth < 8; depth += 1) {
      const refs = await store.turnRefs(workTree, current, signal)
      for (const [turn, id] of refs) {
        if (turn > inheritedLimit) continue
        if (!merged.has(turn)) merged.set(turn, id)
      }
      const lineage = await sessionLineage(current, signal)
      inheritedLimit = lineage.seedLength ?? Number.POSITIVE_INFINITY
      current = lineage.parentSession
    }
    return merged
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
    if (!isMutatingTool(exec.name)) return await next()

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
        if (turn !== undefined) {
          await store.linkTurn(workTree, sessionId, turn, snapshot.id)
          const anchorSeq = turnSeqOf(exec)
          if (anchorSeq !== undefined) await store.linkAnchor(workTree, sessionId, snapshot.id, anchorSeq)
        }
        // Invalidate turnChanges cache when a new checkpoint is created
        invalidateTurnChangesCache(workTree)
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
      const position = await messagePosition(sessionId, messageId, controller.signal)
      if (position === undefined) return { checkpoint: null }
      const checkpoint = await checkpointForTurn(workTree, sessionId, position.turn, controller.signal)
      if (checkpoint === undefined) return { checkpoint: null }
      // The chat fork anchor. A stored pre-mutation seq is preferred; any event
      // inside the answer's own turn cuts at that turn's `turn/end`, so the
      // answer's durable log position is an equal boundary — and it exists even
      // for checkpoints taken before anchors were captured at snapshot time.
      const anchorSeq = (await store.resolveAnchor(workTree, sessionId, checkpoint.id)) ?? position.seq
      return {
        checkpoint: {
          ...checkpoint,
          label: displayLabel(checkpoint.label),
        },
        anchorSeq,
      }
    },

    '/checkpoints/turn-info': async ({ query, req }) => {
      if (!config().checkpoints.enabled) throw new ApiError(404, 'checkpoints are switched off')
      const sessionId = query.get('session')
      if (sessionId === null || sessionId.length === 0) throw new ApiError(400, 'a session id is required')
      // Address the turn either directly by number, or through a durable event
      // seq (the user-bubble edit pencil knows its message's seq, not the
      // turn numbering).
      const rawTurn = query.get('turn')
      const rawSeq = query.get('seq')
      const turn = rawTurn !== null
        ? Number.parseInt(rawTurn, 10)
        : undefined
      const seq = rawSeq !== null ? Number.parseInt(rawSeq, 10) : undefined
      if (turn === undefined && seq === undefined) throw new ApiError(400, 'a turn number or an event seq is required')
      if (turn !== undefined && (!Number.isSafeInteger(turn) || turn < 0)) throw new ApiError(400, 'a turn number is required')
      if (seq !== undefined && !Number.isSafeInteger(seq)) throw new ApiError(400, 'an event seq is required')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workTree = await requireWorkspace(ctx, query.get('workspace'), sessionId, controller.signal)

      // seq addressing: the durable log maps the message's event seq to its
      // turn. This is also the only read that needs the log on the seq path,
      // so detail fields come along for free when it ran.
      let resolvedTurn = turn
      let seqDetail: { closed?: boolean; question?: string; undoAnchorSeq?: number } = {}
      if (seq !== undefined) {
        const persistence = ctx.get('sessionPersistence')
        if (persistence === undefined) throw new ApiError(409, 'session persistence is unavailable')
        const inspection = await persistence.inspect(sessionId as never, controller.signal)
        const position = seqTurnOfEvents(inspection.events, seq)
        if (position === undefined) throw new ApiError(404, 'no turn contains that event seq')
        resolvedTurn = position.turn
        seqDetail = { closed: position.closed, question: position.question, undoAnchorSeq: position.undoAnchorSeq }
      }

      // The polling path is deliberately git-only: the card polls every turn
      // tail every couple of seconds, so the session log (a zstd decompress +
      // full replay per inspect) is read only when needed — the detail fields
      // or a seq lookup. Everything the card continuously needs — the
      // checkpoint id and this turn's file delta — lives in the shadow
      // repository, resolved across the session's fork lineage in one batched
      // ref read, and the turn's open/closed state arrives from the chat's own
      // TurnLocation on the client.
      const refs = await mergedTurnRefs(workTree, sessionId, controller.signal)
      if (resolvedTurn === undefined) throw new ApiError(400, 'a turn number is required')
      const checkpointId = refs.get(resolvedTurn)
      if (checkpointId === undefined) {
        const payload = {
          turn: resolvedTurn,
          closed: true,
          question: undefined as string | undefined,
          undoAnchorSeq: undefined as number | undefined,
          checkpointId: undefined,
          workspace: workTree,
          files: [],
          added: 0,
          removed: 0,
        }
        if (seqDetail.question !== undefined || seqDetail.undoAnchorSeq !== undefined || seqDetail.closed !== undefined) {
          return { ...payload, ...seqDetail }
        }
        if (query.get('detail') !== '1') return payload

        const persistence = ctx.get('sessionPersistence')
        if (persistence === undefined) return payload
        const inspection = await persistence.inspect(sessionId as never, controller.signal)
        const context = turnContextOfEvents(inspection.events, payload.turn)
        return { ...payload, closed: context.closed, question: context.question, undoAnchorSeq: context.undoAnchorSeq }
      }

      // CACHING FIX: Check cache before expensive turnChanges computation.
      // The cache key includes workTree, sessionId, and turn. We also track
      // the refs hash to detect when a new checkpoint invalidates the cache.
      const cacheKey = turnChangesCacheKey(workTree, sessionId, resolvedTurn)
      const currentRefsHash = refsMapHash(refs)
      const cached = turnChangesCache.get(cacheKey)
      const now = Date.now()

      let changes: { files: { path: string; added: number; removed: number }[]; added: number; removed: number } | undefined
      if (cached !== undefined
        && cached.refsHash === currentRefsHash
        && now - cached.timestamp < TURN_CHANGES_TTL) {
        // Cache hit: use cached result
        changes = cached.result
      } else {
        // Cache miss or stale: compute and cache
        changes = await store.turnChanges(workTree, refs, resolvedTurn, controller.signal)
        turnChangesCache.set(cacheKey, {
          result: changes,
          timestamp: now,
          refsHash: currentRefsHash,
        })
      }

      const payload = {
        turn: resolvedTurn,
        closed: true,
        question: undefined as string | undefined,
        undoAnchorSeq: undefined as number | undefined,
        checkpointId,
        workspace: workTree,
        files: changes?.files ?? [],
        added: changes?.added ?? 0,
        removed: changes?.removed ?? 0,
      }
      if (seqDetail.question !== undefined || seqDetail.undoAnchorSeq !== undefined) {
        return { ...payload, ...seqDetail }
      }
      if (query.get('detail') !== '1') return payload

      const persistence = ctx.get('sessionPersistence')
      if (persistence === undefined) return payload
      const inspection = await persistence.inspect(sessionId as never, controller.signal)
      const context = turnContextOfEvents(inspection.events, payload.turn)
      return { ...payload, closed: context.closed, question: context.question, undoAnchorSeq: context.undoAnchorSeq }
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
        const result = await serialize(workTree, () => store.snapshot(workTree, sessionId, label))
        // Invalidate turnChanges cache when a manual checkpoint is created
        invalidateTurnChangesCache(workTree)
        return result
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
