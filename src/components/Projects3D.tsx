import React, { useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import profileData from "../data/profile.json";

interface ProjectCardProps {
  project: (typeof profileData.projects)[0];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotation({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 w-full h-full cursor-pointer group"
    >
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
        }}
        className="preserve-3d relative w-full h-full min-h-[460px] rounded-2xl cyber-glass border border-white/10 hover:border-cyan-400/40 p-6 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10"
      >
        {/* Holographic Specular Glare (moto-card style) */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(0, 242, 254, ${glare.opacity}), transparent 60%)`,
          }}
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-200 z-30"
        />

        {/* Top Badges & Category */}
        <div style={{ transform: "translateZ(30px)" }} className="flex items-center justify-between w-full mb-3 z-20">
          <span className="text-[11px] font-mono tracking-wider px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            {project.badge}
          </span>
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">
            {project.category}
          </span>
        </div>

        {/* 3D Visual Artwork / Image */}
        <div
          style={{ transform: "translateZ(45px)" }}
          className="relative h-44 w-full rounded-xl overflow-hidden my-2 border border-white/5 bg-zinc-950 group-hover:border-cyan-400/30 transition-colors z-10"
        >
          <img
            src={project.img}
            alt={project.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent opacity-80" />
        </div>

        {/* Content Details */}
        <div style={{ transform: "translateZ(35px)" }} className="mt-3 flex-grow flex flex-col justify-between z-20">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 group-hover:text-cyan-300 transition-colors leading-snug">
              {project.name}
            </h3>
            <p className="font-mono text-xs text-zinc-400 mt-1 uppercase tracking-wider">
              {project.subtitle}
            </p>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mt-2.5 line-clamp-3">
              {project.description}
            </p>
          </div>

          {/* Skill Pills & Action */}
          <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {project.skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>

            <a
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-center group-hover:scale-110 shadow-sm"
              aria-label={`Open ${project.name}`}
            >
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Projects3D: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  interface CategoryFilter {
    id: string;
    label: string;
    match?: string[];
  }

  const categories: CategoryFilter[] = [
    { id: "all", label: "All Projects" },
    { id: "automotive", label: "Automotive & Embedded", match: ["Automotive & Embedded", "Hardware & VLSI"] },
    { id: "creative", label: "3D & WebGL", match: ["WebGL & Audio", "3D & Creative", "Creative & Math"] },
    { id: "software", label: "Software & Mobile", match: ["Mobile & Systems"] },
  ];

  const filteredProjects = profileData.projects.filter((p) => {
    if (activeFilter === "all") return true;
    const cat = categories.find((c) => c.id === activeFilter);
    return cat && cat.match ? cat.match.includes(p.category) : true;
  });

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-cyan-400"></span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
            01 // PORTFOLIO SHOWCASE
          </span>
          <span className="w-8 h-px bg-cyan-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Flagship Engineering & Labs
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Tactile 3D perspective cards demonstrating real work across automotive domain controllers, smart medicine hardware, WebGL shaders, and mobile audio apps.
        </p>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border ${
                activeFilter === cat.id
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30 font-bold"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 3D Perspective Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};
