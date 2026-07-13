import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Bar, Button, Panel, Pill, Sprite, Stars } from '@/components/ui'
import { CHARMS, GACHA_RATES } from '@/data/charms'
import { CARDS } from '@/data/cards'
import { charmArt } from '@/data/art'
import { TICKET_GOLD_COST, type GachaResult } from '@/game/gacha'
import { sfxGachaResult, sfxGachaRoll, sfxTap } from '@/game/sound'
import type { Rarity } from '@/types'

/** レア度のランク表記（スマホゲームらしさ） */
const rankLabel = (r: Rarity): string => ({ 1: 'N', 2: 'R', 3: 'SR', 4: 'SSR', 5: 'UR' })[r]

export function GachaScreen() {
  const player = useGameStore((s) => s.player)
  const pullGacha = useGameStore((s) => s.pullGacha)
  const buyTicket = useGameStore((s) => s.buyTicket)
  const equipCharm = useGameStore((s) => s.equipCharm)
  const navigate = useGameStore((s) => s.navigate)

  const [result, setResult] = useState<GachaResult | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const pull = () => {
    if (drawing || player.tickets < 1) return
    setDrawing(true)
    setResult(null)
    setNotice(null)
    sfxGachaRoll()
    // 引いた瞬間に結果が出ると味気ないので、少しタメを作る
    setTimeout(() => {
      const r = pullGacha()
      setResult(r)
      setDrawing(false)
      if (r) sfxGachaResult(r.rarity)
    }, 700)
  }

  const buy = () => {
    if (!buyTicket()) {
      setNotice(`ゴールドが足りません（${TICKET_GOLD_COST}G 必要）`)
      return
    }
    sfxTap()
    setNotice('チケットを1枚交換しました！')
  }

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">🎁 WUL研修センター</div>
      </div>

      <Panel className="stack--sm">
        <div className="row wrap" style={{ gap: 8 }}>
          <Pill light>🎟️ チケット {player.tickets}</Pill>
          <Pill light>💰 {player.gold}G</Pill>
          <Pill light>🔧 欠片 {player.shards}</Pill>
        </div>
        <div className="muted">
          研修に参加すると<b>お守り</b>（装備してステータスUP）か<b>学びカード</b>
          （現場で使えるITの小ワザ）がもらえます。持っているものが出たら
          <b>スキルの欠片</b>になり、武器の強化に使えます。
        </div>
      </Panel>

      {/* ---- ガチャ台 ---- */}
      <Panel className="stack center">
        <div
          className={`gacha-orb ${drawing ? 'rolling' : ''} ${
            !drawing && result && result.rarity >= 4 ? 'gacha-orb--rare' : ''
          }`}
        >
          {!drawing && result ? (
            result.kind === 'charm' ? (
              <Sprite
                src={charmArt(result.charm)}
                alt={result.charm.name}
                size={112}
                fallback={result.charm.emoji}
                className="pop"
              />
            ) : (
              <span className="pop" style={{ fontSize: 84 }}>
                {result.card.emoji}
              </span>
            )
          ) : (
            '🎁'
          )}
        </div>

        {result && !drawing && (
          <div className="stack--sm center fade-in" style={{ width: '100%' }}>
            <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
              <span className={`badge rank-badge rank-${result.rarity}`}>{rankLabel(result.rarity)}</span>
              <span
                className="badge"
                style={{ background: result.kind === 'charm' ? 'var(--gold-deep)' : 'var(--it)' }}
              >
                {result.kind === 'charm' ? '🧿 お守り' : '📇 学びカード'}
              </span>
              <span
                className="badge"
                style={{ background: result.isNew ? 'var(--good)' : 'var(--ink-soft)' }}
              >
                {result.isNew ? 'NEW！' : '持っている'}
              </span>
            </div>

            {result.kind === 'charm' ? (
              <>
                <div className="h2">{result.charm.name}</div>
                <Stars rarity={result.rarity} />
                <div className="muted">{result.charm.desc}</div>
              </>
            ) : (
              <>
                <div className="h2">{result.card.name}</div>
                <Stars rarity={result.rarity} />
                <div className="tag">{result.card.topic}</div>
                <div style={{ fontSize: '0.92rem', textAlign: 'left' }}>{result.card.learn}</div>
                <div className="muted" style={{ textAlign: 'left' }}>💡 {result.card.scene}</div>
              </>
            )}

            {!result.isNew && (
              <div
                style={{
                  background: '#e6f0ff',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontWeight: 800,
                  color: 'var(--primary-deep)',
                }}
              >
                🔧 スキルの欠片 +{result.shards}
              </div>
            )}
          </div>
        )}

        {!result && !drawing && (
          <div className="muted">チケットを使って1回引きます。</div>
        )}

        <Button
          variant="gold"
          lg
          block
          disabled={drawing || player.tickets < 1}
          onClick={pull}
        >
          {drawing ? '抽選中…' : `🎟️ 1回引く（残り ${player.tickets}）`}
        </Button>

        {player.tickets < 1 && !drawing && (
          <div className="muted">
            チケットは現場で困りごとを解決すると手に入ります。
          </div>
        )}

        <Button
          variant="secondary"
          block
          disabled={player.gold < TICKET_GOLD_COST}
          onClick={buy}
        >
          💰 {TICKET_GOLD_COST}G でチケット1枚と交換
        </Button>
        {notice && <div className="muted">{notice}</div>}
      </Panel>

      {/* ---- 排出率 ---- */}
      <Panel className="stack--sm">
        <div className="h2">📊 排出率</div>
        {([5, 4, 3, 2, 1] as Rarity[]).map((r) => (
          <div key={r} className="kv">
            <span className="row" style={{ gap: 8 }}>
              <span className={`badge rank-badge rank-${r}`}>{rankLabel(r)}</span>
              <Stars rarity={r} />
            </span>
            <b>{GACHA_RATES[r]}%</b>
          </div>
        ))}
      </Panel>

      {/* ---- 学びカード（図鑑への導線） ---- */}
      <Panel className="stack--sm">
        <div className="row">
          <span className="h2">📇 学びカード</span>
          <span className="grow" />
          <span className="tag">
            {player.ownedCards.length}/{CARDS.length}
          </span>
        </div>
        <Bar value={player.ownedCards.length} max={CARDS.length} color="var(--it)" />
        <div className="muted">集めたカードは図鑑でいつでも読み返せます。</div>
        <Button variant="secondary" block onClick={() => navigate('codex')}>
          📖 図鑑で読む
        </Button>
      </Panel>

      {/* ---- コレクション ---- */}
      <Panel className="stack--sm">
        <div className="row">
          <span className="h2">🧿 お守りコレクション</span>
          <span className="grow" />
          <span className="tag">
            {player.ownedCharms.length}/{CHARMS.length}
          </span>
        </div>
        <div className="muted">タップで装備／解除。装備できるのは1つだけです。</div>
        {CHARMS.map((c) => {
          const has = player.ownedCharms.includes(c.id)
          const equipped = player.equippedCharmId === c.id
          return (
            <button
              key={c.id}
              className="row charm-row"
              disabled={!has}
              onClick={() => equipCharm(c.id)}
              style={{
                border: equipped ? '2px solid var(--gold)' : '1px solid #e2e8f0',
                background: equipped ? '#fffaf0' : '#f4f7fb',
                opacity: has ? 1 : 0.5,
              }}
            >
              {has ? (
                <Sprite src={charmArt(c)} alt={c.name} size={44} fallback={c.emoji} />
              ) : (
                <div style={{ fontSize: 30, width: 44, textAlign: 'center' }}>❔</div>
              )}
              <div className="grow" style={{ textAlign: 'left' }}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ fontWeight: 800 }}>{has ? c.name : '？？？'}</span>
                  <Stars rarity={c.rarity} />
                </div>
                <div className="muted">{has ? c.desc : '研修ガチャで入手'}</div>
              </div>
              {equipped && (
                <span className="badge" style={{ background: 'var(--gold-deep)' }}>装備中</span>
              )}
            </button>
          )
        })}
      </Panel>
    </div>
  )
}
