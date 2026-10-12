import React from "react";
import { X, Printer, ShieldCheck } from "lucide-react";
import profileData from "../data/profile.json";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { basics, education, experience, projects, certifications } = profileData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-2 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto cyber-glass border border-white/20 rounded-3xl p-8 sm:p-5 shadow-2xl bg-[#09090f]">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              ATS Standard Single-Source Verification
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Save ATS PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
              aria-label="Close resume"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* The Printable ATS Sheet */}
        <div id="printable-resume" className="text-zinc-200 font-sans text-xs leading-relaxed space-y-6">
          {/* Header */}
          <div className="border-b border-white/10 pb-4">
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">{basics.name}</h1>
                <p className="font-mono text-cyan-400 font-semibold">{basics.label}</p>
                <p className="font-mono text-zinc-400 text-[11px]">{basics.sublabel}</p>
              </div>
              <div className="text-right sm:text-left font-mono text-[11px] text-zinc-400 space-y-0.5">
                <p>{basics.location.city}, {basics.location.region}, {basics.location.country}</p>
                <p>{basics.email} | {basics.phone}</p>
                <div className="flex gap-2 justify-end sm:justify-start text-cyan-400">
                  <a href={basics.profiles.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                  <span>•</span>
                  <a href={basics.profiles.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          {/* Objective / Summary */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-1.5">
              Summary
            </h2>
            <p className="text-zinc-300">{basics.summary}</p>
          </div>

          {/* Technical Skills */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
              Technical Skills
            </h2>
            <div className="space-y-1 text-zinc-300">
              <p>• <strong>Low-Level & Systems:</strong> Arch Linux, AOSP / Custom ROM development, Bootloader Management, Bash, CAN Bus, VLSI (Verilog HDL), Arduino C++.</p>
              <p>• <strong>Frontend & WebGL:</strong> React, Next.js, TypeScript, Three.js, GLSL Shaders, Tailwind CSS, Framer Motion, Web Audio API.</p>
              <p>• <strong>Languages:</strong> JavaScript, Python, C/C++, Java, Kotlin, Node.js, Express.</p>
              <p>• <strong>Security & Audio:</strong> PenTesting basics, Cryptography, Reverse Engineering, FL Studio (Power User), Sound Design.</p>
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l border-white/10 pl-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-white text-xs">{exp.role} <span className="text-cyan-400">@ {exp.company}</span></h3>
                    <span className="font-mono text-[10px] text-zinc-400">{exp.dates}</span>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 mb-1">{exp.location} | {exp.type}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    {exp.highlights.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-white text-xs">{edu.institution}</h3>
                    <p className="text-zinc-400 text-[11px]">{edu.degree}</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-zinc-400">
                    <p>{edu.dates}</p>
                    {edu.cgpa && <p className="text-cyan-400 font-bold">CGPA: {edu.cgpa}</p>}
                    {edu.score && <p>{edu.score}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notable Projects */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
              Selected Engineering Projects
            </h2>
            <div className="space-y-2">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-white text-xs">{p.name} — <span className="font-normal text-cyan-400 font-mono">{p.subtitle}</span></h3>
                    <span className="font-mono text-[10px] text-zinc-500">{p.badge}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h2 className="font-mono text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
              Certifications & Honors
            </h2>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
              {certifications.map((c, idx) => (
                <li key={idx}>
                  <strong className="text-white">{c.title}</strong> — {c.issuer} ({c.date}). {c.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
