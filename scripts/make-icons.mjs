#!/usr/bin/env node
// 生成したアプリアイコン（.assets-raw/misc/icon.png）から PWA 用の各サイズを書き出す。
//   node scripts/make-icons.mjs

import sharp from 'sharp'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, '.assets-raw', 'misc', 'icon.png')

if (!existsSync(SRC)) {
  console.error('先に node scripts/gen-assets.mjs --only=icon を実行してください')
  process.exit(1)
}

const SIZES = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of SIZES) {
  await sharp(SRC).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(join(ROOT, 'public', name))
  console.log(`  ✓ public/${name} (${size}x${size})`)
}
