#!/usr/bin/env node
// public/owl-shield-1.png（盾入りマスコットの完成アイコン）から PWA / iOS 用アイコンを書き出す。
//   node scripts/make-icons.mjs
//
// owl-shield-1 は白→薄青グラデ背景の正方形（不透明）なので、そのまま各サイズへリサイズするだけ。
// これらを index.html（favicon / apple-touch-icon）と manifest（icon-192/512）が参照しているので、
// ホーム画面に追加したときのアイコンもこれになる。

import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'public', 'owl-shield-1.png')

if (!existsSync(SRC)) {
  console.error('public/owl-shield-1.png が見つかりません')
  process.exit(1)
}

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  await sharp(SRC)
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(join(ROOT, 'public', name))
  console.log(`  ✓ public/${name} (${size}x${size})`)
}
