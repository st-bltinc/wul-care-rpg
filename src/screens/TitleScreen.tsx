import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { TITLE_ART, monsterArtById } from '@/data/art'
import { MONSTERS } from '@/data/monsters'

// 出現スロット（位置・大きさ・タイミングは global.css の .tmon--* で定義）。
const TITLE_SLOTS = ['tmon--1', 'tmon--2', 'tmon--3', 'tmon--4', 'tmon--5', 'tmon--6']
// 全モンスターの絵柄プール（重複除去）。
const MONSTER_POOL = Array.from(new Set(MONSTERS.map((m) => m.art)))

// タイトルを開くたびにプールからシャッフルして各スロットへ割り当てる（毎回ランダムな顔ぶれ）。
function pickTitleMonsters() {
  const pool = [...MONSTER_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return TITLE_SLOTS.map((cls, i) => ({ cls, art: pool[i % pool.length] }))
}

export function TitleScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame)
  const navigate = useGameStore((s) => s.navigate)
  const hasSave = useGameStore((s) => s.player.name.trim().length > 0)
  const [entering, setEntering] = useState(false)
  const [name, setName] = useState('')
  // マウント時に一度だけ抽選 → タイトルを開くたび/リロードごとに顔ぶれが変わる。
  const [monsters] = useState(pickTitleMonsters)

  return (
    <div
      className="screen title-screen"
      style={{
        alignItems: 'stretch',
        // 中央の主人公は明るいまま、ボタンのある下部だけをほどよく暗くして、
        // ボタンが背景と混ざらないようにする。
        backgroundImage: `linear-gradient(180deg, rgba(14,21,38,0) 58%, rgba(14,21,38,.35) 78%, rgba(14,21,38,.72) 100%), url(${TITLE_ART})`,
        gap: 16,
      }}
    >
      {/* 困りごとモンスターが端・下から出現してふわふわ浮遊する演出。
          pointer-events:none＋ロゴ/ボタンより背面なので操作の邪魔をしない。 */}
      <div className="title-monsters" aria-hidden="true">
        {monsters.map((m) => (
          <span key={m.cls} className={`tmon ${m.cls}`}>
            <img className="tmon__img" src={monsterArtById(m.art)} alt="" />
          </span>
        ))}
      </div>

      {/* ロゴを最上部から少し下げるための余白 */}
      <div className="title-gap title-gap--top" />

      <div className="center fade-in">
        <h1 className="logo-wrap">
          <Logo width={320} />
        </h1>
        <div className="pill pill--light" style={{ marginTop: 14 }}>
          WorkUp Lab 公式・DX研修RPG
        </div>
      </div>

      {/* 可変スペーサー：中央の主人公を見せつつ、ボタンを下方に押す */}
      <div className="title-spacer" />

      {!entering ? (
        <div className="stack title-actions">
          <Button variant="gold" lg block onClick={() => setEntering(true)}>
            はじめる
          </Button>
          {hasSave && (
            <Button variant="ghost" block onClick={() => navigate('home')}>
              つづきから
            </Button>
          )}
        </div>
      ) : (
        <Panel className="fade-in stack">
          <div className="h2">なまえを入力してください</div>
          <input
            className="choice"
            style={{ minHeight: 56 }}
            value={name}
            maxLength={10}
            placeholder="例：たろう"
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="primary"
            lg
            block
            onClick={() => startNewGame(name)}
          >
            冒険をはじめる
          </Button>
          <Button variant="secondary" block onClick={() => setEntering(false)}>
            もどる
          </Button>
        </Panel>
      )}

      {/* ボタンを最下部から少し持ち上げるための余白 */}
      <div className="title-gap title-gap--bottom" />
    </div>
  )
}
