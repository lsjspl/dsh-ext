import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { SessionHeader } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceRegistry } from '@deepseek-ai/dsh-workspace'
import { rm, stat } from 'node:fs/promises'
import { basename, dirname } from 'node:path'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import type { Config } from '../config.ts'
import type { SessionRow, TrashRow } from '../shared/api-contract.ts'

/**
 * Feature 6 — session records and the recycle bin, backed by the host's own
 * archive set.
 *
 * The persistence seam is append-only by design: it has no `delete`. But the
 * harness DOES own a durable archive set — `WorkspaceRegistry.archivedSessionIds`
 * (durable in `~/.dsh/storages/workspace.json` under `global.archivedSessionIds`).
 * That set is what this feature surfaces:
 *
 *   - archiving (hiding a session from the sidebar) is the host's own
 *     `archiveSession`, which the chat's undo/edit call; it never moves a file;
 *   - the recycle bin lists the sessions that are archived but still on disk;
 *   - 还原 removes an id from the archive set so the session reappears;
 *   - 永久删除 physically deletes the session artifact, then removes the id.
 *
 * The host has no public unarchive API (only append-only `archiveSession`), so
 * this feature goes through the registry's internal `requireState`/`setState`
 * pair directly. `WorkspaceRegistry` keeps the durable global in memory and only
 * re-reads it at boot, so rewriting the file alone would leave the sidebar stale
 * until a restart. Touching the in-memory state (via `setState`, which also
 * persists) makes a 还原 take effect immediately.
 *
 * ORDER CONTRACT — do not reorder. The archive set is an independent membership
 * set, NOT an ordering of the session list. A session's position in the sidebar
 * comes from its workspace record's `sessionIds` array, which is untouched by
 * archiving: an archived session keeps its slot, so unarchiving restores it to
 * exactly the place it had. These handlers therefore only add/remove ids from
 * `archivedSessionIds` and never rewrite `sessionIds`/`workspaceIds`/records —
 * putting a session back would be both wrong and destructive.
 */

/** Only this much of a log is scanned for a title: it is a display nicety. */
const TITLE_SCAN_BYTES = 256 * 1024
/** How many session logs one listing will decompress; the rest fall back to a date. */
const TITLE_BUDGET = 60

/**
 * The host registry's internal write surface. `requireState` and `setState` are
 * declared `private` on `WorkspaceRegistry` (a compile-time shield only — they
 * exist at runtime), which is precisely what lets this feature mutate the
 * durable archive set the host otherwise never exposes for writing. The
 * private members are reached by structural type; nothing else about the
 * registry is assumed.
 */
interface RegistryStateSurface {
  archivedSessionIds: readonly string[]
}

interface RegistryInternal extends RegistryStateSurface {
  /** The current durable global state (initialized, workspaceIds, pendingMutation, …). */
  requireState(): WorkspaceDomainInternal
  /** Persist and install a new full state. Both memory and disk. */
  setState(state: WorkspaceDomainInternal): Promise<void>
  list?(): any[]
  resolveByPath?(path: string): Promise<any>
}

/** The durable global shape, structural; the registry validates via zod at its own boundary. */
interface WorkspaceDomainInternal {
  initialized: boolean
  workspaceIds: readonly string[]
  archivedSessionIds: readonly string[]
  pendingMutation?: unknown
}

/**
 * Recover a session's display title from its log.
 *
 * `SessionHeader` carries no title — the title is an event — so a listing that
 * wants one has to look. The scan is bounded and best-effort: a session whose
 * title cannot be found is listed by its date, which is still enough to
 * identify it. Deliberately a substring scan rather than a full parse, because
 * this runs once per session in a list that can be long.
 */
function titleFromLog(raw: string, header: SessionHeader): string {
  // Last write wins: a renamed session has more than one title event.
  let title: string | undefined
  const pattern = /"(?:session\/title|title)"\s*:\s*("(?:[^"\\]|\\.)*")/g
  for (const match of raw.matchAll(pattern)) {
    const captured = match[1]
    if (captured === undefined) continue
    try {
      const value = JSON.parse(captured) as unknown
      if (typeof value === 'string' && value.trim().length > 0) title = value.trim()
    } catch { /* a partial line is ordinary */ }
  }
  return title ?? fallbackTitle(header)
}

