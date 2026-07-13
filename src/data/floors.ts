import type { Floor } from '@/types'

// ============================================================
// フロア = 施設のダンジョン。受付→…→施設全体へと進む。
// 各フロアで学ぶITツールと、テーマとなる困りごとを紐付ける。
// ============================================================

export const FLOORS: Floor[] = [
  {
    id: 'f_reception', order: 1, name: '受付',
    theme: '第一印象・クレームの入口',
    learnTools: ['chrome', 'gmail'],
    recommendedLevel: 1,
    bg: 'linear-gradient(160deg,#dff1ff,#b9dcff)',
    emoji: '🛎️',
    enemyIds: ['m_rec_1', 'm_rec_2'],
    midBossId: 'm_rec_mid',
    bossId: 'm_rec_boss',
    story:
      '配属初日。受付で不安げなご家族に出会う。伝え漏れが「不満のモヤ」を生む現場で、まずは丁寧な連絡と検索の力を身につける。',
  },
  {
    id: 'f_room', order: 2, name: '居室',
    theme: '転倒リスク・記録漏れ',
    learnTools: ['chrome', 'docs'],
    recommendedLevel: 2,
    bg: 'linear-gradient(160deg,#fff3e0,#ffd9a8)',
    emoji: '🛏️',
    enemyIds: ['m_room_1', 'm_room_2'],
    midBossId: 'm_room_mid',
    bossId: 'm_room_boss',
    story:
      '居室では転倒リスクと記録漏れが立ちはだかる。環境整備と、みんなで同時に記録する力で入居者の安全を守る。',
  },
  {
    id: 'f_dining', order: 3, name: '食堂',
    theme: '誤薬・誤嚥',
    learnTools: ['sheets', 'calendar'],
    recommendedLevel: 3,
    bg: 'linear-gradient(160deg,#fde7ef,#ffc6d9)',
    emoji: '🍚',
    enemyIds: ['m_din_1', 'm_din_2'],
    midBossId: 'm_din_mid',
    bossId: 'm_din_boss',
    story:
      '食堂では誤薬と誤嚥のリスクが潜む。チェック表の集計と予定管理で、確認をしくみに変えていく。',
  },
  {
    id: 'f_bath', order: 4, name: '浴室',
    theme: '感染症・入浴事故',
    learnTools: ['canva', 'drive'],
    recommendedLevel: 4,
    bg: 'linear-gradient(160deg,#e3f7f4,#b6e8df)',
    emoji: '🛁',
    enemyIds: ['m_bath_1', 'm_bath_2'],
    midBossId: 'm_bath_mid',
    bossId: 'm_bath_boss',
    story:
      '浴室は感染とヒートショックの難所。分かりやすい掲示物と、全員が見られる共有マニュアルで予防を徹底する。',
  },
  {
    id: 'f_station', order: 5, name: 'ナースステーション',
    theme: '情報共有不足・申し送り',
    learnTools: ['drive', 'docs'],
    recommendedLevel: 5,
    bg: 'linear-gradient(160deg,#eae6ff,#c9bdf5)',
    emoji: '🩺',
    enemyIds: ['m_sta_1', 'm_sta_2'],
    midBossId: 'm_sta_mid',
    bossId: 'm_sta_boss',
    story:
      '情報が分断されがちなナースステーション。クラウド共有とコメントで、チームの情報を一つにまとめる。',
  },
  {
    id: 'f_office', order: 6, name: '事務所',
    theme: '業務過多・書類',
    learnTools: ['calendar', 'sheets'],
    recommendedLevel: 6,
    bg: 'linear-gradient(160deg,#fff8db,#ffe89a)',
    emoji: '🗄️',
    enemyIds: ['m_off_1', 'm_off_2'],
    midBossId: 'm_off_mid',
    bossId: 'm_off_boss',
    story:
      '山積みの書類と業務過多。予定の可視化と自動化で、抱え込みをチームの力に変えていく。',
  },
  {
    id: 'f_meeting', order: 7, name: '会議室',
    theme: '遠隔連携・研修不足',
    learnTools: ['zoom', 'meet'],
    recommendedLevel: 7,
    bg: 'linear-gradient(160deg,#e2f0e9,#b7dcc9)',
    emoji: '📽️',
    enemyIds: ['m_mtg_1'],
    midBossId: 'm_mtg_mid',
    bossId: 'm_mtg_boss',
    story:
      '離れた事業所や在宅との連携が課題の会議室。オンライン会議と画面共有で、距離の壁を越える。',
  },
  {
    id: 'f_facility', order: 8, name: '施設全体',
    theme: 'DX統合・情報の断絶',
    learnTools: ['chatgpt'],
    recommendedLevel: 9,
    bg: 'linear-gradient(160deg,#efe1f5,#d3b7ea)',
    emoji: '🏥',
    enemyIds: ['m_fac_1'],
    midBossId: 'm_fac_mid',
    bossId: 'm_fac_boss',
    story:
      '最後の舞台は施設全体。情報の断絶を乗り越え、AIも味方につけて、施設改革リーダーとして現場を一つにする。',
  },
]

export const FLOOR_MAP: Record<string, Floor> = Object.fromEntries(
  FLOORS.map((f) => [f.id, f]),
)

export const getFloor = (id: string): Floor => FLOOR_MAP[id]

export const nextFloorId = (id: string): string | null => {
  const cur = FLOOR_MAP[id]
  if (!cur) return null
  const next = FLOORS.find((f) => f.order === cur.order + 1)
  return next ? next.id : null
}
