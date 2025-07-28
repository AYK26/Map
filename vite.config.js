import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/point': {
        target: 'https://localhost:7099',
        changeOrigin: true,
        secure: false,
      },
      '/api/line': {
        target: 'https://localhost:7099',
        changeOrigin: true,
        secure: false,
      },
      '/api/polygon': {
        target: 'https://localhost:7099',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