/** What a session is called when its log yields no title. */
function fallbackTitle(header: SessionHeader): string {
  const when = new Date(header.createdAt)
  return Number.isFinite(when.getTime()) ? `Session of ${when.toLocaleString()}` : `Session ${String(header.id)}`
}

interface LocatedSession {
  readonly header: SessionHeader
  readonly path: string
}

/**
 * Every session the backend can name a file for.
 *
 * A backend without per-session artifacts (SQLite) returns no location, and
 * this feature cannot delete from it. That is reported to the page as an
 * unsupported backend rather than silently listing sessions whose delete
 * button would fail.
 */
async function locateSessions(ctx: Context, signal: AbortSignal): Promise<LocatedSession[]> {
  const persistence = ctx.get('sessionPersistence')
  if (persistence === undefined) throw new ApiError(409, 'no session persistence backend is composed')
  const headers = await persistence.list(signal)
  const rows: LocatedSession[] = []
  for (const header of headers) {
    const location = persistence.locate(header)
    if (location === undefined) continue
    rows.push({ header, path: location.path })
  }
  if (rows.length === 0 && headers.length > 0) {
    throw new ApiError(409, 'this persistence backend does not store one file per session, so this plugin cannot delete from it')
  }
  return rows
}

/**
 * One listing row.
 *
 * The title comes from the backend's `readRaw`, not from reading the artifact
 * path directly. The shipped JSONL backend stores `session.jsonl.zstd` —
 * compressed — so reading those bytes as UTF-8 finds no title events at all and
 * every session falls back to its date. `readRaw` is documented to return the
 * artifact "decoded from its physical encoding, e.g. a decompressed JSONL",
 * which is exactly the text a title scan needs.
 *
 * @param reader - the backend, when it exposes raw artifacts; titles are skipped otherwise.
 * @param withTitle - false past the per-listing budget, so a long history stays cheap.
 */
async function readRow(
  located: LocatedSession,
  reader: RawReader | undefined,
  withTitle: boolean,
  signal?: AbortSignal,
): Promise<SessionRow | undefined> {
  let size = 0
  let updatedAt = located.header.createdAt
  try {
    const info = await stat(located.path)
    size = info.size
    updatedAt = info.mtimeMs
  } catch {
    // The header exists but the artifact does not: nothing to list or delete.
    return undefined
  }

  let title = fallbackTitle(located.header)
  if (withTitle && reader !== undefined) {
    try {
      const artifact = await reader(located.header.id, signal)
      const content = artifact?.content
      if (typeof content === 'string' && content.length > 0) {
        title = titleFromLog(
          content.length > TITLE_SCAN_BYTES ? content.slice(0, TITLE_SCAN_BYTES) : content,
          located.header,
        )
      }
    } catch { /* an unreadable log still lists, by date */ }
  }

  return {
    id: String(located.header.id),
    title,
    updatedAt,
    sizeBytes: size,
    workspace: located.header.cwd,
  }
}

