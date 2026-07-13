import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Sprite } from '@/components/ui'
import { FLOORS, getFloor } from '@/data/floors'
import { getMonster } from '@/data/monsters'
import { floorArt, monsterArt } from '@/data/art'

export function MapScreen() {
  const player = useGameStore((s) => s.player)
  const startEncounter = useGameStore((s) => s.startEncounter)
  const [openId, setOpenId] = useState<string>(player.currentFloorId)

  const clearedOrders = player.clearedFloors.map((id) => getFloor(id).order)
  const maxCleared = clearedOrders.length ? Math.max(...clearedOrders) : 0
  const unlockedMax = maxCleared + 1

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">🗺️ 現場マップ</div>
      </div>
      <p className="muted">
        フロアを選んで、現場の困りごと（モンスター）に挑もう。ボスを倒すとフロア攻略！
      </p>

      <div className="stack">
        {FLOORS.map((floor) => {
          const unlocked = floor.order <= unlockedMax
          const isCleared = player.clearedFloors.includes(floor.id)
          const open = openId === floor.id
          return (
            <div key={floor.id}>
              <div
                className={`floor-card ${unlocked ? '' : 'locked'}`}
                style={{
                  background: floor.bg,
                  backgroundImage: unlocked ? `url(${floorArt(floor)})` : undefined,
                  minHeight: 132,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
                onClick={() => unlocked && setOpenId(open ? '' : floor.id)}
              >
                <div className="row floor-card__body grow">
                  {!unlocked && <div style={{ fontSize: 40 }}>🔒</div>}
                  <div className="grow">
                    <div className="floor-card__no">
                      B{floor.order}F ・ 推奨Lv.{floor.recommendedLevel}
                      {isCleared && ' ・ ✅攻略済'}
                    </div>
                    <div className="h2">{floor.name}</div>
                    <div className="muted">テーマ：{floor.theme}</div>
                  </div>
                  {unlocked && <div style={{ fontSize: 20, opacity: 0.5 }}>{open ? '▲' : '▼'}</div>}
                </div>
              </div>

              {unlocked && open && (
                <Panel className="stack--sm fade-in" style={{ marginTop: 8 }}>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>{floor.story}</p>
                  <div className="divider" />
                  {floor.enemyIds.map((mid) => {
                    const m = getMonster(mid)
                    return (
                      <EncounterRow
                        key={mid}
                        art={monsterArt(m)}
                        emoji={m.emoji}
                        name={m.name}
                        sub={`通常・HP${m.hp}`}
                        onClick={() => startEncounter(floor.id, mid)}
                      />
                    )
                  })}
                  {(() => {
                    const m = getMonster(floor.midBossId)
                    return (
                      <EncounterRow
                        mid
                        art={monsterArt(m)}
                        emoji={m.emoji}
                        name={m.name}
                        sub={`中ボス・HP${m.hp}`}
                        onClick={() => startEncounter(floor.id, floor.midBossId)}
                      />
                    )
                  })()}
                  <EncounterRow
                    boss
                    art={monsterArt(getMonster(floor.bossId))}
                    emoji={getMonster(floor.bossId).emoji}
                    name={getMonster(floor.bossId).name}
                    sub={`${getMonster(floor.bossId).kind === 'last' ? 'ラスボス' : 'フロアボス'}・HP${getMonster(floor.bossId).hp}`}
                    onClick={() => startEncounter(floor.id, floor.bossId)}
                  />
                </Panel>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EncounterRow({
  art,
  emoji,
  name,
  sub,
  onClick,
  mid,
  boss,
}: {
  art: string
  emoji: string
  name: string
  sub: string
  onClick: () => void
  mid?: boolean
  boss?: boolean
}) {
  return (
    <div
      className="row"
      style={{
        padding: '8px 10px',
        borderRadius: 12,
        background: boss ? '#fff4e0' : mid ? '#f3edff' : '#f4f7fb',
        border: boss
          ? '2px solid var(--gold)'
          : mid
            ? '2px solid #a78bfa'
            : '1px solid #e2e8f0',
      }}
    >
      <Sprite src={art} alt={name} size={boss ? 56 : mid ? 50 : 44} fallback={emoji} />
      <div className="grow">
        <div className="row wrap" style={{ gap: 6, fontWeight: 800 }}>
          {name}
          {boss && <span className="badge" style={{ background: 'var(--gold-deep)' }}>BOSS</span>}
          {mid && <span className="badge" style={{ background: '#7c5cd6' }}>中ボス</span>}
        </div>
        <div className="muted">{sub}</div>
      </div>
      <Button variant={boss ? 'gold' : mid ? 'danger' : 'primary'} onClick={onClick}>
        挑戦
      </Button>
    </div>
  )
}
