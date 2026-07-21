import type { Monster } from '@/types'

// ============================================================
// モンスター = 介護現場の「困りごと」。利用者は絶対に敵にしない。
// 造形は概念的・非人間的（雲/おばけ/ゴーレム等）で、利用者と誤解させない。
// weaknessTag に対応する武器を装備するとささやかな特効（学習の合図）。
// ============================================================

export const MONSTERS: Monster[] = [
  // ---- 受付 ----
  {
    id: 'm_rec_1', name: 'フマンモヤ', kind: 'normal', floorId: 'f_reception',
    hp: 33, atk: 4, weaknessTag: 'claim', weaknessHint: 'Gmail＝伝達の羽ペン',
    emoji: '☁️', art: 'haze', color: '#7c8ba1',
    flavor: '伝え漏れから生まれる小さな不満のモヤ。丁寧な連絡で晴れていく。',
  },
  {
    id: 'm_rec_2', name: 'モレゴースト', kind: 'normal', floorId: 'f_reception',
    hp: 36, atk: 4, weaknessTag: 'record', weaknessHint: 'Googleドキュメント＝共同編集の書',
    emoji: '👻', art: 'ghost', color: '#9b8cff',
    flavor: '記録の抜け漏れが実体化したおばけ。きちんと記録すると消える。',
  },
  {
    id: 'm_rec_boss', name: 'クレーム台風', kind: 'boss', floorId: 'f_reception',
    hp: 156, atk: 8, weaknessTag: 'claim', weaknessHint: 'Gmail＝伝達の羽ペン',
    emoji: '🌀', art: 'typhoon', color: '#4b6cb7',
    flavor: '小さな不満が渦を巻いた台風。記録の残る丁寧な連絡が弱点。',
  },

  // ---- 居室 ----
  {
    id: 'm_room_1', name: 'ヌレユカ', kind: 'normal', floorId: 'f_room',
    hp: 45, atk: 5, weaknessTag: 'fall', weaknessHint: 'Chrome＝探索ゴーグル',
    emoji: '💧', art: 'wetfloor', color: '#3aa0c9',
    flavor: '濡れた床に潜む転倒リスク。最新の予防知識で先回りできる。',
  },
  {
    id: 'm_room_2', name: 'モレゴースト・弐', kind: 'normal', floorId: 'f_room',
    hp: 42, atk: 5, weaknessTag: 'record', weaknessHint: 'Googleドキュメント＝共同編集の書',
    emoji: '👻', art: 'ghost', color: '#9b8cff',
    flavor: '居室ケアの記録漏れ。みんなで同時に記録すると力を失う。',
  },
  {
    id: 'm_room_boss', name: 'オオスベリ大王', kind: 'boss', floorId: 'f_room',
    hp: 203, atk: 10, weaknessTag: 'fall', weaknessHint: 'Chrome＝探索ゴーグル',
    emoji: '🌊', art: 'wave', color: '#2b7a99',
    flavor: '転倒リスクの親玉。環境整備とエビデンス探索で攻略できる。',
  },

  // ---- 食堂 ----
  {
    id: 'm_din_1', name: 'ゴヤックリン', kind: 'normal', floorId: 'f_dining',
    hp: 54, atk: 6, weaknessTag: 'medication', weaknessHint: 'スプレッドシート＝集計の杖',
    emoji: '💊', art: 'pill', color: '#d98c5f',
    flavor: '確認不足から生じる誤薬の芽。チェック表で確実に潰せる。',
  },
  {
    id: 'm_din_2', name: 'ムセール', kind: 'normal', floorId: 'f_dining',
    hp: 51, atk: 6, weaknessTag: 'medication', weaknessHint: 'スプレッドシート＝集計の杖',
    emoji: '🍽️', art: 'choke', color: '#c96f4a',
    flavor: '誤嚥・むせ込みのリスク。手順の確認と記録で落ち着かせる。',
  },
  {
    id: 'm_din_boss', name: 'ゴヤク・ゴーレム', kind: 'boss', floorId: 'f_dining',
    hp: 250, atk: 12, weaknessTag: 'medication', weaknessHint: 'スプレッドシート＝集計の杖',
    emoji: '🗿', art: 'golem', color: '#b5651d',
    flavor: '誤薬リスクの巨人。服薬チェック表の集計で崩せる。',
  },

  // ---- 浴室 ----
  {
    id: 'm_bath_1', name: 'バイキンダマ', kind: 'normal', floorId: 'f_bath',
    hp: 63, atk: 7, weaknessTag: 'infection', weaknessHint: 'Canva＝デザインキット',
    emoji: '🦠', art: 'germ', color: '#6aa84f',
    flavor: '感染症のもと。分かりやすい掲示で予防を徹底すると消える。',
  },
  {
    id: 'm_bath_2', name: 'ヌレユカ・浴', kind: 'normal', floorId: 'f_bath',
    hp: 60, atk: 7, weaknessTag: 'fall', weaknessHint: 'Chrome＝探索ゴーグル',
    emoji: '💧', art: 'wetfloor', color: '#3aa0c9',
    flavor: '浴室の滑りやすさ。予防情報の探索で転倒を防ぐ。',
  },
  {
    id: 'm_bath_boss', name: 'パンデミ・キング', kind: 'boss', floorId: 'f_bath',
    hp: 296, atk: 14, weaknessTag: 'infection', weaknessHint: 'Canva＝デザインキット',
    emoji: '👑', art: 'germking', color: '#38761d',
    flavor: '感染拡大の王。手指衛生の掲示物で予防意識を広げると弱る。',
  },

  // ---- ナースステーション ----
  {
    id: 'm_sta_1', name: 'バラバラ札', kind: 'normal', floorId: 'f_station',
    hp: 72, atk: 8, weaknessTag: 'sharing', weaknessHint: 'Google Drive＝共有キー',
    emoji: '🗂️', art: 'papers', color: '#8e7cc3',
    flavor: '情報がバラバラに散った状態。クラウド共有で一つにまとまる。',
  },
  {
    id: 'm_sta_2', name: 'モレゴースト・参', kind: 'normal', floorId: 'f_station',
    hp: 69, atk: 8, weaknessTag: 'record', weaknessHint: 'Googleドキュメント＝共同編集の書',
    emoji: '👻', art: 'ghost', color: '#9b8cff',
    flavor: '申し送りの記録漏れ。コメント機能で確認し合うと消える。',
  },
  {
    id: 'm_sta_boss', name: 'ブンダン・ウォール', kind: 'boss', floorId: 'f_station',
    hp: 343, atk: 16, weaknessTag: 'sharing', weaknessHint: 'Google Drive＝共有キー',
    emoji: '🧱', art: 'wall', color: '#674ea7',
    flavor: '情報の分断を生む壁。共有キーで全員に情報を届けると崩れる。',
  },

  // ---- 事務所 ----
  {
    id: 'm_off_1', name: 'ヤマモリ書類', kind: 'normal', floorId: 'f_office',
    hp: 81, atk: 9, weaknessTag: 'overwork', weaknessHint: 'Googleカレンダー＝時のコンパス',
    emoji: '📚', art: 'docs', color: '#bf9000',
    flavor: '山積みの業務。予定を可視化して分散すると片付く。',
  },
  {
    id: 'm_off_2', name: 'モレゴースト・肆', kind: 'normal', floorId: 'f_office',
    hp: 78, atk: 9, weaknessTag: 'record', weaknessHint: 'スプレッドシート＝集計の杖',
    emoji: '👻', art: 'ghost', color: '#9b8cff',
    flavor: '事務作業の記録漏れ。条件付き書式で抜けを可視化して撃退。',
  },
  {
    id: 'm_off_boss', name: 'タスク・ヒドラ', kind: 'boss', floorId: 'f_office',
    hp: 390, atk: 18, weaknessTag: 'overwork', weaknessHint: 'Googleカレンダー＝時のコンパス',
    emoji: '🐙', art: 'hydra', color: '#7f6000',
    flavor: '無限に増える業務過多の化身。予定管理と共有で頭数を減らせる。',
  },

  // ---- 会議室 ----
  {
    id: 'm_mtg_1', name: 'トオイ壁', kind: 'normal', floorId: 'f_meeting',
    hp: 90, atk: 10, weaknessTag: 'remote', weaknessHint: 'Zoom＝遠隔通信リング',
    emoji: '📡', art: 'farwall', color: '#45818e',
    flavor: '距離による連携の壁。オンラインで顔を合わせると越えられる。',
  },
  {
    id: 'm_mtg_boss', name: 'デンパギレ魔', kind: 'boss', floorId: 'f_meeting',
    hp: 437, atk: 20, weaknessTag: 'remote', weaknessHint: 'Zoom＝遠隔通信リング',
    emoji: '📵', art: 'nosignal', color: '#2f5c66',
    flavor: '連絡が途切れる魔物。画面共有と定例会で連携を取り戻すと弱る。',
  },

  // ---- 施設全体（ラスボス） ----
  {
    id: 'm_fac_1', name: 'イイワスレ鬼', kind: 'normal', floorId: 'f_facility',
    hp: 99, atk: 11, weaknessTag: 'handover', weaknessHint: 'ChatGPT＝AIサポート端末',
    emoji: '💭', art: 'forget', color: '#a64d79',
    flavor: '申し送りの言い忘れ。要点整理をAIが助け、人が確認して封じる。',
  },
  {
    id: 'm_fac_boss', name: 'ダンゼツ・オーバーロード', kind: 'last', floorId: 'f_facility',
    hp: 660, atk: 24, weaknessTag: 'handover', weaknessHint: 'ChatGPT＝AIサポート端末',
    emoji: '🌪️', art: 'overlord', color: '#741b47',
    flavor:
      '情報の断絶が施設全体を覆う最終形。介護スキルとITスキル、そしてチーム連携の全てで立ち向かう。',
  },
]

