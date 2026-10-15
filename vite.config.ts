import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/lofi-stats': {
        target: 'https://boxradio-edge-00.streamafrica.net',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/status.xsl',
      },
    },
  },
})
