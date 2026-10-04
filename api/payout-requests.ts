// POST /api/payout-requests  an X account asks the desk to pay its vault balance out through X Money.
// The desk confirms the handle with X sign-in before any payout, so a request on its own moves nothing.
// Env: DESK_WEBHOOK_URL receives each request (required outside local development).
import { promises as fs } from 'node:fs'
import path from 'node:path'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const HANDLE_RE = /^[a-z0-9_]{1,15}$/
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const LOCAL_FILE = path.join(process.cwd(), '.data', 'payout-requests.json')
const isLocal = !process.env.VERCEL

export async function POST(request: Request) {
  let body: { handle?: string; vault?: string; requestedBy?: string | null }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json(400, { error: 'Expected JSON.' })
  }
  const handle = String(body.handle ?? '').replace(/^@/, '').toLowerCase()
  if (!HANDLE_RE.test(handle) || !BASE58.test(String(body.vault ?? ''))) return json(400, { error: 'A valid handle and vault are required.' })
  if (!process.env.DESK_WEBHOOK_URL && !isLocal) {
    return json(501, { error: 'The payout desk is not connected yet (DESK_WEBHOOK_URL).' })
  }

  const record = {
    id: crypto.randomUUID(),
    type: 'payout-request',
    handle,
    vault: String(body.vault),
    requestedBy: body.requestedBy && BASE58.test(body.requestedBy) ? body.requestedBy : null,
    channel: 'x-money',
    at: new Date().toISOString(),
  }

  if (process.env.DESK_WEBHOOK_URL) {
    const res = await fetch(process.env.DESK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => null)
    if (!res || !res.ok) return json(502, { error: 'The payout desk did not accept the request. Try again shortly.' })
  }
  if (isLocal) {
    let all: unknown[] = []
    try {
      all = JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'))
    } catch {
      all = []
    }
    all.push(record)
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true })
    await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2))
  }
  return json(202, { ok: true, id: record.id })
}
