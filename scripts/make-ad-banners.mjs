#!/usr/bin/env node
// ============================================================
// 広告サイズのバナー2枚を、1枚目と同じデザインで作る。
//   300x250 … PC版（レクタングル）
//   320x50  … スマホ版（モバイルバナー）
// 共通トークン: 施設背景を軽くぼかす / 金の「WUL」＋白タイトル / 青CTA / フクロウ / 説明文
// 出力: public/banner-300x250.(png|webp)  public/banner-320x50.(png|webp)
//   node scripts/make-ad-banners.mjs
// ============================================================

import sharp from 'sharp'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...a) => join(ROOT, ...a)

const BG = p('public/assets/floors/f_facility.webp')
const HERO = p('public/assets/characters/hero.png')
const OWL = p('logo.png')
const FONT = "'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif"

// 背景を width=W に合わせ、建物中心が縦中央付近にくるよう H 分だけ切り出してぼかす
const background = async (W, H, blur) => {
  const { width: sw, height: sh } = await sharp(BG).metadata()
  const scaledH = Math.round((sh * W) / sw)
  let top = Math.round(0.5 * scaledH - H / 2)
  top = Math.max(0, Math.min(top, scaledH - H))
  return sharp(BG)
    .resize({ width: W, height: scaledH })
    .extract({ left: 0, top, width: W, height: H })
    .blur(blur)
    .modulate({ brightness: 0.9, saturation: 1.05 })
    .toBuffer()
}

const layer = async (file, h) => {
  const buf = await sharp(file).resize({ height: h }).toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

// ---------- 300x250（PCレクタングル） ----------
const make300 = async () => {
  const W = 300, H = 250
  const bg = await background(W, H, 2)
  const owl = await layer(OWL, 44)
  const hero = await layer(HERO, 182)

  const feetY = H - 6
  const heroCenterX = 232
  const heroLeft = Math.round(heroCenterX - hero.width / 2)
  const heroTop = feetY - hero.height + 4

  const scrim = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0b1e39" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#0b1e39" stop-opacity="0.5"/>
      <stop offset="0.8" stop-color="#0b1e39" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1e39" stop-opacity="0.5"/>
      <stop offset="0.35" stop-color="#0b1e39" stop-opacity="0"/>
      <stop offset="1" stop-color="#0b1e39" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="s"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#l)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <ellipse cx="${heroCenterX}" cy="${feetY}" rx="52" ry="10" fill="#000" opacity="0.35" filter="url(#s)"/>
</svg>`)

  const text = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="ds" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#04122b" flood-opacity="0.75"/>
    </filter>
  </defs>
  <g font-family="${FONT}" filter="url(#ds)">
    <text x="64" y="42" font-size="23" font-weight="800" fill="#ffffff">
      <tspan fill="#ffd257" font-style="italic">WUL</tspan><tspan dx="4">ケアクエスト</tspan>
    </text>
    <text x="16" y="112" font-size="15.5" font-weight="700" fill="#eaf3ff">ITスキルを武器に、</text>
    <text x="16" y="135" font-size="15.5" font-weight="700" fill="#eaf3ff">介護現場の困りごとを</text>
    <text x="16" y="158" font-size="15.5" font-weight="700" fill="#eaf3ff">解決していくRPG。</text>
    <g transform="translate(16,196)">
      <rect x="0" y="0" rx="17" ry="17" width="150" height="34" fill="#1f6feb"/>
      <text x="16" y="23" font-size="15" font-weight="800" fill="#ffffff">▶ 今すぐプレイ</text>
    </g>
  </g>
</svg>`)

  const buf = await sharp(bg)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: hero.buf, top: heroTop, left: heroLeft },
      { input: owl.buf, top: 14, left: 14 },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()
  await sharp(buf).png().toFile(p('public/banner-300x250.png'))
  await sharp(buf).webp({ quality: 90 }).toFile(p('public/banner-300x250.webp'))
  console.log('✓ banner-300x250')
}

// ---------- 320x50（スマホ） ----------
const make320 = async () => {
  const W = 320, H = 50
  const bg = await background(W, H, 3)
  const owl = await layer(OWL, 40)

  const scrim = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0b1e39" opacity="0.6"/>
  <rect width="${W}" height="${H}" fill="#0b1e39" opacity="0.0"/>
</svg>`)

  const text = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="ds" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#04122b" flood-opacity="0.8"/>
    </filter>
  </defs>
  <g font-family="${FONT}" filter="url(#ds)">
    <text x="52" y="24" font-size="17" font-weight="800" fill="#ffffff">
      <tspan fill="#ffd257" font-style="italic">WUL</tspan><tspan dx="3">ケアクエスト</tspan>
    </text>
    <text x="53" y="40" font-size="10.5" font-weight="600" fill="#dbe8ff">ITスキルで介護現場を救うRPG</text>
    <g transform="translate(246,9)">
      <rect x="0" y="0" rx="16" ry="16" width="62" height="32" fill="#1f6feb"/>
      <text x="10" y="21" font-size="13" font-weight="800" fill="#ffffff">プレイ▶</text>
    </g>
  </g>
</svg>`)

  const buf = await sharp(bg)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: owl.buf, top: Math.round((H - owl.height) / 2), left: 8 },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()
  await sharp(buf).png().toFile(p('public/banner-320x50.png'))
  await sharp(buf).webp({ quality: 90 }).toFile(p('public/banner-320x50.webp'))
  console.log('✓ banner-320x50')
}

await make300()
await make320()
console.log('完了: public/banner-300x250.*  public/banner-320x50.*')
