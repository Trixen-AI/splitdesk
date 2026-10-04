import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fmtQuote, fmtSol } from '../chain'
import { CoinTable, CoinTableSkeleton } from '../components/CoinTable'
import { ActivityList } from '../components/ActivityList'
import { useActivity } from '../data/activity'
import { useBalances } from '../data/balances'
import { useMyCoins, type CoinSummary } from '../data/coins'
import { Address, Button, ButtonLink, ConnectGate, Empty, ErrorNote, PageHeader, Panel, Skeleton, Stat } from '../ui'
import { useWallet } from '../useWallet'

function totals(coins: CoinSummary[]) {
  let usdc = 0
  let sol = 0
  const accounts = new Set<string>()
  let locked = 0
  let graduated = 0
  for (const c of coins) {
    if (c.quote === 'USDC') usdc += c.fees.pending
    else sol += c.fees.pending
    for (const s of c.config.shareholders) accounts.add(s.address)
    if (c.config.locked) locked++
    if (c.curve.complete) graduated++
  }
  return { usdc, sol, accounts: accounts.size, locked, graduated }
}

function HandleLookup() {
  const [handle, setHandle] = useState('')
  const navigate = useNavigate()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (handle.trim()) navigate(`/app/payouts?handle=${encodeURIComponent(handle.trim().replace(/^@/, ''))}`)
  }
  return (
    <form onSubmit={submit} className="flex gap-[10px] max-sm:flex-col">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-primary/40">@</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="handle"
          aria-label="X handle"
          className="h-[48px] w-full rounded-[8px] border border-line bg-white pl-[32px] pr-[14px] text-[16px] outline-none focus:border-primary"
        />
      </div>
      <Button type="submit" variant="ghost">
        Check payouts
      </Button>
    </form>
  )
}

function Dashboard() {
  const { publicKey, address } = useWallet()
  const balances = useBalances(publicKey)
  const coins = useMyCoins(address)
  const activity = useActivity(publicKey)
  const t = coins.data ? totals(coins.data) : null
  const recent = (activity.data?.[0]?.items ?? []).slice(0, 6)

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[24px] max-xl:grid-cols-1">
        <Panel label="Wallet" action={address ? <Address value={address} /> : null}>
          {balances.data ? (
            <div className="flex flex-col gap-[16px]">
              <div>
                <div className="text-[34px] leading-[40px] font-[500]">{fmtSol(balances.data.lamports)}</div>
                <div className="mt-[4px] text-[15px] text-muted">for network fees and launches</div>
              </div>
              <div className="border-t border-line pt-[14px]">
                <div className="text-[22px] font-[500]">{fmtQuote(balances.data.usdc, 'USDC')}</div>
                <div className="text-[14px] text-muted">USDC in this wallet</div>
              </div>
            </div>
          ) : balances.error ? (
            <ErrorNote error={balances.error} />
          ) : (
            <div className="flex flex-col gap-[12px]">
              <Skeleton className="h-[40px] w-[200px]" />
              <Skeleton className="h-[24px] w-[140px]" />
            </div>
          )}
        </Panel>
        <div className="grid grid-cols-2 gap-[16px] max-sm:grid-cols-1">
          <Stat label="Coins with a split" value={t ? coins.data!.length : '...'} sub={t ? `${t.locked} locked, ${t.graduated} graduated` : 'reading Solana'} />
          <Stat label="Pending fees (USDC)" value={t ? fmtQuote(t.usdc, 'USDC') : '...'} sub="not yet distributed" />
          <Stat label="Pending fees (SOL)" value={t ? fmtQuote(t.sol, 'SOL') : '...'} sub="SOL-paired coins" />
          <Stat label="X accounts paid" value={t ? t.accounts : '...'} sub="unique payout vaults" />
        </div>
      </div>

      <Panel label="Your coins" action={<Link to="/app/coins" className="text-[15px] text-primary hover:underline">All coins {'>'}</Link>} tone="white">
        {coins.error ? (
          <ErrorNote error={coins.error} />
        ) : !coins.data ? (
          <CoinTableSkeleton />
        ) : coins.data.length === 0 ? (
          <Empty
            title="No coins yet"
            text="Coins appear here once this wallet launches one with a split. They are read from the pump.fun fee program on Solana."
            action={<ButtonLink to="/app/launch">Create a coin</ButtonLink>}
          />
        ) : (
          <CoinTable coins={coins.data.slice(0, 5)} />
        )}
      </Panel>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[24px] max-xl:grid-cols-1">
        <Panel label="Recent activity" action={<Link to="/app/activity" className="text-[15px] text-primary hover:underline">All activity {'>'}</Link>} tone="white">
          {activity.error ? <ErrorNote error={activity.error} /> : !activity.data ? <CoinTableSkeleton rows={3} /> : <ActivityList items={recent} />}
        </Panel>
        <Panel label="Quick actions">
          <div className="flex flex-col gap-[18px]">
            <ButtonLink to="/app/launch">Create a coin</ButtonLink>
            <div>
              <div className="mb-[10px] text-[15px] text-muted">See what an X account is owed</div>
              <HandleLookup />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export default function Overview() {
  return (
    <>
      <PageHeader label="OVERVIEW" title="Your desk" text="Coins you launched, the fees they hold for each X account, and what your wallet did on pump.fun." />
      <ConnectGate title="Connect a wallet to open your desk" text="Your coins, pending creator fees and activity are read live from Solana for the wallet you connect.">
        <Dashboard />
      </ConnectGate>
    </>
  )
}
