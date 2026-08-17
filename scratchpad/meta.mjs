import sharp from 'sharp'
const files = [
  'public/assets/floors/f_facility.webp',
  'public/assets/floors/f_reception.webp',
  'public/assets/characters/hero.png',
  'logo.png',
  'public/assets/weapons/w_chatgpt.png',
  'public/assets/charms/c_wul.png',
]
for (const f of files) {
  const img = sharp('/Users/staniguchi/wul-care-rpg/' + f)
  const m = await img.metadata()
  let bbox = null
  try {
    const { info } = await img.clone().trim({ threshold: 10 }).toBuffer({ resolveWithObject: true })
    bbox = `trimmed→ ${info.width}x${info.height}`
  } catch (e) { bbox = 'trim n/a' }
  console.log(`${f}\n  ${m.width}x${m.height} ${m.format} alpha=${m.hasAlpha}  ${bbox}`)
}
