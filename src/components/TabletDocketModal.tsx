import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BatteryFull,
  BookOpen,
  Check,
  Copy,
  Disc3,
  Download,
  Droplets,
  Loader2,
  Music,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  Receipt,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Scale,
  Trash2,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import { soundFX } from '../utils/audioFX';
import { downloadVCard } from '../utils/cardCanvas';
import { ZYNX_PROFILE } from '../data/portfolioData';
import {
  BEDROOM_PLAYLIST,
  musicPlayerEngine,
  type PlayerState,
} from '../utils/musicPlayerEngine';

export interface DocketItem {
  id: string;
  name: string;
  pricePerKg: number;
  weightKg: number;
  total: number;
}

export interface DocketOrder {
  docketNumber: string;
  customer: string;
  dateStr: string;
  items: DocketItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMethod: string;
}

export type TabletAppId = 'home' | 'docket' | 'qr' | 'player';

interface TabletDocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintDocket: (order: DocketOrder) => void;
  initialApp?: TabletAppId;
  initialAddSong?: boolean;
  onOpenDiary?: () => void;
  onFocusTurntable?: () => void;
  plantWaterCount?: number;
  diaryPageCount?: number;
  docketsPrintedCount?: number;
}

interface CommunityTrackPick {
  id: string;
  title: string;
  artist: string;
  pickedBy: string;
  addedLabel: string;
  playlistIndex: number;
  accent: string;
}

const COMMUNITY_PICKS_STORAGE_KEY = 'zynx_player_custom_picks_v1';
const PLAY_COUNTS_STORAGE_KEY = 'zynx_player_counts_v1';

const BASE_MIXTAPE_PICKS: CommunityTrackPick[] = [
  {
    id: 'pick-afrotonic4',
    title: 'Afrotonic 4',
    artist: '7YNX',
    pickedBy: "Joshua's pick",
    addedLabel: 'Pinned',
    playlistIndex: 7,
    accent: '#10b981',
  },
  {
    id: 'pick-analog',
    title: 'Analog',
    artist: '7YNX',
    pickedBy: "Studio session",
    addedLabel: '2h ago',
    playlistIndex: 8,
    accent: '#06b6d4',
  },
  {
    id: 'pick-if-only-you',
    title: 'If Only You',
    artist: '7YNX',
    pickedBy: "Late night pick",
    addedLabel: '1d ago',
    playlistIndex: 9,
    accent: '#8b5cf6',
  },
  {
    id: 'pick-my-mind',
    title: 'My Mind',
    artist: '7YNX',
    pickedBy: "7YNX Archive",
    addedLabel: '3d ago',
    playlistIndex: 10,
    accent: '#ec4899',
  },
  {
    id: 'pick-lofi-study',
    title: 'Midnight Lo-Fi Study',
    artist: 'Chilled Beats',
    pickedBy: "Desk focus",
    addedLabel: '5d ago',
    playlistIndex: 5,
    accent: '#3b82f6',
  },
  {
    id: 'pick-nightride',
    title: 'Nightride FM Synthwave',
    artist: '24/7 Outrun & Retrowave',
    pickedBy: "Live FM",
    addedLabel: 'Live',
    playlistIndex: 0,
    accent: '#00f2fe',
  },
  {
    id: 'pick-chillsynth',
    title: 'Chillsynth Radio',
    artist: 'Nightride Chill',
    pickedBy: "Live FM",
    addedLabel: 'Live',
    playlistIndex: 1,
    accent: '#6366f1',
  },
  {
    id: 'pick-plaza',
    title: 'Nightwave Plaza',
    artist: '24/7 Vaporwave & Synth',
    pickedBy: "Live FM",
    addedLabel: 'Live',
    playlistIndex: 3,
    accent: '#f43f5e',
  },
  {
    id: 'pick-rain',
    title: 'Lo-Fi Rain Ambience',
    artist: 'Procedural Acoustics',
    pickedBy: "Rain mode",
    addedLabel: 'Always on',
    playlistIndex: 6,
    accent: '#14b8a6',
  },
];

const AVAILABLE_METALS = [
  { id: 'copper_bright', name: 'Bright copper wire', price: 11.6 },
  { id: 'copper_1', name: 'No. 1 copper', price: 11.1 },
  { id: 'mixed_brass', name: 'Mixed brass', price: 6.6 },
  { id: 'aluminium_rims', name: 'Aluminium rims', price: 2.7 },
  { id: 'stainless_304', name: 'Stainless 304', price: 1.4 },
  { id: 'car_batteries', name: 'Car batteries', price: 0.6 },
];

