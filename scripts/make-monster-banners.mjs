#!/usr/bin/env node
// ============================================================
// モンスター入りの広告バナー2枚（webpのみ・高画質）。
//   banner-300x250-m.webp … PC版レクタングル
//   banner-320x50-m.webp  … スマホ版バナー
// 画質: 3倍解像度で合成 → lanczos3 で縮小（スーパーサンプリング）＋ webp q95。
//   node scripts/make-monster-banners.mjs
// ============================================================

import sharp from 'sharp'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...a) => join(ROOT, ...a)
const M = (id) => p('public/assets/monsters', `${id}.png`)
const A = (rel) => p('public/assets', `${rel}.png`) // 例: A('weapons/w_chatgpt')
const BG = p('public/assets/floors/f_facility.webp')
const HERO = p('public/assets/characters/hero.png')
const OWLSHIELD = p('public/owl-shield-1.png') // バナー内アイコン（盾入りマスコット）
const FONT = "'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif"
const BTN = '#ED7C2C' // CTAボタン色

// 合成解像度の倍率。背景元画像(720px)を拡大しないよう全工程ダウンスケールに保つ＝実ディテール最大。
const S = 2
const sx = (v) => Math.round(v * S)

// 黄昏の施設(f_facility)を「朝・明るめ」に色調整したベース（新規生成不可のため補正で朝化）。
// 明るさ↑＋彩度↓で夕焼けの紫/金を弱め、上空に朝の青空グラデーションを重ねる。
let _morning = null
const morningBase = async () => {
  if (_morning) return _morning
  const { width, height } = await sharp(BG).metadata()
  // 朝: 上部は爽やかな水色の空 → 中間はクリーム、右上に黄色い朝日のグロー。全体は明るく。
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="sun" cx="66%" cy="12%" r="58%">
        <stop offset="0"    stop-color="#fff6c2" stop-opacity="0.92"/>
        <stop offset="0.42" stop-color="#ffe58f" stop-opacity="0.42"/>
        <stop offset="1"    stop-color="#ffd86e" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#a9d6ff" stop-opacity="0.82"/>
        <stop offset="0.32" stop-color="#d3ebff" stop-opacity="0.5"/>
        <stop offset="0.56" stop-color="#fff2d6" stop-opacity="0.34"/>
        <stop offset="1"    stop-color="#ffffff" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#sky)"/>
    <rect width="${width}" height="${height}" fill="url(#sun)"/>
    <rect width="${width}" height="${height}" fill="#ffffff" fill-opacity="0.12"/>
  </svg>`)
  _morning = await sharp(BG)
    .modulate({ brightness: 1.5, saturation: 0.85 })
    .composite([{ input: overlay, blend: 'over' }])
    .toBuffer()
  return _morning
}

// 朝ベースを W*S に合わせ、建物中心が縦中央付近にくるよう H*S 分だけ切り出してぼかす
const background = async (W, H, blur, bias = 0.5) => {
  const src = await morningBase()
  const OW = W * S, OH = H * S
  const { width: sw, height: sh } = await sharp(src).metadata()
  const scaledH = Math.round((sh * OW) / sw)
  let top = Math.round(bias * scaledH - OH / 2)
  top = Math.max(0, Math.min(top, scaledH - OH))
  return sharp(src)
    .resize({ width: OW, height: scaledH, kernel: 'lanczos3' })
    .extract({ left: 0, top, width: OW, height: OH })
    .blur(Math.max(0.3, blur * S))
    .modulate({ brightness: 1.06, saturation: 1.02 })
    .toBuffer()
}

// 透明余白を切り落として指定高さ(*S)に拡大
const sprite = async (file, h) => {
  const buf = await sharp(file)
    .trim({ threshold: 6 })
    .resize({ height: sx(h), kernel: 'lanczos3' })
    .toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

// 黒シルエットをぼかして薄くした影（blur は設計値、内部で*S）
const shadowOf = async (spriteBuf, opacity, blur) => {
  const { width, height } = await sharp(spriteBuf).metadata()
  const { data: alpha } = await sharp(spriteBuf)
    .ensureAlpha()
    .extractChannel(3)
    .blur(Math.max(0.3, blur * S))
    .linear(opacity, 0)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const black = await sharp({ create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer()
  return black
}

// 中心(cx,cy 設計座標)にそのまま配置（影・グローなし）。
const place = async (file, h, cx, cy) => {
  const s = await sprite(file, h)
  const left = Math.round(cx * S - s.width / 2)
  const top = Math.round(cy * S - s.height / 2)
  return [{ input: s.buf, left, top }]
}

// アプリアイコン風の角丸アイコン（背景付き画像を正方形に切り、角を丸める）。設計高さ hDesign。
const iconRounded = async (file, hDesign, radiusFrac = 0.22) => {
  const size = sx(hDesign)
  const r = Math.round(size * radiusFrac)
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
  )
  const buf = await sharp(file)
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  return { buf, size }
}

// 設計座標のまま描ける SVG（viewBox で S 倍に拡大レンダリング）
const svg = (W, H, inner) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W * S}" height="${H * S}" viewBox="0 0 ${W} ${H}">${inner}</svg>`,
  )

