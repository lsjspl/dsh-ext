import { lstat, realpath } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, parse, posix, resolve, win32 } from 'node:path'
import type { ReviewUnit } from './command-policy.ts'
import { executableName } from './command-policy.ts'

export interface IntentSession { readonly events?: readonly unknown[] }
export interface UserIntent {
  readonly requests: readonly { messageId: string; seq: number; text: string }[]
  readonly complete: boolean
  readonly issue?: string
}

/** Only provenance-marked human messages may establish intent; never tool/model summaries. */
export function userIntent(session?: IntentSession): UserIntent {
  const requests: { messageId: string; seq: number; text: string }[] = []
  const events = session?.events ?? []
  let size = 0
  for (let i = events.length - 1; i >= 0 && requests.length < 3; i--) {
    const event = events[i] as { type?: string; seq?: number; data?: { id?: string; role?: string; source?: { kind?: string }; content?: { type?: string; text?: string }[] } }
    const message = event?.data
    if (event?.type !== 'user/message' || message?.role !== 'user' || message.source?.kind !== 'user') continue
    const text = Array.isArray(message.content) ? message.content.filter(block => block.type === 'text').map(block => block.text ?? '').join('\n').trim() : ''
    if (!text || !message.id || typeof event.seq !== 'number' || size + text.length > 6000) {
      // Never substitute an older request for a missing/truncated latest request.
      if (!requests.length) return { requests: [], complete: false, issue: 'the latest human request is missing, non-textual or too large to inspect fully' }
      break
    }
    requests.unshift({ messageId: message.id, seq: event.seq, text })
    size += text.length
  }
  return { requests, complete: requests.length > 0, ...(requests.length ? {} : { issue: 'no source-verified human request is available' }) }
}

export interface TargetFact {
  readonly operand: string
  readonly lexicalPath: string | null
  readonly physicalPath: string | null
  readonly exists?: boolean
  readonly isDirectory?: boolean
  readonly wildcard: boolean
  readonly concerns: readonly string[]
}

export interface OperationFact {
  readonly id: string
  readonly command: string
  readonly arguments: readonly string[]
  readonly cwd: string | null
  readonly targets: readonly TargetFact[]
  readonly push?: { remote: string | null; refspecs: readonly string[]; options: readonly string[] }
  readonly concerns: readonly string[]
}

export interface ExpectedEffects {
  readonly operations: readonly OperationFact[]
  readonly confirmationRequired: boolean
}

function samePath(a: string, b: string): boolean {
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b
}

async function physicalTarget(target: string): Promise<{ path: string; exists: boolean; isDirectory?: boolean }> {
  let current = target
  const suffix: string[] = []
  for (let depth = 0; depth < 64; depth++) {
    try {
      const physical = await realpath(current)
      const metadata = suffix.length ? undefined : await lstat(current)
      return { path: join(physical, ...suffix), exists: !suffix.length, isDirectory: metadata?.isDirectory() }
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error
      const parent = dirname(current)
      if (parent === current) throw error
      suffix.unshift(parse(current).base)
      current = parent
    }
  }
  throw new Error('path ancestry exceeds inspection limit')
}

