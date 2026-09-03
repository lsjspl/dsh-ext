#!/usr/bin/env node
/**
 * `dsh-ext` — the rescue half of the plugin-safety feature.
 *
 * This exists because of one hard constraint: a plugin cannot rescue a harness
 * it is composed into. When a third-party plugin throws during boot, the whole
 * tree fails and every in-app surface — including this plugin's own settings
 * page — is unreachable. So the recovery path has to live outside.
 *
 * Accordingly this file:
 *   - imports NOTHING, not from the harness and not from npm. Node's standard
 *     library only. A rescue tool that can fail to resolve its own dependencies
 *     is not a rescue tool.
 *   - is plain `.mjs`, shipped as authored rather than bundled, so it runs even
 *     if this package's build output is broken.
 *   - writes the same two files the in-app feature writes, in the same format,
 *     so the two halves are interchangeable and never disagree.
 *
 * The mechanism it uses is the launcher's own: `$DSH_HOME/cordis.patch.yml` is
 * composed AFTER every bundle layer and after the profile's own layer, so a
 * `{id, disabled: true}` row written there outranks whatever enabled the
 * plugin. Nothing of ours needs to have loaded for that to take effect.
 *
 * Usage:
 *   dsh-ext list [--profile <name>]
 *   dsh-ext skip <plugin>...          disable plugins on the next start
 *   dsh-ext unskip <plugin>...        undo a skip
 *   dsh-ext safe [--profile <name>]   disable every third-party plugin
 *   dsh-ext restore                   clear the whole quarantine list
 *   dsh-ext status
 *   dsh-ext uninstall <plugin> [--profile <name>]
 */

import { readFile, writeFile, readdir, rename, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const PLUGIN_DIR = 'dsh-ext'
const PATCH_FILE = 'cordis.patch.yml'
const RECORD_FILE = 'quarantine.json'

const BEGIN_MARK = '# >>> dsh-ext: quarantine (managed; edit via Settings or `dsh-ext`) >>>'
const END_MARK = '# <<< dsh-ext: quarantine <<<'
const LEGACY_BEGIN_MARK = '# >>> dsh-dev-tool-ext: quarantine (managed; edit via Settings or `dsh-ext`) >>>'
const LEGACY_END_MARK = '# <<< dsh-dev-tool-ext: quarantine <<<'

/** Bundles that ship with dsh itself. Never disabled by `safe`. */
const BUILTIN_PREFIX = '@deepseek-ai/dsh'

/** Resolve the harness home exactly as `@deepseek-ai/dsh-home-paths` does. */
function dshHome() {
  const override = process.env.DSH_HOME
  if (override !== undefined && override.trim().length > 0) return resolve(override)
  return join(homedir(), '.dsh')
}

const home = dshHome()
const patchPath = join(home, PATCH_FILE)
const recordPath = join(home, PLUGIN_DIR, RECORD_FILE)

/**
 * A loader row id or package name. The leading `@` is allowed because a scoped
 * package (`@scope/name`) is both a legitimate bundle name and exactly what a
 * user types — rejecting it would report "not a plugin name" for the most
 * common spelling there is.
 */
function isRowId(value) {
  return typeof value === 'string' && /^@?[a-zA-Z0-9][a-zA-Z0-9._@/-]{0,120}$/.test(value)
}

function isBuiltin(name) {
  return name.startsWith(BUILTIN_PREFIX)
}

async function readText(path) {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return ''
  }
}

async function readQuarantine() {
  try {
    const parsed = JSON.parse(await readFile(recordPath, 'utf8'))
    return Array.isArray(parsed?.rows) ? parsed.rows.filter(isRowId) : []
  } catch {
    return []
  }
}

/**
 * Render the managed region. Hand-written YAML: the shape is a flat list of
 * two-key mappings and the ids are validated, so a serializer would be a
 * dependency bought for nothing — and dependencies are what this file cannot have.
 */
function renderRegion(rows) {
  if (rows.length === 0) return ''
  return [
    BEGIN_MARK,
    '# Each row below is disabled at boot. Remove a row (or clear this whole',
    '# block) to bring that plugin back on the next start.',
    ...rows.map(row => `- id: ${row}\n  disabled: true`),
    END_MARK,
  ].join('\n') + '\n'
}

/** Replace the managed region, preserving every hand-written entry outside it. */
function spliceRegion(existing, rows) {
  let outside = existing
  for (const [beginMark, endMark] of [[BEGIN_MARK, END_MARK], [LEGACY_BEGIN_MARK, LEGACY_END_MARK]]) {
    const begin = outside.indexOf(beginMark)
    const end = outside.indexOf(endMark)
    if (begin >= 0 && end > begin) {
      outside = outside.slice(0, begin) + outside.slice(end + endMark.length)
    }
  }

  // An `[]` placeholder is the empty list, not a sibling of list entries.
  const trimmed = outside.replace(/^\s*\[\s*\]\s*$/m, '').replace(/\n{3,}/g, '\n\n').trim()
  const region = renderRegion(rows)
  if (region.length === 0) {
    if (trimmed.length === 0) return '[]\n'
    return /^\s*-\s/m.test(trimmed) ? `${trimmed}\n` : `${trimmed}\n[]\n`
  }
  return trimmed.length === 0 ? region : `${trimmed}\n\n${region}`
}

