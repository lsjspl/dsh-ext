import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-workspace'
import { spawn, exec } from 'node:child_process'
import { createReadStream, existsSync } from 'node:fs'
import { lstat, readFile, readdir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep, dirname, basename, extname } from 'node:path'
import { promisify } from 'node:util'
import { ApiError, installRoutes, type ApiHandler } from '../http.ts'
import { git, hasGit, repositoryRoot, splitNul } from '../git.ts'
import type { Config } from '../config.ts'
import type { ChangeEntry, ExplorerStatus, FileView, TreeEntry } from '../shared/api-contract.ts'

const execAsync = promisify(exec)

/**
 * Resolve a path pattern with wildcards to actual paths.
 * Returns all matching paths, or empty array if no matches.
 */
async function resolveWildcard(pattern: string): Promise<string[]> {
  // If no wildcard, return as-is
  if (!pattern.includes('*')) {
    return [pattern]
  }

  const parts = pattern.split(sep)
  const firstWildcardIndex = parts.findIndex(p => p.includes('*'))

  if (firstWildcardIndex === -1) {
    return [pattern]
  }

  // Build the base directory (everything before the first wildcard)
  const basePath = parts.slice(0, firstWildcardIndex).join(sep)
  const wildcardPart = parts[firstWildcardIndex]
  const remaining = parts.slice(firstWildcardIndex + 1)

  try {
    const entries = await readdir(basePath, { withFileTypes: true })
    const wildcard = wildcardPart ?? ''
    const regex = new RegExp('^' + wildcard.replace(/\*/g, '.*') + '$')
    const matches: string[] = []

    for (const entry of entries) {
      if (regex.test(entry.name)) {
        const fullPath = join(basePath, entry.name, ...remaining)
        if (remaining.length > 0 && remaining.some(p => p.includes('*'))) {
          // Recursively resolve remaining wildcards
          const resolved = await resolveWildcard(fullPath)
          matches.push(...resolved)
        } else {
          matches.push(fullPath)
        }
      }
    }
    return matches
  } catch {
    return []
  }
}

/**
 * Feature 5 — a side panel showing the workspace directory tree and its
 * uncommitted changes.
 *
 * Strictly read-only. Every git invocation here is a query (`status`,
 * `rev-parse`, `diff --stat`); nothing stages, commits, checks out, or stashes.
 * That is the whole safety story for this feature: the user's repository state
 * is observed, never altered.
 */

/** Directories never worth walking into for a project tree. */
const ALWAYS_HIDDEN = new Set(['.git', 'node_modules', '.venv', '__pycache__', '.DS_Store'])

/**
 * Resolve a client-supplied relative path inside one workspace root.
 *
 * The browser half is same-origin and the server is loopback, but this endpoint
 * still reads the filesystem on behalf of whatever reaches it, so containment
 * is enforced here rather than assumed: the resolved real path must sit inside
 * the resolved real root. Checking after `realpath` is what makes a symlink
 * pointing out of the workspace fail instead of following.
 *
 * @param root - workspace root, already canonical.
 * @param requested - client-supplied workspace-relative path (may be empty).
 * @returns the absolute canonical path to read.
 */
export async function containedPath(root: string, requested: string, allowMissing = false): Promise<string> {
  if (requested.length === 0) return root
  if (requested.includes('\0')) {
    throw new ApiError(400, 'invalid path')
  }
  const candidate = isAbsolute(requested) ? resolve(requested) : resolve(root, requested)
  let real: string
  try {
    real = await realpath(candidate)
  } catch (error) {
    if (!allowMissing || (error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new ApiError(404, 'no such path in this workspace')
    }
    // Validate the nearest existing ancestor, including symlinks, for deleted paths.
    let ancestor = candidate
    for (;;) {
      try {
        await lstat(ancestor)
        real = resolve(await realpath(ancestor), relative(ancestor, candidate))
        break
      } catch (ancestorError) {
        const parent = dirname(ancestor)
        if ((ancestorError as NodeJS.ErrnoException).code !== 'ENOENT' || parent === ancestor) {
          throw new ApiError(404, 'no such path in this workspace')
        }
        // An existing dangling link must not be treated as an absent directory.
        try {
          if ((await lstat(ancestor)).isSymbolicLink()) throw new ApiError(403, 'unresolved symbolic link')
        } catch (linkError) {
          if (linkError instanceof ApiError) throw linkError
        }
        ancestor = parent
      }
    }
  }
  const rootReal = await realpath(root)
  const rel = relative(rootReal, real)
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new ApiError(403, 'that path is outside the workspace')
  }
  return real
}

/** Workspace-relative, `/`-separated — the form both halves and git agree on. */
function toPosix(root: string, absolute: string): string {
  return relative(root, absolute).split(sep).join('/')
}

/**
 * Normalize CRLF to LF before any text leaves the backend.
 *
 * A Windows checkout holds CRLF on disk while git stores LF, so a line diff
 * between the two sides would report every line changed. The newline itself is
 * never what the user edited.
 */
