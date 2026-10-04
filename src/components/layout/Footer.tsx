import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { XLogo } from '@/components/brand/XLogo'
import { BRAND, FOOTER, NAV, SOCIALS } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

function LegalLink({ label, href, className }: { label: string; href: string; className: string }) {
  return href.startsWith('http') ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  ) : (
    <Link to={href} className={className}>
      {label}
    </Link>
  )
}

function Socials({ size }: { size: string }) {
  return (
    <>
      {SOCIALS.map((s) => (
        <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
          <div className={`${size} flex items-center justify-center`}>
            <XLogo className="w-[62%] h-[62%]" color="#000000" />
          </div>
        </a>
      ))}
    </>
  )
}

const copyright = `© ${BRAND.year} ${BRAND.name}. All rights reserved`

export function Footer() {
  const mobile = useIsMobile()
  const [privacy, terms, docs] = FOOTER.legal

  if (mobile) {
    return (
      <footer className="flex-col relative overflow-hidden vw-py-48 vw-px-20 font-[500] text-primary">
        <div className="relative flex-1 z-[1] w-full justify-between flex-col">
          <div className="flex-col">
            <div className="flex-1 flex-col">
              <div className="flex-1 shrink-0">
                <div className="vw-w-108 vw-h-30">
                  <Logo className="w-full h-full" />
                </div>
              </div>
              <div className="font-[400] leading-[150%] text-primary/60 vw-text-12 vw-mt-16">
                {FOOTER.taglineLines[0]}
                <br />
                {FOOTER.taglineLines[1]}
              </div>
            </div>
          </div>
          <div className="flex justify-between vw-gap-24 vw-mt-24 vw-mb-12">
            <div>
              <div className="flex-col flex-1 vw-gap-8 vw-text-14 vw-leading-24 flex-col">
                {NAV.map((n) => (
                  <Link key={n.label} to={n.href} className="cursor-pointer w-fit">
                    {n.label}
                  </Link>
                ))}
              </div>
              <LegalLink {...privacy} className="block whitespace-nowrap cursor-pointer underline vw-mt-40 vw-text-14" />
            </div>
            <div className="flex-col">
              <div className="flex-1" />
              <LegalLink {...terms} className="block cursor-pointer underline whitespace-nowrap vw-text-14 text-center" />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex-1">
                <div className="flex justify-center">
                  <Socials size="vw-size-28" />
                </div>
              </div>
              <LegalLink {...docs} className="block cursor-pointer underline vw-text-14" />
            </div>
          </div>
          <div className="font-[400] vw-text-12 text-primary/60 leading-[150%]">
            {copyright}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="flex-col relative overflow-hidden px-[44px] py-[48px] h-[400px] items-center font-[500] text-primary">
      <div className="relative flex-1 z-[1] w-full justify-between flex">
        <div className="flex-col">
          <div className="flex-1 flex-col">
            <div className="flex-1 shrink-0">
              <div className="w-[217px] h-[60px]">
                <Logo className="w-full h-full" />
              </div>
            </div>
            <div className="font-[400] leading-[150%] text-primary/60 text-[16px] mb-[52px]">
              {FOOTER.taglineLines[0]}
              <br />
              {FOOTER.taglineLines[1]}
            </div>
          </div>
          <div className="font-[400] text-[14px] text-primary/60 leading-[150%]">
            {copyright}
          </div>
        </div>
        <div className="flex gap-[40px]">
          <div className="flex-col w-[140px] pl-[8px]">
            <div className="flex-col flex-1 text-[16px] leading-[24px]">
              {FOOTER.colA.map((l) => (
                <Link key={l.label} to={l.href} className="cursor-pointer w-fit py-[8px]">
                  {l.label}
                </Link>
              ))}
            </div>
            <LegalLink {...privacy} className="whitespace-nowrap cursor-pointer underline text-[16px]" />
          </div>
          <div className="flex-col w-[140px] text-[16px]">
            <div className="flex-1">
              {FOOTER.colB.map((l) => (
                <div key={l.label} className="p-[8px] leading-[24px]">
                  <Link to={l.href}>{l.label}</Link>
                </div>
              ))}
            </div>
            <LegalLink {...terms} className="cursor-pointer underline whitespace-nowrap pl-[8px] text-[16px]" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex-1 w-[88px]">
              <div className="flex justify-center">
                <Socials size="w-[36px] h-[36px]" />
              </div>
            </div>
            <LegalLink {...docs} className="cursor-pointer underline pl-[8px] text-[16px] whitespace-nowrap" />
          </div>
        </div>
      </div>
    </footer>
  )
}
