import { useGameStore, type Route } from '@/store/useGameStore'

const TABS: { route: Route; icon: string; label: string }[] = [
  { route: 'home', icon: '🏠', label: 'ホーム' },
  { route: 'map', icon: '🗺️', label: '現場' },
  { route: 'skilltree', icon: '🌳', label: 'スキル' },
  { route: 'weapons', icon: '⚔️', label: '武器' },
  { route: 'gacha', icon: '🎁', label: '研修' },
  { route: 'codex', icon: '📖', label: '図鑑' },
  { route: 'profile', icon: '👤', label: 'プロフ' },
]

export function TabBar() {
  const route = useGameStore((s) => s.route)
  const navigate = useGameStore((s) => s.navigate)
  const skillPoints = useGameStore((s) => s.player.skillPoints)
  const tickets = useGameStore((s) => s.player.tickets)

  // 「使えるものが余っている」タブに数字バッジを出して行動を促す
  const badgeFor = (r: Route): number =>
    r === 'skilltree' ? skillPoints : r === 'gacha' ? tickets : 0

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const badge = badgeFor(t.route)
        return (
          <button
            key={t.route}
            className={`tab-item ${route === t.route ? 'active' : ''}`}
            onClick={() => navigate(t.route)}
          >
            <span className="tab-ico" style={{ position: 'relative' }}>
              {t.icon}
              {badge > 0 && <span className="tab-badge">{badge}</span>}
            </span>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