function toLf(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

/**
 * Largest file the viewer will fetch. A source file is kilobytes; anything past
 * this is a bundle, a log, or a database, and shipping it to the browser would
 * stall the tab rather than show anything a person reads.
 */
const MAX_VIEW_BYTES = 2 * 1024 * 1024
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const IMAGE_MIMES = new Map<string, string>([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.bmp', 'image/bmp'],
  ['.avif', 'image/avif'],
])

const VIDEO_MIMES = new Map<string, string>([
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.ogg', 'video/ogg'],
  ['.ogv', 'video/ogg'],
  ['.mov', 'video/quicktime'],
  ['.mkv', 'video/x-matroska'],
  ['.m4v', 'video/x-m4v'],
])

const AUDIO_MIMES = new Map<string, string>([
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.ogg', 'audio/ogg'],
  ['.m4a', 'audio/mp4'],
  ['.flac', 'audio/flac'],
  ['.aac', 'audio/aac'],
])

const MEDIA_MIMES = new Map<string, string>([
  ...IMAGE_MIMES,
  ...VIDEO_MIMES,
  ...AUDIO_MIMES,
])

/**
 * Read one file for the viewer.
 *
 * Image, video, and audio files are served for visual/playback preview.
 * Non-media binary files are flagged as `isBinary: true` for the UI to display
 * an open-external card instead of failing with an error.
 */
async function readTextFile(root: string, requested: string, scopeSuffix = ''): Promise<FileView> {
  const absolute = await containedPath(root, requested)
  const info = await stat(absolute)
  if (info.isDirectory()) throw new ApiError(400, 'that path is a directory, not a file')

  const ext = extname(requested).toLowerCase()
  const imageMime = IMAGE_MIMES.get(ext)
  const isVideo = VIDEO_MIMES.has(ext)
  const isAudio = AUDIO_MIMES.has(ext)

  // Support direct video playback!
  if (isVideo) {
    return {
      path: requested,
      content: '',
      language: '',
      truncated: false,
      bytes: info.size,
      isVideo: true,
      mediaUrl: `/api/dsh-ext/explorer/raw?path=${encodeURIComponent(requested)}${scopeSuffix}`,
    }
  }

  // Support direct audio playback!
  if (isAudio) {
    return {
      path: requested,
      content: '',
      language: '',
      truncated: false,
      bytes: info.size,
      isAudio: true,
      mediaUrl: `/api/dsh-ext/explorer/raw?path=${encodeURIComponent(requested)}${scopeSuffix}`,
    }
  }

  // Support direct image viewing!
  if (imageMime !== undefined) {
    if (info.size > MAX_IMAGE_BYTES) {
      throw new ApiError(413, 'that image is too large to preview (>10MB)')
    }
    const buffer = await readFile(absolute)
    const dataUrl = `data:${imageMime};base64,${buffer.toString('base64')}`
    return {
      path: requested,
      content: ext === '.svg' ? toLf(buffer.toString('utf8')) : '',
      language: ext === '.svg' ? 'xml' : '',
      truncated: false,
      bytes: info.size,
      isImage: true,
      imageUrl: dataUrl,
      mediaUrl: `/api/dsh-ext/explorer/raw?path=${encodeURIComponent(requested)}${scopeSuffix}`,
    }
  }

  if (info.size > MAX_VIEW_BYTES) {
    throw new ApiError(413, 'that file is too large to preview')
  }

  const buffer = await readFile(absolute)
  const head = buffer.subarray(0, Math.min(buffer.length, 8000))
  if (head.includes(0)) {
    // Non-media binary file: return clean binary flag instead of crashing with 415
    return {
      path: requested,
      content: '',
      language: '',
      truncated: false,
      bytes: info.size,
      isBinary: true,
    }
  }

  const text = toLf(buffer.toString('utf8'))
  const lines = text.split('\n')
  const truncated = lines.length > MAX_VIEW_LINES
  return {
    path: requested,
    content: truncated ? lines.slice(0, MAX_VIEW_LINES).join('\n') : text,
    language: languageOf(requested),
    truncated,
    bytes: info.size,
  }
}

/** Line cap for one view; a longer file is cut with the tail reported as trimmed. */
const MAX_VIEW_LINES = 5000

/**
 * Candidate VS Code launchers, most specific first.
 *
 * `DSH_EXT_EDITOR` comes first so a user on VSCodium, Cursor, or a portable
 * install can name their own binary instead of being told none was found. The
 * rest are the documented install locations for each platform.
 *
 * On Windows the CLI is `code.cmd` — a batch file, which `execFile` cannot spawn
 * without a shell. Rather than turn on `shell: true` (which would make every path
 * below a string the shell re-parses), the launcher is resolved to a concrete
 * file and spawned through `cmd.exe /d /s /c` with the command line quoted and
 * passed verbatim — see the comment on `openInEditor` for why the quotes are
 * doubled and sent unescaped.
 */
function editorCandidates(editorType: string): string[] {
  const fromEnv = process.env.DSH_EXT_EDITOR
  const home = process.env.USERPROFILE ?? process.env.HOME ?? ''
  const candidates = fromEnv === undefined || fromEnv.length === 0 ? [] : [fromEnv]

  if (editorType === 'idea') {
    // IntelliJ IDEA paths
    if (process.platform === 'win32') {
      const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files'
      const localAppData = process.env.LOCALAPPDATA ?? join(home, 'AppData', 'Local')
      // Use wildcards to match any IDEA version
      candidates.push(
        // Standard Program Files installations (wildcard matches any version)
        join(programFiles, 'JetBrains', 'IntelliJ IDEA *', 'bin', 'idea64.exe'),
        join(programFiles, 'JetBrains', 'IntelliJ IDEA Community Edition *', 'bin', 'idea64.exe'),
        // Toolbox installations
        join(localAppData, 'JetBrains', 'Toolbox', 'apps', 'IDEA-U', 'ch-0', '*', 'bin', 'idea64.exe'),
        join(localAppData, 'JetBrains', 'Toolbox', 'apps', 'IDEA-C', 'ch-0', '*', 'bin', 'idea64.exe'),
      )
    } else if (process.platform === 'darwin') {
      candidates.push(
        '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea',
        '/Applications/IntelliJ IDEA CE.app/Contents/MacOS/idea',
        join(home, 'Applications', 'IntelliJ IDEA.app', 'Contents', 'MacOS', 'idea'),
      )
    } else {
      candidates.push('/usr/bin/idea', '/usr/local/bin/idea', '/snap/bin/intellij-idea-community')
    }
  } else {
    // VS Code paths (default)
    if (process.platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA ?? join(home, 'AppData', 'Local')
      const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files'
      candidates.push(
        join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
        join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd'),
        join(localAppData, 'Programs', 'cursor', 'resources', 'app', 'bin', 'cursor.cmd'),
      )
    } else if (process.platform === 'darwin') {
      candidates.push(
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
        join(home, 'Applications', 'Visual Studio Code.app', 'Contents', 'Resources', 'app', 'bin', 'code'),
        '/opt/homebrew/bin/code',
        '/usr/local/bin/code',
      )
    } else {
      candidates.push('/usr/bin/code', '/usr/local/bin/code', '/snap/bin/code', '/var/lib/flatpak/exports/bin/com.visualstudio.code')
    }
  }
  return candidates
}

/**
 * Open a path in the system file explorer.
 */
async function openInFileExplorer(target: string, isFile: boolean): Promise<{ opened: boolean; editor: string }> {
  return await new Promise((resolve, reject) => {
    try {
      if (process.platform === 'win32') {
        // Windows: `explorer.exe` is the Windows Shell's COM launcher, not a
        // normal process. Spawning it directly with a path frequently exits
        // nonzero (reproduced here) and, worse, opens no window at all — the
        // process is a forwarding stub that needs the shell to be already
        // running and fails silently in a headless/CI or a fresh GUI session.
        // The Web shell's loopback server can be spawned under exactly such a
        // session, so a bare `spawn('explorer.exe', [path])` is the button that
        // reliably does nothing.
        //
        // `explorer.exe /select,path` (the "reveal this file" form) is even
        // less reliable on this setup: it exits nonzero and opens no window —
        // reproduced under scripted spawns. The directory form asks the running
        // Explorer to open a folder via ShellExecute, which works. So a FILE is
        // revealed by opening its PARENT DIRECTORY window instead, which is the
        // same dependable `cmd /c start ""` route and lands the user one level
        // up from the file — close enough to "show it in Explorer" without
        // betting the click on a /select that silently drops.
        //
        // `start` treats its FIRST quoted argument as a window title, so an
        // empty `""` is added to keep the path from being consumed as one. The
        // whole path arg is sent verbatim (windowsVerbatimArguments:true) so cmd
        // does not re-parse a path containing spaces.
        const directory = isFile ? dirname(target) : target
        const normalizedPath = directory.replace(/\//g, '\\')
        const child = spawn(
          process.env.COMSPEC ?? 'cmd.exe',
          ['/d', '/s', '/c', 'start', '', normalizedPath],
          { detached: true, stdio: 'ignore', windowsHide: true, windowsVerbatimArguments: true },
        )

        child.on('error', (error) => {
          reject(new ApiError(500, `could not open file explorer: ${error.message}`))
        })

        child.unref()
        resolve({ opened: true, editor: 'file-explorer' })
      } else if (process.platform === 'darwin') {
        // macOS: use open with -R to reveal in Finder
        const child = spawn('open', ['-R', target], { detached: true, stdio: 'ignore' })
        child.unref()
        resolve({ opened: true, editor: 'file-explorer' })
      } else {
        // Linux: use xdg-open
        const child = spawn('xdg-open', [target], { detached: true, stdio: 'ignore' })
        child.unref()
        resolve({ opened: true, editor: 'file-explorer' })
      }
    } catch (error: unknown) {
      console.error('[Explorer] Exception:', error)
      reject(new ApiError(500, `could not open file explorer: ${error instanceof Error ? error.message : String(error)}`))
    }
  })
}

/**
 * How long a spawn is watched for an early death before "it launched" is
 * assumed. A launcher that cannot run — a mangled command line, a missing
 * binary — dies within milliseconds; one that DOES run stays alive, because
 * the VS Code wrapper waits on its GUI. So a quiet watch is the success
 * signal, and an early exit is the failure signal.
 */
const LAUNCH_WATCH_MS = 2500

/**
 * Turn a launcher's stderr into the error the panel shows.
 *
 * Console output on Windows is written in the OEM codepage — GBK on a Chinese
 * machine — not UTF-8, so the raw bytes must be decoded as GBK before they are
 * text. Only the tail is kept: cmd's reason ("not recognized…") is what
 * matters, and a chatty launcher could otherwise flood the toast.
 */
function launchFailure(stderr: readonly Buffer[], code: number | null): ApiError {
  const raw = Buffer.concat([...stderr])
  let text: string
  try {
    text = new TextDecoder('gbk').decode(raw)
  } catch {
    text = raw.toString('utf8')
  }
  const reason = text.replace(/\s+/g, ' ').trim().slice(-160)
  return new ApiError(500, reason.length > 0
    ? `the editor could not be started (exit ${code}): ${reason}`
    : `the editor could not be started (exit ${code})`)
}

/**
 * Open a path in VS Code.
 *
 * What comes back is only whether the launch was accepted — the editor's own
 * startup is not something this endpoint can wait on — but unlike a pure
 * fire-and-forget spawn, a launch that dies immediately (exit != 0, spawn
 * error) is reported, because a button that silently does nothing is
 * indistinguishable from a button that was never pressed.
 *
 * @param root - workspace root, opened as the editor's folder.
 * @param target - absolute path already proven inside `root`.
 * @param isFile - true when `target` is a file, so it opens in the folder's window.
 */
async function openInEditor(root: string, target: string, isFile: boolean, editorType: string): Promise<{ opened: boolean; editor: string }> {
  // Handle file explorer option
  if (editorType === 'explorer') {
    return await openInFileExplorer(target, isFile)
  }

  let launcher: string | undefined
  const candidates = editorCandidates(editorType)

  // Try each candidate, resolving wildcards if present
  for (const candidate of candidates) {
    if (candidate.includes('*')) {
      // Resolve wildcard patterns
      const resolved = await resolveWildcard(candidate)
      for (const path of resolved) {
        try {
          await stat(path)
          launcher = path
          console.log('[Explorer] Found launcher for', editorType, ':', launcher)
          break
        } catch { /* try next */ }
      }
    } else {
      // No wildcard, try directly
      try {
        await stat(candidate)
        launcher = candidate
        console.log('[Explorer] Found launcher for', editorType, ':', launcher)
        break
      } catch { /* try next */ }
    }
    if (launcher !== undefined) break
  }

  if (launcher === undefined) {
    const editorName = editorType === 'idea' ? 'IntelliJ IDEA' : 'VS Code'
    throw new ApiError(409, `no ${editorName} installation was found; set DSH_EXT_EDITOR to your editor's path`)
  }

  // Different editors have different command line arguments
  let args: string[]
  if (editorType === 'idea') {
    // IntelliJ IDEA: simple path argument, optionally with line number
    args = isFile ? [target] : [root]
    console.log('[Explorer] Using IDEA args:', args)
  } else {
    // VS Code: `--reuse-window` with the folder first keeps a file opening inside the
    // project's own window instead of a bare single-file window with no context.
    args = isFile ? [root, '--reuse-window', '--goto', target] : [root]
    console.log('[Explorer] Using VSCode args:', args)
  }

  const isBatch = launcher.toLowerCase().endsWith('.cmd') || launcher.toLowerCase().endsWith('.bat')

  // Batch launchers go through cmd.exe with the whole command line pre-quoted,
  // in TWO wrapping pairs. Node escapes embedded quotes with backslashes, which
  // cmd does not read, so the line is sent verbatim (`windowsVerbatimArguments`)
  // and the quoting is written here by hand. The doubled pair is not
  // decoration: cmd's `/S` rule strips the first and last quote of the `/c`
  // string, so without the outer pair the inner quotes are what get stripped —
  // and a launcher path like `...\Microsoft VS Code\bin\code.cmd` is then cut
  // at its first space ("not recognized as an internal or external command"),
  // which is exactly how the first version of this endpoint failed to open
  // anything while reporting success.
  const child = isBatch
    ? spawn(
        process.env.COMSPEC ?? 'cmd.exe',
        ['/d', '/s', '/c', `"${[`"${launcher}"`, ...args.map(a => `"${a}"`)].join(' ')}"`],
        { detached: true, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true, windowsVerbatimArguments: true },
      )
    : spawn(launcher, args, { detached: true, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })

  return await new Promise((resolve, reject) => {
    const stderr: Buffer[] = []
    let settled = false
    const settle = (finish: () => void): void => {
      if (settled) return
      settled = true
      clearTimeout(watch)
      finish()
    }
    const watch = setTimeout(() => {
      // Still alive: the editor took the handoff. Let it outlive the request.
      settle(() => { child.unref(); resolve({ opened: true, editor: launcher ?? '' }) })
    }, LAUNCH_WATCH_MS)
    child.on('error', (error: Error) => {
      settle(() => { reject(new ApiError(500, `the editor could not be started: ${error.message}`)) })
    })
    child.stderr?.on('data', (chunk: Buffer) => { stderr.push(chunk) })
    child.on('close', code => {
      settle(() => {
        if (code === 0) resolve({ opened: true, editor: launcher ?? '' })
        else reject(launchFailure(stderr, code))
      })
    })
  })
}

/**
 * Every file in the workspace, workspace-relative, for the composer's file
 * picker.
 *
 * `git ls-files --cached --others --exclude-standard` is the whole listing in
 * one process: tracked files plus untracked ones that `.gitignore` does not
 * exclude. Walking the tree by hand would mean re-implementing gitignore
 * semantics (negations, directory patterns, nested files, the global excludes
 * file) — a reimplementation that is wrong in exactly the cases users notice,
 * like a `dist/` that reappears in the picker.
 *
 * A directory with no repository falls back to a bounded manual walk, because
 * there is no git to ask. That path applies `ALWAYS_HIDDEN` only, which is the
 * honest limit: without a repository there is no ignore file to respect.
 *
 * @param root - canonical workspace root.
 * @param limit - hard cap on returned paths; the caller reports truncation.
 */
async function listAllFiles(
  root: string,
  limit: number,
  signal: AbortSignal,
): Promise<{ files: string[]; truncated: boolean }> {
  if (await hasGit(root) && await repositoryRoot(root, signal) !== undefined) {
    const result = await git(
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: root, signal },
    )
    if (result.ok) {
      const all = splitNul(result.stdout).filter(line => line.length > 0)
      // `--cached` and `--others` can both name a path that is staged and
      // present, so the set collapses the duplicate.
      const unique = [...new Set(all)]
      unique.sort((a, b) => a.localeCompare(b))
      return { files: unique.slice(0, limit), truncated: unique.length > limit }
    }
  }

  const files: string[] = []
  let truncated = false
  const walk = async (dir: string): Promise<void> => {
    if (files.length >= limit) { truncated = true; return }
    // An unreadable directory is skipped rather than failing the listing: one
    // permission-denied folder should not cost the user the whole picker.
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      if (signal.aborted) return
      if (files.length >= limit) { truncated = true; return }
      if (ALWAYS_HIDDEN.has(entry.name)) continue
      const absolute = join(dir, entry.name)
      if (entry.isDirectory()) await walk(absolute)
      else if (entry.isFile()) files.push(toPosix(root, absolute))
    }
  }
  await walk(root)
  files.sort((a, b) => a.localeCompare(b))
  return { files, truncated }
}

