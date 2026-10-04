// POST /api/metadata  (multipart form)
// Uploads the coin image + metadata through pump.fun's public IPFS endpoint (no API key) and returns
// the URI that create_v2 points at. The browser cannot call pump.fun directly (no CORS), so the
// desk forwards the form. The split itself is recorded on-chain at launch, not in this JSON.

const PUMP_IPFS = 'https://pump.fun/api/ipfs'
const MAX_IMAGE = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const str = (v: File | string | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const optUrl = (v: string) => (/^https?:\/\/\S+$/i.test(v) ? v : '')

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return json(400, { error: 'Expected multipart form data.' })
  }

  const name = str(form.get('name'), 32)
  const symbol = str(form.get('symbol'), 13)
  const image = form.get('image')
  if (!name || !symbol) return json(400, { error: 'Name and ticker are required.' })
  if (!(image instanceof Blob)) return json(400, { error: 'An image is required.' })
  if (!IMAGE_TYPES.includes(image.type)) return json(400, { error: 'Image must be PNG, JPG, GIF or WebP.' })
  if (image.size > MAX_IMAGE) return json(400, { error: 'Image must be 4 MB or smaller.' })

  const out = new FormData()
  out.append('file', image, `${symbol.toLowerCase()}.${image.type.split('/')[1]}`)
  out.append('name', name)
  out.append('symbol', symbol)
  out.append('description', str(form.get('description'), 500))
  out.append('twitter', optUrl(str(form.get('twitter'), 200)))
  out.append('telegram', optUrl(str(form.get('telegram'), 200)))
  out.append('website', optUrl(str(form.get('website'), 200)))
  out.append('showName', 'true')

  try {
    const res = await fetch(PUMP_IPFS, { method: 'POST', body: out, signal: AbortSignal.timeout(30_000) })
    if (!res.ok) return json(502, { error: `pump.fun IPFS upload failed (${res.status}). Try again in a moment.` })
    const body = (await res.json()) as { metadataUri?: string; metadata?: { image?: string } & Record<string, unknown> }
    if (!body.metadataUri) return json(502, { error: 'pump.fun IPFS returned no metadata URI.' })
    return json(200, { uri: body.metadataUri, image: body.metadata?.image ?? null, metadata: body.metadata ?? null })
  } catch (err) {
    return json(502, { error: `pump.fun IPFS upload failed: ${err instanceof Error ? err.message : String(err)}` })
  }
}
