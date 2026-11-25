import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Type, PenTool, Eraser, Undo2, Trash2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';
import { fetchLiveDiaryEntries, saveLiveDiaryEntry, type DiaryStorageMode } from '../services/diaryCloud';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Procedural soft paper sound synthesis using Web Audio API
function playPageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.28);
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.28);
  } catch {
    // Ignore autoplay restriction errors
  }
}

// Constants matching desk notebook stationery
const CANVAS_W = 750;
const CANVAS_H = 1050;
const INK_COLORS = ['#1E2430', '#2456C9', '#0EA5E9', '#16A34A', '#D97706', '#DC2626'];
const PEN_SIZES = [4, 8, 16];
const MAX_TEXT_CHARS = 420;
const MAX_LINES = 14;
const TEXT_BASE_CLASS = 'absolute left-[8cqw] right-[7cqw] top-[9.9cqw] font-hand text-[5.5cqw] leading-[7cqw] text-[#24304A]';

// Format date helper
function formatDate(d: Date | string | number): string {
  try {
    const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '25 Nov 2026';
  }
}

function pageTurnTransform(dir: number, progress: number, originY = 0.65): string {
  const curl = Math.sin(progress * Math.PI);
  const cornerBias = (originY - 0.5) * 2;
  const angle = dir === 1 ? -progress * 180 : progress * 180;
  const skew = curl * (dir === 1 ? -2.8 : 2.8) * cornerBias;
  const lift = curl * 20;
  const bow = curl * (dir === 1 ? -3.6 : 3.6) * cornerBias;
  const width = 1 - curl * 0.032;
  return `translateZ(${lift}px) rotateY(${angle}deg) rotateX(${bow}deg) skewY(${skew}deg) scaleX(${width})`;
}

function pageTurnLighting(dir: number, progress: number, verso = false) {
  const sweep = dir === 1 ? progress * 100 : (1 - progress) * 100;
  const glint = verso ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.58)';
  return {
    backgroundImage: `linear-gradient(90deg, transparent 32%, rgba(35,24,16,0.22) 43%, ${glint} 49%, rgba(255,255,255,0.72) 50%, rgba(35,24,16,0.22) 57%, transparent 68%), linear-gradient(to ${verso ? 'left' : 'right'}, rgba(0,0,0,0.16), rgba(255,255,255,0.08) 48%, rgba(0,0,0,0.12))`,
    backgroundSize: '200% 100%, 100% 100%',
    backgroundPosition: `${sweep}% 0, 0 0`
  };
}

/* -------------------------------------------------------------------------
 * Page Surface Components
 * ------------------------------------------------------------------------- */