/**
 * Map a filename to a shiki grammar id.
 *
 * The ids are shiki's own (`shellscript`, not `sh`), because the host's
 * highlighter resolves them against its registered grammar set; an alias it does
 * not know falls back to plain text, which is a silent loss of colour rather
 * than an error. Unknown extensions deliberately return `''` — plain but still
 * monospaced, which is the honest rendering for a file whose language we cannot
 * name.
 */
function languageOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1).toLowerCase()
  const dot = name.lastIndexOf('.')
  const extension = dot <= 0 ? '' : name.slice(dot + 1)
  const byName: Record<string, string> = {
    dockerfile: 'docker',
    makefile: 'make',
    '.gitignore': 'ini',
    '.gitattributes': 'ini',
    '.env': 'ini',
  }
  const named = byName[name]
  if (named !== undefined) return named
  const byExtension: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', mts: 'typescript', cts: 'typescript',
    js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
    json: 'json', jsonc: 'json', json5: 'json',
    py: 'python', pyi: 'python',
    rs: 'rust', go: 'go', java: 'java', kt: 'kotlin', kts: 'kotlin',
    c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
    cs: 'csharp', php: 'php', rb: 'ruby', swift: 'swift', lua: 'lua',
    sh: 'shellscript', bash: 'shellscript', zsh: 'shellscript', fish: 'shellscript',
    bat: 'bat', cmd: 'bat', ps1: 'powershell',
    yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini', cfg: 'ini', conf: 'ini',
    md: 'markdown', markdown: 'markdown', mdx: 'mdx',
    html: 'html', htm: 'html', xml: 'xml', svg: 'xml',
    css: 'css', scss: 'scss', less: 'less',
    sql: 'sql', vue: 'vue', diff: 'diff', patch: 'diff',
  }
  return byExtension[extension] ?? ''
}

