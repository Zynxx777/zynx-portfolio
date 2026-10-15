import React, { useRef, useState } from "react";
import { ArrowUpRight, Award, GraduationCap, Building2 } from "lucide-react";
import profileData from "../data/profile.json";

interface InteractiveRowProps {
  children: React.ReactNode;
  className?: string;
}

const InteractiveHoverBox: React.FC<InteractiveRowProps> = ({ children, className = "" }) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Dynamic Specular Sheen tracking mouse cursor (Jesper Landberg styling) */}
      {mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.08), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

export const ExperienceTimeline: React.FC = () => (
  <section id="experience" className="relative bg-[#050505] px-6 py-24 text-white scroll-mt-20 sm:px-10 sm:py-32 lg:px-16 border-t border-white/10">
    <div className="mx-auto max-w-[1600px]">
      {/* ── HEADER ── */}
      <header className="mb-14 flex flex-col justify-between gap-6 border-b border-white/15 pb-8 sm:mb-20 sm:pb-12 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>02 // CAREER & EDUCATION RECORD</span>
          </div>
          <h2 className="mt-4 max-w-5xl font-display text-[clamp(2.5rem,7vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.06em] text-white">
            The work <span className="text-white/35">behind the code.</span>
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm font-sans leading-relaxed text-zinc-400 md:pb-1">
          Low-level systems architecture, automotive cockpit telemetry, reverse engineering security research, and academic rigor.
        </p>
      </header>

      {/* ── EXPERIENCE LIST (Minimalist Swedish Row Grid with Dynamic Sheen) ── */}
      <div className="border-t border-white/15 divide-y divide-white/10">
        {profileData.experience.map((exp, index) => (
          <InteractiveHoverBox
            key={`${exp.company}-${exp.role}`}
            className="group grid gap-x-8 gap-y-6 py-10 transition-all hover:bg-white/[0.015] md:grid-cols-[5rem_minmax(0,1fr)_13rem] lg:gap-x-14 lg:py-12 px-4 rounded-2xl"
          >
            {/* Number Identifier */}
            <div className="font-mono text-sm tracking-widest text-zinc-500 transition-colors group-hover:text-cyan-300 sm:pt-1">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* Content Body */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                <span className="text-cyan-300/90">{exp.type}</span>
                <span aria-hidden="true" className="text-zinc-600">/</span>
                <span>{exp.location}</span>
              </div>

              <h3 className="font-display text-2xl font-medium leading-tight tracking-[-0.035em] text-white transition-colors group-hover:text-cyan-100 sm:text-3xl lg:text-4xl">
                {exp.role}
                <span className="text-zinc-500"> <span className="text-zinc-700">@</span> {exp.company}</span>
              </h3>

              <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {exp.highlights.map((highlight, pointIndex) => (
                  <li key={pointIndex} className="flex gap-3 text-xs leading-relaxed text-zinc-300/80 font-sans sm:text-sm">
                    <span className="shrink-0 font-mono text-[10px] text-cyan-400/60 mt-0.5">
                      {String(pointIndex + 1).padStart(2, "0")}
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dates & Action Badge */}
            <div className="flex items-center justify-between gap-4 font-mono text-xs text-zinc-400 md:flex-col md:items-end md:justify-start md:pt-1">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
                {exp.dates}
              </span>
              <span className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 transition-all duration-300 group-hover:border-cyan-300 group-hover:bg-cyan-300 group-hover:text-black">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </InteractiveHoverBox>
        ))}
      </div>

      {/* ── ACADEMIC BACKGROUND & HONORS ── */}
      <div className="mt-20 grid gap-12 lg:mt-28 lg:grid-cols-2 lg:gap-16">
        {/* Academic Column */}
        <section aria-labelledby="education-heading" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/15 pb-4">
            <GraduationCap size={18} strokeWidth={1.5} className="text-cyan-300" />
            <h3 id="education-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
              Academic Background
            </h3>
          </div>

          <div className="space-y-4">
            {profileData.education.map((edu) => (
              <InteractiveHoverBox
                key={edu.institution}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-display text-lg font-medium tracking-tight text-white sm:text-xl">
                      {edu.institution}
                    </h4>
                    <p className="mt-1 text-xs text-zinc-400 font-sans leading-relaxed">
                      {edu.degree}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 shrink-0">
                    {edu.dates}
                  </span>
                </div>

                {edu.cgpa && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30 text-cyan-300">
                      CGPA {edu.cgpa}
                    </span>
                    {"courses" in edu && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        {(edu as any).courses?.length} core engineering modules
                      </span>
                    )}
                  </div>
                )}
              </InteractiveHoverBox>
            ))}
          </div>
        </section>

        {/* Honors & Certifications Column */}
        <section aria-labelledby="honors-heading" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/15 pb-4">
            <Award size={18} strokeWidth={1.5} className="text-cyan-300" />
            <h3 id="honors-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
              Recognitions & Bounty Awards
            </h3>
          </div>

          <div className="space-y-4">
            {profileData.certifications.map((cert) => (
              <InteractiveHoverBox
                key={cert.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-400/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="font-display text-lg font-medium tracking-tight text-white sm:text-xl">
                    {cert.title}
                  </h4>
                  <span className="font-mono text-[11px] text-zinc-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 shrink-0">
                    {cert.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-purple-400" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-purple-300">
                    {cert.issuer}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300 font-sans">
                  {cert.detail}
                </p>
              </InteractiveHoverBox>
            ))}
          </div>
        </section>
      </div>
    </div>
  </section>
);
