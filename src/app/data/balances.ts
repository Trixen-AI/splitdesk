import useSWR from 'swr'
import type { PublicKey } from '@solana/web3.js'
import { USDC_MINT } from '@/launch/config'
import { connection, toUi, USDC_DECIMALS } from '../chain'

export type Balances = { lamports: number; usdc: number }

/** SOL and USDC held by any address (all USDC token accounts, not only the ATA). */
export async function fetchBalances(owner: PublicKey): Promise<Balances> {
  const [lamports, tokens] = await Promise.all([
    connection.getBalance(owner),
    connection.getParsedTokenAccountsByOwner(owner, { mint: USDC_MINT }),
  ])
  let raw = 0n
  for (const t of tokens.value) raw += BigInt(t.account.data.parsed.info.tokenAmount.amount as string)
  return { lamports, usdc: toUi(raw, USDC_DECIMALS) }
}

export function useBalances(owner: PublicKey | null) {
  return useSWR(owner ? ['balances', owner.toBase58()] : null, () => fetchBalances(owner!), { refreshInterval: 30_000 })
}
