import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { SessionHeader } from '@deepseek-ai/dsh-session/types'
import { mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import type { Config } from '../config.ts'
import type { SessionRow, TrashRow } from '../shared/api-contract.ts'

/**
 * Feature 6 — delete session records, with a trash you can restore from.
 *
 * The persistence seam is append-only by design: it has no `delete`. What it
 * does expose is `locate()`, the backend's own absolute path for one session's
 * artifact. Deleting is therefore a filesystem operation on that exact path,
 * and it is deliberately conservative:
 *
 *   - a delete moves the artifact into this plugin's own trash directory, so
 *     the default is recoverable rather than final;
 *   - a permanent delete removes only paths the backend itself named;
 *   - a restore refuses to overwrite an artifact that came back on its own.
 *
 * The harness keeps its session list in memory, so a deleted session may stay
 * on screen until the next reload. The response says so rather than pretending
 * the list refreshed.
 */

/** One trash entry's sidecar, written beside the artifact it describes. */
interface TrashManifest {
  readonly sessionId: string
  readonly title: string
  readonly deletedAt: number
  /** Where the artifact came from, so a restore needs no guessing. */
  readonly originalPath: string
  readonly artifactName: string
}

const MANIFEST_NAME = 'manifest.json'
/** Only this much of a log is scanned for a title: it is a display nicety. */
const TITLE_SCAN_BYTES = 256 * 1024
/** How many session logs one listing will decompress; the rest fall back to a date. */
const TITLE_BUDGET = 60

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

async function readTrash(trashRoot: string): Promise<TrashRow[]> {
  let entries: string[]
  try {
    entries = await readdir(trashRoot)
  } catch {
    return []
  }
  const rows: TrashRow[] = []
  for (const id of entries) {
    try {
      const manifest = JSON.parse(await readFile(join(trashRoot, id, MANIFEST_NAME), 'utf8')) as TrashManifest
      let sizeBytes = 0
      try {
        sizeBytes = (await stat(join(trashRoot, id, manifest.artifactName))).size
      } catch { /* an entry whose artifact is gone still lists, and still deletes */ }
      rows.push({
        id,
        sessionId: manifest.sessionId,
        title: manifest.title,
        deletedAt: manifest.deletedAt,
        sizeBytes,
      })
    } catch { /* a directory that is not one of ours is ignored */ }
  }
  rows.sort((a, b) => b.deletedAt - a.deletedAt)
  return rows
}

/** Trash entry ids are minted here, so a client-supplied one is validated hard. */
function assertTrashId(id: unknown): string {
  if (typeof id !== 'string' || !/^[0-9a-z-]{1,80}$/i.test(id)) {
    throw new ApiError(400, 'not a valid trash entry id')
  }
  return id
}

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
  trashRoot: string,
): () => void {
  const log = ctx.logger('dsh-dev-tool-ext')

  async function findSession(sessionId: string, signal: AbortSignal): Promise<LocatedSession> {
    const sessions = await locateSessions(ctx, signal)
    const found = sessions.find(row => String(row.header.id) === sessionId)
    if (found === undefined) throw new ApiError(404, 'no such session')
    return found
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
      const persistence = ctx.get('sessionPersistence')
      const reader = persistence?.supportsRawArtifacts === true
        ? ((id, signal) => persistence.readRaw(id, signal)) as RawReader
        : undefined

      const rows = (await Promise.all(located.map((row, index) => (
        readRow(row, reader, index < TITLE_BUDGET, controller.signal)
      )))).filter((row): row is SessionRow => row !== undefined)
      rows.sort((a, b) => b.updatedAt - a.updatedAt)
      return { sessions: rows, trash: await readTrash(trashRoot), titleBudget: TITLE_BUDGET }
    },

    '/sessions/delete': async ({ body, method, req }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to delete a session')
      const settings = config().sessionAdmin
      if (!settings.enabled) throw new ApiError(404, 'session administration is switched off')

      const sessionId = requireString((body as { sessionId?: unknown } | undefined)?.sessionId, 'sessionId')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const located = await findSession(sessionId, controller.signal)
      // The title is read here even though the listing may have skipped it past
      // its budget: the trash entry keeps it forever, and "Session of <date>" is
      // a poor label to have to recognize something by weeks later.
      const persistence = ctx.get('sessionPersistence')
      const reader = persistence?.supportsRawArtifacts === true
        ? ((id, signal) => persistence.readRaw(id, signal)) as RawReader
        : undefined
      const row = await readRow(located, reader, true, controller.signal)

      if (!settings.trashEnabled) {
        await rm(located.path, { force: true })
        log.info('permanently deleted session %s', sessionId)
        return { deleted: sessionId, recoverable: false, reloadRequired: true }
      }

      const entryId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      const entryDir = join(trashRoot, entryId)
      const artifactName = basename(located.path)
      await mkdir(entryDir, { recursive: true, mode: 0o700 })

      const manifest: TrashManifest = {
        sessionId,
        title: row?.title ?? `Session ${sessionId}`,
        deletedAt: Date.now(),
        originalPath: located.path,
        artifactName,
      }
      // Manifest first: an entry whose artifact moved but whose manifest is
      // missing would be unrestorable, while a manifest with no artifact is
      // merely an empty entry the user can discard.
      await writeFileAtomic(join(entryDir, MANIFEST_NAME), JSON.stringify(manifest, null, 2), { mode: 0o600, dirMode: 0o700 })
      try {
        await rename(located.path, join(entryDir, artifactName))
      } catch (error: unknown) {
        // A cross-device rename cannot work; copy then unlink is the fallback.
        if ((error as { code?: string }).code === 'EXDEV') {
          await writeFileAtomic(join(entryDir, artifactName), await readFile(located.path, 'utf8'), { mode: 0o600, dirMode: 0o700 })
          await rm(located.path, { force: true })
        } else {
          await rm(entryDir, { recursive: true, force: true })
          throw new ApiError(500, 'could not move that session into the trash')
        }
      }
      log.info('moved session %s to trash entry %s', sessionId, entryId)
      return { deleted: sessionId, recoverable: true, trashId: entryId, reloadRequired: true }
    },

    '/sessions/restore': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to restore a session')
      if (!config().sessionAdmin.enabled) throw new ApiError(404, 'session administration is switched off')
      const entryId = assertTrashId((body as { trashId?: unknown } | undefined)?.trashId)
      const entryDir = join(trashRoot, entryId)

      let manifest: TrashManifest
      try {
        manifest = JSON.parse(await readFile(join(entryDir, MANIFEST_NAME), 'utf8')) as TrashManifest
      } catch {
        throw new ApiError(404, 'no such trash entry')
      }

      // Refuse rather than overwrite: the session coming back on its own means
      // the log at that path is not ours to replace.
      try {
        await stat(manifest.originalPath)
        throw new ApiError(409, 'a session log already exists at the original path; not overwriting it')
      } catch (error: unknown) {
        if (error instanceof ApiError) throw error
      }

      const source = join(entryDir, manifest.artifactName)
      try {
        await mkdir(join(manifest.originalPath, '..'), { recursive: true })
        await rename(source, manifest.originalPath)
      } catch (error: unknown) {
        if ((error as { code?: string }).code === 'EXDEV') {
          await writeFileAtomic(manifest.originalPath, await readFile(source, 'utf8'), { mode: 0o600 })
          await rm(source, { force: true })
        } else {
          throw new ApiError(500, 'could not restore that session log')
        }
      }
      await rm(entryDir, { recursive: true, force: true })
      log.info('restored session %s from trash', manifest.sessionId)
      return { restored: manifest.sessionId, reloadRequired: true }
    },

    '/sessions/trash/purge': async ({ body, method }) => {
      if (method !== 'POST') throw new ApiError(405, 'use POST to purge trash')
      if (!config().sessionAdmin.enabled) throw new ApiError(404, 'session administration is switched off')
      const request = body as { trashId?: unknown; all?: unknown } | undefined

      if (request?.all === true) {
        const rows = await readTrash(trashRoot)
        for (const row of rows) await rm(join(trashRoot, row.id), { recursive: true, force: true })
        return { purged: rows.length }
      }
      const entryId = assertTrashId(request?.trashId)
      await rm(join(trashRoot, entryId), { recursive: true, force: true })
      return { purged: 1 }
    },
  })
}
