import useSWRInfinite from 'swr/infinite'
import bs58 from 'bs58'
import type { ParsedInstruction, PartiallyDecodedInstruction, PublicKey } from '@solana/web3.js'
import { PUMP_AMM_PROGRAM_ID, PUMP_FEE_PROGRAM_ID, PUMP_PROGRAM_ID, getPumpAmmProgram, getPumpFeeProgram, getPumpProgram } from '@pump-fun/pump-sdk'
import { connection } from '../chain'

export type Action = { program: 'pump.fun' | 'Pump Fees' | 'PumpSwap'; name: string; label: string; mint: string | null }
export type ActivityItem = { signature: string; time: number | null; failed: boolean; actions: Action[] }

const LABELS: Record<string, string> = {
  create: 'Coin created',
  createV2: 'Coin created',
  buy: 'Bought',
  buyV2: 'Bought',
  buyExactSolIn: 'Bought',
  sell: 'Sold',
  sellV2: 'Sold',
  createFeeSharingConfig: 'Fee sharing opened',
  updateFeeShares: 'Shares locked',
  updateFeeSharesV2: 'Shares locked',
  distributeCreatorFees: 'Fees distributed',
  distributeCreatorFeesV2: 'Fees distributed',
  collectCreatorFee: 'Creator fees collected',
  collectCoinCreatorFee: 'Creator fees collected',
  transferCreatorFeesToPump: 'Fees moved from PumpSwap',
  transferCreatorFeesToPumpV2: 'Fees moved from PumpSwap',
  migrate: 'Graduated to PumpSwap',
}
const humanize = (n: string) => n.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

type Decoder = Map<string, { name: string; mintIndex: number }>
let decoders: Map<string, { program: Action['program']; byDisc: Decoder }> | null = null

// Instruction names and the position of the mint account, straight from the pump.fun IDLs.
function getDecoders() {
  if (decoders) return decoders
  const build = (idl: { instructions: { name: string; discriminator: number[]; accounts: { name: string }[] }[] }) => {
    const m: Decoder = new Map()
    for (const ix of idl.instructions) {
      m.set(bs58.encode(Uint8Array.from(ix.discriminator)), {
        name: ix.name,
        mintIndex: ix.accounts.findIndex((a) => a.name === 'mint' || a.name === 'baseMint'),
      })
    }
    return m
  }
  type IdlLike = Parameters<typeof build>[0]
  decoders = new Map([
    [PUMP_PROGRAM_ID.toBase58(), { program: 'pump.fun' as const, byDisc: build(getPumpProgram(connection).idl as unknown as IdlLike) }],
    [PUMP_FEE_PROGRAM_ID.toBase58(), { program: 'Pump Fees' as const, byDisc: build(getPumpFeeProgram(connection).idl as unknown as IdlLike) }],
    [PUMP_AMM_PROGRAM_ID.toBase58(), { program: 'PumpSwap' as const, byDisc: build(getPumpAmmProgram(connection).idl as unknown as IdlLike) }],
  ])
  return decoders
}

function decode(ix: ParsedInstruction | PartiallyDecodedInstruction): Action | null {
  if (!('data' in ix)) return null
  const d = getDecoders().get(ix.programId.toBase58())
  if (!d) return null
  const bytes = bs58.decode(ix.data)
  if (bytes.length < 8) return null
  const hit = d.byDisc.get(bs58.encode(bytes.slice(0, 8)))
  if (!hit) return null
  return {
    program: d.program,
    name: hit.name,
    label: LABELS[hit.name] ?? humanize(hit.name),
    mint: hit.mintIndex >= 0 ? (ix.accounts[hit.mintIndex]?.toBase58() ?? null) : null,
  }
}

const PAGE = 25

/** One page of the wallet's history, keeping only transactions that touch pump.fun programs. */
async function fetchPage(owner: PublicKey, before?: string) {
  const sigs = await connection.getSignaturesForAddress(owner, { limit: PAGE, before })
  if (sigs.length === 0) return { items: [] as ActivityItem[], cursor: null as string | null }
  const txs = await connection.getParsedTransactions(
    sigs.map((s) => s.signature),
    { maxSupportedTransactionVersion: 0 },
  )
  const items: ActivityItem[] = []
  txs.forEach((tx, i) => {
    if (!tx) return
    const all = [...tx.transaction.message.instructions, ...(tx.meta?.innerInstructions ?? []).flatMap((x) => x.instructions)]
    const actions = all.map(decode).filter((a): a is Action => a !== null)
    // keep the meaningful step once per transaction (a launch also emits its inner buys/creates)
    const seen = new Set<string>()
    const unique = actions.filter((a) => (seen.has(a.label) ? false : (seen.add(a.label), true)))
    if (unique.length) items.push({ signature: sigs[i].signature, time: sigs[i].blockTime ?? null, failed: !!sigs[i].err, actions: unique })
  })
  return { items, cursor: sigs.length === PAGE ? sigs[sigs.length - 1].signature : null }
}

export function useActivity(owner: PublicKey | null) {
  return useSWRInfinite(
    (index, prev: Awaited<ReturnType<typeof fetchPage>> | null) => {
      if (!owner) return null
      if (index > 0 && !prev?.cursor) return null
      return ['activity', owner.toBase58(), index === 0 ? '' : prev!.cursor!]
    },
    ([, , cursor]) => fetchPage(owner!, cursor || undefined),
    { revalidateFirstPage: true, refreshInterval: 60_000 },
  )
}
