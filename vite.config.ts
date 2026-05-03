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
        target: 'http://100.113.214.55:2283',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/immich/, '/api'),
      },
      '/api/paperless': {
        target: 'http://100.113.214.55:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/paperless/, '/api'),
      },
      '/api/meilisearch': {
        target: 'http://100.113.214.55:7700',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/meilisearch/, ''),
      },
      '/api/n8n': {
        target: 'http://100.113.214.55:5679',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
      },
      '/api/grafana': {
        target: 'http://100.113.214.55:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/grafana/, ''),
      },
    },
  },
})