/** Write both files. The patch file first: it is the one the launcher reads. */
async function writeQuarantine(rows) {
  const unique = [...new Set(rows.filter(isRowId))].sort()
  await mkdir(home, { recursive: true })
  await mkdir(join(home, PLUGIN_DIR), { recursive: true })

  const existing = await readText(patchPath)
  // A backup on the first write, so a hand-edited patch file is recoverable
  // even if this tool's splice gets something wrong.
  if (existing.length > 0 && !existing.includes(BEGIN_MARK)) {
    await writeFile(`${patchPath}.bak-dsh-ext`, existing, 'utf8')
  }
  await writeFile(patchPath, spliceRegion(existing, unique), 'utf8')
  await writeFile(recordPath, JSON.stringify({ rows: unique, updatedAt: Date.now() }, null, 2), 'utf8')
  return unique
}

// ── package name → loader row id ───────────────────────────────────────────

/**
 * A bundle's package name and the loader row it inserts are DIFFERENT strings:
 *
 *     dsh-plugin-grok2api-media-tool  →  row id grok2api-media-tool
 *     @deepseek-ai/dsh-llm-pi-ai      →  row id llm-pi-ai
 *
 * A disable patch targets the row id. Writing a package name would produce a row
 * that matches nothing and silently fail to disable the plugin — unacceptable in
 * the tool someone reaches for when their harness will not start. The ids come
 * from the bundle's own patch file, which its package.json points at through
 * `dsh.bundle.patch`.
 *
 * Only `id:` keys are read, by line scan. A YAML parser would be a dependency,
 * and this file has none by design.
 */
const ID_LINE = /^\s*(?:-\s*)?id:\s*(?:'([^']+)'|"([^"]+)"|([^\s#]+))\s*(?:#.*)?$/

function rowIdsFromPatch(text) {
  const ids = []
  for (const line of text.split('\n')) {
    // Several shipped patch files document their own id in a comment.
    if (line.trimStart().startsWith('#')) continue
    const match = ID_LINE.exec(line)
    const id = match?.[1] ?? match?.[2] ?? match?.[3]
    if (id !== undefined && !ids.includes(id)) ids.push(id)
  }
  return ids
}

async function bundleRowIds(profileDir, packageName) {
  const manifestPath = join(profileDir, 'node_modules', ...packageName.split('/'), 'package.json')
  let manifest
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch {
    return []
  }
  const pointer = manifest?.dsh?.bundle?.patch
  if (typeof pointer !== 'string' || pointer.length === 0) return []
  try {
    return rowIdsFromPatch(await readFile(resolve(join(profileDir, 'node_modules', ...packageName.split('/')), pointer), 'utf8'))
  } catch {
    return []
  }
}

// ── profile inventory ──────────────────────────────────────────────────────

/**
 * Read one profile's composition without a YAML parser: the bundles list and
 * dependency map both live in `package.json`, which is JSON.
 */
async function readProfile(name) {
  const dir = join(home, 'profiles', name)
  try {
    const manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
    const bundles = manifest?.dsh?.profile?.bundles
    return {
      name,
      dir,
      bundles: Array.isArray(bundles) ? bundles.filter(row => typeof row === 'string') : [],
      dependencies: manifest?.dependencies ?? {},
    }
  } catch {
    return undefined
  }
}

async function listProfiles() {
  try {
    const names = await readdir(join(home, 'profiles'))
    const profiles = []
    for (const name of names) {
      const profile = await readProfile(name)
      if (profile !== undefined) profiles.push(profile)
    }
    return profiles
  } catch {
    return []
  }
}

/** Every plugin this installation knows, with where it came from and what rows it inserts. */
async function inventory(profileName) {
  const profiles = profileName === undefined
    ? await listProfiles()
    : [await readProfile(profileName)].filter(Boolean)
  const found = new Map()
  for (const profile of profiles) {
    for (const name of new Set([...profile.bundles, ...Object.keys(profile.dependencies)])) {
      if (found.has(name)) continue
      found.set(name, {
        name,
        profile: profile.name,
        composed: profile.bundles.includes(name),
        version: profile.dependencies[name],
        rows: await bundleRowIds(profile.dir, name),
      })
    }
  }
  return [...found.values()]
}

