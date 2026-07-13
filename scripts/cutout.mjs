import sharp from 'sharp'

// ============================================================
// クロマキー背景の切り抜き。
//
// gpt-image-2 は透過PNGを出力できないので、単色グリーン背景で生成したうえで
// ここで背景を抜く。単純な色一致ではなく「画像の縁から連結しているグリーン」だけを
// 消す（フラッドフィル）ので、被写体の中にある緑（緑の敵・緑の宝石など）は残る。
// ============================================================

const CHROMA = { r: 0, g: 255, b: 0 }

/** グリーン背景らしさ。緑が突出しているほど大きい */
const greenness = (r, g, b) => g - Math.max(r, b)

/**
 * @param {Buffer} png 生成された不透明PNG
 * @param {number} size 出力の一辺（正方形にリサイズ）
 * @returns {Promise<Buffer>} 背景を抜いた透過PNG
 */
export const cutout = async (png, size = 512) => {
  const img = sharp(png).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const px = (x, y) => (y * width + x) * channels

  // 縁から連結したグリーン領域を塗りつぶす（BFS）
  const bg = new Uint8Array(width * height)
  const queue = []
  const push = (x, y) => {
    const i = y * width + x
    if (bg[i]) return
    const o = px(x, y)
    // 背景と判定するしきい値。強い緑のみ。
    if (greenness(data[o], data[o + 1], data[o + 2]) < 60) return
    bg[i] = 1
    queue.push(i)
  }
  for (let x = 0; x < width; x++) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    push(0, y)
    push(width - 1, y)
  }
  while (queue.length) {
    const i = queue.pop()
    const x = i % width
    const y = (i - x) / width
    if (x > 0) push(x - 1, y)
    if (x < width - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < height - 1) push(x, y + 1)
  }

  // 背景を透明にし、輪郭に残るグリーンのフチ（スピル）を中和する
  for (let i = 0; i < width * height; i++) {
    const o = i * channels
    if (bg[i]) {
      data[o + 3] = 0
      continue
    }
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const spill = greenness(r, g, b)
    if (spill > 12) {
      // 緑が浮いているピクセルは、緑成分を赤青の平均まで落として脱色する
      data[o + 1] = Math.round(Math.max(r, b) * 0.5 + (r + b) / 2 / 2 + Math.min(g, (r + b) / 2) * 0.5)
      // 半透明にして境界をなじませる
      if (spill > 40) data[o + 3] = Math.max(0, 255 - (spill - 40) * 4)
    }
  }

  return sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 1 }) // 透明な余白を切り落として被写体を最大化
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
}

/** 背景画はそのまま圧縮・リサイズするだけ */
export const compressBackground = async (png, width = 720) =>
  sharp(png)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

export { CHROMA }
