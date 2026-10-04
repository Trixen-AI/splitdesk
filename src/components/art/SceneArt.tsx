import { Pill, Shapes } from './Shapes'
import { cylinder, line, projector, ring, slab, splitCoin, TONES, type Slice } from './iso'

// Same arrangement as the hero: the lime share is pulled out towards the viewer.
const THREE: Slice[] = [
  { a0: 80, a1: 224, tone: TONES.white, pull: 6 },
  { a0: 224, a1: 350, tone: TONES.ink, pull: 6 },
  { a0: -10, a1: 80, tone: TONES.lime, pull: 30, lift: 14 },
]

function Glow({ id, cx, cy, color = '#FFFFFF' }: { id: string; cx: string; cy: string; color?: string }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r="70%">
      <stop offset="0" stopColor={color} stopOpacity="1" />
      <stop offset="1" stopColor={color} stopOpacity="0" />
    </radialGradient>
  )
}

/* ---------- Two images in "The Split" (480 x 270) ---------- */

export function SplitSharesArt({ chip, className }: { chip: string; className?: string }) {
  const P = projector(330, 236, 0.95)
  return (
    <svg viewBox="0 0 480 270" className={className} role="img" aria-label="Shares fixed on-chain">
      <defs>
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7F8F4" />
          <stop offset="1" stopColor="#E7EBE1" />
        </linearGradient>
        <Glow id="ss-glow" cx="72%" cy="88%" color="#E3F7B5" />
      </defs>
      <rect width="480" height="270" rx="8" fill="url(#ss-bg)" />
      <rect width="480" height="270" rx="8" fill="url(#ss-glow)" opacity="0.8" />
      {[150, 200, 250].map((R) => (
        <path key={R} d={ring(P, R, 0)} fill="none" stroke="#D3D9CB" strokeWidth="1" />
      ))}
      <Shapes items={splitCoin(P, { r: 120, z: 0, h: 26, slices: THREE })} />
      <Pill x={240} y={88} text={chip} size={12} />
    </svg>
  )
}

export function SplitUsdArt({ chip, className }: { chip: string; className?: string }) {
  const P = projector(150, 220, 0.9)
  const bills = [0, 1, 2].flatMap((i) => slab(P, -110, -70, 110, 70, i * 22, i * 22 + 12, i === 2 ? TONES.green : TONES.white))
  return (
    <svg viewBox="0 0 480 270" className={className} role="img" aria-label="Fees paid out in US dollars">
      <defs>
        <linearGradient id="su-bg" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F8F4" />
          <stop offset="1" stopColor="#E4E9DF" />
        </linearGradient>
        <Glow id="su-glow" cx="25%" cy="85%" color="#D3F1DF" />
      </defs>
      <rect width="480" height="270" rx="8" fill="url(#su-bg)" />
      <rect width="480" height="270" rx="8" fill="url(#su-glow)" opacity="0.9" />
      <Shapes items={bills} />
      <text x={P(0, 0, 56)[0]} y={P(0, 0, 56)[1] + 8} textAnchor="middle" fontFamily="'Mozilla Text', sans-serif" fontWeight="600" fontSize="30" fill="#F4F5F1" transform={`rotate(-30 ${P(0, 0, 56)[0]} ${P(0, 0, 56)[1]})`}>
        $
      </text>
      {[
        [330, 200],
        [390, 150],
        [430, 96],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={14 - i * 2} fill="#FFFFFF" stroke="#CFD5C8" />
          <text x={x} y={y + 4} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={11 - i} fill="#1F8A4C">
            $
          </text>
        </g>
      ))}
      <path d="M262 214C300 214 312 204 330 200M344 192C362 178 372 164 390 150M402 140C414 124 420 112 430 96" fill="none" stroke="#9AA191" strokeDasharray="3 4" />
      <Pill x={240} y={88} text={chip} size={12} />
    </svg>
  )
}

/* ---------- "The payout promise" visual (812 x 460, sits on the section floor) ---------- */

