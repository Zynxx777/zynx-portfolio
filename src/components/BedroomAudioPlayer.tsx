import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Plus,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Loader2,
  X,
  Disc3,
} from "lucide-react";
import { soundFX } from "../utils/audioFX";
import {
  musicPlayerEngine,
  type PlayerState,
  BEDROOM_PLAYLIST,
} from "../utils/musicPlayerEngine";

interface BedroomAudioPlayerProps {
  onClose?: () => void;
  onOpenTabletPlayer?: () => void;
  onOpenAddSong?: () => void;
  variant?: "minimal" | "full";
}

function resolveMinimalPickerLabel(trackIndex: number, fallbackArtist: string, type: string): string {
  try {
    const saved = localStorage.getItem("zynx_player_custom_picks_v1");
    if (saved) {
      const picks = JSON.parse(saved);
      if (Array.isArray(picks)) {
        const match = picks.find((p) => p && p.playlistIndex === trackIndex && typeof p.pickedBy === "string");
        if (match?.pickedBy) {
          return match.pickedBy.toLowerCase().includes("favourite")
            ? match.pickedBy
            : `${match.pickedBy}'s favourite`;
        }
      }
    }
  } catch {}
  if (type === "track") return "Joshua's favourite";
  return `${fallbackArtist} mix`;
}

