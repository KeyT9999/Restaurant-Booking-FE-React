import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/v1 → http://127.0.0.1:3001/api/v1
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /health → http://127.0.0.1:3001/health
      '/health': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy socket.io → http://127.0.0.1:3001 with WebSocket support
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
