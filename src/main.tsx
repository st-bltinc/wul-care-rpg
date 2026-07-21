import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import '@/styles/global.css'

// PWA: サービスワーカー登録（オフライン対応・自動更新）
// registerType:'autoUpdate' なので新版検知時は自動でリロードされる。
// ただし既定では読み込み時しか新版を確認しないため、定期チェックを足して
// 開いたまま／開き直すだけで最新版に追従できるようにする。
import { registerSW } from 'virtual:pwa-register'
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => registration.update(), 60_000)
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
