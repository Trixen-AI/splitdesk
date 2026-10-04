import useSWR from 'swr'
import bs58 from 'bs58'
import { PublicKey, type AccountInfo } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, getTokenMetadata, unpackAccount } from '@solana/spl-token'
import { PUMP_FEE_PROGRAM_ID, PUMP_SDK, bondingCurvePda, feeSharingConfigPda, type Global } from '@pump-fun/pump-sdk'
import { DESK_BASE, USDC_MINT } from '@/launch/config'
import { decodeSplitRecord, deskVaultFor, splitRecordAddress, type SplitRecord } from '@/launch/desk'
import { connection, pump, quoteDecimals, quoteOf, toUi, type QuoteKind } from '../chain'
import { registryMints } from '../registry'

// Pump Fees `SharingConfig` layout: disc(8) bump(1) version(1) status(1) mint(32) admin(32) adminRevoked(1) shareholders(vec)
const SHARING_CONFIG_DISC = bs58.encode(Uint8Array.from([216, 74, 9, 0, 56, 140, 93, 75]))
export const ADMIN_OFFSET = 43
export const SHAREHOLDER_OFFSET = (i: number) => 80 + 34 * i
export const MAX_SHAREHOLDERS = 10

export type Shareholder = { address: string; bps: number; handle: string | null; verified: boolean }
export type CoinSummary = {
  mint: string
  name: string
  symbol: string
  image: string | null
  uri: string | null
  quote: QuoteKind
  curve: { exists: boolean; complete: boolean; progress: number; marketCap: number }
  config: { exists: boolean; active: boolean; admin: string | null; locked: boolean; shareholders: Shareholder[] }
  fees: { pending: number; bondingCurve: number; amm: number }
  creatorVault: string | null
}

type Meta = { name: string; symbol: string; uri: string | null; image: string | null; authority: string | null; handles: { handle: string; bps: number }[] }

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    return res.ok ? ((await res.json()) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

async function readMeta(mint: PublicKey): Promise<Meta> {
  const onchain = await getTokenMetadata(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID).catch(() => null)
  const uri = onchain?.uri || null
  const json = uri ? await fetchJson(uri) : null
  const block = json?.splitdesk as { authority?: string; shares?: { x?: string; bps?: number }[] } | undefined
  const shares = block?.shares ?? []
  return {
    name: onchain?.name || (json?.name as string) || 'Unknown coin',
    symbol: onchain?.symbol || (json?.symbol as string) || '???',
    uri,
    image: typeof json?.image === 'string' ? json.image : null,
    authority: typeof block?.authority === 'string' ? block.authority : null,
    handles: shares
      .filter((s) => typeof s.x === 'string')
      .map((s) => ({ handle: String(s.x).replace(/^@/, '').toLowerCase(), bps: Number(s.bps) || 0 })),
  }
}

/** Map on-chain shareholder addresses back to the X handles named in the coin metadata. */
/** The on-chain split record for a mint (memo written at launch), if any. */
async function readSplitRecord(mint: PublicKey): Promise<SplitRecord | null> {
  const sigs = await connection.getSignaturesForAddress(await splitRecordAddress(mint), { limit: 10 }).catch(() => [])
  for (const s of sigs) {
    const r = s.memo && !s.err ? decodeSplitRecord(s.memo) : null
    if (r) return r
  }
  return null
}

/**
 * Map on-chain shareholder addresses back to X handles. A handle is only shown when its vault,
 * re-derived from the recorded authority, equals the shareholder address, so a forged record
 * cannot attach a wrong name.
 */
async function labelShareholders(raw: { address: PublicKey; shareBps: number }[], meta: Meta, record: SplitRecord | null): Promise<Shareholder[]> {
  const candidates: { authority: PublicKey; handle: string }[] = []
  const add = (authority: string | PublicKey | null | undefined, handles: { handle: string }[]) => {
    if (!authority) return
    try {
      const key = typeof authority === 'string' ? new PublicKey(authority) : authority
      for (const h of handles) candidates.push({ authority: key, handle: h.handle })
    } catch {
      // malformed authority in a record: ignore it
    }
  }
  if (record) add(record.authority, record.shares)
  add(meta.authority ?? DESK_BASE, meta.handles)

  const byVault = new Map<string, string>()
  const pairs = await Promise.all(candidates.map(async (c) => [(await deskVaultFor(c.authority, c.handle)).toBase58(), c.handle] as const))
  for (const [vault, handle] of pairs) if (!byVault.has(vault)) byVault.set(vault, handle)

  return raw.map((s) => {
    const address = s.address.toBase58()
    const handle = byVault.get(address) ?? null
    return { address, bps: s.shareBps, handle, verified: handle !== null }
  })
}

let globalCache: Promise<Global> | null = null
const getGlobal = () => (globalCache ??= pump.fetchGlobal())

function isActive(config: object) {
  const status = (config as { status?: object }).status
  return status ? 'active' in status : true
}

function decodeConfig(info: AccountInfo<Buffer> | null) {
  if (!info) return null
  try {
    return PUMP_SDK.decodeSharingConfig(info)
  } catch {
    return null
  }
}

/** Live state of several coins: metadata, curve, split and pending creator fees. */
export async function loadCoins(mints: string[], opts: { labels?: boolean } = {}): Promise<CoinSummary[]> {
  if (mints.length === 0) return []
  const keys = mints.map((m) => new PublicKey(m))
  const [curves, configs, global] = await Promise.all([
    connection.getMultipleAccountsInfo(keys.map((k) => bondingCurvePda(k))),
    connection.getMultipleAccountsInfo(keys.map((k) => feeSharingConfigPda(k))),
    getGlobal(),
  ])
  const initialReal = Number(global.initialRealTokenReserves.toString())

  return Promise.all(
    keys.map(async (mint, i) => {
      const curve = curves[i] ? PUMP_SDK.decodeBondingCurveNullable(curves[i]!) : null
      const config = decodeConfig(configs[i])
      const quote = quoteOf(curve?.quoteMint)
      const qd = quoteDecimals(quote)
      const [meta, vaults, record] = await Promise.all([
        readMeta(mint),
        curve ? pump.getCreatorVaultQuoteBalances(curve.creator).catch(() => []) : Promise.resolve([]),
        opts.labels && config ? readSplitRecord(mint) : Promise.resolve(null),
      ])
      const quoteMint = quote === 'USDC' ? USDC_MINT : null
      const v = vaults.find((b) => (quoteMint ? b.mint.equals(quoteMint) : quoteOf(b.mint) === 'SOL'))
      const vTokens = curve ? Number(curve.virtualTokenReserves.toString()) : 0
      const mcapRaw = curve && vTokens > 0 ? (Number(curve.virtualQuoteReserves.toString()) * Number(curve.tokenTotalSupply.toString())) / vTokens : 0
      const realLeft = curve ? Number(curve.realTokenReserves.toString()) : 0
      return {
        mint: mint.toBase58(),
        name: meta.name,
        symbol: meta.symbol,
        image: meta.image,
        uri: meta.uri,
        quote,
        curve: {
          exists: !!curve,
          complete: !!curve?.complete,
          progress: curve ? (curve.complete ? 1 : Math.max(0, Math.min(1, (initialReal - realLeft) / initialReal))) : 0,
          // token decimals cancel out: supply and virtual token reserves share the same base unit
          marketCap: toUi(Math.round(mcapRaw), qd),
        },
        config: {
          exists: !!config,
          active: config ? isActive(config) : false,
          admin: config ? config.admin.toBase58() : null,
          locked: config ? config.adminRevoked : false,
          shareholders: config ? await labelShareholders(config.shareholders, meta, record) : [],
        },
        fees: {
          pending: v ? toUi(v.total, qd) : 0,
          bondingCurve: v ? toUi(v.pumpVault, qd) : 0,
          amm: v ? toUi(v.ammVault, qd) : 0,
        },
        creatorVault: curve ? curve.creator.toBase58() : null,
      } satisfies CoinSummary
    }),
  )
}

async function configMints(filter: { offset: number; bytes: string }) {
  const accounts = await connection.getProgramAccounts(PUMP_FEE_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: SHARING_CONFIG_DISC } }, { memcmp: filter }],
    dataSlice: { offset: 11, length: 32 }, // just the mint
  })
  return accounts.map((a) => new PublicKey(a.account.data).toBase58())
}

