import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { ComputeBudgetProgram, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { CLUSTER, explorerAccount, explorerTx, pumpCoinUrl, USDC_MINT } from '@/launch/config'
import { sendAndConfirm } from '@/launch/buildLaunch'
import { connection, fmtCompact, fmtQuote, fmtSol, pump, short } from '../chain'
import { useCoin, useVaultHoldings, type CoinSummary } from '../data/coins'
import { Address, Button, Chip, CoinAvatar, Empty, ErrorNote, Panel, Progress, Skeleton, Stat } from '../ui'
import { useWallet } from '../useWallet'

function validMint(m: string | undefined) {
  try {
    return m ? new PublicKey(m) : null
  } catch {
    return null
  }
}

function Distribute({ coin, onDone }: { coin: CoinSummary; onDone: () => void }) {
  const w = useWallet()
  const mint = new PublicKey(coin.mint)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sig, setSig] = useState<string | null>(null)

  // The on-chain minimum only covers the lamport vault, so it gates SOL coins only.
  const min = useSWR(
    w.publicKey && coin.quote === 'SOL' && coin.config.exists ? ['min-distributable', coin.mint, w.address] : null,
    () => pump.getMinimumDistributableFee(mint, w.publicKey!),
    { refreshInterval: 30_000 },
  )
  const canDistribute = coin.config.exists && coin.fees.pending > 0 && (coin.quote === 'USDC' || (min.data?.canDistribute ?? false))

  async function run() {
    if (!w.publicKey || !w.provider) return
    setBusy(true)
    setError(null)
    setSig(null)
    try {
      const { instructions } = await pump.buildDistributeCreatorFeesInstructions(mint, {
        quoteMint: coin.quote === 'USDC' ? USDC_MINT : undefined,
        payer: w.publicKey,
      })
      const { blockhash } = await connection.getLatestBlockhash('confirmed')
      const tx = new VersionedTransaction(
        new TransactionMessage({
          payerKey: w.publicKey,
          recentBlockhash: blockhash,
          instructions: [ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }), ...instructions],
        }).compileToV0Message(),
      )
      const signed = await w.provider.signTransaction(tx)
      setSig(await sendAndConfirm(connection, signed))
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {coin.quote === 'SOL' && min.data ? (
        <div className="text-[14px] text-muted">
          Minimum to distribute: {fmtSol(Number(min.data.minimumRequired.toString()))}
        </div>
      ) : null}
      {w.connected ? (
        <Button onClick={run} disabled={busy || !canDistribute}>
          {busy ? 'Distributing...' : 'Distribute fees now'}
        </Button>
      ) : (
        <Button onClick={w.connect} variant="ghost" disabled={!w.configured}>
          Connect a wallet to distribute
        </Button>
      )}
      <p className="text-[14px] leading-[20px] text-muted">
        Anyone can trigger a distribution. It pays the vault out to every shareholder by their basis points; the wallet only covers the network fee.
      </p>
      {sig ? (
        <a href={explorerTx(sig)} target="_blank" rel="noopener noreferrer" className="font-JetBrainsMono text-[13px] text-money underline">
          Distributed: {short(sig, 6)}
        </a>
      ) : null}
      {error ? <ErrorNote error={error} /> : null}
    </div>
  )
}

