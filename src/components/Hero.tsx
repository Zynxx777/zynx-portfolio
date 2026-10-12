import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Music, Terminal, Shield, Cpu, ChevronDown, FileText } from "lucide-react";
import profileData from "../data/profile.json";

interface HeroProps {
  openResume: () => void;
  scrollToSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ openResume, scrollToSection }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrambleIndex, setScrambleIndex] = useState(0);

  // Kinetic typography titles
  const roles = [
    "ELECTRONICS & COMMUNICATION ENGINEER",
    "AUTOMOTIVE COCKPIT & AAOS DEVELOPER",
    "LINUX & EMBEDDED SYSTEMS SPECIALIST",
    "CREATIVE WEBGL & 3D DEVELOPER",
    "ELECTRONIC MUSIC PRODUCER (7YNX)"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setScrambleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [roles.length]);

  // Lusion-inspired Interactive Fluid Particle Field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const numParticles = Math.min(Math.floor((width * height) / 10000), 180);
    const colors = ["#00F2FE", "#4FACFE", "#9D4EDD", "#38EF7D", "#FF7247"];

    for (let i = 0; i < numParticles; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      particles.push({
        x: px,
        y: py,
        originX: px,
        originY: py,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    // Mouse tracker
    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between close particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particle naturally
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on borders
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse repulsion physics (Lusion style)
        const dx = mouse.x - p1.x;
        const dy = mouse.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p1.x -= Math.cos(angle) * force * 5;
          p1.y -= Math.sin(angle) * force * 5;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p1.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect adjacent nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distNodes < 110) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - distNodes / 110) * 0.15;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Background Interactive Fluid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Radial glow background accents */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* ChainGPT-style Telemetry Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full cyber-glass border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider mb-8 shadow-lg shadow-cyan-400/10 hover:border-cyan-400/60 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SYSTEM ONLINE // ARCH LINUX // AUTOMOTIVE & FULL-STACK [2026]</span>
        </div>

        {/* Headline Identity */}
        <div className="space-y-2 mb-6">
          <h2 className="text-zinc-500 text-sm font-mono tracking-widest uppercase">
            {profileData.basics.label}
          </h2>
          <h1 className="text-6xl sm:text-5xl xs:text-4xl font-display font-extrabold tracking-tight text-white leading-none">
            JOSHUA D{" "}
            <span className="gradient-text-cyan inline-block">
              // ZYNX
            </span>
          </h1>
        </div>

        {/* Kinetic Scramble Role Carousel (Jesper Landberg style) */}
        <div className="h-8 flex items-center justify-center mb-8">
          <p className="font-mono text-xs sm:text-[11px] tracking-wider text-purple-300 bg-purple-950/40 px-4 py-1.5 rounded-full border border-purple-500/30 transition-all duration-300">
            ▶ {roles[scrambleIndex]}
          </p>
        </div>

        {/* Narrative Bio */}
        <p className="max-w-2xl text-sm sm:text-xs text-zinc-400 font-sans leading-relaxed mb-10 px-4">
          Electronics & Communication Engineering background with deep hands-on expertise in automotive cockpit controllers (CAN / AAOS), custom ROMs, reverse engineering, WebGL GLSL shaders, and electronic music sound design.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => scrollToSection("projects")}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono text-xs font-bold tracking-wider transition-all duration-300 shadow-xl shadow-cyan-400/25 flex items-center gap-2 group hover:scale-105"
          >
            <span>Explore 3D Projects</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={openResume}
            className="px-6 py-3 rounded-full cyber-glass border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-emerald-100 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-105"
          >
            <FileText size={14} className="text-emerald-400" />
            <span>Interactive ATS Resume</span>
          </button>

          <button
            onClick={() => scrollToSection("3d-studio")}
            className="px-6 py-3 rounded-full cyber-glass border border-white/15 hover:border-cyan-400/50 text-zinc-200 hover:text-white font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles size={14} className="text-cyan-400" />
            <span>Enter 3D Studio</span>
          </button>

          <button
            onClick={() => scrollToSection("sound-lab")}
            className="px-6 py-3 rounded-full cyber-glass border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-purple-100 font-mono text-xs tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-600/10"
          >
            <Music size={14} className="text-purple-400" />
            <span>7YNX Sound Lab</span>
          </button>
        </div>

        {/* Quick Capabilities Highlights Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-3 w-full max-w-3xl text-left">
          <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-cyan-400/30 transition-colors">
            <Cpu size={16} className="text-cyan-400 mb-1.5" />
            <h4 className="font-display font-bold text-xs text-zinc-200">Embedded & AAOS</h4>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">CAN Bus, VLSI, Cockpit CDC</p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-emerald-400/30 transition-colors">
            <Terminal size={16} className="text-emerald-400 mb-1.5" />
            <h4 className="font-display font-bold text-xs text-zinc-200">Linux & Kernel</h4>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Arch Linux, AOSP, Root, Shell</p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-purple-400/30 transition-colors">
            <Sparkles size={16} className="text-purple-400 mb-1.5" />
            <h4 className="font-display font-bold text-xs text-zinc-200">WebGL & Creative</h4>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Three.js, GLSL, Shaders</p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-white/5 hover:border-pink-400/30 transition-colors">
            <Shield size={16} className="text-pink-400 mb-1.5" />
            <h4 className="font-display font-bold text-xs text-zinc-200">Security & Bug Bounty</h4>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">7chats Winner, PenTesting</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection("projects")}
          className="mt-14 text-zinc-600 hover:text-cyan-400 transition-colors animate-bounce"
          aria-label="Scroll to projects"
        >
          <ChevronDown size={22} />
        </button>
      </div>
    </section>
  );
};
