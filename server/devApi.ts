import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, ViteDevServer } from 'vite'

// Serves the files in /api (Vercel-style Web handlers: `export async function POST(req: Request)`)
// from the Vite dev server, so `npm run dev` runs the whole desk locally.
type Handler = (req: Request) => Promise<Response> | Response

async function toRequest(req: IncomingMessage, origin: string): Promise<Request> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const body = chunks.length ? Buffer.concat(chunks) : undefined
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x))
    else if (v != null) headers.set(k, v)
  }
  const method = req.method ?? 'GET'
  return new Request(new URL(req.url ?? '/', origin), {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : body,
  })
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status
  response.headers.forEach((v, k) => res.setHeader(k, v))
  res.end(Buffer.from(await response.arrayBuffer()))
}

export function devApi(): Plugin {
  return {
    name: 'splitdesk-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        const match = /^\/api\/([a-z-]+)(?:\?.*)?$/.exec(url)
        if (!match) return next()
        try {
          const mod = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<string, Handler>
          const handler = mod[req.method ?? 'GET']
          if (!handler) {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }
          const request = await toRequest(req, `http://${req.headers.host ?? 'localhost'}`)
          await send(res, await handler(request))
        } catch (err) {
          server.config.logger.error(String(err))
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Desk API failed', detail: String(err) }))
        }
      })
    },
  }
}
