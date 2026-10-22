import React, { useEffect, useMemo, useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";
import { ALL_SKILLS, SKILL_CATEGORIES, SKILL_LEVELS, type DetailedSkill } from "../data/skillsData";
import { soundFX } from "../utils/audioFX";

const levelStyles: Record<string, string> = {
  "Daily use": "border-emerald-400/35 bg-emerald-950/30 text-emerald-200",
  "Hands-on practice": "border-cyan-400/35 bg-cyan-950/30 text-cyan-200",
  "Portfolio project": "border-purple-400/35 bg-purple-950/30 text-purple-200",
  "Academic exposure": "border-amber-400/35 bg-amber-950/30 text-amber-200",
  Foundational: "border-sky-400/35 bg-sky-950/30 text-sky-200",
  Recognition: "border-pink-400/35 bg-pink-950/30 text-pink-200",
  "Current work": "border-emerald-400/35 bg-emerald-950/30 text-emerald-200",
};

const SkillDetails: React.FC<{ skill: DetailedSkill; onClose: () => void }> = ({ skill, onClose }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 backdrop-blur-xl sm:items-center sm:p-5"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-details-title"
        className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/15 bg-[#090d18] p-5 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <img src={skill.icon} alt="" className="h-10 w-10 rounded-xl bg-black/50 p-2 object-contain" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">{skill.categoryLabel}</p>
              <h3 id="skill-details-title" className="mt-1 text-xl font-semibold text-white">{skill.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close skill details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-6 py-6">
          <div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-mono ${levelStyles[skill.level] ?? levelStyles.Foundational}`}>
              {skill.level}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">{skill.detail}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">Evidence &amp; context</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{skill.evidence}</p>
          </div>

          {skill.command && (
            <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Example command</h4>
              <code className="mt-2 block overflow-x-auto text-xs text-emerald-200">$ {skill.command}</code>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300">{tag}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export const SkillsMatrix: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<DetailedSkill | null>(null);

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ALL_SKILLS.filter((skill) => {
      const matchesCategory = activeCategory === "all" || skill.category === activeCategory;
      const matchesLevel = activeLevel === "all" || skill.level === activeLevel;
      const searchableText = [skill.name, skill.detail, skill.evidence, skill.categoryLabel, ...skill.tags].join(" ").toLowerCase();
      return matchesCategory && matchesLevel && (!query || searchableText.includes(query));
    });
  }, [activeCategory, activeLevel, searchQuery]);

  return (
    <section id="skills" className="mx-auto max-w-[1700px] scroll-mt-20 border-t border-white/10 px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
      <header className="mb-8 flex flex-col gap-6 border-b border-white/15 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">03 // Skills &amp; practice</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-5xl">Skills <span className="text-white/40">with evidence</span></h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Practical Linux maintenance, AI-assisted web projects, engineering coursework, and current learning areas. Each label describes where the experience comes from.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-auto lg:min-w-[32rem]">
          <label className="relative block">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Search ${ALL_SKILLS.length} skills and projects`}
              aria-label="Search skills and projects"
              className="w-full rounded-full border border-white/15 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
          <label className="sr-only" htmlFor="skill-evidence-filter">Filter by evidence type</label>
          <select
            id="skill-evidence-filter"
            value={activeLevel}
            onChange={(event) => setActiveLevel(event.target.value)}
            className="rounded-full border border-white/15 bg-[#090d18] px-4 py-3 text-sm text-zinc-200 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="all">All evidence types</option>
            {SKILL_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      </header>

      <nav aria-label="Filter skills by category" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
        {SKILL_CATEGORIES.map((category) => {
          const count = category.id === "all" ? ALL_SKILLS.length : ALL_SKILLS.filter((skill) => skill.category === category.id).length;
          const selected = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => { setActiveCategory(category.id); soundFX.playClick(); }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${selected ? "border-white bg-white font-semibold text-black" : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"}`}
            >
              <span>{category.label}</span><span className={`rounded-full px-1.5 py-0.5 text-[10px] ${selected ? "bg-black/10" : "bg-white/10"}`}>{count}</span>
            </button>
          );
        })}
      </nav>

      {filteredSkills.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <button
              type="button"
              key={skill.id}
              onClick={() => { setSelectedSkill(skill); soundFX.playZoom(); }}
              className="group flex min-h-40 flex-col rounded-2xl border border-white/10 bg-[#090d18]/75 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              <span className="flex w-full items-start justify-between gap-4">
                <span className="flex min-w-0 items-center gap-3">
                  <img src={skill.icon} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-xl bg-black/50 p-2 object-contain" />
                  <span className="font-medium leading-snug text-white">{skill.name}</span>
                </span>
                <ArrowUpRight size={15} aria-hidden="true" className="mt-1 shrink-0 text-zinc-500 transition group-hover:text-cyan-300" />
              </span>
              <span className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">{skill.detail}</span>
              <span className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-mono ${levelStyles[skill.level] ?? levelStyles.Foundational}`}>{skill.level}</span>
                <span className="text-[10px] text-zinc-500">{skill.categoryLabel}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center">
          <h3 className="text-lg font-medium text-white">No matching skills</h3>
          <p className="mt-2 text-sm text-zinc-400">Change the search or evidence filter to see more.</p>
          <button type="button" onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveLevel("all"); }} className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs text-zinc-200 hover:bg-white/10">Clear filters</button>
        </div>
      )}

      <p aria-live="polite" className="mt-6 text-xs font-mono text-zinc-500">Showing {filteredSkills.length} of {ALL_SKILLS.length} areas</p>

      {selectedSkill && <SkillDetails skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
    </section>
  );
};
