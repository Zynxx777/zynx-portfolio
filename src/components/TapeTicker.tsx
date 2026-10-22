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
    { label: "ARCH LINUX DAILY DESKTOP USE", tag: "systems", icon: "⚡" },
    { label: "PACMAN UPDATE CONFIGURATION", tag: "systems", icon: "📦" },
    { label: "PACKAGE DEPENDENCY REVIEW WITH PACTREE", tag: "systems", icon: "🔎" },
    { label: "S.M. ENGLISH SCHOOL WEBSITE", tag: "web", icon: "🏫" },
    { label: "ASTRO & TAILWIND CSS", tag: "web", icon: "🌐" },
    { label: "AI-ASSISTED REACT PORTFOLIO WORK", tag: "web", icon: "🧩" },
    { label: "RESPONSIVE UI ITERATION", tag: "web", icon: "📱" },
    { label: "B.E. ELECTRONICS & COMMUNICATION", tag: "ece", icon: "📟" },
    { label: "EMBEDDED SYSTEMS COURSEWORK", tag: "ece", icon: "🔌" },
    { label: "7CHATS BUG BOUNTY RECOGNITION", tag: "security", icon: "🛡" },
    { label: "MUSIC TEACHING · PART-TIME", tag: "creative", icon: "🎹" },
    { label: "BUILDING PROGRAMMING FOUNDATIONS", tag: "learning", icon: "💻" },
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
      className={`relative w-full overflow-hidden border-y border-white/[0.08] bg-[#070812]/80 backdrop-blur-xl py-3.5 select-none ${className}`}
    >
      {/* Dynamic Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-[#07080d] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-[#07080d] to-transparent z-10" />

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
            className="group flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/[0.03] hover:bg-white/[0.08] hover:shadow-[0_0_15px_rgba(0,242,254,0.15)] transition-all cursor-pointer"
          >
            <span className="text-xs group-hover:scale-125 transition-transform">
              {item.icon}
            </span>
            <span className="font-mono text-xs tracking-wider text-zinc-300 group-hover:text-cyan-200 transition-colors">
              {item.label}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 group-hover:bg-cyan-400 animate-pulse ml-1" />
          </div>
        ))}
      </div>
    </div>
  );
};
