import { WHY } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'
import { LabeledSection } from './LabeledSection'

const pad = (n: number) => String(n).padStart(2, '0')

export function Why() {
  const m = useIsMobile()
  return (
    <LabeledSection label={WHY.label}>
      <div className={m ? 'flex-col vw-gap-32 vw-mb-48' : 'flex-col gap-[32px] mb-[120px]'}>
        <div data-aos="fade-up" className={m ? 'font-[500] vw-text-18 vw-leading-22' : 'font-[500] lg:text-[36px] max-lg:text-[32px] leading-[43px]'}>
          <span className="text-primary">{WHY.lead}</span>
          <span className="text-primary/30 font-[400]">{WHY.quiet}</span>
        </div>
        <div data-aos="fade-up" className={m ? 'text-primary/60 vw-text-14 vw-leading-16' : 'text-primary/60 text-[20px] leading-[24px]'}>
          {WHY.body}
        </div>
        <div data-aos="fade-up" className={m ? 'max-xl:flex-col max-xl:flex vw-gap-16' : 'xl:flex max-xl:flex-col max-xl:flex gap-[16px]'}>
          {WHY.pills.map((p, i) => (
            <div
              key={p}
              className={
                m
                  ? 'flex items-center rounded-full border border-primary/10 vw-gap-12 vw-py-8 vw-px-20'
                  : 'flex items-center rounded-full border border-primary/10 gap-[12px] py-[12px] px-[24px]'
              }
            >
              <span className={`font-JetBrainsMono text-primary/60 ${m ? 'vw-text-14' : 'text-[14px]'}`}>[{pad(i + 1)}]</span>
              <span className={`font-[500] text-primary ${m ? 'vw-text-14' : 'text-[16px]'}`}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div data-aos="fade-up" className={m ? 'font-JetBrainsMono text-primary/60 vw-text-14 vw-mb-20' : 'font-JetBrainsMono text-primary/60 text-[24px] mb-[48px]'}>
          {WHY.listLabel}
        </div>
        {WHY.list.map((t, i) => (
          <div
            key={t}
            data-aos="fade-up"
            data-aos-delay={i * 120}
            className={
              m
                ? 'flex items-center border-t border-line vw-gap-32 vw-py-20 vw-pr-48'
                : 'flex items-center border-t border-line gap-[32px] py-[44px] pr-[48px]'
            }
          >
            <span className={`font-JetBrainsMono text-primary/60 ${m ? 'vw-text-18' : 'text-[18px]'}`}>{pad(i + 1)}</span>
            <span className={`font-[500] text-primary ${m ? 'vw-text-16' : 'lg:text-[30px] max-lg:text-[24px]'}`}>{t}</span>
          </div>
        ))}
      </div>
    </LabeledSection>
  )
}
