import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';

const LOCAL_STORAGE_KEY = 'zynx_diary_entries';
const API_ENDPOINT = '/api/diary';

export type DiaryStorageMode = 'cloud' | 'local-file' | 'browser';

export interface DiaryFetchResult {
  entries: DiaryEntry[];
  isCloud: boolean;
  canWrite: boolean;
  storageMode: DiaryStorageMode;
}

export interface DiarySaveResult {
  success: boolean;
  entries: DiaryEntry[];
  isCloud: boolean;
  canWrite: boolean;
  storageMode: DiaryStorageMode;
  warning?: string;
}

function formatDiaryDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month} ${date.getFullYear()}`;
}

function readLocalDiaryEntries(): DiaryEntry[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_DIARY_ENTRIES;
}

function writeLocalDiaryEntries(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function saveLocalDiaryFallback(entry: {
  author: string;
  message?: string;
  drawingData?: string;
}): DiaryEntry[] {
  const existing = readLocalDiaryEntries();
  const nextEntry: DiaryEntry = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: formatDiaryDate(new Date()),
    author: entry.author.trim() || 'A Friend',
    message: entry.message?.trim() ?? '',
    ...(entry.drawingData ? { drawingData: entry.drawingData } : {}),
  };
  const updated = [...existing, nextEntry];
  writeLocalDiaryEntries(updated);
  return updated;
}

export async function fetchLiveDiaryEntries(): Promise<DiaryFetchResult> {
  const localEntries = readLocalDiaryEntries();

  try {
    const res = await fetch(`${API_ENDPOINT}?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        if (data.isCloud === true) {
          writeLocalDiaryEntries(data.entries);
          return {
            entries: data.entries,
            isCloud: true,
            canWrite: data.canWrite === true,
            storageMode: 'cloud',
          };
        }

        if (data.isLocalFile === true) {
          writeLocalDiaryEntries(data.entries);
          return {
            entries: data.entries,
            isCloud: false,
            canWrite: true,
            storageMode: 'local-file',
          };
        }

        // Server responded without a cloud database configured; preserve local browser entries if newer
        if (localEntries.length > data.entries.length) {
          return { entries: localEntries, isCloud: false, canWrite: false, storageMode: 'browser' };
        }
        writeLocalDiaryEntries(data.entries);
        return { entries: data.entries, isCloud: false, canWrite: false, storageMode: 'browser' };
      }
    }
  } catch {
    // Network or offline fallback
  }

  return { entries: localEntries, isCloud: false, canWrite: false, storageMode: 'browser' };
}

export async function saveLiveDiaryEntry(entry: {
  author: string;
  message?: string;
  drawingData?: string;
}): Promise<DiarySaveResult> {
  let warning: string | undefined;

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(entry)
    });

    if (res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.success === true && Array.isArray(data.entries)) {
        writeLocalDiaryEntries(data.entries);
        if (data.isCloud === true) {
          return {
            success: true,
            entries: data.entries,
            isCloud: true,
            canWrite: true,
            storageMode: 'cloud',
          };
        }
        if (data.isLocalFile === true) {
          return {
            success: true,
            entries: data.entries,
            isCloud: false,
            canWrite: true,
            storageMode: 'local-file',
          };
        }
      }

      if (data.code === 'CLOUD_STORAGE_NOT_CONFIGURED' || data.code === 'ATOMIC_CLOUD_STORAGE_NOT_CONFIGURED') {
        warning = 'Saved in this browser only — add Upstash Redis or Gist env vars in Vercel for global sync.';
      } else if (data.code === 'CLOUD_SAVE_FAILED') {
        warning = 'Cloud storage temporarily unreachable — saved in this browser for now.';
      }
    }
  } catch {
    warning = 'Offline — saved in this browser only.';
  }

  const localEntries = saveLocalDiaryFallback(entry);
  return {
    success: true,
    entries: localEntries,
    isCloud: false,
    canWrite: false,
    storageMode: 'browser',
    warning: warning ?? 'Saved in this browser only — cloud API unavailable.',
  };
}
