import React from "react";
import { Terminal, Code2, Cpu, Award } from "lucide-react";
import { SkillsMatrix } from "../components/SkillsMatrix";

interface SkillsUniversePageProps {
  onNavigatePortfolio: () => void;
  onNavigateSpace: () => void;
  onNavigateCommunity: () => void;
}

const highlights = [
  { icon: Terminal, label: "LINUX", title: "Arch Linux", note: "Daily personal desktop use", color: "text-emerald-300" },
  { icon: Code2, label: "WEB PROJECTS", title: "React · Astro", note: "AI-assisted project work", color: "text-cyan-300" },
  { icon: Cpu, label: "EDUCATION", title: "B.E. Electronics", note: "Engineering foundation", color: "text-amber-300" },
  { icon: Award, label: "RECOGNITION", title: "7chats bounty", note: "Contest recognition, 2021", color: "text-pink-300" },
];

export const SkillsUniversePage: React.FC<SkillsUniversePageProps> = () => (
  <main className="relative mx-auto min-h-screen max-w-[1700px] space-y-6 px-4 pb-20 pt-24 sm:px-8">
    <header className="rounded-3xl border border-white/15 bg-[#090d18]/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-9">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">Skills &amp; experience</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-medium tracking-tight text-white sm:text-5xl">A clear view of what I use, build, and study.</h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
        I am targeting entry-level IT support and junior Linux administration roles. My background also includes an ECE degree, AI-assisted web projects, and music teaching. Each skill is labeled by its source so employers can quickly distinguish daily use, project work, and academic exposure.
      </p>
    </header>

    <section aria-label="Selected experience highlights" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {highlights.map(({ icon: Icon, label, title, note, color }) => (
        <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20">
          <div className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] ${color}`}><Icon size={14} />{label}</div>
          <h2 className="mt-3 text-xl font-medium text-white">{title}</h2>
          <p className="mt-1 text-xs text-zinc-400">{note}</p>
        </article>
      ))}
    </section>

    <SkillsMatrix />
  </main>
);
