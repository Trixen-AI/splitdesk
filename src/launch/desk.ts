import { PublicKey, SystemProgram } from '@solana/web3.js'

export const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/

export function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '').split(/[/?#]/)[0].toLowerCase()
}

/**
 * The payout vault for one X account: an address derived from the desk authority and the handle
 * (`createWithSeed(desk, "x:<handle>")`). Anyone can recompute it; only the desk key can move funds
 * out of it, which is what lets the desk pay the account in USD through X Money.
 */
export function deskVaultFor(desk: PublicKey, handle: string) {
  return PublicKey.createWithSeed(desk, `x:${normalizeHandle(handle)}`, SystemProgram.programId)
}

export type ShareRow = { id: string; handle: string; pct: string }

/** Percent strings (two decimals) to basis points that add up to exactly 10,000. */
export function toBps(rows: ShareRow[]) {
  return rows.map((r) => Math.round((parseFloat(r.pct) || 0) * 100))
}

export function evenSplit(n: number) {
  const base = Math.floor(10000 / n)
  return Array.from({ length: n }, (_, i) => base + (i < 10000 - base * n ? 1 : 0)).map((b) => (b / 100).toFixed(2))
}

export function validateShares(rows: ShareRow[]): string | null {
  if (rows.length === 0) return 'Add at least one X account.'
  if (rows.length > 10) return 'Pump.fun fee sharing allows up to 10 accounts.'
  const seen = new Set<string>()
  for (const r of rows) {
    const h = normalizeHandle(r.handle)
    if (!HANDLE_RE.test(h)) return `"${r.handle || 'empty'}" is not a valid X handle.`
    if (seen.has(h)) return `@${h} is listed twice.`
    seen.add(h)
  }
  const bps = toBps(rows)
  if (bps.some((b) => b <= 0)) return 'Every account needs a share above 0%.'
  const total = bps.reduce((a, b) => a + b, 0)
  if (total !== 10000) return `Shares add up to ${(total / 100).toFixed(2)}%. They need to total 100%.`
  return null
}

/* ---------- On-chain split record ----------
 * pump.fun's IPFS writes its own metadata, so the handle -> share list is recorded on-chain instead:
 * a memo in a launch transaction that also touches `splitRecordAddress(mint)`, an address derived from
 * the mint that nothing else uses. Reading it back is one signature lookup on that address.
 */
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

export function splitRecordAddress(mint: PublicKey) {
  return PublicKey.createWithSeed(mint, 'splitdesk:v1', SystemProgram.programId)
}

export type SplitRecord = { authority: string; shares: { handle: string; bps: number }[] }

export function encodeSplitRecord(r: SplitRecord) {
  return JSON.stringify({ splitdesk: 1, a: r.authority, s: r.shares.map((s) => [s.handle, s.bps]) })
}

export function decodeSplitRecord(memo: string): SplitRecord | null {
  // RPC memo logs may carry a "[len] " prefix
  const start = memo.indexOf('{')
  if (start < 0) return null
  try {
    const j = JSON.parse(memo.slice(start)) as { splitdesk?: number; a?: string; s?: [string, number][] }
    if (j.splitdesk !== 1 || typeof j.a !== 'string' || !Array.isArray(j.s)) return null
    return {
      authority: j.a,
      shares: j.s.filter((x) => Array.isArray(x) && HANDLE_RE.test(String(x[0]))).map(([handle, bps]) => ({ handle: String(handle).toLowerCase(), bps: Number(bps) || 0 })),
    }
  } catch {
    return null
  }
}
