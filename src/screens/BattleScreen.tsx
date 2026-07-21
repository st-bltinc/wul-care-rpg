import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Bar, Stars, Sprite } from '@/components/ui'
import { HERO_ART, floorArt, monsterArt, weaponArt } from '@/data/art'
import { getMonster } from '@/data/monsters'
import { getFloor } from '@/data/floors'
import { careQuizzesForFloor, itQuizzesForFloor } from '@/data/quizzes'
import { getWeapon, WEAPONS } from '@/data/weapons'
import { computeDamage, enemyDamage, effectiveMaxHp, rewardFor, xpMultiplier } from '@/game/engine'
import type { ITToolId, Quiz, WeaponFx } from '@/types'
import { getTitle } from '@/data/titles'
import {
  sfxCorrect,
  sfxDamage,
  sfxDefeat,
  sfxFloorClear,
  sfxHit,
  sfxLevelUp,
  sfxReward,
  sfxSpecial,
  sfxVictory,
  sfxWrong,
} from '@/game/sound'

type Phase = 'intro' | 'quiz' | 'feedback' | 'victory' | 'reward' | 'defeat'

interface RewardState {
  weaponId: string
  weaponIsNew: boolean
  /** 武器が被ったときに復習ボーナスとして得た欠片 */
  shardsGained: number
  itLearnedCount: number
  xpGained: number
  gold: number
  tickets: number
  levelsGained: number
  newLevel: number
  skillPointsGained: number
  newRole: string
  roleChanged: boolean
  floorCleared: boolean
  newTitles: string[]
}

/** 素手（武器未装備）の攻撃演出 */
const FIST_FX: WeaponFx = { icon: '✊', color: '#e5a34a', moveName: '現場力パンチ', kind: 'burst' }

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 戦闘の出題プール。DX研修が主旨なので IT問題を厚くする（IT を2倍の重みで混ぜる）。
 * 介護クイズも織り交ぜ、どちらも正解＝攻撃になる。
 */
const buildQuizPool = (floorId: string): Quiz[] => {
  const care = careQuizzesForFloor(floorId)
  const it = itQuizzesForFloor(floorId)
  const pool = [...care, ...it, ...it] // IT を2倍
  return shuffle(pool)
}

