import sharp from 'sharp'
const files = [
  'public/ChatGPT Image 2026年8月17日 12_10_00 (1).png',
  'public/ChatGPT Image 2026年8月17日 12_10_01 (2).png',
]
for (const f of files) {
  const { data, info } = await sharp('/Users/staniguchi/wul-care-rpg/' + f)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, ch = info.channels
  const at = (x, y) => {
    const i = (y * W + x) * ch
    return [data[i], data[i + 1], data[i + 2]]
  }
  const pts = {
    'TL corner': at(5, 5),
    'TR corner': at(W - 6, 5),
    'BL corner': at(5, H - 6),
    'BR corner': at(W - 6, H - 6),
    'mid-left edge': at(5, H >> 1),
    'bottom shadow ~': at(W >> 1, H - 90),
  }
  console.log('\n=== ' + f + ' (' + W + 'x' + H + ') ===')
  for (const [k, v] of Object.entries(pts)) console.log(k.padEnd(16), 'rgb(' + v.join(',') + ')')
}
