import { useMemo, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Bar, Stars, Sprite } from '@/components/ui'
import { HERO_ART, floorArt, monsterArt, weaponArt } from '@/data/art'
import { getMonster } from '@/data/monsters'
import { getFloor } from '@/data/floors'
import { careQuizzesForFloor, itQuizzesForFloor } from '@/data/quizzes'
import { getWeapon, WEAPONS } from '@/data/weapons'
import {
  computeDamage,
  enemyDamage,
  effectiveMaxHp,
  firstStrikeDamage,
  maskedWrongChoices,
  rewardFor,
  xpMultiplier,
} from '@/game/engine'
import type { Quiz } from '@/types'
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

type Phase =
  | 'intro'
  | 'careQuiz'
  | 'careFeedback'
  | 'victory'
  | 'itQuiz'
  | 'itFeedback'
  | 'reward'
  | 'defeat'

interface RewardState {
  weaponId: string
  weaponIsNew: boolean
  /** 武器が被ったときに復習ボーナスとして得た欠片 */
  shardsGained: number
  itCorrect: boolean
  xpGained: number
  xpBoosted: boolean
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

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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

  const carePool = useMemo(() => (floorId ? shuffle(careQuizzesForFloor(floorId)) : []), [floorId])
  const [careIdx, setCareIdx] = useState(0)
  const itQuiz = useMemo<Quiz | null>(() => {
    if (!floorId) return null
    const pool = itQuizzesForFloor(floorId)
    const learned = s.getState().player.answeredItTools
    const fresh = pool.find((q) => q.tool && !learned.includes(q.tool))
    return fresh ?? pool[0] ?? null
  }, [floorId])

  const [chosen, setChosen] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [lastDamage, setLastDamage] = useState<{ v: number; special: boolean; crit: boolean; rally: boolean } | null>(
    null,
  )
  const [lastDodged, setLastDodged] = useState(false)
  const [floatKey, setFloatKey] = useState(0)
  const [enemyHurt, setEnemyHurt] = useState(false)
  const [reward, setReward] = useState<RewardState | null>(null)
  const [committed, setCommitted] = useState(false)
  /** 武器のヒント効果で伏せる誤答のindex（クイズごとに算出） */
  const [masked, setMasked] = useState<number[]>([])
  const [quizCount, setQuizCount] = useState(0)

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
  const currentCare = carePool.length ? carePool[careIdx % carePool.length] : null

  /** 武器のヒント効果で、誤答の選択肢をランダムに伏せる */
  const maskWrongChoices = (quiz: Quiz, isFirst: boolean): number[] => {
    const n = maskedWrongChoices(equipped, isFirst)
    if (n === 0) return []
    const wrong = quiz.choices.map((_, i) => i).filter((i) => i !== quiz.answer)
    return shuffle(wrong).slice(0, n)
  }

  /** たたかう：カレンダーの先制ダメージを入れてから最初のクイズへ */
  const startFight = () => {
    const first = firstStrikeDamage(s.getState().player, equipped)
    if (first > 0) {
      setEnemyHp((hp) => Math.max(0, hp - first))
      setLastDamage({ v: first, special: false, crit: false, rally: false })
      setFloatKey((k) => k + 1)
      setEnemyHurt(true)
      setTimeout(() => setEnemyHurt(false), 400)
    }
    if (currentCare) setMasked(maskWrongChoices(currentCare, true))
    setPhase('careQuiz')
  }

  // ---- 介護クイズ回答 ----
  const answerCare = (idx: number) => {
    if (!currentCare || chosen !== null) return
    setChosen(idx)
    setQuizCount((c) => c + 1)
    const correct = idx === currentCare.answer
    setLastCorrect(correct)
    setLastDodged(false)
    if (correct) {
      const dmg = computeDamage(s.getState().player, equipped, monster)
      setLastDamage({ v: dmg.damage, special: dmg.special, crit: dmg.crit, rally: dmg.rally })
      setFloatKey((k) => k + 1)
      setEnemyHurt(true)
      setEnemyHp((hp) => Math.max(0, hp - dmg.damage))
      setTimeout(() => setEnemyHurt(false), 400)
      sfxCorrect()
      setTimeout(dmg.special || dmg.crit || dmg.rally ? sfxSpecial : sfxHit, 160)
    } else {
      const atk = enemyDamage(monster, equipped)
      setLastDamage({ v: atk.damage, special: false, crit: false, rally: false })
      setLastDodged(atk.dodged)
      setPlayerHp((hp) => Math.max(0, hp - atk.damage))
      sfxWrong()
      if (!atk.dodged) setTimeout(sfxDamage, 220)
    }
    setPhase('careFeedback')
  }