export function BattleScreen() {
  const s = useGameStore
  const floorId = useGameStore((st) => st.selectedFloorId)
  const monsterId = useGameStore((st) => st.selectedMonsterId)
  const navigate = useGameStore((st) => st.navigate)

  const floor = floorId ? getFloor(floorId) : null
  const monster = monsterId ? getMonster(monsterId) : null

  // ---- 戦闘用のローカル状態 ----
  const [phase, setPhase] = useState<Phase>('intro')
  const [enemyHp, setEnemyHp] = useState(monster?.hp ?? 1)
  const [playerHp, setPlayerHp] = useState(() => effectiveMaxHp(s.getState().player))
  const playerMaxHp = effectiveMaxHp(s.getState().player)

  const pool = useMemo(() => (floorId ? buildQuizPool(floorId) : []), [floorId])
  const [quizIdx, setQuizIdx] = useState(0)

  const [chosen, setChosen] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [lastDamage, setLastDamage] = useState<{ v: number; special: boolean } | null>(null)
  const [floatKey, setFloatKey] = useState(0)
  const [enemyHurt, setEnemyHurt] = useState(false)
  const [showFx, setShowFx] = useState(false)
  const [reward, setReward] = useState<RewardState | null>(null)
  const [committed, setCommitted] = useState(false)

  // 戦闘中に正解したITツール（学習として記録する）
  const learnedTools = useMemo(() => new Set<ITToolId>(), [])

  if (!floor || !monster) {
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <Panel className="center stack">
          <div>戦闘を開始できませんでした。</div>
          <Button onClick={() => navigate('map')}>マップへ</Button>
        </Panel>
      </div>
    )
  }

  const equipped = getWeapon(s.getState().player.equippedWeaponId)
  const fx = equipped?.fx ?? FIST_FX
  const currentQuiz = pool.length ? pool[quizIdx % pool.length] : null

  // ---- クイズ回答（正解で攻撃 / 不正解で被弾） ----
  const answer = (idx: number) => {
    if (!currentQuiz || chosen !== null) return
    setChosen(idx)
    const correct = idx === currentQuiz.answer
    setLastCorrect(correct)

    if (correct) {
      if (currentQuiz.category === 'it' && currentQuiz.tool) learnedTools.add(currentQuiz.tool)
      const dmg = computeDamage(s.getState().player, equipped, monster)
      setLastDamage({ v: dmg.damage, special: dmg.special })
      setFloatKey((k) => k + 1)
      setShowFx(true)
      setEnemyHurt(true)
      setEnemyHp((hp) => Math.max(0, hp - dmg.damage))
      setTimeout(() => setEnemyHurt(false), 400)
      setTimeout(() => setShowFx(false), 600)
      sfxCorrect()
      setTimeout(dmg.special ? sfxSpecial : sfxHit, 140)
    } else {
      const dmg = enemyDamage(monster)
      setLastDamage({ v: dmg, special: false })
      setPlayerHp((hp) => Math.max(0, hp - dmg))
      sfxWrong()
      setTimeout(sfxDamage, 200)
    }
    setPhase('feedback')
  }

  const afterFeedback = () => {
    setChosen(null)
    if (enemyHp <= 0) {
      sfxVictory()
      setPhase('victory')
    } else if (playerHp <= 0) {
      recordLearning()
      sfxDefeat()
      setPhase('defeat')
    } else {
      setQuizIdx((i) => i + 1)
      setPhase('quiz')
    }
  }

  /** 戦闘中に正解したITツールを学習済みとして記録 */
  const recordLearning = () => {
    const st = useGameStore.getState()
    learnedTools.forEach((t) => st.recordItLearned(t))
  }

  // ---- 戦闘結果を確定（1回だけ） ----
  const commitBattle = () => {
    if (committed) return
    setCommitted(true)
    const st = useGameStore.getState()

    recordLearning()
    st.recordDefeat(monster.id)

    // 報酬武器 = このフロアで学ぶツールの武器（複数あれば先頭）
    const rewardWeapon =
      WEAPONS.find((w) => floor.learnTools.includes(w.sourceTool)) ??
      WEAPONS.find((w) => w.effectTag === monster.weaknessTag) ??
      WEAPONS[0]
    const weaponGain = st.addWeapon(rewardWeapon.id)

    const base = rewardFor(monster)
    const itCount = learnedTools.size
    const xpRate = xpMultiplier(st.player)
    // IT研修の成果（正解ツール数）に応じてXPにボーナス
    const xpGained = Math.round(base.xp * (1 + 0.15 * itCount) * xpRate)
    const gold = base.gold
    const tickets = base.tickets + (itCount > 0 ? 1 : 0)

    const lu = st.gainXp(xpGained)
    st.addRewards(gold, tickets)

    const isBoss = monster.kind === 'boss' || monster.kind === 'last'
    const alreadyCleared = st.player.clearedFloors.includes(floor.id)
    if (isBoss) st.clearFloor(floor.id)
    const newTitles = st.refreshTitles()
    st.healFull()

    setReward({
      weaponId: rewardWeapon.id,
      weaponIsNew: weaponGain.isNew,
      shardsGained: weaponGain.shards,
      itLearnedCount: itCount,
      xpGained,
      gold,
      tickets,
      levelsGained: lu.levelsGained,
      newLevel: lu.newLevel,
      skillPointsGained: lu.skillPointsGained,
      newRole: lu.newRole,
      roleChanged: lu.roleChanged,
      floorCleared: isBoss && !alreadyCleared,
      newTitles,
    })

    sfxReward()
    if (lu.levelsGained > 0) setTimeout(sfxLevelUp, 500)
    if (isBoss && !alreadyCleared) setTimeout(sfxFloorClear, lu.levelsGained > 0 ? 1100 : 500)

    setPhase('reward')
  }

  // ============================================================
  // 描画
  // ============================================================
  const showField = ['intro', 'quiz', 'feedback', 'victory'].includes(phase)

  return (
    <div className="screen" style={{ background: floor.bg, gap: 12 }}>
      {showField && (
        <>
          <div className="topbar">
            <button className="iconbtn" onClick={() => navigate('map')} aria-label="逃げる">
              ✕
            </button>
            <div className="topbar__title" style={{ color: 'var(--ink)' }}>
              {floor.name}
            </div>
          </div>

          <div
            className="enemy-stage"
            style={{ backgroundImage: `url(${floorArt(floor)})`, backgroundColor: `${monster.color}22` }}
          >
            <div className="enemy-stage__ground" />
            <Sprite
              src={monsterArt(monster)}
              alt={monster.name}
              size={168}
              fallback={monster.emoji}
              className={`${enemyHurt ? 'shake' : 'floaty'} ${phase === 'victory' ? 'pop' : ''}`}
              style={phase === 'victory' ? { opacity: 0.25, filter: 'grayscale(1)' } : undefined}
            />
            {showFx && phase === 'feedback' && lastCorrect && (
              <div key={`fx${floatKey}`} className={`attack-fx attack-fx--${fx.kind}`} style={{ color: fx.color }}>
                {fx.icon}
              </div>
            )}
            {lastDamage && phase === 'feedback' && lastCorrect && (
              <div
                key={floatKey}
                className={`dmg-float ${lastDamage.special ? 'special' : ''}`}
                style={!lastDamage.special ? { color: fx.color } : undefined}
              >
                -{lastDamage.v}
                {lastDamage.special && ' 特効!'}
              </div>
            )}
          </div>

          <Panel flush className="stack--sm">
            <div className="row">
              <span style={{ fontWeight: 900 }}>{monster.name}</span>
              {(monster.kind === 'boss' || monster.kind === 'last') && (
                <span className="badge" style={{ background: 'var(--gold-deep)' }}>BOSS</span>
              )}
              {monster.kind === 'mid' && (
                <span className="badge" style={{ background: '#7c5cd6' }}>中ボス</span>
              )}
              <span className="grow" />
              <span className="tag">弱点：{monster.weaknessHint}</span>
            </div>
            <Bar value={enemyHp} max={monster.hp} color="var(--danger)" />
            <div className="row" style={{ marginTop: 4 }}>
              <Sprite src={HERO_ART} alt="" size={34} />
              <span style={{ fontWeight: 900 }}>{s.getState().player.name}</span>
              <span className="grow" />
              <span className="row" style={{ gap: 4 }}>
                {equipped && <Sprite src={weaponArt(equipped)} alt="" size={22} fallback={equipped.emoji} />}
                <span className="tag">{equipped ? equipped.name : '素手'}</span>
              </span>
            </div>
            <Bar value={playerHp} max={playerMaxHp} color="var(--hp)" />
          </Panel>
        </>
      )}

      {phase === 'intro' && (
        <Panel className="stack fade-in">
          <div className="h2">⚠️ 困りごと出現！</div>
          <p style={{ margin: 0 }}>{monster.flavor}</p>
          <div className="muted">
            クイズに正解して攻撃しよう。<b>IT研修クイズ</b>を中心に、介護クイズも出るよ。
          </div>
          <div
            style={{
              background: '#e6f0ff',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--primary-deep)',
            }}
          >
            {fx.icon} 装備「{equipped ? equipped.name : '素手'}」の技：{fx.moveName}
            <div className="muted" style={{ fontWeight: 600 }}>
              ※威力は正解で決まります。武器は攻撃の演出が変わります。
            </div>
          </div>
          <Button variant="danger" lg block onClick={() => setPhase('quiz')}>
            たたかう
          </Button>
        </Panel>
      )}

      {phase === 'quiz' && currentQuiz && (
        <QuizBlock quiz={currentQuiz} chosen={chosen} onAnswer={answer} />
      )}

      {phase === 'feedback' && currentQuiz && (
        <FeedbackBlock
          correct={lastCorrect}
          quiz={currentQuiz}
          extra={
            lastCorrect
              ? `${fx.moveName}！ ${monster.name}に ${lastDamage?.v} のダメージ${lastDamage?.special ? '（特効）' : ''}`
              : `不正解… ${monster.name}の反撃で ${lastDamage?.v} のダメージを受けた`
          }
          onNext={afterFeedback}
        />
      )}

      {phase === 'victory' && (
        <Panel className="stack fade-in center">
          <div className="pop" style={{ fontSize: 48 }}>🎉</div>
          <div className="h2">{monster.name} を撃退！</div>
          <p className="muted" style={{ margin: 0 }}>
            現場の困りごとをひとつ解決した。報酬を受け取ろう！
          </p>
          <Button variant="primary" lg block onClick={commitBattle}>
            報酬を受け取る 🎁
          </Button>
        </Panel>
      )}

      {phase === 'reward' && reward && (
        <RewardView
          reward={reward}
          onSkill={() => navigate('skilltree')}
          onGacha={() => navigate('gacha')}
          onDone={() => navigate('map')}
        />
      )}

      {phase === 'defeat' && (
        <div className="stack" style={{ margin: 'auto 0' }}>
          <Panel className="stack center fade-in">
            <div style={{ fontSize: 48 }}>💤</div>
            <div className="h2">力尽きてしまった…</div>
            <p className="muted" style={{ margin: 0 }}>
              無理は禁物。ひと休みして、スキルや装備を整えてから挑もう。
            </p>
            <Button
              variant="primary"
              lg
              block
              onClick={() => {
                useGameStore.getState().healFull()
                navigate('home')
              }}
            >
              ホームで休む
            </Button>
            <Button variant="secondary" block onClick={() => navigate('skilltree')}>
              スキルを見直す
            </Button>
          </Panel>
        </div>
      )}
    </div>
  )
}

