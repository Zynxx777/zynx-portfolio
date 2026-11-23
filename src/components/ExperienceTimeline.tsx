import React, { useRef } from "react";
import { Award, GraduationCap, Building2 } from "lucide-react";
import profileData from "../data/profile.json";

interface InteractiveRowProps {
  children: React.ReactNode;
  className?: string;
}

const InteractiveHoverBox: React.FC<InteractiveRowProps> = ({ children, className = "" }) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ("ontouchstart" in window || !boxRef.current || !sheenRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    sheenRef.current.style.opacity = "1";
    sheenRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, rgba(34, 211, 238, 0.08), transparent 70%)`;
  };

  const handleMouseLeave = () => {
    if (sheenRef.current) sheenRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Dynamic Specular Sheen tracking mouse cursor */}
      <div
        ref={sheenRef}
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300"
      />
      {children}
    </div>
  );
};

export const ExperienceTimeline: React.FC = () => (
  <section id="experience" className="relative px-5 py-20 text-white scroll-mt-20 sm:px-12 sm:py-24 border-t border-white/10">
    <div className="mx-auto max-w-[1600px]">
      {/* ── HEADER ── */}
      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:mb-16 sm:pb-10 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>03 // EXPERIENCE &amp; EDUCATION</span>
          </div>
          <h2 className="mt-3 max-w-4xl font-display text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white">
            Work, education <span className="text-white/40">&amp; credentials.</span>
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm font-sans leading-relaxed text-zinc-400 md:pb-1">
          Current employment, Electronics &amp; Communication Engineering degree, and verified technical certificates.
        </p>
      </header>

      {/* ── EXPERIENCE LIST ── */}
      <div className="border-b border-white/10 divide-y divide-white/10">
        {profileData.experience.map((exp, index) => (
          <InteractiveHoverBox
            key={`${exp.company}-${exp.role}`}
            className="group grid gap-x-8 gap-y-6 py-8 transition-all hover:bg-white/[0.015] md:grid-cols-[4rem_minmax(0,1fr)_12rem] lg:gap-x-12 lg:py-10 px-4 rounded-2xl"
          >
            {/* Number Identifier */}
            <div className="font-mono text-sm tracking-widest text-zinc-500 transition-colors group-hover:text-cyan-300 sm:pt-1">
              {String(index + 1).padStart(2, "0")}
            </div>

            {/* Content Body */}
            <div>
              <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                <span className="text-cyan-300/90">{exp.type}</span>
                <span aria-hidden="true" className="text-zinc-600">/</span>
                <span>{exp.location}</span>
              </div>

              <h3 className="font-display text-2xl font-medium leading-tight tracking-[-0.03em] text-white transition-colors group-hover:text-cyan-100 sm:text-3xl">
                {exp.role}
                <span className="text-zinc-400 font-normal"> · {exp.company}</span>
              </h3>

              <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
                {exp.highlights.map((highlight, pointIndex) => (
                  <li key={pointIndex} className="flex gap-3 text-xs leading-relaxed text-zinc-300/85 font-sans sm:text-sm">
                    <span className="shrink-0 font-mono text-[10px] text-cyan-400/60 mt-0.5">
                      {String(pointIndex + 1).padStart(2, "0")}
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dates Badge */}
            <div className="flex items-center justify-start gap-4 font-mono text-xs text-zinc-400 md:flex-col md:items-end md:justify-start md:pt-1">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-zinc-300">
                {exp.dates}
              </span>
            </div>
          </InteractiveHoverBox>
        ))}
      </div>

      {/* ── ACADEMIC BACKGROUND & HONORS ── */}
      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-14">
        {/* Academic Column */}
        <section aria-labelledby="education-heading" className="space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
            <GraduationCap size={17} strokeWidth={1.5} className="text-cyan-300" />
            <h3 id="education-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
              Academic Background
            </h3>
          </div>

          <div className="space-y-4">
            {profileData.education.map((edu) => (
              <InteractiveHoverBox
                key={edu.institution}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/35 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-display text-base sm:text-lg font-medium tracking-tight text-white">
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
                  <div className="pt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30 text-cyan-300">
                      CGPA {edu.cgpa}
                    </span>
                    {"courses" in edu && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        {(edu as { courses?: string[] }).courses?.length} core engineering modules
                      </span>
                    )}
                  </div>
                )}
              </InteractiveHoverBox>
            ))}
          </div>
        </section>

        {/* Certifications & Recognition Column */}
        <section aria-labelledby="honors-heading" className="space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
            <Award size={17} strokeWidth={1.5} className="text-cyan-300" />
            <h3 id="honors-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-200">
              Certifications &amp; Recognition
            </h3>
          </div>

          <div className="space-y-4">
            {profileData.certifications.map((cert) => (
              <InteractiveHoverBox
                key={cert.title}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-400/35 transition-all space-y-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="font-display text-base sm:text-lg font-medium tracking-tight text-white">
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
                <p className="text-xs leading-relaxed text-zinc-300/90 font-sans">
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
