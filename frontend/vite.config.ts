import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/predict': 'http://127.0.0.1:5000',
    },
  },
})