// ---- クイズ表示ブロック ----
function QuizBlock({
  quiz,
  chosen,
  onAnswer,
}: {
  quiz: Quiz
  chosen: number | null
  onAnswer: (i: number) => void
}) {
  const isIt = quiz.category === 'it'
  return (
    <Panel className="stack--sm fade-in">
      <span
        className="badge"
        style={{ background: isIt ? 'var(--it)' : 'var(--care)', alignSelf: 'flex-start' }}
      >
        {isIt ? 'WUL IT研修クイズ' : '介護クイズ'}
      </span>
      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{quiz.question}</div>
      <div className="stack--sm" style={{ marginTop: 4 }}>
        {quiz.choices.map((c, i) => (
          <button
            key={i}
            className={`choice ${chosen !== null && i === quiz.answer ? 'correct' : ''} ${
              chosen === i && i !== quiz.answer ? 'wrong' : ''
            } ${chosen !== null && chosen !== i && i !== quiz.answer ? 'dim' : ''}`}
            disabled={chosen !== null}
            onClick={() => onAnswer(i)}
          >
            <span className="choice__mark">{'ABCD'[i]}</span>
            {c}
          </button>
        ))}
      </div>
    </Panel>
  )
}

// ---- 正誤フィードバック ----
function FeedbackBlock({
  correct,
  quiz,
  extra,
  onNext,
}: {
  correct: boolean
  quiz: Quiz
  extra?: string
  onNext: () => void
}) {
  return (
    <Panel className="stack--sm fade-in">
      <div className="h2" style={{ color: correct ? 'var(--good)' : 'var(--danger)' }}>
        {correct ? '⭕ 正解！' : '❌ 残念…'}
      </div>
      {extra && <div style={{ fontWeight: 800 }}>{extra}</div>}
      <div className="panel" style={{ background: '#f4f7fb', padding: 12 }}>
        <div className="muted" style={{ fontWeight: 800, marginBottom: 4 }}>
          解説
        </div>
        <div style={{ fontSize: '0.95rem' }}>{quiz.explanation}</div>
        {quiz.learnPoint && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              borderRadius: 8,
              background: '#e6f0ff',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--primary-deep)',
            }}
          >
            💡 学びポイント：{quiz.learnPoint}
          </div>
        )}
      </div>
      <Button variant="primary" lg block onClick={onNext}>
        つぎへ ▶
      </Button>
    </Panel>
  )
}

