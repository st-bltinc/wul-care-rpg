// ============================================================
// 効果音。音声ファイルは持たず、Web Audio API で都度合成する。
// 理由: PWAの容量を増やさず、オフラインでも必ず鳴るため。
// 端末のミュートを尊重し、ユーザー操作より前には AudioContext を作らない。
// ============================================================

const STORAGE_KEY = 'wul-care-rpg-muted'

let ctx: AudioContext | null = null
let muted = localStorage.getItem(STORAGE_KEY) === '1'

export const isMuted = () => muted

export const setMuted = (v: boolean) => {
  muted = v
  localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
}

/** 最初の操作時に生成する（自動再生ポリシー対策） */
const audio = (): AudioContext | null => {
  if (muted) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface ToneOptions {
  freq: number
  /** 秒 */
  dur: number
  type?: OscillatorType
  /** 0〜1 */
  gain?: number
  /** 開始からの遅延（秒） */
  delay?: number
  /** 終端の周波数（指定するとスライドする） */
  toFreq?: number
}

const tone = ({ freq, dur, type = 'square', gain = 0.12, delay = 0, toFreq }: ToneOptions) => {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (toFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, toFreq), t0 + dur)

  // クリックノイズを避けるため、立ち上がりと減衰をつける
  amp.gain.setValueAtTime(0, t0)
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

const noise = (dur: number, gain = 0.14, delay = 0) => {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const frames = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    // 後ろほど小さくして「シュッ」と減衰させる
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const src = ac.createBufferSource()
  const amp = ac.createGain()
  src.buffer = buffer
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(amp).connect(ac.destination)
  src.start(t0)
}

/** 画面のタップ・ボタン */
export const sfxTap = () => tone({ freq: 660, dur: 0.06, type: 'triangle', gain: 0.07 })

/** 正解：上がっていく2音 */
export const sfxCorrect = () => {
  tone({ freq: 784, dur: 0.1, type: 'triangle', gain: 0.12 })
  tone({ freq: 1175, dur: 0.18, type: 'triangle', gain: 0.12, delay: 0.09 })
}

/** 不正解：下がる低音 */
export const sfxWrong = () => {
  tone({ freq: 220, dur: 0.22, type: 'sawtooth', gain: 0.1, toFreq: 110 })
}

/** 敵に攻撃が当たった */
export const sfxHit = () => {
  noise(0.12, 0.12)
  tone({ freq: 180, dur: 0.1, type: 'square', gain: 0.09, toFreq: 90 })
}

/** 特効・会心 */
export const sfxSpecial = () => {
  noise(0.16, 0.14)
  tone({ freq: 880, dur: 0.09, type: 'square', gain: 0.13 })
  tone({ freq: 1320, dur: 0.14, type: 'square', gain: 0.12, delay: 0.07 })
  tone({ freq: 1760, dur: 0.2, type: 'square', gain: 0.1, delay: 0.15 })
}

/** プレイヤーが被弾 */
export const sfxDamage = () => {
  noise(0.18, 0.1)
  tone({ freq: 140, dur: 0.24, type: 'sawtooth', gain: 0.1, toFreq: 70 })
}

/** 敵を撃退 */
export const sfxVictory = () => {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => tone({ freq: f, dur: 0.22, type: 'triangle', gain: 0.12, delay: i * 0.1 }))
}

/** レベルアップ */
export const sfxLevelUp = () => {
  const notes = [659, 784, 988, 1319]
  notes.forEach((f, i) => tone({ freq: f, dur: 0.3, type: 'square', gain: 0.11, delay: i * 0.09 }))
}

/** 報酬・武器獲得 */
export const sfxReward = () => {
  tone({ freq: 1047, dur: 0.12, type: 'triangle', gain: 0.12 })
  tone({ freq: 1568, dur: 0.25, type: 'triangle', gain: 0.11, delay: 0.1 })
}

/** ガチャの抽選中 */
export const sfxGachaRoll = () => {
  for (let i = 0; i < 6; i++) {
    tone({ freq: 400 + i * 90, dur: 0.07, type: 'square', gain: 0.07, delay: i * 0.1 })
  }
}

/** ガチャ排出。レア度が高いほど派手に */
export const sfxGachaResult = (rarity: number) => {
  if (rarity >= 5) {
    const notes = [523, 659, 784, 1047, 1319, 1568]
    notes.forEach((f, i) => tone({ freq: f, dur: 0.36, type: 'square', gain: 0.13, delay: i * 0.08 }))
    noise(0.3, 0.1, 0.1)
  } else if (rarity >= 4) {
    const notes = [659, 880, 1319]
    notes.forEach((f, i) => tone({ freq: f, dur: 0.26, type: 'triangle', gain: 0.12, delay: i * 0.09 }))
  } else {
    tone({ freq: 660, dur: 0.12, type: 'triangle', gain: 0.1 })
    tone({ freq: 880, dur: 0.16, type: 'triangle', gain: 0.1, delay: 0.1 })
  }
}

/** 力尽きた */
export const sfxDefeat = () => {
  const notes = [392, 330, 262, 196]
  notes.forEach((f, i) => tone({ freq: f, dur: 0.34, type: 'sawtooth', gain: 0.1, delay: i * 0.14 }))
}

/** フロア攻略 */
export const sfxFloorClear = () => {
  const notes = [523, 523, 784, 1047, 1319]
  notes.forEach((f, i) => tone({ freq: f, dur: 0.32, type: 'square', gain: 0.12, delay: i * 0.12 }))
}
