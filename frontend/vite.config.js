import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://talksy-chatapp-18xy.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://talksy-chatapp-18xy.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
})
