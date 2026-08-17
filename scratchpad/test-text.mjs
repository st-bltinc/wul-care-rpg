// sharp で日本語テキストがきれいに描けるか検証する（Pango text と SVG text 両方）
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const OUT = '/private/tmp/claude-502/-Users-staniguchi-wul-care-rpg/28657d96-570b-4c60-923d-9cbcfdc00539/scratchpad'

// 1) sharp の Pango text 機能
try {
  const png = await sharp({
    text: {
      text: '<span foreground="white">WUL ケアクエスト</span>',
      font: 'Hiragino Sans',
      rgba: true,
      width: 900,
      height: 200,
      align: 'left',
    },
  }).png().toBuffer()
  const bg = await sharp({ create: { width: 900, height: 200, channels: 3, background: '#1f6feb' } }).png().toBuffer()
  await sharp(bg).composite([{ input: png, top: 20, left: 20 }]).png().toFile(`${OUT}/text-pango.png`)
  console.log('PANGO OK')
} catch (e) {
  console.log('PANGO FAIL:', e.message)
}

// 2) SVG text 経由
try {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="200">
    <rect width="900" height="200" fill="#1f6feb"/>
    <text x="20" y="130" font-family="Hiragino Sans, sans-serif" font-size="90" font-weight="800" fill="white">WUL ケアクエスト</text>
  </svg>`
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/text-svg.png`)
  console.log('SVG OK')
} catch (e) {
  console.log('SVG FAIL:', e.message)
}

// フォント一覧（利用可能なら）
console.log('sharp', sharp.versions)
