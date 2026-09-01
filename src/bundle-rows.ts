import { readFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'

/**
 * Map a bundle package to the loader rows it inserts.
 *
 * This mapping is the whole correctness of the quarantine feature, and it is not
 * the identity function. A bundle's package name and the row id it inserts are
 * different strings by convention:
 *
 *     package dsh-plugin-grok2api-media-tool  →  row id grok2api-media-tool
 *     package @deepseek-ai/dsh-llm-pi-ai      →  row id llm-pi-ai
 *
 * A disable patch targets the ROW ID. Quarantining a package name would write a
 * row that matches nothing and silently fail to disable the plugin — the exact
 * failure a rescue feature cannot have.
 *
 * The ids are read from the bundle's own patch file, which `package.json`
 * points at through `dsh.bundle.patch`. Only `id:` keys are extracted, with a
 * narrow line scan rather than a YAML parser: the file is a short generated
 * list, this reads one field from it, and the alternative is a dependency in
 * the path of a feature whose value is working when other things are broken.
 */

/** Lines like `- id: foo` or `  id: foo`, ignoring comments and quoting. */
const ID_LINE = /^\s*(?:-\s*)?id:\s*(?:'([^']+)'|"([^"]+)"|([^\s#]+))\s*(?:#.*)?$/

/**
 * Extract row ids from a bundle patch document.
 * @param text - the patch file's contents.
 * @returns every `id:` value, in document order, without duplicates.
 */
export function rowIdsFromPatch(text: string): string[] {
  const ids: string[] = []
  for (const line of text.split('\n')) {
    // A `#` comment can mention an id (several shipped patches document theirs
    // in prose); only real keys count.
    const trimmed = line.trimStart()
    if (trimmed.startsWith('#')) continue
    const match = ID_LINE.exec(line)
    const id = match?.[1] ?? match?.[2] ?? match?.[3]
    if (id !== undefined && !ids.includes(id)) ids.push(id)
  }
  return ids
}

/**
 * Resolve one installed bundle's row ids.
 *
 * @param packageJsonPath - absolute path to the bundle's own package.json.
 * @returns the row ids it inserts, or an empty list when it declares no patch.
 */
export async function bundleRowIds(packageJsonPath: string): Promise<string[]> {
  let manifest: { dsh?: { bundle?: { patch?: unknown } } }
  try {
    manifest = JSON.parse(await readFile(packageJsonPath, 'utf8')) as typeof manifest
  } catch {
    return []
  }
  const pointer = manifest.dsh?.bundle?.patch
  if (typeof pointer !== 'string' || pointer.length === 0) return []
  const patchPath = isAbsolute(pointer) ? pointer : resolve(dirname(packageJsonPath), pointer)
  try {
    return rowIdsFromPatch(await readFile(patchPath, 'utf8'))
  } catch {
    return []
  }
}

/**
 * Find an installed package's directory under a profile.
 *
 * Deliberately a path probe rather than `import.meta.resolve`: the target is a
 * dependency of the *profile*, not of this plugin, so this plugin's own
 * resolution scope cannot see it. pnpm's layout still exposes the top-level
 * `node_modules/<name>` symlink, which is what both npm and pnpm installs share.
 */
export function bundleManifestPath(profileDir: string, packageName: string): string {
  return join(profileDir, 'node_modules', ...packageName.split('/'), 'package.json')
}
