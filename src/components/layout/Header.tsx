import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { XLogo } from '@/components/brand/XLogo'
import { MenuArt } from '@/components/art/SceneArt'
import { DESK_MENU, FOOTER, LAUNCH_APP, MOBILE_MENU, NAV, SOCIALS, type NavItem } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

const X_URL = SOCIALS[0].href

function isActive(item: NavItem, pathname: string, hash: string) {
  if (item.href === '/') return pathname === '/' && !hash
  if (item.href.startsWith('/#')) return pathname === '/' && hash === item.href.slice(1)
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

function NavLabel({ label, active }: { label: string; active: boolean }) {
  // Invisible bold copy reserves the bold width so hovering never shifts the row.
  return (
    <div className="relative">
      <span className="invisible block text-[16px] font-[700] leading-[17px]">{label}</span>
      <span
        className={`absolute inset-0 flex items-center justify-center cursor-pointer leading-[17px] hover:text-primary hover:font-[700] duration-75 text-[16px] ${
          active ? 'font-[700]' : ''
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 10.5 12 14l4-3.5" stroke="#17181A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DeskPanel({ onPick }: { onPick: () => void }) {
  return (
    <div className="w-full animate-[dropdownIn_220ms_ease-out] py-[40px] px-[20px] rounded-[8px] border border-hairline bg-white shadow-[0_24px_60px_rgba(16,24,40,0.12)]">
      <div className="font-JetBrainsMono text-[18px] leading-[24px] text-primary/60 mb-[20px]">{DESK_MENU.label}</div>
      <div className="grid grid-cols-4 gap-[20px] max-lg:grid-cols-2">
        {DESK_MENU.pillars.map((p) => (
          <Link key={p.key} to={p.href} className="block min-w-0" onClick={onPick}>
            <div className="flex flex-col gap-[20px] cursor-pointer group">
              <div className="w-full aspect-[344/140] rounded-[8px] overflow-hidden">
                <MenuArt kind={p.key} className="block w-full h-full group-hover:scale-105 duration-300" />
              </div>
              <div className="font-[500] text-[18px] leading-[22px] text-primary">{p.title}</div>
              <div className="text-[16px] leading-[19px] text-primary/30 line-clamp-2">{p.text}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DesktopHeader() {
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="fixed left-1/2 top-[20px] z-[99] w-[calc(100%-64px)] max-w-[1478px] -translate-x-1/2"
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex items-center justify-between rounded-[100px] border border-hairline bg-white px-[24px] py-[19px] shadow-[0_8px_24px_0_rgba(0,0,0,0.04)]">
          <Link to="/" aria-label="Splitdesk home">
            <div className="h-[40px] w-[145px] cursor-pointer">
              <Logo className="h-full w-full" />
            </div>
          </Link>
          <nav className="relative z-[2] flex items-center justify-between gap-[32px]" aria-label="Main">
            {NAV.map((item) =>
              item.menu ? (
                <div key={item.label} className="relative py-[8px] px-[12px] -my-[8px] -mx-[12px]" onMouseEnter={() => setOpen(true)}>
                  <Link to={item.href} className="flex items-center" aria-expanded={open} onClick={() => setOpen(false)}>
                    <NavLabel label={item.label} active={open || isActive(item, pathname, hash)} />
                    <div className={`w-[24px] h-[24px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                      <Chevron />
                    </div>
                  </Link>
                </div>
              ) : (
                <Link key={item.label} to={item.href} className="block" onMouseEnter={() => setOpen(false)}>
                  <div className="flex">
                    <NavLabel label={item.label} active={isActive(item, pathname, hash)} />
                  </div>
                </Link>
              ),
            )}
          </nav>
          <div className="flex items-center gap-[16px]">
          <Link
            to={LAUNCH_APP.href}
            className="inline-flex h-[42px] items-center rounded-full bg-primary px-[20px] text-[15px] font-[500] text-white duration-150 hover:bg-ink-hover"
          >
            {LAUNCH_APP.label}
          </Link>
          <div className="h-[36px] w-[36px] cursor-pointer">
            <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label={SOCIALS[0].label} className="flex h-full w-full items-center justify-center">
              <XLogo className="h-[22px] w-[22px]" color="#000000" />
            </a>
          </div>
          </div>
        </div>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-full pt-[20px]">
            <DeskPanel onPick={() => setOpen(false)} />
          </div>
        )}
      </div>
      {open && <div className="fixed inset-0 z-[98] bg-[rgba(0,0,0,0.4)]" aria-hidden="true" />}
    </>
  )
}

