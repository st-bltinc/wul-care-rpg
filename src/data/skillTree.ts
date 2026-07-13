import type { SkillNode, SkillTreeId } from '@/types'

// ============================================================
// スキルツリー 3系統：介護 / IT / マネジメント
// 「何が足りないか」を視覚的に示すため、各系統を独立の縦チェーンで構成。
// bonus.atk=攻撃力, bonus.maxHp=体力, bonus.special=表示用の効果説明
// ============================================================

export const SKILL_TREES: { id: SkillTreeId; label: string; color: string; emoji: string }[] = [
  { id: 'care', label: '介護', color: '#e8734a', emoji: '🧡' },
  { id: 'it', label: 'IT', color: '#2f81f7', emoji: '💠' },
  { id: 'mgmt', label: 'マネジメント', color: '#3aa76d', emoji: '🌿' },
]

export const SKILLS: SkillNode[] = [
  // ---- 介護（体力・安定寄り） ----
  { id: 's_care_haisetsu', tree: 'care', name: '排泄ケア', cost: 1, desc: '排泄介助の基本。体力+5', bonus: { maxHp: 5 }, requires: [] },
  { id: 's_care_shokuji', tree: 'care', name: '食事ケア', cost: 1, desc: '誤嚥予防の基本。体力+6', bonus: { maxHp: 6 }, requires: ['s_care_haisetsu'] },
  { id: 's_care_ijou', tree: 'care', name: '移乗ケア', cost: 1, desc: '安全な移乗。攻撃+1・体力+4', bonus: { atk: 1, maxHp: 4 }, requires: [] },
  { id: 's_care_setsuguu', tree: 'care', name: '接遇', cost: 1, desc: '信頼を築く接遇。攻撃+2', bonus: { atk: 2 }, requires: [] },
  { id: 's_care_ninchi', tree: 'care', name: '認知症ケア', cost: 2, desc: '寄り添うケア。体力+10', bonus: { maxHp: 10 }, requires: ['s_care_shokuji'] },
  { id: 's_care_kansen', tree: 'care', name: '感染対策', cost: 2, desc: '予防の徹底。体力+10', bonus: { maxHp: 10 }, requires: ['s_care_ijou'] },

  // ---- IT（攻撃寄り、各ツールに対応） ----
  { id: 's_it_chrome', tree: 'it', name: 'Chrome活用', cost: 1, desc: '検索と探索。攻撃+2', bonus: { atk: 2, special: '探索率UP' }, requires: [] },
  { id: 's_it_gmail', tree: 'it', name: 'Gmail活用', cost: 1, desc: '確実な連絡。攻撃+2', bonus: { atk: 2 }, requires: ['s_it_chrome'] },
  { id: 's_it_docs', tree: 'it', name: 'ドキュメント活用', cost: 1, desc: '共同編集。攻撃+2', bonus: { atk: 2 }, requires: [] },
  { id: 's_it_sheets', tree: 'it', name: 'スプレッドシート活用', cost: 1, desc: '集計と自動化。攻撃+2', bonus: { atk: 2 }, requires: ['s_it_docs'] },
  { id: 's_it_calendar', tree: 'it', name: 'カレンダー活用', cost: 2, desc: '時間管理。攻撃+3', bonus: { atk: 3 }, requires: ['s_it_sheets'] },
  { id: 's_it_drive', tree: 'it', name: 'Drive活用', cost: 2, desc: 'クラウド共有。攻撃+3', bonus: { atk: 3, special: '情報共有に強い' }, requires: ['s_it_gmail'] },
  { id: 's_it_canva', tree: 'it', name: 'Canva活用', cost: 2, desc: '掲示物デザイン。攻撃+3', bonus: { atk: 3 }, requires: [] },
  { id: 's_it_zoom', tree: 'it', name: 'Zoom活用', cost: 2, desc: '遠隔連携。攻撃+4', bonus: { atk: 4 }, requires: ['s_it_calendar'] },
  { id: 's_it_meet', tree: 'it', name: 'Google Meet活用', cost: 2, desc: 'カレンダーから即会議。攻撃+4', bonus: { atk: 4, special: '遠隔連携に強い' }, requires: ['s_it_zoom'] },
  { id: 's_it_chatgpt', tree: 'it', name: 'ChatGPT活用', cost: 3, desc: 'AIの支援。攻撃+5', bonus: { atk: 5 }, requires: ['s_it_drive', 's_it_meet'] },
  { id: 's_it_ai', tree: 'it', name: 'AI活用マスター', cost: 3, desc: 'AIを使いこなす。攻撃+5', bonus: { atk: 5, special: '全困りごとに強くなる' }, requires: ['s_it_chatgpt'] },

  // ---- マネジメント（バランス） ----
  { id: 's_mgmt_moushiokuri', tree: 'mgmt', name: '申し送り', cost: 1, desc: '要点を伝える。体力+6', bonus: { maxHp: 6 }, requires: [] },
  { id: 's_mgmt_kyouiku', tree: 'mgmt', name: '新人教育', cost: 1, desc: '育てる力。攻撃+1', bonus: { atk: 1 }, requires: ['s_mgmt_moushiokuri'] },
  { id: 's_mgmt_shift', tree: 'mgmt', name: 'シフト管理', cost: 1, desc: '負荷の分散。体力+6', bonus: { maxHp: 6 }, requires: [] },
  { id: 's_mgmt_kyouyuu', tree: 'mgmt', name: '情報共有', cost: 2, desc: '分断を防ぐ。攻撃+2', bonus: { atk: 2 }, requires: ['s_mgmt_shift'] },
  { id: 's_mgmt_renkei', tree: 'mgmt', name: 'チーム連携', cost: 2, desc: '施設をひとつに。攻撃+2・体力+6', bonus: { atk: 2, maxHp: 6 }, requires: ['s_mgmt_kyouiku', 's_mgmt_kyouyuu'] },
]

export const SKILL_MAP: Record<string, SkillNode> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
)

export const skillsByTree = (tree: SkillTreeId): SkillNode[] =>
  SKILLS.filter((s) => s.tree === tree)
