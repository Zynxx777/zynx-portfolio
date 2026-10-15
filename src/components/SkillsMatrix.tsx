import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Terminal,
  Search,
  CheckCircle2,
  X,
  Copy,
  Zap,
  Eye,
} from "lucide-react";
import { ALL_SKILLS, SKILL_CATEGORIES, type DetailedSkill } from "../data/skillsData";
import { soundFX } from "../utils/audioFX";

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Zero University Card with Specular Mouse Sheen & Tech Corner Crosshairs
// ─────────────────────────────────────────────────────────────────────────────
interface SkillCardProps {
  skill: DetailedSkill;
  onInspect: (skill: DetailedSkill) => void;
}

const ZeroUniversityCard: React.FC<SkillCardProps> = ({ skill, onInspect }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Expert":
        return {
          bg: "bg-emerald-950/60 border-emerald-400/40 text-emerald-300",
          dot: "bg-emerald-400",
        };
      case "Advanced":
        return {
          bg: "bg-cyan-950/60 border-cyan-400/40 text-cyan-300",
          dot: "bg-cyan-400",
        };
      default:
        return {
          bg: "bg-purple-950/60 border-purple-400/40 text-purple-300",
          dot: "bg-purple-400",
        };
    }
  };

  const badgeStyle = getLevelBadge(skill.level);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        soundFX.playZoom();
        onInspect(skill);
      }}
      onMouseEnter={() => soundFX.playHover()}
      className="group relative p-5 rounded-2xl bg-[#090d18]/70 backdrop-blur-md border border-white/10 hover:border-cyan-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Dynamic Specular Sheen (Jesper Landberg & Zero University signature) */}
      {mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-200"
          style={{
            background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.16), transparent 70%)`,
          }}
        />
      )}

      {/* Cyber Corner Tech Crosshairs (+) */}
      <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-700 group-hover:text-cyan-400/50 transition-colors pointer-events-none">
        +
      </span>
      <span className="absolute top-2 right-2 text-[8px] font-mono text-zinc-700 group-hover:text-cyan-400/50 transition-colors pointer-events-none">
        +
      </span>
      <span className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-700 group-hover:text-cyan-400/50 transition-colors pointer-events-none">
        +
      </span>
      <span className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-700 group-hover:text-cyan-400/50 transition-colors pointer-events-none">
        +
      </span>

      <div>
        {/* Top Header: Logo + Level Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center p-2.5 flex-shrink-0 group-hover:border-cyan-400/70 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all duration-300">
            <img
              src={skill.icon}
              alt={skill.name}
              className="w-full h-full object-contain filter drop-shadow"
              loading="lazy"
              onError={(e) => {
                // Fallback icon if image fails
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${badgeStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badgeStyle.dot}`} />
              <span>{skill.level}</span>
            </span>

            <span className="text-[9px] font-mono text-zinc-500">
              {skill.proficiency}% PROFICIENCY
            </span>
          </div>
        </div>

        {/* Title and Short Description */}
        <div className="mt-4">
          <h4 className="font-display font-medium text-base text-white group-hover:text-cyan-200 transition-colors tracking-tight">
            {skill.name}
          </h4>
          <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed line-clamp-2">
            {skill.detail}
          </p>
        </div>

        {/* Tags / Telemetry pills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 group-hover:border-cyan-400/30 transition-colors"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-500">
              +{skill.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Proficiency Bar & Inspection Action */}
      <div className="mt-5 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1.5">
          <span className="uppercase tracking-wider">{skill.categoryLabel}</span>
          <span className="text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Eye size={11} />
            <span>Inspect Spec</span>
          </span>
        </div>

        {/* Mini Segmented Bar */}
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 rounded-full transition-all duration-700 ease-out group-hover:brightness-125"
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Diagnostic Spec Modal (Zero University Low-Level Telemetry Drawer)
// ─────────────────────────────────────────────────────────────────────────────
interface SpecModalProps {
  skill: DetailedSkill | null;
  onClose: () => void;
}

