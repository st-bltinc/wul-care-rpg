import type { PlayerState, Monster, Weapon, WeaponPassive } from '@/types'
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

/** 強化の上限段階 */
export const MAX_WEAPON_LEVEL = 5

/** 強化1段階あたりの攻撃力上昇 */
export const ATK_PER_WEAPON_LEVEL = 2

/** すでに持っている武器をもう一度入手した（＝復習した）ときに得る欠片 */
export const REVIEW_SHARDS = 3

/** 武器の現在の強化段階 */
export const weaponLevel = (p: PlayerState, weaponId: string): number =>
  p.weaponLevels[weaponId] ?? 0

/** 強化込みの武器攻撃力 */
export const weaponAtk = (weapon: Weapon, level: number): number =>
  weapon.atk + level * ATK_PER_WEAPON_LEVEL

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

/** 実効攻撃力（基礎 + スキル + お守り + 装備武器[強化込み]） */
export const totalAtk = (p: PlayerState, weapon: Weapon | null): number => {
  const base = p.baseAtk + skillBonuses(p.unlockedSkills).atk + charmBonus(p).atk
  return base + (weapon ? weaponAtk(weapon, weaponLevel(p, weapon.id)) : 0)
}

/** 獲得XPの倍率（お守りの xpRate ＋ ドキュメントの学びUP） */
export const xpMultiplier = (p: PlayerState, weapon: Weapon | null = null): number =>
  1 + charmBonus(p).xpRate + (hasPassive(weapon, 'xp') ? XP_PASSIVE_RATE : 0)

// ============================================================
// 武器の固有効果（パッシブ）
// ツールの実用シーンを戦闘の挙動に翻訳している。数値はここに集約する。
// ============================================================

export const CRIT_RATE = 0.25 // Chrome: 会心の発生率
export const CRIT_MULT = 1.5
export const GUARD_CUT = 0.3 // Gmail: 被ダメージ軽減率
export const XP_PASSIVE_RATE = 0.15 // ドキュメント: 獲得XPボーナス
export const SUPER_EFFECTIVE_MULT = 2.5 // スプレッドシート: 特効2倍→2.5倍
export const FIRST_STRIKE_RATE = 0.5 // カレンダー: 先制ダメージ（攻撃力比）
export const PIERCE_RATE = 0.05 // Drive: 敵の最大HPに対する追加ダメージ
export const DODGE_RATE = 0.3 // Zoom: 反撃回避率
export const RALLY_RATE = 0.25 // Meet: 追撃発生率

export const hasPassive = (weapon: Weapon | null, passive: WeaponPassive): boolean =>
  weapon?.passive === passive

export interface DamageResult {
  damage: number
  special: boolean // 特効が発動したか
  crit: boolean // 会心（Chrome）
  rally: boolean // チーム追撃（Meet）
}

/**
 * プレイヤー→敵 のダメージ。
 * 特効（武器タグ = 敵の弱点）で2倍、スプレッドシートならさらに2.5倍まで強化。
 */
export const computeDamage = (
  p: PlayerState,
  weapon: Weapon | null,
  monster: Monster,
): DamageResult => {
  const atk = totalAtk(p, weapon)
  const special = !!weapon && weapon.effectTag === monster.weaknessTag
  const variance = 0.85 + Math.random() * 0.3 // 0.85〜1.15
  let dmg = atk * variance

  if (special) dmg *= hasPassive(weapon, 'superEffective') ? SUPER_EFFECTIVE_MULT : 2

  const crit = hasPassive(weapon, 'crit') && Math.random() < CRIT_RATE
  if (crit) dmg *= CRIT_MULT

  // Drive: 情報を全員に届ける＝相手の大きさに関係なく効く固定ダメージ
  if (hasPassive(weapon, 'pierce')) dmg += monster.hp * PIERCE_RATE

  // Meet: チームを招集しての追撃
  const rally = hasPassive(weapon, 'rally') && Math.random() < RALLY_RATE
  if (rally) dmg *= 1.5

  return { damage: Math.max(1, Math.round(dmg)), special, crit, rally }
}

/** カレンダーの先制ダメージ（戦闘開始時、1回だけ） */
export const firstStrikeDamage = (p: PlayerState, weapon: Weapon | null): number =>
  hasPassive(weapon, 'firstStrike')
    ? Math.max(1, Math.round(totalAtk(p, weapon) * FIRST_STRIKE_RATE))
    : 0

export interface EnemyAttackResult {
  damage: number
  dodged: boolean // Zoomの回避
  guarded: boolean // Gmailの軽減
}

/** 敵→プレイヤー のダメージ（クイズ不正解時に受ける） */
export const enemyDamage = (monster: Monster, weapon: Weapon | null = null): EnemyAttackResult => {
  if (hasPassive(weapon, 'dodge') && Math.random() < DODGE_RATE) {
    return { damage: 0, dodged: true, guarded: false }
  }
  const variance = 0.85 + Math.random() * 0.3
  let dmg = monster.atk * variance
  const guarded = hasPassive(weapon, 'guard')
  if (guarded) dmg *= 1 - GUARD_CUT
  return { damage: Math.max(1, Math.round(dmg)), dodged: false, guarded }
}

/**
 * クイズで最初から伏せておく誤答の数。
 * Canva（分かりやすい掲示物）は1つ、ChatGPT（AIの要点整理）は最初の1問だけ2つ消す。
 */
export const maskedWrongChoices = (weapon: Weapon | null, isFirstQuiz: boolean): number => {
  if (hasPassive(weapon, 'hint')) return 1
  if (hasPassive(weapon, 'aiAssist') && isFirstQuiz) return 2
  return 0
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
