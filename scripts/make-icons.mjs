#!/usr/bin/env node
// public/logo.png（WULマスコット）から PWA / iOS 用のアイコンを書き出す。
//   node scripts/make-icons.mjs
//
// logo.png は背景が白（不透明）なので、縁から連結した白だけをフラッドフィルで
// 透明化してから（目や腹の白は内側なので残る）、暖色グラデの正方形に載せる。
// iOS はアイコンの透過部分を黒く塗るため背景は必ず不透明にし、
// マスコットは中央 ~72%（周囲に余白）に置いて角丸/maskableで欠けないようにする。

import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'public', 'logo.png')

if (!existsSync(SRC)) {
  console.error('public/logo.png が見つかりません')
  process.exit(1)
}

/** 縁から連結した白背景を透明化した owl の透過PNGバッファを返す */
const cutoutWhite = async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const isWhite = (o) => data[o] > 232 && data[o + 1] > 232 && data[o + 2] > 232

  const bg = new Uint8Array(width * height)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const i = y * width + x
    if (bg[i]) return
    if (!isWhite(i * channels)) return
    bg[i] = 1
    stack.push(i)
  }
  for (let x = 0; x < width; x++) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    push(0, y)
    push(width - 1, y)
  }
  while (stack.length) {
    const i = stack.pop()
    const x = i % width
    const y = (i - x) / width
    push(x - 1, y)
    push(x + 1, y)
    push(x, y - 1)
    push(x, y + 1)
  }
  for (let i = 0; i < width * height; i++) if (bg[i]) data[i * channels + 3] = 0

  return sharp(data, { raw: { width, height, channels } }).png().trim({ threshold: 1 }).toBuffer()
}

// 暖色グラデの背景（クリーム→ライトゴールド）。マスコットのオレンジが映える。
const bgSvg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <defs>
         <radialGradient id="g" cx="50%" cy="40%" r="75%">
           <stop offset="0%" stop-color="#fffdf8"/>
           <stop offset="100%" stop-color="#ffe4b8"/>
         </radialGradient>
       </defs>
       <rect width="${size}" height="${size}" fill="url(#g)"/>
     </svg>`,
  )

const owlBuf = await cutoutWhite()

/** マスコットを中央に載せた正方形アイコンを作る。inner はマスコットが占める割合。 */
const makeIcon = async (size, inner) => {
  const bg = await sharp(bgSvg(size)).png().toBuffer()
  const owl = await sharp(owlBuf)
    .resize(Math.round(size * inner), Math.round(size * inner), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()
  return sharp(bg).composite([{ input: owl, gravity: 'center' }]).png({ compressionLevel: 9 }).toBuffer()
}

const targets = [
  ['icon-192.png', 192, 0.74],
  ['icon-512.png', 512, 0.74],
  ['apple-touch-icon.png', 180, 0.74],
]

for (const [name, size, inner] of targets) {
  const buf = await makeIcon(size, inner)
  await sharp(buf).toFile(join(ROOT, 'public', name))
  console.log(`  ✓ public/${name} (${size}x${size})`)
}
