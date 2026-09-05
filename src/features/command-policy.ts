import { posix, win32 } from 'node:path'

/**
 * A deliberately restricted shell grammar, not a general shell interpreter.
 * Only literal words and command separators are understood. Expansion, script
 * blocks, redirection and unsupported syntax require review, never exemption.
 */
export interface CommandWords {
  readonly commands: readonly string[][]
  readonly segments: readonly { text: string; words: string[] }[]
  readonly uncertain: boolean
}

export function commandWords(source: string): CommandWords {
  const commands: string[][] = []
  const segments: { text: string; words: string[] }[] = []
  let segmentStart = 0
  let words: string[] = []
  let word = ''
  let started = false
  let quote = ''
  let uncertain = false
  const endWord = () => {
    if (started) words.push(word)
    word = ''
    started = false
  }
  const endCommand = (end: number) => {
    endWord()
    if (words.length) {
      commands.push(words)
      segments.push({ text: source.slice(segmentStart, end).trim(), words })
    }
    words = []
  }
  for (let i = 0; i < source.length; i++) {
    const char = source[i]!
    if (quote) {
      if (char === quote) {
        // Adjacent quotes have different meanings in POSIX and PowerShell.
        if (quote === "'" && source[i + 1] === "'") { word += "'"; uncertain = true; i++ }
        else quote = ''
      } else {
        if (quote === '"' && /[$`\\]/.test(char)) uncertain = true
        word += char
      }
      continue
    }
    if (char === "'" || char === '"') { quote = char; started = true; continue }
    if (char === '#' && !started) {
      while (i + 1 < source.length && source[i + 1] !== '\n') i++
      continue
    }
    if (/[$`\\(){}<>\u0000]/.test(char)) uncertain = true
    if (char === ';' || char === '\n' || char === '\r' || char === '|' || char === '&') {
      const end = i
      if (char === '&' && source[i + 1] !== '&') uncertain = true
      if ((char === '&' || char === '|') && source[i + 1] === char) i++
      endCommand(end)
      segmentStart = i + 1
    } else if (/\s/.test(char)) endWord()
    else { word += char; started = true }
  }
  if (quote) uncertain = true
  endCommand(source.length)
  return { commands, segments, uncertain }
}

export interface ReviewUnit {
  readonly id: string
  readonly tool: string
  readonly text: string
  readonly words: readonly string[]
  readonly opaque: boolean
}

/** Preserve raw quoting. Unknown nested execution never inherits a category allowance. */
export function splitReviewUnits(tool: string, source: string, depth = 0): ReviewUnit[] {
  const opaque = (): ReviewUnit[] => [{ id: '', tool, text: source, words: [], opaque: true }]
  if (depth > 4) return opaque()
  if (!SHELL_TOOLS.test(tool)) return [{ id: '', tool, text: source, words: [], opaque: /code|python|javascript|patch/i.test(tool) }]
  const parsed = commandWords(source)
  if (parsed.uncertain || !parsed.segments.length) return opaque()
  const units: ReviewUnit[] = []
  for (const segment of parsed.segments) {
    const words = unwrapCommand(segment.words)
    const name = executableName(words[0] ?? '')
    if (['bash', 'sh', 'zsh', 'pwsh', 'powershell', 'cmd'].includes(name)) {
      const index = words.findIndex(word => ['-c', '-lc', '-command', '/c'].includes(word.toLowerCase()))
      if (index < 0 || words.length !== index + 2) return opaque()
      units.push(...splitReviewUnits('run_command', words[index + 1]!, depth + 1))
    } else {
      const executes = ['fd', 'find', 'xargs', 'eval', 'python', 'python3', 'node', 'ruby', 'perl'].includes(name)
        && (['xargs', 'eval', 'python', 'python3', 'node', 'ruby', 'perl'].includes(name) || words.some(word => /^(-[xX]|--exec.*|-exec.*|-ok.*)$/.test(word)))
      units.push({ id: '', tool, text: segment.text, words, opaque: executes || !words.length })
    }
  }
  return units
}

export function executableName(word: string): string {
  return word.split(/[\\/]/).pop()!.replace(/\.exe$/i, '').toLowerCase()
}

/** Strip only wrappers whose argument boundaries are known. */
export function unwrapCommand(words: readonly string[]): string[] {
  let out = [...words]
  while (out.length) {
    const name = executableName(out[0]!)
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(out[0]!)) { out.shift(); continue }
    if (name === 'command' || name === 'builtin') {
      out.shift()
      if (out[0] === '--') out.shift()
      // command -v/-V is a lookup, not command execution.
      if (out[0]?.startsWith('-')) return []
      continue
    }
    if (name === 'env' || name === 'sudo') {
      out.shift()
      while (out[0]?.startsWith('-')) {
        const option = out.shift()!
        if (option === '--') break
        if (['-u', '-g', '-h', '-p', '-C', '-T', '--user', '--group', '--unset', '--chdir'].includes(option)) out.shift()
        else if (!['-n', '-E', '-H', '-i', '--ignore-environment'].includes(option) && !option.includes('=')) return []
      }
      continue
    }
    return out
  }
  return out
}

const DATA_COMMANDS = new Set(['echo', 'printf', 'write-output', 'write-host', 'rg', 'grep', 'select-string'])
const SHELL_TOOLS = /^(?:bash|pwsh|powershell|run_command|exec_command|shell|terminal)$/i

/** Recognize literal push invocations, including common wrappers and Git options. */
export function isGitPush(tool: string, source: string, depth = 0): boolean {
  if (/^(?:git[_.\/-]push|push[_.\/-]git)(?:$|[_.\/-])/i.test(tool)) return true
  if (!SHELL_TOOLS.test(tool) || depth > 4 || source.includes('<<')) return false
  for (const original of commandWords(source).commands) {
    const words = unwrapCommand(original)
    const name = executableName(words[0] ?? '')
    const args = words.slice(1)
    if (['bash', 'sh', 'zsh', 'pwsh', 'powershell', 'cmd'].includes(name)) {
      const index = args.findIndex(arg => ['-c', '-lc', '-command', '/c'].includes(arg.toLowerCase()))
      if (index >= 0 && args[index + 1] && isGitPush('run_command', args[index + 1]!, depth + 1)) return true
    }
    if (name === 'fd' || name === 'find') {
      const index = args.findIndex(arg => ['-x', '-X', '--exec', '--exec-batch', '-exec', '-execdir'].includes(arg))
      if (index >= 0 && isGitPush('run_command', args.slice(index + 1).join(' '), depth + 1)) return true
    }
    if (name !== 'git') continue
    while (args[0]?.startsWith('-')) {
      const option = args.shift()!
      if (['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--config-env'].includes(option)) args.shift()
      else if (/^(?:-[Cc].+|--(?:git-dir|work-tree|namespace|config-env)=.+)$/.test(option)) continue
      else if (!['--no-pager', '--paginate', '-P', '-p', '--bare', '--no-optional-locks', '--no-replace-objects', '--literal-pathspecs', '--glob-pathspecs', '--noglob-pathspecs', '--icase-pathspecs'].includes(option)) { args.length = 0; break }
    }
    if (args[0] === 'push') return true
  }
  return false
}

/** Ignore literal strings and comments when recognizing simple code-tool calls. */
function codeSyntax(source: string): string | undefined {
  let result = ''
  for (let i = 0; i < source.length; i++) {
    const char = source[i]!
    if (char === '#' || source.slice(i, i + 2) === '//') {
      while (i < source.length && source[i] !== '\n') i++
      result += '\n'
    } else if (source.slice(i, i + 2) === '/*') {
      const end = source.indexOf('*/', i + 2)
      if (end < 0) return undefined
      i = end + 1
      result += ' '
    } else if (char === "'" || char === '"' || char === '`') {
      const quote = source.slice(i, i + 3) === char.repeat(3) ? char.repeat(3) : char
      i += quote.length
      let closed = false
      for (; i < source.length; i++) {
        if (source[i] === '\\') { i++; continue }
        if (source.slice(i, i + quote.length) === quote) {
          i += quote.length - 1
          closed = true
          break
        }
      }
      if (!closed) return undefined
      result += ' '
    } else if (char === '/') return undefined // regex literals/division are outside this subset
    else result += char
  }
  return result
}

/** Candidates contain executable syntax only, not arbitrary search/code data. */
export function deletionCandidates(tool: string, source: string, depth = 0, custom = false): string[] {
  const candidates = [`tool:${tool}`]
  if (depth > 4) return candidates
  if (/patch/i.test(tool)) {
    for (const line of source.split(/\r?\n/)) {
      if (/^\*\*\* Delete File: .+/.test(line)) candidates.push(line)
    }
  }
  // Structured operations are interpreted as fields, never regexed inside strings.
  try {
    const record = JSON.parse(source)
    if (record && typeof record === 'object' && !Array.isArray(record) && !/search|read|list|inspect/i.test(tool)) {
      for (const key of ['op', 'operation', 'action']) {
        if (/^(delete|remove|unlink)$/.test(record[key])) candidates.push(JSON.stringify({ [key]: record[key] }))
      }
    }
  } catch { /* shell/code input is not JSON */ }
  if (/code|python|javascript/i.test(tool)) {
    const syntax = codeSyntax(source)
    if (syntax !== undefined) candidates.push(syntax)
    return candidates
  }
  if (!SHELL_TOOLS.test(tool) && !/sql|query|database/i.test(tool)) return candidates
  const parsed = commandWords(source)
  // Do not infer hard denials from fragments of unsupported syntax (e.g. heredocs).
  if (parsed.uncertain) return candidates
  for (const original of parsed.commands) {
    const words = unwrapCommand(original)
    const name = executableName(words[0] ?? '')
    if (!name || DATA_COMMANDS.has(name)) continue
    const args = words.slice(1)
    if (['bash', 'sh', 'zsh', 'pwsh', 'powershell', 'cmd'].includes(name)) {
      const index = args.findIndex(arg => ['-c', '-command', '/c'].includes(arg.toLowerCase()))
      if (index >= 0 && args[index + 1]) candidates.push(...deletionCandidates('run_command', args[index + 1]!, depth + 1, custom))
      continue
    }
    if (name === 'fd' || name === 'find') {
      const index = args.findIndex(arg => ['-x', '-X', '--exec', '--exec-batch', '-exec', '-execdir'].includes(arg))
      if (index >= 0) candidates.push(...deletionCandidates('run_command', args.slice(index + 1).join(' '), depth + 1, custom))
      if (name === 'find') {
        // Skip predicate values: find . -name '-delete' only searches a name.
        for (let i = 0; i < args.length; i++) {
          if (['-name', '-iname', '-path', '-ipath', '-regex', '-iregex'].includes(args[i]!)) { i++; continue }
          if (args[i] === '-delete') candidates.push('find . -delete')
        }
      }
      continue
    }
    if (['git', 'docker', 'kubectl'].includes(name)) {
      // Common global options with values precede the subcommand.
      while (args[0]?.startsWith('-')) {
        const option = args.shift()!
        if (['-C', '-c', '--git-dir', '--work-tree', '--context', '--namespace', '-n', '--kubeconfig'].includes(option)) args.shift()
        else if (!option.includes('=')) break
      }
      const sub = args[0]?.toLowerCase()
      const deletes = name === 'git'
        ? sub === 'rm' || sub === 'clean' || sub === 'branch' && args.slice(1).some(arg => /^(-[dD]|--delete(?:=|$))/.test(arg))
        : name === 'docker'
          ? sub === 'rm' || sub === 'rmi' || ['volume', 'network'].includes(sub ?? '') && args[1] === 'rm' || sub === 'system' && args[1] === 'prune'
          : sub === 'delete'
      if (custom || deletes) candidates.push(`${name} ${args.join(' ')}`)
      continue
    }
    if (['rm', 'del', 'erase', 'rmdir', 'rd', 'remove-item', 'ri', 'unlink', 'delete', 'drop', 'truncate'].includes(name)) {
      candidates.push(`${name === 'ri' ? 'Remove-Item' : name === 'unlink' ? 'rm' : name} ${args.join(' ')}`)
    } else if (custom) candidates.push(`${name} ${args.join(' ')}`)
  }
  return candidates
}

/** A read pattern may narrow these safe forms, never authorize arbitrary code. */
export function literalReadCommand(source: string): boolean {
  const parsed = commandWords(source)
  if (parsed.uncertain || parsed.commands.length !== 1) return false
  const words = parsed.commands[0]!
  const name = executableName(words[0] ?? '')
  const args = words.slice(1)
  // Do not exempt executables selected through a path, wrappers, or assignments.
  if (words[0]?.toLowerCase() !== name) return false
  if (args.some(arg => /^(?:--(?:output|pre|hostname-bin|ext-diff|textconv)(?:=|$)|-o$)/.test(arg))) return false
  if (name === 'fd' && args.some(arg => /^-(?:[^-]*[xX]|-(?:exec|exec-batch)(?:=|$))/.test(arg))) return false
  if (name === 'find' && args.some(arg => /^-(delete|exec|execdir|ok|okdir|fprint\w*|fls)$/.test(arg))) return false
  if (name === 'git') {
    if (args[0] === 'branch') return args.slice(1).every(arg => /^(--list|--all|--remotes|--show-current|-[arv]+)$/.test(arg))
    if (args[0] === 'remote') return args.length === 1 || args.length === 2 && args[1] === '-v'
    return ['status', 'diff', 'log', 'show', 'rev-parse', 'ls-files'].includes(args[0] ?? '')
  }
  if (['npm', 'pnpm', 'yarn'].includes(name)) return ['list', 'ls', 'view', 'outdated', 'why'].includes(args[0] ?? '')
  return ['pwd', 'ls', 'dir', 'tree', 'find', 'fd', 'rg', 'grep', 'cat', 'type', 'head', 'tail', 'wc', 'stat', 'file', 'which', 'where',
    'get-childitem', 'get-content', 'get-item', 'get-location', 'select-string', 'test-path', 'resolve-path', 'get-command'].includes(name)
}

function pathApi(value: string) { return /^[a-z]:|^\\\\/i.test(value) ? win32 : posix }

export function executionDirectory(requested: string | undefined, sessionRoot: string | undefined): string | null {
  if (!requested) return sessionRoot ?? null
  const paths = pathApi(requested) === win32 ? win32 : pathApi(sessionRoot ?? requested)
  if (paths.isAbsolute(requested)) return paths.resolve(sessionRoot ?? paths.parse(requested).root, requested)
  return sessionRoot ? paths.resolve(sessionRoot, requested) : null
}
