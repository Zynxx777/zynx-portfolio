import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const localDiaryStoragePath = path.resolve(process.cwd(), '.diary-storage.json')
const initialLocalDiaryEntries = [
  {
    id: 'entry-1',
    date: '29 Oct 2026',
    author: 'Joshua D (ZYNX)',
    message: 'Welcome to my desk. Everything here is interactive. Leave a note or sketch in the diary before you head out.',
  },
]

function readSeededLocalEntries(): unknown[] {
  if (fs.existsSync(localDiaryStoragePath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(localDiaryStoragePath, 'utf-8'))
      if (Array.isArray(saved) && saved.length > 0) return saved
    } catch {}
  }
  return initialLocalDiaryEntries
}

function localDiaryPlugin(): Plugin {
  return {
    name: 'local-diary-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/diary') return next()

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store, max-age=0')

        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.statusCode = 204
          return res.end()
        }

        if (req.method === 'GET') {
          const entries = readSeededLocalEntries()
          return res.end(JSON.stringify({ success: true, entries, isCloud: false, canWrite: true, isLocalFile: true }))
        }

        if (req.method === 'POST') {
          let body = ''
          let tooLarge = false
          req.on('data', chunk => {
            if (tooLarge) return
            body += chunk
            if (body.length > 1_250_000) {
              tooLarge = true
              body = ''
            }
          })
          req.on('end', () => {
            if (tooLarge) {
              res.statusCode = 413
              res.end(JSON.stringify({ error: 'Diary entry is too large' }))
              return
            }
            try {
              const data = JSON.parse(body)
              const author = typeof data.author === 'string' ? data.author.trim().slice(0, 40) : ''
              const message = typeof data.message === 'string' ? data.message.trim().slice(0, 420) : ''
              const drawingData = typeof data.drawingData === 'string' ? data.drawingData : undefined
              if (!message && !drawingData) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Message or drawing required' }))
                return
              }
              if (drawingData && (!drawingData.startsWith('data:image/png;base64,') || drawingData.length > 1_200_000)) {
                res.statusCode = 413
                res.end(JSON.stringify({ error: 'Drawing is invalid or too large' }))
                return
              }

              const entries = readSeededLocalEntries()
              const now = new Date()
              const day = String(now.getDate()).padStart(2, '0')
              const month = now.toLocaleString('en-US', { month: 'short' })
              const newEntry = {
                id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                date: `${day} ${month} ${now.getFullYear()}`,
                author: author || 'A Friend',
                message,
                ...(drawingData ? { drawingData } : {}),
              }
              const updated = [...entries, newEntry]
              const tempPath = `${localDiaryStoragePath}.tmp`
              fs.writeFileSync(tempPath, JSON.stringify(updated, null, 2))
              fs.renameSync(tempPath, localDiaryStoragePath)
              res.end(JSON.stringify({ success: true, entry: newEntry, entries: updated, isCloud: false, canWrite: true, isLocalFile: true }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Unable to save this diary entry' }))
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
