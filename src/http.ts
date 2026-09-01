import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { API_PREFIX } from './shared/api-contract.ts'

export { API_PREFIX }

export interface ApiRequest {
  readonly req: IncomingMessage
  /** Path after {@link API_PREFIX}, always leading-slash, never empty. */
  readonly route: string
  readonly method: string
  readonly query: URLSearchParams
  /** Parsed JSON body, or `undefined` for a body-less request. */
  readonly body: unknown
}

export type ApiHandler = (request: ApiRequest) => Promise<unknown> | unknown

/** Thrown by a handler to answer with a specific status instead of a 500. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Splice a feature's endpoints into the live route table and return the
 * disposer that removes exactly them.
 *
 * The table is shared and mutable rather than rebuilt per feature because the
 * web server registration happens once at load: a feature toggled on at
 * runtime has to reach an already-mounted handler. A route whose key is
 * already taken is refused loudly — two features answering one path is a
 * composition defect, not something to resolve silently at runtime.
 *
 * @param table - the live route table the API handler reads.
 * @param additions - the feature's endpoints.
 * @returns a disposer removing only the entries this call added.
 */
export function installRoutes(
  table: Record<string, ApiHandler>,
  additions: Readonly<Record<string, ApiHandler>>,
): () => void {
  const added: string[] = []
  for (const [route, handler] of Object.entries(additions)) {
    if (table[route] !== undefined) {
      for (const key of added) delete table[key]
      throw new Error(`dsh-dev-tool-ext: two features both claim the route ${route}`)
    }
    table[route] = handler
    added.push(route)
  }
  return () => {
    for (const route of added) delete table[route]
  }
}

const MAX_BODY_BYTES = 1024 * 1024

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = chunk as Buffer
    size += buf.length
    if (size > MAX_BODY_BYTES) throw new ApiError(413, 'request body too large')
    chunks.push(buf)
  }
  if (size === 0) return undefined
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new ApiError(400, 'request body is not valid JSON')
  }
}

/**
 * Same-origin fence. The Web shell already restricts who can reach the server
 * (loopback by default), but a browser page from anywhere can still *send* a
 * request to localhost. Requiring the Origin header — when present — to match
 * the Host we were reached on keeps a foreign page from driving these
 * endpoints through the user's own browser.
 */
function isSameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin
  if (origin === undefined || origin === 'null') return true
  const host = req.headers.host
  if (host === undefined) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Mount this plugin's JSON API. Handlers return a plain value that becomes the
 * response body; throwing {@link ApiError} selects the status. Anything else
 * that escapes a handler is logged and answered 500 without leaking its
 * message, because a handler error can carry a path or a credential source.
 */
export function serveApi(ctx: Context, routes: Readonly<Record<string, ApiHandler>>): void {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      const send = (status: number, payload: unknown) => {
        const text = JSON.stringify(payload ?? null)
        res.writeHead(status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(text)
      }

      try {
        if (!isSameOrigin(req)) throw new ApiError(403, 'cross-origin request refused')

        const url = new URL(req.url ?? '/', 'http://localhost')
        const route = url.pathname.slice(API_PREFIX.length) || '/'
        const handler = routes[route]
        if (handler === undefined) throw new ApiError(404, `no such endpoint: ${route}`)

        const body = await readJsonBody(req)
        const value = await handler({
          req,
          route,
          method: req.method ?? 'GET',
          query: url.searchParams,
          body,
        })
        send(200, { ok: true, value: value ?? null })
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          send(error.status, { ok: false, message: error.message })
          return
        }
        ctx.logger('dsh-dev-tool-ext').warn(error)
        send(500, { ok: false, message: 'internal error; see the harness log' })
      }
    },
  }), 'dsh-dev-tool-ext: json api')
}
