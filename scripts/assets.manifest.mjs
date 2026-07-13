import { SPRITE, ITEM, BACKGROUND, MONSTER_SAFETY, STYLE } from './style.mjs'

// ============================================================
// 生成するアセットの一覧。
// key = 出力ファイル名（public/assets/<dir>/<key>.png）。
// コードからは src/data/art.ts 経由で参照する。
// ============================================================

const sprite = (p) => `${p}. ${SPRITE}`
const item = (p) => `${p}. ${ITEM}`
const bg = (p) => `${p}. ${BACKGROUND}`
const foe = (p) => `${p}. ${MONSTER_SAFETY}. ${SPRITE}`

/** キャラクター */
export const CHARACTERS = {
  hero: sprite(
    'A cheerful young Japanese care worker, the player character of an RPG. ' +
      'Wearing a clean light-blue care uniform (polo shirt and comfortable trousers), short dark hair, ' +
      'a warm confident smile, standing in a brave heroic adventurer pose with fists ready, ' +
      'a small tablet device clipped at the waist like an adventurer\'s tool',
  ),
}

/** 敵 = 現場の「困りごと」。人間には決して見せない。 */
export const MONSTERS = {
  // 受付
  haze: foe(
    'A grumpy little storm cloud creature made of gray-blue haze, the personification of unspoken complaints. ' +
      'Puffy cloud body, small pouting face, tiny grumbling swirls drifting off it',
  ),
  ghost: foe(
    'A small mischievous purple ghost creature made of blank paper, the personification of a missing care record. ' +
      'Its body is a torn sheet of paper with a hole in the middle where writing should be, wobbly tail, cute worried eyes',
  ),
  typhoon: foe(
    'A big swirling deep-blue typhoon creature, the personification of an escalating complaint. ' +
      'Spiral vortex body, angry eyebrows, small lightning sparks, powerful boss-monster presence',
  ),

  // 居室・浴室
  wetfloor: foe(
    'A slippery water-puddle creature on the floor, the personification of a fall risk. ' +
      'Glossy blue puddle body with splashing arms, sly grin, tiny water droplets bouncing around it',
  ),
  wave: foe(
    'A giant teal wave creature wearing a tiny crown, the personification of a major slipping hazard, a boss monster. ' +
      'Towering curling wave body, mischievous face in the foam, imposing but cartoonish',
  ),

  // 食堂
  pill: foe(
    'A small round pill-shaped creature, the personification of a medication-error risk. ' +
      'Capsule body in orange and white, sneaky eyes, tiny legs, looks like it is about to slip into the wrong hand',
  ),
  choke: foe(
    'A plate-and-spoon creature, the personification of a choking risk at mealtime. ' +
      'Ceramic plate body with a spoon arm, coughing expression, small steam puffs',
  ),
  golem: foe(
    'A huge rocky golem built out of stacked medicine capsules and pill sheets, a boss monster, ' +
      'the personification of medication-error risk. Heavy stone-like body, glowing orange cracks, stomping pose',
  ),

  // 浴室
  germ: foe(
    'A round fuzzy green germ creature with wiggly spikes, the personification of infection risk. ' +
      'Bouncy ball body, many tiny eyes, cheeky grin, small spore puffs around it',
  ),
  germking: foe(
    'A large green germ monarch wearing a golden crown, a boss monster, the personification of an infection outbreak. ' +
      'Spiky round body, regal cape made of mist, arrogant expression',
  ),

  // ナースステーション
  papers: foe(
    'A creature made of scattered loose paper notes flying apart in all directions, ' +
      'the personification of information that is not shared. Purple sticky notes and cards swirling into a rough body shape, confused eyes',
  ),
  wall: foe(
    'A thick brick wall creature standing upright, a boss monster, the personification of information silos between teams. ' +
      'Purple-gray bricks, stern face carved into the wall, arms made of bricks crossed defensively',
  ),

  // 事務所
  docs: foe(
    'A towering wobbling stack of paperwork and binders with a tired face, ' +
      'the personification of an overwhelming workload. Yellow-brown folders, papers spilling out, teetering pose',
  ),
  hydra: foe(
    'A many-armed octopus-like creature, a boss monster, the personification of endless multiplying tasks. ' +
      'Dark yellow body, each tentacle holding a different office object (stapler, folder, phone, clipboard), overwhelmed grin',
  ),

  // 会議室
  farwall: foe(
    'A tall stone wall creature with a broken antenna on top, the personification of the distance between remote sites. ' +
      'Teal stone body, sad disconnected face, static sparks at the antenna',
  ),
  nosignal: foe(
    'A demon-like creature made of dead static and broken signal waves, a boss monster, ' +
      'the personification of communication breakdown. Dark teal body of glitchy noise, crossed-out signal bars floating around it',
  ),

  // ---- 中ボス（各フロア1体） ----
  mid_wait: foe(
    'A clock-faced creature with impatiently tapping feet, a mid-boss, the personification of families kept waiting at reception. ' +
      'Steel-blue clock body, drumming fingers, irritated tapping expression, ticking marks around it',
  ),
  mid_watch: foe(
    'A blindfolded lantern creature, a mid-boss, the personification of missed observations in a resident room. ' +
      'Orange lantern body with a cloth over its eye, dim flickering light, stumbling posture',
  ),
  mid_rush: foe(
    'A frantic meal-tray creature spinning plates in a panic, a mid-boss, the personification of a chaotic rushed mealtime. ' +
      'Pink-red tray body, many arms juggling bowls, dizzy swirling eyes, motion blur lines',
  ),
  mid_steps: foe(
    'A tangled scroll creature whose written steps are scrambled and knotted, a mid-boss, ' +
      'the personification of inconsistent bathing procedures. Mint-green rolled paper body, knotted ribbons, confused face',
  ),
  mid_forgetnote: foe(
    'A leaking ink-bottle creature dripping words onto the floor, a mid-boss, ' +
      'the personification of records that never get written down. Lavender glass body, spilled ink puddle, guilty expression',
  ),
  mid_typo: foe(
    'A glitchy keyboard creature with keys popping off, a mid-boss, the personification of data-entry mistakes. ' +
      'Yellow-brown keyboard body, jumbled flying keycaps, cross-eyed glitchy face',
  ),
  mid_lag: foe(
    'A frozen buffering-wheel creature wrapped in tangled cables, a mid-boss, ' +
      'the personification of unstable online-meeting connections. Teal spinning-wheel body, tangled cords, pixelated stuttering edges',
  ),
  mid_lost: foe(
    'A maze-shaped creature with a lost message trapped inside it, a mid-boss, ' +
      'the personification of information that gets lost across a whole facility. Magenta labyrinth body, a small paper note stuck in its center, sly grin',
  ),

  // 施設全体
  forget: foe(
    'A floating thought-bubble creature with two tiny horns, the personification of a forgotten handover. ' +
      'Pink-magenta cloudy bubble body, dotted trailing tail, forgetful dizzy spiral eyes',
  ),
  overlord: foe(
    'A massive dark-purple tornado overlord, the final boss, the personification of total information breakdown across a facility. ' +
      'Towering vortex body, glowing magenta eyes, broken chains and torn papers spiralling around it, epic and imposing but still cartoonish',
  ),
}

