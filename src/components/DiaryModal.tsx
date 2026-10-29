import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Type, PenTool, Eraser, Undo2, Trash2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type DiaryEntry, INITIAL_DIARY_ENTRIES } from '../data/portfolioData';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Geometry types for realistic 3D paper curl
interface Point {
  x: number;
  y: number;
}

interface FoldGeometry {
  flat: Point[];
  folded: Point[];
  at: Point;
  normal: Point;
  amount: number;
}

interface PageTurn {
  dir: number; // 1: next, -1: prev
  corner: number; // Y coordinate of corner pulled
}

// Procedural soft paper sound synthesis using Web Audio API
function playPageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = ctx.sampleRate * 0.32;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.32);
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.32);
  } catch {
    // Ignore autoplay restriction errors
  }
}

// Constants matching pradiplabs.dev
const CANVAS_W = 750;
const CANVAS_H = 1050;
const INK_COLORS = ['#24304A', '#2456C9', '#C2410C', '#2F7D4E'];
const PEN_SIZES = [4, 8, 16];
const MAX_TEXT_CHARS = 420;
const MAX_LINES = 14;
const TEXT_BASE_CLASS = 'absolute left-[15cqw] right-[7cqw] top-[9.9cqw] font-hand text-[5.6cqw] leading-[7cqw] text-[#24304A]';

// Math helpers for curling
function clampDist(p: Point, o: Point, maxD: number): Point {
  const d = Math.hypot(p.x - o.x, p.y - o.y);
  return d <= maxD ? p : { x: o.x + ((p.x - o.x) * maxD) / d, y: o.y + ((p.y - o.y) * maxD) / d };
}

function clipPoly(poly: Point[], o: Point, n: Point, side: number): Point[] {
  const res: Point[] = [];
  const dist = (p: Point) => side * ((p.x - o.x) * n.x + (p.y - o.y) * n.y);
  poly.forEach((p, i) => {
    const next = poly[(i + 1) % poly.length];
    const d1 = dist(p);
    const d2 = dist(next);
    if (d1 >= 0) res.push(p);
    if ((d1 >= 0) !== (d2 >= 0)) {
      const t = d1 / (d1 - d2);
      res.push({ x: p.x + (next.x - p.x) * t, y: p.y + (next.y - p.y) * t });
    }
  });
  return res;
}

function getCornerTarget(t: number, dir: number, cornerY: number, w: number, h: number, nudge = 0): Point {
  const bend = (cornerY === 0 ? 1 : -1) * 0.16 * h * Math.sin(Math.PI * t);
  const target = { x: dir * w * (1 - 2 * t), y: cornerY + bend + nudge };
  return clampDist(
    clampDist(target, { x: 0, y: cornerY }, w),
    { x: 0, y: h - cornerY },
    Math.hypot(w, h)
  );
}

function computeFold(target: Point, dir: number, cornerY: number, w: number, h: number): FoldGeometry | null {
  const corner = { x: dir * w, y: cornerY };
  const dist = Math.hypot(corner.x - target.x, corner.y - target.y);
  if (dist < 0.5) return null;
  const normal = { x: (corner.x - target.x) / dist, y: (corner.y - target.y) / dist };
  const midpoint = { x: (corner.x + target.x) / 2, y: (corner.y + target.y) / 2 };
  const left = dir === 1 ? 0 : -w;
  const pagePoly: Point[] = [
    { x: left, y: 0 },
    { x: left + w, y: 0 },
    { x: left + w, y: h },
    { x: left, y: h }
  ];
  return {
    flat: clipPoly(pagePoly, midpoint, normal, -1),
    folded: clipPoly(pagePoly, midpoint, normal, 1),
    at: midpoint,
    normal,
    amount: Math.min(1, dist / (2 * w))
  };
}

function toClipPath(poly: Point[], offset = 0, mirror = false): string {
  if (poly.length < 3) return 'polygon(0 0, 0 0, 0 0)';
  return `polygon(${poly.map(p => `${((mirror ? -p.x : p.x) + offset).toFixed(2)}px ${p.y.toFixed(2)}px`).join(', ')})`;
}

