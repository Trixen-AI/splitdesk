import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { XLogo } from '@/components/brand/XLogo'
import { SOCIALS } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useSeo } from '@/lib/seo'
import { networkLabel } from './chain'
import { Chip, WalletButton } from './ui'

const APP_NAV = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/launch', label: 'Create coin', end: false },
  { to: '/app/coins', label: 'My coins', end: false },
  { to: '/app/payouts', label: 'Payouts', end: false },
  { to: '/app/activity', label: 'Activity', end: false },
] as const

const pad = (n: number) => String(n).padStart(2, '0')

/** Logo, nav and footer links: the same content in the desktop sidebar and the mobile drawer. */
function SidebarContent({ showLogo = true }: { showLogo?: boolean }) {
  return (
    <>
      {showLogo ? (
        <Link to="/" aria-label="Splitdesk website" className="mb-[40px] block h-[40px] w-[145px] px-[8px]">
          <Logo className="h-full w-full" />
        </Link>
      ) : null}
      <div className="mb-[12px] px-[12px] font-JetBrainsMono text-[13px] text-primary/40">DESK</div>
      <nav className="flex flex-col gap-[4px]" aria-label="Dashboard">
        {APP_NAV.map((n, i) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-[14px] rounded-[8px] px-[12px] py-[11px] text-[16px] duration-150 ${
                isActive ? 'bg-card font-[600] text-primary' : 'text-primary/70 hover:bg-card hover:text-primary'
              }`
            }
          >
            <span className="font-JetBrainsMono text-[12px] text-primary/40">{pad(i + 1)}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-[14px] border-t border-line px-[12px] pt-[20px]">
        <Link to="/" className="text-[15px] text-primary/70 hover:text-primary">
          {'< '}Back to website
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-JetBrainsMono text-[12px] text-primary/40 uppercase">{networkLabel}</span>
          {SOCIALS.map((s) => (
            <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-[28px] w-[28px] items-center justify-center">
              <XLogo className="h-[16px] w-[16px]" color="#000000" />
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[20px] w-[20px]" aria-hidden="true">
      {open ? (
        <path d="M4 4l12 12M16 4 4 16" stroke="#17181A" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="#17181A" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  )
}

function MobileBar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // close on navigation
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <div className="sticky top-0 z-[60] flex items-center justify-between gap-[12px] border-b border-line bg-white px-[16px] py-[12px]">
        <div className="flex min-w-0 items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="app-drawer"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] duration-150 hover:bg-card"
          >
            <MenuIcon open={open} />
          </button>
          <Link to="/" aria-label="Splitdesk website" className="block h-[26px] w-[94px] shrink-0">
            <Logo className="h-full w-full" />
          </Link>
        </div>
        <WalletButton compact />
      </div>

      <div
        className={`fixed inset-0 top-[65px] z-[55] bg-[rgba(0,0,0,0.4)] transition-opacity duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="app-drawer"
        aria-hidden={!open}
        className={`fixed bottom-0 left-0 top-[65px] z-[58] flex w-[280px] max-w-[85vw] flex-col bg-white px-[16px] py-[24px] shadow-[0_24px_60px_rgba(16,24,40,0.12)] transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent showLogo={false} />
      </aside>
    </>
  )
}

export function AppShell() {
  const mobile = useIsMobile()
  const { pathname } = useLocation()
  useSeo({ title: 'App', description: 'Create a pump.fun coin with its creator fees split across X accounts.', path: pathname, noindex: true })
  if (mobile) {
    return (
      <div className="min-h-screen bg-white">
        <MobileBar />
        <main className="px-[20px] py-[28px]">
          <Outlet />
        </main>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 z-[50] flex w-[264px] flex-col border-r border-line bg-white px-[20px] py-[28px]">
        <SidebarContent />
      </aside>
      <div className="pl-[264px]">
        <header className="sticky top-0 z-[40] flex h-[76px] items-center justify-end gap-[12px] border-b border-line bg-white/90 px-[48px] backdrop-blur">
          <Chip>{networkLabel}</Chip>
          <WalletButton />
        </header>
        <main className="mx-auto max-w-[1280px] px-[48px] py-[44px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