// ---- 報酬画面 ----
function RewardView({
  reward,
  onSkill,
  onGacha,
  onDone,
}: {
  reward: RewardState
  onSkill: () => void
  onGacha: () => void
  onDone: () => void
}) {
  const weapon = getWeapon(reward.weaponId)!
  return (
    <div className="stack">
      {reward.floorCleared && (
        <Panel
          className="center pop"
          style={{ background: 'linear-gradient(180deg,#fff3d6,#ffe1a6)', border: '2px solid var(--gold)' }}
        >
          <div style={{ fontSize: 40 }}>🏆</div>
          <div className="h2">フロア攻略！</div>
          <div className="muted">施設がひとつ良くなった。次のフロアが解放されたよ！</div>
        </Panel>
      )}

      <Panel className="stack fade-in center">
        <div className="badge" style={{ background: 'var(--it)', alignSelf: 'center' }}>
          武器獲得！
        </div>
        <Sprite
          src={weaponArt(weapon)}
          alt={weapon.name}
          size={120}
          fallback={weapon.emoji}
          className="pop"
          style={{ alignSelf: 'center' }}
        />
        <div className="h2">{weapon.name}</div>
        <Stars rarity={weapon.rarity} />
        <div className="muted">{weapon.desc}</div>
        <div
          style={{
            background: '#e6f0ff',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--primary-deep)',
          }}
        >
          🛠️ 元ツール：{weapon.toolLabel}
          <br />
          {weapon.fx.icon} 技：{weapon.fx.moveName}（装備すると攻撃の演出が変わる）
        </div>
        {!reward.weaponIsNew && (
          <div
            style={{
              background: '#e6f0ff',
              borderRadius: 10,
              padding: '8px 12px',
              fontWeight: 800,
              color: 'var(--primary-deep)',
            }}
          >
            📘 復習ボーナス！ スキルの欠片 +{reward.shardsGained}
            <div className="muted" style={{ fontWeight: 600 }}>
              欠片は「武器」画面で強化に使えます。
            </div>
          </div>
        )}
      </Panel>

      <Panel className="stack--sm fade-in">
        {reward.itLearnedCount > 0 && (
          <div className="kv">
            <span>💠 学んだITツール</span>
            <b>+{reward.itLearnedCount}</b>
          </div>
        )}
        <div className="kv">
          <span>けいけんち</span>
          <b>+{reward.xpGained} XP</b>
        </div>
        <div className="kv">
          <span>ゴールド</span>
          <b>+{reward.gold} G</b>
        </div>
        <div className="kv">
          <span>ガチャチケット</span>
          <b>+{reward.tickets} 🎟️</b>
        </div>
        {reward.levelsGained > 0 && (
          <div className="pop" style={{ background: '#fff4e0', borderRadius: 10, padding: 10, textAlign: 'center' }}>
            <div className="h2" style={{ color: 'var(--gold-deep)' }}>
              ⬆️ レベルアップ！ Lv.{reward.newLevel}
            </div>
            <div className="muted">スキルP +{reward.skillPointsGained} ／ 最大HP・攻撃力アップ</div>
            {reward.roleChanged && (
              <div style={{ marginTop: 6, fontWeight: 800, color: 'var(--primary-deep)' }}>
                🎖️ 役割が「{reward.newRole}」に昇格！
              </div>
            )}
          </div>
        )}
        {reward.newTitles.length > 0 && (
          <div style={{ background: '#f0e6ff', borderRadius: 10, padding: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>🏅 称号を獲得！</div>
            {reward.newTitles.map((t) => (
              <div key={t} className="tag" style={{ margin: 2 }}>
                {getTitle(t)?.name}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="stack--sm">
        {reward.skillPointsGained > 0 && (
          <Button variant="gold" lg block onClick={onSkill}>
            🌟 スキルを解放する
          </Button>
        )}
        {reward.tickets > 0 && (
          <Button variant="secondary" block onClick={onGacha}>
            🎁 研修ガチャを引く
          </Button>
        )}
        <Button variant="primary" lg block onClick={onDone}>
          マップへ戻る
        </Button>
      </div>
    </div>
  )
}
