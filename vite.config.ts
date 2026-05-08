import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://www.seoul-sewer.duckdns.org'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 개발 서버: /api/** → 백엔드로 프록시 (CORS 우회)
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
})