  const afterCareFeedback = () => {
    setChosen(null)
    if (enemyHp <= 0) {
      sfxVictory()
      setPhase('victory')
    } else if (playerHp <= 0) {
      sfxDefeat()
      setPhase('defeat')
    } else {
      const next = carePool.length ? carePool[(careIdx + 1) % carePool.length] : null
      setCareIdx((i) => i + 1)
      setMasked(next ? maskWrongChoices(next, false) : [])
      setPhase('careQuiz')
    }
  }

  // ---- IT研修クイズ回答 ----
  const goItQuiz = () => {
    setChosen(null)
    setMasked(itQuiz ? maskWrongChoices(itQuiz, quizCount === 0) : [])
    setPhase('itQuiz')
  }

  const answerIt = (idx: number) => {
    if (!itQuiz || chosen !== null) return
    setChosen(idx)
    const correct = idx === itQuiz.answer
    setLastCorrect(correct)
    if (correct) sfxCorrect()
    else sfxWrong()
    setPhase('itFeedback')
  }

  // ---- 戦闘結果を確定（1回だけ） ----
  const commitBattle = () => {
    if (committed || !itQuiz) return
    setCommitted(true)
    const st = useGameStore.getState()
    const itCorrect = lastCorrect
    const rewardWeapon = WEAPONS.find((w) => w.sourceTool === itQuiz.tool)!

    st.recordDefeat(monster.id)
    const weaponGain = st.addWeapon(rewardWeapon.id)
    if (itCorrect && itQuiz.tool) st.recordItLearned(itQuiz.tool)

    const base = rewardFor(monster)
    const xpRate = xpMultiplier(st.player, equipped) // お守り＋ドキュメントの獲得XPボーナス
    const xpGained = Math.round((itCorrect ? base.xp * 1.5 : base.xp) * xpRate)
    const gold = base.gold
    const tickets = base.tickets + (itCorrect ? 1 : 0)

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
      itCorrect,
      xpGained,
      xpBoosted: xpRate > 1,
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

    // 報酬 → レベルアップ → フロア攻略 の順に音を重ねる
    sfxReward()
    if (lu.levelsGained > 0) setTimeout(sfxLevelUp, 500)
    if (isBoss && !alreadyCleared) setTimeout(sfxFloorClear, lu.levelsGained > 0 ? 1100 : 500)

    setPhase('reward')
  }

  // ============================================================
  // 描画
  // ============================================================

  // 戦闘フィールド（敵・HP）を共有表示するフェーズ
  const showField = ['intro', 'careQuiz', 'careFeedback', 'victory', 'itQuiz', 'itFeedback'].includes(
    phase,
  )

