import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['campusstay-icon.svg'],
      manifest: {
        name: 'CampusStay Jorhat',
        short_name: 'CampusStay',
        description:
          'Find verified PGs and rooms near campus - made easy for students.',
        theme_color: '#1E5B4F',
        background_color: '#FFF8EF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/campusstay-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})