/**
 * Ignored-path check for one directory's children, in a single git call.
 *
 * `check-ignore -z --stdin` answers for a whole batch, which matters because
 * the alternative — one call per entry — turns a 500-entry directory into 500
 * process spawns.
 */
async function ignoredChildren(
  root: string,
  names: readonly string[],
  dir: string,
  signal: AbortSignal,
): Promise<Set<string>> {
  if (names.length === 0) return new Set()
  const relDir = toPosix(root, dir)
  const candidates = names.map(name => (relDir.length === 0 ? name : `${relDir}/${name}`))
  const result = await git(['check-ignore', '-z', '--stdin'], { cwd: root, signal, input: candidates.join('\0') })
  // Exit 1 means "nothing ignored", which is not an error.
  if (!result.ok && result.code !== 1) return new Set()
  return new Set(splitNul(result.stdout))
}

async function listDirectory(
  root: string,
  dir: string,
  config: Config,
  signal: AbortSignal,
): Promise<TreeEntry[]> {
  const cap = config.explorer.maxEntriesPerDir
  let dirents
  try {
    dirents = await readdir(dir, { withFileTypes: true })
  } catch (error: unknown) {
    const code = (error as { code?: string }).code
    if (code === 'ENOTDIR') throw new ApiError(400, 'that path is a file, not a directory')
    if (code === 'EACCES' || code === 'EPERM') throw new ApiError(403, 'that directory cannot be read')
    throw new ApiError(404, 'no such directory in this workspace')
  }

  const visible = dirents.filter(entry => !ALWAYS_HIDDEN.has(entry.name))
  const ignored = config.explorer.respectGitignore
    ? await ignoredChildren(root, visible.map(entry => entry.name), dir, signal)
    : new Set<string>()

  const rows: TreeEntry[] = []
  let truncated = false
  for (const entry of visible) {
    const path = toPosix(root, join(dir, entry.name))
    if (ignored.has(path)) continue
    if (rows.length >= cap) {
      truncated = true
      break
    }
    // A symlink is reported as what it is at this level: following it here is
    // how a tree walk ends up in a cycle or outside the workspace.
    const isDirectory = entry.isDirectory()
    let size: number | undefined
    if (entry.isFile()) {
      try {
        size = (await stat(join(dir, entry.name))).size
      } catch { /* a file that vanished mid-listing simply has no size */ }
    }
    rows.push({ name: entry.name, path, kind: isDirectory ? 'directory' : 'file', size })
  }

  // Directories first, then case-insensitive by name — the ordering every file
  // tree a developer has used already has.
  rows.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' })
  })
  const last = rows[rows.length - 1]
  if (truncated && last !== undefined) rows[rows.length - 1] = { ...last, truncated: true }
  return rows
}

