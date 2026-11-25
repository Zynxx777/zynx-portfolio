export interface DiaryEntry {
  id: string;
  date: string;
  author: string;
  message: string;
  drawingData?: string;
}

const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: "entry-1",
    date: "29 Oct 2026",
    author: "Joshua D (ZYNX)",
    message: "Welcome to my desk. Everything here is interactive. Leave a note or sketch in the diary before you head out."
  }
];

const KV_LIST_KEY = "zynx_guestbook_entries_v2";
const LEGACY_KV_KEY = "zynx_guestbook_entries";
const GIST_FILE_NAME = "zynx_guestbook.json";

// Redis runs this entire append as one operation, so concurrent visitors cannot
// overwrite one another between reading and writing the Death Note guestbook.
const APPEND_ENTRY_SCRIPT = `
local items = redis.call('LRANGE', KEYS[1], 0, -1)
if #items == 0 then
  local legacy = redis.call('GET', KEYS[2])
  local seed = nil
  if legacy then
    local ok, decoded = pcall(cjson.decode, legacy)
    if ok and type(decoded) == 'table' and #decoded > 0 then
      seed = decoded
    end
  end
  if not seed then
    seed = cjson.decode(ARGV[2])
  end
  for _, entry in ipairs(seed) do
    redis.call('RPUSH', KEYS[1], cjson.encode(entry))
  end
end
redis.call('RPUSH', KEYS[1], ARGV[1])
return redis.call('LRANGE', KEYS[1], 0, -1)
`;

type DiaryRequest = { method?: string; body?: unknown };
type DiaryResponse = {
  setHeader(name: string, value: string): DiaryResponse;
  status(code: number): DiaryResponse;
  json(body: unknown): DiaryResponse;
  end(): void;
};

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

function getGistConfig() {
  const gistId = process.env.GIST_ID || process.env.VITE_GIST_ID;
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return gistId && token ? { gistId, token } : null;
}

async function runKvCommand(command: unknown[]): Promise<unknown> {
  const config = getKvConfig();
  if (!config) throw new Error("Atomic Redis storage is not configured");

  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error(`Diary store returned ${res.status}`);

  const data = await res.json() as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

function parseEntry(value: unknown): DiaryEntry | null {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object") return null;
    const raw = parsed as Partial<DiaryEntry>;
    if (typeof raw.id !== "string" || typeof raw.author !== "string") return null;
    return {
      id: raw.id,
      date: typeof raw.date === "string" ? raw.date : "29 Oct 2026",
      author: raw.author,
      message: typeof raw.message === "string" ? raw.message : "",
      ...(typeof raw.drawingData === "string" ? { drawingData: raw.drawingData } : {}),
    };
  } catch {
    return null;
  }
}

function parseEntryArray(value: unknown): DiaryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseEntry).filter((entry): entry is DiaryEntry => entry !== null);
}

async function readFromKv(): Promise<DiaryEntry[]> {
  const values = await runKvCommand(["LRANGE", KV_LIST_KEY, "0", "-1"]);
  const listedEntries = parseEntryArray(values);
  if (listedEntries.length > 0) return listedEntries;

  const legacyValue = await runKvCommand(["GET", LEGACY_KV_KEY]);
  if (typeof legacyValue === "string") {
    try {
      const legacyEntries = parseEntryArray(JSON.parse(legacyValue));
      if (legacyEntries.length > 0) return legacyEntries;
    } catch {
      // Ignore malformed legacy payload and let seed migration proceed
    }
  }
  return [];
}