function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)
  const item = 'vw-py-4 vw-pl-8 text-left vw-text-14 font-[600] leading-[150%] block'

  return (
    <>
      <div className="fixed left-0 top-0 right-0 z-[99] bg-white">
        <div className="flex items-center justify-between vw-p-20">
          <Link to="/" onClick={close} className="vw-w-94 cursor-pointer text-left block" aria-label="Splitdesk home">
            <Logo className="block w-full h-auto" />
          </Link>
          <div className="flex items-center vw-gap-16">
          <Link
            to={LAUNCH_APP.href}
            onClick={close}
            className="inline-flex vw-h-32 items-center rounded-full bg-primary vw-px-14 vw-text-13 font-[500] text-white"
          >
            {LAUNCH_APP.label}
          </Link>
          <button
            type="button"
            className="flex vw-size-20 items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <svg viewBox="0 0 20 20" className="w-full h-full" aria-hidden="true">
              {open ? (
                <path d="M4 4l12 12M16 4 4 16" stroke="#17181A" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="#17181A" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 vw-t-64 z-[99] overflow-y-auto bg-white transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="flex flex-col vw-gap-24 vw-px-24 vw-py-16">
          <div>
            <div className="vw-mb-16 vw-pl-8 vw-text-14 font-[500] leading-[150%] text-black/40">{MOBILE_MENU.sections.menu}</div>
            <div className="flex flex-col vw-gap-4">
              {NAV.map((n) =>
                n.menu ? (
                  <div key={n.label} className="vw-px-8 vw-py-6">
                    <div className="vw-text-14 font-[600] leading-[150%] text-black/60">{n.label}</div>
                    <div className="vw-mt-12 vw-ml-12 flex flex-col vw-gap-8 border-l border-primary/10 vw-pl-12">
                      {DESK_MENU.pillars.map((p) => (
                        <Link key={p.key} to={p.href} onClick={close} className="text-left vw-text-14 leading-[150%] text-primary/60">
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link key={n.label} to={n.href} onClick={close} className={`${item} ${isActive(n, pathname, hash) ? 'text-black' : 'text-black/60'}`}>
                    {n.label}
                  </Link>
                ),
              )}
            </div>
          </div>
          <div>
            <div className="vw-mb-16 vw-pl-8 vw-text-14 font-[500] leading-[150%] text-black/40">{MOBILE_MENU.sections.resources}</div>
            <div className="flex flex-col vw-gap-4 vw-pl-8 vw-text-14 font-[600] text-black/60">
              {FOOTER.legal.map((l) =>
                l.href.startsWith('http') ? (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="vw-py-4 leading-[150%]">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} to={l.href} onClick={close} className="vw-py-4 text-left leading-[150%]">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          </div>
          <div>
            <div className="vw-mb-16 vw-pl-8 vw-text-14 font-[500] leading-[150%] text-black/40">{MOBILE_MENU.sections.community}</div>
            <div className="vw-pl-8">
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="inline-flex vw-size-24 items-center justify-center">
                  <XLogo className="w-[62%] h-[62%]" color="#000000" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function Header() {
  const mobile = useIsMobile()
  return mobile ? <MobileHeader /> : <DesktopHeader />
}
