import { clusterApiUrl, PublicKey } from '@solana/web3.js'

export type Cluster = 'devnet' | 'mainnet-beta'

// Mainnet by default; set VITE_SOLANA_CLUSTER=devnet only for testing.
export const CLUSTER: Cluster = import.meta.env.VITE_SOLANA_CLUSTER === 'devnet' ? 'devnet' : 'mainnet-beta'

// RPC order: your own endpoint, else Reown's RPC (keyed by the AppKit project ID), else the public one.
// The public mainnet endpoint refuses browser traffic, so it is only a last resort.
const REOWN_CHAIN = CLUSTER === 'mainnet-beta' ? 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' : 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
const REOWN_ID = import.meta.env.VITE_REOWN_PROJECT_ID
export const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC ||
  (REOWN_ID ? `https://rpc.walletconnect.org/v1/?chainId=${REOWN_CHAIN}&projectId=${REOWN_ID}` : clusterApiUrl(CLUSTER))

// USDC mints that pump.fun accepts as a stable quote (see STABLE_QUOTE_MINTS in @pump-fun/pump-sdk)
export const USDC_MINT = new PublicKey(
  CLUSTER === 'mainnet-beta' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
)

function parseKey(v?: string) {
  try {
    return v ? new PublicKey(v) : null
  } catch {
    return null
  }
}
/** The desk authority. Without it a launch would route fees to vaults nobody can pay out, so launching is blocked. */
export const DESK_BASE = parseKey(import.meta.env.VITE_DESK_BASE_ADDRESS)

export const LIMITS = { name: 32, symbol: 13, description: 500, handles: 10, imageBytes: 4 * 1024 * 1024 }

export const explorerTx = (sig: string) => `https://solscan.io/tx/${sig}${CLUSTER === 'devnet' ? '?cluster=devnet' : ''}`
export const explorerAccount = (a: string) => `https://solscan.io/account/${a}${CLUSTER === 'devnet' ? '?cluster=devnet' : ''}`
export const pumpCoinUrl = (mint: string) => (CLUSTER === 'mainnet-beta' ? `https://pump.fun/coin/${mint}` : explorerAccount(mint))
