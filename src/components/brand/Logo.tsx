import { LOGO_VIEWBOX, MARK_VIEWBOX, MARK_WEDGES, WORDMARK_PATH, WORDMARK_TRANSFORM } from './logoData'

const INK = '#17181A'
const PAPER = '#F4F5F1'
const ACCENT = '#B6F03C'

/** Splitdesk lockup: split-coin mark + outlined wordmark, one SVG. */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const ink = inverted ? PAPER : INK
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label="Splitdesk">
      {MARK_WEDGES.map((w) => (
        <path key={w.d} d={w.d} fill={w.role === 'accent' ? ACCENT : ink} />
      ))}
      <path transform={WORDMARK_TRANSFORM} d={WORDMARK_PATH} fill={ink} />
    </svg>
  )
}

export function LogoMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const ink = inverted ? PAPER : INK
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} aria-hidden="true">
      {MARK_WEDGES.map((w) => (
        <path key={w.d} d={w.d} fill={w.role === 'accent' ? ACCENT : ink} />
      ))}
    </svg>
  )
}
