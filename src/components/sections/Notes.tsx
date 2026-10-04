import { Link } from 'react-router-dom'
import { NoteArt } from '@/components/art/SceneArt'
import { NOTES } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'

export function NoteGrid() {
  const m = useIsMobile()
  return (
    <div className={m ? 'grid grid-cols-1 vw-gap-40' : 'grid grid-cols-2 gap-[32px]'}>
      {NOTES.items.map((n, i) => (
        <div key={n.slug} data-aos="fade-up" data-aos-delay={i * 200}>
          <Link to={`/notes/${n.slug}`} className="block h-full">
            <article className="flex h-full flex-col cursor-pointer group">
              <div className={`relative aspect-[968/516] overflow-hidden border border-primary/5 ${m ? 'vw-rounded-16' : 'rounded-[16px]'}`}>
                <NoteArt kind={n.art} className="absolute inset-0 w-full h-full group-hover:scale-105 duration-300" />
              </div>
              <div className={`flex flex-1 flex-col ${m ? 'vw-mt-24' : 'mt-[24px]'}`}>
                <h3 className={`font-[600] leading-[140%] text-primary ${m ? 'vw-text-16 vw-mb-12' : 'mb-[16px] text-[24px]'}`}>{n.title}</h3>
                <p className={`mt-auto leading-[150%] text-muted line-clamp-2 ${m ? 'vw-text-16' : 'text-[18px]'}`}>{n.excerpt}</p>
              </div>
            </article>
          </Link>
        </div>
      ))}
    </div>
  )
}

export function Notes() {
  const m = useIsMobile()
  return (
    <section id="notes" className={`border-b border-line ${m ? 'vw-px-20 vw-py-40' : 'px-[48px] py-[120px]'}`}>
      <div className={`flex items-center justify-between ${m ? 'vw-mb-40' : 'mb-[64px]'}`}>
        <h2 className={`font-[500] text-primary ${m ? 'vw-text-24 vw-leading-29' : 'text-[48px] leading-[58px]'}`}>{NOTES.title}</h2>
        <Link to="/notes">
          <div className={`leading-[150%] text-primary cursor-pointer ${m ? 'vw-text-14' : 'text-[18px]'}`}>{NOTES.more}</div>
        </Link>
      </div>
      <NoteGrid />
    </section>
  )
}
