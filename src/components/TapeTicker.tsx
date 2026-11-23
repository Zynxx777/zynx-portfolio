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
    { label: "ARCH LINUX ADMINISTRATION", tag: "systems" },
    { label: "PACMAN & PACTREE WORKFLOWS", tag: "systems" },
    { label: "S.M. ENGLISH SCHOOL PLATFORM", tag: "web" },
    { label: "ASTRO & TAILWIND CSS", tag: "web" },
    { label: "REACT & TYPESCRIPT", tag: "web" },
    { label: "THREE.JS WEBGL INTERFACES", tag: "web" },
    { label: "B.E. ELECTRONICS & COMMUNICATION", tag: "ece" },
    { label: "EMBEDDED SYSTEMS & VERILOG", tag: "ece" },
    { label: "7CHATS BUG BOUNTY RECOGNITION", tag: "security" },
    { label: "AUDIO PRODUCTION & TEACHING", tag: "creative" },
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
      className={`relative w-full overflow-hidden border-y border-white/[0.08] bg-[#07080d]/90 backdrop-blur-xl py-3 select-none ${className}`}
    >
      {/* Dynamic Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-20 sm:w-28 bg-gradient-to-r from-[#07080d] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-20 sm:w-28 bg-gradient-to-l from-[#07080d] to-transparent z-10" />

      {/* Marquee Track */}
      <div
        className={`flex items-center gap-4 whitespace-nowrap will-change-transform ${
          isHovered ? "animate-marquee-slow" : "animate-marquee"
        }`}
        style={{
          width: "max-content",
        }}
      >
        {loopItems.map((item, idx) => (
          <button
            type="button"
            key={`${item.label}-${idx}`}
            onClick={() => {
              soundFX.playClick();
              if (onTagClick) onTagClick(item.tag);
            }}
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/40 bg-white/[0.025] hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-300 transition-colors" />
            <span className="font-mono text-[11px] tracking-[0.12em] text-zinc-300 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
