#!/usr/bin/env node
// ============================================================
// サイト掲載用バナーを既存の生成アセットから合成する。
//   背景: 施設の遠景(f_facility) を少しぼかす
//   主役: ヒーロー立ち絵(hero) をくっきり配置
//   文字: 「WUL ケアクエスト」＋説明文を SVG でくっきり合成
//   ロゴ: フクロウのマスコット(logo.png)
// 出力: public/banner-wide.(png|webp)  … 横長ヒーロー 1536x1024
//       public/banner-ogp.(png|webp)   … OGP/SNS      1200x630
//   node scripts/make-banner.mjs
// ============================================================

import sharp from 'sharp'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...a) => join(ROOT, ...a)

const BG = p('public/assets/floors/f_facility.webp') // 720x1080
const HERO = p('public/assets/characters/hero.png') // 512x512 (中身 223x512)
const OWL = p('logo.png') // 273x265
const TITLE = 'ケアクエスト'
const TAGLINE = 'デジタルスキルで介護現場を救うRPG'

// 背景を width=W に合わせて拡大し、建物が中央にくる縦位置で H 分だけ切り出す
const background = async (W, H) => {
  const src = sharp(BG)
  const { width: sw, height: sh } = await src.metadata()
  const scaledH = Math.round((sh * W) / sw)
  // 建物の中心はソース高さの約52%。そこをバナーの縦中央あたりに置く
  let top = Math.round(0.52 * scaledH - H / 2)
  top = Math.max(0, Math.min(top, scaledH - H))
  return sharp(BG)
    .resize({ width: W, height: scaledH })
    .extract({ left: 0, top, width: W, height: H })
    .blur(3)
    .modulate({ brightness: 0.92, saturation: 1.05 })
    .toBuffer()
}

// 立ち絵を指定した高さに拡大（中身は縦フル 512 なので、足元は下端）
const heroLayer = async (h) => {
  const buf = await sharp(HERO).resize({ height: h }).toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

const owlLayer = async (h) => {
  const buf = await sharp(OWL).resize({ height: h }).toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

// 左の暗がり(文字用スクリム)＋下の影＋足元の設置影
const scrimSvg = (W, H, feetX, feetY, shadowRx) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#0b1e39" stop-opacity="0.88"/>
      <stop offset="0.40" stop-color="#0b1e39" stop-opacity="0.42"/>
      <stop offset="0.64" stop-color="#0b1e39" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#0b1e39" stop-opacity="0"/>
      <stop offset="1"    stop-color="#0b1e39" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#l)"/>
  <rect width="${W}" height="${H}" fill="url(#b)"/>
  <ellipse cx="${feetX}" cy="${feetY}" rx="${shadowRx}" ry="${Math.round(shadowRx * 0.18)}" fill="#000" opacity="0.34" filter="url(#soft)"/>
</svg>`

// タイトル文字（くっきり・ドロップシャドウ付き）
const textSvg = (W, H, { tx, titleY, titleSize, tagY, tagSize, badgeX, badgeY }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#04122b" flood-opacity="0.65"/>
    </filter>
  </defs>
  <g font-family="'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif" filter="url(#ds)">
    <text x="${tx}" y="${titleY}" font-size="${titleSize}" font-weight="800" fill="#ffffff" letter-spacing="1">
      <tspan fill="#ffd257" font-style="italic">WUL</tspan><tspan dx="${Math.round(titleSize * 0.14)}">${TITLE}</tspan>
    </text>
    <text x="${tx + 4}" y="${tagY}" font-size="${tagSize}" font-weight="600" fill="#eaf3ff" letter-spacing="1">${TAGLINE}</text>
    <g transform="translate(${badgeX},${badgeY})">
      <rect x="0" y="0" rx="${Math.round(tagSize * 0.55)}" ry="${Math.round(tagSize * 0.55)}"
            width="${Math.round(tagSize * 12.6)}" height="${Math.round(tagSize * 1.9)}"
            fill="#1f6feb" opacity="0.95"/>
      <text x="${Math.round(tagSize * 0.75)}" y="${Math.round(tagSize * 1.32)}" font-size="${Math.round(tagSize * 0.92)}" font-weight="700" fill="#ffffff" letter-spacing="1">ブラウザでいますぐプレイ</text>
    </g>
  </g>
</svg>`

const makeBanner = async (cfg) => {
  const { W, H, lx, owlH, gap, titleY, titleSize, tagYoff, tagSize, heroH, heroCenterX, feetBottom, out } = cfg

  const bg = await background(W, H)
  const owl = await owlLayer(owlH)
  const hero = await heroLayer(heroH)

  const tx = lx + owl.width + gap
  const feetY = H - feetBottom
  const heroTop = feetY - hero.height + Math.round(hero.height * 0.02) // 足元を接地影に少し重ねる
  const heroLeft = Math.round(heroCenterX - hero.width / 2)
  // ロゴ(フクロウ)はタイトル行の左に、上下中央を合わせる
  const owlTop = Math.round(titleY - titleSize * 0.72)

  const scrim = Buffer.from(scrimSvg(W, H, heroCenterX, feetY, Math.round(heroH * 0.22)))
  const text = Buffer.from(
    textSvg(W, H, {
      tx,
      titleY,
      titleSize,
      tagY: titleY + tagYoff,
      tagSize,
      badgeX: tx + 2,
      badgeY: titleY + tagYoff + Math.round(tagSize * 0.9),
    }),
  )

  const png = await sharp(bg)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: hero.buf, top: heroTop, left: heroLeft },
      { input: owl.buf, top: owlTop, left: lx },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()

  await sharp(png).png({ quality: 92 }).toFile(p('public', `${out}.png`))
  await sharp(png).webp({ quality: 88 }).toFile(p('public', `${out}.webp`))
  const kb = (b) => Math.round(b.length / 1024)
  console.log(`✓ ${out}  ${W}x${H}  png ${kb(png)}KB`)
}

// 横長ヒーローバナー
await makeBanner({
  W: 1536, H: 1024,
  lx: 100, owlH: 156, gap: 26,
  titleY: 486, titleSize: 96, tagYoff: 62, tagSize: 40,
  heroH: 880, heroCenterX: 1170, feetBottom: 26,
  out: 'banner-wide',
})

// OGP / SNS
await makeBanner({
  W: 1200, H: 630,
  lx: 74, owlH: 118, gap: 20,
  titleY: 300, titleSize: 68, tagYoff: 46, tagSize: 29,
  heroH: 540, heroCenterX: 980, feetBottom: 16,
  out: 'banner-ogp',
})

console.log('完了: public/banner-wide.*  public/banner-ogp.*')