export function PromiseArt({ className }: { className?: string }) {
  const P = projector(406, 330, 1)
  const slices: Slice[] = [
    { a0: 80, a1: 224, tone: TONES.white, pull: 3 },
    { a0: 224, a1: 350, tone: TONES.ink, pull: 3 },
    { a0: -10, a1: 80, tone: TONES.lime, pull: 3 },
  ]
  return (
    <svg viewBox="0 0 812 460" className={className} role="img" aria-label="Every share reassembled into one paid coin">
      <defs>
        <Glow id="pr-glow" cx="50%" cy="40%" color="#FFFFFF" />
        <filter id="pr-blur">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
      <ellipse cx="406" cy="220" rx="400" ry="230" fill="url(#pr-glow)" />
      <ellipse cx="420" cy="460" rx="330" ry="60" fill="#B9C1AF" opacity="0.4" filter="url(#pr-blur)" />
      <Shapes items={cylinder(P, { r: 250, z: -160, h: 150, tone: TONES.paper })} />
      <path d={ring(P, 228, -10)} fill="none" stroke="#D2D8CA" />
      <Shapes items={splitCoin(P, { r: 170, z: 4, h: 40, slices })} />
      {/* payout trails rising from each share */}
      {[
        ['M300 170C280 120 250 90 200 70', [200, 70]],
        ['M470 150C500 100 540 70 600 52', [600, 52]],
        ['M404 120C404 80 410 50 420 24', [420, 24]],
      ].map(([d, [x, y]], i) => (
        <g key={i}>
          <path d={d as string} fill="none" stroke="#9AA191" strokeDasharray="3 5" />
          <circle cx={x as number} cy={y as number} r="15" fill="#FFFFFF" stroke="#CFD5C8" />
          <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill="#1F8A4C">
            $
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ---------- How-it-works step icons (48 x 48, two greys like the reference set) ---------- */

const G1 = '#A3A89C'
const G2 = '#CDD1C6'

export function StepIcon({ name, className }: { name: 'draft' | 'handles' | 'sign' | 'lock' | 'trade' | 'payout'; className?: string }) {
  const body = {
    draft: (
      <>
        <path d="M12 6h17l9 9v27H12z" fill={G2} />
        <path d="M29 6v9h9" fill={G1} />
        <rect x="17" y="22" width="16" height="3" rx="1.5" fill={G1} />
        <rect x="17" y="29" width="11" height="3" rx="1.5" fill={G1} />
      </>
    ),
    handles: (
      <>
        <circle cx="24" cy="24" r="17" fill={G2} />
        <path d="M18 9.6 24 24 37.7 18.8A17 17 0 0 0 18 9.6Z" fill={G1} />
        <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
        <circle cx="24" cy="24" r="2.2" fill={G1} />
      </>
    ),
    sign: (
      <>
        <path d="M30 8l10 10-17 17-12 3 3-12z" fill={G2} />
        <path d="M14 26l8 8-11 4z" fill={G1} />
        <rect x="8" y="41" width="32" height="3" rx="1.5" fill={G1} />
      </>
    ),
    lock: (
      <>
        <path d="M16 22v-6a8 8 0 0 1 16 0v6" fill="none" stroke={G1} strokeWidth="4" />
        <rect x="10" y="21" width="28" height="21" rx="4" fill={G2} />
        <path d="M24 26v11a5.5 5.5 0 0 0 5.5-5.5H24z" fill={G1} />
      </>
    ),
    trade: (
      <>
        <rect x="8" y="26" width="7" height="14" rx="1.5" fill={G2} />
        <rect x="19" y="18" width="7" height="22" rx="1.5" fill={G1} />
        <rect x="30" y="10" width="7" height="30" rx="1.5" fill={G2} />
        <rect x="6" y="41" width="36" height="3" rx="1.5" fill={G1} />
      </>
    ),
    payout: (
      <>
        <circle cx="20" cy="26" r="14" fill={G2} />
        <path d="M23 19.5c-1-1-2.4-1.5-3.8-1.5-2.3 0-3.7 1.2-3.7 2.9 0 4.1 7.6 2.3 7.6 6.3 0 1.8-1.6 3-3.9 3-1.6 0-3.1-.6-4.2-1.7M19.2 15.5v3m0 12v3" fill="none" stroke={G1} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M32 8h9v9M41 8 31 18" fill="none" stroke={G1} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  }[name]
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {body}
    </svg>
  )
}

/* ---------- Note banners (968 x 516) ---------- */

export function NoteArt({ kind, className }: { kind: 'shares' | 'dollars'; className?: string }) {
  if (kind === 'shares') {
    const P = projector(690, 300, 1.15)
    const steps = [
      [560, 120, '1 create_v2'],
      [835, 140, '2 sharing config'],
      [870, 430, '3 lock shares'],
      [530, 455, '4 distribute'],
    ] as const
    return (
      <svg viewBox="0 0 968 516" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="The four fee sharing steps around a split coin">
        <rect width="968" height="516" fill="#F4F5F1" />
        {[170, 230, 290].map((R) => (
          <path key={R} d={ring(P, R, 0)} fill="none" stroke="#DCE1D5" />
        ))}
        <Shapes items={splitCoin(P, { r: 140, z: 0, h: 30, slices: THREE })} />
        {steps.map(([x, y, t]) => (
          <Pill key={t} x={x} y={y} text={t} size={15} />
        ))}
        <text x="72" y="220" fontFamily="'Mozilla Text', sans-serif" fontWeight="600" fontSize="54" fill="#17181A">
          Fee sharing,
        </text>
        <text x="72" y="284" fontFamily="'Mozilla Text', sans-serif" fontWeight="600" fontSize="54" fill="#17181A">
          step by step
        </text>
        <text x="74" y="340" fontFamily="'JetBrains Mono', monospace" fontSize="18" fill="#73766E">
          PUMP FEES PROGRAM
        </text>
      </svg>
    )
  }
  const P = projector(720, 330, 1.1)
  return (
    <svg viewBox="0 0 968 516" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label="A dollar coin rising from the desk">
      <defs>
        <Glow id="nd-glow" cx="74%" cy="50%" color="#3B5A12" />
      </defs>
      <rect width="968" height="516" fill="#17181A" />
      <rect width="968" height="516" fill="url(#nd-glow)" opacity="0.6" />
      <Shapes items={slab(P, -170, -170, 170, 170, -24, 0, TONES.ink)} />
      <path d={ring(P, 150, 0)} fill="none" stroke="#3A3D41" />
      <Shapes items={cylinder(P, { r: 120, z: 30, h: 34, tone: TONES.lime })} />
      <text x={P(0, 0, 64)[0]} y={P(0, 0, 64)[1] + 14} textAnchor="middle" fontFamily="'Mozilla Text', sans-serif" fontWeight="700" fontSize="58" fill="#2E4A06">
        $
      </text>
      <path d={line([P(0, 0, 10), P(0, 0, 30)])} stroke="#B6F03C" strokeDasharray="2 4" />
      <text x="72" y="220" fontFamily="'Mozilla Text', sans-serif" fontWeight="600" fontSize="54" fill="#F4F5F1">
        Paid in dollars,
      </text>
      <text x="72" y="284" fontFamily="'Mozilla Text', sans-serif" fontWeight="600" fontSize="54" fill="#F4F5F1">
        claimed on X
      </text>
      <text x="74" y="340" fontFamily="'JetBrains Mono', monospace" fontSize="18" fill="#B6F03C">
        USDC TO X MONEY
      </text>
    </svg>
  )
}

/* ---------- Desk menu tiles (344 x 140) ---------- */

export function MenuArt({ kind, className }: { kind: 'launch' | 'split' | 'sweep' | 'payout'; className?: string }) {
  const P = projector(172, 92, 0.42)
  let scene: React.ReactNode
  if (kind === 'launch') {
    scene = (
      <>
        <Shapes items={slab(P, -140, -140, 140, 140, -18, 0, TONES.white)} />
        <path d={line([P(0, 0, 10), P(0, 0, 120)])} stroke="#9AA191" strokeDasharray="3 4" />
        <Shapes items={cylinder(P, { r: 70, z: 120, h: 22, tone: TONES.lime })} />
      </>
    )
  } else if (kind === 'split') {
    scene = <Shapes items={splitCoin(P, { r: 120, z: 0, h: 30, slices: THREE })} />
  } else if (kind === 'sweep') {
    scene = (
      <>
        <Shapes items={slab(P, -90, -90, 90, 90, 0, 110, TONES.paper)} />
        {[-1, 1].map((k) => (
          <path key={k} d={`M${P(k * 260, -k * 40, 60)[0]} ${P(k * 260, -k * 40, 60)[1]}L${P(k * 120, -k * 20, 60)[0]} ${P(k * 120, -k * 20, 60)[1]}`} stroke="#9AA191" strokeWidth="2" strokeDasharray="4 4" />
        ))}
        <Shapes items={cylinder(P, { r: 40, z: 110, h: 14, tone: TONES.lime })} />
      </>
    )
  } else {
    scene = (
      <>
        <Shapes items={cylinder(P, { r: 120, z: 0, h: 30, tone: TONES.green })} />
        <text x={P(0, 0, 30)[0]} y={P(0, 0, 30)[1] + 9} textAnchor="middle" fontFamily="'Mozilla Text', sans-serif" fontWeight="700" fontSize="26" fill="#E9F9EF">
          $
        </text>
      </>
    )
  }
  return (
    <svg viewBox="0 0 344 140" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${kind} illustration`}>
      <defs>
        <linearGradient id={`ma-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F5F1" />
          <stop offset="1" stopColor="#E6EAE0" />
        </linearGradient>
      </defs>
      <rect width="344" height="140" fill={`url(#ma-${kind})`} />
      {scene}
    </svg>
  )
}
