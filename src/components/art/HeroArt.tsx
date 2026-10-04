import { Pill, Shapes } from './Shapes'
import { line, poly, projector, ring, slab, splitCoin, TONES, wedgeTop, type Slice } from './iso'

// Hero: the desk (a slab) with a coin cut into three shares, each share wired to its payout chip.
// The coin sits high on the desk so the headline only ever crosses the pale platform.
const P = projector(450, 300, 1)

const COIN = { r: 122, z: 14, h: 30 }
// Angles: 0 = towards bottom-right, 90 = bottom-left, 180 = top-left, 270 = top-right; 45 faces the viewer.
const SLICES: (Slice & { n: string; label: string; chip: [number, number] })[] = [
  { a0: 80, a1: 224, tone: TONES.white, pull: 8, n: '01', label: '40%', chip: [196, 150] },
  { a0: 224, a1: 350, tone: TONES.ink, pull: 8, n: '02', label: '35%', chip: [706, 96] },
  { a0: -10, a1: 80, tone: TONES.lime, pull: 40, lift: 18, n: '03', label: '25%', chip: [742, 300] },
]

const base = slab(P, -200, -200, 200, 200, -22, 0, TONES.white)
const plinth = slab(P, -150, -150, 150, 150, 0, 6, TONES.paper)
const coin = splitCoin(P, { ...COIN, slices: SLICES })

// circuit-like traces on the desk top
const traces = [
  [P(150, -96), P(178, -96), P(178, -40)],
  [P(150, 60), P(186, 60), P(186, 120)],
  [P(-96, 150), P(-96, 182), P(-30, 182)],
  [P(70, 150), P(70, 176), P(140, 176)],
  [P(-150, 40), P(-184, 40), P(-184, -60)],
  [P(-40, -150), P(-40, -182), P(60, -182)],
]

export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 666" className={className} role="img" aria-label="A coin split into three shares, each wired to a payout">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="52%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="hero-soft" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="pill-shadow" x="-30%" y="-60%" width="160%" height="260%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#17181A" floodOpacity="0.08" />
        </filter>
      </defs>

      <ellipse cx="450" cy="350" rx="430" ry="310" fill="url(#hero-glow)" />
      {[300, 360, 420].map((R, i) => (
        <path key={R} d={ring(P, R, -22)} fill="none" stroke="#D6DBCF" strokeWidth="1" strokeDasharray={i === 1 ? '2 6' : undefined} opacity={0.7 - i * 0.18} />
      ))}

      {/* shadow under the desk */}
      <path d={poly([P(-200, 230, -40), P(230, 230, -40), P(230, -200, -40)])} fill="#AEB6A4" opacity="0.35" filter="url(#hero-soft)" />

      <Shapes items={base} />
      <path d={poly([P(-182, -182), P(182, -182), P(182, 182), P(-182, 182)])} fill="none" stroke="#D9DED2" strokeWidth="1" />
      <path d={poly([P(-170, -170), P(170, -170), P(170, 170), P(-170, 170)])} fill="none" stroke="#E3E7DD" strokeWidth="1" strokeDasharray="3 5" />
      {traces.map((t, i) => (
        <g key={i}>
          <path d={line(t)} fill="none" stroke="#CDD3C6" strokeWidth="1.2" />
          <circle cx={t[t.length - 1][0]} cy={t[t.length - 1][1]} r="2.6" fill="#CDD3C6" />
        </g>
      ))}

      <Shapes items={plinth} />
      <path d={ring(P, 140, 6)} fill="none" stroke="#D4D9CC" strokeWidth="1" />
      <Shapes items={coin} />

      {SLICES.map((s) => {
        const [x, y] = wedgeTop(P, { ...COIN, a0: s.a0, a1: s.a1, pull: s.pull, z: COIN.z + (s.lift ?? 0) })
        return (
          <g key={s.label}>
            <path d={`M${x} ${y}L${x} ${s.chip[1]}L${s.chip[0]} ${s.chip[1]}`} fill="none" stroke="#9AA191" strokeWidth="1.2" strokeDasharray="3 4" />
            <circle cx={x} cy={y} r="4" fill="#17181A" />
          </g>
        )
      })}
      <g filter="url(#pill-shadow)">
        {SLICES.map((s) => (
          <Pill key={s.label} x={s.chip[0]} y={s.chip[1]} text={`${s.n} · ${s.label}`} size={15} dot={s.tone.top === '#FFFFFF' ? '#CBD1C4' : s.tone.top} />
        ))}
        <Pill x={724} y={440} text="USDC to USD" size={14} dark />
      </g>
    </svg>
  )
}
