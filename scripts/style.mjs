// ============================================================
// アセット生成の共通アートディレクション。
// 全画像でこの指示を共有し、画風のブレを防ぐ。
// ============================================================

/** 全アセット共通の画風。ここを変えると全体の見た目が変わる。 */
export const STYLE = [
  'friendly storybook JRPG game asset',
  'bold clean black outlines, soft cel shading, warm inviting palette',
  'bright saturated colors, high contrast and highly readable at small sizes',
  'designed for a mobile game played by care workers of all ages, including people in their 60s',
  'no text, no letters, no numbers, no logos, no watermark, no UI frames',
].join(', ')

/**
 * キャラ・敵・アイテムなど、切り抜いて配置するもの。
 * gpt-image-2 は透過背景を出力できないため、クロマキー用の単色背景で生成し、
 * scripts/cutout.mjs で縁から連結した背景だけを抜いて透過PNGにする。
 */
export const CHROMA_HEX = '#00ff00'

export const SPRITE = [
  STYLE,
  'single subject centered in frame, full body, facing viewer',
  'clean silhouette with generous empty margin around the subject',
  'the subject itself must not contain any pure chroma-key green',
  'placed on a completely flat uniform pure chroma-key green background (RGB 0,255,0)',
  'absolutely no shadow, no gradient, no floor, no ground, no vignette — the background is one single flat green color',
].join(', ')

/**
 * 敵の造形ルール（Care-Safety）。
 * 敵は介護現場の「困りごと」であって、利用者ではない。
 * 高齢者・利用者・介護職員を敵として描かせないための強い制約。
 */
export const MONSTER_SAFETY = [
  'the creature is an abstract personification of a WORKPLACE PROBLEM, never a person',
  'it must NOT resemble any human being, especially not an elderly person, a patient, a care recipient or a caregiver',
  'non-human shape only: cloud, slime, ghost, golem, blob, object-creature',
  'mischievous and a little troublesome, but cute and non-frightening, never gory or scary',
].join(', ')

/** 武器・お守りなど、手に取る物 */
export const ITEM = [
  SPRITE,
  'a magical RPG item, glowing softly, slight sparkle',
  'three-quarter view, sitting at a slight angle, looks collectible',
].join(', ')

/** フロア背景 */
export const BACKGROUND = [
  STYLE,
  'wide establishing shot of an empty interior, no people, no characters',
  'gentle depth, soft lighting, calm and clean Japanese elderly care facility',
  'vertical portrait composition, the lower third is open floor space so a character can stand there',
].join(', ')
