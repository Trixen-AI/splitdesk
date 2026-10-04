// POST /api/launches  records a finished launch so the desk can sweep its fees and pay each X account.
// GET  /api/launches  lists recorded launches (local development only).
// Env: DESK_WEBHOOK_URL (optional) receives every record, e.g. the desk's payout queue.
import { promises as fs } from 'node:fs'
import path from 'node:path'

type LaunchRecord = {
  mint: string
  creator: string
  cluster: string
  quote: 'usdc' | 'sol'
  uri: string
  signatures: string[]
  shares: { handle: string; bps: number; vault: string }[]
  at: string
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const LOCAL_FILE = path.join(process.cwd(), '.data', 'launches.json')
const isLocal = !process.env.VERCEL

async function readLocal(): Promise<LaunchRecord[]> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'))
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  let body: Partial<LaunchRecord>
  try {
    body = (await request.json()) as Partial<LaunchRecord>
  } catch {
    return json(400, { error: 'Expected JSON.' })
  }
  const shares = Array.isArray(body.shares) ? body.shares : []
  if (
    !body.mint || !BASE58.test(body.mint) ||
    !body.creator || !BASE58.test(body.creator) ||
    !Array.isArray(body.signatures) || body.signatures.length === 0 ||
    shares.length < 1 || shares.length > 10 ||
    shares.reduce((a, s) => a + (s.bps | 0), 0) !== 10000 ||
    shares.some((s) => !BASE58.test(String(s.vault)))
  ) {
    return json(400, { error: 'Invalid launch record.' })
  }
  const record: LaunchRecord = {
    mint: body.mint,
    creator: body.creator,
    cluster: String(body.cluster ?? 'devnet'),
    quote: body.quote === 'sol' ? 'sol' : 'usdc',
    uri: String(body.uri ?? ''),
    signatures: body.signatures.map(String),
    shares: shares.map((s) => ({ handle: String(s.handle), bps: s.bps | 0, vault: String(s.vault) })),
    at: new Date().toISOString(),
  }

  if (process.env.DESK_WEBHOOK_URL) {
    await fetch(process.env.DESK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(record),
    }).catch((e) => console.error('desk webhook failed', e))
  }
  if (isLocal) {
    const all = await readLocal()
    all.push(record)
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true })
    await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2))
  } else {
    console.log('launch recorded', JSON.stringify(record))
  }
  return json(202, { ok: true })
}

export async function GET(request: Request) {
  if (!isLocal) return json(404, { error: 'Not available.' })
  const creator = new URL(request.url).searchParams.get('creator')
  const all = await readLocal()
  return json(200, creator ? all.filter((r) => r.creator === creator) : all)
}
