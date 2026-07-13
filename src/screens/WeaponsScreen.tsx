import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button, Panel, Pill, Sprite, Stars } from '@/components/ui'
import { WEAPONS } from '@/data/weapons'
import { weaponArt } from '@/data/art'
import { MAX_WEAPON_LEVEL, enhanceCost, weaponAtk, weaponLevel } from '@/game/engine'

export function WeaponsScreen() {
  const player = useGameStore((s) => s.player)
  const equip = useGameStore((s) => s.equipWeapon)
  const enhance = useGameStore((s) => s.enhanceWeapon)
  const [flash, setFlash] = useState<string | null>(null)

  const owned = player.ownedWeapons
  const equippedId = player.equippedWeaponId

  const doEnhance = (id: string) => {
    if (enhance(id)) {
      setFlash(id)
      setTimeout(() => setFlash((f) => (f === id ? null : f)), 600)
    }
  }

  return (
    <div className="screen screen--with-tab">
      <div className="topbar">
        <div className="topbar__title">⚔️ 武器（ITツール）</div>
        <span className="topbar__spacer" />
        <span className="tag">
          {owned.length}/{WEAPONS.length}
        </span>
      </div>
      <p className="muted">
        ITツールを覚えると武器になる。装備した武器の<b>特効</b>が敵の弱点に合うとダメージ2倍！
      </p>

      <Panel className="stack--sm">
        <div className="row wrap" style={{ gap: 8 }}>
          <Pill light>🔧 欠片 {player.shards}</Pill>
          <Pill light>💰 {player.gold}G</Pill>
        </div>
        <div className="muted">
          欠片とゴールドで武器を<b>強化</b>できます（1段階ごとに攻撃+2、最大+
          {MAX_WEAPON_LEVEL}）。欠片は同じツールの復習や、研修ガチャの被りから手に入ります。
        </div>
      </Panel>

      <div className="stack--sm">
        {WEAPONS.map((w) => {
          const has = owned.includes(w.id)
          const isEquipped = equippedId === w.id
          const level = weaponLevel(player, w.id)
          const maxed = level >= MAX_WEAPON_LEVEL
          const cost = enhanceCost(level)
          const canEnhance =
            has && !maxed && player.shards >= cost.shards && player.gold >= cost.gold

          return (
            <Panel
              key={w.id}
              flush
              className={flash === w.id ? 'pop' : ''}
              style={{
                opacity: has ? 1 : 0.5,
                border: isEquipped ? '2px solid var(--gold)' : undefined,
                background: isEquipped ? '#fffaf0' : undefined,
              }}
            >
              <div className="row">
                {has ? (
                  <Sprite src={weaponArt(w)} alt={w.name} size={56} fallback={w.emoji} />
                ) : (
                  <div style={{ fontSize: 40, width: 56, textAlign: 'center' }}>❔</div>
                )}
                <div className="grow">
                  <div className="row wrap" style={{ gap: 6 }}>
                    <span style={{ fontWeight: 800 }}>{has ? w.name : '？？？'}</span>
                    {has && level > 0 && (
                      <span className="badge" style={{ background: 'var(--primary-deep)' }}>
                        +{level}
                      </span>
                    )}
                    <Stars rarity={w.rarity} />
                  </div>
                  {has ? (
                    <>
                      <div className="muted">🛠️ {w.toolLabel}</div>
                      <div className="muted" style={{ color: 'var(--primary-deep)' }}>
                        ⚔️攻撃+{weaponAtk(w, level)}／✨{w.effectDesc}
                      </div>
                      <div className="muted" style={{ color: 'var(--mgmt)', fontWeight: 700 }}>
                        🎯 {w.passiveDesc}
                      </div>
                    </>
                  ) : (
                    <div className="muted">現場で対応するITクイズをクリアして入手</div>
                  )}
                </div>
                {has &&
                  (isEquipped ? (
                    <span className="badge" style={{ background: 'var(--gold-deep)' }}>装備中</span>
                  ) : (
                    <Button variant="secondary" onClick={() => equip(w.id)}>
                      装備
                    </Button>
                  ))}
              </div>

              {has && (
                <div className="row" style={{ marginTop: 10 }}>
                  <div className="grow muted">
                    {maxed
                      ? '✨ 強化はここまで。使いこなしている！'
                      : `つぎの強化：🔧${cost.shards} ／ 💰${cost.gold}G（攻撃+2）`}
                  </div>
                  {!maxed && (
                    <Button
                      variant={canEnhance ? 'primary' : 'secondary'}
                      disabled={!canEnhance}
                      onClick={() => doEnhance(w.id)}
                    >
                      強化
                    </Button>
                  )}
                </div>
              )}
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