const DiagnosticSpecModal: React.FC<SpecModalProps> = ({ skill, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!skill) return null;

  const copyCommand = () => {
    soundFX.playClick();
    navigator.clipboard.writeText(skill.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={skill.name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-[#090d18] border border-cyan-400/40 p-6 sm:p-8 shadow-2xl space-y-6 text-left"
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/80 border border-cyan-400/40 p-3 flex items-center justify-center shadow-lg">
              <img
                src={skill.icon}
                alt={skill.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                <span>{skill.categoryLabel}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-emerald-400">ACTIVE SUBSYSTEM</span>
              </div>
              <h3 className="text-2xl font-display font-medium text-white tracking-tight">
                {skill.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            aria-label="Close specification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            ENGINEERING SPECIFICATION
          </span>
          <p className="text-sm text-zinc-200 font-sans leading-relaxed">
            {skill.detail}
          </p>
        </div>

        {/* Production Deployment Highlight */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-400/25 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
            <Zap size={13} className="text-cyan-400" />
            <span className="font-bold">VERIFIED PRODUCTION DEPLOYMENT</span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {skill.productionUse}
          </p>
        </div>

        {/* Live Command Terminal Readout */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
              <Terminal size={12} className="text-cyan-400" />
              <span>TERMINAL TELEMETRY / INVOCATION</span>
            </span>

            <button
              onClick={copyCommand}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? "COPIED" : "COPY COMMAND"}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-black/90 border border-white/15 font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto">
            <code>$ {skill.command}</code>
            <span className="text-[10px] text-zinc-600 ml-4 flex-shrink-0">SYS_OK</span>
          </div>
        </div>

        {/* Proficiency Gauge & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              PROFICIENCY RATING
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-medium text-white">
                {skill.proficiency}%
              </span>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                [{skill.level}]
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
              ASSOCIATED TOOLCHAIN
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-zinc-500">
          <span>IDENTIFIER: 0x{skill.id.replace(/-/g, "").slice(0, 8).toUpperCase()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white text-black font-bold tracking-wider hover:bg-zinc-200 transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// The Main SkillsMatrix Component (Zero University & Jesper Landberg Architecture)
// ─────────────────────────────────────────────────────────────────────────────
export const SkillsMatrix: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<DetailedSkill | null>(null);
  const [cursorCoord, setCursorCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update cursor coordinate readout
  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    setCursorCoord({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
  };

  // Filter skills based on Category, Level, and Search Query
  const filteredSkills = useMemo(() => {
    return ALL_SKILLS.filter((s) => {
      // Category match
      if (activeCategory !== "all" && s.category !== activeCategory) return false;
      // Level match
      if (activeLevel !== "all" && s.level.toLowerCase() !== activeLevel.toLowerCase()) return false;
      // Search match
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesDetail = s.detail.toLowerCase().includes(q);
        const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = s.categoryLabel.toLowerCase().includes(q);
        return matchesName || matchesDetail || matchesTags || matchesCategory;
      }
      return true;
    });
  }, [activeCategory, activeLevel, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_SKILLS.length };
    for (const cat of SKILL_CATEGORIES) {
      if (cat.id !== "all") {
        counts[cat.id] = ALL_SKILLS.filter((s) => s.category === cat.id).length;
      }
    }
    return counts;
  }, []);

  return (
    <section
      id="skills"
      onMouseMove={handleSectionMouseMove}
      className="py-24 px-6 sm:px-12 max-w-[1700px] mx-auto scroll-mt-20 border-t border-white/10 select-none relative"
    >
      {/* ── ZERO UNIVERSITY TELEMETRY HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-white/15 pb-8">
        <div>
          {/* High-tech status indicator */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.24em] text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>03 // COMPLETE ARSENAL & TOOLCHAIN</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 hidden sm:inline">
              SYS_REV: 2026.10
            </span>
            <span className="text-zinc-600 hidden sm:inline">·</span>
            <span className="text-emerald-400 font-mono hidden md:inline">
              COORD [X:{String(cursorCoord.x).padStart(4, "0")} Y:{String(cursorCoord.y).padStart(4, "0")}]
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-[-0.05em] text-white mt-3">
            Hardware Protocols <span className="text-white/40">& Creative Code</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-2xl leading-relaxed">
            All 38 production proficiencies across low-level Linux kernels, automotive cockpit networks, real-time WebGL graphics, and algorithmic sound synthesis.
          </p>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 38 technologies, tags..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white/5 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs font-mono text-white placeholder-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Level Filter Dropdown / Pill */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            {["all", "expert", "advanced", "intermediate"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  soundFX.playClick();
                  setActiveLevel(lvl);
                }}
                className={`px-3 py-1 rounded-full transition-all capitalize ${
                  activeLevel === lvl
                    ? "bg-cyan-400 text-black font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILL SELECTORS ── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {SKILL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all flex items-center gap-2.5 border ${
                isActive
                  ? "bg-white text-black font-bold border-white shadow-xl scale-[1.02]"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? "bg-black text-white" : "bg-white/10 text-zinc-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SKILLS GRID (All 38 Skills) ── */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <ZeroUniversityCard
              key={skill.id}
              skill={skill}
              onInspect={(s) => setSelectedSkill(s)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl p-8 space-y-4">
          <Terminal size={32} className="text-zinc-500 mx-auto" />
          <h4 className="text-xl font-display font-medium text-white">
            No matching engineering subsystems found
          </h4>
          <p className="text-xs text-zinc-400 font-mono">
            Zero modules matched query "{searchQuery}" under level "{activeLevel}".
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setActiveLevel("all");
            }}
            className="px-4 py-2 rounded-full bg-cyan-400 text-black font-mono text-xs font-bold hover:bg-cyan-300 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ── TECHNICAL ARSENAL FOOTER TELEMETRY ── */}
      <div className="mt-12 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>SHOWING {filteredSkills.length} OF 38 TOTAL SKILLS LOADED FROM PROFILE CONFIG</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] text-zinc-500">
          <span>HARDWARE: CAN 2.0B / MCP2515</span>
          <span>KERNEL: LINUX 6.x</span>
          <span>GRAPHICS: WEBGL 2.0</span>
        </div>
      </div>

      {/* ── ZERO UNIVERSITY SPECIFICATION MODAL ── */}
      <DiagnosticSpecModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </section>
  );
};
