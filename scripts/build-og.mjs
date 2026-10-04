// Builds the social share image and PNG app icons from the brand sources.
// Outputs: public/og-image.png (1200x630), public/apple-touch-icon.png (180),
//          public/icon-192.png, public/icon-512.png
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const font = (w) => opentype.parse(fs.readFileSync(path.join(root, `node_modules/@fontsource/mozilla-text/files/mozilla-text-latin-${w}-normal.woff`)).buffer.slice(0))
const mono = opentype.parse(fs.readFileSync(path.join(root, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff')).buffer.slice(0))

const INK = '#17181A'
const PAPER = '#EDF0E8'
const MUTED = '#73766E'

/** Text outlined to a path, so the PNG never depends on installed fonts. */
function text(f, str, x, y, size, fill, tracking = 0) {
  let cx = x
  const parts = []
  for (const g of f.stringToGlyphs(str)) {
    // opentype.js can emit NaN for some fractional offsets, so each glyph is outlined at the
    // origin and placed with a transform instead
    const d = g.getPath(0, 0, size).toPathData(2)
    if (d && !d.includes('NaN')) parts.push(`<path transform="translate(${cx.toFixed(2)} ${y})" d="${d}"/>`)
    cx += (g.advanceWidth / f.unitsPerEm) * size + tracking
  }
  return `<g fill="${fill}">${parts.join('')}</g>`
}

// Lockup and mark straight from the generated brand files
const lockup = fs.readFileSync(path.join(root, 'public/brand/logo.svg'), 'utf8')
const lockupInner = lockup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<title>.*?<\/title>/, '')
const favicon = fs.readFileSync(path.join(root, 'public/favicon.svg'), 'utf8')
const markInner = favicon
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>$/, '')
  .replace(/<style>.*?<\/style>/, '')
  .replaceAll('class="i"', `fill="${INK}"`)

const f500 = font(500)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <g transform="translate(860 150) scale(8.2)" opacity="0.95">${markInner}</g>
  <g transform="translate(80 72) scale(1.45)">${lockupInner}</g>
  ${text(f500, 'Launch it. Split it.', 80, 330, 84, INK, -1)}
  ${text(f500, 'Get paid on X.', 80, 424, 84, INK, -1)}
  <rect x="80" y="474" width="1040" height="1" fill="#DFE2D9"/>
  ${text(font(400), 'Creator fees split across X accounts, paid out in USD.', 80, 530, 30, MUTED)}
  ${text(mono, 'SPLITDESK.FUN', 80, 578, 22, INK, 2)}
</svg>`

const render = (svg, w) => new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng()
fs.writeFileSync(path.join(root, 'public/og-image.png'), render(og, 1200))

// Square icons: the mark centred on the brand background, ~16% padding
const icon = (size) =>
  render(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40"><rect width="40" height="40" fill="${PAPER}"/><g transform="translate(6.4 6.4) scale(0.68)">${markInner}</g></svg>`,
    size,
  )
fs.writeFileSync(path.join(root, 'public/apple-touch-icon.png'), icon(180))
fs.writeFileSync(path.join(root, 'public/icon-192.png'), icon(192))
fs.writeFileSync(path.join(root, 'public/icon-512.png'), icon(512))
console.log('og + icons built')