/**
 * Resolve user-supplied names to rows to disable.
 *
 * A name is accepted as either the package name or a row id directly, because
 * someone reading a boot failure has the row id in front of them — the error
 * names the row, not the package — and being made to translate it by hand is
 * exactly the friction this command exists to remove.
 */
async function resolveTargets(names, profileName) {
  const rows = await inventory(profileName)
  const resolved = []
  const unknown = []
  for (const name of names) {
    const byPackage = rows.find(row => row.name === name)
    if (byPackage !== undefined && byPackage.rows.length > 0) {
      resolved.push({ name, rows: byPackage.rows })
      continue
    }
    const byRow = rows.find(row => row.rows.includes(name))
    if (byRow !== undefined) {
      resolved.push({ name: byRow.name, rows: [name] })
      continue
    }
    // Not resolvable from any manifest. Taken at face value as a row id rather
    // than refused: a plugin whose package was already removed, or one composed
    // by a bundle this tool cannot see, still has to be disableable.
    resolved.push({ name, rows: [name], assumed: true })
    unknown.push(name)
  }
  return { resolved, unknown }
}

// ── commands ───────────────────────────────────────────────────────────────

function usage() {
  process.stdout.write(`dsh-ext — start a DeepSeek Harness that a plugin is preventing from booting

  dsh-ext status                     what is quarantined right now
  dsh-ext list [--profile <name>]    plugins this installation knows
  dsh-ext skip <plugin>...           disable plugins on the next start
  dsh-ext unskip <plugin>...         undo a skip
  dsh-ext safe [--profile <name>]    disable every third-party plugin at once
  dsh-ext restore                    clear the quarantine list entirely
  dsh-ext uninstall <plugin> [--profile <name>]
                                     remove a plugin from a profile (runs dsh plugin remove)

Quarantine is written to:
  ${patchPath}
It is composed after every bundle layer, so a disabled row wins. Start the
harness normally afterwards — no extra flags needed.
`)
}

async function commandStatus() {
  const rows = await readQuarantine()
  if (rows.length === 0) {
    process.stdout.write('Nothing is quarantined.\n')
    return 0
  }
  process.stdout.write(`Quarantined (${rows.length}), effective on the next start:\n`)
  for (const row of rows) process.stdout.write(`  ${row}\n`)
  process.stdout.write(`\nPatch file: ${patchPath}\n`)
  return 0
}

async function commandList(profileName) {
  const rows = await inventory(profileName)
  if (rows.length === 0) {
    process.stdout.write(`No profiles found under ${join(home, 'profiles')}\n`)
    return 1
  }
  const quarantined = new Set(await readQuarantine())
  const width = Math.max(...rows.map(row => row.name.length))
  for (const row of rows.sort((a, b) => Number(isBuiltin(a.name)) - Number(isBuiltin(b.name)) || a.name.localeCompare(b.name))) {
    const off = row.rows.length > 0 && row.rows.every(id => quarantined.has(id))
    const marks = [
      off ? 'quarantined' : undefined,
      isBuiltin(row.name) ? 'built-in' : undefined,
      row.composed ? undefined : 'installed, not composed',
      row.rows.length === 0 ? 'no loader row' : undefined,
    ].filter(Boolean).join(', ')
    // The row id is printed because it is what a boot failure names and what a
    // disable patch targets — a user comparing the two needs both visible.
    const ids = row.rows.length > 0 && row.rows.join(',') !== row.name ? `  → ${row.rows.join(', ')}` : ''
    process.stdout.write(`  ${row.name.padEnd(width)}  ${row.profile}${ids}${marks.length > 0 ? `  (${marks})` : ''}\n`)
  }
  return 0
}

async function commandSkip(names, add, profileName) {
  const invalid = names.filter(name => !isRowId(name))
  if (invalid.length > 0) {
    process.stderr.write(`Not a plugin name: ${invalid.join(', ')}\n`)
    return 2
  }
  if (add) {
    const builtin = names.filter(isBuiltin)
    if (builtin.length > 0) {
      // Refusing this is the line between a rescue tool and a way to break a
      // working harness.
      process.stderr.write(`Refusing to disable part of the harness itself: ${builtin.join(', ')}\n`)
      return 2
    }
  }

  const { resolved, unknown } = await resolveTargets(names, profileName)
  const targetRows = resolved.flatMap(entry => entry.rows)
  const current = await readQuarantine()
  const next = add
    ? [...current, ...targetRows]
    : current.filter(row => !targetRows.includes(row))
  const written = await writeQuarantine(next)

  for (const entry of resolved) {
    const detail = entry.rows.join(', ') === entry.name ? '' : ` (row ${entry.rows.join(', ')})`
    process.stdout.write(`${add ? 'Quarantined' : 'Released'} ${entry.name}${detail}\n`)
  }
  if (unknown.length > 0) {
    process.stdout.write(`\nNote: ${unknown.join(', ')} matched no installed package, so ${unknown.length === 1 ? 'it was' : 'they were'} treated as loader row id${unknown.length === 1 ? '' : 's'} directly.\n`)
  }
  process.stdout.write(written.length === 0
    ? 'Nothing is quarantined now. Start the harness normally.\n'
    : `\nQuarantined rows (${written.length}): ${written.join(', ')}\nStart the harness normally.\n`)
  return 0
}

