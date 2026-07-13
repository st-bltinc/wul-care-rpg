import { useGameStore } from '@/store/useGameStore'
import { TabBar } from '@/components/TabBar'
import { TitleScreen } from '@/screens/TitleScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { MapScreen } from '@/screens/MapScreen'
import { BattleScreen } from '@/screens/BattleScreen'
import { SkillTreeScreen } from '@/screens/SkillTreeScreen'
import { WeaponsScreen } from '@/screens/WeaponsScreen'
import { GachaScreen } from '@/screens/GachaScreen'
import { CodexScreen } from '@/screens/CodexScreen'
import { FacilityScreen } from '@/screens/FacilityScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'

const TAB_ROUTES = new Set([
  'home',
  'map',
  'skilltree',
  'weapons',
  'gacha',
  'codex',
  'facility',
  'profile',
])

export default function App() {
  const route = useGameStore((s) => s.route)

  const screen = (() => {
    switch (route) {
      case 'title':
        return <TitleScreen />
      case 'home':
        return <HomeScreen />
      case 'map':
        return <MapScreen />
      case 'battle':
        return <BattleScreen />
      case 'skilltree':
        return <SkillTreeScreen />
      case 'weapons':
        return <WeaponsScreen />
      case 'gacha':
        return <GachaScreen />
      case 'codex':
        return <CodexScreen />
      case 'facility':
        return <FacilityScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  })()

  return (
    <div className="app-root">
      <div className="game-frame">
        {screen}
        {TAB_ROUTES.has(route) && <TabBar />}
      </div>
    </div>
  )
}
