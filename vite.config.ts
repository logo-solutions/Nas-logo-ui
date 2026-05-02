import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api/immich': {
        target: 'http://localhost:2283',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/immich/, '/api'),
      },
      '/api/paperless': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/paperless/, '/api'),
      },
      '/api/meilisearch': {
        target: 'http://localhost:7700',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/meilisearch/, ''),
      },
    },
  },
})