/** Deterministic 21x21 QR-like visual matrix derived from any payload string. */
function buildQrGrid(seedText: string): boolean[][] {
  const size = 21;
  const grid = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = border || inner;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (hash >>> 28) % 2 === 0;
    }
  }

  return grid;
}

export const TabletDocketModal: React.FC<TabletDocketModalProps> = ({
  isOpen,
  onClose,
  onPrintDocket,
  initialApp = 'home',
  initialAddSong = false,
  onOpenDiary,
  onFocusTurntable,
  plantWaterCount = 87,
  diaryPageCount = 42,
  docketsPrintedCount = 136,
}) => {
  const [activeApp, setActiveApp] = useState<TabletAppId>(initialApp);
  const [clock, setClock] = useState(() => new Date());
  const homeSwipeRef = useRef<{ startY: number; active: boolean } | null>(null);
  const [homePullY, setHomePullY] = useState(0);

  // Live iPad clock
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // ── Music Player state (ZPlayer inside iPad) ──
  const [playerState, setPlayerState] = useState<PlayerState>(() => musicPlayerEngine.getState());
  useEffect(() => musicPlayerEngine.subscribe(setPlayerState), []);

  const [musicSearch, setMusicSearch] = useState('');
  const [musicSort, setMusicSort] = useState<'newest' | 'most_played'>('newest');
  const [showAddSongForm, setShowAddSongForm] = useState(false);

  // Sync activeApp & add-song mode whenever reopened with explicit props
  useEffect(() => {
    if (isOpen) {
      setActiveApp(initialApp);
      setShowAddSongForm(Boolean(initialAddSong && initialApp === 'player'));
      setHomePullY(0);
    }
  }, [isOpen, initialApp, initialAddSong]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongPicker, setNewSongPicker] = useState('');
  const [newSongTrackIdx, setNewSongTrackIdx] = useState(7);

  const [customPicks, setCustomPicks] = useState<CommunityTrackPick[]>(() => {
    try {
      const saved = localStorage.getItem(COMMUNITY_PICKS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(PLAY_COUNTS_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  const allMixtapePicks = useMemo(
    () => [...customPicks, ...BASE_MIXTAPE_PICKS],
    [customPicks]
  );

  const filteredPicks = useMemo(() => {
    const q = musicSearch.trim().toLowerCase();
    const list = allMixtapePicks.filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.artist.toLowerCase().includes(q) ||
        p.pickedBy.toLowerCase().includes(q)
      );
    });
    if (musicSort === 'most_played') {
      return [...list].sort((a, b) => (playCounts[b.id] ?? 1) - (playCounts[a.id] ?? 1));
    }
    return list;
  }, [allMixtapePicks, musicSearch, musicSort, playCounts]);

  const handlePlayPick = (pick: CommunityTrackPick) => {
    soundFX.playClick();
    musicPlayerEngine.startTrack(pick.playlistIndex, true);
    setPlayCounts((prev) => {
      const next = { ...prev, [pick.id]: (prev[pick.id] ?? 0) + 1 };
      try {
        localStorage.setItem(PLAY_COUNTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddCustomPick = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSongTitle.trim();
    if (!title) return;
    soundFX.playClick();
    const pick: CommunityTrackPick = {
      id: `custom-${Date.now()}`,
      title,
      artist: newSongArtist.trim() || 'Guest Favorite',
      pickedBy: `${newSongPicker.trim() || 'Visitor'}'s pick`,
      addedLabel: 'Just now',
      playlistIndex: newSongTrackIdx,
      accent: '#2F5BEA',
    };
    const nextCustom = [pick, ...customPicks];
    setCustomPicks(nextCustom);
    try {
      localStorage.setItem(COMMUNITY_PICKS_STORAGE_KEY, JSON.stringify(nextCustom));
    } catch {}
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongPicker('');
    setShowAddSongForm(false);
    handlePlayPick(pick);
  };

  // ── Permanent QR Code app state ──
  const [qrMode, setQrMode] = useState<'portfolio' | 'card' | 'music'>('card');
  const [copiedQr, setCopiedQr] = useState(false);
  const qrPayload =
    qrMode === 'card'
      ? `https://github.com/Zynxx777/ZCard`
      : qrMode === 'music'
      ? ZYNX_PROFILE.socials.musicInstagram
      : ZYNX_PROFILE.socials.github;
  const qrMatrix = useMemo(() => buildQrGrid(qrPayload), [qrPayload]);

  // ── Docket app state ──
  const [selectedMetal, setSelectedMetal] = useState(AVAILABLE_METALS[0]);
  const [currentWeight, setCurrentWeight] = useState<number>(45.5);
  const [docketItems, setDocketItems] = useState<DocketItem[]>([
    {
      id: 'init-1',
      name: 'Bright copper wire',
      pricePerKg: 11.6,
      weightKg: 38.2,
      total: 443.12,
    },
  ]);
  const [docketSubTab, setDocketSubTab] = useState<'purchases' | 'dashboard' | 'packing' | 'invoices'>('purchases');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handleAddWeight = (delta: number) => {
    soundFX.playClick();
    setCurrentWeight((prev) => Math.max(0.5, Math.round((prev + delta) * 10) / 10));
  };

  const handleAddItem = () => {
    if (currentWeight <= 0) return;
    soundFX.playClick();
    const lineTotal = Math.round(selectedMetal.price * currentWeight * 100) / 100;
    const newItem: DocketItem = {
      id: `${selectedMetal.id}-${Date.now()}`,
      name: selectedMetal.name,
      pricePerKg: selectedMetal.price,
      weightKg: currentWeight,
      total: lineTotal,
    };
    setDocketItems((prev) => [...prev, newItem]);
    setCurrentWeight(24.0);
  };

  const handleRemoveItem = (id: string) => {
    soundFX.playClick();
    setDocketItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = docketItems.reduce((acc, it) => acc + it.total, 0);
  const gst = Math.round(subtotal * 0.1 * 100) / 100;
  const grandTotal = Math.round((subtotal + gst) * 100) / 100;

  const handlePayAndPrint = () => {
    soundFX.playClick();
    setIsPrinting(true);
    soundFX.playPrinterThermalFeed();

    const order: DocketOrder = {
      docketNumber: `#0${44813 + docketsPrintedCount}`,
      customer: 'Riverbend Demolition Pty',
      dateStr: new Date().toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items:
        docketItems.length > 0
          ? docketItems
          : [
              {
                id: 'def-1',
                name: 'Bright copper wire',
                pricePerKg: 11.6,
                weightKg: 45.5,
                total: 527.8,
              },
            ],
      subtotal: subtotal || 527.8,
      gst: gst || 52.78,
      total: grandTotal || 580.58,
      paymentMethod: 'EFT Transfer (ANZ - 4920)',
    };

    setTimeout(() => {
      onPrintDocket(order);
      setIsPrinting(false);
      onClose();
    }, 450);
  };

  const dateLine = clock.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = clock.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const activeTrack = playerState.currentTrack;
  const isPlaying = playerState.isPlaying || playerState.isBuffering;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-label="iPad on the desk"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          soundFX.playClick();
          onClose();
        }
      }}
    >
      {/* Top-Left Pill: "Back to the desk" matching pradiplabs.dev video */}
      <div className="fixed top-3 sm:top-5 left-3 sm:left-6 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-medium shadow-xl ring-1 ring-black/10 transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to the desk</span>
        </button>
      </div>

      {/* Top-Right Esc hint */}
      <div className="hidden sm:flex fixed top-5 right-6 z-50">
        <button
          onClick={() => {
            soundFX.playClick();
            onClose();
          }}
          className="px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/70 text-white/80 text-[11px] font-mono border border-white/15 backdrop-blur-md"
        >
          Esc
        </button>
      </div>

      {/* Realistic iPad Hardware Bezel & Enclosure */}
      <div className="relative w-full max-w-[1040px] h-[92vh] sm:h-[85vh] max-h-[720px] rounded-[24px] sm:rounded-[34px] bg-[#14161b] p-2.5 sm:p-3.5 shadow-[0_32px_90px_rgba(0,0,0,0.85)] border border-white/15 ring-1 ring-black flex flex-col overflow-hidden">
        {/* Top Camera Dot */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black border border-white/10 pointer-events-none z-20" />

        {/* Inner iPad Display */}
        <div className="relative w-full h-full rounded-[16px] sm:rounded-[24px] overflow-hidden flex flex-col bg-[#f8fafc] text-zinc-900 shadow-inner">
          {/* iPadOS Status Bar */}
          <div
            className={`relative z-30 flex items-center justify-between px-4 sm:px-6 py-2 text-[11px] font-medium shrink-0 ${
              activeApp === 'home'
                ? 'text-white drop-shadow-sm bg-gradient-to-b from-black/20 to-transparent'
                : 'text-zinc-600 bg-white border-b border-zinc-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{dateLine}</span>
            </div>

            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px]">100%</span>
              <BatteryFull className="w-4 h-4" />
            </div>
          </div>

          {/* ── APP 1: iPadOS HOME DASHBOARD (Matching Pradip video 00:16-00:17) ── */}
          {activeApp === 'home' && (
            <div className="relative flex-1 overflow-hidden flex flex-col justify-between">
              {/* Illustrated Rolling Hills & Sky Wallpaper */}
              <svg
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                viewBox="0 0 1200 760"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ipadSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="55%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#dbeafe" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="760" fill="url(#ipadSky)" />
                {/* Fluffy Clouds */}
                <g fill="#ffffff" opacity="0.95">
                  <circle cx="150" cy="110" r="65" />
                  <circle cx="220" cy="100" r="82" />
                  <circle cx="295" cy="115" r="58" />
                  <circle cx="530" cy="120" r="78" />
                  <circle cx="620" cy="95" r="95" />
                  <circle cx="715" cy="115" r="72" />
                  <circle cx="805" cy="135" r="54" />
                  <circle cx="1010" cy="140" r="76" />
                  <circle cx="1095" cy="120" r="86" />
                </g>
                {/* Far Blue-Green Hills */}
                <path
                  d="M0 440 Q260 320 520 420 T1200 390 L1200 760 L0 760 Z"
                  fill="#4ade80"
                />
                {/* Mid Lush Green Ridges */}
                <path
                  d="M0 500 Q190 420 410 490 T910 470 Q1060 440 1200 480 L1200 760 L0 760 Z"
                  fill="#22c55e"
                />
                {/* Foreground Warm Meadow & Dirt Trail */}
                <path
                  d="M0 590 Q360 515 740 580 T1200 560 L1200 760 L0 760 Z"
                  fill="#16a34a"
                />
                <path
                  d="M520 760 Q575 630 565 565 Q615 565 660 760 Z"
                  fill="#d97706"
                  opacity="0.72"
                />
              </svg>

              {/* Main Content Split: Clock Left + Widgets Right */}
              <div className="relative z-10 flex-1 p-5 sm:p-8 flex flex-col md:flex-row justify-between gap-4 overflow-y-auto">
                {/* Left: Oversized Date & Live Clock */}
                <div className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
                  <p className="text-base sm:text-xl font-medium opacity-95">{dateLine}</p>
                  <p className="text-6xl sm:text-8xl font-bold tracking-tight leading-none mt-1 tabular-nums">
                    {timeStr}
                  </p>

                  {/* Active Player mini pill on Home if music is playing */}
                  {isPlaying && (
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setActiveApp('player');
                      }}
                      className="mt-5 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-zinc-900 shadow-lg backdrop-blur-md transition active:scale-95"
                    >
                      <Disc3 className="w-4 h-4 text-[#2F5BEA] animate-spin" />
                      <div className="text-left">
                        <p className="text-[11px] font-bold leading-tight">{activeTrack.title}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight">Playing on record player</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Right Column: "On my desk" Telemetry Card + Attribution Card */}
                <div className="flex flex-col gap-3 w-full md:w-[360px] shrink-0">
                  {/* On My Desk 2x2 Stats Widget */}
                  <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/60 text-zinc-900">
                    <p className="text-xs font-semibold text-zinc-800 mb-3">On my desk</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold leading-none tabular-nums">{plantWaterCount}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                            times the plant’s been watered
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold leading-none tabular-nums">{diaryPageCount}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                            pages in my diary
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setActiveApp('docket');
                        }}
                        className="flex items-start gap-2.5 text-left hover:opacity-80 transition"
                      >
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold leading-none tabular-nums">{docketsPrintedCount}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                            dockets printed on desk
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setActiveApp('player');
                        }}
                        className="flex items-start gap-2.5 text-left hover:opacity-80 transition"
                      >
                        <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#2F5BEA] flex items-center justify-center shrink-0">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold leading-none tabular-nums">{allMixtapePicks.length}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                            songs on record player
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Wallpaper & Diary Shortcut Card */}
                  <div className="rounded-3xl bg-white/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl border border-white/60 text-zinc-900">
                    <p className="text-xs font-semibold text-zinc-800">Desk OS · iPad hub</p>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Switch apps from the dock below — weighbridge dockets, QR pass, or Joshua’s ZPlayer mixtape.
                    </p>
                    {onOpenDiary && (
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          onClose();
                          onOpenDiary();
                        }}
                        className="mt-3 px-4 py-1.5 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white text-xs font-semibold shadow-md transition active:scale-95"
                      >
                        Open Death Note
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Centered Frosted App Dock (3 Apps matching Pradip video) */}
              <div className="relative z-20 pb-4 flex justify-center px-3">
                <div className="flex items-center gap-4 px-5 py-2.5 rounded-[24px] bg-white/85 backdrop-blur-2xl shadow-2xl border border-white/80">
                  {/* 1. Docket App */}
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setActiveApp('docket');
                    }}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform font-bold text-sm">
                      DM
                    </div>
                    <span className="text-[10px] font-medium text-zinc-800">Docket</span>
                  </button>

                  {/* 2. Permanent QR Code / Z Card */}
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setActiveApp('qr');
                    }}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#111318] text-white flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-800">Permanent QR</span>
                  </button>

                  {/* 3. ZPlayer */}
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setActiveApp('player');
                    }}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform relative">
                      <Disc3 className={`w-6 h-6 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-800">ZPlayer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── APP 2: ZPLAYER (Matching Pradip Player video 00:20) ── */}
          {activeApp === 'player' && (
            <div className="flex-1 bg-[#f8fafc] overflow-hidden flex flex-col md:flex-row pb-7">
              {/* Left Column: Featured Active Disc & Transport Controls */}
              <div className="w-full md:w-[320px] lg:w-[350px] bg-white border-b md:border-b-0 md:border-r border-zinc-200 p-5 sm:p-6 flex flex-col justify-between shrink-0">
                <div>
                  <p className="text-xs text-zinc-400 font-medium text-center">On the record player</p>

                  {/* Large Rounded Square Cover Art matching video 00:20 */}
                  <div className="mx-auto mt-4 w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 relative bg-zinc-900 flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-30 blur-2xl"
                      style={{ backgroundColor: playerState.currentPalette.glow }}
                    />
                    <div className="relative z-10 flex flex-col items-center text-white p-4 text-center">
                      <div
                        className={`w-28 h-28 rounded-full border-4 border-white/15 bg-zinc-950 flex items-center justify-center shadow-2xl ${
                          isPlaying ? 'animate-spin [animation-duration:5s]' : ''
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner"
                          style={{ backgroundColor: '#22c55e' }}
                        >
                          7X
                        </div>
                      </div>
                      <span className="mt-3 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-zinc-200">
                        {activeTrack.badge}
                      </span>
                    </div>
                  </div>

                  {/* Active Title & Artist */}
                  <div className="text-center mt-5">
                    <h3 className="text-lg font-bold text-zinc-900 leading-snug">
                      {playerState.nowPlaying || activeTrack.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{activeTrack.artist}</p>
                    <p className="text-[11px] italic text-zinc-400 mt-1">
                      {activeTrack.type === 'stream' ? '24/7 live broadcast' : "Joshua's studio mix"}
                    </p>
                  </div>
                </div>

                {/* Circular Transport Controls matching video 00:20 */}
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        musicPlayerEngine.prevTrack();
                      }}
                      className="w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition active:scale-95"
                      aria-label="Previous song"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playClick();
                        musicPlayerEngine.togglePlay();
                      }}
                      className="w-14 h-14 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition active:scale-95"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {playerState.isBuffering ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playClick();
                        musicPlayerEngine.nextTrack();
                      }}
                      className="w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition active:scale-95"
                      aria-label="Next song"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Volume Slider + View Turntable */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-100">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={playerState.volume}
                      onChange={(e) => musicPlayerEngine.setVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#2F5BEA]"
                      aria-label="Player volume"
                    />
                    {onFocusTurntable && (
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          onClose();
                          onFocusTurntable();
                        }}
                        className="shrink-0 text-[10px] font-medium text-[#2F5BEA] hover:underline"
                      >
                        Record deck
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Search, "+ Add yours", Filter & Song List */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                      ZPlayer
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Mixtape of 7YNX studio tracks, live radio streams & desk picks. Pick one to play on the turntable.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setShowAddSongForm((v) => !v);
                    }}
                    className="shrink-0 px-3.5 py-2 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add yours</span>
                  </button>
                </div>

                {/* Inline Add Custom Song Form */}
                {showAddSongForm && (
                  <form
                    onSubmit={handleAddCustomPick}
                    className="mt-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5 animate-fadeIn"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Song title..."
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs outline-none focus:border-[#2F5BEA]"
                      />
                      <input
                        type="text"
                        placeholder="Artist (optional)"
                        value={newSongArtist}
                        onChange={(e) => setNewSongArtist(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs outline-none focus:border-[#2F5BEA]"
                      />
                      <input
                        type="text"
                        placeholder="Your name..."
                        value={newSongPicker}
                        onChange={(e) => setNewSongPicker(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs outline-none focus:border-[#2F5BEA]"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span>Audio source:</span>
                        <select
                          value={newSongTrackIdx}
                          onChange={(e) => setNewSongTrackIdx(Number(e.target.value))}
                          className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-xs outline-none"
                        >
                          {BEDROOM_PLAYLIST.map((trk, idx) => (
                            <option key={trk.id} value={idx}>
                              {trk.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddSongForm(false)}
                          className="px-3 py-1 rounded-full text-xs text-zinc-600 hover:bg-zinc-200/70"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1 rounded-full bg-[#2F5BEA] text-white text-xs font-semibold"
                        >
                          Add to mixtape
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Search + Newest/Most Played Toggle */}
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search songs, artists or names"
                      value={musicSearch}
                      onChange={(e) => setMusicSearch(e.target.value)}
                      className="flex-1 text-xs text-zinc-800 placeholder-zinc-400 outline-none bg-transparent"
                    />
                    {musicSearch && (
                      <button
                        onClick={() => setMusicSearch('')}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="inline-flex rounded-xl bg-zinc-200/70 p-0.5 text-xs font-medium shrink-0">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setMusicSort('newest');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        musicSort === 'newest'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setMusicSort('most_played');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        musicSort === 'most_played'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Most played
                    </button>
                  </div>
                </div>

                {/* Track List */}
                <div className="mt-4 flex-1 overflow-y-auto divide-y divide-zinc-200/70 pr-1">
                  {filteredPicks.map((pick, idx) => {
                    const isCurrent = playerState.trackIndex === pick.playlistIndex;
                    const count = playCounts[pick.id] ?? (idx < 3 ? 2 : 1);
                    return (
                      <button
                        key={pick.id}
                        onClick={() => handlePlayPick(pick)}
                        className={`w-full py-2.5 px-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition ${
                          isCurrent
                            ? 'bg-blue-50/90 ring-1 ring-blue-200'
                            : 'hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-5 text-[11px] font-mono text-zinc-400 text-center shrink-0">
                            {isCurrent && isPlaying ? (
                              <Radio className="w-3.5 h-3.5 text-[#2F5BEA] animate-pulse mx-auto" />
                            ) : (
                              idx + 1
                            )}
                          </span>
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                            style={{ backgroundColor: pick.accent }}
                          >
                            <Music className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${
                                isCurrent ? 'text-[#2F5BEA]' : 'text-zinc-900'
                              }`}
                            >
                              {pick.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">{pick.artist}</p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-400 shrink-0">
                          <span>
                            {pick.pickedBy} · {pick.addedLabel}
                          </span>
                          <span className="font-mono text-zinc-500 w-14 text-right">
                            {count} {count === 1 ? 'play' : 'plays'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── APP 3: PERMANENT QR CODE / Z CARD PASS ── */}
          {activeApp === 'qr' && (
            <div className="flex-1 bg-[#f8fafc] p-5 sm:p-8 pb-10 flex flex-col items-center justify-center overflow-y-auto">
              <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-lg p-6 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#2F5BEA]" />
                  <span>PERMANENT QR CODE · Z CARD</span>
                </div>

                {/* Mode Pills */}
                <div className="inline-flex rounded-xl bg-zinc-100 p-1 text-xs font-medium">
                  {(
                    [
                      { id: 'card', label: 'Z Card Repo' },
                      { id: 'portfolio', label: 'GitHub' },
                      { id: 'music', label: '7YNX Audio' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundFX.playClick();
                        setQrMode(item.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        qrMode === item.id
                          ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Clean Vector QR Matrix */}
                <div className="mx-auto w-52 h-52 p-4 rounded-2xl bg-white border border-zinc-200 shadow-inner flex items-center justify-center">
                  <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
                    {qrMatrix.map((row, rIdx) =>
                      row.map((cell, cIdx) =>
                        cell ? (
                          <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx}
                            y={rIdx}
                            width={1}
                            height={1}
                            fill="#0f172a"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>

                <p className="text-xs font-mono text-zinc-500 truncate px-2">{qrPayload}</p>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      navigator.clipboard?.writeText(qrPayload).catch(() => {});
                      setCopiedQr(true);
                      setTimeout(() => setCopiedQr(false), 1800);
                    }}
                    className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedQr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQr ? 'Copied URL' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      downloadVCard();
                    }}
                    className="px-4 py-2 rounded-full bg-[#2F5BEA] hover:bg-[#2449c7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download vCard</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── APP 4: DEMO METALS DOCKET SYSTEM ── */}
          {activeApp === 'docket' && (
            <div className="flex-1 bg-slate-900 overflow-hidden flex flex-col md:flex-row text-slate-800 pb-7">
              {/* Mobile Compact Top Strip */}
              <div className="flex md:hidden items-center justify-between px-3 py-2 bg-[#0d1527] border-b border-slate-800 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2563eb] text-white font-bold flex items-center justify-center text-xs shadow-md">
                    DM
                  </div>
                  <div>
                    <h2 className="text-xs font-bold leading-tight">Demo Metals</h2>
                    <p className="text-[9px] text-slate-400 font-mono">Docket #044813</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setDocketItems([]);
                  }}
                  className="py-1 px-2.5 rounded-lg bg-[#2563eb] text-white text-[11px] font-semibold flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Left Sidebar Navigation */}
              <div className="hidden md:flex w-60 bg-[#0d1527] text-white flex-col justify-between p-4 border-r border-slate-800 shrink-0 select-none">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 px-2 pt-1">
                    <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white font-bold flex items-center justify-center text-xs shadow-md tracking-wider">
                      DM
                    </div>
                    <div>
                      <h2 className="text-sm font-bold tracking-tight text-white leading-none">Demo Metals</h2>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Docket Weighbridge</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setDocketItems([]);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New purchase</span>
                  </button>

                  <nav className="space-y-1 text-xs font-medium pt-2">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setDocketSubTab('dashboard');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                        docketSubTab === 'dashboard'
                          ? 'bg-slate-800/80 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setDocketSubTab('purchases');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                        docketSubTab === 'purchases'
                          ? 'bg-[#1e293b] text-white font-semibold border-l-2 border-blue-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>📋</span>
                      <span>Purchases</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setDocketSubTab('packing');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                        docketSubTab === 'packing'
                          ? 'bg-slate-800/80 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>📦</span>
                      <span>Packing slips</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setDocketSubTab('invoices');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                        docketSubTab === 'invoices'
                          ? 'bg-slate-800/80 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>💼</span>
                      <span>Sales invoices</span>
                    </button>
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-800/80 px-2 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    AM
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">Alex Morgan</p>
                    <p className="text-[10px] text-slate-400 truncate">Reception · demo data</p>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-y-auto">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                      New purchase
                    </h1>
                    <p className="text-[11px] sm:text-xs font-mono text-slate-500 mt-0.5">
                      Docket #0{44813 + docketsPrintedCount} · Riverbend Demolition
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-mono border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Printer ready
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-mono border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Xero connected
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5 overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        1 · PICK THE METAL
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {AVAILABLE_METALS.map((metal) => {
                          const isSelected = selectedMetal.id === metal.id;
                          return (
                            <button
                              key={metal.id}
                              onClick={() => {
                                soundFX.playClick();
                                setSelectedMetal(metal);
                              }}
                              className={`text-left p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-blue-50/80 border-[#2563eb] ring-2 ring-blue-500/20 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                              }`}
                            >
                              <p
                                className={`text-xs font-bold leading-tight ${
                                  isSelected ? 'text-blue-900' : 'text-slate-800'
                                }`}
                              >
                                {metal.name}
                              </p>
                              <p
                                className={`text-xs font-mono font-semibold mt-1 ${
                                  isSelected ? 'text-[#2563eb]' : 'text-slate-500'
                                }`}
                              >
                                ${metal.price.toFixed(2)}/kg
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        2 · WEIGH IT
                      </h3>

                      <div className="rounded-2xl bg-[#0b1324] text-white p-5 shadow-lg border border-slate-800 relative overflow-hidden">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Scale className="w-3.5 h-3.5" />
                            Weighbridge · net
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live Platform #1
                          </span>
                        </div>

                        <div className="my-3 flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white tabular-nums">
                            {currentWeight.toFixed(1)}
                          </span>
                          <span className="text-lg font-mono text-cyan-400 font-semibold">kg</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                          <span className="text-slate-400">
                            Rate: <strong className="text-white">${selectedMetal.price.toFixed(2)}/kg</strong>
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            = ${(selectedMetal.price * currentWeight).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-3 pt-2">
                          <span className="text-[10px] text-slate-400 font-mono">Simulate:</span>
                          <button
                            onClick={() => handleAddWeight(5.0)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                          >
                            +5 kg
                          </button>
                          <button
                            onClick={() => handleAddWeight(25.0)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                          >
                            +25 kg
                          </button>
                          <button
                            onClick={() => handleAddWeight(50.0)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200"
                          >
                            +50 kg
                          </button>
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              setCurrentWeight(10.0);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 ml-auto"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleAddItem}
                        className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add to the docket</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div>
                      <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                        3 · THE DOCKET
                      </h3>

                      {docketItems.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          Nothing on the docket yet.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {docketItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                            >
                              <div>
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-[11px] font-mono text-slate-500">
                                  {item.weightKg.toFixed(1)} kg @ ${item.pricePerKg.toFixed(2)}/kg
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  ${item.total.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>GST included (10%)</span>
                        <span className="font-mono">${gst.toFixed(2)}</span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-700">Total to pay</span>
                        <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                          ${grandTotal.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={handlePayAndPrint}
                        disabled={isPrinting}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-60"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{isPrinting ? 'Transmitting to Thermal Printer...' : 'Pay by EFT and print'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Authentic Bottom iPadOS Home Indicator Bar (Tap or Swipe Up to return Home) */}
          {activeApp !== 'home' && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-7 flex items-end justify-center pb-2 bg-gradient-to-t from-black/5 via-transparent to-transparent">
              <button
                type="button"
                aria-label="Go to iPad Home screen"
                title="Home (click or swipe up)"
                onClick={() => {
                  if (homeSwipeRef.current?.active) return;
                  soundFX.playClick();
                  setHomePullY(0);
                  setActiveApp('home');
                }}
                onPointerDown={(e) => {
                  homeSwipeRef.current = { startY: e.clientY, active: false };
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const st = homeSwipeRef.current;
                  if (!st) return;
                  const dy = e.clientY - st.startY;
                  if (dy < -4) st.active = true;
                  if (dy < 0) {
                    setHomePullY(Math.max(-18, dy * 0.45));
                  }
                }}
                onPointerUp={(e) => {
                  const st = homeSwipeRef.current;
                  homeSwipeRef.current = null;
                  setHomePullY(0);
                  if (st && e.clientY - st.startY < -14) {
                    soundFX.playClick();
                    setActiveApp('home');
                  }
                }}
                onPointerCancel={() => {
                  homeSwipeRef.current = null;
                  setHomePullY(0);
                }}
                className="pointer-events-auto group px-8 py-2 -mb-1 cursor-pointer focus:outline-none touch-none"
                style={{
                  transform: `translateY(${homePullY}px)`,
                  transition: homePullY === 0 ? 'transform 180ms ease-out' : 'none',
                }}
              >
                <span className="block w-28 sm:w-36 h-[5px] rounded-full bg-zinc-900/75 group-hover:bg-zinc-950 group-hover:w-32 sm:group-hover:w-40 ring-1 ring-white/50 shadow-sm transition-all" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
