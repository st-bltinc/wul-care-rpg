import { useGameStore } from '@/store/useGameStore'
import { Panel, Bar, Button } from '@/components/ui'
import { FLOORS } from '@/data/floors'
import { WEAPONS } from '@/data/weapons'
import { floorArt } from '@/data/art'
import type { ITToolId } from '@/types'

/**
 * 施設発展。攻略したフロアが「良くなった現場」として色を取り戻し、
 * 学んだITツールが「施設に導入された仕組み」として積み上がる。
 * ゲームの目的（現場が実際に良くなる）を目に見える形にする画面。
 */

/** ツールが現場にもたらす変化。学習した内容を"導入された仕組み"として言い換える */
const TOOL_EFFECT: Record<ITToolId, string> = {
  chrome: '最新の予防情報をすぐ調べられるようになった',
  gmail: '連絡が記録に残り、言った言わないが消えた',
  docs: '記録を全員で同時に書けるようになった',
  sheets: 'チェック表が自動集計され、確認漏れが減った',
  calendar: '予定が全員に見え、業務の偏りが減った',
  drive: '必要な資料に誰でもたどり着けるようになった',
  canva: '掲示物が分かりやすくなり、予防が浸透した',
  zoom: '離れた事業所とも顔を見て相談できるようになった',
  meet: 'カレンダーの予定から、すぐに会議を開けるようになった',
  chatgpt: '申し送りの要点整理をAIが手伝ってくれるようになった',
}

export function FacilityScreen() {
  const player = useGameStore((s) => s.player)
  const navigate = useGameStore((s) => s.navigate)

  const cleared = player.clearedFloors
  const learned = player.answeredItTools
  const pct = Math.round((cleared.length / FLOORS.length) * 100)

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">🏥 施設の発展</div>
      </div>

      <Panel className="stack--sm">
        <div className="row">
          <div className="grow">
            <div className="h2">施設発展度 Lv.{player.facilityLevel}</div>
            <div className="muted">
              {cleared.length}/{FLOORS.length} フロア攻略・{pct}% 改善
            </div>
          </div>
          <div style={{ fontSize: 44 }}>{pct === 100 ? '🎊' : '🏥'}</div>
        </div>
        <Bar value={cleared.length} max={FLOORS.length} color="var(--good)" />
        <div className="muted">
          {pct === 100
            ? 'すべての現場が良くなった。あなたは施設改革リーダーです。'
            : '困りごとを解決したフロアは、色を取り戻していきます。'}
        </div>
      </Panel>

      {/* 導入された仕組み */}
      <Panel className="stack--sm">
        <div className="row">
          <span className="h2">💠 導入された仕組み</span>
          <span className="grow" />
          <span className="tag">
            {learned.length}/{WEAPONS.length}
          </span>
        </div>
        {learned.length === 0 ? (
          <div className="muted">
            まだありません。IT研修クイズに正解すると、その仕組みが施設に導入されます。
          </div>
        ) : (
          learned.map((tool) => {
            const w = WEAPONS.find((x) => x.sourceTool === tool)
            return (
              <div
                key={tool}
                className="row"
                style={{ padding: '8px 10px', borderRadius: 12, background: '#e7f7ee' }}
              >
                <div style={{ fontSize: 22 }}>✅</div>
                <div className="grow">
                  <div style={{ fontWeight: 800 }}>{w?.toolLabel ?? tool}</div>
                  <div className="muted">{TOOL_EFFECT[tool]}</div>
                </div>
              </div>
            )
          })
        )}
      </Panel>

      {/* フロアごとの状態 */}
      <div className="stack--sm">
        {FLOORS.map((floor) => {
          const done = cleared.includes(floor.id)
          return (
            <div
              key={floor.id}
              className="floor-card"
              style={{
                backgroundImage: `url(${floorArt(floor)})`,
                minHeight: 118,
                display: 'flex',
                alignItems: 'flex-end',
                filter: done ? 'none' : 'grayscale(0.85) brightness(0.85)',
                cursor: 'default',
              }}
            >
              <div className="row floor-card__body grow">
                <div className="grow">
                  <div className="floor-card__no">B{floor.order}F</div>
                  <div className="h2">{floor.name}</div>
                  <div className="muted">
                    {done ? `✅ ${floor.theme} を解決した` : `⚠️ ${floor.theme} が残っている`}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{ background: done ? 'var(--good)' : 'var(--ink-soft)' }}
                >
                  {done ? '改善済' : '未改善'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {cleared.length < FLOORS.length && (
        <Button variant="gold" lg block onClick={() => navigate('map')}>
          つぎの現場へ ▶
        </Button>
      )}
    </div>
  )
}
