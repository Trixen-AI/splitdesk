import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DESK_BASE } from '@/launch/config'
import { normalizeHandle } from '@/launch/desk'
import { fmtQuote, fmtSol } from '../chain'
import { CoinTableSkeleton } from '../components/CoinTable'
import { usePayouts, type PayoutView } from '../data/payouts'
import { Address, Button, Chip, CoinAvatar, Empty, ErrorNote, PageHeader, Panel, Stat } from '../ui'
import { useWallet } from '../useWallet'

function ClaimBox({ view }: { view: PayoutView }) {
  const w = useWallet()
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'sent' | 'error'; message?: string }>({ status: 'idle' })
  const owed = view.holding.usdc > 0 || view.holding.lamports > 0 || view.rows.some((r) => r.pendingShare > 0)

  async function request() {
    setState({ status: 'sending' })
    try {
      const res = await fetch('/api/payout-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handle: view.handle, vault: view.vault, requestedBy: w.address }),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out.error ?? `Desk returned ${res.status}`)
      setState({ status: 'sent', message: `Request ${String(out.id).slice(0, 8)} is with the desk.` })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }

  return (
    <Panel label="Claim on X Money">
      <div className="flex flex-col gap-[14px]">
        <p className="text-[15px] leading-[22px] text-muted">
          The desk pays @{view.handle} from its vault in US dollars through X Money. Before paying, it asks the account holder to sign in with X, so only the
          owner of @{view.handle} can receive it.
        </p>
        <Button onClick={request} disabled={!owed || state.status === 'sending' || state.status === 'sent'}>
          {state.status === 'sending' ? 'Sending request...' : state.status === 'sent' ? 'Requested' : `Request payout for @${view.handle}`}
        </Button>
        {!owed ? <div className="text-[14px] text-muted">Nothing to pay out yet. Fees arrive after trades and a distribution.</div> : null}
        {state.status === 'sent' ? <div className="text-[14px] text-money">{state.message}</div> : null}
        {state.status === 'error' && state.message ? <ErrorNote error={state.message} /> : null}
      </div>
    </Panel>
  )
}

function Result({ handle, authority }: { handle: string; authority: string }) {
  const { data, error, isValidating } = usePayouts(handle, authority)
  if (error) return <ErrorNote error={error} />
  if (!data) return <CoinTableSkeleton rows={3} />

  const pendingUsdc = data.rows.filter((r) => r.coin.quote === 'USDC').reduce((a, r) => a + r.pendingShare, 0)
  const pendingSol = data.rows.filter((r) => r.coin.quote === 'SOL').reduce((a, r) => a + r.pendingShare, 0)

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex flex-wrap items-center gap-[12px]">
        <span className="text-[24px] font-[500]">@{data.handle}</span>
        <span className="text-[14px] text-muted">payout vault</span>
        <Address value={data.vault} />
        {isValidating ? <span className="font-JetBrainsMono text-[12px] text-primary/40">REFRESHING...</span> : null}
      </div>
      <div className="grid grid-cols-4 gap-[16px] max-xl:grid-cols-2 max-sm:grid-cols-1">
        <Stat label="Ready in vault (USDC)" value={fmtQuote(data.holding.usdc, 'USDC')} sub="distributed, waiting for payout" />
        <Stat label="Ready in vault (SOL)" value={fmtSol(data.holding.lamports)} sub="includes the vault's rent" />
        <Stat label="Still in coins (USDC)" value={fmtQuote(pendingUsdc, 'USDC')} sub="share of undistributed fees" />
        <Stat label="Coins paying" value={data.rows.length} sub={pendingSol > 0 ? `${fmtQuote(pendingSol, 'SOL')} pending on SOL pairs` : 'found on Solana'} />
      </div>
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[24px] max-xl:grid-cols-1">
        <Panel label="Coins that pay this account" tone="white">
          {data.rows.length === 0 ? (
            <Empty title={`No coin pays @${data.handle} yet`} text="When a launch names this handle, the coin shows up here with its share." />
          ) : (
            <ul className="flex flex-col">
              {data.rows.map((r) => (
                <li key={r.coin.mint} className="border-t border-line first:border-t-0">
                  <Link to={`/app/coins/${r.coin.mint}`} className="flex items-center justify-between gap-[16px] py-[14px] hover:bg-card/50">
                    <span className="flex min-w-0 items-center gap-[12px]">
                      <CoinAvatar image={r.coin.image} symbol={r.coin.symbol} />
                      <span className="min-w-0">
                        <span className="block truncate text-[16px] font-[500]">{r.coin.name}</span>
                        <span className="block font-JetBrainsMono text-[12px] text-primary/50">
                          ${r.coin.symbol} · {(r.bps / 100).toFixed(2)}% share
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-[10px]">
                      {r.coin.config.locked ? <Chip tone="ok">Locked</Chip> : <Chip>Editable</Chip>}
                      <span className="text-[15px] font-[500]">{fmtQuote(r.pendingShare, r.coin.quote)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <ClaimBox view={data} />
      </div>
    </div>
  )
}

export default function Payouts() {
  const [params, setParams] = useSearchParams()
  const handle = params.get('handle') ?? ''
  const [draft, setDraft] = useState(handle)
  const w = useWallet()
  const authority = (DESK_BASE ?? w.publicKey)?.toBase58() ?? null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const h = normalizeHandle(draft)
    setParams(h ? { handle: h } : {})
  }

  return (
    <>
      <PageHeader
        label="PAYOUTS"
        title="What an X account is owed"
        text="Look up any handle: its payout vault, the coins that name it and its share of their fees."
      />
      <form onSubmit={submit} className="mb-[32px] flex max-w-[620px] gap-[10px] max-sm:flex-col">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[18px] text-primary/40">@</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="handle"
            aria-label="X handle"
            className="h-[52px] w-full rounded-[8px] border border-line bg-white pl-[36px] pr-[16px] text-[18px] outline-none focus:border-primary"
          />
        </div>
        <Button type="submit" className="h-[52px]">
          Look up
        </Button>
      </form>
      {!authority ? (
        <Empty
          title="Connect a wallet to look up payouts"
          text="Payout vaults are derived from the wallet that launched the coins. Connect it to see what each X account is owed."
          action={
            <Button onClick={w.connect} disabled={!w.configured} className="mt-[4px]">
              {w.connecting ? 'Connecting...' : 'Connect wallet'}
            </Button>
          }
        />
      ) : handle ? (
        <Result handle={handle} authority={authority} />
      ) : (
        <Empty title="Enter an X handle" text="Every handle named in a launch has its own vault on Solana. The desk pays it out in US dollars through X Money." />
      )}
    </>
  )
}