const PageSurface: React.FC<{ children?: React.ReactNode; side?: 'left' | 'right'; className?: string }> = ({
  children,
  side = 'right',
  className = ''
}) => {
  return (
    <div
      className={`relative aspect-[5/7] w-full overflow-hidden bg-[#FBF9F4] select-none ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      {/* Clean horizontal grey-blue ruled lines spaced 7cqw apart */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[8cqw] top-[9cqw]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent calc(7cqw - 1px), rgba(110,125,148,0.18) calc(7cqw - 1px), rgba(110,125,148,0.18) 7cqw)'
        }}
      />
      {/* Soft spine gutter shadow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 w-[8cqw] ${
          side === 'right' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'
        } from-black/[0.11] via-black/[0.04] to-transparent`}
      />
      {/* Subtle paper grain lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.01] via-transparent to-black/[0.025]"
      />
      {children}
    </div>
  );
};

const DateHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="pointer-events-none absolute right-[7cqw] top-[5cqw] font-hand text-[4.4cqw] text-[#24304A]/65">
    {children}
  </p>
);

const PageSignature: React.FC<{ children: React.ReactNode; mine?: boolean }> = ({ children, mine }) => (
  <p className={`pointer-events-none absolute bottom-[9.5cqw] right-[7cqw] font-hand text-[5.4cqw] ${mine ? 'text-[#24304A]' : 'text-[#24304A]/90'}`}>
    <span className="text-[4.3cqw] opacity-55">from </span>
    {children}
  </p>
);

const InsideCover: React.FC = () => (
  <div className="relative flex aspect-[5/7] w-full items-center justify-center bg-[#F4F0E7] select-none overflow-hidden" style={{ containerType: 'inline-size' }}>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'linear-gradient(125deg, rgba(0,0,0,0.065) 0%, transparent 45%)'
      }}
    />
    <div className="relative z-10 text-center font-hand text-[#24304A]/80 px-6">
      <p className="font-serif text-[5.2cqw] font-bold tracking-[0.22em] text-[#111317]/85 uppercase mb-[3cqw]">
        Death Note
      </p>
      <p className="text-[4.6cqw] text-[#24304A]/60">If found, please return to</p>
      <p className="mt-[2.2cqw] text-[9.2cqw] font-semibold text-[#1E2430] leading-none">Joshua</p>
      <p className="mt-[1.8cqw] text-[4cqw] text-[#24304A]/45">zynx.dev</p>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8cqw] bg-gradient-to-l from-black/[0.11] to-transparent" />
  </div>
);

const WelcomePage: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <PageSurface side={side}>
    <p className="absolute left-[8cqw] right-[7cqw] top-[6.6cqw] font-hand text-[7.6cqw] font-semibold leading-[7cqw] text-[#1E2430]">
      Death Note
    </p>
    <p className={`${TEXT_BASE_CLASS} !top-[16.9cqw]`}>
      This black notebook lives on my desk, and it&apos;s open to everyone. Leave a note, a doodle, a question for me, or just say hi. Every entry is saved right into this book.
    </p>
    <PageSignature mine>Joshua</PageSignature>
  </PageSurface>
);

const EntryPage: React.FC<{ entry: DiaryEntry; side: 'left' | 'right' }> = ({ entry, side }) => {
  const isMine = entry.author?.toLowerCase().includes('joshua') || entry.author?.toLowerCase().includes('zynx');
  return (
    <PageSurface side={side}>
      <DateHeader>{entry.date}</DateHeader>
      {entry.message && (
        <p className={`${TEXT_BASE_CLASS} whitespace-pre-wrap break-words pointer-events-none`}>
          {entry.message}
        </p>
      )}
      {entry.drawingData && (
        <img
          src={entry.drawingData}
          alt={entry.message ? '' : `Drawing by ${entry.author}`}
          className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
          draggable={false}
          loading="lazy"
        />
      )}
      {entry.author && <PageSignature mine={isMine}>{isMine ? 'Joshua' : entry.author}</PageSignature>}
    </PageSurface>
  );
};

const BlankPage: React.FC<{ side: 'left' | 'right'; plain?: boolean }> = ({ side, plain }) =>
  plain ? <div className="aspect-[5/7] w-full bg-[#F4F0E7]" /> : <PageSurface side={side} />;

/* -------------------------------------------------------------------------
 * Main Diary Modal Component
 * ------------------------------------------------------------------------- */

export const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('zynx_diary_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_DIARY_ENTRIES;
    } catch {
      return INITIAL_DIARY_ENTRIES;
    }
  });

  const [storageMode, setStorageMode] = useState<DiaryStorageMode>('browser');

  // Live Cloud Sync Polling on mount & interval so new pages from any visitor appear live
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    let syncTimer: number | undefined;

    const loadCloud = async () => {
      const res = await fetchLiveDiaryEntries();
      if (isMounted) {
        if (res.entries.length > 0) setEntries(res.entries);
        setStorageMode(res.storageMode);
      }
      return res.storageMode;
    };

    void loadCloud().then((mode) => {
      if (isMounted && (mode === 'cloud' || mode === 'local-file')) {
        syncTimer = window.setInterval(() => void loadCloud(), 12000);
      }
    });
    return () => {
      isMounted = false;
      if (syncTimer !== undefined) window.clearInterval(syncTimer);
    };
  }, [isOpen]);

  // Responsive page sizing & spread state
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isSpread, setIsSpread] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 360);
  const [pageW, setPageW] = useState(380);
  const pageH = Math.round(pageW * 1.4);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;
    const spread = window.innerWidth >= 360;
    const availableW = window.innerWidth - 16;
    const availableH = window.innerHeight - 72 - (spread ? 112 : 160);
    const navSpace = window.innerWidth >= 640 ? 144 : 16;
    const maxW = spread ? (availableW - navSpace) / 2 : Math.min(availableW - 32, 420);
    const maxH = (availableH - 24) / 1.4;
    const w = Math.max(150, Math.floor(Math.min(spread ? 460 : 400, maxW, maxH)));
    setIsSpread(spread);
    setPageW(w);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Page index & navigation
  // Page items: [ { kind: 'welcome' }, ...entries, { kind: 'writer' } ]
  const pageItems = [
    { kind: 'welcome' as const },
    ...entries.map(e => ({ kind: 'entry' as const, entry: e })),
    { kind: 'writer' as const }
  ];
  const lastIndex = pageItems.length - 1;
  const toSpreadIndex = (idx: number) => Math.floor((idx + 1) / 2);

  const [spreadIndex, setSpreadIndex] = useState(() => (isSpread ? toSpreadIndex(lastIndex) : lastIndex));
  const maxSpreadIndex = isSpread ? toSpreadIndex(lastIndex) : lastIndex;

  // Sync index when screen layout switches between mobile & desktop spread
  const prevSpreadRef = useRef(isSpread);
  useEffect(() => {
    if (prevSpreadRef.current !== isSpread) {
      setSpreadIndex(curr => (isSpread ? toSpreadIndex(curr) : Math.min(lastIndex, Math.max(0, curr * 2 - 1))));
      prevSpreadRef.current = isSpread;
    }
  }, [isSpread, lastIndex]);

  // Tool states for writer
  const [toolMode, setToolMode] = useState<'write' | 'draw'>('write');
  const [inkColor, setInkColor] = useState(INK_COLORS[0]);
  const [penSize, setPenSize] = useState(PEN_SIZES[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [writerText, setWriterText] = useState('');
  const [writerName, setWriterName] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ kind: 'idle' | 'sending' | 'done' | 'warn' | 'error'; message?: string }>({ kind: 'idle' });

  // Drawing canvas refs & history
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoHistoryRef = useRef<ImageData[]>([]);
  const hasDrawnRef = useRef(false);
  const draftDrawingDataRef = useRef<string | null>(null);
  const pointerStateRef = useRef<{ id: number; x: number; y: number; mx: number; my: number } | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  // Real-time interactive mouse/touch page turn state & corner hover curl
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const [turnState, setTurnState] = useState<{
    dir: 1 | -1;
    progress: number;
    originY: number;
    dragging: boolean;
  } | null>(null);
  const turnStateRef = useRef<{
    dir: 1 | -1;
    progress: number;
    originY: number;
    dragging: boolean;
  } | null>(null);
  const [hoverCorner, setHoverCorner] = useState<{ dir: 1 | -1; cornerY: 'top' | 'bottom' } | null>(null);

  const dragSessionRef = useRef<{
    pointerId: number;
    dir: 1 | -1;
    startX: number;
    startY: number;
    originY: number;
    inCornerZone: boolean;
    hasMoved: boolean;
  } | null>(null);
  const turnRafRef = useRef<number>(0);
  const isAnimatingTurnRef = useRef(false);

  const setTurn = useCallback((next: { dir: 1 | -1; progress: number; originY: number; dragging: boolean } | null) => {
    turnStateRef.current = next;
    setTurnState(next);
  }, []);

  const stopTurnAnimation = useCallback(() => {
    if (turnRafRef.current) {
      window.cancelAnimationFrame(turnRafRef.current);
      turnRafRef.current = 0;
    }
    isAnimatingTurnRef.current = false;
  }, []);

  useEffect(() => () => stopTurnAnimation(), [stopTurnAnimation]);

  useEffect(() => {
    if (isOpen) return;
    stopTurnAnimation();
    dragSessionRef.current = null;
    setHoverCorner(null);
    setTurn(null);
  }, [isOpen, stopTurnAnimation, setTurn]);

  const animateTurnTo = useCallback((
    dir: 1 | -1,
    fromProgress: number,
    toProgress: number,
    originY: number,
    commitOnFinish: boolean,
    withSound: boolean
  ) => {
    stopTurnAnimation();
    if (withSound) playPageTurnSound();
    isAnimatingTurnRef.current = true;
    const distance = Math.abs(toProgress - fromProgress);
    const duration = Math.max(170, Math.round(distance * 360));
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Crisp cubic ease-out page settle
      const eased = 1 - Math.pow(1 - t, 3);
      const progress = fromProgress + (toProgress - fromProgress) * eased;

      if (t < 1) {
        setTurn({ dir, progress, originY, dragging: false });
        turnRafRef.current = window.requestAnimationFrame(step);
      } else {
        turnRafRef.current = 0;
        isAnimatingTurnRef.current = false;
        if (commitOnFinish) {
          setSpreadIndex(index => Math.max(0, Math.min(maxSpreadIndex, index + dir)));
        }
        setTurn(null);
      }
    };

    setTurn({ dir, progress: fromProgress, originY, dragging: false });
    turnRafRef.current = window.requestAnimationFrame(step);
  }, [maxSpreadIndex, stopTurnAnimation, setTurn]);

  const flip = useCallback((dir: 1 | -1) => {
    if (isAnimatingTurnRef.current || dragSessionRef.current) return;
    if (spreadIndex + dir < 0 || spreadIndex + dir > maxSpreadIndex) return;
    animateTurnTo(dir, 0, 1, 0.72, true, true);
  }, [spreadIndex, maxSpreadIndex, animateTurnTo]);

  // Restore draft canvas image if Writer remounts after flipping back and forth
  useEffect(() => {
    const canvas = canvasRef.current;
    const saved = draftDrawingDataRef.current;
    if (!canvas || !saved) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    };
    img.src = saved;
  }, [spreadIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') flip(1);
      if (e.key === 'ArrowLeft') flip(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, flip, onClose]);

  // Drawing Canvas logic
  const getCanvasContext = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * CANVAS_W) / rect.width,
      y: ((e.clientY - rect.top) * CANVAS_H) / rect.height
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'draw') return;
    // Leave tiny outer corners free so user can grab a corner to turn pages
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    const inCorner = (rx < 44 || rect.width - rx < 44) && (ry < 56 || rect.height - ry < 56);
    if (inCorner) return;

    const ctx = getCanvasContext();
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const prevImg = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    undoHistoryRef.current.push(prevImg);
    if (undoHistoryRef.current.length > 20) undoHistoryRef.current.shift();
    setCanUndo(true);

    const coords = getCanvasCoords(e);
    pointerStateRef.current = { id: e.pointerId, x: coords.x, y: coords.y, mx: coords.x, my: coords.y };

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = inkColor;
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, (isEraser ? penSize * 2.5 : penSize) / 2, 0, Math.PI * 2);
    ctx.fill();
    if (!isEraser) {
      hasDrawnRef.current = true;
      setHasDrawn(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = pointerStateRef.current;
    if (!pt || pt.id !== e.pointerId) return;
    const ctx = getCanvasContext();
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    const midX = (pt.x + coords.x) / 2;
    const midY = (pt.y + coords.y) / 2;
    const pressure = e.pointerType === 'pen' ? 0.45 + (e.pressure || 0.5) * 1.1 : 1;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = inkColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = (isEraser ? penSize * 2.5 : penSize) * pressure;
    ctx.beginPath();
    ctx.moveTo(pt.mx, pt.my);
    ctx.quadraticCurveTo(pt.x, pt.y, midX, midY);
    ctx.stroke();

    Object.assign(pt, { x: coords.x, y: coords.y, mx: midX, my: midY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerStateRef.current?.id === e.pointerId) {
      pointerStateRef.current = null;
      if (canvasRef.current && hasDrawnRef.current) {
        draftDrawingDataRef.current = canvasRef.current.toDataURL('image/png');
      }
    }
  };

  const handleUndo = () => {
    const ctx = getCanvasContext();
    const lastImg = undoHistoryRef.current.pop();
    if (ctx && lastImg) {
      ctx.putImageData(lastImg, 0, 0);
      draftDrawingDataRef.current = canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    }
    const nextCanUndo = undoHistoryRef.current.length > 0;
    setCanUndo(nextCanUndo);
    if (!nextCanUndo) {
      hasDrawnRef.current = false;
      setHasDrawn(false);
      draftDrawingDataRef.current = null;
    }
  };

  const handleClearDrawing = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    undoHistoryRef.current.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    hasDrawnRef.current = false;
    setHasDrawn(false);
    draftDrawingDataRef.current = null;
    setCanUndo(true);
  };

  // Adding the user's page to the diary & sync with cloud/local
  const handleAddPage = async () => {
    const textTrimmed = writerText.trim();
    let drawingDataUrl: string | undefined = undefined;

    if (canvasRef.current && hasDrawnRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL('image/png');
    } else if (draftDrawingDataRef.current) {
      drawingDataUrl = draftDrawingDataRef.current;
    }

    if (!textTrimmed && !drawingDataUrl) return;

    setStatusMessage({ kind: 'sending' });

    const authorName = writerName.trim() || 'A Friend';
    const res = await saveLiveDiaryEntry({
      author: authorName,
      message: textTrimmed || undefined,
      drawingData: drawingDataUrl
    });

    if (res.success && res.entries) {
      setEntries(res.entries);
      setStorageMode(res.storageMode);
      setWriterText('');
      setWriterName('');
      const ctx = getCanvasContext();
      if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      hasDrawnRef.current = false;
      setHasDrawn(false);
      draftDrawingDataRef.current = null;
      undoHistoryRef.current = [];
      setCanUndo(false);

      // Keep viewer focused right on their newly written page (or advance cleanly if mobile)
      const insertedEntryIndex = res.entries.length; // pageItems: [welcome, ...entries]
      setSpreadIndex(isSpread ? toSpreadIndex(insertedEntryIndex) : insertedEntryIndex);

      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 }
      });

      setStatusMessage({
        kind: res.warning ? 'warn' : 'done',
        message: res.warning
          ? res.warning
          : res.storageMode === 'cloud'
            ? 'Saved permanently to Death Note for all visitors!'
            : 'Saved locally to .diary-storage.json!'
      });
    } else {
      setStatusMessage({
        kind: 'error',
        message: 'Could not save this page. Your draft is still here; please try again.'
      });
    }
    setTimeout(() => {
      setStatusMessage({ kind: 'idle' });
    }, 3600);
  };

  // Render individual page content by item index
  const renderPageItem = (index: number, side: 'left' | 'right') => {
    if (isSpread && index === -1) {
      return <InsideCover />;
    }
    const item = pageItems[index];
    if (!item) return <BlankPage side={side} />;

    if (item.kind === 'welcome') {
      return <WelcomePage side={side} />;
    }
    if (item.kind === 'entry') {
      return <EntryPage entry={item.entry} side={side} />;
    }
    if (item.kind === 'writer') {
      return (
        <PageSurface side={side}>
          <DateHeader>{formatDate(new Date())}</DateHeader>
          <textarea
            value={writerText}
            onChange={e => {
              const val = e.target.value.slice(0, MAX_TEXT_CHARS).split('\n').slice(0, MAX_LINES).join('\n');
              setWriterText(val);
            }}
            placeholder="Dear diary..."
            aria-label="Write on this page"
            spellCheck={false}
            className={`${TEXT_BASE_CLASS} bottom-[18cqw] resize-none overflow-hidden bg-transparent outline-none px-1 -mx-1 rounded-[3px] ring-1 ring-transparent focus:ring-[#2F5BEA]/55 focus:bg-white/25 placeholder:text-[#24304A]/35 ${
              toolMode === 'draw' ? 'pointer-events-none' : ''
            }`}
          />
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label="Draw on this page"
            className={`absolute inset-0 h-full w-full ${
              toolMode === 'draw' ? 'cursor-crosshair touch-none' : 'pointer-events-none'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <label className="absolute bottom-[9.5cqw] right-[7cqw] flex items-baseline gap-[1.5cqw] font-hand text-[#24304A]">
            <span className="text-[4.3cqw] opacity-55">from</span>
            <input
              value={writerName}
              onChange={e => setWriterName(e.target.value.slice(0, 30))}
              placeholder="your name"
              aria-label="Your name (optional)"
              autoComplete="off"
              className="w-[34cqw] border-b border-dashed border-[#24304A]/25 bg-transparent px-1 rounded-[2px] text-[5.4cqw] outline-none ring-1 ring-transparent focus:ring-[#2F5BEA]/55 placeholder:text-[#24304A]/35"
            />
          </label>
        </PageSurface>
      );
    }
    return <BlankPage side={side} />;
  };

  const isCurrentOnWriter = isSpread
    ? [2 * spreadIndex - 1, 2 * spreadIndex].includes(lastIndex)
    : spreadIndex === lastIndex;

  const isFormEmpty = !writerText.trim() && !hasDrawn;

  // Compute interactive corner hover & pointer drag geometry on the book spread
  const analyzeBookPointer = useCallback((clientX: number, clientY: number) => {
    const el = bookContainerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const dir: 1 | -1 = isSpread
      ? (relX < rect.width / 2 ? -1 : 1)
      : (relX < rect.width * 0.35 ? -1 : 1);

    const canTurnDir = dir === 1 ? spreadIndex < maxSpreadIndex : spreadIndex > 0;
    const outerDistX = dir === 1 ? rect.width - relX : relX;
    const originY = Math.max(0.15, Math.min(0.85, relY / rect.height));
    const distTop = relY;
    const distBottom = rect.height - relY;
    const cornerY: 'top' | 'bottom' = distTop < distBottom ? 'top' : 'bottom';
    const inCornerZone = outerDistX <= 82 && (distTop <= 96 || distBottom <= 96);
    const inOuterMargin = outerDistX <= 54;

    return { rect, relX, relY, dir, canTurnDir, outerDistX, originY, cornerY, inCornerZone, inOuterMargin };
  }, [isSpread, spreadIndex, maxSpreadIndex]);

  const handleBookPointerMoveHover = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragSessionRef.current || isAnimatingTurnRef.current) return;
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
    const info = analyzeBookPointer(e.clientX, e.clientY);
    if (!info || !info.canTurnDir || (isEditable && !info.inCornerZone)) {
      if (hoverCorner) setHoverCorner(null);
      return;
    }

    if (toolMode === 'draw' && isCurrentOnWriter && target.tagName === 'CANVAS' && !info.inCornerZone) {
      if (hoverCorner) setHoverCorner(null);
      return;
    }

    if (info.inCornerZone || info.inOuterMargin) {
      if (!hoverCorner || hoverCorner.dir !== info.dir || hoverCorner.cornerY !== info.cornerY) {
        setHoverCorner({ dir: info.dir, cornerY: info.cornerY });
      }
    } else if (hoverCorner) {
      setHoverCorner(null);
    }
  }, [analyzeBookPointer, hoverCorner, toolMode, isCurrentOnWriter]);

  const handleBookPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isAnimatingTurnRef.current) return;

    const target = e.target as HTMLElement;
    const info = analyzeBookPointer(e.clientX, e.clientY);
    if (!info || !info.canTurnDir) return;

    const isEditable = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.closest('label');
    if (isEditable) return;

    // On draw canvas, only corner grabs initiate a page turn so freehand drawing across the sheet never stalls
    if (toolMode === 'draw' && isCurrentOnWriter && target.tagName === 'CANVAS') {
      if (info.outerDistX > 44 || (info.relY >= 56 && info.rect.height - info.relY >= 56)) {
        return;
      }
    }

    dragSessionRef.current = {
      pointerId: e.pointerId,
      dir: info.dir,
      startX: e.clientX,
      startY: e.clientY,
      originY: info.originY,
      inCornerZone: info.inCornerZone || info.inOuterMargin,
      hasMoved: false,
    };
    setHoverCorner(null);
  }, [analyzeBookPointer, toolMode, isCurrentOnWriter]);

  useEffect(() => {
    if (!isOpen) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;

      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;
      if (!session.hasMoved && Math.hypot(dx, dy) > 5) {
        session.hasMoved = true;
      }
      if (!session.hasMoved) return;

      const span = Math.max(150, (isSpread ? pageW * 1.12 : pageW * 0.95));
      const signedTravel = session.dir === 1 ? -dx : dx;
      const raw = signedTravel / span;
      const progress = Math.max(0.015, Math.min(0.985, raw));
      setTurn({
        dir: session.dir,
        progress,
        originY: session.originY,
        dragging: true,
      });
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== e.pointerId) return;
      dragSessionRef.current = null;

      const currentTurn = turnStateRef.current;
      if (!session.hasMoved) {
        if (session.inCornerZone) {
          animateTurnTo(session.dir, 0, 1, session.originY, true, true);
        } else {
          setTurn(null);
        }
        return;
      }

      const progress = currentTurn?.progress ?? 0;
      if (progress >= 0.34) {
        animateTurnTo(session.dir, progress, 1, session.originY, true, true);
      } else {
        animateTurnTo(session.dir, progress, 0, session.originY, false, false);
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [isOpen, isSpread, pageW, animateTurnTo, setTurn]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Death Note diary"
      className="fixed inset-0 z-[60] flex flex-col items-center bg-black/55 backdrop-blur-[4px] animate-fade-in select-none"
    >
      {/* Top Bar: Crisp Left "Back to the desk" Pill + Quiet Right Counter */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:py-5 sm:px-6 z-20 pt-[env(safe-area-inset-top,0px)]">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white hover:bg-zinc-100 px-3.5 text-xs font-medium text-zinc-900 shadow-xl ring-1 ring-black/10 transition active:scale-95"
          title="Back to the desk (Esc)"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to the desk</span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/85 drop-shadow">
          <span
            className={`w-2 h-2 rounded-full ${
              storageMode === 'cloud'
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : storageMode === 'local-file'
                  ? 'bg-sky-400'
                  : 'bg-amber-400'
            }`}
            title={
              storageMode === 'cloud'
                ? 'Shared global cloud persistence active'
                : storageMode === 'local-file'
                  ? 'Local file storage active (.diary-storage.json)'
                  : 'Browser-only storage (configure cloud store on Vercel for public sync)'
            }
          />
          <span>
            {entries.length} {entries.length === 1 ? 'page' : 'pages'} written
          </span>
        </div>
      </div>

      {/* Main Book Viewing Stage */}
      <div
        ref={stageContainerRef}
        className="relative flex min-h-0 w-full flex-1 items-center justify-center px-2 py-1"
      >
        {/* Left Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => flip(-1)}
          disabled={!!turnState || spreadIndex === 0}
          aria-label="Previous page"
          className="absolute left-2 top-1/2 z-40 grid h-9 w-9 -translate-y-1/2 shrink-0 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-lg ring-1 ring-black/10 transition hover:bg-white hover:scale-105 disabled:opacity-20 disabled:hover:scale-100 active:scale-95 sm:static sm:mx-4 sm:h-10 sm:w-10 sm:translate-y-0"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>

        {/* ── REALISTIC OPENED NOTEBOOK CONTAINER ── */}
        <div
          ref={bookContainerRef}
          onPointerMove={handleBookPointerMoveHover}
          onPointerLeave={() => {
            if (!dragSessionRef.current) setHoverCorner(null);
          }}
          onPointerDown={handleBookPointerDown}
          className={`relative select-none ${
            turnState?.dragging
              ? 'cursor-grabbing'
              : hoverCorner
                ? 'cursor-grab'
                : ''
          }`}
          style={{
            width: isSpread ? pageW * 2 : pageW,
            height: pageH,
            perspective: '1400px',
            touchAction: toolMode === 'draw' && isCurrentOnWriter ? 'none' : 'pan-y',
          }}
        >
          {/* Sleek Pure Black Leather Cover ("Death Note") */}
          <div
            aria-hidden="true"
            className="absolute -inset-[9px] sm:-inset-[12px] rounded-[12px] sm:rounded-[15px] bg-[#0a0a0d] border border-white/10 shadow-[0_28px_75px_-12px_rgba(0,0,0,0.9)]"
          />

          {/* Subtle Paper Stack Edges on Left & Right Outer Margins */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-[3px] inset-y-[2px] rounded-[4px] bg-gradient-to-r from-[#dfd8ca] via-[#f5f0e6] to-[#dfd8ca] shadow-sm -z-10"
          />

          {/* Book Open Spread Surface */}
          <div className="relative w-full h-full rounded-[4px] overflow-hidden shadow-inner">
            {isSpread ? (
              /* DUAL PAGE OPEN SPREAD (Desktop / Tablet) */
              <div className="relative grid grid-cols-2 w-full h-full">
                {/* Left Static Page (Reveals previous left page when turning backward!) */}
                <div className="relative w-full h-full overflow-hidden">
                  {turnState?.dir === -1
                    ? renderPageItem(2 * (spreadIndex - 1) - 1, 'left')
                    : renderPageItem(2 * spreadIndex - 1, 'left')}
                </div>

                {/* Right Static Page (Reveals next right page immediately as right corner lifts!) */}
                <div className="relative w-full h-full overflow-hidden">
                  {turnState?.dir === 1
                    ? renderPageItem(2 * (spreadIndex + 1), 'right')
                    : renderPageItem(2 * spreadIndex, 'right')}
                </div>

                {/* Subtle Center Book Spine Crease */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-transparent via-black/15 to-transparent flex justify-center z-20"
                >
                  <div className="w-px h-full bg-black/15" />
                </div>

                {/* Corner Hover Peel Indicator ("Lift a corner to turn the page") */}
                {!turnState && hoverCorner && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute z-20 w-14 h-14 transition-opacity duration-150 ${
                      hoverCorner.dir === 1 ? 'right-0' : 'left-0'
                    } ${hoverCorner.cornerY === 'top' ? 'top-0' : 'bottom-0'}`}
                    style={{
                      background:
                        hoverCorner.dir === 1
                          ? hoverCorner.cornerY === 'bottom'
                            ? 'linear-gradient(315deg, rgba(22,21,20,0.22) 0%, rgba(251,249,244,0.96) 46%, rgba(0,0,0,0.14) 50%, transparent 56%)'
                            : 'linear-gradient(225deg, rgba(22,21,20,0.22) 0%, rgba(251,249,244,0.96) 46%, rgba(0,0,0,0.14) 50%, transparent 56%)'
                          : hoverCorner.cornerY === 'bottom'
                            ? 'linear-gradient(45deg, rgba(22,21,20,0.22) 0%, rgba(251,249,244,0.96) 46%, rgba(0,0,0,0.14) 50%, transparent 56%)'
                            : 'linear-gradient(135deg, rgba(22,21,20,0.22) 0%, rgba(251,249,244,0.96) 46%, rgba(0,0,0,0.14) 50%, transparent 56%)',
                    }}
                  />
                )}

                {/* Dynamic Cast Shadow sweeping across revealed static pages */}
                {turnState && (
                  <div
                    className="absolute inset-y-0 pointer-events-none z-20"
                    style={{
                      left: turnState.progress < 0.5
                        ? (turnState.dir === 1 ? '50%' : 0)
                        : (turnState.dir === 1 ? 0 : '50%'),
                      width: '50%',
                      background: `linear-gradient(to ${
                        turnState.progress < 0.5
                          ? (turnState.dir === 1 ? 'right' : 'left')
                          : (turnState.dir === 1 ? 'left' : 'right')
                      }, rgba(0,0,0,0.28), transparent)`,
                      opacity: Math.sin(turnState.progress * Math.PI),
                    }}
                  />
                )}

                {/* Real-Time Interactive 3D Turning Leaf following mouse drag */}
                {turnState && (
                  <div
                    className="absolute inset-y-0 pointer-events-none z-30"
                    style={{
                      left: turnState.dir === 1 ? '50%' : 0,
                      width: '50%',
                      transformStyle: 'preserve-3d',
                      transformOrigin: turnState.dir === 1 ? 'left center' : 'right center',
                      transform: pageTurnTransform(turnState.dir, turnState.progress, turnState.originY),
                      filter: `drop-shadow(0 ${Math.sin(turnState.progress * Math.PI) * 14}px ${Math.sin(turnState.progress * Math.PI) * 20}px rgba(20, 14, 10, 0.34))`,
                    }}
                  >
                    {/* Front Face of Turning Leaf */}
                    <div
                      className="absolute inset-0 overflow-hidden shadow-2xl"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {turnState.dir === 1
                        ? renderPageItem(2 * spreadIndex, 'right')
                        : renderPageItem(2 * spreadIndex - 1, 'left')}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          ...pageTurnLighting(turnState.dir, turnState.progress),
                          opacity: Math.sin(turnState.progress * Math.PI),
                        }}
                      />
                    </div>

                    {/* Back Face (Verso) of Turning Leaf */}
                    <div
                      className="absolute inset-0 overflow-hidden shadow-2xl"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      {turnState.dir === 1
                        ? renderPageItem(2 * spreadIndex + 1, 'left')
                        : renderPageItem(2 * spreadIndex - 2, 'right')}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          ...pageTurnLighting(turnState.dir, turnState.progress, true),
                          opacity: Math.sin(turnState.progress * Math.PI),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SINGLE ADAPTIVE OPEN JOURNAL PAGE (Mobile) */
              <div className="relative w-full h-full overflow-hidden">
                {turnState
                  ? renderPageItem(spreadIndex + (turnState.dir === 1 ? 1 : -1), 'right')
                  : renderPageItem(spreadIndex, 'right')}

                {/* Subtle Left Spine Binding Shadow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-20"
                />

                {/* 3D Interactive Page Turn for Mobile Single Page */}
                {turnState && (
                  <div
                    className="absolute inset-0 pointer-events-none z-30"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: turnState.dir === 1 ? 'left center' : 'right center',
                      transform: pageTurnTransform(turnState.dir, turnState.progress, turnState.originY),
                      filter: `drop-shadow(0 ${Math.sin(turnState.progress * Math.PI) * 14}px ${Math.sin(turnState.progress * Math.PI) * 20}px rgba(20, 14, 10, 0.34))`,
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                      {renderPageItem(spreadIndex, 'right')}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          ...pageTurnLighting(turnState.dir, turnState.progress),
                          opacity: Math.sin(turnState.progress * Math.PI),
                        }}
                      />
                    </div>
                    <div
                      className="absolute inset-0 overflow-hidden shadow-2xl"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {renderPageItem(spreadIndex + (turnState.dir === 1 ? 1 : -1), 'right')}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          ...pageTurnLighting(turnState.dir, turnState.progress, true),
                          opacity: Math.sin(turnState.progress * Math.PI),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => flip(1)}
          disabled={!!turnState || spreadIndex >= maxSpreadIndex}
          aria-label="Next page"
          className="absolute right-2 top-1/2 z-40 grid h-9 w-9 -translate-y-1/2 shrink-0 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-lg ring-1 ring-black/10 transition hover:bg-white hover:scale-105 disabled:opacity-20 disabled:hover:scale-100 active:scale-95 sm:static sm:mx-4 sm:h-10 sm:w-10 sm:translate-y-0"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom Floating Control Pill / Footer Hint matching Pradip Video */}
      <div
        className="w-full px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 flex flex-col items-center justify-center gap-2"
        style={{ minHeight: `calc(${isSpread ? 88 : 110}px + env(safe-area-inset-bottom))` }}
      >
        {isCurrentOnWriter && !turnState ? (
          <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-1.5">
            <div className="flex flex-wrap items-center justify-center gap-1 rounded-full bg-[#18191e]/92 backdrop-blur-xl border border-white/15 p-1.5 shadow-[0_14px_38px_rgba(0,0,0,0.65)]">
              <button
                type="button"
                className={`inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                  toolMode === 'write'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setToolMode('write')}
                aria-pressed={toolMode === 'write'}
              >
                <Type className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Write</span>
              </button>

              <button
                type="button"
                className={`inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-all ${
                  toolMode === 'draw'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setToolMode('draw')}
                aria-pressed={toolMode === 'draw'}
              >
                <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Draw</span>
              </button>

              {toolMode === 'draw' && (
                <>
                  <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
                  {INK_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setInkColor(c);
                        setIsEraser(false);
                      }}
                      aria-label="Ink colour"
                      aria-pressed={!isEraser && inkColor === c}
                      className={`grid h-7 w-7 place-items-center rounded-full transition-transform ${
                        !isEraser && inkColor === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full shadow-inner ring-1 ring-white/25" style={{ background: c }} />
                    </button>
                  ))}

                  {PEN_SIZES.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setPenSize(sz)}
                      aria-label={`Pen size ${sz}`}
                      aria-pressed={penSize === sz}
                      className={`hidden h-7 w-7 place-items-center rounded-full sm:grid transition ${
                        penSize === sz ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="rounded-full bg-white" style={{ width: 2.5 + sz / 2.2, height: 2.5 + sz / 2.2 }} />
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                      isEraser ? 'bg-white text-zinc-900 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setIsEraser(prev => !prev)}
                    aria-pressed={isEraser}
                    aria-label="Eraser"
                    title="Eraser"
                  >
                    <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/75 hover:bg-white/10 hover:text-white disabled:opacity-30 transition"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                    title="Undo"
                  >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-full text-white/75 hover:bg-white/10 hover:text-white transition"
                    onClick={handleClearDrawing}
                    aria-label="Clear drawing"
                    title="Clear drawing"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              )}

              <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />

              <button
                type="button"
                onClick={handleAddPage}
                disabled={isFormEmpty || statusMessage.kind === 'sending'}
                className={`inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all active:scale-95 ${
                  isFormEmpty
                    ? 'bg-white/12 text-white/45 cursor-not-allowed'
                    : 'bg-[#2F5BEA] hover:bg-[#2449C7] text-white shadow-lg shadow-blue-600/30'
                }`}
              >
                {statusMessage.kind === 'sending' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Add my page</span>
                )}
              </button>
            </div>

            {statusMessage.kind === 'done' || statusMessage.kind === 'warn' || statusMessage.kind === 'error' ? (
              <p
                className={`text-xs font-medium text-center ${
                  statusMessage.kind === 'error'
                    ? 'text-rose-300'
                    : statusMessage.kind === 'warn'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {statusMessage.message}
              </p>
            ) : (
              <p className="text-xs italic text-white/70">
                Lift a corner to turn the page
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-[13px] italic text-white/75 text-center tracking-wide">
            Lift a corner to turn the page
          </p>
        )}
      </div>
    </div>
  );
};