/**
 * Parse `git status --porcelain=v1 -z`.
 *
 * `-z` is required, not a preference: the default output quotes and escapes
 * paths containing spaces or non-ASCII bytes, and a rename record carries two
 * paths. With `-z` each record is `XY<space><path>` and a rename appends its
 * original path as the *following* NUL-delimited field.
 */
export function parseStatus(stdout: string): ChangeEntry[] {
  const fields = splitNul(stdout)
  const changes: ChangeEntry[] = []
  for (let index = 0; index < fields.length; index += 1) {
    const record = fields[index]
    if (record === undefined || record.length < 4) continue
    const index0 = record[0] ?? ' '
    const worktree = record[1] ?? ' '
    const path = record.slice(3)
    let from: string | undefined
    if (index0 === 'R' || index0 === 'C') {
      // The original path is its own field, consumed here so it is not read as
      // the next status record.
      index += 1
      from = fields[index]
    }
    changes.push({
      path,
      from,
      index: index0,
      worktree,
      staged: index0 !== ' ' && index0 !== '?',
      untracked: index0 === '?' && worktree === '?',
    })
  }
  return changes
}

/** Lines added and removed for one path, versus HEAD. */
export interface LineCounts {
  readonly added: number
  readonly removed: number
}

/**
 * Parse `git diff --numstat -z` output into per-path line counts.
 *
 * `-z` records are `added\tremoved\tpath` NUL-terminated, with a rename
 * carrying its original path as a FOURTH tab-separated field — so the key is
 * field three (the new path, which is what porcelain names too), never the
 * last field. Binary files report `-` in both columns and yield no entry:
 * there are no line counts to show for them. Duplicate paths accumulate,
 * which is what lets a staged delta and a further unstaged delta for the same
 * file sum into one "versus HEAD" figure.
 */
export function parseNumstat(stdout: string): Map<string, LineCounts> {
  const counts = new Map<string, LineCounts>()
  for (const record of splitNul(stdout)) {
    const fields = record.split('\t')
    const added = fields[0] ?? ''
    const removed = fields[1] ?? ''
    const path = fields[2] ?? ''
    if (path.length === 0 || added === '-' || removed === '-') continue
    const previous = counts.get(path) ?? { added: 0, removed: 0 }
    counts.set(path, {
      added: previous.added + (Number.parseInt(added, 10) || 0),
      removed: previous.removed + (Number.parseInt(removed, 10) || 0),
    })
  }
  return counts
}

/** Merge `from` into `into`, summing counts for paths both sides know. */
function mergeCounts(into: Map<string, LineCounts>, from: Map<string, LineCounts>): void {
  for (const [path, counts] of from) {
    const previous = into.get(path) ?? { added: 0, removed: 0 }
    into.set(path, {
      added: previous.added + counts.added,
      removed: previous.removed + counts.removed,
    })
  }
}

/** Newlines in a text, ignoring a trailing one — what `wc -l` reports. */
function lineCount(text: string): number {
  if (text.length === 0) return 0
  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0)
}

/**
 * Untracked files get their line counts from disk (git has no numstat for a
 * path it does not track), but the work is bounded: a poll that counted every
 * line of every untracked artifact would turn a five-second refresh into a
 * file walk. Files past either cap simply show no counts.
 */
const UNTRACKED_COUNT_FILES = 24
const UNTRACKED_COUNT_BYTES = 256 * 1024

/** Branch, upstream distance, and the working tree's changes. */
/** Attach one side's figures to a change; the contract's fields are readonly, so this rebuilds. */
function withStagedCounts(change: ChangeEntry, counts: LineCounts | undefined): ChangeEntry {
  return counts === undefined ? change : { ...change, stagedAdded: counts.added, stagedRemoved: counts.removed }
}

function withWorktreeCounts(change: ChangeEntry, counts: LineCounts | undefined): ChangeEntry {
  return counts === undefined ? change : { ...change, worktreeAdded: counts.added, worktreeRemoved: counts.removed }
}

function withTotalCounts(change: ChangeEntry, counts: LineCounts | undefined): ChangeEntry {
  return counts === undefined ? change : { ...change, added: counts.added, removed: counts.removed }
}

