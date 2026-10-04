import { Link } from 'react-router-dom'
import { fmtCompact, fmtQuote } from '../chain'
import type { CoinSummary } from '../data/coins'
import { Chip, CoinAvatar, Progress, Skeleton } from '../ui'

export function CoinTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-[64px] w-full" />
      ))}
    </div>
  )
}

function SplitChip({ coin }: { coin: CoinSummary }) {
  if (!coin.config.exists) return <Chip tone="warn">No split</Chip>
  return coin.config.locked ? <Chip tone="ok">Locked</Chip> : <Chip>Editable</Chip>
}

/** My coins as a table on desktop and stacked rows on small screens. */
export function CoinTable({ coins }: { coins: CoinSummary[] }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-line">
      <div className="grid grid-cols-[minmax(0,2.2fr)_90px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_90px_110px] items-center gap-[16px] bg-card px-[20px] py-[12px] font-JetBrainsMono text-[12px] text-primary/50 max-xl:hidden">
        <span>COIN</span>
        <span>PAIR</span>
        <span>BONDING CURVE</span>
        <span>MARKET CAP</span>
        <span>PENDING FEES</span>
        <span>ACCOUNTS</span>
        <span>SPLIT</span>
      </div>
      {coins.map((c) => (
        <Link
          key={c.mint}
          to={`/app/coins/${c.mint}`}
          className="grid grid-cols-[minmax(0,2.2fr)_90px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_90px_110px] items-center gap-[16px] border-t border-line px-[20px] py-[14px] duration-150 first:border-t-0 hover:bg-card/60 max-xl:grid-cols-[minmax(0,1fr)_auto] max-xl:gap-y-[10px]"
        >
          <span className="flex min-w-0 items-center gap-[12px]">
            <CoinAvatar image={c.image} symbol={c.symbol} />
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-[500]">{c.name}</span>
              <span className="block font-JetBrainsMono text-[12px] text-primary/50">${c.symbol}</span>
            </span>
          </span>
          <span className="font-JetBrainsMono text-[13px] max-xl:hidden">{c.quote}</span>
          <span className="flex flex-col gap-[6px] max-xl:hidden">
            {c.curve.complete ? (
              <span className="text-[14px]">Graduated</span>
            ) : (
              <>
                <Progress value={c.curve.progress} />
                <span className="font-JetBrainsMono text-[12px] text-primary/50">{(c.curve.progress * 100).toFixed(1)}%</span>
              </>
            )}
          </span>
          <span className="text-[15px] max-xl:hidden">{c.quote === 'USDC' ? `$${fmtCompact(c.curve.marketCap)}` : `${fmtCompact(c.curve.marketCap)} SOL`}</span>
          <span className="text-[15px] font-[500] max-xl:text-right">{fmtQuote(c.fees.pending, c.quote)}</span>
          <span className="font-JetBrainsMono text-[13px] max-xl:hidden">{c.config.shareholders.length}</span>
          <span className="max-xl:hidden">
            <SplitChip coin={c} />
          </span>
        </Link>
      ))}
    </div>
  )
}
