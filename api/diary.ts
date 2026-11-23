import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface DiaryEntry {
  id: string;
  date: string;
  author: string;
  message?: string;
  drawingData?: string;
}

const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: "entry-1",
    date: "29 Oct 2026",
    author: "Joshua D (ZYNX)",
    message: "Welcome to my desk. Everything you see here is interactive—the laptop runs my live projects, the phone rings, and this diary is open for anyone to sign. Leave a note or sketch before you head out!"
  },
  {
    id: "entry-2",
    date: "31 Oct 2026",
    author: "Elena Rostova",
    message: "Loved the haptic feel of the titanium card and the thermal print system! The way the 3D meshes compile purely from procedural geometry is mind-blowing. Cheers from Berlin."
  },
  {
    id: "entry-3",
    date: "04 Nov 2026",
    author: "Marcus Vance",
    message: "Left a quick synth chord on the audio rig. Awesome attention to detail on the AAOS telemetry dashboard. Keep pushing the boundaries of WebGL!"
  },
  {
    id: "entry-4",
    date: "12 Nov 2026",
    author: "Aoi Takahashi",
    message: "The anime lo-fi study room vibe is immaculate. Subscribed to your newsletter and bookmarked your portfolio. Inspiring work on the physical computing interface!"
  }
];

// In-memory cache for serverless lifetime
let memoryEntries: DiaryEntry[] = [...INITIAL_ENTRIES];

async function getFromCloud(): Promise<DiaryEntry[]> {
  // 1. Try Vercel KV / Upstash Redis if configured
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/zynx_guestbook_entries`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryEntries = parsed;
            return memoryEntries;
          }
        }
      }
    } catch {
      // Fall through to other stores
    }
  }

  // 2. Try GitHub Gist storage if configured
  const gistId = process.env.GIST_ID || process.env.VITE_GIST_ID;
  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (gistId && ghToken) {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${ghToken}`,
          'User-Agent': 'zynx-portfolio-guestbook',
          Accept: 'application/vnd.github+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const file = data.files?.['zynx_guestbook.json'];
        if (file && file.content) {
          const parsed = JSON.parse(file.content);
          if (Array.isArray(parsed)) {
            memoryEntries = parsed;
            return memoryEntries;
          }
        }
      }
    } catch {
      // Fall through
    }
  }

  return memoryEntries;
}

async function saveToCloud(entries: DiaryEntry[]): Promise<boolean> {
  memoryEntries = entries;
  let saved = false;

  // 1. Vercel KV / Upstash
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/set/zynx_guestbook_entries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(entries))
      });
      if (res.ok) saved = true;
    } catch {
      // Ignore
    }
  }

  // 2. GitHub Gist
  const gistId = process.env.GIST_ID || process.env.VITE_GIST_ID;
  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (gistId && ghToken) {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${ghToken}`,
          'User-Agent': 'zynx-portfolio-guestbook',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json'
        },
        body: JSON.stringify({
          files: {
            'zynx_guestbook.json': {
              content: JSON.stringify(entries, null, 2)
            }
          }
        })
      });
      if (res.ok) saved = true;
    } catch {
      // Ignore
    }
  }

  return saved;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const entries = await getFromCloud();
      return res.status(200).json({
        success: true,
        entries,
        timestamp: Date.now()
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { author, message, drawingData } = body || {};

      if (!message?.trim() && !drawingData) {
        return res.status(400).json({ error: 'Message or drawing required' });
      }

      const currentEntries = await getFromCloud();
      const dateStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const newEntry: DiaryEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: dateStr,
        author: String(author || 'A Friendly Visitor').trim().slice(0, 40),
        message: message ? String(message).trim().slice(0, 500) : undefined,
        drawingData: drawingData && typeof drawingData === 'string' ? drawingData : undefined
      };

      const updated = [...currentEntries, newEntry];
      await saveToCloud(updated);

      return res.status(200).json({
        success: true,
        entry: newEntry,
        entries: updated
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