  return (
    <div
      className="screen"
      style={{ background: floor.bg, gap: 12 }}
    >
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
              fallback={monster.emoji}
              size={168}
              className={`${enemyHurt ? 'shake' : 'floaty'} ${phase === 'victory' ? 'pop' : ''}`}
              style={phase === 'victory' ? { opacity: 0.25, filter: 'grayscale(1)' } : undefined}
            />
            {lastDamage && phase === 'careFeedback' && lastCorrect && (
              <div key={floatKey} className={`dmg-float ${lastDamage.special ? 'special' : ''}`}>
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
              <span className="grow" />
              <span className="tag">弱点：{monster.weaknessHint}</span>
            </div>
            <Bar value={enemyHp} max={monster.hp} color="var(--danger)" />
            <div className="row" style={{ marginTop: 4 }}>
              <Sprite src={HERO_ART} alt="" size={34} />
              <span style={{ fontWeight: 900 }}>{s.getState().player.name}</span>
              <span className="grow" />
              {equipped && (
                <span className="row" style={{ gap: 4 }}>
                  <Sprite src={weaponArt(equipped)} alt="" size={22} fallback={equipped.emoji} />
                  <span className="tag">{equipped.name}</span>
                </span>
              )}
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
            介護クイズに正解して弱点を突こう。武器の特効が弱点に合うと大ダメージ！
          </div>
          {equipped && (
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
              {equipped.emoji} {equipped.name}の効果：{equipped.passiveDesc}
            </div>
          )}
          <Button variant="danger" lg block onClick={startFight}>
            たたかう
          </Button>
        </Panel>
      )}

      {phase === 'careQuiz' && currentCare && (
        <QuizBlock
          badge="介護クイズ"
          badgeColor="var(--care)"
          quiz={currentCare}
          chosen={chosen}
          masked={masked}
          hintLabel={equipped && masked.length > 0 ? `${equipped.name}が選択肢を絞った！` : undefined}
          onAnswer={answerCare}
        />
      )}

      {phase === 'careFeedback' && currentCare && (
        <FeedbackBlock
          correct={lastCorrect}
          quiz={currentCare}
          extra={
            lastCorrect
              ? `${monster.name}に ${lastDamage?.v} のダメージ！` +
                [
                  lastDamage?.special ? '（特効）' : '',
                  lastDamage?.crit ? '（会心！）' : '',
                  lastDamage?.rally ? '（チーム追撃！）' : '',
                ].join('')
              : lastDodged
                ? `${monster.name}の反撃を遠隔から回避した！ ダメージなし`
                : `${monster.name}の反撃！ ${lastDamage?.v} のダメージを受けた…`
          }
          onNext={afterCareFeedback}
        />
      )}

      {phase === 'victory' && (
        <Panel className="stack fade-in center">
          <div className="pop" style={{ fontSize: 48 }}>🎉</div>
          <div className="h2">{monster.name} を撃退！</div>
          <p className="muted" style={{ margin: 0 }}>
            現場の困りごとをひとつ解決した。つづいてWULのIT研修だ！
          </p>
          <Button variant="primary" lg block onClick={goItQuiz}>
            IT研修クイズへ ▶
          </Button>
        </Panel>
      )}

      {phase === 'itQuiz' && itQuiz && (
        <QuizBlock
          badge="WUL IT研修クイズ"
          badgeColor="var(--it)"
          quiz={itQuiz}
          chosen={chosen}
          masked={masked}
          hintLabel={equipped && masked.length > 0 ? `${equipped.name}が選択肢を絞った！` : undefined}
          onAnswer={answerIt}
        />
      )}

      {phase === 'itFeedback' && itQuiz && (
        <FeedbackBlock
          correct={lastCorrect}
          quiz={itQuiz}
          learn={itQuiz.learnPoint}
          onNext={commitBattle}
          nextLabel="報酬を受け取る 🎁"
        />
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
              無理は禁物。ひと休みして、スキルや武器を整えてから挑もう。
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
  badge,
  badgeColor,
  quiz,
  chosen,
  masked,
  hintLabel,
  onAnswer,
}: {
  badge: string
  badgeColor: string
  quiz: Quiz
  chosen: number | null
  /** 武器のヒント効果で伏せられた誤答のindex */
  masked: number[]
  hintLabel?: string
  onAnswer: (i: number) => void
}) {
  return (
    <Panel className="stack--sm fade-in">
      <span className="badge" style={{ background: badgeColor, alignSelf: 'flex-start' }}>
        {badge}
      </span>
      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{quiz.question}</div>
      {hintLabel && (
        <div className="tag" style={{ background: '#e6f0ff', color: 'var(--primary-deep)', alignSelf: 'flex-start' }}>
          ✨ {hintLabel}
        </div>
      )}
      <div className="stack--sm" style={{ marginTop: 4 }}>
        {quiz.choices.map((c, i) => {
          const isMasked = masked.includes(i)
          return (
            <button
              key={i}
              className={`choice ${chosen !== null && i === quiz.answer ? 'correct' : ''} ${
                chosen === i && i !== quiz.answer ? 'wrong' : ''
              } ${(chosen !== null && chosen !== i && i !== quiz.answer) || isMasked ? 'dim' : ''}`}
              disabled={chosen !== null || isMasked}
              onClick={() => onAnswer(i)}
            >
              <span className="choice__mark">{'ABCD'[i]}</span>
              {isMasked ? <s style={{ opacity: 0.6 }}>{c}</s> : c}
            </button>
          )
        })}
      </div>
    </Panel>
  )
}

// ---- 正誤フィードバック ----
function FeedbackBlock({
  correct,
  quiz,
  extra,
  learn,
  onNext,
  nextLabel = 'つぎへ ▶',
}: {
  correct: boolean
  quiz: Quiz
  extra?: string
  learn?: string
  onNext: () => void
  nextLabel?: string
}) {
  return (
    <Panel className="stack--sm fade-in">
      <div
        className="h2"
        style={{ color: correct ? 'var(--good)' : 'var(--danger)' }}
      >
        {correct ? '⭕ 正解！' : '❌ 残念…'}
      </div>
      {extra && <div style={{ fontWeight: 800 }}>{extra}</div>}
      <div className="panel" style={{ background: '#f4f7fb', padding: 12 }}>
        <div className="muted" style={{ fontWeight: 800, marginBottom: 4 }}>
          解説
        </div>
        <div style={{ fontSize: '0.95rem' }}>{quiz.explanation}</div>
        {learn && (
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
            💡 学びポイント：{learn}
          </div>
        )}
      </div>
      <Button variant="primary" lg block onClick={onNext}>
        {nextLabel}
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
          ✨ {weapon.effectDesc}
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
        {!reward.itCorrect && (
          <div className="muted">IT研修は不正解でも武器はもらえるよ。次は正解して「学習」を達成しよう！</div>
        )}
      </Panel>

      <Panel className="stack--sm fade-in">
        <div className="kv">
          <span>けいけんち{reward.xpBoosted && '（お守り効果✨）'}</span>
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
            <div className="muted">
              スキルP +{reward.skillPointsGained} ／ 最大HP・攻撃力アップ
            </div>
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
