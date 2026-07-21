import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel } from '@/components/ui'
import { Logo } from '@/components/Logo'
import { TITLE_ART } from '@/data/art'

export function TitleScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame)
  const navigate = useGameStore((s) => s.navigate)
  const hasSave = useGameStore((s) => s.player.name.trim().length > 0)
  const [entering, setEntering] = useState(false)
  const [name, setName] = useState('')

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
        <div className="stack">
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