function SplitTable({ coin }: { coin: CoinSummary }) {
  const holdings = useVaultHoldings(coin.config.shareholders.map((s) => s.address))
  const byAddress = new Map((holdings.data ?? []).map((h) => [h.address, h]))
  if (!coin.config.exists) {
    return <Empty title="This coin has no fee split" text="Its creator fees go to a single wallet. Coins launched from Splitdesk open fee sharing in the launch transaction." />
  }
  return (
    <div className="overflow-hidden rounded-[8px] border border-line">
      <div className="grid grid-cols-[minmax(0,1.6fr)_90px_minmax(0,1fr)_minmax(0,1fr)] gap-[16px] bg-card px-[20px] py-[12px] font-JetBrainsMono text-[12px] text-primary/50 max-lg:hidden">
        <span>ACCOUNT</span>
        <span>SHARE</span>
        <span>PENDING SHARE</span>
        <span>IN VAULT</span>
      </div>
      {coin.config.shareholders.map((s) => {
        const h = byAddress.get(s.address)
        return (
          <div key={s.address} className="grid grid-cols-[minmax(0,1.6fr)_90px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-[16px] border-t border-line px-[20px] py-[14px] first:border-t-0 max-lg:grid-cols-[minmax(0,1fr)_auto]">
            <span className="flex min-w-0 flex-col gap-[4px]">
              {s.handle ? (
                <span className="flex items-center gap-[8px]">
                  <Link to={`/app/payouts?handle=${s.handle}`} className="text-[16px] font-[500] hover:underline">
                    @{s.handle}
                  </Link>
                  {s.verified ? <Chip tone="ok">Verified</Chip> : null}
                </span>
              ) : (
                <span className="text-[15px] text-muted">Unlabelled address</span>
              )}
              <Address value={s.address} />
            </span>
            <span className="font-JetBrainsMono text-[15px]">{(s.bps / 100).toFixed(2)}%</span>
            <span className="text-[15px] max-lg:hidden">{fmtQuote((coin.fees.pending * s.bps) / 10_000, coin.quote)}</span>
            <span className="text-[15px] max-lg:hidden">
              {h ? (coin.quote === 'USDC' ? fmtQuote(h.usdc, 'USDC') : fmtSol(h.lamports)) : <Skeleton className="h-[18px] w-[80px]" />}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function CoinDetail() {
  const { mint } = useParams()
  const key = validMint(mint)
  const coin = useCoin(key ? key.toBase58() : undefined)

  if (!key) return <ErrorNote error={`"${mint}" is not a valid mint address.`} />
  if (coin.error) return <ErrorNote error={coin.error} />
  if (!coin.data) {
    return (
      <div className="flex flex-col gap-[20px]">
        <Skeleton className="h-[64px] w-[420px] max-w-full" />
        <div className="grid grid-cols-3 gap-[16px] max-lg:grid-cols-1">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[240px]" />
      </div>
    )
  }

  const c = coin.data
  return (
    <div className="flex flex-col gap-[24px]">
      <Link to="/app/coins" className="font-JetBrainsMono text-[13px] text-primary/60 hover:text-primary">
        {'< '}MY COINS
      </Link>
      <div className="flex items-center justify-between gap-[24px] max-md:flex-col max-md:items-start">
        <div className="flex min-w-0 items-center gap-[18px]">
          <CoinAvatar image={c.image} symbol={c.symbol} size={72} />
          <div className="min-w-0">
            <h1 className="truncate text-[36px] leading-[44px] font-[500] max-lg:text-[26px] max-lg:leading-[32px]">{c.name}</h1>
            <div className="mt-[6px] flex flex-wrap items-center gap-[10px]">
              <span className="font-JetBrainsMono text-[15px] text-primary/60">${c.symbol}</span>
              <Chip>{c.quote} pair</Chip>
              {c.config.locked ? <Chip tone="ok">Split locked</Chip> : c.config.exists ? <Chip>Split editable</Chip> : <Chip tone="warn">No split</Chip>}
              <Address value={c.mint} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-[10px]">
          <a
            href={pumpCoinUrl(c.mint)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[44px] items-center rounded-[8px] border border-primary/10 px-[16px] text-[15px] hover:bg-card"
          >
            {CLUSTER === 'mainnet-beta' ? 'pump.fun' : 'Solscan'}
          </a>
          {c.uri ? (
            <a href={c.uri} target="_blank" rel="noopener noreferrer" className="inline-flex h-[44px] items-center rounded-[8px] border border-primary/10 px-[16px] text-[15px] hover:bg-card">
              Metadata
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[16px] max-lg:grid-cols-1">
        <Stat label="Pending creator fees" value={fmtQuote(c.fees.pending, c.quote)} sub={`curve ${fmtQuote(c.fees.bondingCurve, c.quote)}, PumpSwap ${fmtQuote(c.fees.amm, c.quote)}`} />
        <Stat
          label="Market cap"
          value={c.quote === 'USDC' ? `$${fmtCompact(c.curve.marketCap)}` : `${fmtCompact(c.curve.marketCap)} SOL`}
          sub={c.curve.complete ? 'graduated to PumpSwap' : 'on the bonding curve'}
        />
        <Stat label="Bonding curve" value={c.curve.complete ? 'Graduated' : `${(c.curve.progress * 100).toFixed(1)}%`} sub={c.curve.complete ? null : <Progress value={c.curve.progress} />} />
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[24px] max-xl:grid-cols-1">
        <Panel label="The split" tone="white" action={<span className="text-[14px] text-muted">{c.config.shareholders.length} accounts</span>}>
          <SplitTable coin={c} />
        </Panel>
        <div className="flex flex-col gap-[24px]">
          <Panel label="Distribute">
            <Distribute coin={c} onDone={() => void coin.mutate()} />
          </Panel>
          <Panel label="Fee sharing config">
            <dl className="flex flex-col gap-[10px] text-[15px]">
              <div className="flex justify-between gap-[12px]">
                <dt className="text-primary/50">Status</dt>
                <dd>{c.config.exists ? (c.config.active ? 'Active' : 'Paused') : 'None'}</dd>
              </div>
              <div className="flex justify-between gap-[12px]">
                <dt className="text-primary/50">Admin</dt>
                <dd>{c.config.locked ? 'Revoked' : c.config.admin ? <Address value={c.config.admin} /> : '-'}</dd>
              </div>
              <div className="flex justify-between gap-[12px]">
                <dt className="text-primary/50">Creator vault</dt>
                <dd>{c.creatorVault ? <Address value={c.creatorVault} href={explorerAccount(c.creatorVault)} /> : '-'}</dd>
              </div>
              <div className="flex justify-between gap-[12px]">
                <dt className="text-primary/50">Shares total</dt>
                <dd className="font-JetBrainsMono">{(c.config.shareholders.reduce((a, s) => a + s.bps, 0) / 100).toFixed(2)}%</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
      <p className="text-[13px] text-primary/40">Updated live from Solana every 20 seconds. Amounts are in {c.quote}. A pending share is an estimate until the next distribution.</p>
    </div>
  )
}
