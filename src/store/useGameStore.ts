import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ITToolId, PlayerState } from '@/types'
import {
  MAX_WEAPON_LEVEL,
  REVIEW_SHARDS,
  applyXp,
  effectiveMaxHp,
  enhanceCost,
  roleForLevel,
  weaponLevel,
  type LevelUpResult,
} from '@/game/engine'
import { TICKET_GOLD_COST, rollGacha, type GachaResult } from '@/game/gacha'
import { SKILL_MAP } from '@/data/skillTree'
import { TITLES } from '@/data/titles'
import { nextFloorId } from '@/data/floors'

export type Route =
  | 'title'
  | 'home'
  | 'map'
  | 'battle'
  | 'skilltree'
  | 'weapons'
  | 'gacha'
  | 'codex'
  | 'facility'
  | 'profile'

const NEW_PLAYER: PlayerState = {
  name: '',
  role: '見習い介護士',
  level: 1,
  xp: 0,
  hp: 30,
  maxHp: 30,
  baseAtk: 8,
  skillPoints: 0,
  gold: 0,
  tickets: 0,
  shards: 0,
  ownedWeapons: [],
  equippedWeaponId: null,
  weaponLevels: {},
  ownedCharms: [],
  equippedCharmId: null,
  ownedCards: [],
  unlockedSkills: [],
  earnedTitles: ['t_rookie'],
  currentTitleId: 't_rookie',
  clearedFloors: [],
  currentFloorId: 'f_reception',
  defeatedMonsters: [],
  answeredItTools: [],
  facilityLevel: 0,
  createdAt: 0,
}

interface GameState {
  player: PlayerState
  route: Route
  selectedFloorId: string | null
  selectedMonsterId: string | null
  hydrated: boolean

  // navigation
  navigate: (r: Route) => void
  selectFloor: (id: string | null) => void
  startEncounter: (floorId: string, monsterId: string) => void

  // lifecycle
  startNewGame: (name: string) => void
  resetGame: () => void

  // inventory / growth
  equipWeapon: (id: string) => void
  /** 武器を入手。すでに持っていれば「復習」として欠片に変わる */
  addWeapon: (id: string) => { isNew: boolean; shards: number }
  enhanceWeapon: (id: string) => boolean
  equipCharm: (id: string) => void
  unlockSkill: (id: string) => boolean
  setCurrentTitle: (id: string) => void

  // 研修ガチャ
  pullGacha: () => GachaResult | null
  buyTicket: () => boolean

  // battle commits
  setHp: (hp: number) => void
  healFull: () => void
  recordDefeat: (monsterId: string) => void
  recordItLearned: (tool: ITToolId) => void
  gainXp: (amount: number) => LevelUpResult
  addRewards: (gold: number, tickets: number) => void
  clearFloor: (floorId: string) => void
  refreshTitles: () => string[] // 新たに獲得した称号id
}