async function targetFact(operand: string, cwd: string | null, workspaceRoot: string | null, signal: AbortSignal): Promise<TargetFact> {
  const concerns: string[] = []
  const wildcardIndex = operand.search(/[?*\[]/)
  const wildcard = wildcardIndex >= 0
  let target = operand
  if (wildcard) {
    const prefix = operand.slice(0, wildcardIndex)
    target = prefix.endsWith('/') || prefix.endsWith('\\') ? prefix : (prefix.match(/^(.*[\\/])/)?.[1] ?? '.')
    concerns.push('wildcard contents were not enumerated; only the containing scope is resolved')
  }
  if (target === '~' || /^~[\\/]/.test(target)) target = join(homedir(), target.slice(2))
  const windowsPath = /^[a-z]:|^\\\\/i.test(target) || !!cwd && /^[a-z]:|^\\\\/i.test(cwd)
  if ((windowsPath && process.platform !== 'win32') || (!windowsPath && process.platform === 'win32' && target.startsWith('/'))) {
    return { operand, lexicalPath: null, physicalPath: null, wildcard, concerns: [...concerns, 'target uses a filesystem namespace this host cannot resolve reliably'] }
  }
  if (!cwd && !isAbsolute(target)) return { operand, lexicalPath: null, physicalPath: null, wildcard, concerns: [...concerns, 'relative target has no verified working directory'] }
  const lexicalPath = resolve(cwd ?? parse(target).root, target)
  let physicalPath: string | null = null
  let exists: boolean | undefined
  let isDirectory: boolean | undefined
  if (signal.aborted) throw new Error('inspection cancelled')
  try {
    const physical = await physicalTarget(lexicalPath)
    physicalPath = physical.path
    exists = physical.exists
    isDirectory = physical.isDirectory
    if (!samePath(physicalPath, lexicalPath)) concerns.push('a symlink or filesystem alias changes the physical target; verify whether this command follows it')
  } catch { concerns.push('physical target could not be verified') }
  for (const path of [lexicalPath, physicalPath].filter((value): value is string => !!value)) {
    const criticalRoots = [parse(path).root, workspaceRoot, homedir()].filter((value): value is string => !!value)
    if (criticalRoots.some(root => {
      const normalized = resolve(root)
      const relative = (process.platform === 'win32' ? win32 : posix).relative(path, normalized)
      return samePath(path, normalized) || !!relative && !relative.startsWith('..') && !isAbsolute(relative)
    })) concerns.push('target covers a filesystem root, home, project root or one of their ancestors')
    if (/(?:^|[\\/])(?:\.git|\.ssh)(?:[\\/]|$)/i.test(path)) concerns.push('target includes repository metadata or credentials')
  }
  return { operand, lexicalPath, physicalPath, exists, isDirectory, wildcard, concerns }
}

/** Read-only observations. Never execute a command, expand a glob, or evaluate a variable. */
export async function inspectExpectedEffects(units: readonly ReviewUnit[], cwd: string | null, workspaceRoot: string | null, signal: AbortSignal, scopeIds?: ReadonlySet<string>): Promise<ExpectedEffects> {
  const operations: OperationFact[] = []
  let confirmationRequired = false
  let changedDirectory = false
  let targetCount = 0
  for (const unit of units) {
    if (signal.aborted) throw new Error('inspection cancelled')
    const concerns: string[] = []
    let name = executableName(unit.words[0] ?? '')
    let args = unit.words.slice(1)
    let structured: Record<string, unknown> | undefined
    if (!unit.words.length && !unit.opaque) {
      try {
        const parsed = JSON.parse(unit.text)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) structured = parsed
      } catch { /* no structured arguments */ }
      const operation = structured?.action ?? structured?.operation ?? structured?.op
      if (/^(delete|remove|unlink|trash|rm)(?:_|\b)/i.test(unit.tool) || ['delete', 'remove', 'unlink'].includes(String(operation))) {
        name = 'rm'
        const paths = structured?.paths ?? structured?.path ?? structured?.filePath ?? structured?.filename
        args = (Array.isArray(paths) ? paths : [paths]).filter((value): value is string => typeof value === 'string')
      }
    }
    if (scopeIds && !scopeIds.has(unit.id)) {
      if (['cd', 'pushd', 'popd', 'set-location'].includes(name)) changedDirectory = true
      continue
    }
    const targets: TargetFact[] = []
    const operationCwd = changedDirectory ? null : cwd
    if (unit.opaque) { concerns.push('executable syntax cannot be fully decomposed'); confirmationRequired = true }
    if (changedDirectory) concerns.push('an earlier operation can change cwd; branch-dependent target paths are unresolved')
    const pathCommand = ['rm', 'rmdir', 'rd', 'del', 'erase', 'unlink', 'remove-item', 'ri', 'mkdir', 'touch', 'cp', 'mv', 'copy-item', 'move-item', 'set-content', 'add-content'].includes(name)
    if (pathCommand) {
      let positional = false
      for (const arg of args) {
        if (arg === '--') { positional = true; continue }
        if (!positional && (arg.startsWith('-') || /^\/[sqafp]$/i.test(arg))) {
          if (!/^(-[a-zA-Z]+|--(?:recursive|force|verbose|parents|preserve-root|no-preserve-root)|-(?:Path|LiteralPath|Recurse|Force|Confirm|WhatIf))$/i.test(arg)) {
            concerns.push(`option ${arg} needs semantic inspection`)
          }
          continue
        }
        if (targetCount++ >= 32 || /[$`{},]/.test(arg) || !arg.length) {
          concerns.push('one or more target operands are dynamic, empty or exceed inspection limits')
          confirmationRequired = true
          continue
        }
        const target = await targetFact(arg, operationCwd, workspaceRoot, signal)
        targets.push(target)
        if (target.physicalPath === null || target.concerns.some(concern => /symlink|covers|metadata/.test(concern))) confirmationRequired = true
      }
      if (!targets.length) { concerns.push('no concrete target could be established'); confirmationRequired = true }
    }
    const pushIndex = name === 'git' ? args.indexOf('push') : -1
    let push: OperationFact['push']
    if (pushIndex >= 0) {
      const pushArgs = args.slice(pushIndex + 1)
      const positional = pushArgs.filter(arg => !arg.startsWith('-'))
      push = { remote: positional[0] ?? null, refspecs: positional.slice(1), options: pushArgs.filter(arg => arg.startsWith('-')) }
      if (!push.remote || !push.refspecs.length) { concerns.push('implicit push remote/refspec has not been verified'); confirmationRequired = true }
      if (args.slice(0, pushIndex).some(arg => arg.startsWith('-'))) { concerns.push('Git global options may change repository or configuration'); confirmationRequired = true }
    } else if (/^(?:git[_.\/-]push|push[_.\/-]git)(?:$|[_.\/-])/i.test(unit.tool)) {
      const remote = structured?.remote
      const ref = structured?.refspec ?? structured?.branch
      push = { remote: typeof remote === 'string' ? remote : null, refspecs: typeof ref === 'string' ? [ref] : [], options: structured?.force === true ? ['--force'] : [] }
      if (!push.remote || !push.refspecs.length) { concerns.push('structured push targets are incomplete'); confirmationRequired = true }
    }
    operations.push({ id: unit.id, command: unit.text, arguments: unit.words, cwd: operationCwd, targets, push, concerns })
    if (['cd', 'pushd', 'popd', 'set-location'].includes(name)) changedDirectory = true
  }
  return { operations, confirmationRequired }
}
