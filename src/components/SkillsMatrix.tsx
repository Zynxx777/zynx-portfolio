import React, { useState } from "react";
import { Terminal, Cpu, Layout, Code2, Sparkles, Layers } from "lucide-react";

interface SkillItem {
  name: string;
  level: string;
  category: string;
  icon: string;
  detail: string;
}

export const SkillsMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const allSkills: SkillItem[] = [
    // Systems & Linux
    { name: "Arch Linux", level: "Expert", category: "systems", icon: "/images/skills/arch.svg", detail: "Daily driver, custom kernel build, Hyprland rice" },
    { name: "Linux & Kernel", level: "Advanced", category: "systems", icon: "/images/skills/linux.svg", detail: "POSIX shell, systemd, memory & procfs diagnostics" },
    { name: "AOSP & Android", level: "Intermediate", category: "systems", icon: "/images/skills/android.svg", detail: "ROM compilation, bootloader unlocking, root modules" },
    { name: "Docker", level: "Intermediate", category: "systems", icon: "/images/skills/docker.svg", detail: "Containerization, microservices, volume isolation" },
    { name: "Git & DevOps", level: "Advanced", category: "systems", icon: "/images/skills/git.png", detail: "Git workflows, branch rebasing, CI pipelines" },

    // Embedded & Automotive
    { name: "Android Automotive (AAOS)", level: "Intermediate", category: "automotive", icon: "/images/skills/android.svg", detail: "Vehicle HAL, CarService, Cockpit CDC architecture" },
    { name: "CAN Bus Protocol", level: "Intermediate", category: "automotive", icon: "/images/skills/arduino.svg", detail: "CAN 2.0B frame parsing, ECU messaging, OBD telemetry" },
    { name: "Arduino & Microcontrollers", level: "Advanced", category: "automotive", icon: "/images/skills/arduino.svg", detail: "Sensors, PWM motor control, serial interfaces" },
    { name: "VLSI & Verilog HDL", level: "Intermediate", category: "automotive", icon: "/images/skills/cp.png", detail: "RTL digital modeling, logic gates, synthesis verification" },

    // 3D & Creative Frontend
    { name: "React 19 & Next.js", level: "Advanced", category: "frontend", icon: "/images/skills/react.png", detail: "Modern hooks, suspense, SSR, performance benchmarks" },
    { name: "TypeScript", level: "Advanced", category: "frontend", icon: "/images/skills/ts.png", detail: "Strict typings, generics, utility types, AST" },
    { name: "Three.js & WebGL", level: "Advanced", category: "frontend", icon: "/images/skills/threejs.svg", detail: "Scene graphs, shaders, orbital cameras, particle buffers" },
    { name: "GLSL Shaders", level: "Intermediate", category: "frontend", icon: "/images/skills/opengl.svg", detail: "Vertex/fragment programs, raymarching, Fresnel math" },
    { name: "Tailwind CSS", level: "Advanced", category: "frontend", icon: "/images/skills/tailwind.png", detail: "Custom tokens, responsive glassmorphic interfaces" },
    { name: "Blender 3D", level: "Intermediate", category: "frontend", icon: "/images/skills/blender.svg", detail: "Low-poly modeling, UV unwrapping, glTF exports" },
    { name: "Figma", level: "Intermediate", category: "frontend", icon: "/images/skills/figma.png", detail: "UI wireframing, design tokens, responsive layout specs" },

    // Languages & Software
    { name: "C & C++", level: "Advanced", category: "languages", icon: "/images/skills/cpp.png", detail: "Pointers, memory management, low-level data structs" },
    { name: "Python", level: "Advanced", category: "languages", icon: "/images/skills/py.webp", detail: "Automation scripts, data manipulation, backend logic" },
    { name: "Rust", level: "Intermediate", category: "languages", icon: "/images/skills/rust.png", detail: "Ownership, borrow checker, safety without GC" },
    { name: "Go (Golang)", level: "Intermediate", category: "languages", icon: "/images/skills/go.png", detail: "Goroutines, channels, lightweight web microservices" },
    { name: "Kotlin & Java", level: "Intermediate", category: "languages", icon: "/images/skills/kotlin.png", detail: "Android services, OOP patterns, bytecode runtime" },
    { name: "Flutter & Dart", level: "Intermediate", category: "languages", icon: "/images/skills/flutter.svg", detail: "Cross-platform mobile UI, state management" },
  ];

  const categories = [
    { id: "all", label: "All Arsenal", icon: Layers },
    { id: "systems", label: "Systems & Linux", icon: Terminal },
    { id: "automotive", label: "Automotive & Embedded", icon: Cpu },
    { id: "frontend", label: "3D & Creative Frontend", icon: Layout },
    { id: "languages", label: "Languages & Core", icon: Code2 },
  ];

  const filteredSkills = allSkills.filter((s) =>
    activeTab === "all" ? true : s.category === activeTab
  );

  return (
    <section id="skills" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-px bg-emerald-400"></span>
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
            02 // TECHNICAL ARSENAL & TOOLCHAIN
          </span>
          <span className="w-8 h-px bg-emerald-400"></span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Tech Stack & Domain Competencies
        </h2>

        <p className="text-sm text-zinc-400 font-sans mt-3 max-w-lg">
          Hands-on technical capabilities paired with official cliparts and logos across low-level systems, automotive cockpits, 3D graphics, and programming languages.
        </p>

        {/* Category Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10 scale-105"
                    : "cyber-glass border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                }`}
              >
                <Icon size={14} className={isActive ? "text-emerald-400" : "text-zinc-500"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Skill Cards with Cliparts & Logos */}
      <div className="grid grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {filteredSkills.map((skill, idx) => (
          <div
            key={idx}
            className="group p-4 rounded-2xl cyber-glass border border-white/5 hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              {/* Clipart / Logo Badge */}
              <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center p-2.5 flex-shrink-0 group-hover:border-emerald-400/50 group-hover:scale-110 transition-all duration-300 shadow-inner">
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-full h-full object-contain filter drop-shadow"
                  loading="lazy"
                />
              </div>

              {/* Title & Level */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-display font-bold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors truncate">
                    {skill.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex-shrink-0">
                    {skill.level}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                  {skill.detail}
                </p>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-600">
              <span className="uppercase tracking-wider text-zinc-500">{skill.category}</span>
              <span className="flex items-center gap-1 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles size={10} />
                <span>Verified</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
