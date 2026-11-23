import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const localDiaryStoragePath = path.resolve(process.cwd(), '.diary-storage.json')

function localDiaryPlugin(): Plugin {
  return {
    name: 'local-diary-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/diary')) return next()

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        if (req.method === 'GET') {
          let entries = []
          try {
            if (fs.existsSync(localDiaryStoragePath)) {
              entries = JSON.parse(fs.readFileSync(localDiaryStoragePath, 'utf-8'))
            }
          } catch {}
          return res.end(JSON.stringify({ success: true, entries }))
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              let entries = []
              if (fs.existsSync(localDiaryStoragePath)) {
                try {
                  entries = JSON.parse(fs.readFileSync(localDiaryStoragePath, 'utf-8'))
                } catch {}
              }
              const newEntry = {
                id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                author: (data.author || 'A Friendly Visitor').slice(0, 40),
                message: data.message ? String(data.message).slice(0, 500) : undefined,
                drawingData: data.drawingData
              }
              entries.push(newEntry)
              fs.writeFileSync(localDiaryStoragePath, JSON.stringify(entries, null, 2))
              res.end(JSON.stringify({ success: true, entry: newEntry, entries }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localDiaryPlugin()],
  server: {
    host: true,
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
