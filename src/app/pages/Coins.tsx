import { CoinTable, CoinTableSkeleton } from '../components/CoinTable'
import { useMyCoins } from '../data/coins'
import { ButtonLink, ConnectGate, Empty, ErrorNote, PageHeader } from '../ui'
import { useWallet } from '../useWallet'

function List() {
  const { address } = useWallet()
  const { data, error, isValidating, mutate } = useMyCoins(address)
  if (error) return <ErrorNote error={error} />
  if (!data) return <CoinTableSkeleton rows={4} />
  if (data.length === 0) {
    return (
      <Empty
        title="No coins with a split for this wallet"
        text="Every coin whose fee sharing this wallet set up on pump.fun is listed here, read from the Pump Fees program. Launch one to get started."
        action={<ButtonLink to="/app/launch">Create a coin</ButtonLink>}
      />
    )
  }
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between text-[14px] text-muted">
        <span>
          {data.length} coin{data.length === 1 ? '' : 's'} found on Solana
        </span>
        <button type="button" onClick={() => void mutate()} className="font-JetBrainsMono text-[12px] text-primary/60 hover:text-primary">
          {isValidating ? 'REFRESHING...' : 'REFRESH'}
        </button>
      </div>
      <CoinTable coins={data} />
    </div>
  )
}

export default function Coins() {
  return (
    <>
      <PageHeader
        label="MY COINS"
        title="Coins you launched"
        text="Live from the chain: bonding curve progress, creator fees waiting in each coin's vault and how the split is set."
        action={<ButtonLink to="/app/launch">Create a coin</ButtonLink>}
      />
      <ConnectGate title="Connect a wallet to see your coins" text="Coins are found by the wallet that opened their fee sharing on pump.fun.">
        <List />
      </ConnectGate>
    </>
  )
}