export const BedroomAudioPlayer: React.FC<BedroomAudioPlayerProps> = ({
  onClose,
  onOpenTabletPlayer,
  onOpenAddSong,
  variant = "full",
}) => {
  const [playerState, setPlayerState] = useState<PlayerState>(() => musicPlayerEngine.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to persistent player state
  useEffect(() => {
    return musicPlayerEngine.subscribe(setPlayerState);
  }, []);

  const {
    trackIndex,
    currentTrack,
    isPlaying,
    isBuffering,
    nowPlaying,
    currentPalette,
    beatPulse,
    volume,
  } = playerState;

  const isActive = isPlaying || isBuffering;

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    soundFX.playClick();
    musicPlayerEngine.togglePlay();
  }, []);

  const handleNextTrack = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextTrack();
  }, []);

  const handlePrevTrack = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.prevTrack();
  }, []);

  const handleSelectTrack = useCallback((idx: number) => {
    soundFX.playClick();
    musicPlayerEngine.startTrack(idx, true);
  }, []);

  const handleColorCycle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    musicPlayerEngine.nextPalette();
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    musicPlayerEngine.setVolume(val);
  }, []);

  const handleVolumeMuteToggle = useCallback(() => {
    soundFX.playClick();
    if (volume > 0.01) {
      musicPlayerEngine.setVolume(0);
    } else {
      musicPlayerEngine.setVolume(0.75);
    }
  }, [volume]);

  // Display texts
  const displayTitle = isBuffering
    ? "Tuning Frequency..."
    : nowPlaying || currentTrack.title;
  const displaySub = nowPlaying ? currentTrack.title : currentTrack.artist;

  // Prism Tuner: a compact, low-cost spectrum that keeps its animation alive
  // between player updates instead of rebuilding the canvas on every beat.
  const visualizerStateRef = useRef({ isActive, currentTrack, beatPulse });
  useEffect(() => {
    visualizerStateRef.current = { isActive, currentTrack, beatPulse };
  }, [isActive, currentTrack, beatPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let barCount = 0;
    let hues: number[] = [];
    let frameId = 0;
    let lastFrameTime = 0;
    let phase = 0;
    let energy = 0.16;
    let isInView = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = window.innerWidth < 640 ? 1000 / 24 : 1000 / 40;

    const draw = (time: number, animate: boolean) => {
      if (width < 1 || height < 1) return;
      const state = visualizerStateRef.current;
      const active = state.isActive;
      const t = time / 1000;
      const beat = active ? Math.max(0, Math.sin(t * (state.currentTrack.badge.includes("SYNTH") ? 13 : 9))) : 0;
      const targetEnergy = active ? 0.58 + state.beatPulse * 0.16 + beat * 0.22 : 0.32;
      energy += (targetEnergy - energy) * (animate ? 0.12 : 1);
      if (animate) phase += active ? 0.035 : 0.012;

      ctx.clearRect(0, 0, width, height);
      const baseline = height * 0.78;
      const gutter = 10;
      const gap = width < 260 ? 2 : 3;
      const usableWidth = Math.max(1, width - gutter * 2);
      const barWidth = Math.max(1.5, (usableWidth - gap * (barCount - 1)) / barCount);
      const maxHeight = height * 0.63;

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(gutter, baseline, usableWidth, 1);
      for (let index = 0; index < barCount; index += 1) {
        const frequency = index / Math.max(1, barCount - 1);
        const envelope = 0.22 + Math.pow(Math.sin(frequency * Math.PI), 0.72) * 0.78;
        const wave = Math.abs(
          Math.sin(index * 0.67 + phase) * 0.64 +
          Math.sin(index * 0.29 - phase * 1.7) * 0.36
        );
        const kick = active ? beat * (0.12 + frequency * 0.08) : 0;
        const barHeight = Math.max(2, maxHeight * envelope * (0.12 + wave * energy * 0.84 + kick));
        const x = gutter + index * (barWidth + gap);
        ctx.fillStyle = `hsl(${hues[index]}, 92%, ${active ? 66 : 52}%)`;
        ctx.fillRect(x, baseline - barHeight, barWidth, barHeight);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.15 : 1.4);
      if (width < 1 || height < 1) return;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      barCount = Math.max(24, Math.min(64, Math.floor(width / 6)));
      hues = Array.from({ length: barCount }, (_, index) => (index / barCount) * 330);
      draw(performance.now(), false);
    };

    const animate = (time: number) => {
      frameId = 0;
      if (document.hidden || !isInView) return;
      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time;
        draw(time, true);
      }
      frameId = requestAnimationFrame(animate);
    };
    const start = () => {
      if (!reducedMotion && !document.hidden && isInView && !frameId) {
        frameId = requestAnimationFrame(animate);
      }
    };
    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };
    const handleVisibility = () => document.hidden ? stop() : start();
    const viewportObserver = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          isInView = entry.isIntersecting;
          if (isInView) start();
          else stop();
        }, { threshold: 0.01 })
      : null;
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(resize)
      : null;

    resize();
    viewportObserver?.observe(canvas);
    resizeObserver?.observe(canvas.parentElement ?? canvas);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      viewportObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (variant === "minimal") {
    const pickedTitle = resolveMinimalPickerLabel(
      trackIndex,
      currentTrack.artist,
      currentTrack.type
    );
    const trackSubtitle = isBuffering
      ? "Tuning frequency..."
      : nowPlaying || currentTrack.title;

    return (
      <div
        className="w-[214px] sm:w-[228px] pointer-events-auto select-none flex flex-col items-center gap-1.5"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          role={onOpenTabletPlayer ? "button" : undefined}
          tabIndex={onOpenTabletPlayer ? 0 : undefined}
          onClick={() => {
            if (!onOpenTabletPlayer) return;
            soundFX.playClick();
            onOpenTabletPlayer();
          }}
          onKeyDown={(e) => {
            if (!onOpenTabletPlayer) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              soundFX.playClick();
              onOpenTabletPlayer();
            }
          }}
          title={onOpenTabletPlayer ? "Open Zynx Player on iPad" : undefined}
          className={`w-full rounded-xl bg-[#18191e]/82 hover:bg-[#1f2128]/90 backdrop-blur-2xl border border-white/15 px-2 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.45)] flex items-center gap-2 transition ${
            onOpenTabletPlayer ? "cursor-pointer" : ""
          }`}
        >
          {/* Compact vinyl / album art tile */}
          <div className="w-8 h-8 rounded-md bg-zinc-950 border border-white/15 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
            <div
              className="absolute inset-0 opacity-35"
              style={{
                background: `radial-gradient(circle at center, ${currentPalette.glow} 0%, transparent 72%)`,
              }}
            />
            <div
              className={`w-6 h-6 rounded-full border border-white/15 bg-black flex items-center justify-center ${
                isActive ? "animate-spin [animation-duration:4s]" : ""
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-800 ring-1 ring-white/30" />
            </div>
          </div>

          {/* 2-line minimal title & track */}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] font-semibold text-white truncate leading-tight">
              {pickedTitle}
            </p>
            <p className="text-[10px] text-white/60 truncate leading-tight mt-0.5">
              {trackSubtitle}
            </p>
          </div>

          {/* Compact Play/Pause & Next controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlay();
              }}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              className="w-6 h-6 rounded-full bg-white/12 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95"
            >
              {isBuffering ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNextTrack}
              aria-label="Next song"
              className="w-6 h-6 rounded-full hover:bg-white/15 text-white/75 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
        </div>

        {(onOpenAddSong || onOpenTabletPlayer) && (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              (onOpenAddSong ?? onOpenTabletPlayer)?.();
            }}
            className="w-full py-1 px-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 text-[10.5px] font-medium shadow-[0_6px_18px_rgba(0,0,0,0.32)] ring-1 ring-black/10 flex items-center justify-center gap-1 transition active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Add your favourite song</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="w-[min(92vw,22rem)] sm:w-[26rem] pointer-events-auto select-none transition-all duration-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* ── iPHONE FROSTED GLASS MEDIA CAPSULE ─────────────────────────── */}
      <div
        className="relative flex flex-col rounded-[24px] sm:rounded-[32px] overflow-hidden backdrop-blur-3xl transition-all duration-500"
        style={{
          background: "linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(18, 20, 32, 0.72) 40%, rgba(8, 10, 18, 0.88) 100%)",
          borderColor: isActive ? currentPalette.border : "rgba(255, 255, 255, 0.16)",
          borderWidth: "1px",
          borderStyle: "solid",
          boxShadow: `
            0 24px 60px -12px rgba(0, 0, 0, 0.75),
            0 0 ${isActive ? 28 + beatPulse * 32 : 12}px ${currentPalette.shadow},
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {/* Subtle Apple-style gloss sheen overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.08] via-transparent to-black/20 rounded-[24px] sm:rounded-[32px]" />

        {/* ── 1. TOP HEADER: Status Bar & Dynamic Island Badge ─────────── */}
        <div className="relative z-10 px-3 sm:px-5 pt-3 sm:pt-4 pb-1 sm:pb-2 flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: FM Radio / Live Broadcast Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-sm">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-zinc-500"}`} />
              <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-200">
                {currentTrack.type === "stream" ? "98.5 FM LIVE" : "STEREO LAB"}
              </span>
            </div>

            {/* Station Genre Badge */}
            <span
              className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase truncate border max-w-[6rem] sm:max-w-[7.5rem]"
              style={{
                backgroundColor: currentPalette.badgeBg,
                color: currentPalette.badgeText,
                borderColor: currentPalette.border,
              }}
            >
              {currentTrack.badge}
            </span>
          </div>

          {/* Right: Open Full Player, Color Cycle Pill & Optional Close Button */}
          <div className="flex items-center gap-1.5">
            {onOpenTabletPlayer && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onOpenTabletPlayer();
                }}
                className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-zinc-900 text-[10px] font-semibold shadow-sm flex items-center gap-1 transition active:scale-95"
                title="Open Zynx Player on iPad"
              >
                <Disc3 size={11} className="text-[#2F5BEA]" />
                <span>Mixtape</span>
              </button>
            )}
            <button
              onClick={handleColorCycle}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-transform active:scale-90"
              title={`Aura: ${currentPalette.name} (Click to switch)`}
              aria-label="Cycle visualizer theme aura"
            >
              <span
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-sm transition-all"
                style={{
                  backgroundColor: currentPalette.glow,
                  boxShadow: `0 0 10px ${currentPalette.glow}`,
                }}
              />
            </button>

            {onClose && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-300 hover:text-white transition-transform active:scale-90"
                title="Minimize player"
                aria-label="Close FM Radio"
              >
                <X size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── 2. BUTTERY SMOOTH WAVY VISUALIZER DISPLAY ────────────────── */}
        <div className="relative z-10 px-3 sm:px-4 py-0.5 sm:py-1">
          <div className="relative w-full h-[54px] sm:h-[95px] rounded-xl sm:rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner flex items-center justify-center">
            {/* Ambient Background Aura behind the wave */}
            <div
              className="absolute inset-0 opacity-40 blur-xl transition-all duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${currentPalette.glow}55 0%, transparent 75%)`,
              }}
            />

            {/* Live Interactive Wave Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
            />

            {/* Center Subtle Freq Watermark */}
            <div className="absolute top-1.5 left-2.5 pointer-events-none text-[8px] sm:text-[9px] font-mono tracking-widest text-white/30 uppercase flex items-center gap-1">
              <Radio size={9} className="text-white/40" />
              <span>PRISM TUNER · CH {String(trackIndex + 1).padStart(2, "0")}</span>
            </div>

            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 gap-1.5 text-amber-300 text-[11px] font-mono">
                <Loader2 size={14} className="animate-spin" />
                <span>SYNCING STREAM</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. TRACK & STATION METADATA ──────────────────────────────── */}
        <div className="relative z-10 px-3 sm:px-5 pt-2 sm:pt-3 pb-0.5 sm:pb-1 flex items-center gap-2.5 sm:gap-3.5">
          {/* iOS Squircle Album Tile */}
          <div
            className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border shadow-lg transition-transform duration-300"
            style={{
              borderColor: isActive ? currentPalette.border : "rgba(255, 255, 255, 0.15)",
              background: `linear-gradient(135deg, ${currentPalette.pillBg} 0%, rgba(20, 20, 30, 0.95) 100%)`,
              transform: isActive ? "scale(1.03)" : "scale(0.96)",
            }}
          >
            <Disc3
              size={18}
              className={`sm:w-6 sm:h-6 transition-all duration-500 ${isActive ? "text-white animate-spin [animation-duration:6s]" : "text-zinc-500"}`}
              style={{
                color: isActive ? currentPalette.glow : undefined,
                filter: isActive ? `drop-shadow(0 0 6px ${currentPalette.glow})` : undefined,
              }}
            />
          </div>

          {/* Track Titles & Live Marquee */}
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-xs sm:text-[13px] text-white tracking-tight overflow-hidden"
              title={displayTitle}
              aria-label={`Now playing: ${displayTitle}`}
            >
              <span className={`inline-flex whitespace-nowrap ${displayTitle.length > 24 && isActive ? "fm-marquee" : ""}`}>
                <span>{displayTitle}</span>
                {displayTitle.length > 24 && isActive && <span aria-hidden="true">{displayTitle}</span>}
              </span>
            </div>

            <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate mt-0.5 tracking-normal" title={displaySub}>
              {displaySub}
            </p>
          </div>
        </div>

        {/* ── 4. iPHONE MEDIA TRANSPORT CONTROLS ───────────────────────── */}
        <div className="relative z-10 px-3 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-center gap-4 sm:gap-6">
          {/* Previous Station */}
          <button
            onClick={handlePrevTrack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white transition-all active:scale-90 shadow-md backdrop-blur-md"
            style={{ touchAction: "manipulation" }}
            title="Previous Radio Station"
            aria-label="Previous track"
          >
            <SkipBack size={14} className="sm:w-4 sm:h-4" />
          </button>

          {/* Primary iOS Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="w-11 h-11 sm:w-14 sm:h-14 p-2.5 sm:p-3.5 rounded-full flex items-center justify-center text-black font-bold transition-all active:scale-95 shadow-xl group"
            style={{
              backgroundColor: isActive ? "#FFFFFF" : currentPalette.glow,
              boxShadow: `0 8px 24px -4px ${isActive ? "rgba(255,255,255,0.4)" : currentPalette.shadow}`,
              touchAction: "manipulation",
            }}
            title={isPlaying ? "Pause Broadcast" : "Tune in & Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isBuffering ? (
              <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause size={16} className="sm:w-5 sm:h-5 fill-black text-black" />
            ) : (
              <Play size={16} className="sm:w-5 sm:h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next Station */}
          <button
            onClick={handleNextTrack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 hover:text-white transition-all active:scale-90 shadow-md backdrop-blur-md"
            style={{ touchAction: "manipulation" }}
            title="Next Radio Station"
            aria-label="Next track"
          >
            <SkipForward size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* ── 5. iPHONE SOUND & VOLUME SLIDER ──────────────────────────── */}
        <div className="relative z-10 px-3 sm:px-6 pt-0.5 sm:pt-1 pb-1 sm:pb-2 flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleVolumeMuteToggle}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            style={{ touchAction: "manipulation" }}
            title={volume === 0 ? "Unmute" : "Mute"}
            aria-label="Toggle mute"
          >
            {volume === 0 ? (
              <VolumeX size={14} className="sm:w-3.5 sm:h-3.5" />
            ) : (
              <Volume1 size={14} className="sm:w-3.5 sm:h-3.5" />
            )}
          </button>

          {/* Custom iOS Frosted Slider Track */}
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 sm:h-1.5 appearance-none bg-white/15 rounded-full outline-none cursor-pointer accent-white transition-all hover:bg-white/25"
              aria-label="Master Radio Volume"
            />
          </div>

          <div className="text-zinc-400 p-1">
            <Volume2 size={14} className="sm:w-3.5 sm:h-3.5" />
          </div>
        </div>

        {/* ── 6. QUICK STATION PRESETS (Scrollable Chips) ──────────────── */}
        <div
          className="relative z-10 px-2.5 sm:px-4 pt-1 pb-2 sm:pb-3.5 border-t border-white/[0.08] flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar"
          style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom, 0.6rem))" }}
        >
          {BEDROOM_PLAYLIST.map((trk, idx) => {
            const isSelected = trackIndex === idx;
            return (
              <button
                key={trk.id}
                onClick={() => handleSelectTrack(idx)}
                className={`flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono transition-all border ${
                  isSelected
                    ? "bg-white text-black font-bold border-white shadow-md shadow-white/20"
                    : "bg-white/5 hover:bg-white/15 text-zinc-300 border-white/10"
                }`}
                style={{ touchAction: "manipulation" }}
                title={`Tune into ${trk.title}`}
              >
                {trk.type === "stream" && <Radio size={8} className="inline mr-1 -mt-0.5" />}
                {trk.type === "procedural" && <Sparkles size={8} className="inline mr-1 -mt-0.5" />}
                <span>{trk.badge.replace("SYNTHWAVE", "NIGHTRIDE").replace("CHILL RETRO", "CHILL")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marquee Keyframes */}
      <style>{`
        .fm-marquee { gap: 2rem; animation: fm-marquee 18s linear infinite; }
        @keyframes fm-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
