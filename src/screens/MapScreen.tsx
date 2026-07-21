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

              {unlocked && open && (() => {
                // 通常敵をすべて倒す → 中ボス → フロアボス の順に解放する
                const defeated = player.defeatedMonsters
                const normalsDone = floor.enemyIds.every((id) => defeated.includes(id))
                const midDone = defeated.includes(floor.midBossId)
                const boss = getMonster(floor.bossId)
                return (
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
                          done={defeated.includes(mid)}
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
                          done={midDone}
                          locked={!normalsDone}
                          lockHint="通常の困りごとをすべて解決すると出現"
                          onClick={() => startEncounter(floor.id, floor.midBossId)}
                        />
                      )
                    })()}
                    <EncounterRow
                      boss
                      art={monsterArt(boss)}
                      emoji={boss.emoji}
                      name={boss.name}
                      sub={`${boss.kind === 'last' ? 'ラスボス' : 'フロアボス'}・HP${boss.hp}`}
                      done={defeated.includes(floor.bossId)}
                      locked={!midDone}
                      lockHint="中ボスを倒すと挑戦できる"
                      onClick={() => startEncounter(floor.id, floor.bossId)}
                    />
                  </Panel>
                )
              })()}
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
  done,
  locked,
  lockHint,
}: {
  art: string
  emoji: string
  name: string
  sub: string
  onClick: () => void
  mid?: boolean
  boss?: boolean
  done?: boolean
  locked?: boolean
  lockHint?: string
}) {
  return (
    <div
      className="row"
      style={{
        padding: '8px 10px',
        borderRadius: 12,
        background: locked ? '#eceff3' : boss ? '#fff4e0' : mid ? '#f3edff' : '#f4f7fb',
        border: locked
          ? '1px solid #d6dee8'
          : boss
            ? '2px solid var(--gold)'
            : mid
              ? '2px solid #a78bfa'
              : '1px solid #e2e8f0',
        opacity: locked ? 0.75 : 1,
      }}
    >
      {locked ? (
        <div style={{ fontSize: 30, width: boss ? 56 : mid ? 50 : 44, textAlign: 'center' }}>🔒</div>
      ) : (
        <Sprite src={art} alt={name} size={boss ? 56 : mid ? 50 : 44} fallback={emoji} />
      )}
      <div className="grow">
        <div className="row wrap" style={{ gap: 6, fontWeight: 800 }}>
          {locked ? '？？？' : name}
          {done && <span className="badge" style={{ background: 'var(--good)' }}>✓ 撃破</span>}
          {boss && <span className="badge" style={{ background: 'var(--gold-deep)' }}>BOSS</span>}
          {mid && <span className="badge" style={{ background: '#7c5cd6' }}>中ボス</span>}
        </div>
        <div className="muted">{locked ? lockHint : sub}</div>
      </div>
      {locked ? (
        <Button variant="secondary" disabled>
          ロック
        </Button>
      ) : (
        <Button variant={boss ? 'gold' : mid ? 'danger' : 'primary'} onClick={onClick}>
          {done ? '再挑戦' : '挑戦'}
        </Button>
      )}
    </div>
  )
}
