/**
 * Checks the plugin's pure functions against the cases that actually break
 * parsers: paths with spaces and non-ASCII bytes, rename records, models that
 * wrap JSON in prose, and a patch file with hand-written entries around the
 * managed region.
 *
 * Run with `node scripts/verify-parsers.mjs`.
 */

import { build } from 'esbuild'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outDir = mkdtempSync(join(tmpdir(), 'dsh-parsers-'))
const bundle = join(process.cwd(), 'lib', 'parsers.verify.mjs')

// One bundle with every module under test re-exported, so the sources compile
// exactly as they ship.
const { writeFileSync } = await import('node:fs')
// The entry sits beside the sources so esbuild resolves and bundles them rather
// than treating an absolute URL as an external it should leave alone.
const entry = join(process.cwd(), 'src', 'parsers.verify.entry.ts')
writeFileSync(entry, `
export { parseStatus, parseNumstat } from './features/explorer.ts'
export { commandText, parseVerdict } from './features/command-review.ts'
export { spliceRegion, renderRegion, isRowId } from './quarantine.ts'
`)

await build({
  entryPoints: [entry],
  outfile: bundle,
  bundle: true,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  logLevel: 'error',
})

const mod = await import(pathToFileURL(bundle).href)

let failures = 0
function check(label, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  const ok = a === e
  if (!ok) failures += 1
  process.stdout.write(`  ${ok ? 'PASS' : 'FAIL'}  ${label}\n`)
  if (!ok) process.stdout.write(`          expected ${e}\n          actual   ${a}\n`)
}

const NUL = '\0'

process.stdout.write('\ngit status --porcelain -z parsing:\n')

check('a plain modification',
  mod.parseStatus(` M src/app.ts${NUL}`),
  [{ path: 'src/app.ts', from: undefined, index: ' ', worktree: 'M', staged: false, untracked: false }])

check('a staged addition',
  mod.parseStatus(`A  new.ts${NUL}`),
  [{ path: 'new.ts', from: undefined, index: 'A', worktree: ' ', staged: true, untracked: false }])

check('an untracked file',
  mod.parseStatus(`?? scratch.txt${NUL}`),
  [{ path: 'scratch.txt', from: undefined, index: '?', worktree: '?', staged: false, untracked: true }])

// The case that defeats a naive line-splitting parser: a rename carries TWO
// paths, and the original arrives as the following NUL-delimited field.
check('a rename consumes its second path',
  mod.parseStatus(`R  after.ts${NUL}before.ts${NUL} M other.ts${NUL}`),
  [
    { path: 'after.ts', from: 'before.ts', index: 'R', worktree: ' ', staged: true, untracked: false },
    { path: 'other.ts', from: undefined, index: ' ', worktree: 'M', staged: false, untracked: false },
  ])

check('a path containing spaces survives',
  mod.parseStatus(` M src/my file with spaces.ts${NUL}`),
  [{ path: 'src/my file with spaces.ts', from: undefined, index: ' ', worktree: 'M', staged: false, untracked: false }])

check('a non-ASCII path survives',
  mod.parseStatus(` M 文档/说明.md${NUL}`),
  [{ path: '文档/说明.md', from: undefined, index: ' ', worktree: 'M', staged: false, untracked: false }])

// A newline inside a path is legal on POSIX and is exactly why -z is required.
check('a path containing a newline survives',
  mod.parseStatus(` M we\nird.txt${NUL}`),
  [{ path: 'we\nird.txt', from: undefined, index: ' ', worktree: 'M', staged: false, untracked: false }])

check('a conflicted file', mod.parseStatus(`UU both.ts${NUL}`)[0].index, 'U')
check('empty output yields no rows', mod.parseStatus(''), [])
check('a truncated record is skipped', mod.parseStatus(`X${NUL}`), [])

process.stdout.write('\ngit numstat -z parsing:\n')

// A rename carries its original path as a fourth tab field; the KEY must stay
// the new path — the one porcelain names too — not the last field.
check('counts land on the added/removed pair',
  mod.parseNumstat(`12\t3\tsrc/app.ts${NUL}`).get('src/app.ts'),
  { added: 12, removed: 3 })

check('a rename keys the new path',
  mod.parseNumstat(`1\t0\tnew.ts\told.ts${NUL}`).get('new.ts'),
  { added: 1, removed: 0 })
check('a rename does not key the old path',
  mod.parseNumstat(`1\t0\tnew.ts\told.ts${NUL}`).has('old.ts'),
  false)

check('a binary file yields no entry',
  mod.parseNumstat(`-\t-\tblob.png${NUL}`).has('blob.png'),
  false)

