import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useIsMobile'
import { initAos, refreshAos } from '@/lib/aos'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout({ children }: { children: ReactNode }) {
  const mobile = useIsMobile()
  const { pathname, hash } = useLocation()

  useEffect(() => {
    initAos()
  }, [mobile])

  // New route: start at the top (or at the #anchor), then re-measure the reveals.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        const offset = mobile ? (80 / 375) * window.innerWidth : 120
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset })
      }
    } else {
      window.scrollTo({ top: 0 })
    }
    const t = window.setTimeout(refreshAos, 50)
    return () => window.clearTimeout(t)
  }, [pathname, hash, mobile])

  return (
    <div>
      <Header />
      <main className={mobile ? 'vw-mt-64' : ''}>{children}</main>
      <Footer />
    </div>
  )
}
