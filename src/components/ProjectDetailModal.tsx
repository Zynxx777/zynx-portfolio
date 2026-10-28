import React from 'react';
import { X, ExternalLink, Code2, Trophy, Calendar, Tag, Layers } from 'lucide-react';
import type { Project } from '../data/portfolioData';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenAnatomy?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onOpenAnatomy }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0d1017] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden relative my-auto">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-[#0a0c12]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {project.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {project.year}
              </span>
              {project.award && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                  <Trophy className="w-3 h-3 text-amber-400" /> {project.award}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {project.title}
            </h2>
            <p className="text-sm text-cyan-300/90 font-medium mt-1">
              {project.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Hero Visual */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-black/50 relative max-h-[380px]">
            <img 
              src={project.heroImage} 
              alt={project.title}
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Core Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Project Overview
            </h3>
            <p className="text-base text-slate-200 leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          {/* Deep-Dive Bullet Points */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Engineering Architecture & Execution
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc list-inside">
              {project.fullOverview.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Gallery Thumbnails if present */}
          {project.gallery.length > 1 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Project Gallery & Renders
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.gallery.map((imgUrl, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 aspect-video">
                    <img 
                      src={imgUrl} 
                      alt={`${project.title} preview ${i}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Tags */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Technologies & Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800/80 bg-[#0a0c12] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-medium flex items-center gap-2 transition-colors"
              >
                <Code2 className="w-4 h-4" /> View Source on GitHub
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <ExternalLink className="w-4 h-4" /> Launch Live Demo
              </a>
            )}
          </div>

          {project.id === 'zcard' && onOpenAnatomy && (
            <button
              onClick={() => {
                onClose();
                onOpenAnatomy();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-indigo-500/30 transition-all"
            >
              <Layers className="w-4 h-4" /> Dissect 3D Anatomy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
