import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = process.env.VITE_BACKEND_PORT || env.VITE_BACKEND_PORT || '5000'
  const backendUrl = `http://127.0.0.1:${backendPort}`

  return {
    plugins: [react()],
    server: {
      fs: {
        strict: false,
      },
      proxy: {
        '/api': backendUrl,
        '/predict': backendUrl,
      },
    },
  }
})
