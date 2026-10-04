import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SWRConfig } from 'swr'
import './appkit'
import { AppShell } from './AppShell'
import { Skeleton } from './ui'
import { WalletProvider } from './wallet'
import Overview from './pages/Overview'

const LaunchPage = lazy(() => import('./pages/LaunchPage'))
const Coins = lazy(() => import('./pages/Coins'))
const CoinDetail = lazy(() => import('./pages/CoinDetail'))
const Payouts = lazy(() => import('./pages/Payouts'))
const Activity = lazy(() => import('./pages/Activity'))

const pageFallback = <Skeleton className="h-[240px] w-full" />

/** The Splitdesk app, mounted at /app/*. */
export default function DashboardApp() {
  return (
    <WalletProvider>
      <SWRConfig value={{ revalidateOnFocus: true, dedupingInterval: 5_000, errorRetryCount: 2 }}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="launch" element={<Suspense fallback={pageFallback}><LaunchPage /></Suspense>} />
            <Route path="coins" element={<Suspense fallback={pageFallback}><Coins /></Suspense>} />
            <Route path="coins/:mint" element={<Suspense fallback={pageFallback}><CoinDetail /></Suspense>} />
            <Route path="payouts" element={<Suspense fallback={pageFallback}><Payouts /></Suspense>} />
            <Route path="activity" element={<Suspense fallback={pageFallback}><Activity /></Suspense>} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Routes>
      </SWRConfig>
    </WalletProvider>
  )
}
