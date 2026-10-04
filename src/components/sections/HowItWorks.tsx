import { useState } from 'react'
import { StepIcon } from '@/components/art/SceneArt'
import { HOW } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

const STEP = 528 // card width 504 + gap 24
const VISIBLE = 2 // the counter reads "last card in view"
const tag = (i: number) => `[${String(i + 1).padStart(2, '0')}]`

function Arrow({ dir, enabled, onClick }: { dir: 'prev' | 'next'; enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 'prev' ? 'Previous step' : 'Next step'}
      disabled={!enabled}
      onClick={onClick}
      className={`w-[30px] h-[30px] duration-150 disabled:cursor-not-allowed ${dir === 'next' ? 'rotate-[180deg]' : ''} ${
        enabled ? 'cursor-pointer active:scale-90 invert' : ''
      }`}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="15" cy="15" r="15" fill="#F4F5F1" />
        <path d="M17.2 10.2 12.4 15l4.8 4.8" stroke="#17181A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function HowItWorks() {
  const mobile = useIsMobile()
  const [idx, setIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const max = HOW.steps.length - VISIBLE

  if (mobile) {
    const shown = expanded ? HOW.steps : HOW.steps.slice(0, 2)
    return (
      <div id="how-it-works" data-aos="fade-up" className="border-b border-line vw-py-40 vw-px-20">
        <div className="flex flex-col items-start vw-mb-20">
          <h2 className="font-[500] text-primary vw-text-24 vw-leading-30">{HOW.title}</h2>
        </div>
        <div className="flex-col vw-gap-8">
          {shown.map((s, i) => (
            <div key={s.title} className="w-full flex flex-col bg-card duration-200 group vw-gap-12 vw-p-16 vw-rounded-8">
              <div className="vw-size-32">
                <StepIcon name={s.icon} className="w-full h-full" />
              </div>
              <div className="flex font-JetBrainsMono text-primary flex-col vw-gap-12">
                <div className="bg-chip vw-px-4 vw-text-12 vw-leading-20 vw-rounded-8 w-fit">{tag(i)}</div>
                <div className="vw-text-14 vw-leading-18">{s.title}</div>
              </div>
              <div className="text-muted vw-text-14 vw-leading-16">{s.text}</div>
            </div>
          ))}
        </div>
        <div className="vw-mt-20 flex justify-center">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="group relative flex items-center cursor-pointer w-fit vw-gap-2" aria-expanded={expanded}>
            <div className="font-[500] leading-[150%] text-money vw-text-12">{expanded ? 'Fewer Steps' : 'All Steps'}</div>
            <div className={`duration-200 vw-size-14 ${expanded ? '-rotate-[90deg]' : 'rotate-[90deg]'}`}>
              <svg viewBox="0 0 14 14" className="w-full h-full" aria-hidden="true">
                <path d="M5 3.5 8.5 7 5 10.5" fill="none" stroke="#1F8A4C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="how-it-works" data-aos="fade-up" className="border-b border-line py-[120px] px-[48px]">
      <div className="flex items-center justify-between mb-[64px]">
        <h2 className="font-[500] text-primary text-[48px] leading-[58px]">{HOW.title}</h2>
        <div className="flex items-center gap-[24px]">
          <Arrow dir="prev" enabled={idx > 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} />
          <div className="px-[20px] py-[4px] text-[18px] leading-[150%] text-primary bg-card rounded-full" aria-live="polite">
            {idx + VISIBLE} / {HOW.steps.length}
          </div>
          <Arrow dir="next" enabled={idx < max} onClick={() => setIdx((i) => Math.min(max, i + 1))} />
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-[24px] transition-transform duration-500 ease-out will-change-transform" style={{ transform: `translateX(-${idx * STEP}px)` }}>
          {HOW.steps.map((s, i) => (
            <div key={s.title} className="w-full max-w-full shrink-0 md:w-[504px]">
              <div className="w-full flex flex-col bg-card duration-200 group min-h-[406px] gap-[32px] py-[48px] px-[32px] rounded-[8px] hover:bg-card-hover">
                <div className="w-[48px] h-[48px]">
                  <StepIcon name={s.icon} className="w-full h-full" />
                </div>
                <div className="flex font-JetBrainsMono text-primary gap-[16px] items-center">
                  <div className="bg-chip py-[4px] px-[12px] text-[14px] leading-[20px] rounded-[8px]">{tag(i)}</div>
                  <div className="text-[16px] leading-[21px]">{s.title}</div>
                </div>
                <div className="text-muted text-[20px] leading-[24px] group-hover:text-primary">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
