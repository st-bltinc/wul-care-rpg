// ============================================================
// WUL ケアクエスト — 型定義（全設計の共通基盤）
// ============================================================

export type Rarity = 1 | 2 | 3 | 4 | 5

export type SkillTreeId = 'care' | 'it' | 'mgmt'

/** ゲームに登場するITツール（=武器の元ネタ） */
export type ITToolId =
  | 'chrome'
  | 'gmail'
  | 'docs'
  | 'sheets'
  | 'calendar'
  | 'drive'
  | 'canva'
  | 'zoom'
  | 'meet'
  | 'chatgpt'

/**
 * 困りごとの分類タグ。武器の「特効(effectTag)」とモンスターの「弱点(weaknessTag)」を
 * 突き合わせて特効判定を行う。Care-Safety: 敵は常に「困りごと」であって利用者ではない。
 */
export type TroubleTag =
  | 'fall' // 転倒リスク
  | 'medication' // 誤薬
  | 'infection' // 感染症
  | 'sharing' // 情報共有不足
  | 'claim' // クレーム
  | 'record' // 記録漏れ
  | 'overwork' // 業務過多
  | 'handover' // 申し送り不足
  | 'remote' // 遠隔連携不足

/**
 * 武器の固有効果。元になったITツールの「実際の使いどころ」を戦闘の挙動に翻訳したもの。
 * 例: Canva＝分かりやすい掲示物 → 選択肢が絞られて迷わなくなる。
 */
export type WeaponPassive =
  | 'crit' // Chrome: 探索して弱点を突く。会心（1.5倍）が出やすい
  | 'guard' // Gmail: 記録の残る連絡。受けるダメージを軽減
  | 'xp' // ドキュメント: 共同編集で学びが増える。獲得XP+
  | 'superEffective' // スプレッドシート: 集計で確実に。特効ダメージをさらに強化
  | 'firstStrike' // カレンダー: 先回り。戦闘開始時に先制ダメージ
  | 'pierce' // Drive: 情報を全員へ。敵の最大HPに応じた追加ダメージ
  | 'hint' // Canva: 分かりやすい掲示。誤答の選択肢を1つ消す
  | 'dodge' // Zoom: 遠隔から対応。敵の反撃を回避することがある
  | 'rally' // Meet: チームを招集。正解時に追撃が出ることがある
  | 'aiAssist' // ChatGPT: AIが要点整理。各戦闘の最初のクイズで選択肢を2つに絞る

export interface Weapon {
  id: string
  name: string
  sourceTool: ITToolId
  toolLabel: string // 元になったITツールの正式名（学習対象を明示）
  rarity: Rarity
  atk: number
  /** この困りごとタグに対して特効（ダメージ2倍） */
  effectTag: TroubleTag
  effectDesc: string
  /** 固有効果。ツールの実用シーンをゲーム挙動に落としたもの */
  passive: WeaponPassive
  /** 固有効果のプレイヤー向け説明 */
  passiveDesc: string
  emoji: string
  desc: string
}

export interface Quiz {
  id: string
  category: 'care' | 'it'
  /** ITクイズの場合、対象ツール */
  tool?: ITToolId
  floorId: string
  question: string
  choices: string[] // 4択
  answer: number // 正解のindex
  explanation: string
  /** ITクイズの学習ポイント（このツールで何ができるようになるか） */
  learnPoint?: string
}

export type MonsterKind = 'normal' | 'mid' | 'boss' | 'last'

export interface Monster {
  id: string
  name: string
  kind: MonsterKind
  floorId: string
  hp: number
  atk: number
  /** 弱点となる困りごとタグ。対応する武器で特効 */
  weaknessTag: TroubleTag
  /** 弱点を突けるITツールのヒント表示用ラベル */
  weaknessHint: string
  emoji: string
  /**
   * 画像アセットのキー（public/assets/monsters/<art>.png）。
   * 同系統の困りごと（モレゴースト・ヌレユカ）は同じアートを共有する。
   */
  art: string
  color: string
  /** 困りごとの説明（利用者ではなく現場課題であることを明示） */
  flavor: string
}

export interface Floor {
  id: string
  order: number
  name: string
  theme: string // このフロアのテーマ困りごと
  learnTools: ITToolId[] // このフロアで習得を狙うITツール
  recommendedLevel: number
  bg: string // 背景グラデーション(CSS)
  emoji: string
  enemyIds: string[] // 通常敵
  midBossId: string // 中ボス
  bossId: string // フロアボス（施設全体フロアはラスボス）
  story: string
}

/**
 * お守り（アクセサリ）= 研修ガチャの排出物。
 * 武器はIT研修クイズでしか手に入らない（学習動線を壊さない）ため、
 * ガチャの引きの楽しさはこちらで受け持つ。
 */
export interface Charm {
  id: string
  name: string
  rarity: Rarity
  emoji: string
  bonus: { atk?: number; maxHp?: number; xpRate?: number }
  desc: string
}

/**
 * 学びカード = 研修ガチャの排出物その2。戦闘効果は持たない純粋な収集物で、
 * 中身は「現場で今日から使えるITの小ワザ」。武器と1対1にならない
 * 横断テーマ（クラウドストレージ・AI活用・デジタルコミュニケーション）もここで扱う。
 */
export interface Card {
  id: string
  name: string
  rarity: Rarity
  /** カードのテーマ（ツール名 or 横断テーマのラベル） */
  topic: string
  emoji: string
  /** カードの本文＝学ぶ内容 */
  learn: string
  /** 現場でのひとこと（使いどころ） */
  scene: string
}

export interface SkillNode {
  id: string
  tree: SkillTreeId
  name: string
  cost: number // 必要スキルポイント
  desc: string
  bonus: { atk?: number; maxHp?: number; special?: string }
  requires: string[] // 前提ノードid
}

export interface TitleDef {
  id: string
  name: string
  desc: string
  /** 称号の獲得条件 */
  condition: (p: PlayerState) => boolean
}

/** 永続化されるプレイヤーの進捗状態 */
export interface PlayerState {
  name: string
  role: string
  level: number
  xp: number
  hp: number
  maxHp: number
  baseAtk: number
  skillPoints: number
  gold: number
  tickets: number
  /** スキルの欠片：武器強化の素材。武器の重複入手（復習）とガチャ被りから得る */
  shards: number
  ownedWeapons: string[]
  equippedWeaponId: string | null
  /** 武器の強化段階（0〜MAX_WEAPON_LEVEL）。未強化の武器はキーを持たない */
  weaponLevels: Record<string, number>
  ownedCharms: string[]
  equippedCharmId: string | null
  /** 収集した学びカード（戦闘効果は無く、読み物として図鑑に残る） */
  ownedCards: string[]
  unlockedSkills: string[]
  earnedTitles: string[]
  currentTitleId: string | null
  clearedFloors: string[]
  currentFloorId: string
  defeatedMonsters: string[] // 図鑑
  answeredItTools: ITToolId[] // 学習した（正解した）ITツール
  facilityLevel: number
  createdAt: number
}
