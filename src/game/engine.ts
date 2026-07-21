import type { PlayerState, Monster, Weapon } from '@/types'
import { SKILL_MAP } from '@/data/skillTree'
import { getCharm } from '@/data/charms'

// ============================================================
// ゲームエンジン：戦闘計算・成長計算の純粋関数群（UIから独立）
// ランタイムで外部AI等は一切使わない。
// ============================================================

/** 次のレベルまでに必要な経験値 */
export const xpToNext = (level: number): number => 20 + (level - 1) * 15

/** レベルに応じた役割（資格ではなく役割として成長） */
export const roleForLevel = (level: number): string => {
  if (level >= 15) return '施設改革リーダー'
  if (level >= 11) return '教育リーダー'
  if (level >= 8) return '現場マイスター'
  if (level >= 5) return 'DX推進担当'
  if (level >= 3) return '現場担当'
  return '見習い介護士'
}

/** 解放済みスキルの合計ボーナス */
export const skillBonuses = (unlocked: string[]): { atk: number; maxHp: number } => {
  let atk = 0
  let maxHp = 0
  for (const id of unlocked) {
    const n = SKILL_MAP[id]
    if (!n) continue
    atk += n.bonus.atk ?? 0
    maxHp += n.bonus.maxHp ?? 0
  }
  return { atk, maxHp }
}

// ---- 武器の強化 ----
// 方針: 戦闘の勝敗は「クイズに正解できるか」で決まる。装備は威力をほとんど変えず、
// 攻撃の見た目（演出）を変えるためのもの。強化と弱点だけがささやかに効く。

/** 強化の上限段階 */
export const MAX_WEAPON_LEVEL = 5

/** 強化1段階あたりの攻撃力上昇（ごく小さい） */
export const ATK_PER_WEAPON_LEVEL = 1

/** 弱点（武器タグ = 敵の弱点）が一致したときの控えめなダメージ倍率 */
export const WEAKNESS_MULT = 1.25

/** すでに持っている武器をもう一度入手した（＝復習した）ときに得る欠片 */
export const REVIEW_SHARDS = 3

/** 武器の現在の強化段階 */
export const weaponLevel = (p: PlayerState, weaponId: string): number =>
  p.weaponLevels[weaponId] ?? 0

/** 武器の攻撃力寄与（強化段階のみ。素の威力差は作らない） */
export const weaponAtk = (_weapon: Weapon, level: number): number => level * ATK_PER_WEAPON_LEVEL

/** 次の段階へ強化するのに必要なコスト（段階が上がるほど重くなる） */
export const enhanceCost = (level: number): { shards: number; gold: number } => ({
  shards: 2 + level * 2,
  gold: 40 * (level + 1),
})

/** 装備中のお守りのボーナス（未装備なら全て0） */
export const charmBonus = (p: PlayerState): { atk: number; maxHp: number; xpRate: number } => {
  const c = getCharm(p.equippedCharmId)
  return {
    atk: c?.bonus.atk ?? 0,
    maxHp: c?.bonus.maxHp ?? 0,
    xpRate: c?.bonus.xpRate ?? 0,
  }
}

/** 実効最大HP（基礎 + スキル + お守り） */
export const effectiveMaxHp = (p: PlayerState): number =>
  p.maxHp + skillBonuses(p.unlockedSkills).maxHp + charmBonus(p).maxHp

/**
 * 実効攻撃力（基礎 + スキル + お守り + 装備武器の強化分）。
 * 主役は基礎攻撃（レベルとスキル）。武器はほぼ威力に影響しない。
 */
export const totalAtk = (p: PlayerState, weapon: Weapon | null): number => {
  const base = p.baseAtk + skillBonuses(p.unlockedSkills).atk + charmBonus(p).atk
  return base + (weapon ? weaponAtk(weapon, weaponLevel(p, weapon.id)) : 0)
}

/** 獲得XPの倍率（お守りの xpRate のみ） */
export const xpMultiplier = (p: PlayerState): number => 1 + charmBonus(p).xpRate

export interface DamageResult {
  damage: number
  special: boolean // 弱点を突いたか（学習の合図。控えめな倍率）
}

/**
 * プレイヤー→敵 のダメージ。
 * ほぼ基礎攻撃で決まり、弱点一致でわずかに上がる（装備で大きく変わらない）。
 */
export const computeDamage = (
  p: PlayerState,
  weapon: Weapon | null,
  monster: Monster,
): DamageResult => {
  const atk = totalAtk(p, weapon)
  const special = !!weapon && weapon.effectTag === monster.weaknessTag
  const variance = 0.9 + Math.random() * 0.2 // 0.9〜1.1
  let dmg = atk * variance
  if (special) dmg *= WEAKNESS_MULT
  return { damage: Math.max(1, Math.round(dmg)), special }
}

/** 敵→プレイヤー のダメージ（クイズ不正解時に受ける） */
export const enemyDamage = (monster: Monster): number => {
  const variance = 0.9 + Math.random() * 0.2
  return Math.max(1, Math.round(monster.atk * variance))
}

export interface LevelUpResult {
  levelsGained: number
  newLevel: number
  skillPointsGained: number
  maxHpGained: number
  atkGained: number
  newRole: string
  roleChanged: boolean
}

/**
 * 経験値付与によるレベルアップ計算（プレイヤーを不変更新して返す）。
 * レベルごとに スキルP+1 / 最大HP+5 / 基礎攻撃+2。
 */
export const applyXp = (p: PlayerState, amount: number): { player: PlayerState; result: LevelUpResult } => {
  let { level, xp, maxHp, baseAtk, skillPoints } = p
  const startLevel = level
  const startRole = roleForLevel(startLevel)
  let sp = 0
  let hpUp = 0
  let atkUp = 0
  xp += amount
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level)
    level += 1
    skillPoints += 1
    sp += 1
    maxHp += 5
    hpUp += 5
    baseAtk += 2
    atkUp += 2
  }
  const newRole = roleForLevel(level)
  const player: PlayerState = { ...p, level, xp, maxHp, baseAtk, skillPoints, role: newRole }
  return {
    player,
    result: {
      levelsGained: level - startLevel,
      newLevel: level,
      skillPointsGained: sp,
      maxHpGained: hpUp,
      atkGained: atkUp,
      newRole,
      roleChanged: newRole !== startRole,
    },
  }
}

/** 経験値・報酬の目安（敵の種類で変動） */
export const rewardFor = (monster: Monster): { xp: number; gold: number; tickets: number } => {
  const base = { normal: 12, mid: 24, boss: 40, last: 80 }[monster.kind]
  return {
    xp: base,
    gold: Math.round(base * 1.5),
    tickets: monster.kind === 'normal' ? 1 : 2,
  }
}
