import { HeroArt } from '@/components/art/HeroArt'
import { HERO } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

export function Hero() {
  const mobile = useIsMobile()

  if (mobile) {
    return (
      <div className="bg-paper overflow-hidden">
        <div className="relative vw-h-317 overflow-hidden flex items-center justify-center">
          <HeroArt className="w-full h-full" />
        </div>
        <div className="relative z-[1] vw-px-20 vw-py-24">
          <div>
            <h1 data-aos="fade-up" className="font-[500] text-primary vw-text-24 vw-leading-30 vw-mb-24">
              {HERO.titleLines.join(' ')}
            </h1>
            <div data-aos="fade-up" className="border-t border-line flex-col vw-pt-16 vw-gap-24">
              {HERO.columns.map((c) => (
                <div key={c.label} className="flex-1">
                  <div className="font-JetBrainsMono text-primary/40 vw-text-14 vw-leading-20 vw-mb-8">{c.label}</div>
                  <div className="text-primary vw-text-14 vw-leading-20">
                    {c.lines[0]}
                    <br />
                    {c.lines[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-paper overflow-hidden h-screen">
      <div className="z-[1] absolute bottom-[78px] left-0 w-full px-[48px]">
        <div className="mx-auto max-w-[1430px]">
          <h1 data-aos="fade-up" className="font-[500] text-primary lg:text-[80px] max-lg:text-[48px] max-lg:leading-[58px] lg:leading-[80px] mb-[48px]">
            {HERO.titleLines[0]}
            <br />
            {HERO.titleLines[1]}
          </h1>
          <div data-aos="fade-up" data-aos-delay="200" className="border-t border-line flex justify-between pt-[16px]">
            {HERO.columns.map((c) => (
              <div key={c.label} className="flex-1">
                <div className="font-JetBrainsMono text-primary/40 text-[20px] leading-[26px] mb-[16px]">{c.label}</div>
                <div className="text-primary text-[20px] leading-[24px]">
                  {c.lines[0]}
                  <br />
                  {c.lines[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="z-[0] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[666px]">
        <HeroArt className="w-full h-full" />
      </div>
    </div>
  )
}
