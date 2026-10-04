import type { Shape } from './iso'

export function Shapes({ items, strokeWidth = 0.6 }: { items: Shape[]; strokeWidth?: number }) {
  return (
    <>
      {items.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={s.stroke ? strokeWidth : undefined}
          strokeLinejoin="round"
          opacity={s.opacity}
        />
      ))}
    </>
  )
}

/** A rounded label pill drawn in SVG (same look as the HTML chips). */
export function Pill({
  x,
  y,
  text,
  dark = false,
  size = 14,
  dot,
}: {
  x: number
  y: number
  text: string
  dark?: boolean
  size?: number
  dot?: string
}) {
  const w = text.length * size * 0.6 + size * 1.8 + (dot ? size : 0)
  const h = size * 2.1
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect width={w} height={h} rx={h / 2} fill={dark ? '#17181A' : '#FFFFFF'} stroke={dark ? '#17181A' : '#DFE2D9'} />
      {dot && <circle cx={size * 1.15} cy={h / 2} r={size * 0.32} fill={dot} />}
      <text
        x={(dot ? size * 0.5 : 0) + w / 2}
        y={h / 2 + size * 0.36}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize={size}
        fill={dark ? '#F4F5F1' : '#17181A'}
      >
        {text}
      </text>
    </g>
  )
}
