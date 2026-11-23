import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';

const LOCAL_STORAGE_KEY = 'zynx_diary_entries';
const API_ENDPOINT = '/api/diary';

export async function fetchLiveDiaryEntries(): Promise<{ entries: DiaryEntry[]; isCloud: boolean }> {
  try {
    const res = await fetch(`${API_ENDPOINT}?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.entries));
        } catch {}
        return { entries: data.entries, isCloud: true };
      }
    }
  } catch {
    // Network or offline fallback
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { entries: parsed, isCloud: false };
      }
    }
  } catch {}

  return { entries: INITIAL_DIARY_ENTRIES, isCloud: false };
}

export async function saveLiveDiaryEntry(entry: {
  author: string;
  message?: string;
  drawingData?: string;
}): Promise<{ success: boolean; entries: DiaryEntry[] }> {
  // 1. Try sending to Cloud API
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(entry)
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.entries)) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.entries));
        } catch {}
        return { success: true, entries: data.entries };
      }
    }
  } catch {
    // Network failure
  }

  // 2. Offline / Local fallback: append locally
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const localEntry: DiaryEntry = {
    id: `entry-${Date.now()}`,
    date: dateStr,
    author: entry.author.trim() || 'A Friendly Visitor',
    message: entry.message?.trim() || '',
    drawingData: entry.drawingData
  };

  let currentEntries = INITIAL_DIARY_ENTRIES;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) currentEntries = JSON.parse(saved);
  } catch {}

  const updated = [...currentEntries, localEntry];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, entries: updated };
}