/** 武器 = ITツールを宿した道具 */
export const WEAPONS = {
  w_chrome: item(
    'A pair of magical explorer goggles with round colorful lenses (red, yellow, green, blue accents), ' +
      'radiating a soft search-beam glow, an RPG weapon representing web-search skill',
  ),
  w_gmail: item(
    'A magical white quill pen with a red envelope-shaped gem at its base, trailing a gentle red ribbon of light, ' +
      'an RPG weapon representing careful written communication',
  ),
  w_docs: item(
    'A glowing open magic tome with a blue cover, several small quill pens writing on it at once, ' +
      'an RPG weapon representing collaborative record keeping',
  ),
  w_sheets: item(
    'A magical wand topped with a green grid-shaped crystal, tiny glowing numbers orbiting it, ' +
      'an RPG weapon representing spreadsheets and tallying',
  ),
  w_calendar: item(
    'A golden magical compass whose face is a calendar dial, glowing hands pointing to the right time, ' +
      'an RPG weapon representing schedule management',
  ),
  w_drive: item(
    'An ornate golden key whose bow is shaped like a cloud, radiating shared beams of light, ' +
      'an RPG weapon representing cloud file sharing',
  ),
  w_canva: item(
    'A magical designer toolkit: a palette, brush and a bright poster board, colorful paint splashes swirling around it, ' +
      'an RPG weapon representing poster design',
  ),
  w_zoom: item(
    'A glowing blue ring with a small camera lens set in it, projecting soft holographic video panels, ' +
      'an RPG weapon representing online meetings',
  ),
  w_meet: item(
    'A floating green crystal orb that projects small holographic portraits of teammates gathering around it, ' +
      'radiating a calm green summoning light, an RPG weapon representing summoning the team to a video meeting',
  ),
  w_chatgpt: item(
    'A sleek futuristic handheld AI terminal with a friendly glowing screen and a small floating robot helper beside it, ' +
      'radiating rainbow light, the strongest RPG weapon representing AI assistance',
  ),
}