/** Every coin whose fee sharing this wallet set up (found on-chain), plus coins launched from this browser. */
export async function discoverMyCoins(wallet: string) {
  const onchain = await configMints({ offset: ADMIN_OFFSET, bytes: wallet })
  return [...new Set([...registryMints(wallet), ...onchain])]
}

/** Coins that list `vault` as a shareholder, with its share in bps. */
export async function findCoinsPaying(vault: PublicKey) {
  const hits = await Promise.all(
    Array.from({ length: MAX_SHAREHOLDERS }, (_, i) => configMints({ offset: SHAREHOLDER_OFFSET(i), bytes: vault.toBase58() })),
  )
  return [...new Set(hits.flat())]
}

export function useMyCoins(wallet: string | null) {
  return useSWR(
    wallet ? ['my-coins', wallet] : null,
    async () => loadCoins(await discoverMyCoins(wallet!)),
    { refreshInterval: 45_000 },
  )
}

export function useCoin(mint: string | undefined) {
  return useSWR(mint ? ['coin', mint] : null, async () => (await loadCoins([mint!], { labels: true }))[0], { refreshInterval: 20_000 })
}

/** SOL + USDC held by each shareholder vault (what has already been distributed to it). */
export async function vaultHoldings(addresses: string[]) {
  const keys = addresses.map((a) => new PublicKey(a))
  const atas = keys.map((k) => getAssociatedTokenAddressSync(USDC_MINT, k, true, TOKEN_PROGRAM_ID))
  const [sol, usdc] = await Promise.all([connection.getMultipleAccountsInfo(keys), connection.getMultipleAccountsInfo(atas)])
  return addresses.map((address, i) => ({
    address,
    lamports: sol[i]?.lamports ?? 0,
    usdc: usdc[i] ? toUi(unpackAccount(atas[i], usdc[i]!, TOKEN_PROGRAM_ID).amount, 6) : 0,
  }))
}

export function useVaultHoldings(addresses: string[] | undefined) {
  const key = addresses && addresses.length ? ['vault-holdings', ...addresses] : null
  return useSWR(key, () => vaultHoldings(addresses!), { refreshInterval: 30_000 })
}
