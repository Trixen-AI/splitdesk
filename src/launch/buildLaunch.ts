import { NATIVE_MINT, TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  type Connection,
} from '@solana/web3.js'
import { PUMP_SDK } from '@pump-fun/pump-sdk'
import { USDC_MINT } from './config'
import { encodeSplitRecord, MEMO_PROGRAM_ID, splitRecordAddress } from './desk'

export type Quote = 'usdc' | 'sol'
export type PlannedShare = { handle: string; bps: number; vault: PublicKey }

export type LaunchPlan = {
  mint: Keypair
  steps: { label: string; tx: VersionedTransaction }[]
}

const PACKET_LIMIT = 1232
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))

/**
 * Builds the three-part launch, exactly as the pump.fun docs describe it:
 *  1. create_v2 (+ create_fee_sharing_config when both fit in one transaction)
 *  2. make every payout vault able to receive (rent for SOL, USDC token accounts for USDC)
 *  3. update_fee_shares_v2 with one share per X account vault, which locks the list
 *  4. a memo recording which X handle owns which share, at an address derived from the mint
 */
export async function buildLaunch(o: {
  connection: Connection
  creator: PublicKey
  name: string
  symbol: string
  uri: string
  quote: Quote
  shares: PlannedShare[]
  /** who controls the payout vaults (the desk key, or the creator) */
  authority: PublicKey
}): Promise<LaunchPlan> {
  const { connection, creator, quote, shares } = o
  const mint = Keypair.generate()
  const quoteMint = quote === 'usdc' ? USDC_MINT : undefined

  const createIx = await PUMP_SDK.createV2Instruction({
    mint: mint.publicKey,
    name: o.name,
    symbol: o.symbol,
    uri: o.uri,
    creator,
    user: creator,
    mayhemMode: false,
    quoteMint,
    quoteTokenProgram: quoteMint ? TOKEN_PROGRAM_ID : undefined,
  })
  const configIx = await PUMP_SDK.createFeeSharingConfig({ creator, mint: mint.publicKey, pool: null })

  // Vault readiness
  const fundIxs: TransactionInstruction[] = []
  if (quoteMint) {
    for (const owner of [creator, ...shares.map((s) => s.vault)]) {
      const ata = getAssociatedTokenAddressSync(quoteMint, owner, true, TOKEN_PROGRAM_ID)
      fundIxs.push(createAssociatedTokenAccountIdempotentInstruction(creator, ata, owner, quoteMint, TOKEN_PROGRAM_ID))
    }
  } else {
    const rent = await connection.getMinimumBalanceForRentExemption(0)
    const infos = await connection.getMultipleAccountsInfo(shares.map((s) => s.vault))
    shares.forEach((s, i) => {
      const have = infos[i]?.lamports ?? 0
      if (have < rent) fundIxs.push(SystemProgram.transfer({ fromPubkey: creator, toPubkey: s.vault, lamports: rent - have }))
    })
  }

  const lockIx = await PUMP_SDK.updateFeeSharesV2({
    authority: creator,
    mint: mint.publicKey,
    currentShareholders: [creator],
    newShareholders: shares.map((s) => ({ address: s.vault, shareBps: s.bps })),
    quoteMint: quoteMint ?? NATIVE_MINT,
    quoteTokenProgram: TOKEN_PROGRAM_ID,
  })

  // 0-lamport touch of the record address makes the memo findable by mint (simulated: valid, ~115k CU)
  const recordIxs = [
    SystemProgram.transfer({ fromPubkey: creator, toPubkey: await splitRecordAddress(mint.publicKey), lamports: 0 }),
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(encodeSplitRecord({ authority: o.authority.toBase58(), shares: shares.map((s) => ({ handle: s.handle, bps: s.bps })) }), 'utf8'),
    }),
  ]

  const { blockhash } = await connection.getLatestBlockhash('confirmed')
  const toTx = (ixs: TransactionInstruction[], cu: number) =>
    new VersionedTransaction(
      new TransactionMessage({
        payerKey: creator,
        recentBlockhash: blockhash,
        instructions: [ComputeBudgetProgram.setComputeUnitLimit({ units: cu }), ...ixs],
      }).compileToV0Message(),
    )

  // create_v2 and the sharing config travel together when they fit in one packet (1232 bytes).
  // A long name + ticker on a USDC pair can overflow it; the config then leads the next transaction.
  const createCu = quoteMint ? 450_000 : 300_000
  let createTx = toTx([createIx, configIx], createCu)
  const together = createTx.serialize().length <= PACKET_LIMIT
  if (!together) {
    createTx = toTx([createIx], createCu)
    fundIxs.unshift(configIx)
  }
  createTx.sign([mint])

  return {
    mint,
    steps: [
      { label: 'Create the coin on pump.fun', tx: createTx },
      ...chunk(fundIxs, quoteMint ? 4 : 10).map((ixs, i, all) => ({
        label: all.length > 1 ? `Open payout vaults (${i + 1}/${all.length})` : 'Open payout vaults',
        tx: toTx(ixs, 200_000),
      })),
      { label: 'Lock the shares', tx: toTx([lockIx], 250_000) },
      { label: 'Record the split', tx: toTx(recordIxs, 200_000) },
    ],
  }
}

export async function sendAndConfirm(connection: Connection, tx: VersionedTransaction) {
  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 3 })
  const bh = await connection.getLatestBlockhash('confirmed')
  const res = await connection.confirmTransaction({ signature: sig, ...bh }, 'confirmed')
  if (res.value.err) throw new Error(`Transaction ${sig} failed: ${JSON.stringify(res.value.err)}`)
  return sig
}
