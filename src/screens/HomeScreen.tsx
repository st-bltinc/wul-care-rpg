import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Bar, Pill, Sprite } from '@/components/ui'
import { effectiveMaxHp, xpToNext } from '@/game/engine'
import { getFloor, FLOORS } from '@/data/floors'
import { getTitle } from '@/data/titles'
import { HERO_ART, floorArt } from '@/data/art'

export function HomeScreen() {
  const player = useGameStore((s) => s.player)
  const navigate = useGameStore((s) => s.navigate)
  const maxHp = effectiveMaxHp(player)
  const floor = getFloor(player.currentFloorId)
  const title = getTitle(player.currentTitleId)
  const cleared = player.clearedFloors.length

  return (
    <div className="screen screen--with-tab">
      {/* プレイヤーヘッダー */}
      <Panel className="stack--sm">
        <div className="row">
          <Sprite src={HERO_ART} alt={player.name} size={72} className="floaty" />
          <div className="grow">
            <div className="row" style={{ gap: 8 }}>
              <span className="h2">{player.name}</span>
              <span className="tag">Lv.{player.level}</span>
            </div>
            <div className="muted" style={{ fontWeight: 800, color: 'var(--primary-deep)' }}>
              {player.role}
            </div>
            {title && (
              <div style={{ marginTop: 4 }}>
                <span className="badge" style={{ background: 'var(--gold-deep)' }}>
                  称号：{title.name}
                </span>
              </div>
            )}
          </div>
        </div>
        <Bar label="たいりょく" value={player.hp} max={maxHp} color="var(--hp)" />
        <Bar
          label="けいけんち"
          value={player.xp}
          max={xpToNext(player.level)}
          color="var(--xp)"
        />
        <div className="row wrap" style={{ gap: 8, marginTop: 2 }}>
          <Pill light>💰 {player.gold}G</Pill>
          <Pill light>🎟️ チケット {player.tickets}</Pill>
          <Pill light>🔧 欠片 {player.shards}</Pill>
          {player.skillPoints > 0 && (
            <Pill color="var(--danger)">🌟 スキルP {player.skillPoints}</Pill>
          )}
        </div>
      </Panel>

      {/* 次の現場 */}
      <Panel
        style={{
          border: 'none',
          padding: 0,
          overflow: 'hidden',
          backgroundImage: `url(${floorArt(floor)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.92) 62%)', paddingTop: 90 }}>
          <div style={{ padding: 14 }}>
            <div className="floor-card__no">つぎの現場</div>
            <div className="h2">{floor.name}</div>
            <div className="muted">テーマ：{floor.theme}</div>
            <p style={{ fontSize: '0.92rem', margin: '10px 0 12px' }}>{floor.story}</p>
            <Button variant="gold" lg block onClick={() => navigate('map')}>
              現場クエストへ ▶
            </Button>
          </div>
        </div>
      </Panel>

      {/* 施設の発展 */}
      <Panel className="stack--sm">
        <div className="row">
          <span className="h2">🏥 施設の発展</span>
          <span className="grow" />
          <span className="tag">
            {cleared} / {FLOORS.length} フロア攻略
          </span>
        </div>
        <Bar value={cleared} max={FLOORS.length} color="var(--good)" />
        <div className="muted">
          フロアを攻略するほど施設が良くなり、あなたは施設改革リーダーに近づきます。
        </div>
        <Button variant="secondary" block onClick={() => navigate('facility')}>
          🏥 施設のようすを見る
        </Button>
      </Panel>

      {/* 研修ガチャへの導線（チケットが余っているときだけ出す） */}
      {player.tickets > 0 && (
        <Panel className="stack--sm">
          <div className="row">
            <div style={{ fontSize: 36 }}>🎁</div>
            <div className="grow">
              <div className="h2">研修チケットが {player.tickets} 枚</div>
              <div className="muted">WUL研修センターでお守りと交換できます。</div>
            </div>
          </div>
          <Button variant="secondary" block onClick={() => navigate('gacha')}>
            研修センターへ ▶
          </Button>
        </Panel>
      )}

      {/* 学んだITツール */}
      <Panel className="stack--sm">
        <div className="h2">💠 学んだITツール（{player.answeredItTools.length}）</div>
        {player.answeredItTools.length === 0 ? (
          <div className="muted">まだありません。現場でITクイズに正解して覚えよう！</div>
        ) : (
          <div className="row wrap" style={{ gap: 6 }}>
            {player.answeredItTools.map((t) => (
              <span key={t} className="tag" style={{ background: '#e6f0ff', color: 'var(--primary-deep)' }}>
                {toolLabel(t)}
              </span>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

function toolLabel(t: string): string {
  const map: Record<string, string> = {
    chrome: 'Chrome',
    gmail: 'Gmail',
    docs: 'ドキュメント',
    sheets: 'スプレッドシート',
    calendar: 'カレンダー',
    drive: 'Drive',
    canva: 'Canva',
    zoom: 'Zoom',
    meet: 'Google Meet',
    chatgpt: 'ChatGPT',
  }
  return map[t] ?? t
}
