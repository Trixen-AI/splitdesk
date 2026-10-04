import { IDEA } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'
import { LabeledSection } from './LabeledSection'

export function Idea() {
  const mobile = useIsMobile()
  return (
    <LabeledSection label={IDEA.label} contentClass="max-w-[985px]">
      <div
        data-aos="fade-up"
        className={
          mobile
            ? 'text-primary font-[500] vw-text-18 leading-[1.5] vw-mb-32'
            : 'text-primary font-[500] lg:text-[36px] max-lg:text-[32px] leading-[43px] mb-[60px]'
        }
      >
        {IDEA.lead}
        <span className="text-primary/30 font-[400]">{IDEA.quiet}</span>
        {IDEA.close}
      </div>
      <div data-aos="fade-up" className={mobile ? 'text-primary/60 vw-text-14 vw-leading-16' : 'text-primary/60 text-[20px] leading-[24px]'}>
        {IDEA.body}
      </div>
    </LabeledSection>
  )
}