const hasGame = (p: PlayerState) => p.name.trim().length > 0

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: NEW_PLAYER,
      route: 'title',
      selectedFloorId: null,
      selectedMonsterId: null,
      hydrated: false,

      navigate: (r) => set({ route: r }),
      selectFloor: (id) => set({ selectedFloorId: id }),
      startEncounter: (floorId, monsterId) =>
        set({ selectedFloorId: floorId, selectedMonsterId: monsterId, route: 'battle' }),

      startNewGame: (name) => {
        const player: PlayerState = {
          ...NEW_PLAYER,
          name: name.trim() || '新人さん',
          createdAt: Date.now(),
        }
        player.hp = effectiveMaxHp(player)
        set({ player, route: 'home', selectedFloorId: null })
      },

      resetGame: () => set({ player: NEW_PLAYER, route: 'title', selectedFloorId: null }),

      equipWeapon: (id) =>
        set((s) => ({ player: { ...s.player, equippedWeaponId: id } })),

      addWeapon: (id) => {
        const s = get()
        if (s.player.ownedWeapons.includes(id)) {
          // 同じツールをもう一度学び直した＝復習。欠片になって強化に回せる。
          set({ player: { ...s.player, shards: s.player.shards + REVIEW_SHARDS } })
          return { isNew: false, shards: REVIEW_SHARDS }
        }
        const ownedWeapons = [...s.player.ownedWeapons, id]
        // 初めての武器なら自動装備
        const equippedWeaponId = s.player.equippedWeaponId ?? id
        set({ player: { ...s.player, ownedWeapons, equippedWeaponId } })
        return { isNew: true, shards: 0 }
      },

      enhanceWeapon: (id) => {
        const s = get()
        const p = s.player
        if (!p.ownedWeapons.includes(id)) return false
        const level = weaponLevel(p, id)
        if (level >= MAX_WEAPON_LEVEL) return false
        const cost = enhanceCost(level)
        if (p.shards < cost.shards || p.gold < cost.gold) return false
        set({
          player: {
            ...p,
            shards: p.shards - cost.shards,
            gold: p.gold - cost.gold,
            weaponLevels: { ...p.weaponLevels, [id]: level + 1 },
          },
        })
        return true
      },

      equipCharm: (id) =>
        set((s) =>
          s.player.ownedCharms.includes(id)
            ? {
                player: {
                  ...s.player,
                  // 装備中のお守りをもう一度タップしたら外す
                  equippedCharmId: s.player.equippedCharmId === id ? null : id,
                },
              }
            : {},
        ),

      pullGacha: () => {
        const s = get()
        const p = s.player
        if (p.tickets < 1) return null
        const result = rollGacha(p.ownedCharms, p.ownedCards)

        const next: PlayerState = {
          ...p,
          tickets: p.tickets - 1,
          shards: p.shards + result.shards,
        }
        if (result.kind === 'charm' && result.isNew) {
          next.ownedCharms = [...p.ownedCharms, result.charm.id]
          // 初めてのお守りなら自動装備
          if (p.equippedCharmId === null) next.equippedCharmId = result.charm.id
        }
        if (result.kind === 'card' && result.isNew) {
          next.ownedCards = [...p.ownedCards, result.card.id]
        }

        set({ player: next })
        return result
      },

      buyTicket: () => {
        const s = get()
        if (s.player.gold < TICKET_GOLD_COST) return false
        set({
          player: {
            ...s.player,
            gold: s.player.gold - TICKET_GOLD_COST,
            tickets: s.player.tickets + 1,
          },
        })
        return true
      },

      unlockSkill: (id) => {
        const s = get()
        const node = SKILL_MAP[id]
        if (!node) return false
        if (s.player.unlockedSkills.includes(id)) return false
        if (s.player.skillPoints < node.cost) return false
        const prereqOk = node.requires.every((r) => s.player.unlockedSkills.includes(r))
        if (!prereqOk) return false
        set({
          player: {
            ...s.player,
            unlockedSkills: [...s.player.unlockedSkills, id],
            skillPoints: s.player.skillPoints - node.cost,
          },
        })
        return true
      },

      setCurrentTitle: (id) =>
        set((s) =>
          s.player.earnedTitles.includes(id)
            ? { player: { ...s.player, currentTitleId: id } }
            : {},
        ),

      setHp: (hp) =>
        set((s) => ({
          player: { ...s.player, hp: Math.max(0, Math.min(hp, effectiveMaxHp(s.player))) },
        })),

      healFull: () =>
        set((s) => ({ player: { ...s.player, hp: effectiveMaxHp(s.player) } })),

      recordDefeat: (monsterId) =>
        set((s) =>
          s.player.defeatedMonsters.includes(monsterId)
            ? {}
            : { player: { ...s.player, defeatedMonsters: [...s.player.defeatedMonsters, monsterId] } },
        ),

      recordItLearned: (tool) =>
        set((s) =>
          s.player.answeredItTools.includes(tool)
            ? {}
            : { player: { ...s.player, answeredItTools: [...s.player.answeredItTools, tool] } },
        ),

      gainXp: (amount) => {
        const s = get()
        const { player, result } = applyXp(s.player, amount)
        set({ player })
        return result
      },

      addRewards: (gold, tickets) =>
        set((s) => ({
          player: {
            ...s.player,
            gold: s.player.gold + gold,
            tickets: s.player.tickets + tickets,
          },
        })),

      clearFloor: (floorId) =>
        set((s) => {
          const clearedFloors = s.player.clearedFloors.includes(floorId)
            ? s.player.clearedFloors
            : [...s.player.clearedFloors, floorId]
          const next = nextFloorId(floorId)
          const currentFloorId =
            next && !s.player.clearedFloors.includes(floorId) ? next : s.player.currentFloorId
          return {
            player: {
              ...s.player,
              clearedFloors,
              currentFloorId,
              facilityLevel: clearedFloors.length,
            },
          }
        }),

      refreshTitles: () => {
        const s = get()
        const p = s.player
        const newlyEarned: string[] = []
        for (const t of TITLES) {
          if (!p.earnedTitles.includes(t.id) && t.condition(p)) {
            newlyEarned.push(t.id)
          }
        }
        if (newlyEarned.length > 0) {
          set({
            player: { ...p, earnedTitles: [...p.earnedTitles, ...newlyEarned] },
          })
        }
        return newlyEarned
      },
    }),
    {
      name: 'wul-care-rpg-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ player: s.player }),
      version: 2,
      // 旧セーブには後から足したキー（shards / weaponLevels / ownedCharms / ownedCards）が無い。
      // 欠けているキーだけを新規プレイヤーの初期値で補い、進捗はそのまま残す。
      migrate: (persisted, version) => {
        const state = persisted as { player?: Partial<PlayerState> } | undefined
        if (!state?.player) return { player: NEW_PLAYER }
        if (version >= 2) return state
        return { player: { ...NEW_PLAYER, ...state.player } as PlayerState }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // ロード後、進行中のゲームがあればホームへ。役割も再計算。
        state.player.role = roleForLevel(state.player.level)
        state.hydrated = true
        state.route = hasGame(state.player) ? 'home' : 'title'
      },
    },
  ),
)
