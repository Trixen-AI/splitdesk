import { PromiseArt } from '@/components/art/SceneArt'
import { PROMISE } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

export function Promise() {
  const m = useIsMobile()
  return (
    <div className={`relative flex-col items-center bg-card border-b border-line ${m ? 'vw-h-462 vw-pt-40' : 'h-[894px] pt-[120px]'}`}>
      <div data-aos="fade-up" className={`font-JetBrainsMono text-primary/60 ${m ? 'vw-text-14 vw-leading-18 vw-mb-24' : 'text-[24px] leading-[32px] mb-[24px]'}`}>
        {PROMISE.label}
      </div>
      <div
        data-aos="fade-up"
        className={
          m
            ? 'text-center text-primary w-full font-[500] vw-text-18 vw-leading-22 vw-px-20'
            : 'text-center text-primary w-full font-[500] xl:text-[36px] max-xl:text-[32px] leading-[43px] max-w-[1024px] max-xl:px-[120px]'
        }
      >
        {PROMISE.parts.map((p) =>
          p.quiet ? (
            <span key={p.text} className="text-primary/30 font-[400]">
              {p.text}
            </span>
          ) : (
            <span key={p.text}>{p.text}</span>
          ),
        )}
      </div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${m ? 'vw-w-283 vw-h-160' : 'xl:w-[812px] xl:h-[460px] max-xl:w-[635px] max-xl:h-[360px]'}`}>
        <PromiseArt className="w-full h-full" />
      </div>
    </div>
  )
}
