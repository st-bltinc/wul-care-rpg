import type { TitleDef } from '@/types'

// ============================================================
// 称号 = 育成のやり込み要素。役割の成長と連動（国家資格化はしない）。
// ============================================================

export const TITLES: TitleDef[] = [
  { id: 't_rookie', name: '新人介護士', desc: '物語のはじまり', condition: () => true },
  { id: 't_field', name: '現場デビュー', desc: 'はじめてフロアを攻略した', condition: (p) => p.clearedFloors.length >= 1 },
  { id: 't_digital1', name: 'デジタル一年生', desc: 'ITツールを3つ学んだ', condition: (p) => p.answeredItTools.length >= 3 },
  { id: 't_smith', name: '武器職人', desc: '武器を5つ集めた', condition: (p) => p.ownedWeapons.length >= 5 },
  { id: 't_dx', name: 'DX推進担当', desc: 'レベル5に到達した', condition: (p) => p.level >= 5 },
  { id: 't_master', name: '現場マイスター', desc: '4フロアを攻略した', condition: (p) => p.clearedFloors.length >= 4 },
  { id: 't_ai', name: 'AIの相棒', desc: 'ChatGPT（AI活用）を学んだ', condition: (p) => p.answeredItTools.includes('chatgpt') },
  { id: 't_reformer', name: '施設改革リーダー', desc: 'すべてのフロアを攻略した', condition: (p) => p.clearedFloors.length >= 8 },
]

export const TITLE_MAP: Record<string, TitleDef> = Object.fromEntries(
  TITLES.map((t) => [t.id, t]),
)

export const getTitle = (id: string | null): TitleDef | null =>
  id ? TITLE_MAP[id] ?? null : null
