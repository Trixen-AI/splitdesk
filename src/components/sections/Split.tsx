import { SplitSharesArt, SplitUsdArt } from '@/components/art/SceneArt'
import { SPLIT } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'
import { LabeledSection } from './LabeledSection'

export function Split() {
  const mobile = useIsMobile()
  const [shares, usd] = SPLIT.images
  const frame = mobile ? 'w-full vw-h-189' : 'w-full xl:max-w-[480px] xl:max-h-[270px]'
  const art = mobile ? 'w-full h-full' : 'block w-full h-auto'
  return (
    <LabeledSection label={SPLIT.label} contentClass="max-w-[985px]">
      <div
        data-aos="fade-up"
        className={mobile ? 'text-primary vw-text-18 vw-leading-22 vw-mb-20' : 'text-primary lg:text-[36px] max-lg:text-[32px] leading-[43px] mb-[80px]'}
      >
        {SPLIT.text}
      </div>
      <div data-aos="fade-up" className={mobile ? 'flex-col items-center vw-gap-10' : 'flex-col xl:flex-row items-center gap-[24px]'}>
        <div className={frame}>
          <SplitSharesArt chip={shares.chip} className={art} />
        </div>
        <div className={frame}>
          <SplitUsdArt chip={usd.chip} className={art} />
        </div>
      </div>
    </LabeledSection>
  )
}
