import { ActivityList } from '../components/ActivityList'
import { CoinTableSkeleton } from '../components/CoinTable'
import { useActivity } from '../data/activity'
import { Button, ConnectGate, ErrorNote, PageHeader, Panel } from '../ui'
import { useWallet } from '../useWallet'

function Feed() {
  const { publicKey } = useWallet()
  const { data, error, size, setSize, isValidating } = useActivity(publicKey)
  if (error) return <ErrorNote error={error} />
  if (!data) return <CoinTableSkeleton rows={5} />
  const items = data.flatMap((p) => p.items)
  const hasMore = Boolean(data[data.length - 1]?.cursor)
  return (
    <Panel tone="white">
      <ActivityList items={items} />
      {hasMore ? (
        <div className="mt-[16px] flex justify-center border-t border-line pt-[16px]">
          <Button variant="ghost" onClick={() => void setSize(size + 1)} disabled={isValidating}>
            {isValidating ? 'Loading...' : 'Load older'}
          </Button>
        </div>
      ) : null}
    </Panel>
  )
}

export default function Activity() {
  return (
    <>
      <PageHeader
        label="ACTIVITY"
        title="What your wallet did on pump.fun"
        text="Transactions signed by this wallet that touch pump.fun, Pump Fees or PumpSwap, decoded from the programs' own instruction layouts."
      />
      <ConnectGate title="Connect a wallet to see its activity" text="History is read from Solana for the connected address.">
        <Feed />
      </ConnectGate>
    </>
  )
}
