import type { Charm, Floor, Monster, Weapon } from '@/types'

// ============================================================
// 画像アセットの参照。実体は public/assets/ 以下（scripts/gen-assets.mjs で生成）。
// スプライトは透過PNG、背景画はWebP。
// ============================================================

const base = import.meta.env.BASE_URL

const url = (path: string) => `${base}assets/${path}`

export const HERO_ART = url('characters/hero.png')
export const TITLE_ART = url('misc/title.webp')

export const monsterArt = (m: Monster) => url(`monsters/${m.art}.png`)
export const weaponArt = (w: Weapon) => url(`weapons/${w.id}.png`)
export const charmArt = (c: Charm) => url(`charms/${c.id}.png`)
export const floorArt = (f: Floor) => url(`floors/${f.id}.webp`)