async function readStatus(root: string, signal: AbortSignal): Promise<ExplorerStatus> {
  if (!await hasGit(root)) return { isRepository: false, changes: [] }
  const repo = await repositoryRoot(root, signal)
  if (repo === undefined) return { isRepository: false, changes: [] }

  const [statusResult, branchResult, trackingResult, worktreeResult, stagedResult] = await Promise.all([
    git(['status', '--porcelain=v1', '-z', '--untracked-files=normal'], { cwd: root, signal }),
    git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, signal }),
    git(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], { cwd: root, signal }),
    git(['diff', '--numstat', '-z'], { cwd: root, signal }),
    git(['diff', '--cached', '--numstat', '-z'], { cwd: root, signal }),
  ])

  const worktreeCounts = worktreeResult.ok ? parseNumstat(worktreeResult.stdout) : new Map<string, LineCounts>()
  const stagedCounts = stagedResult.ok ? parseNumstat(stagedResult.stdout) : new Map<string, LineCounts>()
  const counts = new Map<string, LineCounts>()
  mergeCounts(counts, worktreeCounts)
  mergeCounts(counts, stagedCounts)

  const untrackedCounts = new Map<string, LineCounts>()
  let countedUntracked = 0
  const parsed = statusResult.ok ? parseStatus(statusResult.stdout) : []
  for (const change of parsed) {
    if (change.untracked && countedUntracked < UNTRACKED_COUNT_FILES) {
      // A new file is one whole addition; count its lines from disk, within
      // the caps above. A file that vanishes or reads as binary just shows no
      // counts until the next poll.
      try {
        const absolute = join(root, change.path)
        const info = await stat(absolute)
        if (info.isFile() && info.size <= UNTRACKED_COUNT_BYTES) {
          const buffer = await readFile(absolute)
          if (!buffer.includes(0)) {
            countedUntracked += 1
            untrackedCounts.set(change.path, { added: lineCount(buffer.toString('utf8')), removed: 0 })
          }
        }
      } catch { /* the file disappeared mid-poll; the next one will retry */ }
    }
  }
  mergeCounts(counts, untrackedCounts)

  const changes = parsed.map(change => {
    // Per-side figures: staged versus HEAD, unstaged versus the index — what
    // the staged/unstaged filters show. `added`/`removed` stay the sum of
    // both sides, the versus-HEAD figure the flat list shows.
    const stagedSide = change.staged ? stagedCounts.get(change.path) : undefined
    const worktreeSide = change.untracked ? untrackedCounts.get(change.path) : worktreeCounts.get(change.path)
    return withTotalCounts(withWorktreeCounts(withStagedCounts(change, stagedSide), worktreeSide), counts.get(change.path))
  })

  let ahead: number | undefined
  let behind: number | undefined
  if (trackingResult.ok) {
    // `--left-right --count` prints "<behind>\t<ahead>" for upstream...HEAD.
    const [left, right] = trackingResult.stdout.trim().split(/\s+/)
    const parsedBehind = Number.parseInt(left ?? '', 10)
    const parsedAhead = Number.parseInt(right ?? '', 10)
    if (Number.isFinite(parsedBehind)) behind = parsedBehind
    if (Number.isFinite(parsedAhead)) ahead = parsedAhead
  }

  const branch = branchResult.ok ? branchResult.stdout.trim() : undefined
  return {
    isRepository: true,
    // A repository with no commits yet reports `HEAD`; that is not a branch name.
    branch: branch === undefined || branch.length === 0 || branch === 'HEAD' ? undefined : branch,
    ahead,
    behind,
    changes,
  }
}

/**
 * The workspaces this deployment knows, in registry order.
 *
 * The working directory is appended as a fallback whenever the registry is
 * absent OR empty. Empty is the ordinary state of a fresh install: the registry
 * is built from session history, so a harness that has never held a session
 * knows no workspaces, and an explorer that reported "nothing to explore" on
 * first launch would look broken rather than new.
 */
function workspaceRoots(ctx: Context): { id: string; title: string; root: string }[] {
  const listed = ctx.get('workspaceRegistry')?.list() ?? []
  if (listed.length === 0) {
    return [{ id: 'cwd', title: 'Working directory', root: process.cwd() }]
  }
  return listed.map(workspace => ({
    id: String(workspace.id),
    title: workspace.title ?? workspace.path,
    root: workspace.path,
  }))
}

/**
 * The directory one session is working in.
 *
 * A session's own `cwd` is the only correct answer to "which project is the user
 * looking at". The registry's first entry is merely the oldest workspace it
 * knows, so defaulting to it shows an arbitrary OTHER project — which is worse
 * than showing nothing, because a changes list that belongs to a different
 * repository looks authoritative and is not.
 */
function sessionRoot(ctx: Context, sessionId: string): string | undefined {
  // `sessions.get` answers only for a LIVE session, which is exactly the case
  // that matters: the explorer is asking on behalf of the session on screen.
  const session = ctx.get('sessions')?.get(sessionId as never) as any
  if (!session) return undefined
  const cwd = session?.header?.cwd
  if (typeof cwd === 'string' && cwd.length > 0) return cwd
  const wsId = session?.meta?.workspaceId ?? session?.workspaceId
  if (typeof wsId === 'string' && wsId.length > 0) {
    const roots = workspaceRoots(ctx)
    const found = roots.find(r => r.id === wsId)
    if (found) return found.root
  }
  return undefined
}

/**
 * The workspace a session belongs to, for a session the live registry no longer
 * holds.
 *
 * Reopening yesterday's conversation is the ordinary case, not an edge one, and
 * `sessions.get` returns nothing for it — so without this step every historical
 * session fell through to the "oldest workspace" fallback and described a
 * project the user was not looking at.
 *
 * `sessionIds` is the registry's own header-validated projection (it is what
 * groups the sidebar), so it covers persisted sessions and costs no disk read
 * here.
 */
function workspaceRootBySession(ctx: Context, sessionId: string): string | undefined {
  const owning = ctx.get('workspaceRegistry')?.list()
    .find(workspace => workspace.sessionIds.some(id => String(id) === sessionId))
  return owning?.path
}

