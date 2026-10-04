import useSWR from 'swr'
import { PublicKey } from '@solana/web3.js'
import { deskVaultFor, HANDLE_RE, normalizeHandle } from '@/launch/desk'
import { findCoinsPaying, loadCoins, vaultHoldings, type CoinSummary } from './coins'

export type PayoutRow = { coin: CoinSummary; bps: number; pendingShare: number }
export type PayoutView = {
  handle: string
  vault: string
  holding: { lamports: number; usdc: number }
  rows: PayoutRow[]
}

/** Everything one X account is owed: its vault balance plus its share of each coin's undistributed fees. */
export async function loadPayouts(rawHandle: string, authority: string): Promise<PayoutView> {
  const handle = normalizeHandle(rawHandle)
  if (!HANDLE_RE.test(handle)) throw new Error(`"${rawHandle}" is not a valid X handle.`)
  const vault = await deskVaultFor(new PublicKey(authority), handle)
  const [mints, holdings] = await Promise.all([findCoinsPaying(vault), vaultHoldings([vault.toBase58()])])
  const coins = await loadCoins(mints)
  const v = vault.toBase58()
  return {
    handle,
    vault: v,
    holding: holdings[0],
    rows: coins.map((coin) => {
      const bps = coin.config.shareholders.find((s) => s.address === v)?.bps ?? 0
      return { coin, bps, pendingShare: (coin.fees.pending * bps) / 10_000 }
    }),
  }
}

/** `authority`: the desk key, or the wallet the coins were launched from. */
export function usePayouts(handle: string, authority: string | null) {
  return useSWR(handle && authority ? ['payouts', normalizeHandle(handle), authority] : null, () => loadPayouts(handle, authority!), {
    refreshInterval: 45_000,
    shouldRetryOnError: false,
  })
}
