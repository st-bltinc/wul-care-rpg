import type { Charm, Rarity } from '@/types'

// ============================================================
// お守り = WUL研修センターのガチャ排出物（アクセサリ）。
// 武器（ITツール）はIT研修クイズでしか入手できない。お守りは現場の
// 「あると助かる道具」をモチーフにした純粋な強化アイテム。
// ============================================================

export const CHARMS: Charm[] = [
  {
    id: 'c_memo', name: 'メモ帳のお守り', rarity: 1, emoji: '📝',
    bonus: { atk: 1 },
    desc: '書き留める習慣は最強の基本。攻撃+1',
  },
  {
    id: 'c_pen', name: '三色ペンのお守り', rarity: 1, emoji: '🖊️',
    bonus: { atk: 1, maxHp: 2 },
    desc: '色分けすると伝わり方が変わる。攻撃+1・体力+2',
  },
  {
    id: 'c_fusen', name: 'ふせんのお守り', rarity: 2, emoji: '🏷️',
    bonus: { atk: 2 },
    desc: '小さな申し送りを見逃さない。攻撃+2',
  },
  {
    id: 'c_hosuukei', name: '歩数計のお守り', rarity: 2, emoji: '👟',
    bonus: { maxHp: 6 },
    desc: '自分の体も大事にする。体力+6',
  },
  {
    id: 'c_sensor', name: '見守りセンサーのお守り', rarity: 3, emoji: '📡',
    bonus: { maxHp: 12 },
    desc: '気づける仕組みが安心を生む。体力+12',
  },
  {
    id: 'c_laptop', name: 'ノートPCのお守り', rarity: 3, emoji: '💻',
    bonus: { atk: 4 },
    desc: 'どこでも記録・共有できる。攻撃+4',
  },
  {
    id: 'c_tablet', name: 'タブレット端末のお守り', rarity: 4, emoji: '📱',
    bonus: { atk: 5, maxHp: 6 },
    desc: 'ベッドサイドでその場入力。攻撃+5・体力+6',
  },
  {
    id: 'c_karte', name: '電子カルテのお守り', rarity: 4, emoji: '🗃️',
    bonus: { atk: 3, xpRate: 0.2 },
    desc: '積み上げた記録が学びになる。攻撃+3・獲得XP+20%',
  },
  {
    id: 'c_wul', name: 'WUL認定バッジ', rarity: 5, emoji: '🎖️',
    bonus: { atk: 8, maxHp: 10, xpRate: 0.3 },
    desc: 'デジタルで現場を変える証。攻撃+8・体力+10・獲得XP+30%',
  },
]

export const CHARM_MAP: Record<string, Charm> = Object.fromEntries(
  CHARMS.map((c) => [c.id, c]),
)

export const getCharm = (id: string | null): Charm | null =>
  id ? CHARM_MAP[id] ?? null : null

/** ガチャの排出率（レア度別・合計100） */
export const GACHA_RATES: Record<Rarity, number> = {
  1: 34,
  2: 32,
  3: 21,
  4: 10,
  5: 3,
}
