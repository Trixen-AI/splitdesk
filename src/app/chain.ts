import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { OnlinePumpSdk } from '@pump-fun/pump-sdk'
import { CLUSTER, RPC_URL, USDC_MINT } from '@/launch/config'

// One connection and one SDK client for the whole dashboard.
export const connection = new Connection(RPC_URL, 'confirmed')
export const pump = new OnlinePumpSdk(connection)

export const USDC_DECIMALS = 6
export const TOKEN_DECIMALS = 6

export type QuoteKind = 'USDC' | 'SOL'
export const quoteOf = (mint: PublicKey | null | undefined): QuoteKind => (mint && mint.equals(USDC_MINT) ? 'USDC' : 'SOL')
export const quoteDecimals = (q: QuoteKind) => (q === 'USDC' ? USDC_DECIMALS : 9)

/** Base units (bigint-like) to a display number. */
export function toUi(raw: { toString(): string } | number | bigint, decimals: number) {
  return Number(raw.toString()) / 10 ** decimals
}

const usd = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sol = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })

export function fmtQuote(amount: number, q: QuoteKind) {
  return q === 'USDC' ? `$${usd.format(amount)}` : `${sol.format(amount)} SOL`
}
export const fmtSol = (lamports: number) => `${sol.format(lamports / LAMPORTS_PER_SOL)} SOL`
export const fmtCompact = (n: number) => compact.format(n)
export const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`

export const networkLabel = CLUSTER === 'mainnet-beta' ? 'Solana mainnet' : 'Solana devnet'
