#!/usr/bin/env node
// ============================================================
// マスコット2枚の青い背景を「中心=白 → 外側=薄い青」の放射状グラデーションに置換。
// 背景の青だけを縁からのフラッドフィルで抜く（盾の青は白フチで囲まれ連結しないので残る）。
//   node scripts/mascot-softbg.mjs
// ============================================================

import sharp from 'sharp'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...a) => join(ROOT, ...a)

const FILES = [
  { in: p('public/ChatGPT Image 2026年8月17日 12_10_00 (1).png'), out: p('public/owl-shield-1.png') },
  { in: p('public/ChatGPT Image 2026年8月17日 12_10_01 (2).png'), out: p('public/owl-shield-2.png') },
]

// 背景の青らしさ（青が突出＝大きい）。オレンジ/白/黒/茶では小さい or 負。
const blueness = (r, g, b) => b - Math.max(r, g)

// 白→薄青の放射状グラデーション（中心白、隅にかけて薄い青）
const gradientSvg = (W, H) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#cfe3ff"/>
      <stop offset="72%" stop-color="#7db0f5"/>
      <stop offset="100%" stop-color="#4f93ef"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`)

for (const { in: inp, out } of FILES) {
  const { data, info } = await sharp(inp).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: ch } = info
  const bg = new Uint8Array(W * H)
  const q = []
  const push = (x, y) => {
    const i = y * W + x
    if (bg[i]) return
    const o = i * ch
    // 背景判定: 強い青（青が突出）かつ青チャンネルが高い
    if (blueness(data[o], data[o + 1], data[o + 2]) < 45 || data[o + 2] < 175) return
    bg[i] = 1
    q.push(i)
  }
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1) }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y) }
  while (q.length) {
    const i = q.pop()
    const x = i % W
    const y = (i - x) / W
    if (x > 0) push(x - 1, y)
    if (x < W - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < H - 1) push(x, y + 1)
  }

  const isBg = (x, y) => x >= 0 && y >= 0 && x < W && y < H && bg[y * W + x]
  let removed = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const o = i * ch
      if (bg[i]) { data[o + 3] = 0; removed++; continue }
      // 背景に隣接する縁ピクセルだけ、青フチを中和＆フェード（盾など内部の青は触らない）
      let near = false
      for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (isBg(x + dx, y + dy)) { near = true; break }
      if (!near) continue
      const r = data[o], g = data[o + 1], b = data[o + 2]
      const sp = blueness(r, g, b)
      if (sp > 8) {
        data[o + 2] = Math.max(r, g) + Math.min(b - Math.max(r, g), 6) // 青フチを落とす
        if (sp > 40) data[o + 3] = Math.max(0, 255 - (sp - 40) * 6) // 強い青の残りは半透明に
      }
    }
  }

  const cut = await sharp(data, { raw: { width: W, height: H, channels: ch } }).png().toBuffer()
  await sharp(gradientSvg(W, H)).composite([{ input: cut, left: 0, top: 0 }]).png().toFile(out)
  console.log(`✓ ${out.split('/').pop()}  背景除去 ${(removed / (W * H) * 100).toFixed(1)}%`)
}
console.log('完了')
