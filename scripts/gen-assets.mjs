#!/usr/bin/env node
// ============================================================
// GPT Image 2 でゲームアセットを生成する。
//
//   node scripts/gen-assets.mjs                 # 未生成のものを全部作る
//   node scripts/gen-assets.mjs --only=hero     # 指定idだけ
//   node scripts/gen-assets.mjs --only=hero --force   # 既存を上書き
//   node scripts/gen-assets.mjs --dry           # 生成せず対象一覧だけ表示
//
// 生成済みファイルはスキップするので、途中で止めても再実行で続きから進む。
// ============================================================

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MANIFEST } from './assets.manifest.mjs'
import { cutout, compressBackground } from './cutout.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_ROOT = join(ROOT, 'public', 'assets')
/** APIから返った未加工の画像。切り抜きを調整するとき再生成せずに済むよう保存しておく（gitignore済み） */
const RAW_ROOT = join(ROOT, '.assets-raw')
const MODEL = 'gpt-image-2'
const QUALITY = 'high'
const CONCURRENCY = 3
const MAX_RETRIES = 3

/** スプライトは透過PNG、背景画はWebP */
const extOf = (asset) => (asset.transparent ? 'png' : 'webp')
const outPath = (asset) => join(OUT_ROOT, asset.dir, `${asset.id}.${extOf(asset)}`)

// ---- .env から APIキーを読む ----
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
const API_KEY = loadKey()

// ---- 引数 ----
const args = process.argv.slice(2)
const flag = (name) => args.some((a) => a === `--${name}`)
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')

const force = flag('force')
const dry = flag('dry')
const onlyIds = value('only')?.split(',').map((s) => s.trim()).filter(Boolean)

const targets = MANIFEST.filter((a) => !onlyIds || onlyIds.includes(a.id)).filter(
  (a) => force || !existsSync(outPath(a)),
)

if (onlyIds) {
  const known = new Set(MANIFEST.map((a) => a.id))
  const unknown = onlyIds.filter((id) => !known.has(id))
  if (unknown.length) {
    console.error(`不明なid: ${unknown.join(', ')}`)
    process.exit(1)
  }
}

console.log(`モデル: ${MODEL} / 品質: ${QUALITY}`)
console.log(`対象: ${targets.length} 枚（マニフェスト全体 ${MANIFEST.length} 枚、生成済みはスキップ）`)
if (dry || targets.length === 0) {
  for (const t of targets) console.log(`  - ${t.dir}/${t.id}.${extOf(t)} (${t.size})`)
  process.exit(0)
}

// ---- 1枚生成 ----
const generate = async (asset) => {
  // gpt-image-2 は透過を出力できない。スプライトはグリーンバックで生成して後で抜く。
  const body = {
    model: MODEL,
    prompt: asset.prompt,
    size: asset.size,
    quality: QUALITY,
    output_format: 'png',
    n: 1,
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        // レート制限・一時的エラーは待って再試行
        if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
          const wait = 4000 * attempt
          console.warn(`  ↺ ${asset.id}: HTTP ${res.status}、${wait / 1000}秒待って再試行 (${attempt}/${MAX_RETRIES})`)
          await new Promise((r) => setTimeout(r, wait))
          continue
        }
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)
      }

      const json = await res.json()
      const b64 = json.data?.[0]?.b64_json
      if (!b64) throw new Error(`画像が返りませんでした: ${JSON.stringify(json).slice(0, 300)}`)
      const raw = Buffer.from(b64, 'base64')

      // 未加工画像を保存（切り抜きを調整するときはこれを使い回す＝再課金しない）
      mkdirSync(join(RAW_ROOT, asset.dir), { recursive: true })
      writeFileSync(join(RAW_ROOT, asset.dir, `${asset.id}.png`), raw)

      const processed = asset.transparent ? await cutout(raw) : await compressBackground(raw)
      mkdirSync(join(OUT_ROOT, asset.dir), { recursive: true })
      writeFileSync(outPath(asset), processed)

      const kb = Math.round(processed.length / 1024)
      console.log(`  ✓ ${asset.dir}/${asset.id}.${extOf(asset)} (${kb} KB)`)
      return { id: asset.id, ok: true, tokens: json.usage?.total_tokens ?? 0 }
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        console.error(`  ✗ ${asset.id}: ${err.message}`)
        return { id: asset.id, ok: false }
      }
      await new Promise((r) => setTimeout(r, 3000 * attempt))
    }
  }
  return { id: asset.id, ok: false }
}

// ---- 同時実行数を絞って順に流す ----
const queue = [...targets]
const results = []
const worker = async () => {
  while (queue.length) {
    const asset = queue.shift()
    console.log(`  … ${asset.dir}/${asset.id} 生成中`)
    results.push(await generate(asset))
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))

const ok = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok)
const tokens = results.reduce((a, r) => a + (r.tokens ?? 0), 0)
console.log(`\n完了: 成功 ${ok} / 失敗 ${failed.length}${tokens ? ` / 画像トークン計 ${tokens}` : ''}`)
if (failed.length) {
  console.log(`失敗したidは再実行で作り直せます: node scripts/gen-assets.mjs --only=${failed.map((f) => f.id).join(',')}`)
  process.exit(1)
}