async function commandSafe(profileName) {
  const rows = await inventory(profileName)
  const third = rows.filter(row => !isBuiltin(row.name) && row.rows.length > 0)
  if (third.length === 0) {
    process.stdout.write('No third-party plugins with a loader row are installed; nothing to disable.\n')
    return 0
  }
  const written = await writeQuarantine([...await readQuarantine(), ...third.flatMap(row => row.rows)])
  process.stdout.write(`Safe mode: disabled ${third.length} third-party plugin(s).\n`)
  for (const row of third) {
    process.stdout.write(`  ${row.name} → ${row.rows.join(', ')}\n`)
  }
  process.stdout.write(`\nQuarantined rows (${written.length}). Start the harness normally, then re-enable\nthem one at a time with\n  dsh-ext unskip <plugin>\n`)
  return 0
}

async function commandRestore() {
  await writeQuarantine([])
  process.stdout.write('Quarantine cleared; every plugin loads on the next start.\n')
  return 0
}

/**
 * Remove a plugin from a profile through the launcher's own plugin management,
 * which owns the manifest and the lockfile. This tool edits neither — an
 * uninstall that left `dsh.profile.bundles` naming a package pnpm had removed
 * would produce a harness that fails to boot for a new reason.
 */
async function commandUninstall(name, profileName) {
  if (!isRowId(name)) {
    process.stderr.write(`Not a plugin name: ${name}\n`)
    return 2
  }
  if (isBuiltin(name)) {
    process.stderr.write('That is part of the harness itself; not uninstalling it.\n')
    return 2
  }
  const profile = profileName ?? 'web'
  const { resolved } = await resolveTargets([name], profileName)
  const targetRows = resolved.flatMap(entry => entry.rows)
  // Quarantine first: if the uninstall fails halfway, the next start still
  // comes up without the plugin.
  await writeQuarantine([...await readQuarantine(), ...targetRows])
  process.stdout.write(`Quarantined ${name} (row ${targetRows.join(', ')}), then removing it from profile ${profile}…\n`)

  const code = await new Promise((done) => {
    const child = spawn('dsh', ['plugin', '--profile', profile, 'remove', name], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('error', () => { done(-1) })
    child.on('close', exit => { done(exit ?? 1) })
  })

  if (code === -1) {
    process.stderr.write('Could not run `dsh`. The plugin is quarantined, so the harness will start without it;\nremove it manually with:\n  dsh plugin --profile ' + profile + ' remove ' + name + '\n')
    return 1
  }
  if (code !== 0) {
    process.stderr.write(`\n\`dsh plugin remove\` exited ${code}. The plugin stays quarantined, so the harness will still start.\n`)
    return code
  }
  // The package is gone, so disable rows naming it are no longer needed — and a
  // stale row would be a puzzle for whoever reinstalls it later.
  await writeQuarantine((await readQuarantine()).filter(row => !targetRows.includes(row)))
  process.stdout.write(`Removed ${name} and cleared its quarantine entries.\n`)
  return 0
}

function readFlag(args, flag) {
  const index = args.indexOf(flag)
  if (index < 0) return { value: undefined, rest: args }
  const value = args[index + 1]
  if (value === undefined || value.startsWith('-')) return { value: undefined, rest: args }
  return { value, rest: [...args.slice(0, index), ...args.slice(index + 2)] }
}

async function main(argv) {
  const [command, ...raw] = argv
  const { value: profile, rest } = readFlag(raw, '--profile')

  switch (command) {
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      usage()
      return 0
    case 'status': return await commandStatus()
    case 'list': return await commandList(profile)
    case 'skip': return rest.length === 0 ? (usage(), 2) : await commandSkip(rest, true, profile)
    case 'unskip': return rest.length === 0 ? (usage(), 2) : await commandSkip(rest, false, profile)
    case 'safe': return await commandSafe(profile)
    case 'restore': return await commandRestore()
    case 'uninstall':
      return rest[0] === undefined ? (usage(), 2) : await commandUninstall(rest[0], profile)
    default:
      process.stderr.write(`Unknown command: ${command}\n\n`)
      usage()
      return 2
  }
}

main(process.argv.slice(2)).then(
  (code) => { process.exitCode = code },
  (error) => {
    process.stderr.write(`dsh-ext failed: ${error?.message ?? error}\n`)
    process.exitCode = 1
  },
)