// The status reader parses the staged and unstaged numstats into one map, so a
// file changed on both sides accumulates: the sum is the change versus HEAD.
check('duplicate paths accumulate',
  mod.parseNumstat(`1\t2\ta.ts${NUL}3\t4\ta.ts${NUL}`).get('a.ts'),
  { added: 4, removed: 6 })

check('a path containing spaces survives',
  mod.parseNumstat(`5\t6\tsrc/my file with spaces.ts${NUL}`).get('src/my file with spaces.ts'),
  { added: 5, removed: 6 })

check('empty output yields no entries', [...mod.parseNumstat('')], [])

process.stdout.write('\ncommand extraction:\n')

check('the command field', mod.commandText({ command: 'rm -rf /tmp/x' }), 'rm -rf /tmp/x')
check('a cmd alias', mod.commandText({ cmd: 'ls' }), 'ls')
check('a bare string', mod.commandText('echo hi'), 'echo hi')
check('field precedence prefers command', mod.commandText({ script: 'b', command: 'a' }), 'a')
check('a blank command falls through to the next field', mod.commandText({ command: '   ', cmd: 'real' }), 'real')
// An unrecognized shape must still be reviewed rather than waved through.
check('an unknown shape serializes the whole argument object',
  mod.commandText({ mystery: 'sudo rm -rf /' }), '{"mystery":"sudo rm -rf /"}')
check('no reviewable text', mod.commandText({}), '{}')

process.stdout.write('\nreviewer verdict parsing:\n')

check('a bare object',
  mod.parseVerdict('{"verdict":"deny","reason":"wipes the disk"}'),
  { verdict: 'deny', reason: 'wipes the disk' })
check('json inside a fenced block',
  mod.parseVerdict('Here is my answer:\n```json\n{"verdict":"ask","reason":"consequential"}\n```\n'),
  { verdict: 'ask', reason: 'consequential' })
check('json with trailing prose',
  mod.parseVerdict('{"verdict":"allow","reason":"ordinary build"} — hope that helps'),
  { verdict: 'allow', reason: 'ordinary build' })
check('a missing reason still parses', mod.parseVerdict('{"verdict":"allow"}'),
  { verdict: 'allow', reason: 'the reviewer gave no reason' })
check('an unknown verdict is refused', mod.parseVerdict('{"verdict":"maybe"}'), undefined)
check('prose with no json is refused', mod.parseVerdict('I think it is fine.'), undefined)
check('malformed json is refused', mod.parseVerdict('{"verdict":'), undefined)
check('an empty answer is refused', mod.parseVerdict(''), undefined)

process.stdout.write('\nquarantine patch splicing:\n')

const handWritten = '# mine\n- id: my-row\n  config:\n    a: 1\n'
const spliced = mod.spliceRegion(handWritten, ['bad-plugin'])
check('a hand-written entry survives', spliced.includes('- id: my-row'), true)
check('the disable row is added', spliced.includes('- id: bad-plugin\n  disabled: true'), true)
check('re-splicing does not duplicate the region',
  (mod.spliceRegion(spliced, ['bad-plugin']).match(/dsh-dev-tool-ext: quarantine \(managed/g) ?? []).length, 1)
check('removing every row restores the hand-written file',
  mod.spliceRegion(spliced, []).trim(), handWritten.trim())
check('an empty-list placeholder is replaced, not appended to',
  mod.spliceRegion('[]\n', ['x']).includes('[]'), false)
check('clearing an empty file yields a valid empty list', mod.spliceRegion('', []), '[]\n')
check('a missing file is treated as empty', mod.spliceRegion('', ['x']).startsWith('# >>>'), true)

process.stdout.write('\nrow-id validation:\n')
check('a scoped package is a valid id', mod.isRowId('@scope/name'), true)
check('a plain row id is valid', mod.isRowId('dsh-plugin-thing'), true)
check('a loader row name with dots is valid', mod.isRowId('a.b.c'), true)
// These are the ones that must never reach a YAML document.
check('a newline is refused', mod.isRowId('a\nb: c'), false)
check('a leading dash is refused', mod.isRowId('-evil'), false)
check('a quote is refused', mod.isRowId('a"b'), false)
check('a space is refused', mod.isRowId('a b'), false)
check('an empty string is refused', mod.isRowId(''), false)
check('a non-string is refused', mod.isRowId(null), false)

rmSync(bundle, { force: true })
rmSync(entry, { force: true })
rmSync(outDir, { recursive: true, force: true })

process.stdout.write(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}\n`)
process.exitCode = failures === 0 ? 0 : 1
