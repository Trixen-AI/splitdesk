import { Link } from 'react-router-dom'
import { explorerTx } from '@/launch/config'
import { short } from '../chain'
import type { ActivityItem } from '../data/activity'
import { Chip, Empty } from '../ui'

const timeFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <Empty title="Nothing on pump.fun yet" text="Launches, trades, share locks and fee distributions signed by this wallet show up here." />
  }
  return (
    <ul className="flex flex-col">
      {items.map((it) => {
        const mint = it.actions.find((a) => a.mint)?.mint ?? null
        return (
          <li key={it.signature} className="flex items-center justify-between gap-[16px] border-t border-line py-[14px] first:border-t-0 max-md:flex-col max-md:items-start">
            <div className="flex min-w-0 flex-wrap items-center gap-[8px]">
              {it.actions.map((a) => (
                <Chip key={a.label} tone={a.label === 'Coin created' || a.label === 'Shares locked' ? 'dark' : 'line'}>
                  {a.label}
                </Chip>
              ))}
              {it.failed ? <Chip tone="warn">Failed</Chip> : null}
              {mint ? (
                <Link to={`/app/coins/${mint}`} className="font-JetBrainsMono text-[13px] text-primary/60 underline decoration-primary/20">
                  {short(mint)}
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-[14px] text-[14px] text-primary/50">
              <span>{it.time ? timeFmt.format(new Date(it.time * 1000)) : 'pending'}</span>
              <a href={explorerTx(it.signature)} target="_blank" rel="noopener noreferrer" className="font-JetBrainsMono text-[13px] underline decoration-primary/20">
                {short(it.signature, 6)}
              </a>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
