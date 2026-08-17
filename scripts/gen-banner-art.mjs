#!/usr/bin/env node
// ============================================================
// サイト掲載用バナーのベースとなるキーアートを GPT Image 2 で生成する。
// 文字・ロゴは後から scripts/make-banner.mjs でくっきり合成するので、
// ここでは「文字なしの絵」だけを作る。
//   node scripts/gen-banner-art.mjs           # 未生成なら作る
//   node scripts/gen-banner-art.mjs --force   # 上書き再生成
// ============================================================

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { STYLE } from './style.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RAW_DIR = join(ROOT, '.assets-raw', 'misc')
const OUT = join(RAW_DIR, 'banner-base.png')
const MODEL = 'gpt-image-2'

const force = process.argv.includes('--force')
if (existsSync(OUT) && !force) {
  console.log(`既にあります（--force で上書き）: ${OUT}`)
  process.exit(0)
}

const loadKey = () => {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY
  const envPath = join(ROOT, '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  }
  console.error('OPENAI_API_KEY が見つかりません（.env に設定してください）')
  process.exit(1)
}

const prompt = [
  'Wide landscape key art banner for a friendly, hopeful mobile RPG about care work.',
  'A cheerful young Japanese care worker in a clean light-blue care uniform stands confidently on the right side,',
  'holding up a glowing digital tablet like a magic item, warm brave smile, adventurer energy.',
  'Behind: a welcoming Japanese elderly-care facility building and a blooming flower garden, gentle sunrise sky with soft god-rays.',
  'Cinematic wide composition; keep the LEFT third calmer and more open (sky and soft light) so a title can sit there;',
  'plenty of open sky in the upper area.',
  STYLE,
].join(' ')

const key = loadKey()
console.log('キーアート生成中… (gpt-image-2 / high / 1536x1024)')

const res = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
  body: JSON.stringify({
    model: MODEL,
    prompt,
    size: '1536x1024',
    quality: 'high',
    output_format: 'png',
    n: 1,
  }),
})

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`)
  process.exit(1)
}
const json = await res.json()
const b64 = json.data?.[0]?.b64_json
if (!b64) {
  console.error('画像が返りませんでした:', JSON.stringify(json).slice(0, 300))
  process.exit(1)
}
mkdirSync(RAW_DIR, { recursive: true })
writeFileSync(OUT, Buffer.from(b64, 'base64'))
console.log(`✓ 保存: ${OUT}  (画像トークン ${json.usage?.total_tokens ?? '?'})`)
