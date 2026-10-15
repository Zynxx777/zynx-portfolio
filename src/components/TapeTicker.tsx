import React, { useRef, useState } from "react";
import { soundFX } from "../utils/audioFX";

interface TapeTickerProps {
  onTagClick?: (tag: string) => void;
  className?: string;
}

export const TapeTicker: React.FC<TapeTickerProps> = ({ onTagClick, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tapeItems = [
    { label: "ARCH LINUX (ZEN KERNEL)", tag: "systems", icon: "⚡" },
    { label: "CAN BUS 2.0B // 8,000 FRAMES/SEC", tag: "automotive", icon: "🏎" },
    { label: "ANDROID AUTOMOTIVE (AAOS) & VHAL", tag: "automotive", icon: "🤖" },
    { label: "7CHATS BUG BOUNTY WINNER (AUTH BYPASS)", tag: "security", icon: "🛡" },
    { label: "8,000 PARTICLE RELATIVISTIC BLACK HOLE", tag: "frontend", icon: "🪐" },
    { label: "GLSL SHADERS & S-CURVE DEPTH WAVE", tag: "frontend", icon: "✨" },
    { label: "VERILOG RTL DIGITAL SYNTHESIS", tag: "automotive", icon: "📟" },
    { label: "FL STUDIO 21 SIGNATURE (SOUND LAB)", tag: "security", icon: "🎹" },
    { label: "MCP2515 SPI HARDWARE TRANSCEIVER", tag: "automotive", icon: "🔌" },
    { label: "WEB AUDIO API REAL-TIME DSP", tag: "frontend", icon: "🔊" },
    { label: "LUXOFT COCKPIT DOMAIN CONTROLLER", tag: "automotive", icon: "🎛" },
    { label: "PROCFS & KERNEL MEMORY TRACING", tag: "systems", icon: "💻" },
  ];

  // Duplicate items for continuous seamless loop
  const loopItems = [...tapeItems, ...tapeItems];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setIsHovered(true);
        soundFX.playHover();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden border-y border-white/10 bg-[#07080f]/90 py-3.5 select-none ${className}`}
    >
      {/* Dynamic Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#07080d] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#07080d] to-transparent z-10" />

      {/* Marquee Track */}
      <div
        className={`flex items-center gap-6 whitespace-nowrap will-change-transform ${
          isHovered ? "animate-marquee-slow" : "animate-marquee"
        }`}
        style={{
          width: "max-content",
        }}
      >
        {loopItems.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            onClick={() => {
              soundFX.playClick();
              if (onTagClick) onTagClick(item.tag);
            }}
            className="group flex items-center gap-3 px-3 py-1 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <span className="text-xs group-hover:scale-125 transition-transform">
              {item.icon}
            </span>
            <span className="font-mono text-xs tracking-wider text-zinc-300 group-hover:text-white transition-colors">
              {item.label}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 group-hover:bg-cyan-400 animate-pulse ml-1" />
          </div>
        ))}
      </div>
    </div>
  );
};
