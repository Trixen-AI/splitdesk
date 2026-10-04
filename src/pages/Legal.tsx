import { useIsMobile } from '@/hooks/useIsMobile'
import { useSeo } from '@/lib/seo'

// Placeholder legal copy. Replace with reviewed terms before going live.
const SECTIONS = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    text: [
      'Splitdesk stores the public launch record you submit: the coin mint, the transaction signatures, the X handles you named and their shares. All of it is public on Solana or IPFS already.',
      'When an account signs in with X to claim a payout, we keep the handle and the X user ID needed to match it to its share. We do not sell this data.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    text: [
      'Coins are created on pump.fun through its public programs. Trading meme coins is risky and you can lose everything you put in. Nothing on this site is financial advice.',
      'Shares are locked when the launch completes and cannot be changed by Splitdesk or by the creator. Payouts depend on X Money being available to the named account.',
    ],
  },
]

export default function Legal() {
  const m = useIsMobile()
  useSeo({ title: 'Privacy and terms', description: 'Privacy policy and terms of use for Splitdesk.', path: '/legal' })
  return (
    <div className={m ? 'vw-px-20 vw-pt-24 vw-pb-40' : 'px-[48px] pt-[160px] pb-[120px]'}>
      <div className={m ? '' : 'mx-auto max-w-[880px]'}>
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className={m ? 'vw-mb-40' : 'mb-[80px]'}>
            <h1 className={`font-[500] text-primary ${m ? 'vw-text-24 vw-leading-30 vw-mb-16' : 'text-[48px] leading-[58px] mb-[24px]'}`}>{s.title}</h1>
            {s.text.map((t) => (
              <p key={t} className={`text-primary/70 leading-[160%] ${m ? 'vw-text-14 vw-mb-12' : 'text-[20px] mb-[16px]'}`}>
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
