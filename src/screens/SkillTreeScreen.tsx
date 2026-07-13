import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Pill } from '@/components/ui'
import { SKILL_TREES, skillsByTree, SKILL_MAP } from '@/data/skillTree'
import type { SkillTreeId } from '@/types'

export function SkillTreeScreen() {
  const unlocked = useGameStore((s) => s.player.unlockedSkills)
  const skillPoints = useGameStore((s) => s.player.skillPoints)
  const unlockSkill = useGameStore((s) => s.unlockSkill)
  const [tree, setTree] = useState<SkillTreeId>('care')

  const meta = SKILL_TREES.find((t) => t.id === tree)!
  const nodes = skillsByTree(tree)
  const ownedCount = nodes.filter((n) => unlocked.includes(n.id)).length

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">🌳 スキルツリー</div>
        <span className="topbar__spacer" />
        <Pill color="var(--gold-deep)">🌟 スキルP {skillPoints}</Pill>
      </div>

      <p className="muted">
        3つの力を育てよう。<b>介護</b>で守り、<b>IT</b>で攻め、<b>マネジメント</b>で支える。灰色は「まだ足りない」スキルです。
      </p>

      {/* 系統タブ */}
      <div className="row" style={{ gap: 8 }}>
        {SKILL_TREES.map((t) => {
          const owned = skillsByTree(t.id).filter((n) => unlocked.includes(n.id)).length
          const total = skillsByTree(t.id).length
          const active = tree === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTree(t.id)}
              className="btn"
              style={{
                flex: 1,
                minHeight: 58,
                flexDirection: 'column',
                gap: 2,
                background: active ? t.color : '#eef2f7',
                color: active ? '#fff' : 'var(--ink)',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>
                {t.emoji} {t.label}
              </span>
              <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                {owned}/{total}
              </span>
            </button>
          )
        })}
      </div>

      <div className="row">
        <span className="h2" style={{ color: meta.color }}>
          {meta.emoji} {meta.label}スキル
        </span>
        <span className="grow" />
        <span className="tag">
          習得 {ownedCount}/{nodes.length}
        </span>
      </div>

      <div className="stack--sm">
        {nodes.map((node) => {
          const isOwned = unlocked.includes(node.id)
          const prereqOk = node.requires.every((r) => unlocked.includes(r))
          const affordable = skillPoints >= node.cost
          const canUnlock = !isOwned && prereqOk && affordable
          const bonusText = [
            node.bonus.atk ? `攻撃+${node.bonus.atk}` : '',
            node.bonus.maxHp ? `体力+${node.bonus.maxHp}` : '',
            node.bonus.special ? `✨${node.bonus.special}` : '',
          ]
            .filter(Boolean)
            .join(' / ')

          return (
            <Panel
              key={node.id}
              flush
              style={{
                opacity: isOwned ? 1 : prereqOk ? 1 : 0.55,
                borderColor: isOwned ? meta.color : 'var(--panel-line)',
                background: isOwned ? '#f3faf4' : 'var(--panel)',
              }}
            >
              <div className="row">
                <div
                  style={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 10,
                    background: isOwned ? meta.color : '#e6ebf2',
                    color: isOwned ? '#fff' : 'var(--ink-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                  }}
                >
                  {isOwned ? '✓' : prereqOk ? '◇' : '🔒'}
                </div>
                <div className="grow">
                  <div style={{ fontWeight: 800 }}>{node.name}</div>
                  <div className="muted">{bonusText}</div>
                  {!prereqOk && (
                    <div className="muted" style={{ color: 'var(--danger)' }}>
                      必要：{node.requires.map((r) => SKILL_MAP[r]?.name).join('・')}
                    </div>
                  )}
                </div>
                {isOwned ? (
                  <span className="badge" style={{ background: meta.color }}>
                    習得済
                  </span>
                ) : (
                  <Button
                    variant={canUnlock ? 'gold' : 'secondary'}
                    disabled={!canUnlock}
                    onClick={() => unlockSkill(node.id)}
                  >
                    解放 {node.cost}P
                  </Button>
                )}
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
