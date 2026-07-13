import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages はサブパス（https://<user>.github.io/<repo>/）で配信されるため、
// ビルド時に base を切り替える。ローカル開発では '/' のまま。
// アセットの参照は src/data/art.ts が import.meta.env.BASE_URL を見ているので、
// ここを変えるだけで画像パスも追従する。
const base = process.env.GITHUB_ACTIONS === 'true'
  ? '/wul-care-rpg/'
  : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      workbox: {
        // 生成アセット（透過PNG・背景WebP）をプリキャッシュに含める
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // SPAなので、未知のパスは index.html に戻す
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: 'WUL ケアクエスト',
        short_name: 'ケアクエスト',
        description: 'デジタルスキルで介護現場を救うRPG',
        lang: 'ja',
        theme_color: '#1f6feb',
        background_color: '#0e1526',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