// Format date helper matching pradiplabs
function formatDate(d: Date | string | number): string {
  try {
    const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '29 Oct 2026';
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
            'repeating-linear-gradient(to bottom, transparent 0, transparent calc(7cqw - 1px), rgba(86,120,170,0.22) calc(7cqw - 1px), rgba(86,120,170,0.22) 7cqw)'
        }}
      />
      {/* Red vertical margin rule line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[12cqw] w-px bg-[rgba(214,96,86,0.35)]"
      />
      {/* Spine crease shadow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 w-[7cqw] ${
          side === 'right' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'
        } from-black/[0.09] to-transparent`}
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
    <div className="text-center font-hand text-[#24304A]/75">
      <p className="text-[5.4cqw]">If found, please return to</p>
      <p className="mt-[2cqw] text-[9cqw] font-semibold text-[#24304A]">Joshua / ZYNX</p>
      <p className="mt-[1cqw] text-[4.4cqw]">zynx-portfolio</p>
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[7cqw] bg-gradient-to-l from-black/[0.09] to-transparent" />
  </div>
);

const WelcomePage: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <PageSurface side={side}>
    <p className="absolute left-[15cqw] right-[7cqw] top-[6.6cqw] font-hand text-[8cqw] font-semibold leading-[7cqw] text-[#24304A]">
      My desk diary
    </p>
    <p className={`${TEXT_BASE_CLASS} !top-[16.9cqw]`}>
      This notebook lives on my desk, and it's open to everyone. Leave a note, a doodle, a question for me, or just say hi. Every page gets preserved here in the guestbook, so feel free to make it yours.
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
 * Realistic 3D Page Curl Component (Ke)
 * ------------------------------------------------------------------------- */

interface PageCurlProps {
  turn: PageTurn;
  w: number;
  h: number;
  spread: boolean;
  pose: React.MutableRefObject<{ t: number; nudge: number }>;
  paint: React.MutableRefObject<(() => void) | null>;
  start: React.ReactNode;
  flap: React.ReactNode;
  under: React.ReactNode;
  onto: React.ReactNode;
}

const PageCurl: React.FC<PageCurlProps> = ({
  turn,
  w,
  h,
  spread,
  pose,
  paint,
  start,
  flap,
  under,
  onto
}) => {
  const flatRef = useRef<HTMLDivElement>(null);
  const flatShadowRef = useRef<HTMLDivElement>(null);
  const underShadowRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const flapHighlightRef = useRef<HTMLDivElement>(null);
  const dropShadowRef = useRef<HTMLDivElement>(null);

  const dir = turn.dir;
  const leftOffset = dir === 1 ? 0 : -w;
  const pivotX = dir === 1 ? w : 0;
  const shadowSpan = Math.ceil(Math.hypot(w, h) * 2.2);

  useLayoutEffect(() => {
    const update = () => {
      const { t, nudge } = pose.current;
      const progress = !spread && dir === -1 ? 0.5 + 0.5 * t : t;
      const target = getCornerTarget(progress, dir, turn.corner, w, h, nudge);
      const fold = computeFold(target, dir, turn.corner, w, h);
      const flapEl = flapRef.current;
      if (!flapEl) return;

      if (!fold) {
        flapEl.style.visibility = 'hidden';
        if (flatRef.current) flatRef.current.style.clipPath = '';
        if (flatShadowRef.current) flatShadowRef.current.style.opacity = '0';
        if (underShadowRef.current) underShadowRef.current.style.opacity = '0';
        return;
      }

      const { x: nx, y: ny } = fold.normal;
      const angle = Math.atan2(ny, nx);
      const intensity = Math.sin(Math.PI * fold.amount);

      if (flatRef.current) {
        flatRef.current.style.clipPath = toClipPath(fold.flat, -leftOffset);
      }
      if (flatShadowRef.current) {
        flatShadowRef.current.style.transform = `translate(${fold.at.x - leftOffset}px, ${fold.at.y}px) rotate(${angle}rad) translate(-${w * 0.2}px, ${-shadowSpan / 2}px)`;
        flatShadowRef.current.style.opacity = String(intensity);
      }
      if (underShadowRef.current) {
        underShadowRef.current.style.transform = `translate(${fold.at.x - leftOffset}px, ${fold.at.y}px) rotate(${angle}rad) translate(0px, ${-shadowSpan / 2}px)`;
        underShadowRef.current.style.opacity = String(intensity);
      }

      const lineDist = nx * fold.at.x + ny * fold.at.y;
      const a11 = 2 * nx * nx - 1;
      const a12 = 2 * nx * ny;
      const tx = pivotX * (1 - 2 * nx * nx) + 2 * lineDist * nx;
      const ty = -2 * pivotX * nx * ny + 2 * lineDist * ny;

      flapEl.style.transform = `matrix(${a11}, ${a12}, ${-a12}, ${a11}, ${tx}, ${ty})`;
      flapEl.style.clipPath = toClipPath(fold.folded, pivotX, true);
      flapEl.style.visibility = 'visible';
      flapEl.style.opacity = spread ? '1' : String(dir === 1 ? 1 - Math.max(0, (t - 0.6) / 0.4) : Math.min(1, (progress - 0.5) / 0.15));

      if (flapHighlightRef.current) {
        flapHighlightRef.current.style.transform = `translate(${pivotX - fold.at.x}px, ${fold.at.y}px) rotate(${Math.atan2(ny, -nx)}rad) translate(0px, ${-shadowSpan / 2}px)`;
        flapHighlightRef.current.style.opacity = String(intensity);
      }
      if (dropShadowRef.current) {
        dropShadowRef.current.style.filter = `drop-shadow(0 ${2 + 6 * intensity}px ${4 + 10 * intensity}px rgba(0,0,0,${0.28 * intensity}))`;
      }
    };

    paint.current = update;
    update();
    return () => {
      if (paint.current === update) paint.current = null;
    };
  }, [pose, paint, dir, turn.corner, w, h, spread, leftOffset, pivotX, shadowSpan]);

  const shadowClass = 'pointer-events-none absolute left-0 top-0 origin-top-left';
  const pageSize = { width: w, height: h };

  return (
    <div className="pointer-events-none absolute top-0" style={{ left: spread ? w : 0, width: 0, height: h }}>
      {onto && (
        <div className="absolute top-0 overflow-hidden" style={{ left: dir === 1 ? -w : 0, ...pageSize }}>
          {onto}
        </div>
      )}
      {under && (
        <div className="absolute top-0 overflow-hidden" style={{ left: leftOffset, ...pageSize }}>
          {under}
          <div
            ref={underShadowRef}
            className={shadowClass}
            style={{
              width: w * 0.3,
              height: shadowSpan,
              opacity: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.32), rgba(0,0,0,0.1) 35%, transparent)'
            }}
          />
        </div>
      )}
      {start && (
        <div ref={flatRef} className="absolute top-0 overflow-hidden" style={{ left: leftOffset, ...pageSize }}>
          {start}
          <div
            ref={flatShadowRef}
            className={shadowClass}
            style={{
              width: w * 0.2,
              height: shadowSpan,
              opacity: 0,
              background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.12))'
            }}
          />
        </div>
      )}
      <div ref={dropShadowRef} className="absolute left-0 top-0">
        <div ref={flapRef} className="absolute left-0 top-0 origin-top-left overflow-hidden" style={{ ...pageSize, visibility: 'hidden' }}>
          {flap}
          <div
            ref={flapHighlightRef}
            className={shadowClass}
            style={{
              width: w * 0.45,
              height: shadowSpan,
              opacity: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(255,255,255,0.18) 18%, rgba(255,255,255,0.05) 45%, transparent)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

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
  const [isSpread, setIsSpread] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 900 && window.innerWidth / window.innerHeight > 1.1);
  const [pageW, setPageW] = useState(420);
  const pageH = Math.round(pageW * 1.4);

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return;
    const spread = window.innerWidth >= 900 && window.innerWidth / window.innerHeight > 1.1;
    const availableW = window.innerWidth - 16;
    const availableH = window.innerHeight - 72 - (spread ? 112 : 172);
    const maxW = spread ? (availableW - 2 * 72 - 24) / 2 : availableW - 24;
    const maxH = (availableH - 28) / 1.4;
    const w = Math.max(160, Math.floor(Math.min(spread ? 470 : 440, maxW, maxH)));
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

  // Page turn & interactive curl state
  const [activeTurn, setActiveTurn] = useState<PageTurn | null>(null);
  const turnPoseRef = useRef({ t: 0, nudge: 0 });
  const paintCallbackRef = useRef<(() => void) | null>(null);
  const isTurningRef = useRef(false);

  const applyPose = (tVal: number, nudgeVal: number) => {
    turnPoseRef.current = { t: tVal, nudge: nudgeVal };
    paintCallbackRef.current?.();
  };

  const animateCurl = useCallback((turn: PageTurn, shouldComplete: boolean, startT: number, startNudge: number) => {
    isTurningRef.current = true;
    if (shouldComplete) {
      playPageTurnSound();
    }
    const endT = shouldComplete ? 1 : 0;
    const duration = shouldComplete ? 0.38 : 0.25;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const p = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - p, 3);
      const currentT = startT + (endT - startT) * ease;
      const currentNudge = startNudge * (1 - ease);
      applyPose(currentT, currentNudge);

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        if (shouldComplete) {
          setSpreadIndex(idx => idx + turn.dir);
        }
        setActiveTurn(null);
        applyPose(0, 0);
        isTurningRef.current = false;
      }
    };
    requestAnimationFrame(frame);
  }, []);

  const flip = useCallback((dir: number) => {
    if (activeTurn || isTurningRef.current) return;
    if (spreadIndex + dir < 0 || spreadIndex + dir > maxSpreadIndex) return;
    const turn: PageTurn = { dir, corner: pageH };
    turnPoseRef.current = { t: 0, nudge: 0 };
    setActiveTurn(turn);
    animateCurl(turn, true, 0, 0);
  }, [activeTurn, spreadIndex, maxSpreadIndex, pageH, animateCurl]);

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
    await new Promise(r => setTimeout(r, 650)); // Tactile feedback delay

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

    setStatusMessage({ kind: 'done', message: 'Your page is in the diary. Thank you!' });
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

  // Determine curl layers during page turn
  const curlSetup = (() => {
    if (!activeTurn) return null;
    const { dir } = activeTurn;
    if (isSpread) {
      return dir === 1
        ? {
            start: renderPageItem(2 * spreadIndex, 'right'),
            flap: renderPageItem(2 * spreadIndex + 1, 'left'),
            under: renderPageItem(2 * spreadIndex + 2, 'right'),
            onto: renderPageItem(2 * spreadIndex - 1, 'left')
          }
        : {
            start: renderPageItem(2 * spreadIndex - 1, 'left'),
            flap: renderPageItem(2 * spreadIndex - 2, 'right'),
            under: renderPageItem(2 * spreadIndex - 3, 'left'),
            onto: renderPageItem(2 * spreadIndex, 'right')
          };
    }
    return dir === 1
      ? {
          start: renderPageItem(spreadIndex, 'right'),
          flap: <BlankPage side="right" plain />,
          under: renderPageItem(spreadIndex + 1, 'right'),
          onto: null
        }
      : {
          start: null,
          flap: renderPageItem(spreadIndex - 1, 'right'),
          under: null,
          onto: renderPageItem(spreadIndex, 'right')
        };
  })();

  const isCurrentOnWriter = isSpread
    ? [2 * spreadIndex - 1, 2 * spreadIndex].includes(lastIndex)
    : spreadIndex === lastIndex;

  const isFormEmpty = !writerText.trim() && !hasDrawnRef.current;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="My desk diary"
      className="fixed inset-0 z-[60] flex flex-col items-center bg-[#2A211B]/55 backdrop-blur-[2px] animate-fade-in"
    >
      {/* Top Header Bar */}
      <div className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-[15px] font-medium text-[#1D1D1F] shadow-sm ring-1 ring-black/5 backdrop-blur-xl transition-colors hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the desk
        </button>

        <p className="hidden font-hand text-[22px] text-white/85 sm:block">
          {entries.length} {entries.length === 1 ? 'page' : 'pages'} written
        </p>
      </div>

      {/* Main Book Viewing Stage */}
      <div ref={stageContainerRef} className="flex min-h-0 w-full flex-1 items-center justify-center px-2">
        {/* Left Side Chevron Button */}
        {isSpread && (
          <button
            type="button"
            onClick={() => flip(-1)}
            disabled={!!activeTurn || spreadIndex === 0}
            aria-label="Previous page"
            className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm ring-1 ring-black/5 transition-opacity hover:bg-white disabled:opacity-30 mx-3 h-12 w-12"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {/* Notebook Cover Backing & Content Area */}
        <div
          className="relative select-none"
          style={{ width: isSpread ? pageW * 2 : pageW, height: pageH, touchAction: 'pan-y' }}
        >
          {/* Realistic Dark Charcoal Leather Cover Backing */}
          <div
            aria-hidden="true"
            className="absolute -inset-[10px] rounded-[14px] bg-[#1D1D20] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          />

          {curlSetup ? (
            <PageCurl
              turn={activeTurn!}
              w={pageW}
              h={pageH}
              spread={isSpread}
              pose={turnPoseRef}
              paint={paintCallbackRef}
              {...curlSetup}
            />
          ) : isSpread ? (
            <div className="relative grid grid-cols-2 overflow-visible rounded-[4px]">
              <div className="overflow-hidden rounded-l-[4px]">{renderPageItem(2 * spreadIndex - 1, 'left')}</div>
              <div className="overflow-hidden rounded-r-[4px]">{renderPageItem(2 * spreadIndex, 'right')}</div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[4px]">{renderPageItem(spreadIndex, 'right')}</div>
          )}
        </div>

        {/* Right Side Chevron Button */}
        {isSpread && (
          <button
            type="button"
            onClick={() => flip(1)}
            disabled={!!activeTurn || spreadIndex >= maxSpreadIndex}
            aria-label="Next page"
            className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm ring-1 ring-black/5 transition-opacity hover:bg-white disabled:opacity-30 mx-3 h-12 w-12"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        className="w-full px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
        style={{ minHeight: `calc(${isSpread ? 112 : 172}px + env(safe-area-inset-bottom))` }}
      >
        {isCurrentOnWriter && !activeTurn ? (
          <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Writer Mode / Drawing Pill Selector */}
              <div className="flex flex-wrap items-center justify-center gap-0.5 rounded-[22px] bg-white/95 p-1.5 shadow-lg ring-1 ring-black/5 sm:gap-1">
                <button
                  type="button"
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] sm:px-3.5 font-medium transition-colors ${
                    toolMode === 'write' ? 'bg-[#1D1D1F] text-white' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                  }`}
                  onClick={() => setToolMode('write')}
                  aria-pressed={toolMode === 'write'}
                >
                  <Type className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Write</span>
                </button>

                <button
                  type="button"
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] sm:px-3.5 font-medium transition-colors ${
                    toolMode === 'draw' ? 'bg-[#1D1D1F] text-white' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                  }`}
                  onClick={() => setToolMode('draw')}
                  aria-pressed={toolMode === 'draw'}
                >
                  <PenTool className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Draw</span>
                </button>

                {/* Draw mode ink colors, sizes, eraser, undo, and clear */}
                {toolMode === 'draw' && (
                  <>
                    <span className="mx-1 h-6 w-px bg-black/10" aria-hidden="true" />
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
                        className={`grid h-9 w-8 place-items-center rounded-full sm:w-9 ${
                          !isEraser && inkColor === c ? 'ring-2 ring-[#1D1D1F]/70' : ''
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full" style={{ background: c }} />
                      </button>
                    ))}
                    {PEN_SIZES.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPenSize(sz)}
                        aria-label={`Pen size ${sz}`}
                        aria-pressed={penSize === sz}
                        className={`hidden h-9 w-9 place-items-center rounded-full sm:grid ${
                          penSize === sz ? 'bg-black/[0.07]' : ''
                        }`}
                      >
                        <span className="rounded-full bg-[#1D1D1F]/80" style={{ width: 3 + sz / 2, height: 3 + sz / 2 }} />
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-colors ${
                        isEraser ? 'bg-[#1D1D1F] text-white' : 'text-[#1D1D1F]/75 hover:bg-black/[0.05]'
                      }`}
                      onClick={() => setIsEraser(prev => !prev)}
                      aria-pressed={isEraser}
                      aria-label="Eraser"
                    >
                      <Eraser className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-colors text-[#1D1D1F]/75 hover:bg-black/[0.05] disabled:opacity-30"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      aria-label="Undo"
                    >
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-colors text-[#1D1D1F]/75 hover:bg-black/[0.05]"
                      onClick={handleClearDrawing}
                      aria-label="Clear the drawing"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              {/* Add My Page Action Button */}
              <button
                type="button"
                onClick={handleAddPage}
                disabled={isFormEmpty || statusMessage.kind === 'sending'}
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#2F5BEA] hover:bg-[#2449C7] px-6 text-[15px] font-medium text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {statusMessage.kind === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Checking your page
                  </>
                ) : (
                  'Add my page'
                )}
              </button>
            </div>

            {/* Status / feedback line */}
            <p
              className={`min-h-[1.5rem] text-center font-hand text-[20px] ${
                statusMessage.kind === 'error' ? 'text-[#FFB4A8]' : 'text-white/85'
              }`}
            >
              {statusMessage.kind === 'done' || statusMessage.kind === 'error'
                ? statusMessage.message
                : isSpread
                ? 'Lift a corner or use arrows to turn the page'
                : 'Swipe or use arrows to turn the page'}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            {!isSpread && (
              <button
                type="button"
                onClick={() => flip(-1)}
                disabled={!!activeTurn || spreadIndex === 0}
                className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm ring-1 ring-black/5 h-10 w-10 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <p className="font-hand text-[20px] text-white/85">
              {isSpread ? 'Lift a corner or use arrows to turn the page' : 'Swipe to turn the page'}
            </p>
            {!isSpread && (
              <button
                type="button"
                onClick={() => flip(1)}
                disabled={!!activeTurn || spreadIndex >= maxSpreadIndex}
                className="grid shrink-0 place-items-center rounded-full bg-white/90 text-[#1D1D1F] shadow-sm ring-1 ring-black/5 h-10 w-10 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
