import type { Card, Charm, Rarity } from '@/types'
import { CHARMS, GACHA_RATES } from '@/data/charms'
import { CARDS } from '@/data/cards'

// ============================================================
// WUL研修ガチャ：チケット1枚で「お守り」か「学びカード」を1つ排出する。
// 被りは「スキルの欠片」に変換され、武器強化に回せる（無駄引きを作らない）。
// ============================================================

/** ゴールドでチケットを1枚買うときの価格 */
export const TICKET_GOLD_COST = 120

/** 排出時にお守りが出る確率（残りは学びカード） */
export const CHARM_SHARE = 0.4

/** 被りが欠片に変わるときの枚数 */
export const dupShards = (rarity: Rarity): number => rarity * 2

export type GachaResult =
  | { kind: 'charm'; charm: Charm; rarity: Rarity; isNew: boolean; shards: number }
  | { kind: 'card'; card: Card; rarity: Rarity; isNew: boolean; shards: number }

const pickRarity = (): Rarity => {
  const total = (Object.values(GACHA_RATES) as number[]).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const r of [1, 2, 3, 4, 5] as Rarity[]) {
    roll -= GACHA_RATES[r]
    if (roll < 0) return r
  }
  return 1
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/**
 * 1回引く。
 * まずレア度を決め、その後にお守り／カードのどちらかを選ぶ。
 * 選ばれた側にそのレア度の在庫が無い場合は、もう一方から出す（ハズレ無し）。
 */
export const rollGacha = (ownedCharms: string[], ownedCards: string[]): GachaResult => {
  const rarity = pickRarity()
  const charmPool = CHARMS.filter((c) => c.rarity === rarity)
  const cardPool = CARDS.filter((c) => c.rarity === rarity)

  const wantCharm = Math.random() < CHARM_SHARE
  const useCharm = wantCharm ? charmPool.length > 0 : cardPool.length === 0

  if (useCharm && charmPool.length > 0) {
    const charm = pick(charmPool)
    const isNew = !ownedCharms.includes(charm.id)
    return { kind: 'charm', charm, rarity, isNew, shards: isNew ? 0 : dupShards(rarity) }
  }

  if (cardPool.length > 0) {
    const card = pick(cardPool)
    const isNew = !ownedCards.includes(card.id)
    return { kind: 'card', card, rarity, isNew, shards: isNew ? 0 : dupShards(rarity) }
  }

  // どちらの在庫も無いレア度は存在しないが、保険として最低レアのお守りを返す
  const charm = pick(CHARMS)
  const isNew = !ownedCharms.includes(charm.id)
  return { kind: 'charm', charm, rarity: charm.rarity, isNew, shards: isNew ? 0 : dupShards(charm.rarity) }
}
