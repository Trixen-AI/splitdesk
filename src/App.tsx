import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Legal from '@/pages/Legal'
import { NotePage, NotesIndex } from '@/pages/Notes'

// The app pulls in AppKit, the Solana and pump.fun SDKs, so it loads only on /app.
const DashboardApp = lazy(() => import('@/app/DashboardApp'))

function Website() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesIndex />} />
        <Route path="/notes/:slug" element={<NotePage />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/launch" element={<Navigate to="/app/launch" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/app/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <DashboardApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Website />} />
    </Routes>
  )
}
