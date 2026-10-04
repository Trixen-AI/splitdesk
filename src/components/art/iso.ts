// Tiny isometric toolkit shared by every Splitdesk illustration.
// World: x runs down-right, y runs down-left, z is up. The viewer looks from +x+y.

export const COS30 = Math.cos(Math.PI / 6)
const r = (n: number) => Math.round(n * 10) / 10

export type Pt = [number, number]
export type Shape = { d: string; fill: string; stroke?: string; opacity?: number }

export function projector(cx: number, cy: number, s = 1) {
  return (x: number, y: number, z = 0): Pt => [cx + (x - y) * COS30 * s, cy + (x + y) * 0.5 * s - z * s]
}
export type Project = ReturnType<typeof projector>

export const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`
export const line = (pts: Pt[]) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`

function hex(c: string) {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export function mix(a: string, b: string, t: number) {
  const A = hex(a)
  const B = hex(b)
  const k = Math.max(0, Math.min(1, t))
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`
}

export type Tone = { top: string; lit: string; shade: string }
export const TONES = {
  white: { top: '#FFFFFF', lit: '#EEF1EA', shade: '#CBD1C4' },
  paper: { top: '#F7F8F4', lit: '#E6EAE0', shade: '#C4CABC' },
  ink: { top: '#2A2C2F', lit: '#1C1D1F', shade: '#0E0F10' },
  lime: { top: '#C9F56A', lit: '#A9DE3A', shade: '#7FB51A' },
  green: { top: '#3FB774', lit: '#24955A', shade: '#176D40' },
} satisfies Record<string, Tone>

// Side colour from the face normal: faces turned towards +x catch the light.
function sideFill(t: Tone, nx: number, ny: number) {
  const k = (nx - ny + Math.SQRT2) / (2 * Math.SQRT2)
  return mix(t.shade, t.lit, k)
}

/** A slab (box) between two corners. Returns faces in paint order. */
export function slab(P: Project, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, t: Tone): Shape[] {
  return [
    { d: poly([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)]), fill: sideFill(t, 1, 0) },
    { d: poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]), fill: sideFill(t, 0, 1) },
    { d: poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]), fill: t.top },
  ]
}

const rad = (a: number) => (a * Math.PI) / 180

/** An extruded pie wedge (angles in degrees), optionally pulled out along its bisector. */
export function wedge(
  P: Project,
  o: { cx?: number; cy?: number; r: number; a0: number; a1: number; z: number; h: number; pull?: number; tone: Tone },
): Shape[] {
  const { r: R, a0, a1, z, h, tone } = o
  const mid = rad((a0 + a1) / 2)
  const pull = o.pull ?? 0
  const cx = (o.cx ?? 0) + Math.cos(mid) * pull
  const cy = (o.cy ?? 0) + Math.sin(mid) * pull
  const steps = Math.max(2, Math.ceil((a1 - a0) / 5))
  const arc: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / steps)
    arc.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R])
  }
  const outline: [number, number][] = [[cx, cy], ...arc]
  const faces: Shape[] = []

  // Flat radial cuts: only the ones turned towards the viewer are drawn (back faces are hidden by the solid).
  const radial = (ax: number, ay: number, bx: number, by: number, normalDeg: number) => {
    const nx = Math.cos(rad(normalDeg))
    const ny = Math.sin(rad(normalDeg))
    if (nx + ny <= 0) return
    const fill = sideFill(tone, nx, ny)
    faces.push({ d: poly([P(ax, ay, z), P(bx, by, z), P(bx, by, z + h), P(ax, ay, z + h)]), fill, stroke: fill })
  }
  radial(cx, cy, arc[0][0], arc[0][1], a0 - 90)
  radial(arc[arc.length - 1][0], arc[arc.length - 1][1], cx, cy, a1 + 90)

  // Curved wall: the visible run of the arc as ONE band, so no seams show between segments.
  const vis = arc.filter((_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / steps)
    return Math.cos(a) + Math.sin(a) > -0.02
  })
  if (vis.length > 1) {
    const midA = Math.atan2(vis[Math.floor(vis.length / 2)][1] - cy, vis[Math.floor(vis.length / 2)][0] - cx)
    const fill = sideFill(tone, Math.cos(midA), Math.sin(midA))
    faces.push({
      d: poly([...vis.map(([x, y]) => P(x, y, z)), ...vis.reverse().map(([x, y]) => P(x, y, z + h))]),
      fill,
      stroke: fill,
    })
  }

  return [...faces, { d: poly(outline.map(([x, y]) => P(x, y, z + h))), fill: tone.top, stroke: tone.top }]
}

/** Centre of a wedge's top face, for leader lines and labels. */
export function wedgeTop(P: Project, o: { r: number; a0: number; a1: number; z: number; h: number; pull?: number }) {
  const mid = rad((o.a0 + o.a1) / 2)
  const d = (o.pull ?? 0) + o.r * 0.55
  return P(Math.cos(mid) * d, Math.sin(mid) * d, o.z + o.h)
}

export type Slice = { a0: number; a1: number; tone: Tone; pull?: number; lift?: number }

/** A coin cut into slices, painted back to front. */
export function splitCoin(P: Project, o: { r: number; z: number; h: number; slices: Slice[] }): Shape[] {
  const order = [...o.slices].sort((a, b) => {
    const da = Math.cos(rad((a.a0 + a.a1) / 2)) + Math.sin(rad((a.a0 + a.a1) / 2))
    const db = Math.cos(rad((b.a0 + b.a1) / 2)) + Math.sin(rad((b.a0 + b.a1) / 2))
    return da * (a.pull ?? 0) - db * (b.pull ?? 0) || da - db
  })
  return order.flatMap((s) => wedge(P, { r: o.r, a0: s.a0, a1: s.a1, z: o.z + (s.lift ?? 0), h: o.h, pull: s.pull, tone: s.tone }))
}

/** An upright-axis cylinder (a disc or pedestal). */
export function cylinder(P: Project, o: { r: number; z: number; h: number; tone: Tone; cx?: number; cy?: number }): Shape[] {
  const cx = o.cx ?? 0
  const cy = o.cy ?? 0
  // the half of the wall that faces the viewer (-45..135 degrees), as one band
  const p = (deg: number, z: number) => P(cx + Math.cos(rad(deg)) * o.r, cy + Math.sin(rad(deg)) * o.r, z)
  const degs: number[] = []
  for (let a = -45; a <= 135; a += 4) degs.push(a)
  const fill = sideFill(o.tone, Math.SQRT1_2, Math.SQRT1_2)
  return [
    { d: poly([...degs.map((a) => p(a, o.z)), ...[...degs].reverse().map((a) => p(a, o.z + o.h))]), fill, stroke: fill },
    { d: ring(P, o.r, o.z + o.h, cx, cy), fill: o.tone.top, stroke: o.tone.top },
  ]
}

/** Points of an iso circle at height z (for rings and orbits). */
export function ring(P: Project, R: number, z = 0, cx = 0, cy = 0) {
  const pts: Pt[] = []
  for (let a = 0; a < 360; a += 4) pts.push(P(cx + Math.cos(rad(a)) * R, cy + Math.sin(rad(a)) * R, z))
  return poly(pts)
}
