import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Vérifie et applique les mises à jour automatiquement à chaque visite,
      // pour ne jamais rester bloqué sur une ancienne version de l'app.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'StudyMind AI',
        short_name: 'StudyMind',
        description: "Révise 2x plus vite avec l'IA : résumés, quiz, chat et examens type BAC/BEPC.",
        theme_color: '#6C5CE7',
        background_color: '#07070f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
})