/** お守り = 研修ガチャの排出物 */
export const CHARMS = {
  c_memo: item('A small notepad charm on a red string, a tiny pencil tucked into it, humble and cute'),
  c_pen: item('A three-color ballpoint pen charm (red, blue, black) on a string, gently glowing'),
  c_fusen: item('A charm made of a fan of colorful sticky notes on a string, fluttering slightly'),
  c_hosuukei: item('A pedometer charm shaped like a tiny sneaker with a step counter on it, cheerful and energetic'),
  c_sensor: item('A watchful sensor charm: a small rounded monitoring device emitting gentle protective wave rings'),
  c_laptop: item('A tiny laptop computer charm with a glowing screen, sparkling with soft blue light'),
  c_tablet: item('A tiny tablet device charm held by a small strap, a stylus beside it, glowing warmly'),
  c_karte: item('An electronic health record charm: a small glowing card index box with digital records floating out of it'),
  c_wul: item(
    'A radiant golden certification badge charm, star-shaped medal with a ribbon, the rarest legendary item, ' +
      'brilliant rainbow sparkles and lens flare',
  ),
}

/** フロア背景（縦画面） */
export const FLOORS = {
  f_reception: bg(
    'The reception lobby of a warm Japanese elderly care facility. Wooden reception counter, a small bell, ' +
      'potted plants, soft morning light through big windows, light blue palette',
  ),
  f_room: bg(
    'A private resident room in an elderly care facility. A neat care bed with handrails, bedside table, ' +
      'a window with curtains, warm orange afternoon light',
  ),
  f_dining: bg(
    'The dining hall of an elderly care facility. Rounded tables and chairs, tableware set out, a serving counter, ' +
      'a medication cart to the side, soft pink and cream palette',
  ),
  f_bath: bg(
    'The bathing room of an elderly care facility. A safe assisted bathtub with handrails, non-slip floor, ' +
      'steam in the air, clean tiles, fresh mint-green palette',
  ),
  f_station: bg(
    'The nurse station of a care facility. A long counter with monitors, shelves of binders, a whiteboard schedule, ' +
      'cool lavender-purple palette',
  ),
  f_office: bg(
    'The back office of a care facility. Desks piled with paperwork, filing cabinets, a wall clock, ' +
      'a computer, warm yellow palette',
  ),
  f_meeting: bg(
    'The meeting room of a care facility. A long table, chairs, a projector screen showing an online meeting grid, ' +
      'a webcam on a tripod, calm green palette',
  ),
  f_facility: bg(
    'A grand wide view of an entire elderly care facility building at golden hour, seen from the garden, ' +
      'dramatic sky, hopeful and epic final-stage atmosphere, purple palette',
  ),
}

/** その他（タイトル画・アプリアイコン） */
export const MISC = {
  title: `Key art for a mobile RPG title screen called a care-work adventure. ${STYLE}. Vertical portrait composition. A cheerful young Japanese care worker in a light-blue uniform standing bravely in front of a warm care facility, holding a glowing tablet like a magic item, sunrise sky behind, adventure and hope, empty space at the top and bottom for a title and buttons, no text`,
  icon: `App icon for a care-work RPG: a bold simple emblem combining a heart and a glowing digital tablet, thick outlines, flat vivid colors, centered on a warm gold and blue background, extremely readable at 64x64 pixels. ${STYLE}`,
}

/** 生成対象すべて。dir はファイルの出力先。 */
export const MANIFEST = [
  ...Object.entries(CHARACTERS).map(([id, prompt]) => ({ id, prompt, dir: 'characters', size: '1024x1024', transparent: true })),
  ...Object.entries(MONSTERS).map(([id, prompt]) => ({ id, prompt, dir: 'monsters', size: '1024x1024', transparent: true })),
  ...Object.entries(WEAPONS).map(([id, prompt]) => ({ id, prompt, dir: 'weapons', size: '1024x1024', transparent: true })),
  ...Object.entries(CHARMS).map(([id, prompt]) => ({ id, prompt, dir: 'charms', size: '1024x1024', transparent: true })),
  ...Object.entries(FLOORS).map(([id, prompt]) => ({ id, prompt, dir: 'floors', size: '1024x1536', transparent: false })),
  ...Object.entries(MISC).map(([id, prompt]) => ({ id, prompt, dir: 'misc', size: id === 'icon' ? '1024x1024' : '1024x1536', transparent: false })),
]
