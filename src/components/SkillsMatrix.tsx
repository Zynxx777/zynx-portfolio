import React, { useState } from "react";
import profileData from "../data/profile.json";
import { Terminal, Cpu, Layout, Code2, ShieldAlert } from "lucide-react";

export const SkillsMatrix: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("systemsAndLinux");

  const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    systemsAndLinux: { label: "Systems & Linux Kernel", icon: Terminal, color: "text-emerald-400" },
    embeddedAndAutomotive: { label: "Automotive & Embedded", icon: Cpu, color: "text-cyan-400" },
    frontendAndCreative: { label: "3D Web & Frontend", icon: Layout, color: "text-purple-400" },
    languagesAndBackend: { label: "Languages & Backend", icon: Code2, color: "text-amber-400" },
    securityAndAudio: { label: "Security & Sound Lab", icon: ShieldAlert, color: "text-pink-400" },
  };

  const skillsList = profileData.skills[activeCategory as keyof typeof profileData.skills] || [];

  return (
    <section id="skills" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-emerald-400"></span>
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
            04 // TECHNICAL ARSENAL
          </span>
          <span className="w-8 h-px bg-emerald-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Capabilities & Domain Expertise
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Practical competencies organized by domain rather than a wall of logos.
        </p>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-white/10 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10"
                    : "cyber-glass border-white/5 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon size={14} className={config.color} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-3 md:grid-cols-2 xs:grid-cols-1 gap-4 max-w-5xl mx-auto">
        {skillsList.map((skill, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl cyber-glass border border-white/5 hover:border-cyan-400/30 transition-all flex items-center justify-between group"
          >
            <div>
              <h4 className="font-display font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                {skill.name}
              </h4>
              {"category" in skill && (
                <span className="text-[11px] font-mono text-zinc-500">
                  {skill.category}
                </span>
              )}
            </div>

            <div className="text-right">
              {"level" in skill && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  {skill.level}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
