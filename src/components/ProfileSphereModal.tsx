import React from 'react';
import { X, Mail, Award, GraduationCap, MapPin, Download } from 'lucide-react';
import { ZYNX_PROFILE } from '../data/portfolioData';

interface ProfileSphereModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current inline-block" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const ProfileSphereModal: React.FC<ProfileSphereModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-hidden">
      
      {/* Top Close Button (exact style from jesperlandberg.com) */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-2 transition-colors group"
      >
        <span>CLOSE</span>
        <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
          <X className="w-4 h-4" />
        </div>
      </button>

      {/* Center Refractive Glass Sphere Container */}
      <div className="relative w-full max-w-2xl aspect-square max-h-[85vh] rounded-full p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-[0_0_120px_rgba(0,240,255,0.18)] border border-white/20 overflow-hidden bg-gradient-to-br from-slate-950/95 via-[#080c14]/95 to-slate-950/95 backdrop-blur-2xl">
        
        {/* Dynamic Refractive Ring / Chromatic Aberration Rim */}
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent bg-gradient-to-tr from-cyan-400/30 via-transparent to-amber-300/30 pointer-events-none blur-[2px]"></div>
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none"></div>

        {/* Content Inside the Bubble */}
        <div className="relative z-10 max-w-lg space-y-5 animate-scale-up">
          
          {/* Avatar or Monogram */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto overflow-hidden border-2 border-cyan-400/40 p-1 bg-slate-900 shadow-lg shadow-cyan-500/20">
            <img 
              src="/images/profile_avatar.png" 
              alt="Joshua D"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              Joshua D <span className="text-cyan-400 font-mono">(ZYNX)</span>
            </h2>
            <p className="text-xs font-mono text-cyan-300/80 mt-1 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {ZYNX_PROFILE.location}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Electronics & Communication Engineering graduate (DBIT 2021–2025) with deep hands-on expertise in Arch Linux system administration, embedded hardware architecture, and cutting-edge 3D WebGL interfaces. Usually lead hardware architect & developer, responsible for end-to-end design, embedded firmware, and interface engineering.
          </p>

          <div className="text-[11px] font-mono text-slate-400 space-y-1 py-1 border-y border-white/10">
            <div className="flex items-center justify-center gap-1 text-slate-200 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>B.E. in Electronics & Communication (DBIT 2021–2025 · CGPA 7.16)</span>
            </div>
            <div className="text-[10px] text-amber-300/90 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Responsible Disclosure & Bug Bounty Contest Recognition (7chats)</span>
            </div>
          </div>

          {/* Social Links Row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            <a 
              href={ZYNX_PROFILE.socials.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <GithubIcon /> GitHub
            </a>
            <a 
              href={ZYNX_PROFILE.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <LinkedinIcon /> LinkedIn
            </a>
            <a 
              href={ZYNX_PROFILE.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <InstagramIcon /> Instagram
            </a>
            <a 
              href={`mailto:${ZYNX_PROFILE.email}`}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>

          {/* Resume Download Action */}
          <div className="pt-1">
            <a
              href="/resumes/Joshua_D_Universal_Resume.pdf"
              download="Joshua_D_Universal_Resume.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download Full Resume (PDF)
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
