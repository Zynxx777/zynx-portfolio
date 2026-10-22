import React, { useEffect } from "react";
import {
  X,
  FileText,
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  Award,
} from "lucide-react";
import profileData from "../data/profile.json";
import { soundFX } from "../utils/audioFX";

interface ProfileDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  openResume: () => void;
}

export const ProfileDossierDrawer: React.FC<ProfileDossierDrawerProps> = ({
  isOpen,
  onClose,
  openResume,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile Dossier"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      {/* Slide-over panel */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full bg-[#080b14] border-l border-white/15 p-6 sm:p-10 overflow-y-auto space-y-8 text-left shadow-2xl relative select-none animate-slideLeft"
      >
        {/* Top Bar HUD */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-300">
              PROFILE DOSSIER
            </span>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close dossier"
          >
            <X size={15} />
          </button>
        </div>

        {/* Identity & Masthead */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
            <MapPin size={12} className="text-cyan-400" />
            <span>{profileData.basics.location.city}, {profileData.basics.location.country}</span>
          </div>

          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-tight">
            {profileData.basics.name}
          </h2>

          <p className="font-mono text-xs text-cyan-300 tracking-wider">
            {profileData.basics.label}
          </p>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-2">
            {profileData.basics.summary}
          </p>
        </div>

        {/* Quick Actions (ATS Resume & Transmission) */}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
              openResume();
            }}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all shadow-lg"
          >
            <FileText size={14} />
            <span>Launch ATS Resume</span>
            <Sparkles size={12} className="text-cyan-600 animate-pulse" />
          </button>

          <a
            href={`mailto:${profileData.basics.email}`}
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs tracking-wider flex items-center gap-2 transition-all"
          >
            <Mail size={14} className="text-cyan-400" />
            <span>Direct Transmission</span>
          </a>
        </div>

        {/* Bug Bounty Contest Winner Spotlight */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/30 to-purple-950/20 border border-pink-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-pink-300">
            <Award size={15} className="text-pink-400" />
            <span className="font-bold tracking-wider uppercase">BUG BOUNTY RECOGNITION</span>
          </div>
          <h4 className="font-display font-medium text-base text-white">
            7chats Messenger Contest
          </h4>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Existing resume materials record contest recognition for reporting an authentication issue in the 7chats Messenger app.
          </p>
        </div>

        {/* Academic Foundations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            <GraduationCap size={15} className="text-cyan-400" />
            <span>ACADEMIC FOUNDATION</span>
          </div>

          <div className="space-y-3">
            {profileData.education.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1"
              >
                <div className="flex items-start justify-between text-xs">
                  <h5 className="font-display font-medium text-white">{edu.institution}</h5>
                  <span className="font-mono text-zinc-500 text-[10px]">{edu.dates}</span>
                </div>
                <p className="text-xs text-cyan-300 font-mono">{edu.degree}</p>
                {"cgpa" in edu && (
                  <p className="text-[11px] font-mono text-zinc-400">
                    Cumulative CGPA: <span className="text-white font-bold">{edu.cgpa}</span>
                  </p>
                )}
                {"courses" in edu && Array.isArray((edu as { courses?: string[] }).courses) && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {(edu as { courses: string[] }).courses.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Experience Stream */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            <Briefcase size={15} className="text-cyan-400" />
            <span>EXPERIENCE HIGHLIGHTS</span>
          </div>

          <div className="space-y-3">
            {profileData.experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5"
              >
                <div className="flex items-start justify-between text-xs">
                  <h5 className="font-display font-medium text-white">{exp.role}</h5>
                  <span className="font-mono text-zinc-500 text-[10px]">{exp.dates}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">{exp.company} · {exp.location}</p>
                <ul className="text-xs text-zinc-300 space-y-1 pt-1 list-disc list-inside">
                  {exp.highlights.slice(0, 2).map((h, hIdx) => (
                    <li key={hIdx} className="line-clamp-2 leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Social Coordinates & Communication */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 block">
            TRANSMISSION CHANNELS
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <a
              href={profileData.basics.profiles.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </span>
              <ArrowUpRight size={13} className="text-zinc-500" />
            </a>

            <a
              href={profileData.basics.profiles.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </span>
              <ArrowUpRight size={13} className="text-zinc-500" />
            </a>

            <a
              href={profileData.basics.profiles.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" />
                <span>WhatsApp</span>
              </span>
              <ArrowUpRight size={13} className="text-zinc-500" />
            </a>

            <a
              href={profileData.basics.profiles.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 fill-current text-pink-400" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </span>
              <ArrowUpRight size={13} className="text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-[10px] font-mono text-zinc-600 flex items-center justify-between">
            <span>SYS TIME: 2026 // BENGALURU, IN</span>
            <span>ZYNX ENGINE v2.4</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
