import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Radio, Sparkles, Loader2 } from "lucide-react";
import { soundFX } from "../utils/audioFX";
import {
  musicPlayerEngine,
  type PlayerState,
} from "../utils/musicPlayerEngine";

// ── VINYL TURNTABLE RADIO ─────────────────────────────────────────────────
// A unique compact radio UI: spinning vinyl disc with a multicolor spectrum
// visualizer ring, full track name with auto-scrolling marquee, and theme-
// adaptive glowing neon aesthetics.

const NUM_BARS = 48;
const TWO_PI = Math.PI * 2;

export const BedroomAudioPlayer: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(() => musicPlayerEngine.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const fifoBuffer = useRef<Float32Array>(new Float32Array(NUM_BARS).fill(0.04));
  const lastFrameTime = useRef<number>(0);
  const titleRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to global player state
  useEffect(() => {
    return musicPlayerEngine.subscribe(setPlayerState);
  }, []);

  const {
    currentTrack,
    isPlaying,
    isBuffering,
    nowPlaying,
    currentPalette,
    beatPulse,
  } = playerState;

  const isActive = isPlaying || isBuffering;

  // ── Controls ────────────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    soundFX.playClick();
    musicPlayerEngine.togglePlay();
  }, []);

  const handleNextTrack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextTrack();
  }, []);

  const handlePrevTrack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.prevTrack();
  }, []);

  const handleColorPop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextPalette();
  }, []);

  // ── Full display name ───────────────────────────────────────────────────
  const displayTitle = isBuffering
    ? "TUNING STREAM..."
    : nowPlaying || currentTrack.title;
  const displaySub = nowPlaying ? currentTrack.title : currentTrack.artist;

  // ── CIRCULAR MULTICOLOR SPECTRUM VISUALIZER ─────────────────────────────
  // Renders a radial spectrum ring around a spinning vinyl disc center.
  // Optimized: throttled to ~30fps, uses typed arrays, minimal GC pressure.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // High-DPI setup — clamp pixel ratio for perf
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const innerR = 38;  // vinyl disc radius
    const outerR = 82;  // spectrum ring outer edge

    // Multicolor palette — 6 distinct hues cycling across spectrum bars
    const spectrumColors = [
      "#FF0055", "#FF6B00", "#FFD600", "#00F2FE", "#9D4EDD", "#F72585",
      "#10B981", "#4FACFE", "#FF007F", "#FFB703", "#E0AAFF", "#34D399",
    ];

    let vinylAngle = 0;

    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);

      // Throttle to ~30fps for performance
      const elapsed = time - lastFrameTime.current;
      if (elapsed < 32) return;
      lastFrameTime.current = time;

      const dt = elapsed / 1000;

      // ── Procedural energy synthesis ──────────────────────────────────
      let energy = 0.04;
      if (isActive) {
        const t = time / 1000;
        const isSynth = currentTrack.badge.includes("SYNTH") || currentTrack.badge.includes("RETRO") || currentTrack.badge.includes("VAPOR");
        const bpm = isSynth ? 122 : currentTrack.id.includes("regardless") ? 128 : 88;
        const beatCycle = (t * (bpm / 60)) % 4;

        const kick = Math.pow(Math.max(0, Math.sin(beatCycle * Math.PI)), 7) * 0.85;
        const snare = Math.pow(Math.max(0, Math.sin((beatCycle - 1) * Math.PI)), 10) * 0.65;
        const arpHum = Math.sin(t * (isSynth ? 44 : 32)) > 0.4 ? 0.35 : 0.06;
        const bass = (Math.sin(t * 4.8) * 0.5 + 0.5) * 0.4;

        energy = Math.min(1.0, 0.08 + kick + snare + arpHum + bass);

        if (energy > 0.68) {
          musicPlayerEngine.triggerBeatPulse(energy);
        }
      }

      // FIFO buffer shift
      if (isActive) {
        for (let i = 0; i < NUM_BARS - 1; i++) {
          fifoBuffer.current[i] = fifoBuffer.current[i + 1];
        }
        fifoBuffer.current[NUM_BARS - 1] = energy;
      } else {
        for (let i = 0; i < NUM_BARS; i++) {
          fifoBuffer.current[i] = Math.max(0.04, fifoBuffer.current[i] - dt * 0.8);
        }
      }

      // Spin vinyl when active
      if (isActive) {
        vinylAngle += dt * 1.8;
      }

      // ── Clear & Draw ────────────────────────────────────────────────
      ctx.clearRect(0, 0, size, size);

      // 1. Outer ambient glow ring
      if (isActive) {
        const glowGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR + 10);
        glowGrad.addColorStop(0, "transparent");
        glowGrad.addColorStop(0.6, currentPalette.shadow);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR + 10, 0, TWO_PI);
        ctx.fill();
      }

      // 2. Multicolor radial spectrum bars
      const barArc = TWO_PI / NUM_BARS;
      const barGap = 0.015;

      for (let i = 0; i < NUM_BARS; i++) {
        const val = fifoBuffer.current[i];
        const barLen = Math.max(3, val * (outerR - innerR - 4));
        const angle = i * barArc - Math.PI / 2;

        const colorIdx = i % spectrumColors.length;
        const color = isActive ? spectrumColors[colorIdx] : "rgba(255,255,255,0.12)";

        const startR = innerR + 6;
        const endR = startR + barLen;

        const x1 = cx + Math.cos(angle) * startR;
        const y1 = cy + Math.sin(angle) * startR;
        const x2 = cx + Math.cos(angle) * endR;
        const y2 = cy + Math.sin(angle) * endR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, (barArc * startR) - barGap * startR);
        ctx.lineCap = "round";
        ctx.globalAlpha = isActive ? 0.65 + val * 0.35 : 0.25;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // 3. Vinyl disc center
      const vinylGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, innerR);
      vinylGrad.addColorStop(0, isActive ? currentPalette.glow : "#444");
      vinylGrad.addColorStop(0.35, isActive ? currentPalette.pillBg : "#1a1a2e");
      vinylGrad.addColorStop(0.7, "#0a0a14");
      vinylGrad.addColorStop(1, isActive ? currentPalette.pillBg : "#111");

      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, TWO_PI);
      ctx.fillStyle = vinylGrad;
      ctx.fill();

      // Vinyl grooves (spinning rings)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(vinylAngle);
      for (let r = 10; r < innerR - 2; r += 5) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TWO_PI);
        ctx.strokeStyle = `rgba(255,255,255,${isActive ? 0.08 : 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Center label dot
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, TWO_PI);
      ctx.fillStyle = isActive ? currentPalette.glow : "#555";
      ctx.fill();
      ctx.restore();

      // 4. Thin outer ring border
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - 2, 0, TWO_PI);
      ctx.strokeStyle = isActive ? currentPalette.border : "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isBuffering, currentTrack, currentPalette]);

  return (
    <div className="w-[min(92vw,26rem)] pointer-events-auto select-none">
      <div
        className="relative flex flex-col items-center rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-300"
        style={{
          borderColor: isActive ? currentPalette.border : "rgba(255, 255, 255, 0.10)",
          backgroundColor: "rgba(7, 8, 13, 0.88)",
          boxShadow: isActive
            ? `0 0 ${20 + beatPulse * 30}px ${currentPalette.shadow}, 0 12px 40px rgba(0,0,0,0.5)`
            : "0 12px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* ── TOP: Circular Vinyl Visualizer ─────────────────────────────── */}
        <div className="relative pt-4 pb-1 flex items-center justify-center">
          {/* Prev button — left side of disc */}
          <button
            onClick={handlePrevTrack}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/10"
            title="Previous Station"
            aria-label="Previous Station"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Canvas disc */}
          <button
            onClick={handleTogglePlay}
            className="relative z-10 focus:outline-none group"
            title={isPlaying ? "Click to Pause" : "Click to Play"}
            aria-label={isPlaying ? "Pause track" : "Play track"}
          >
            <canvas
              ref={canvasRef}
              className="block"
              style={{ width: 180, height: 180 }}
            />

            {/* Play/Pause overlay on disc center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{
                  background: isActive ? `${currentPalette.glow}22` : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${isActive ? currentPalette.border : "rgba(255,255,255,0.15)"}`,
                  backdropFilter: "blur(4px)",
                }}
              >
                {isBuffering ? (
                  <Loader2 size={16} className="animate-spin text-amber-300" />
                ) : isPlaying ? (
                  <Pause
                    size={14}
                    style={{ color: currentPalette.glow, fill: currentPalette.glow }}
                  />
                ) : (
                  <Play size={14} className="text-zinc-200 fill-zinc-200 ml-0.5" />
                )}
              </div>
            </div>
          </button>

          {/* Next button — right side of disc */}
          <button
            onClick={handleNextTrack}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/10"
            title="Next Station"
            aria-label="Next Station"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ── BOTTOM: Track Info Bar ─────────────────────────────────────── */}
        <div className="w-full px-4 pb-3 pt-1 flex items-center gap-2.5 min-w-0">
          {/* Live indicator + Track name */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Full title — auto-marquee when overflowing */}
            <div
              ref={titleRef}
              className="font-semibold text-[12px] text-zinc-100 flex items-center gap-1.5 overflow-hidden"
            >
              {nowPlaying && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
              )}
              <span
                className="whitespace-nowrap"
                style={{
                  animation: displayTitle.length > 30 && isActive
                    ? "radio-marquee 12s linear infinite"
                    : "none",
                }}
                title={displayTitle}
              >
                {displayTitle}
              </span>
            </div>
            {/* Subtitle — station name / artist */}
            <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5 tracking-wide">
              {displaySub}
            </div>
          </div>

          {/* Genre badge */}
          <span
            className="shrink-0 text-[9px] px-2 py-0.5 rounded-md font-mono font-bold tracking-wider uppercase flex items-center gap-1 border max-w-[5.5rem] overflow-hidden"
            style={{
              backgroundColor: currentPalette.badgeBg,
              color: currentPalette.badgeText,
              borderColor: currentPalette.border,
            }}
          >
            {currentTrack.type === "stream" && <Radio size={8} className={isBuffering ? "animate-ping text-amber-300" : "animate-pulse"} />}
            {currentTrack.type === "procedural" && <Sparkles size={8} />}
            <span className="truncate">{currentTrack.badge}</span>
          </span>

          {/* Color cycle button */}
          <button
            onClick={handleColorPop}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-transform hover:scale-110 active:scale-90"
            title={`Theme: ${currentPalette.name}`}
            aria-label="Change visualizer color"
          >
            <span
              className="block w-3 h-3 rounded-full shadow-md"
              style={{
                backgroundColor: currentPalette.glow,
                boxShadow: `0 0 8px ${currentPalette.glow}`,
              }}
            />
          </button>
        </div>
      </div>

      {/* Inline keyframe for title marquee — avoids adding to global CSS */}
      <style>{`
        @keyframes radio-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-60%); }
        }
      `}</style>
    </div>
  );
};