// ============================================================
// 中ボス = 通常敵とフロアボスの中間。フロアで学ぶツールが弱点になるよう設計し、
// 「そのフロアのITツールを覚えたか」を試す関門にしている。
// ============================================================
const MID_BOSSES: Monster[] = [
  {
    id: 'm_rec_mid', name: 'マチクタビレ', kind: 'mid', floorId: 'f_reception',
    hp: 88, atk: 6, weaknessTag: 'claim', weaknessHint: 'Gmail＝伝達の羽ペン',
    emoji: '⏰', art: 'mid_wait', color: '#5b7fa6',
    flavor: '「連絡します」のまま放置され、待たされ続けたご家族の不満が形になったもの。すぐに一報を入れれば消える。',
  },
  {
    id: 'm_room_mid', name: 'ミマモリモレ', kind: 'mid', floorId: 'f_room',
    hp: 110, atk: 7, weaknessTag: 'record', weaknessHint: 'Googleドキュメント＝共同編集の書',
    emoji: '🏮', art: 'mid_watch', color: '#d98c3f',
    flavor: '見守りの気づきが誰にも共有されないまま消えていく。書いて残せば、次の人が気づける。',
  },
  {
    id: 'm_din_mid', name: 'バタバタ配膳', kind: 'mid', floorId: 'f_dining',
    hp: 136, atk: 9, weaknessTag: 'overwork', weaknessHint: 'Googleカレンダー＝時のコンパス',
    emoji: '🍜', art: 'mid_rush', color: '#d05f7d',
    flavor: '慌ただしい配膳が確認ミスを呼ぶ。段取りを決めて可視化すれば落ち着く。',
  },
  {
    id: 'm_bath_mid', name: 'テジュンバラバラ', kind: 'mid', floorId: 'f_bath',
    hp: 158, atk: 10, weaknessTag: 'sharing', weaknessHint: 'Google Drive＝共有キー',
    emoji: '📜', art: 'mid_steps', color: '#4fae9c',
    flavor: '人によって入浴手順がバラバラ。共有マニュアルを1つにまとめると解ける。',
  },
  {
    id: 'm_sta_mid', name: 'カキワスレ', kind: 'mid', floorId: 'f_station',
    hp: 185, atk: 12, weaknessTag: 'record', weaknessHint: 'Googleドキュメント＝共同編集の書',
    emoji: '🫗', art: 'mid_forgetnote', color: '#8e7cc3',
    flavor: '「あとで書こう」が積もった結果。その場で同時に書ける仕組みが弱点。',
  },
  {
    id: 'm_off_mid', name: 'ニュウリョクミス', kind: 'mid', floorId: 'f_office',
    hp: 211, atk: 13, weaknessTag: 'record', weaknessHint: 'スプレッドシート＝集計の杖',
    emoji: '⌨️', art: 'mid_typo', color: '#bf9000',
    flavor: '手入力の打ち間違いが数字を狂わせる。入力規則と条件付き書式で防げる。',
  },
  {
    id: 'm_mtg_mid', name: 'セツゾクフアン', kind: 'mid', floorId: 'f_meeting',
    hp: 238, atk: 15, weaknessTag: 'remote', weaknessHint: 'Zoom／Google Meet＝遠隔通信リング・招集の水晶',
    emoji: '🌀', art: 'mid_lag', color: '#45818e',
    flavor: '「聞こえますか？」でオンライン会議が終わってしまう。事前の接続確認と使い慣れが弱点。',
  },
  {
    id: 'm_fac_mid', name: 'ジョウホウマイゴ', kind: 'mid', floorId: 'f_facility',
    hp: 286, atk: 17, weaknessTag: 'handover', weaknessHint: 'ChatGPT＝AIサポート端末',
    emoji: '🌐', art: 'mid_lost', color: '#a64d79',
    flavor: '施設のどこかで情報が迷子になる。要点を整理して確実に届ければ道が開ける。',
  },
]

MONSTERS.push(...MID_BOSSES)

export const MONSTER_MAP: Record<string, Monster> = Object.fromEntries(
  MONSTERS.map((m) => [m.id, m]),
)

export const getMonster = (id: string): Monster => MONSTER_MAP[id]