// 合成バッファを目標サイズへ高品質縮小→アンシャープ→webp(品質100)。サイズは変えず鮮明度だけ上げる。
const finish = async (bigBuf, W, H, name) => {
  const out = async (w, h, suffix) => {
    await sharp(bigBuf)
      .resize({ width: w, height: h, kernel: 'lanczos3' })
      // アンシャープマスク: m1を低く=平面のノイズは持ち上げず、m2を高く=輪郭/文字だけパリッと
      .sharpen({ sigma: 0.7, m1: 0.4, m2: 2.6 })
      .webp({ quality: 100, effort: 6, smartSubsample: true })
      .toFile(p('public', `${name}${suffix}.webp`))
    console.log('✓', `${name}${suffix}.webp`, `(${w}x${h})`)
  }
  await out(W, H, '') // 等倍（表示枠と同じピクセル数のまま高画質化）
  await out(W * 2, H * 2, '@2x') // 高精細ディスプレイ用（任意・枠は同サイズで表示）
}

// ===================== 300x250（PC版） =====================
const make300 = async () => {
  const W = 300, H = 250
  const bg = await background(W, H, 0.4, 0.46)
  const hero = await sprite(HERO, 168)
  const icon = await iconRounded(OWLSHIELD, 44)

  // 困りごと（モンスター）: 大(golem)・中(nosignal)・小(pill)＋haze。大きさ・高さをずらし、被りは最小限。
  const monsters = [
    ['golem', 56, 140, 165], // 大・中心
    ['nosignal', 44, 84, 143], // 中・やや中央寄り
    ['haze', 40, 46, 190], // 左下（左寄り）
    ['pill', 32, 182, 202], // 小・右下
  ]
  const mon = []
  for (const [id, h, cx, cy] of monsters) mon.push(...(await place(M(id), h, cx, cy)))

  // ゲーム内アイテム（お守り）: ヒーローの左上と右下に配置
  const items = [
    [A('charms/c_sensor'), 34, 203, 93],
    [A('charms/c_tablet'), 34, 282, 213],
  ]
  const itm = []
  for (const [file, h, cx, cy] of items) itm.push(...(await place(file, h, cx, cy)))

  const feetY = (H - 6) * S
  const heroLeft = Math.round(256 * S - hero.width / 2)
  const heroTop = feetY - hero.height

  const scrim = svg(W, H, `
    <defs>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#14314f" stop-opacity="0.72"/>
        <stop offset="0.5" stop-color="#14314f" stop-opacity="0.3"/>
        <stop offset="0.85" stop-color="#14314f" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#14314f" stop-opacity="0.32"/>
        <stop offset="0.4" stop-color="#14314f" stop-opacity="0"/>
        <stop offset="1" stop-color="#14314f" stop-opacity="0.4"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#l)"/>
    <rect width="${W}" height="${H}" fill="url(#b)"/>`)

  const text = svg(W, H, `
    <defs>
      <filter id="ds" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#04122b" flood-opacity="0.8"/>
      </filter>
    </defs>
    <g font-family="${FONT}">
      <text x="64" y="40" font-size="23" font-weight="800" fill="#ffffff">
        <tspan fill="#ffd257" font-style="italic">WUL</tspan><tspan dx="4">ケアクエスト</tspan>
      </text>
      <text x="16" y="90" font-size="14.5" font-weight="700" fill="#eaf3ff">介護現場の困りごとを、</text>
      <text x="16" y="112" font-size="14.5" font-weight="700" fill="#eaf3ff">ITスキルで倒すRPG。</text>
      <g transform="translate(14,214)">
        <rect x="0" y="0" rx="15" ry="15" width="132" height="30" fill="${BTN}"/>
        <text x="14" y="21" font-size="14" font-weight="800" fill="#ffffff">▶ 今すぐプレイ</text>
      </g>
    </g>`)

  const big = await sharp(bg)
    .composite([
      { input: scrim, top: 0, left: 0 },
      ...mon,
      { input: hero.buf, top: heroTop, left: heroLeft },
      ...itm,
      { input: icon.buf, top: sx(12), left: sx(14) },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()
  await finish(big, W, H, 'banner-300x250-m')
}

// ===================== 320x50（スマホ版） =====================
const make320 = async () => {
  const W = 320, H = 50
  const bg = await background(W, H, 0.6, 0.26)
  const icon = await iconRounded(OWLSHIELD, 40, 0.24)
  const mon = await place(M('pill'), 40, 226, 25, { glowBlur: 2, dropBlur: 3, dropDx: 2, dropDy: 4 })

  const scrim = svg(W, H, `
    <defs>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#14314f" stop-opacity="0.62"/>
        <stop offset="0.55" stop-color="#14314f" stop-opacity="0.32"/>
        <stop offset="1" stop-color="#14314f" stop-opacity="0.36"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#l)"/>`)

  const text = svg(W, H, `
    <defs>
      <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="2.4" flood-color="#04122b" flood-opacity="0.98"/>
      </filter>
    </defs>
    <g font-family="${FONT}">
      <text x="50" y="24" font-size="17" font-weight="800" fill="#ffffff">
        <tspan fill="#ffd257" font-style="italic">WUL</tspan><tspan dx="3">ケアクエスト</tspan>
      </text>
      <text x="51" y="40" font-size="10.5" font-weight="600" fill="#dbe8ff">ITスキルで介護現場を救うRPG</text>
      <g transform="translate(250,9)">
        <rect x="0" y="0" rx="16" ry="16" width="62" height="32" fill="${BTN}"/>
        <text x="10" y="21" font-size="13" font-weight="800" fill="#ffffff">プレイ▶</text>
      </g>
    </g>`)

  const big = await sharp(bg)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: icon.buf, top: Math.round((H * S - icon.size) / 2), left: sx(7) },
      ...mon,
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer()
  await finish(big, W, H, 'banner-320x50-m')
}

await make300()
await make320()
console.log('完了')