async function readFromGist(): Promise<{ entries: DiaryEntry[]; reachable: boolean }> {
  const config = getGistConfig();
  if (!config) return { entries: [], reachable: false };

  try {
    const res = await fetch(`https://api.github.com/gists/${config.gistId}?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "User-Agent": "zynx-portfolio-death-note",
        Accept: "application/vnd.github+json"
      },
      cache: "no-store"
    });
    if (!res.ok) return { entries: [], reachable: false };
    const data = await res.json() as { files?: Record<string, { content?: string }> };
    const content = data.files?.[GIST_FILE_NAME]?.content;
    if (!content) return { entries: [], reachable: true };
    return { entries: parseEntryArray(JSON.parse(content)), reachable: true };
  } catch {
    return { entries: [], reachable: false };
  }
}

async function getFromCloud(): Promise<{ entries: DiaryEntry[]; isCloud: boolean; canWrite: boolean }> {
  const kvConfigured = Boolean(getKvConfig());
  if (kvConfigured) {
    try {
      const entries = await readFromKv();
      if (entries.length > 0) {
        return { entries, isCloud: true, canWrite: true };
      }
      const gistData = await readFromGist();
      if (gistData.entries.length > 0) {
        return { entries: gistData.entries, isCloud: true, canWrite: true };
      }
      return { entries: INITIAL_ENTRIES, isCloud: true, canWrite: true };
    } catch {
      // Fall back to Gist if configured
    }
  }

  if (getGistConfig()) {
    const gistData = await readFromGist();
    if (gistData.reachable) {
      return {
        entries: gistData.entries.length > 0 ? gistData.entries : INITIAL_ENTRIES,
        isCloud: true,
        canWrite: true
      };
    }
  }

  return {
    entries: INITIAL_ENTRIES,
    isCloud: false,
    canWrite: false
  };
}

async function appendToKv(entry: DiaryEntry, seedEntries: DiaryEntry[]): Promise<DiaryEntry[]> {
  const result = await runKvCommand([
    "EVAL",
    APPEND_ENTRY_SCRIPT,
    "2",
    KV_LIST_KEY,
    LEGACY_KV_KEY,
    JSON.stringify(entry),
    JSON.stringify(seedEntries.length > 0 ? seedEntries : INITIAL_ENTRIES)
  ]);
  const entries = parseEntryArray(result);
  if (entries.length === 0 || !entries.some(item => item.id === entry.id)) {
    throw new Error("Diary store did not confirm the new entry");
  }
  return entries;
}

async function appendToGist(entry: DiaryEntry, seedEntries: DiaryEntry[]): Promise<DiaryEntry[]> {
  const config = getGistConfig();
  if (!config) throw new Error("Gist storage is not configured");

  // Re-fetch right before writing so concurrent saves merge cleanly by id
  const latest = await readFromGist();
  const base = latest.entries.length > 0 ? latest.entries : (seedEntries.length > 0 ? seedEntries : INITIAL_ENTRIES);
  const updated = base.some(item => item.id === entry.id) ? base : [...base, entry];

  const patchRes = await fetch(`https://api.github.com/gists/${config.gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "zynx-portfolio-death-note",
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      files: {
        [GIST_FILE_NAME]: {
          content: JSON.stringify(updated, null, 2)
        }
      }
    })
  });

  if (!patchRes.ok) {
    throw new Error(`Gist save failed with status ${patchRes.status}`);
  }

  return updated;
}

export default async function handler(req: DiaryRequest, res: DiaryResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const { entries, isCloud, canWrite } = await getFromCloud();
      return res.status(200).json({
        success: true,
        entries,
        isCloud,
        canWrite,
        timestamp: Date.now()
      });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);
      const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
      const author = typeof payload.author === "string" ? payload.author.trim().slice(0, 40) : "";
      const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 420) : "";
      const drawingData = typeof payload.drawingData === "string" ? payload.drawingData : undefined;

      if (!message && !drawingData) {
        return res.status(400).json({ error: "Message or drawing required" });
      }
      if (drawingData && (!drawingData.startsWith("data:image/png;base64,") || drawingData.length > 1_200_000)) {
        return res.status(413).json({ error: "Drawing is invalid or too large" });
      }

      const hasKv = Boolean(getKvConfig());
      const hasGist = Boolean(getGistConfig());
      if (!hasKv && !hasGist) {
        return res.status(503).json({
          success: false,
          isCloud: false,
          canWrite: false,
          code: "CLOUD_STORAGE_NOT_CONFIGURED"
        });
      }

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = now.toLocaleString("en-US", { month: "short" });
      const date = `${day} ${month} ${now.getFullYear()}`;

      const entry: DiaryEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        date,
        author: author || "A Friend",
        message,
        ...(drawingData ? { drawingData } : {}),
      };

      try {
        const { entries: seedEntries } = await getFromCloud();
        const entries = hasKv
          ? await appendToKv(entry, seedEntries)
          : await appendToGist(entry, seedEntries);
        return res.status(200).json({ success: true, entry, entries, isCloud: true, canWrite: true });
      } catch {
        return res.status(503).json({
          success: false,
          isCloud: false,
          canWrite: false,
          code: "CLOUD_SAVE_FAILED"
        });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