/** The backend's raw-artifact reader, narrowed to what this feature calls. */
type RawReader = (id: SessionHeader['id'], signal?: AbortSignal) => Promise<{ content?: unknown } | undefined>

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required`)
  }
  return value
}

export function mountSessionAdmin(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
): () => void {
  const log = ctx.logger('dsh-ext')

  /**
   * The live registry, narrowed to the archive-set surface this feature needs.
   * `ctx.workspaceRegistry` is the host's long-lived registry; its memory is
   * authoritative, so reads below are always current and never require a reload.
   */
  function registry(): RegistryInternal {
    const reg = ctx.get('workspaceRegistry') as unknown as RegistryInternal | undefined
    if (reg === undefined) throw new ApiError(409, 'the workspace registry is not mounted')
    return reg
  }

  async function findSession(sessionId: string, signal: AbortSignal): Promise<LocatedSession> {
    const sessions = await locateSessions(ctx, signal)
    const found = sessions.find(row => String(row.header.id) === sessionId)
    if (found === undefined) throw new ApiError(404, 'no such session')
    return found
  }

  /** The backend's raw-artifact reader for a live listing, when it exposes one. */
  function liveReader(): RawReader | undefined {
    const persistence = ctx.get('sessionPersistence')
    return persistence?.supportsRawArtifacts === true
      ? ((id, signal) => persistence.readRaw(id, signal)) as RawReader
      : undefined
  }

  /**
   * Remove an id from the archive set, atomically, WITHOUT touching anything
   * else. Reads the current full state, replaces only `archivedSessionIds`,
   * and writes it back through `setState` (memory + disk). The session's
   * position lives in its workspace record's `sessionIds`, which is never
   * altered here — so the session returns to exactly where it was.
   */
  async function removeFromArchive(sessionId: string): Promise<void> {
    const reg = registry()
    const state = reg.requireState()
    const next = state.archivedSessionIds.filter(id => id !== sessionId)
    if (next.length === state.archivedSessionIds.length) return // already absent: no-op
    await reg.setState({ ...state, archivedSessionIds: next })
  }

  /**
   * The archived rows: every id in the host's archive set that still has a file
   * on disk. Read newest-first up to the title budget, so a long archive stays
   * cheap to open. `located` is the live listing the caller already fetched, so
   * this does not repeat the persistence scan.
   */
  async function readArchivedRows(located: LocatedSession[], signal: AbortSignal): Promise<TrashRow[]> {
    const ids = new Set<string>(registry().archivedSessionIds.map(String))
    if (ids.size === 0) return []
    const reader = liveReader()
    const matches = located.filter(row => ids.has(String(row.header.id)))
    matches.sort((a, b) => b.header.createdAt - a.header.createdAt)
    const rows = (await Promise.all(matches.map((row, index) => (
      readRow(row, reader, index < TITLE_BUDGET, signal)
    )))).filter((row): row is SessionRow => row !== undefined)
    rows.sort((a, b) => b.updatedAt - a.updatedAt)

    const locatedIds = new Set(rows.map(r => r.id))
    const ghostRows: TrashRow[] = []
    const rawReg = registry() as any
    const entities = rawReg.entities as Map<string, any> | undefined
    const workspaces = entities !== undefined ? Array.from(entities.values()) : (registry().list?.() ?? [])

    for (const id of ids) {
      if (!locatedIds.has(id)) {
        let workspacePath: string | undefined
        for (const w of workspaces) {
          if (w.record?.sessionIds?.includes(id)) {
            workspacePath = w.record.path
            break
          }
        }
        ghostRows.push({
          id,
          title: `残留会话记录 (${id.replace(/^session-/, '').slice(0, 8)})`,
          updatedAt: 0,
          sizeBytes: 0,
          workspace: workspacePath,
        })
      }
    }

    return [
      ...rows.map(row => ({
        id: row.id,
        title: row.title,
        updatedAt: row.updatedAt,
        sizeBytes: row.sizeBytes,
        workspace: row.workspace,
      })),
      ...ghostRows,
    ]
  }

  return installRoutes(routes, {
    '/sessions': async ({ req }) => {
      if (!config().sessionAdmin.enabled) throw new ApiError(404, 'session administration is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const located = await locateSessions(ctx, controller.signal)

      // Titles need the log decompressed, so they are read newest-first and only
      // up to a budget: a history of hundreds should not spend hundreds of
      // decompressions to label rows further down than anyone scrolls.
      located.sort((a, b) => b.header.createdAt - a.header.createdAt)
      const reader = liveReader()

      const rows = (await Promise.all(located.map((row, index) => (
        readRow(row, reader, index < TITLE_BUDGET, controller.signal)
      )))).filter((row): row is SessionRow => row !== undefined)
      rows.sort((a, b) => b.updatedAt - a.updatedAt)
      return { sessions: rows, trash: await readArchivedRows(located, controller.signal), titleBudget: TITLE_BUDGET }
    },

    '/sessions/restore': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to restore a session')
      if (!config().sessionAdmin.enabled) throw new ApiError(404, 'session administration is switched off')
      const sessionId = requireString((body as { sessionId?: unknown } | undefined)?.sessionId, 'sessionId')
      await removeFromArchive(sessionId)

      // Ensure the session is accounted in its workspace so it appears in the sidebar
      try {
        const reg = registry()
        const rawReg = reg as any
        const entities = rawReg.entities as Map<string, any> | undefined
        const workspaces = entities !== undefined ? Array.from(entities.values()) : (reg.list?.() ?? [])
        let accounted = false
        for (const w of workspaces) {
          if (w.record?.sessionIds?.includes(sessionId)) {
            accounted = true
            break
          }
        }
        if (!accounted) {
          const located = await locateSessions(ctx, new AbortController().signal)
          const match = located.find(row => String(row.header.id) === sessionId)
          if (match?.header.cwd) {
            const ws = await reg.resolveByPath?.(match.header.cwd)
            if (ws && typeof ws.attachSession === 'function') {
              await ws.attachSession(sessionId)
            }
          }
        }
      } catch (e) {
        log.warn('restore re-attachment check failed: %s', String(e))
      }

      log.info('restored session %s', sessionId)
      return { restored: sessionId, reloadRequired: false }
    },

    '/sessions/purge': async ({ body, method, req }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to purge a session')
      if (!config().sessionAdmin.enabled) throw new ApiError(404, 'session administration is switched off')
      const request = body as { sessionId?: unknown; all?: unknown } | undefined
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })

      const reg = registry()
      const rawReg = reg as any
      const archived = reg.archivedSessionIds.map(String)
      let targets: string[]
      if (request?.all === true) {
        targets = [...archived]
      } else {
        targets = [requireString(request?.sessionId, 'sessionId')]
      }

      // 1. Detach from all workspaces.
      // In DSH, a session is visible in the sidebar if it is in workspace.sessionIds and NOT in archivedSessionIds.
      // Previously, purging removed the session from archivedSessionIds without detaching it from the workspace.
      // As a result, the session immediately became "unarchived" and bounced back into the sidebar list!
      // Detaching it from the workspace updates both memory and durable storage, and emits host/workspace-changed
      // so the session will never return to the sidebar.
      const entities = rawReg.entities as Map<string, any> | undefined
      const workspaces = entities !== undefined ? Array.from(entities.values()) : (reg.list?.() ?? [])
      for (const entity of workspaces) {
        for (const target of targets) {
          try {
            if (entity.record?.sessionIds?.includes(target)) {
              await entity.detachSession(target)
            }
          } catch (e) {
            log.warn('failed to detach session %s from workspace %s: %s', target, entity.id, String(e))
            try {
              const table = rawReg.table ?? rawReg.requireTable?.()
              if (table) {
                await table.update(entity.id, (record: any) => ({
                  ...record,
                  sessionIds: record.sessionIds.filter((id: any) => String(id) !== target),
                  updatedAt: new Date().toISOString(),
                }))
              }
            } catch (e2) {
              log.warn('fallback table update failed: %s', String(e2))
            }
          }
        }
      }

      // 2. Detach live agent and session if present in memory
      const sessions = ctx.get('sessions') as any
      const agents = ctx.get('agents') as any
      for (const target of targets) {
        try {
          const liveAgent = agents?.store?.get(target)
          if (typeof liveAgent?.detach === 'function') liveAgent.detach()
        } catch { /* ignore */ }
        try {
          const liveSession = sessions?.store?.get(target)
          if (typeof liveSession?.detach === 'function') liveSession.detach()
        } catch { /* ignore */ }
      }

      // 3. Clean up in-memory caches in WorkspaceRegistry
      for (const target of targets) {
        try {
          rawReg.headers?.delete(target)
          rawReg.sessionPaths?.delete(target)
          rawReg.invalidSessionPaths?.delete(target)
        } catch { /* ignore */ }
      }

      // 4. Invalidate persistence coordinator prepared sessions cache
      const persistence = ctx.get('sessionPersistence') as any
      for (const target of targets) {
        try {
          persistence?.coordinator?.preparations?.invalidate?.(target)
        } catch { /* ignore */ }
      }

      // 5. Delete physical artifact files and directories from disk
      try {
        const located = await locateSessions(ctx, controller.signal)
        for (const target of targets) {
          const match = located.find(row => String(row.header.id) === target)
          if (match !== undefined) {
            try {
              await rm(match.path, { force: true, recursive: true })
              const parentDir = dirname(match.path)
              if (basename(parentDir) === target) {
                await rm(parentDir, { force: true, recursive: true })
              }
            } catch (e) {
              log.warn('failed to remove session artifact at %s: %s', match.path, String(e))
            }
          }
        }
      } catch (e) {
        log.warn('locateSessions failed during purge: %s', String(e))
      }

      // 6. Drop the ids from archivedSessionIds in durable state
      const state = reg.requireState()
      await reg.setState({
        ...state,
        archivedSessionIds: state.archivedSessionIds.filter(id => !targets.includes(String(id))),
      })

      log.info('purged %d archived session(s)', targets.length)
      return { purged: targets.length, reloadRequired: false }
    },
  })
}
