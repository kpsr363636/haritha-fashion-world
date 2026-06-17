import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Note: vite-plugin-pwa 0.19 is incompatible with Vite 4's ESM-only workbox-build.
// PWA manifest is served from /public/manifest.json directly.
// To enable full service worker: upgrade to Vite 5 + vite-plugin-pwa 0.20+

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist'
  }
})
