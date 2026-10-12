import React from "react";
import profileData from "../data/profile.json";
import { GraduationCap, Award } from "lucide-react";

export const ExperienceTimeline: React.FC = () => {
  return (
    <section id="experience" className="py-20 px-6 max-w-5xl mx-auto scroll-mt-20">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-cyan-400"></span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            05 // HISTORY & CREDENTIALS
          </span>
          <span className="w-8 h-px bg-cyan-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Experience & Education
        </h2>
      </div>

      {/* Experience Timeline */}
      <div className="relative border-l-2 border-white/10 ml-4 sm:ml-2 space-y-10 pl-8 sm:pl-4 mb-16">
        {profileData.experience.map((exp, idx) => (
          <div key={idx} className="relative group">
            {/* Glowing timeline node */}
            <div className="absolute -left-[41px] sm:-left-[25px] top-1.5 w-5 h-5 rounded-full bg-[#030306] border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg shadow-cyan-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>

            <div className="p-6 rounded-2xl cyber-glass border border-white/5 hover:border-cyan-400/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{exp.type}</span>
                  <h3 className="font-display font-bold text-lg text-white">
                    {exp.role} <span className="text-zinc-400 font-normal">@ {exp.company}</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-400 sm:mt-1">{exp.dates}</span>
              </div>

              <p className="text-xs font-mono text-zinc-500 mb-4">{exp.location}</p>

              <ul className="space-y-2 text-xs text-zinc-300 font-sans">
                {exp.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">▹</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Education & Certifications Row */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
        {/* Education */}
        <div className="p-6 rounded-2xl cyber-glass border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-purple-400 font-mono text-xs font-bold uppercase">
            <GraduationCap size={16} />
            <span>Academic Background</span>
          </div>
          {profileData.education.map((edu, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <div className="flex items-baseline justify-between">
                <h4 className="font-display font-bold text-sm text-zinc-200">{edu.institution}</h4>
                <span className="text-xs font-mono text-zinc-500">{edu.dates}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{edu.degree}</p>
              {edu.cgpa && (
                <p className="text-xs font-mono text-cyan-400 font-bold mt-1">CGPA: {edu.cgpa}</p>
              )}
            </div>
          ))}
        </div>

        {/* Certifications & Bug Bounty */}
        <div className="p-6 rounded-2xl cyber-glass border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-mono text-xs font-bold uppercase">
            <Award size={16} />
            <span>Honors & Certifications</span>
          </div>
          <div className="space-y-3">
            {profileData.certifications.map((cert, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-display font-bold text-xs text-zinc-200">{cert.title}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">{cert.date}</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
