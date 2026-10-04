import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

// The repeated device of the page: a mono label column beside the section content.
export function LabeledSection({ label, children, contentClass = '' }: { label: string; children: ReactNode; contentClass?: string }) {
  const mobile = useIsMobile()
  if (mobile) {
    return (
      <div className="w-full flex-col-center border-line overflow-hidden vw-py-40 vw-px-20 border-b">
        <div className="w-full">
          <div className="flex justify-between w-full mx-auto flex-col vw-gap-20">
            <div data-aos="fade-up" className="shrink-0 font-JetBrainsMono text-primary/60 whitespace-nowrap vw-text-14 vw-leading-18">
              {label}
            </div>
            <div className="w-full flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full flex-col-center border-line overflow-hidden py-[120px] border-b">
      <div className="w-full px-[48px]">
        <div className="flex justify-between w-full mx-auto gap-[160px] max-w-[1430px]">
          <div data-aos="fade-up" className="shrink-0 font-JetBrainsMono text-primary/60 whitespace-nowrap w-[173px] text-[24px] leading-[32px]">
            {label}
          </div>
          <div className={`w-full flex-1 min-w-0 ${contentClass}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}
