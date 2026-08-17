import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = '/Users/staniguchi/wul-care-rpg/public/assets/monsters'
const files = readdirSync(DIR).filter((f) => f.endsWith('.png')).sort()
const cell = 150, cols = 6, pad = 6
const rows = Math.ceil(files.length / cols)
const W = cols * cell, H = rows * cell

const composites = []
for (let i = 0; i < files.length; i++) {
  const buf = await sharp(join(DIR, files[i]))
    .resize({ width: cell - pad * 2, height: cell - pad * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  const x = (i % cols) * cell + pad
  const y = Math.floor(i / cols) * cell + pad
  composites.push({ input: buf, top: y, left: x })
  // ラベル
  const label = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="18"><text x="${cell / 2}" y="14" font-family="sans-serif" font-size="13" font-weight="700" fill="#111" text-anchor="middle">${files[i].replace('.png', '')}</text></svg>`,
  )
  composites.push({ input: label, top: Math.floor(i / cols) * cell + cell - 18, left: (i % cols) * cell })
}

await sharp({ create: { width: W, height: H, channels: 3, background: '#e8eef5' } })
  .composite(composites)
  .png()
  .toFile('/private/tmp/claude-502/-Users-staniguchi-wul-care-rpg/28657d96-570b-4c60-923d-9cbcfdc00539/scratchpad/monsters-grid.png')
console.log('done', files.length, 'monsters', W, 'x', H)