/**
 * The `cwd` recorded in the session's own stored header.
 *
 * This is the authoritative answer and the reason the earlier two steps are not
 * enough: `sessionIds` is filtered by an index the registry builds at startup,
 * documented to drop candidates whose headers are missing or whose cwd fails
 * canonicalization — so it legitimately returns nothing for a session whose file
 * is on disk and perfectly readable. The header, by contrast, is written once at
 * creation and never rewritten, so it says where the conversation actually ran.
 *
 * Costs one backend listing, which is why it sits behind the two synchronous
 * steps rather than in front of them.
 */
async function sessionRootFromHeader(ctx: Context, sessionId: string, signal: AbortSignal): Promise<string | undefined> {
  const persistence = ctx.get('sessionPersistence')
  if (persistence === undefined) return undefined
  try {
    const headers = await persistence.list(signal)
    const found = headers.find(header => String(header.id) === sessionId)
    const cwd: unknown = (found as { cwd?: unknown } | undefined)?.cwd
    return typeof cwd === 'string' && cwd.length > 0 ? cwd : undefined
  } catch {
    // A backend that cannot list is not a reason to fail the whole request; the
    // caller still has the client-named workspace to fall back to.
    return undefined
  }
}

/**
 * Decide which directory to answer about, most authoritative source first.
 *
 *   1. The requesting session's own `cwd` — the project the user is demonstrably
 *      working in. Only a LIVE session has one.
 *   2. The workspace that owns the session, for a session the live registry has
 *      already dropped. Reopening an older conversation is ordinary, so without
 *      this the common case fell straight through to step 5.
 *   3. The `cwd` in the session's stored header — authoritative, and the step that
 *      catches sessions the registry's startup index filtered out.
 *   4. The workspace the client named. For a blank session (no `cwd` yet, because
 *      nothing has been sent) the browser passes the most recently active
 *      workspace, which is what the user last chose.
 *   5. The registry's first entry, as a last resort.
 *
 * Step 5 alone used to be the whole implementation, and it was wrong in the
 * common case: the registry's first entry is its OLDEST workspace, so a session
 * showed some unrelated project's file tree and change list as though it were
 * the current one — and a changes list belonging to a different repository looks
 * authoritative while being wrong.
 */
function normPath(p: string): string {
  const resolved = resolve(p)
  if (process.platform === 'win32') {
    return resolved.toLowerCase().replace(/\\/g, '/')
  }
  return resolved.replace(/\\/g, '/')
}

export async function resolveRoot(
  ctx: Context,
  requestedId: string | null,
  sessionId: string | null | undefined,
  signal: AbortSignal,
): Promise<{ id: string; root: string }> {
  const roots = workspaceRoots(ctx)
  const first = roots[0]

  // 1. Explicitly requested workspace ID or path takes priority
  if (requestedId !== null && requestedId !== undefined && requestedId.length > 0) {
    const targetNorm = normPath(requestedId)
    const found = roots.find(row => row.id === requestedId || normPath(row.root) === targetNorm)
    if (found !== undefined) {
      return { id: found.id, root: found.root }
    }
    // If it is an existing directory path on disk (e.g. worktree not yet in registry):
    if (isAbsolute(requestedId)) {
      try {
        const root = await realpath(requestedId)
        if ((await stat(root)).isDirectory()) return { id: root, root }
      } catch { /* explicit misses must not fall back to another workspace */ }
    }
    throw new ApiError(404, 'no such workspace')
  }

  // 2. Fall back to session's own root
  if (sessionId !== undefined && sessionId !== null && sessionId.length > 0) {
    const root = sessionRoot(ctx, sessionId)
      ?? workspaceRootBySession(ctx, sessionId)
      ?? await sessionRootFromHeader(ctx, sessionId, signal)
    if (root !== undefined) {
      const rootNorm = normPath(root)
      const known = roots.find(row => row.root === root || normPath(row.root) === rootNorm)
      return { id: known?.id ?? root, root }
    }
    throw new ApiError(409, 'cannot resolve the workspace for this session')
  }

  if (first === undefined) throw new ApiError(409, 'this deployment has no workspace to explore')
  return { id: first.id, root: first.root }
}

