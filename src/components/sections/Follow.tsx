import { XLogo } from '@/components/brand/XLogo'
import { FOLLOW, SOCIALS } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

export function Follow() {
  const m = useIsMobile()
  return (
    <div className={`flex-col items-center border-b border-[#E3E6DD] ${m ? 'vw-py-40' : 'py-[120px]'}`}>
      <div data-aos="fade-up" data-aos-delay="0" className={`font-[500] text-primary ${m ? 'vw-text-24 vw-leading-29' : 'text-[48px] leading-[58px]'}`}>
        {FOLLOW.title}
      </div>
      <div data-aos="fade-up" data-aos-delay="120" className={`leading-[150%] text-muted ${m ? 'vw-text-16 vw-mt-20 vw-mb-40' : 'text-[30px] mt-[24px] mb-[48px]'}`}>
        {FOLLOW.sub}
      </div>
      <a data-aos="fade-up" data-aos-delay="180" href={SOCIALS[0].href} target="_blank" rel="noopener noreferrer">
        <div
          className={`flex items-center font-[500] leading-[150%] whitespace-nowrap justify-center border rounded-[8px] duration-150 cursor-pointer bg-primary text-white border-transparent hover:bg-ink-hover active:bg-primary ${
            m ? 'vw-w-160 vw-h-44 vw-text-14' : 'w-[240px] h-[67px] text-[20px]'
          }`}
        >
          <div className={`flex items-center justify-center ${m ? 'vw-size-24 vw-mr-2' : 'w-[26px] h-[26px] mr-[2px]'}`}>
            <XLogo className="w-[64%] h-[64%]" color="#FFFFFF" />
          </div>
          {FOLLOW.button}
        </div>
      </a>
    </div>
  )
}
