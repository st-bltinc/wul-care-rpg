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
        // 下半分をほどよく暗くしてボタンを読みやすく。ただし最下部は完全な黒にせず、
        // 足元の景色がうっすら残るようにして「黒い空白」に見えないようにする。
        backgroundImage: `linear-gradient(180deg, rgba(14,21,38,0) 40%, rgba(14,21,38,.45) 60%, rgba(14,21,38,.8) 82%, rgba(14,21,38,.9) 100%), url(${TITLE_ART})`,
        gap: 16,
      }}
    >
      {/* ロゴは最上部に固定。下のスペーサーが伸びて、主人公が中央に見える。 */}
      <div className="center fade-in">
        <h1 className="logo-wrap">
          <Logo width={320} />
        </h1>
        <div className="pill pill--light" style={{ marginTop: 14 }}>
          WorkUp Lab 公式・DX研修RPG
        </div>
      </div>

      {/* 可変スペーサー：広い画面では伸びてボタンを下へ、低い画面では縮んで全体が収まる */}
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
    </div>
  )
}