export function mountExplorer(
  ctx: Context,
  config: () => Config,
  routes: Record<string, ApiHandler>,
): () => void {
  return installRoutes(routes, {
    '/explorer/workspaces': () => ({ workspaces: workspaceRoots(ctx) }),

    '/explorer/tree': async ({ query, req }) => {
      const settings = config()
      if (!settings.explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { id, root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      const dir = await containedPath(root, query.get('path') ?? '')
      return {
        workspace: id,
        root,
        name: basename(root),
        path: toPosix(root, dir),
        entries: await listDirectory(root, dir, settings, controller.signal),
      }
    },

    '/explorer/status': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { id, root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      return {
        workspace: id,
        root,
        name: basename(root),
        ...await readStatus(root, controller.signal),
      }
    },

    '/explorer/diff': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      const requested = query.get('path')
      if (requested === null || requested.length === 0) throw new ApiError(400, 'a path is required')
      // Validate containment before handing the path to git, then pass it after
      // `--` so a path that looks like an option cannot become one.
      await containedPath(root, requested, true)
      const staged = query.get('staged') === '1'
      const result = await git(
        ['diff', ...(staged ? ['--cached'] : []), '--no-color', '--', requested],
        { cwd: root, signal: controller.signal },
      )
      if (!result.ok && result.stdout.length === 0) {
        throw new ApiError(409, 'git could not produce a diff for that path')
      }
      return { path: requested, staged, patch: result.stdout }
    },

    '/explorer/review': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      const requested = query.get('path')
      if (requested === null || requested.length === 0) throw new ApiError(400, 'a path is required')
      const absolute = await containedPath(root, requested, true)

      const side = query.get('side') ?? 'combined'
      if (!['staged', 'unstaged', 'combined'].includes(side)) throw new ApiError(400, 'invalid diff side')
      const repo = await repositoryRoot(root, controller.signal)
      if (!repo) throw new ApiError(409, 'not a Git repository')
      const gitPath = relative(repo, resolve(root, requested)).split(sep).join('/')
      const headResult = await git(['show', `${side === 'unstaged' ? '' : 'HEAD'}:${gitPath}`], { cwd: root, signal: controller.signal })
      const oldText = headResult.ok ? toLf(headResult.stdout) : null

      if (side === 'staged') {
        const indexed = await git(['show', `:${gitPath}`], { cwd: root, signal: controller.signal })
        const statResult = await git(['--literal-pathspecs', 'diff', '--cached', '--numstat', '-z', '--', requested], { cwd: root, signal: controller.signal })
        const counts = statResult.ok ? parseNumstat(statResult.stdout).get(gitPath) : undefined
        if (oldText?.includes('\0') || indexed.stdout.includes('\0')) return { path: requested, oldText: null, newText: '', isBinary: true }
        return { path: requested, oldText, newText: indexed.ok ? toLf(indexed.stdout) : '', ...(counts ?? {}) }
      }

      // The current side comes from disk. A file deleted in the worktree reads
      // as empty, drawn as a whole removal — which is the honest review of it.
      let newText = ''
      try {
        const info = await stat(absolute)
        if (info.isFile()) {
          const ext = extname(requested).toLowerCase()
          const mimeType = IMAGE_MIMES.get(ext)
          if (mimeType !== undefined) {
            const buffer = await readFile(absolute)
            return {
              path: requested,
              oldText: null,
              newText: '',
              isImage: true,
              newImageUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
            }
          }

          if (info.size > MAX_VIEW_BYTES) throw new ApiError(413, 'that file is too large to review')
          const buffer = await readFile(absolute)
          if (buffer.includes(0)) {
            return {
              path: requested,
              oldText: null,
              newText: '',
              isBinary: true,
            }
          }
          newText = toLf(buffer.toString('utf8'))
        }
      } catch (error: unknown) {
        if (error instanceof ApiError) throw error
        const code = (error as { code?: string }).code
        if (code !== 'ENOENT') throw new ApiError(404, 'that file could not be read')
      }

      // Header counts for the diff tab: one numstat against HEAD covers both
      // staged and unstaged work; a path git does not track (a brand-new file)
      // counts its lines from the text just read.
      const countResult = await git(['--literal-pathspecs', 'diff', ...(side === 'combined' ? ['HEAD'] : []), '--numstat', '-z', '--', requested], { cwd: root, signal: controller.signal })
      const counted = countResult.ok ? parseNumstat(countResult.stdout).get(requested) : undefined
      const countedUntracked = counted === undefined && oldText === null && newText.length > 0
        ? { added: lineCount(newText), removed: 0 }
        : undefined
      const lines = counted ?? countedUntracked
      return {
        path: requested,
        oldText,
        newText,
        ...(lines === undefined ? {} : { added: lines.added, removed: lines.removed }),
      }
    },

    '/explorer/file': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const workspaceParam = query.get('workspace')
      const sessionParam = query.get('session')
      const { root } = await resolveRoot(ctx, workspaceParam, sessionParam, controller.signal)
      const requested = query.get('path')
      if (requested === null || requested.length === 0) throw new ApiError(400, 'a path is required')

      const scopeParts = [
        workspaceParam ? `workspace=${encodeURIComponent(workspaceParam)}` : null,
        sessionParam ? `session=${encodeURIComponent(sessionParam)}` : null,
      ].filter((p): p is string => p !== null)
      const scopeSuffix = scopeParts.length > 0 ? `&${scopeParts.join('&')}` : ''

      return await readTextFile(root, requested, scopeSuffix)
    },

    '/explorer/raw': async ({ req, res, query }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const requested = query.get('path')
      if (requested === null || requested.length === 0) throw new ApiError(400, 'a path is required')

      // 1. Try to find the file in the resolved workspace root
      let targetFile: string | undefined
      try {
        const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
        const candidate = await containedPath(root, requested)
        const st = await stat(candidate)
        if (st.isFile()) targetFile = candidate
      } catch {}

      // 2. If not found in the primary workspace, search across all open workspaces as a fallback
      if (!targetFile) {
        for (const ws of workspaceRoots(ctx)) {
          try {
            const candidate = await containedPath(ws.root, requested)
            const st = await stat(candidate)
            if (st.isFile()) {
              targetFile = candidate
              break
            }
          } catch {}
        }
      }

      if (!targetFile) throw new ApiError(404, 'that path could not be found in any workspace')

      const info = await stat(targetFile)
      const ext = extname(requested).toLowerCase()
      const mime = MEDIA_MIMES.get(ext) ?? 'application/octet-stream'
      const fileSize = info.size
      const range = req.headers.range

      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range)
        if (match) {
          const rawStart = match[1]
          const rawEnd = match[2]
          let start = rawStart && rawStart.length > 0 ? parseInt(rawStart, 10) : 0
          let end = rawEnd && rawEnd.length > 0 ? parseInt(rawEnd, 10) : fileSize - 1

          if (isNaN(start)) start = 0
          if (isNaN(end) || end >= fileSize) end = fileSize - 1

          if (start >= fileSize || start > end) {
            res.writeHead(416, {
              'Content-Range': `bytes */${fileSize}`,
            })
            res.end()
            return
          }

          const chunksize = (end - start) + 1
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mime,
          })
          const stream = createReadStream(targetFile, { start, end })
          stream.on('error', () => {
            if (!res.headersSent) {
              res.writeHead(500)
              res.end()
            }
          })
          req.on('close', () => { stream.destroy() })
          stream.pipe(res)
          return
        }
      }

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': mime,
      })
      const stream = createReadStream(targetFile)
      stream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500)
          res.end()
        }
      })
      req.on('close', () => { stream.destroy() })
      stream.pipe(res)
    },

    '/explorer/files': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { id, root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      // The picker loads this list once per open and filters it in the browser,
      // so the cap trades a bounded payload against completeness on a huge repo.
      const listing = await listAllFiles(root, 4000, controller.signal)
      return { workspace: id, ...listing }
    },

    '/explorer/open-editor': async ({ query, req }) => {
      if (!config().explorer.enabled) throw new ApiError(404, 'the explorer is switched off')
      const controller = new AbortController()
      req.on('close', () => { controller.abort() })
      const { root } = await resolveRoot(ctx, query.get('workspace'), query.get('session'), controller.signal)
      // A path is optional: with none, the editor opens the workspace itself,
      // which is what the toolbar button asks for.
      const requested = query.get('path') ?? ''
      const target = requested.length === 0 ? root : await containedPath(root, requested)
      const editorType = query.get('editor') ?? 'vscode'
      ctx.logger('dsh-ext').info('[Explorer] Opening with editor type: %s, target: %s', editorType, target)
      return await openInEditor(root, target, requested.length > 0, editorType)
    },
  })
}
