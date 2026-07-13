import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Bar, Sprite } from '@/components/ui'
import { HERO_ART, charmArt } from '@/data/art'
import { effectiveMaxHp, totalAtk, xpToNext } from '@/game/engine'
import { getWeapon } from '@/data/weapons'
import { TITLES, getTitle } from '@/data/titles'
import { MONSTERS } from '@/data/monsters'
import { WEAPONS } from '@/data/weapons'
import { CHARMS, getCharm } from '@/data/charms'
import { CARDS } from '@/data/cards'
import { isMuted, setMuted, sfxTap } from '@/game/sound'

const ROLES = ['見習い介護士', '現場担当', 'DX推進担当', '現場マイスター', '教育リーダー', '施設改革リーダー']

export function ProfileScreen() {
  const player = useGameStore((s) => s.player)
  const setTitle = useGameStore((s) => s.setCurrentTitle)
  const resetGame = useGameStore((s) => s.resetGame)
  const navigate = useGameStore((s) => s.navigate)
  const [confirmReset, setConfirmReset] = useState(false)
  const [soundOn, setSoundOn] = useState(!isMuted())

  const weapon = getWeapon(player.equippedWeaponId)
  const charm = getCharm(player.equippedCharmId)
  const atk = totalAtk(player, weapon)
  const maxHp = effectiveMaxHp(player)
  const roleIdx = ROLES.indexOf(player.role)

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">👤 プロフィール</div>
      </div>

      <Panel className="stack--sm center">
        <Sprite src={HERO_ART} alt={player.name} size={110} className="floaty" style={{ alignSelf: 'center' }} />
        <div className="h1">{player.name}</div>
        <div className="badge" style={{ background: 'var(--primary-deep)', alignSelf: 'center' }}>
          {player.role}
        </div>
        {getTitle(player.currentTitleId) && (
          <div className="pill pill--light" style={{ alignSelf: 'center' }}>
            称号：{getTitle(player.currentTitleId)!.name}
          </div>
        )}
        <div style={{ width: '100%', marginTop: 6 }}>
          <Bar label={`Lv.${player.level}`} value={player.xp} max={xpToNext(player.level)} color="var(--xp)" />
        </div>
      </Panel>

      {/* ステータス */}
      <Panel className="stack--sm">
        <div className="h2">ステータス</div>
        <div className="kv"><span>⚔️ 攻撃力</span><b>{atk}</b></div>
        <div className="kv"><span>❤️ 最大HP</span><b>{maxHp}</b></div>
        <div className="kv"><span>💰 ゴールド</span><b>{player.gold} G</b></div>
        <div className="kv"><span>🎟️ チケット</span><b>{player.tickets}</b></div>
        <div className="kv"><span>🔧 スキルの欠片</span><b>{player.shards}</b></div>
        {charm && (
          <div className="kv">
            <span>🧿 お守り</span>
            <span className="row" style={{ gap: 6 }}>
              <Sprite src={charmArt(charm)} alt="" size={24} fallback={charm.emoji} />
              <b>{charm.name}</b>
            </span>
          </div>
        )}
        <div className="kv"><span>🏥 施設発展度</span><b>Lv.{player.facilityLevel}</b></div>
      </Panel>

      {/* 役割の道 */}
      <Panel className="stack--sm">
        <div className="h2">🎖️ 役割の道</div>
        <div className="muted">現場で経験を積み、施設改革リーダーを目指そう（資格ではなく役割の成長）。</div>
        <div className="row wrap" style={{ gap: 6 }}>
          {ROLES.map((r, i) => (
            <span
              key={r}
              className="tag"
              style={{
                background: i <= roleIdx ? 'var(--primary)' : '#eef2f7',
                color: i <= roleIdx ? '#fff' : 'var(--ink-soft)',
              }}
            >
              {i <= roleIdx ? '✓ ' : ''}
              {r}
            </span>
          ))}
        </div>
      </Panel>

      {/* 称号 */}
      <Panel className="stack--sm">
        <div className="h2">🏅 称号（{player.earnedTitles.length}/{TITLES.length}）</div>
        <div className="muted">タップで表示する称号を変更できます。</div>
        <div className="row wrap" style={{ gap: 6 }}>
          {TITLES.map((t) => {
            const earned = player.earnedTitles.includes(t.id)
            const active = player.currentTitleId === t.id
            return (
              <button
                key={t.id}
                className="tag"
                onClick={() => earned && setTitle(t.id)}
                style={{
                  cursor: earned ? 'pointer' : 'default',
                  background: active ? 'var(--gold)' : earned ? '#fff4e0' : '#eef2f7',
                  color: earned ? 'var(--gold-deep)' : '#aab4c0',
                  border: active ? '2px solid var(--gold-deep)' : '1px solid transparent',
                  padding: '6px 10px',
                }}
                title={t.desc}
              >
                {earned ? t.name : '🔒 ' + t.desc}
              </button>
            )
          })}
        </div>
      </Panel>

      {/* 図鑑 */}
      <Panel className="stack--sm">
        <div className="h2">📖 図鑑</div>
        <div className="kv">
          <span>困りごと図鑑</span>
          <b>{player.defeatedMonsters.length}/{MONSTERS.length}</b>
        </div>
        <div className="kv">
          <span>習得ITツール</span>
          <b>{player.answeredItTools.length}/{WEAPONS.length}</b>
        </div>
        <div className="kv">
          <span>お守りコレクション</span>
          <b>{player.ownedCharms.length}/{CHARMS.length}</b>
        </div>
        <div className="kv">
          <span>学びカード</span>
          <b>{player.ownedCards.length}/{CARDS.length}</b>
        </div>
        <Button variant="secondary" block onClick={() => navigate('codex')}>
          📖 図鑑をひらく
        </Button>
      </Panel>

      {/* 設定 */}
      <Panel className="stack--sm">
        <div className="h2">⚙️ 設定</div>
        <div className="row">
          <span className="grow">🔊 効果音</span>
          <Button
            variant={soundOn ? 'primary' : 'secondary'}
            onClick={() => {
              const next = !soundOn
              setSoundOn(next)
              setMuted(!next)
              if (next) sfxTap()
            }}
          >
            {soundOn ? 'ON' : 'OFF'}
          </Button>
        </div>
      </Panel>

      {/* リセット */}
      <Panel className="stack--sm">
        {!confirmReset ? (
          <Button variant="secondary" block onClick={() => setConfirmReset(true)}>
            はじめからやり直す
          </Button>
        ) : (
          <>
            <div className="center" style={{ fontWeight: 800, color: 'var(--danger)' }}>
              本当にリセットしますか？（進捗は消えます）
            </div>
            <div className="row">
              <Button variant="secondary" block onClick={() => setConfirmReset(false)}>
                やめる
              </Button>
              <Button variant="danger" block onClick={resetGame}>
                リセットする
              </Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
