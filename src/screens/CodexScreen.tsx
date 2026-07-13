import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Panel, Sprite, Bar } from '@/components/ui'
import { MONSTERS } from '@/data/monsters'
import { WEAPONS } from '@/data/weapons'
import { CARDS } from '@/data/cards'
import { FLOORS, getFloor } from '@/data/floors'
import { monsterArt, weaponArt } from '@/data/art'
import { itQuizzesForFloor } from '@/data/quizzes'
import type { ITToolId, Monster } from '@/types'

type Tab = 'trouble' | 'tool' | 'card'

/** レア度のランク表記 */
const rankLabel = (r: number): string =>
  ({ 1: 'N', 2: 'R', 3: 'SR', 4: 'SSR', 5: 'UR' })[r as 1 | 2 | 3 | 4 | 5]

const KIND_LABEL: Record<Monster['kind'], string> = {
  normal: '通常',
  mid: '中ボス',
  boss: 'フロアボス',
  last: 'ラスボス',
}

/**
 * 図鑑。倒した困りごとと、学んだITツールを見返せる。
 * ゲームの目的は「ITツールを使いこなせるようになること」なので、
 * ツール図鑑では学びポイントを必ず読み返せるようにしている。
 */
export function CodexScreen() {
  const player = useGameStore((s) => s.player)
  const [tab, setTab] = useState<Tab>('trouble')

  const defeated = player.defeatedMonsters
  const learned = player.answeredItTools

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">📖 図鑑</div>
      </div>

      <div className="row" style={{ gap: 6 }}>
        <TabBtn active={tab === 'trouble'} color="var(--care)" onClick={() => setTab('trouble')}>
          👾 困りごと
          <small>
            {defeated.length}/{MONSTERS.length}
          </small>
        </TabBtn>
        <TabBtn active={tab === 'tool'} color="var(--it)" onClick={() => setTab('tool')}>
          💠 ITツール
          <small>
            {learned.length}/{WEAPONS.length}
          </small>
        </TabBtn>
        <TabBtn active={tab === 'card'} color="var(--mgmt)" onClick={() => setTab('card')}>
          📇 カード
          <small>
            {player.ownedCards.length}/{CARDS.length}
          </small>
        </TabBtn>
      </div>

      {tab === 'trouble' && (
        <>
          <Panel className="stack--sm">
            <div className="h2">👾 困りごと図鑑</div>
            <Bar value={defeated.length} max={MONSTERS.length} color="var(--care)" />
            <div className="muted">
              倒した困りごとが記録されます。敵は現場の課題であって、利用者さんではありません。
            </div>
          </Panel>

          {FLOORS.map((floor) => {
            const mons = MONSTERS.filter((m) => m.floorId === floor.id)
            const got = mons.filter((m) => defeated.includes(m.id)).length
            return (
              <Panel key={floor.id} className="stack--sm">
                <div className="row">
                  <span className="h2">
                    {floor.emoji} {floor.name}
                  </span>
                  <span className="grow" />
                  <span className="tag">
                    {got}/{mons.length}
                  </span>
                </div>
                {mons.map((m) => {
                  const found = defeated.includes(m.id)
                  return (
                    <div
                      key={m.id}
                      className="row"
                      style={{
                        padding: '8px 10px',
                        borderRadius: 12,
                        background: found ? '#f4f7fb' : '#eceff3',
                        opacity: found ? 1 : 0.6,
                      }}
                    >
                      {found ? (
                        <Sprite src={monsterArt(m)} alt={m.name} size={48} fallback={m.emoji} />
                      ) : (
                        <div style={{ fontSize: 32, width: 48, textAlign: 'center' }}>❔</div>
                      )}
                      <div className="grow">
                        <div className="row wrap" style={{ gap: 6 }}>
                          <span style={{ fontWeight: 800 }}>{found ? m.name : '？？？'}</span>
                          <span className="tag">{KIND_LABEL[m.kind]}</span>
                        </div>
                        {found ? (
                          <>
                            <div className="muted">{m.flavor}</div>
                            <div className="muted" style={{ color: 'var(--primary-deep)', fontWeight: 700 }}>
                              弱点：{m.weaknessHint}
                            </div>
                          </>
                        ) : (
                          <div className="muted">まだ遭遇していない困りごと</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Panel>
            )
          })}
        </>
      )}

      {tab === 'tool' && (
        <>
          <Panel className="stack--sm">
            <div className="h2">💠 ITツール図鑑</div>
            <Bar value={learned.length} max={WEAPONS.length} color="var(--it)" />
            <div className="muted">
              IT研修クイズに<b>正解</b>すると「学習済み」になります。学びポイントはいつでも読み返せます。
            </div>
          </Panel>

          {WEAPONS.map((w) => {
            const isLearned = learned.includes(w.sourceTool)
            const owned = player.ownedWeapons.includes(w.id)
            const points = learnPointsFor(w.sourceTool)
            return (
              <Panel key={w.id} className="stack--sm" style={{ opacity: owned || isLearned ? 1 : 0.6 }}>
                <div className="row">
                  {owned ? (
                    <Sprite src={weaponArt(w)} alt={w.name} size={52} fallback={w.emoji} />
                  ) : (
                    <div style={{ fontSize: 34, width: 52, textAlign: 'center' }}>❔</div>
                  )}
                  <div className="grow">
                    <div className="row wrap" style={{ gap: 6 }}>
                      <span style={{ fontWeight: 800 }}>{w.toolLabel}</span>
                      {isLearned ? (
                        <span className="badge" style={{ background: 'var(--good)' }}>学習済み</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--ink-soft)' }}>未学習</span>
                      )}
                    </div>
                    <div className="muted">武器：{owned ? w.name : '？？？'}</div>
                  </div>
                </div>

                {isLearned ? (
                  <div className="stack--sm">
                    {points.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#e6f0ff',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--primary-deep)',
                        }}
                      >
                        💡 {p}
                      </div>
                    ))}
                    <div className="muted">🎯 戦闘での効果：{w.passiveDesc}</div>
                  </div>
                ) : (
                  <div className="muted">
                    {toolFloorHint(w.sourceTool)}のIT研修クイズに正解すると、学びポイントが記録されます。
                  </div>
                )}
              </Panel>
            )
          })}
        </>
      )}

      {tab === 'card' && (
        <>
          <Panel className="stack--sm">
            <div className="h2">📇 学びカード</div>
            <Bar value={player.ownedCards.length} max={CARDS.length} color="var(--mgmt)" />
            <div className="muted">
              研修ガチャで集まる、現場で今日から使えるITの小ワザ集。休憩中に読み返せます。
            </div>
          </Panel>

          {[5, 4, 3, 2, 1].map((rarity) => {
            const group = CARDS.filter((c) => c.rarity === rarity)
            if (group.length === 0) return null
            return (
              <div key={rarity} className="stack--sm">
                <div className="row" style={{ gap: 8 }}>
                  <span className={`badge rank-badge rank-${rarity}`}>{rankLabel(rarity)}</span>
                  <span className="grow" />
                  <span className="tag">
                    {group.filter((c) => player.ownedCards.includes(c.id)).length}/{group.length}
                  </span>
                </div>
                {group.map((c) => {
                  const has = player.ownedCards.includes(c.id)
                  return (
                    <Panel
                      key={c.id}
                      flush
                      className="stack--sm"
                      style={{ opacity: has ? 1 : 0.55, borderColor: has ? 'var(--it)' : undefined }}
                    >
                      <div className="row">
                        <div style={{ fontSize: 32, width: 44, textAlign: 'center' }}>
                          {has ? c.emoji : '❔'}
                        </div>
                        <div className="grow">
                          <div style={{ fontWeight: 800 }}>{has ? c.name : '？？？'}</div>
                          <div className="tag">{has ? c.topic : '未入手'}</div>
                        </div>
                      </div>
                      {has && (
                        <>
                          <div style={{ fontSize: '0.92rem' }}>{c.learn}</div>
                          <div
                            className="muted"
                            style={{ borderLeft: '3px solid var(--it)', paddingLeft: 8 }}
                          >
                            💡 {c.scene}
                          </div>
                        </>
                      )}
                    </Panel>
                  )
                })}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

function TabBtn({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 56,
        padding: '0 6px',
        fontSize: '0.82rem',
        flexDirection: 'column',
        gap: 2,
        background: active ? color : '#eef2f7',
        color: active ? '#fff' : 'var(--ink)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

/** そのツールのIT研修クイズに書かれた学びポイントを全フロアから集める */
const learnPointsFor = (tool: ITToolId): string[] => {
  const seen = new Set<string>()
  for (const floor of FLOORS) {
    for (const q of itQuizzesForFloor(floor.id)) {
      if (q.tool === tool && q.learnPoint) seen.add(q.learnPoint)
    }
  }
  return [...seen]
}

/** そのツールを学べるフロア名 */
const toolFloorHint = (tool: ITToolId): string => {
  const floor = FLOORS.find((f) => f.learnTools.includes(tool))
  return floor ? getFloor(floor.id).name : '現場'
}
