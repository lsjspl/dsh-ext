import { execFile } from 'node:child_process'

/**
 * Run `git` and collect its output.
 *
 * Deliberately `node:child_process` rather than `ctx.subprocess`: this plugin's
 * whole point includes not being the reason a harness fails to boot, so its
 * runtime dependency surface stays at the four tiny packages package.json
 * declares. `execFile` (not `exec`) means no shell parses these arguments —
 * a branch or path containing `;` or `&&` is an argument, never a command.
 */

export interface GitResult {
  readonly ok: boolean
  readonly code: number
  readonly stdout: string
  readonly stderr: string
}

export interface GitOptions {
  /** Working directory. For shadow-repo work this is the *worktree*, not the git dir. */
  readonly cwd: string
  /** Extra environment. `GIT_DIR` is how the shadow repository stays out of the project's. */
  readonly env?: Readonly<Record<string, string>>
  readonly timeoutMs?: number
  readonly maxBuffer?: number
  readonly signal?: AbortSignal
  /**
   * Text written to git's stdin, for the `--stdin` forms. Batching a whole
   * directory's paths through one `check-ignore` is the difference between one
   * process and one per entry.
   */
  readonly input?: string
}

const DEFAULT_TIMEOUT_MS = 20_000
const DEFAULT_MAX_BUFFER = 32 * 1024 * 1024

/**
 * Environment every invocation gets. The point is determinism: a user's
 * `core.pager`, credential helper, or hook must not be able to make a
 * read-only status call hang, prompt, or open an editor.
 */
function baseEnv(extra?: Readonly<Record<string, string>>): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...extra,
    GIT_TERMINAL_PROMPT: '0',
    GIT_ASKPASS: '',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_PAGER: 'cat',
    // A repository-local hook must not run on this plugin's behalf.
    GIT_CONFIG_NOSYSTEM: '1',
    LC_ALL: 'C',
  }
}

/**
 * Invoke git. Never rejects: a non-zero exit is an ordinary outcome here (not
 * a repository, no upstream, an unborn branch), and every caller wants to
 * branch on it rather than catch.
 *
 * @param args - argv after `git`, passed through without shell interpretation.
 * @param options - working directory, environment, and limits.
 * @returns exit code with captured output.
 */
export async function git(args: readonly string[], options: GitOptions): Promise<GitResult> {
  return await new Promise<GitResult>((resolve) => {
    const child = execFile('git', [...args], {
      cwd: options.cwd,
      env: baseEnv(options.env),
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxBuffer: options.maxBuffer ?? DEFAULT_MAX_BUFFER,
      windowsHide: true,
      signal: options.signal,
      encoding: 'utf8',
    }, (error, stdout, stderr) => {
      const code = error === null
        ? 0
        : typeof (error as { code?: unknown }).code === 'number'
          ? (error as { code: number }).code
          : 1
      resolve({
        ok: error === null,
        code,
        stdout: typeof stdout === 'string' ? stdout : '',
        stderr: typeof stderr === 'string' ? stderr : (error?.message ?? ''),
      })
    })

    if (options.input !== undefined && child.stdin !== null) {
      // A git that exits before reading its input (an unknown option, a
      // repository it refuses) makes this write fail with EPIPE; that is the
      // exit code's story to tell, not an unhandled error.
      child.stdin.on('error', () => { /* the callback above reports the outcome */ })
      child.stdin.end(options.input)
    }
  })
}

/** Whether `git` is on PATH at all. Cached: the answer cannot change usefully mid-process. */
let gitAvailable: boolean | undefined
export async function hasGit(cwd: string): Promise<boolean> {
  if (gitAvailable !== undefined) return gitAvailable
  const result = await git(['--version'], { cwd, timeoutMs: 5_000 })
  gitAvailable = result.ok
  return gitAvailable
}

/**
 * The workspace's own repository root, or `undefined` when the directory is not
 * in one. Used to decide whether the explorer shows a changes list at all, and
 * to tell a checkpoint restore which files the user's git would still hold.
 */
export async function repositoryRoot(cwd: string, signal?: AbortSignal): Promise<string | undefined> {
  const result = await git(['rev-parse', '--show-toplevel'], { cwd, signal })
  if (!result.ok) return undefined
  const root = result.stdout.trim()
  return root.length === 0 ? undefined : root
}

/**
 * Split a NUL-delimited git output into records, dropping the trailing empty
 * one. `-z` output is the only form safe against paths containing newlines,
 * quotes, or non-UTF-8 bytes, so every parser here consumes it.
 */
export function splitNul(text: string): string[] {
  const parts = text.split('\0')
  if (parts.length > 0 && parts[parts.length - 1] === '') parts.pop()
  return parts
}

/**
 * Determine the current branch name, whether it is detached, and whether the branch is unborn (empty repo).
 */
export async function gitBranchState(cwd: string, signal?: AbortSignal): Promise<{
  branch?: string
  isDetached: boolean
  isUnborn: boolean
}> {
  const symRef = await git(['symbolic-ref', '--short', '-q', 'HEAD'], { cwd, signal })
  const hasHead = await git(['rev-parse', '--verify', 'HEAD'], { cwd, signal })
  const isUnborn = !hasHead.ok
  if (symRef.ok && symRef.stdout.trim().length > 0) {
    return { branch: symRef.stdout.trim(), isDetached: false, isUnborn }
  }
  if (hasHead.ok) {
    const headSha = await git(['rev-parse', '--short', 'HEAD'], { cwd, signal })
    return { branch: headSha.stdout.trim(), isDetached: true, isUnborn: false }
  }
  return { branch: undefined, isDetached: false, isUnborn: true }
}

