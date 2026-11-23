import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Type, PenTool, Eraser, Undo2, Trash2, Loader2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';

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

// Constants matching sketchbook standards
const CANVAS_W = 750;
const CANVAS_H = 1050;
const INK_COLORS = ['#24304A', '#2456C9', '#C2410C', '#2F7D4E'];
const PEN_SIZES = [4, 8, 16];
const MAX_TEXT_CHARS = 420;
const MAX_LINES = 14;
const TEXT_BASE_CLASS = 'absolute left-[14cqw] right-[7cqw] top-[9.9cqw] font-hand text-[5.6cqw] leading-[7cqw] text-[#24304A]';

// Format date helper
function formatDate(d: Date | string | number): string {
  try {
    const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '23 Nov 2026';
  }
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
      className={`relative aspect-[5/7] w-full overflow-hidden bg-[#FBF7EE] select-none ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      {/* Repeating ruled blue lines spaced 7cqw apart */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[8cqw] top-[9cqw]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent calc(7cqw - 1px), rgba(86,120,170,0.20) calc(7cqw - 1px), rgba(86,120,170,0.20) 7cqw)'
        }}
      />
      {/* Red vertical margin rule line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[11cqw] w-px bg-[rgba(214,96,86,0.32)]"
      />
      {/* Spine crease shadow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 w-[8cqw] ${
          side === 'right' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'
        } from-black/[0.14] via-black/[0.05] to-transparent`}
      />
      {/* Paper micro texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.015] via-transparent to-black/[0.03]"
      />
      {children}
    </div>
  );
};

const DateHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="pointer-events-none absolute right-[7cqw] top-[5cqw] font-hand text-[4.4cqw] text-[#24304A]/70">
    {children}
  </p>
);

const PageSignature: React.FC<{ children: React.ReactNode; mine?: boolean }> = ({ children, mine }) => (
  <p className={`pointer-events-none absolute bottom-[9.5cqw] right-[7cqw] font-hand text-[5.6cqw] ${mine ? 'text-[#C2410C]' : 'text-[#24304A]'}`}>
    <span className="text-[4.4cqw] opacity-60">from </span>
    {children}
  </p>
);

const InsideCover: React.FC = () => (
  <div className="relative flex aspect-[5/7] w-full items-center justify-center bg-[#F4EEE2] select-none" style={{ containerType: 'inline-size' }}>
    <div className="text-center font-hand text-[#24304A]/75 px-4">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1e1b18]/10">
        <BookOpen className="h-6 w-6 text-[#1e1b18]/70" />
      </div>
      <p className="text-[5cqw] text-zinc-500 font-sans tracking-widest uppercase">Personal Guestbook</p>
      <p className="mt-[2cqw] text-[8.5cqw] font-semibold text-[#1e1b18]">Joshua / ZYNX</p>
      <p className="mt-[1cqw] text-[4.2cqw] text-zinc-600">Workstation Diary & Visitor Log</p>
      <div className="mt-4 mx-auto w-24 h-px bg-zinc-400/40" />
      <p className="mt-3 text-[3.8cqw] text-zinc-500 italic">"Leave a signature, a sketch, or your thoughts."</p>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[8cqw] bg-gradient-to-l from-black/[0.12] to-transparent" />
  </div>
);

const WelcomePage: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <PageSurface side={side}>
    <p className="absolute left-[14cqw] right-[7cqw] top-[6.6cqw] font-hand text-[8cqw] font-semibold leading-[7cqw] text-[#24304A]">
      My desk diary
    </p>
    <p className={`${TEXT_BASE_CLASS} !top-[16.9cqw]`}>
      This notebook lives on my work desk, and it's open to everyone who visits. Leave a note, a doodle, a question for me, or just say hello. Every page gets preserved here in the guestbook, so feel free to make it yours.
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
  plain ? <div className="aspect-[5/7] w-full bg-[#F6F1E6]" /> : <PageSurface side={side} />;

/* -------------------------------------------------------------------------
 * Main Diary Modal Component
 * ------------------------------------------------------------------------- */

export const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('zynx_diary_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((e: DiaryEntry) => ({
          ...e,
          author: typeof e.author === 'string' ? e.author.replace(/Kavya/gi, 'Jeevan') : e.author
        }));
      }
      return INITIAL_DIARY_ENTRIES;
    } catch {
      return INITIAL_DIARY_ENTRIES;
    }
  });

  // Responsive page sizing & spread state
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isSpread, setIsSpread] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 680);
  const [pageW, setPageW] = useState(380);
  const pageH = Math.round(pageW * 1.4);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;
    const spread = window.innerWidth >= 680;
    const availableW = window.innerWidth - 16;
    const availableH = window.innerHeight - 72 - (spread ? 112 : 160);
    const maxW = spread ? (availableW - 2 * 60 - 24) / 2 : Math.min(availableW - 32, 420);
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

  // Save entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zynx_diary_entries', JSON.stringify(entries));
    } catch {
      // Ignore storage errors
    }
  }, [entries]);

  // Tool states for writer
  const [toolMode, setToolMode] = useState<'write' | 'draw'>('write');
  const [inkColor, setInkColor] = useState(INK_COLORS[0]);
  const [penSize, setPenSize] = useState(PEN_SIZES[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [writerText, setWriterText] = useState('');
  const [writerName, setWriterName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ kind: 'idle' | 'sending' | 'done' | 'error'; message?: string }>({ kind: 'idle' });

  // Drawing canvas refs & history
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoHistoryRef = useRef<ImageData[]>([]);
  const hasDrawnRef = useRef(false);
  const pointerStateRef = useRef<{ id: number; x: number; y: number; mx: number; my: number } | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  // 3D Smooth Page Flip Animation State
  const [flippingState, setFlippingState] = useState<{
    dir: number; // 1: next, -1: prev
    progress: number; // 0 to 1
  } | null>(null);
  const isAnimatingRef = useRef(false);

  const flip = useCallback((dir: number) => {
    if (isAnimatingRef.current) return;
    if (spreadIndex + dir < 0 || spreadIndex + dir > maxSpreadIndex) return;

    isAnimatingRef.current = true;
    playPageTurnSound();

    const startTime = performance.now();
    const duration = 400; // ms

    const step = (now: number) => {
      const elapsed = now - startTime;
      const rawProg = Math.min(1, elapsed / duration);
      // Natural cubic bezier easing: cubic-bezier(0.25, 1, 0.5, 1)
      const ease = 1 - Math.pow(1 - rawProg, 3);
      setFlippingState({ dir, progress: ease });

      if (rawProg < 1) {
        requestAnimationFrame(step);
      } else {
        setSpreadIndex(idx => idx + dir);
        setFlippingState(null);
        isAnimatingRef.current = false;
      }
    };
    requestAnimationFrame(step);
  }, [spreadIndex, maxSpreadIndex]);

  // Touchscreen swipe gesture handling
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwipingHorizRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (toolMode === 'draw' && isCurrentOnWriter) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') return;
    }
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isSwipingHorizRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      isSwipingHorizRef.current = true;
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) && dt < 600) {
      if (dx < 0) {
        flip(1); // Swiped left -> next page
      } else {
        flip(-1); // Swiped right -> prev page
      }
    }
  };

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
    if (!isEraser) hasDrawnRef.current = true;
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
    }
  };

  const handleUndo = () => {
    const ctx = getCanvasContext();
    const lastImg = undoHistoryRef.current.pop();
    if (ctx && lastImg) {
      ctx.putImageData(lastImg, 0, 0);
    }
    setCanUndo(undoHistoryRef.current.length > 0);
  };

  const handleClearDrawing = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    undoHistoryRef.current.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    hasDrawnRef.current = false;
    setCanUndo(true);
  };

  // Adding the user's page to the diary
  const handleAddPage = async () => {
    const textTrimmed = writerText.trim();
    let drawingDataUrl: string | undefined = undefined;

    if (canvasRef.current && hasDrawnRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL('image/png');
    }

    if (!textTrimmed && !drawingDataUrl) return;

    setStatusMessage({ kind: 'sending' });
    await new Promise(r => setTimeout(r, 650));

    const newEntry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      date: formatDate(new Date()),
      author: writerName.trim() || 'A Friendly Visitor',
      message: textTrimmed,
      drawingData: drawingDataUrl
    };

    setEntries(prev => [...prev, newEntry]);
    setWriterText('');
    setWriterName('');
    const ctx = getCanvasContext();
    if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    hasDrawnRef.current = false;
    undoHistoryRef.current = [];
    setCanUndo(false);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 }
    });

    setStatusMessage({ kind: 'done', message: 'Your page is preserved in the diary. Thank you!' });
    setTimeout(() => {
      setStatusMessage({ kind: 'idle' });
    }, 4000);
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
            className={`${TEXT_BASE_CLASS} bottom-[18cqw] resize-none overflow-hidden bg-transparent outline-none placeholder:text-[#24304A]/35 ${
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
            <span className="text-[4.4cqw] opacity-60">from</span>
            <input
              value={writerName}
              onChange={e => setWriterName(e.target.value.slice(0, 30))}
              placeholder="your name"
              aria-label="Your name (optional)"
              autoComplete="off"
              className="w-[34cqw] border-b border-dashed border-[#24304A]/25 bg-transparent text-[5.6cqw] outline-none placeholder:text-[#24304A]/35"
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

  const isFormEmpty = !writerText.trim() && !hasDrawnRef.current;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="My desk diary"
      className="fixed inset-0 z-[60] flex flex-col items-center bg-[#191411]/70 backdrop-blur-[4px] animate-fade-in select-none"
    >
      {/* Top Header Bar — aligned right with Back to Desk */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:py-4 sm:px-8 z-20">
        <div className="flex items-center gap-2 text-white/90">
          <BookOpen className="h-5 w-5 text-amber-300" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-amber-200 uppercase">
            Workstation Diary // Guestbook
          </span>
          <span className="hidden sm:inline-block text-xs text-white/60 font-mono">
            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
          </span>
        </div>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="inline-flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-full bg-white/95 px-4 text-[13px] sm:text-[14px] font-medium text-[#1D1D1F] shadow-lg ring-1 ring-black/10 backdrop-blur-xl transition-all hover:bg-white active:scale-95"
          title="Back to desk (Esc)"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span className="font-bold">Back to Desk</span>
        </button>
      </div>

      {/* Main Book Viewing Stage (Touchscreen Swiping Enabled) */}
      <div
        ref={stageContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex min-h-0 w-full flex-1 items-center justify-center px-2 py-1 touch-pan-y"
      >
        {/* Left Side Navigation Button */}
        <button
          type="button"
          onClick={() => flip(-1)}
          disabled={!!flippingState || spreadIndex === 0}
          aria-label="Previous page"
          className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-lg ring-1 ring-black/10 transition-opacity hover:bg-white disabled:opacity-20 mx-2 sm:mx-4 h-10 w-10 sm:h-12 sm:w-12 active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* ── REALISTIC OPENED BOOK CONTAINER ── */}
        <div
          className="relative select-none"
          style={{
            width: isSpread ? pageW * 2 : pageW,
            height: pageH,
            perspective: '1600px'
          }}
        >
          {/* Hardcover Leather Backing with Brass Corners & Depth Stacking */}
          <div
            aria-hidden="true"
            className="absolute -inset-[10px] sm:-inset-[14px] rounded-[14px] sm:rounded-[18px] bg-[#221812] border border-amber-900/30 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.75)]"
          >
            {/* Antique Brass Corner Rivets */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#d4af37]/40 border border-[#d4af37]/60 shadow-sm" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#d4af37]/40 border border-[#d4af37]/60 shadow-sm" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#d4af37]/40 border border-[#d4af37]/60 shadow-sm" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#d4af37]/40 border border-[#d4af37]/60 shadow-sm" />

            {/* Perimeter Stitching Line */}
            <div className="absolute inset-1.5 sm:inset-2 rounded-[10px] sm:rounded-[14px] border border-dashed border-amber-800/30 pointer-events-none" />
          </div>

          {/* Paper Edge Deckle Stacking (Simulates 50+ bound paper leaves) */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-[3px] inset-y-[2px] rounded-[6px] bg-[#ede5d3] shadow-[0_4px_12px_rgba(0,0,0,0.35)] -z-10"
          />

          {/* Red Satin Ribbon Bookmark trailing down from top spine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
          >
            <div className="w-4 h-10 sm:h-14 bg-gradient-to-b from-[#881337] to-[#be123c] rounded-b-[2px] shadow-md border-x border-[#9f1239]" />
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-[#be123c]" />
          </div>

          {/* Book Open Spread Surface */}
          <div className="relative w-full h-full rounded-[4px] overflow-hidden shadow-inner">
            {isSpread ? (
              /* DUAL PAGE OPEN SPREAD (Desktop / Tablet) */
              <div className="relative grid grid-cols-2 w-full h-full">
                {/* Left Page */}
                <div className="relative w-full h-full overflow-hidden">
                  {renderPageItem(2 * spreadIndex - 1, 'left')}
                </div>

                {/* Right Page */}
                <div className="relative w-full h-full overflow-hidden">
                  {renderPageItem(2 * spreadIndex, 'right')}
                </div>

                {/* Center Book Spine Binding Groove & Shadow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 bg-gradient-to-r from-black/25 via-black/45 to-black/25 shadow-lg flex flex-col items-center justify-around py-4 z-20"
                >
                  {/* Subtle spine thread stitch marks */}
                  <div className="w-1.5 h-3 border-x border-white/20 rounded-full" />
                  <div className="w-1.5 h-3 border-x border-white/20 rounded-full" />
                  <div className="w-1.5 h-3 border-x border-white/20 rounded-full" />
                  <div className="w-1.5 h-3 border-x border-white/20 rounded-full" />
                </div>

                {/* 3D Animated Page Flip Layer during page turn */}
                {flippingState && (
                  <div
                    className="absolute inset-y-0 pointer-events-none z-30"
                    style={{
                      left: flippingState.dir === 1 ? '50%' : 0,
                      width: '50%',
                      transformStyle: 'preserve-3d',
                      transformOrigin: flippingState.dir === 1 ? 'left center' : 'right center',
                      transform: `rotateY(${
                        flippingState.dir === 1
                          ? -flippingState.progress * 180
                          : (1 - flippingState.progress) * 180
                      }deg)`
                    }}
                  >
                    {/* Front Face of Turning Leaf */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {flippingState.dir === 1
                        ? renderPageItem(2 * spreadIndex, 'right')
                        : renderPageItem(2 * spreadIndex - 1, 'left')}
                      {/* Dynamic shading sweep as page lifts */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/30 via-transparent to-black/10 transition-opacity"
                        style={{ opacity: Math.sin(flippingState.progress * Math.PI) }}
                      />
                    </div>

                    {/* Back Face of Turning Leaf (Verso) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      {flippingState.dir === 1
                        ? renderPageItem(2 * spreadIndex + 1, 'left')
                        : renderPageItem(2 * spreadIndex - 2, 'right')}
                      {/* Dynamic shading sweep as page lands */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-l from-black/30 via-transparent to-black/10 transition-opacity"
                        style={{ opacity: Math.sin(flippingState.progress * Math.PI) }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SINGLE ADAPTIVE OPEN JOURNAL PAGE (Mobile) */
              <div className="relative w-full h-full overflow-hidden">
                {renderPageItem(spreadIndex, 'right')}

                {/* Left Edge Spine Binding Depression (Looks like open journal) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/30 via-black/15 to-transparent z-20 flex flex-col items-center justify-around py-3"
                >
                  <div className="w-1 h-2.5 border-x border-amber-900/40 rounded-full" />
                  <div className="w-1 h-2.5 border-x border-amber-900/40 rounded-full" />
                  <div className="w-1 h-2.5 border-x border-amber-900/40 rounded-full" />
                </div>

                {/* 3D Animated Flip for Mobile Single Page */}
                {flippingState && (
                  <div
                    className="absolute inset-0 pointer-events-none z-30"
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: flippingState.dir === 1 ? 'left center' : 'right center',
                      transform: `rotateY(${
                        flippingState.dir === 1
                          ? -flippingState.progress * 120
                          : (1 - flippingState.progress) * 120
                      }deg) scale(${1 - Math.sin(flippingState.progress * Math.PI) * 0.05})`
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                      {renderPageItem(spreadIndex, 'right')}
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/40 via-transparent to-black/20"
                        style={{ opacity: Math.sin(flippingState.progress * Math.PI) }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Navigation Button */}
        <button
          type="button"
          onClick={() => flip(1)}
          disabled={!!flippingState || spreadIndex >= maxSpreadIndex}
          aria-label="Next page"
          className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-lg ring-1 ring-black/10 transition-opacity hover:bg-white disabled:opacity-20 mx-2 sm:mx-4 h-10 w-10 sm:h-12 sm:w-12 active:scale-90"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        className="w-full px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2"
        style={{ minHeight: `calc(${isSpread ? 100 : 140}px + env(safe-area-inset-bottom))` }}
      >
        {isCurrentOnWriter && !flippingState ? (
          <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Writer Mode / Drawing Pill Selector */}
              <div className="flex flex-wrap items-center justify-center gap-1 rounded-full bg-white/95 p-1.5 shadow-xl ring-1 ring-black/10">
                <button
                  type="button"
                  className={`inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-full px-3.5 text-[13px] sm:text-[14px] font-medium transition-all ${
                    toolMode === 'write' ? 'bg-[#1D1D1F] text-white shadow-sm' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                  }`}
                  onClick={() => setToolMode('write')}
                  aria-pressed={toolMode === 'write'}
                >
                  <Type className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>Write</span>
                </button>

                <button
                  type="button"
                  className={`inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-full px-3.5 text-[13px] sm:text-[14px] font-medium transition-all ${
                    toolMode === 'draw' ? 'bg-[#1D1D1F] text-white shadow-sm' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                  }`}
                  onClick={() => setToolMode('draw')}
                  aria-pressed={toolMode === 'draw'}
                >
                  <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>Draw</span>
                </button>

                {/* Draw mode ink colors, sizes, eraser, undo, and clear */}
                {toolMode === 'draw' && (
                  <>
                    <span className="mx-1 h-5 w-px bg-black/15" aria-hidden="true" />
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
                        className={`grid h-8 w-8 place-items-center rounded-full transition-transform ${
                          !isEraser && inkColor === c ? 'scale-110 ring-2 ring-[#1D1D1F]' : ''
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full shadow-inner" style={{ background: c }} />
                      </button>
                    ))}
                    {PEN_SIZES.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPenSize(sz)}
                        aria-label={`Pen size ${sz}`}
                        aria-pressed={penSize === sz}
                        className={`hidden h-8 w-8 place-items-center rounded-full sm:grid ${
                          penSize === sz ? 'bg-black/[0.08]' : ''
                        }`}
                      >
                        <span className="rounded-full bg-[#1D1D1F]/80" style={{ width: 2.5 + sz / 2, height: 2.5 + sz / 2 }} />
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors ${
                        isEraser ? 'bg-[#1D1D1F] text-white' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                      }`}
                      onClick={() => setIsEraser(prev => !prev)}
                      aria-pressed={isEraser}
                      aria-label="Eraser"
                    >
                      <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors text-[#1D1D1F]/75 hover:bg-black/[0.05] disabled:opacity-30"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      aria-label="Undo"
                    >
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors text-[#1D1D1F]/75 hover:bg-black/[0.05]"
                      onClick={handleClearDrawing}
                      aria-label="Clear drawing"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              {/* Add My Page Action Button */}
              <button
                type="button"
                onClick={handleAddPage}
                disabled={isFormEmpty || statusMessage.kind === 'sending'}
                className="inline-flex h-[48px] sm:h-[50px] items-center justify-center gap-2 rounded-full bg-[#2F5BEA] hover:bg-[#2449C7] px-6 text-[14px] sm:text-[15px] font-semibold text-white shadow-xl transition-all active:scale-[0.97] disabled:opacity-40"
              >
                {statusMessage.kind === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Adding entry...</span>
                  </>
                ) : (
                  <span>Add my page</span>
                )}
              </button>
            </div>

            {/* Status / feedback line */}
            <p
              className={`min-h-[1.4rem] text-center font-hand text-[17px] sm:text-[19px] ${
                statusMessage.kind === 'error' ? 'text-[#FFB4A8]' : 'text-amber-100/90'
              }`}
            >
              {statusMessage.kind === 'done' || statusMessage.kind === 'error'
                ? statusMessage.message
                : 'Swipe left/right or tap arrows to flip pages'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="font-hand text-[17px] sm:text-[20px] text-amber-100/90 text-center">
              Swipe left / right or tap arrows to flip through pages
            </p>
            <p className="font-mono text-[11px] text-white/50">
              Page {isSpread ? `${Math.max(1, 2 * spreadIndex)} - ${2 * spreadIndex + 1}` : spreadIndex + 1} of {pageItems.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
