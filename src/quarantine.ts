import { readFile } from 'node:fs/promises'
import { writeFileAtomic, withFileLock } from '@deepseek-ai/dsh-atomic-write'

/**
 * The quarantine store, shared by the plugin's settings page and the `dsh-ext`
 * rescue CLI.
 *
 * Two files, one fact:
 *
 *   - `quarantine.json` (this plugin's own directory) is the record of intent.
 *   - `$DSH_HOME/cordis.patch.yml` is what the launcher actually reads. The
 *     home patch layer is composed AFTER every bundle layer and after the
 *     profile's own layer, so a `{id, disabled: true}` row written there wins
 *     over whatever enabled the plugin — which is the property that makes this
 *     work for a plugin that breaks the boot, since nothing of ours needs to
 *     have loaded first.
 *
 * Only the region between the two sentinels is ever rewritten. A user's own
 * patch entries live outside it and survive every operation here, because the
 * alternative — owning the whole file — would mean this plugin's convenience
 * feature could silently drop someone's hand-written composition.
 */

export const BEGIN_MARK = '# >>> dsh-dev-tool-ext: quarantine (managed; edit via Settings or `dsh-ext`) >>>'
export const END_MARK = '# <<< dsh-dev-tool-ext: quarantine <<<'

export interface QuarantineRecord {
  /** Loader row ids to disable on the next start. */
  readonly rows: readonly string[]
  /** When the record was last written, for the settings page. */
  readonly updatedAt: number
}

const EMPTY: QuarantineRecord = { rows: [], updatedAt: 0 }

/**
 * A loader row id or package name; anything else is refused before it reaches
 * YAML. The leading `@` is allowed because a scoped package (`@scope/name`) is
 * both a legitimate bundle name and the most common spelling a user supplies.
 */
export function isRowId(value: unknown): value is string {
  return typeof value === 'string' && /^@?[a-zA-Z0-9][a-zA-Z0-9._@/-]{0,120}$/.test(value)
}

export async function readQuarantine(file: string): Promise<QuarantineRecord> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as { rows?: unknown; updatedAt?: unknown }
    const rows = Array.isArray(parsed.rows) ? parsed.rows.filter(isRowId) : []
    return { rows, updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0 }
  } catch {
    return EMPTY
  }
}

/**
 * Render the managed region. Deliberately hand-written YAML rather than a
 * serializer dependency: the shape is a flat list of two-key mappings, the ids
 * are already validated against {@link isRowId}, and this file is read by a
 * rescue path whose whole value is not needing anything else to work.
 */
export function renderRegion(rows: readonly string[]): string {
  if (rows.length === 0) return ''
  const lines = [
    BEGIN_MARK,
    '# Each row below is disabled at boot. Remove a row (or clear this whole',
    '# block) to bring that plugin back on the next start.',
    ...rows.map(row => `- id: ${row}\n  disabled: true`),
    END_MARK,
  ]
  return `${lines.join('\n')}\n`
}

/**
 * Replace the managed region inside an existing patch file, preserving
 * everything outside it.
 *
 * A patch file is a top-level YAML array. An empty one is conventionally the
 * literal `[]`, which cannot coexist with list items — so when the remaining
 * content is just that placeholder, it is dropped rather than appended to.
 */
export function spliceRegion(existing: string, rows: readonly string[]): string {
  const begin = existing.indexOf(BEGIN_MARK)
  const end = existing.indexOf(END_MARK)
  let outside: string
  if (begin >= 0 && end > begin) {
    outside = existing.slice(0, begin) + existing.slice(end + END_MARK.length)
  } else {
    outside = existing
  }

  // An `[]` placeholder is the empty list, not a sibling of list entries.
  const withoutPlaceholder = outside.replace(/^\s*\[\s*\]\s*$/m, '')
  const trimmed = withoutPlaceholder.replace(/\n{3,}/g, '\n\n').trim()
  const region = renderRegion(rows)

  if (region.length === 0) {
    // Nothing quarantined: leave a valid empty list when nothing else remains.
    const hasEntries = /^\s*-\s/m.test(trimmed)
    if (trimmed.length === 0) return '[]\n'
    return hasEntries ? `${trimmed}\n` : `${trimmed}\n[]\n`
  }
  return trimmed.length === 0 ? region : `${trimmed}\n\n${region}`
}

/**
 * Write both files as one operation under the record's own lock.
 *
 * The lock is on the record rather than the patch file because the record is
 * what two writers race over (the settings page and the CLI); the patch file is
 * then rendered from the committed record, so a lost race cannot leave the two
 * disagreeing.
 *
 * @param recordFile - this plugin's `quarantine.json`.
 * @param patchFile - the harness home patch file the launcher reads.
 * @param mutate - receives the current rows and returns the next set.
 * @returns the committed record.
 */
export async function updateQuarantine(
  recordFile: string,
  patchFile: string,
  mutate: (rows: readonly string[]) => readonly string[],
): Promise<QuarantineRecord> {
  // The lock helper needs the parent directory to exist; writeFileAtomic
  // creates it, so seed the record first when it is missing.
  const current = await readQuarantine(recordFile)
  await writeFileAtomic(recordFile, JSON.stringify(current, null, 2), { mode: 0o600, dirMode: 0o700 })

  return await withFileLock(recordFile, async () => {
    const before = await readQuarantine(recordFile)
    const next = [...new Set(mutate(before.rows).filter(isRowId))].sort()
    const record: QuarantineRecord = { rows: next, updatedAt: Date.now() }

    let existing = ''
    try {
      existing = await readFile(patchFile, 'utf8')
    } catch { /* a home patch file that does not exist yet is an empty one */ }

    // The patch file goes first: a record claiming a quarantine that the
    // launcher will not honour is the one inconsistency with a bad outcome.
    await writeFileAtomic(patchFile, spliceRegion(existing, next), { mode: 0o600, dirMode: 0o700 })
    await writeFileAtomic(recordFile, JSON.stringify(record, null, 2), { mode: 0o600, dirMode: 0o700 })
    return record
  }, { waitMs: 10_000 })
}
