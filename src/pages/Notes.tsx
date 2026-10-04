import { Link, Navigate, useParams } from 'react-router-dom'
import { NoteArt } from '@/components/art/SceneArt'
import { NoteGrid } from '@/components/sections/Notes'
import { NOTES } from '@/data/site'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useSeo } from '@/lib/seo'

export function NotesIndex() {
  const m = useIsMobile()
  useSeo({ title: 'Notes', description: 'How Splitdesk launches pump.fun coins, locks creator fee splits and pays X accounts in US dollars.', path: '/notes' })
  return (
    <section className={m ? 'vw-px-20 vw-pt-40 vw-pb-40' : 'px-[48px] pt-[180px] pb-[120px]'}>
      <h1 className={`font-[500] text-primary ${m ? 'vw-text-24 vw-leading-30 vw-mb-40' : 'text-[48px] leading-[58px] mb-[64px]'}`}>{NOTES.title}</h1>
      <NoteGrid />
    </section>
  )
}

export function NotePage() {
  const { slug } = useParams()
  const m = useIsMobile()
  const note = NOTES.items.find((n) => n.slug === slug)
  useSeo({ title: note?.title ?? 'Notes', description: note?.excerpt, path: note ? `/notes/${note.slug}` : '/notes' })
  if (!note) return <Navigate to="/notes" replace />

  return (
    <article className={m ? 'vw-px-20 vw-pt-24 vw-pb-40' : 'px-[48px] pt-[160px] pb-[120px]'}>
      <div className={m ? '' : 'mx-auto max-w-[880px]'}>
        <Link to="/notes" className={`font-JetBrainsMono text-primary/60 ${m ? 'vw-text-12' : 'text-[16px]'}`}>
          {'< '}NOTES
        </Link>
        <h1 className={`font-[500] text-primary ${m ? 'vw-text-24 vw-leading-30 vw-mt-16' : 'text-[48px] leading-[58px] mt-[24px]'}`}>{note.title}</h1>
        <div className={`font-JetBrainsMono text-primary/40 ${m ? 'vw-text-12 vw-mt-8' : 'text-[16px] mt-[12px]'}`}>{note.date.toUpperCase()}</div>
        <div className={`relative aspect-[968/516] overflow-hidden border border-primary/5 ${m ? 'vw-rounded-16 vw-mt-24' : 'rounded-[16px] mt-[40px]'}`}>
          <NoteArt kind={note.art} className="absolute inset-0 w-full h-full" />
        </div>
        <div className={m ? 'vw-mt-24' : 'mt-[48px]'}>
          {note.body.map((b, i) => (
            <div key={i} className={m ? 'vw-mb-24' : 'mb-[36px]'}>
              {b.heading && <h2 className={`font-[600] text-primary ${m ? 'vw-text-16 vw-mb-8' : 'text-[24px] leading-[140%] mb-[12px]'}`}>{b.heading}</h2>}
              <p className={`text-primary/70 leading-[160%] ${m ? 'vw-text-14' : 'text-[20px]'}`}>{b.text}</p>
            </div>
          ))}
        </div>
        <Link
          to="/app/launch"
          className={`inline-flex items-center justify-center font-[500] rounded-[8px] bg-primary text-white hover:bg-ink-hover duration-150 ${
            m ? 'vw-h-44 vw-px-20 vw-text-14' : 'h-[56px] px-[28px] text-[18px]'
          }`}
        >
          Create a coin
        </Link>
      </div>
    </article>
  )
}
