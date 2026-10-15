import React, { useState, useCallback, useRef, useEffect } from "react";
import { ImmersiveRoom, ROOM_POSTERS, ROOM_ZONES, type FurnitureEditRequest, type RoomPosterId, type ZoneId } from "../components/ImmersiveRoom";
import { SoundLab } from "../components/SoundLab";
import { BedroomAudioPlayer } from "../components/BedroomAudioPlayer";
import PhoneExperience from "../components/PhoneExperience";
import { soundFX } from "../utils/audioFX";
import {
  X, ArrowLeft, Disc3, Award, GraduationCap,
  Terminal, Cpu, Music, Layers, Shield, ChevronRight,
  Monitor, Zap, BookOpen, Headphones, Save,
  Grid, Eye, BedDouble, Sparkles, Move, RotateCcw,
} from "lucide-react";

interface BedroomSpacePageProps {
  onNavigatePortfolio: () => void;
  onNavigateCommunity: () => void;
}

// ── Moto-Card 3D Perspective Tilt Card Primitive ────────────────────────────
interface MotoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const MotoCard: React.FC<MotoCardProps> = ({ children, className = "", glowColor = "rgba(0, 242, 254, 0.18)" }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    setRotation({ x: rotX, y: rotY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.25 });
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
      className={`perspective-1000 group ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.12s ease-out, box-shadow 0.3s ease",
        }}
        className="preserve-3d relative w-full h-full rounded-2xl cyber-glass border border-white/10 hover:border-cyan-400/50 p-6 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* Holographic Specular Glare (moto-card.com style) */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${glowColor}, transparent 65%)`,
          }}
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-200 z-30"
        />
        {children}
      </div>
    </div>
  );
};

// ── Modal Deep-Dive Content for All 7 Interactive 3D Zones ─────────────────
const ZONE_CONTENT: Record<ZoneId, React.ReactNode> = {

  // 1. Cockpit Domain Controller & AAOS Engineering
  monitor_left: (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-black/80 to-blue-950/40 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-cyan-400" />
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              [ 01 // AUTOMOTIVE SYSTEMS & AAOS ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            Cockpit Domain Controller
          </h2>
          <p className="text-xs sm:text-[11px] text-zinc-300 font-sans leading-relaxed">
            Architected and engineered for the <span className="text-cyan-400 font-bold">Luxoft CDC Project</span>. High-performance automotive Cockpit Domain Controller built on <span className="text-cyan-300">Android Automotive OS (AAOS)</span>. Integrates high-throughput CAN bus transceivers, Vehicle Hardware Abstraction Layer (VHAL) mapping, and low-latency digital instrument cluster telemetry.
          </p>
        </div>
      </div>

      {/* Engineering Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "CAN 2.0B Throughput", value: "~8,120 / s", sub: "Zero frame drops at peak load", col: "text-cyan-400" },
          { label: "VHAL Services", value: "14 Services", sub: "CarService & Sensor daemons", col: "text-blue-400" },
          { label: "ECU Nodes Interfaced", value: "6 ECUs", sub: "Powertrain, Body, Telematics", col: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1">
            <div className={`text-xl font-display font-bold ${stat.col}`}>{stat.value}</div>
            <div className="text-[11px] font-mono text-zinc-200">{stat.label}</div>
            <div className="text-[10px] text-zinc-500">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Architecture Decomposition */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Layers size={13} className="text-cyan-400" /> Layered Automotive Architecture
        </h3>

        {[
          {
            layer: "01 // Instrument Cluster & HMI Layer",
            tech: ["AAOS Cockpit UI", "CarService API", "ClusterRendererService", "Jetpack Automotive"],
            desc: "Custom Android Automotive system apps rendering digital speed, RPM, ADAS alerts, and EV state of charge.",
          },
          {
            layer: "02 // Vehicle HAL (VHAL) Interface",
            tech: ["VehiclePropertyIds", "HAL C++ Daemon", "SELinux Automotive Policies", "HIDL / AIDL"],
            desc: "Bridging Android CarService to hardware peripherals through strict AIDL vehicle property mapping.",
          },
          {
            layer: "03 // Bus & Microcontroller Hardware",
            tech: ["MCP2515 CAN Controller", "TJA1050 Transceiver", "CAN 2.0B Standard", "OBD-II Telemetry"],
            desc: "Hardware transceiver boards interfacing directly with vehicle powertrain and chassis bus segments.",
          },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2">
            <div className="text-xs font-mono font-bold text-cyan-300">{item.layer}</div>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tech.map((t) => (
                <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-cyan-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MediVend Capstone Hardware Showcase */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-black/80 to-purple-950/40 border border-blue-500/30 space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            CAPSTONE HARDWARE // MEDIVEND
          </span>
        </div>
        <h4 className="text-xl font-display font-bold text-white">
          Intelligent Medicine Vending Machine
        </h4>
        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          B.E. final-year capstone engineering project combining <span className="text-blue-400">VLSI Digital Logic Design</span>, custom Arduino Mega microcontroller firmware, RFID authentication, and servo-driven pill dispensing mechanisms.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {["Verilog HDL", "Arduino Mega", "RFID Reader", "Servo PWM", "Custom PCB", "I2C LCD", "EEPROM Storage"].map((tag) => (
            <span key={tag} className="text-[10px] font-mono px-2.5 py-1 rounded bg-blue-950/70 border border-blue-500/30 text-blue-200">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  ),

  // 2. WebGL Creative Studio & Shaders
  monitor_right: (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-purple-950/60 via-black/80 to-pink-950/40 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-purple-400" />
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest">
              [ 02 // WEBGL & GLSL SHADERS ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            WebGL & Audio Shaders Lab
          </h2>
          <p className="text-xs sm:text-[11px] text-zinc-300 font-sans leading-relaxed">
            High-performance graphics pipelines built with <span className="text-purple-300 font-bold">Three.js</span>, custom GLSL vertex/fragment shaders, and procedural Web Audio API fast-Fourier-transform (FFT) frequency analysis.
          </p>
        </div>
      </div>

      {/* Featured WebGL Projects */}
      <div className="space-y-4">
        {[
          {
            title: "SmokeVisualizer (1,114 Lines GLSL)",
            badge: "CORE MASTERPIECE",
            desc: "Full-screen audio visualizer engine with 4 switchable modes: RetroTerminal oscilloscope, ClassicSmoke particle drift, EnhancedSmoke fluid turbulence, and BlackHoleSpace 3D gravitational starfield.",
            tags: ["GLSL", "Web Audio API", "Three.js", "Fluid Simulation", "FFT Spectrum"],
            color: "purple",
          },
          {
            title: "BlackHoleUniverse (8,000 Particles)",
            badge: "RELATIVISTIC SIMULATION",
            desc: "Gravitationally bound 8,000-particle starfield simulation featuring orbital physics, accretion disc geometry, and audio-reactive camera gravitational zoom pulses.",
            tags: ["Three.Points", "Custom ShaderMaterial", "Orbital Physics", "Bloom"],
            color: "cyan",
          },
          {
            title: "CyberpunkRoom (523 Lines Three.js)",
            badge: "SPATIAL SHOWROOM",
            desc: "Interactive 3D bedroom studio featuring cursor smoke particle trails, dramatic rim lighting rigs, and smooth orbit camera controls.",
            tags: ["Three.js", "Particle Buffers", "ACES Filmic Tone Mapping"],
            color: "pink",
          },
        ].map((proj, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-black/50 border border-white/5 hover:border-purple-500/30 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300">{proj.title}</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                {proj.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">{proj.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {proj.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  // 3. Linux & Battlestation
  pc_case: (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-black/80 to-slate-950/50 border border-cyan-400/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-cyan-400" />
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
              [ 03 // ARCH LINUX WORKSTATION ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            Daily Driver Battlestation
          </h2>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Operating system engineered for high-throughput development, kernel diagnostics, and custom AOSP Android ROM builds.
          </p>
        </div>
      </div>

      {/* System Telemetry Specs */}
      <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/20 font-mono text-xs text-zinc-300 space-y-2">
        <div className="text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
          $ neofetch --stdout
        </div>
        <div><span className="text-zinc-500">OS:</span> Arch Linux x86_64 (Rolling Release)</div>
        <div><span className="text-zinc-500">Compositor:</span> Hyprland (Wayland)</div>
        <div><span className="text-zinc-500">Kernel:</span> 6.12.x-zen-lowlatency</div>
        <div><span className="text-zinc-500">Editor:</span> Neovim (Lua LSP + Tree-sitter)</div>
        <div><span className="text-zinc-500">Shell:</span> ZSH + Starship prompt</div>
        <div><span className="text-zinc-500">Terminal:</span> Alacritty (GPU accelerated)</div>
      </div>

      {/* Bug Bounty Verification Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-black/80 border border-emerald-500/30 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
          <Shield size={24} />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
            VERIFIED BUG BOUNTY WINNER // SEPT 2021
          </div>
          <h4 className="text-base font-display font-bold text-white">
            7chats Messenger Security Contest
          </h4>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Discovered and responsibly disclosed an authentication bypass vulnerability within the 7chats Messenger client. Awarded winner and official bounty recognition.
          </p>
        </div>
      </div>
    </div>
  ),

  // 4. 7YNX Sound Station
  audio_rig: (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-pink-950/60 via-black/80 to-purple-950/50 border border-pink-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Music size={15} className="text-pink-400" />
            <span className="text-[11px] font-mono text-pink-400 uppercase tracking-widest">
              [ 04 // 7YNX MUSIC PRODUCTION ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            Electronic Music Producer
          </h2>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Crafting heavy sidechain future bounce, modular synthesizer riffs, and atmospheric melodic techno under the artist alias <span className="text-pink-400 font-bold">7YNX</span>.
          </p>
        </div>
      </div>

      {/* Embedded Live Interactive SoundLab Player */}
      <div className="rounded-2xl overflow-hidden border border-pink-500/30">
        <SoundLab />
      </div>

      {/* Production Toolkit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { name: "FL Studio 21 Power User", role: "Primary DAW", desc: "Routing, automation clips, advanced mixer routing" },
          { name: "Xfer Serum", role: "Wavetable Synth", desc: "Custom supersaw leads, bass pluck design, vocal chops" },
          { name: "FabFilter Total Bundle", role: "Mixing & Mastering", desc: "Pro-Q3 dynamic EQ, Pro-C2 sidechain compression, Pro-L2 limiter" },
          { name: "Near-Field Studio Monitors", role: "Acoustic Reference", desc: "Flat frequency response, accurate stereo imaging" },
        ].map((tool, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-xs font-mono font-bold text-pink-300">{tool.name}</div>
            <div className="text-[10px] font-mono text-purple-400">{tool.role}</div>
            <div className="text-xs text-zinc-400">{tool.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  // 5. Achievements & Credentials
  bookshelf: (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-black/80 to-teal-950/40 border border-emerald-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              [ 05 // CREDENTIALS & ACADEMICS ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            Engineering Credentials
          </h2>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Verified academic degrees, professional software internships, and certified technical training.
          </p>
        </div>
      </div>

      {/* Education Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <GraduationCap size={13} className="text-emerald-400" /> Academic Degree
        </h3>

        <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-display font-bold text-white">
              Don Bosco Institute of Technology (DBIT)
            </h4>
            <span className="text-xs font-mono text-emerald-400 font-bold">CGPA: 7.16</span>
          </div>
          <div className="text-xs font-mono text-cyan-300">
            Bachelor of Engineering (B.E.) in Electronics & Communication Engineering (2021 – 2025)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            Coursework: Embedded Systems, VLSI Chip Design, Digital Signal Processing, Computer Networks & Network Security, Telecommunications, Electric Vehicles & Control Systems.
          </p>
        </div>
      </div>

      {/* Certifications List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Award size={13} className="text-emerald-400" /> Verified Certifications
        </h3>

        {[
          { title: "Bug Bounty Contest Winner", org: "7chats Messenger", date: "Sept 2021", tag: "Security" },
          { title: "VLSI Digital Design - Chip Design & Verilog", org: "Online Certification", date: "July 2024", tag: "Hardware" },
          { title: "Network Security Fundamentals", org: "Technical Certificate", date: "Feb 2025", tag: "Networking" },
          { title: "Basics of Python Programming", org: "Certified Course", date: "July 2024", tag: "Software" },
        ].map((cert, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-white">{cert.title}</div>
              <div className="text-[11px] text-zinc-500">{cert.org} · {cert.date}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-300">
              {cert.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),

  // 6. Digital Art Sanctuary
  poster_wall: (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 text-sm text-zinc-300">
      Choose one of the framed prints to open its own image view.
    </div>
  ),

  // 7. Acoustic Library & Headphones
  headphones: (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative p-7 rounded-3xl bg-gradient-to-br from-pink-950/60 via-black/80 to-purple-950/50 border border-pink-500/30 overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Headphones size={15} className="text-pink-400" />
            <span className="text-[11px] font-mono text-pink-400 uppercase tracking-widest">
              [ 07 // ACOUSTIC ENVIRONMENT ]
            </span>
          </div>
          <h2 className="text-3xl sm:text-2xl font-display font-extrabold text-white">
            Audio Gear & Acoustic Sanctuary
          </h2>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Studio monitoring equipment and sound design pipelines calibrated for low-distortion, flat frequency response, and spatial immersion.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { title: "Studio Reference Headphones", spec: "Open-Back Dynamic", use: "Spatial soundstage checking and clinical EQ balance" },
          { title: "High-Resolution DAC / Interface", spec: "24-bit / 192kHz", use: "Ultra-low latency ASIO drivers for live MIDI key tracking" },
          { title: "Procedural Soundscapes", spec: "Pink Noise & Rain Generator", use: "Custom Web Audio API pink noise filter loop designed for deep flow states" },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-xs font-mono font-bold text-pink-300">{item.title}</div>
            <div className="text-[10px] font-mono text-zinc-500">{item.spec}</div>
            <p className="text-xs text-zinc-400">{item.use}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ── Slide-Out Exhibition Drawer Modal (BOC Studio & Emotion Agency Style) ───
interface ZoneModalProps {
  zoneId: ZoneId;
  onClose: () => void;
  onPosterClick: (posterId: RoomPosterId) => void;
}

const PosterCard: React.FC<{ posterId: RoomPosterId; onSelect: (posterId: RoomPosterId) => void }> = ({ posterId, onSelect }) => {
  const poster = ROOM_POSTERS.find((item) => item.id === posterId)!;
  return (
    <button
      type="button"
      onClick={() => onSelect(poster.id)}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition hover:border-amber-300/50 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <div className="h-48 overflow-hidden bg-black/40">
        <img src={poster.image} alt={poster.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-display text-sm font-bold text-white">{poster.title}</h3>
        <p className="text-xs leading-relaxed text-zinc-400">{poster.caption}</p>
      </div>
    </button>
  );
};

const PosterGallery: React.FC<{ onSelect: (posterId: RoomPosterId) => void }> = ({ onSelect }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-black/80 to-purple-950/40 p-7">
      <div className="mb-3 flex items-center gap-2 text-amber-400">
        <Monitor size={15} />
        <span className="text-[11px] font-mono uppercase tracking-widest">[ 06 // DIGITAL ART & 4K WALLPAPERS ]</span>
      </div>
      <h2 className="font-display text-2xl font-extrabold text-white">Curated Visual Art Wall</h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-300">Select a print to view that artwork on its own.</p>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ROOM_POSTERS.map((poster) => <PosterCard key={poster.id} posterId={poster.id} onSelect={onSelect} />)}
    </div>
  </div>
);

const PosterView: React.FC<{ posterId: RoomPosterId; onClose: () => void }> = ({ posterId, onClose }) => {
  const poster = ROOM_POSTERS.find((item) => item.id === posterId)!;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05050a]/95 p-4 backdrop-blur-xl sm:p-8" role="dialog" aria-modal="true" aria-label={poster.title}>
      <button onClick={onClose} className="absolute inset-0 cursor-default" aria-label="Close artwork view" />
      <section className="relative z-10 flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b13] shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300">Digital art sanctuary</div>
            <h2 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">{poster.title}</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/15 hover:text-white" aria-label="Close artwork view">
            <X size={16} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4 sm:p-7">
          <img src={poster.image} alt={poster.title} className="max-h-[min(68vh,760px)] w-full rounded-2xl object-contain" />
          <p className="max-w-2xl text-center text-sm leading-relaxed text-zinc-400">{poster.caption}</p>
        </div>
      </section>
    </div>
  );
};

const ZoneModal: React.FC<ZoneModalProps> = ({ zoneId, onClose, onPosterClick }) => {
  const zone = ROOM_ZONES[zoneId];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        soundFX.playClick();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={() => {
          soundFX.playClick();
          onClose();
        }}
        aria-label="Close exhibition panel"
      />

      {/* Slide-In Side Exhibition Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative z-10 ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#06060e] shadow-2xl"
        style={{ animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Fixed panel header stays available while the detail content scrolls. */}
        <div className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#06060e]/95 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: zone.color }} />
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{zone.code}</div>
              <h2 id="zone-modal-title" className="text-sm font-display font-bold text-white">{zone.label}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label="Close exhibition modal"
            title="Close details"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-20">
          {zoneId === "poster_wall" ? <PosterGallery onSelect={onPosterClick} /> : ZONE_CONTENT[zoneId]}
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ─────────────────────────────────────────────────────
export const BedroomSpacePage: React.FC<BedroomSpacePageProps> = ({
  onNavigatePortfolio,
  onNavigateCommunity,
}) => {
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [activePoster, setActivePoster] = useState<RoomPosterId | null>(null);
  const [targetZone, setTargetZone] = useState<ZoneId | "overview">("overview");
  const [viewMode, setViewMode] = useState<"3d" | "catalog">("3d");
  const [roomTheme, setRoomTheme] = useState<"cyberpunk" | "anime-bedroom">(() => {
    try {
      const saved = window.localStorage.getItem("zynx-bedroom-theme-v1");
      if (saved === "cyberpunk" || saved === "anime-bedroom") return saved;
    } catch {
      // Storage unavailable
    }
    return "anime-bedroom";
  });
  const [nightMode, setNightMode] = useState(() => {
    try {
      return window.localStorage.getItem("zynx-bedroom-lighting-v1") === "night";
    } catch {
      return false;
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [resetLayoutSignal, setResetLayoutSignal] = useState(0);
  const [saveDefaultLayoutSignal, setSaveDefaultLayoutSignal] = useState(0);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [furnitureEditRequest, setFurnitureEditRequest] = useState<FurnitureEditRequest>({ sequence: 0, action: "rotate", degrees: 0 });
  const [musicOpen, setMusicOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const toggleRoomLighting = useCallback(() => {
    soundFX.playClick();
    setNightMode(current => {
      const next = !current;
      try {
        window.localStorage.setItem("zynx-bedroom-lighting-v1", next ? "night" : "day");
      } catch {
        // The room switch remains usable when browser storage is unavailable.
      }
      return next;
    });
  }, []);


  const handleZoneClick = useCallback((zoneId: ZoneId) => {
    soundFX.playClick();
    setActiveZone(zoneId);
  }, []);

  const handlePhoneClick = useCallback(() => {
    soundFX.playClick();
    setActiveZone(null);
    setActivePoster(null);
    setTargetZone("overview");
    setEditMode(false);
    setSelectedFurniture(null);
    setPhoneOpen(true);
  }, []);

  const handlePosterClick = useCallback((posterId: RoomPosterId) => {
    soundFX.playClick();
    setActiveZone(null);
    setActivePoster(posterId);
  }, []);

  const handleRoomEscape = useCallback(() => {
    setTargetZone("overview");
    setActiveZone(null);
    setActivePoster(null);
  }, []);

  const closePoster = useCallback(() => setActivePoster(null), []);

  const requestFurnitureRotation = (degrees: number) => {
    setFurnitureEditRequest(request => ({ sequence: request.sequence + 1, action: "rotate", degrees }));
  };
  const requestFurnitureDock = (side: "left" | "right") => {
    setFurnitureEditRequest(request => ({ sequence: request.sequence + 1, action: "dock", side }));
  };

  const handleDockSelect = (zoneId: ZoneId | "overview") => {
    soundFX.playClick();
    soundFX.playZoom();
    setTargetZone(zoneId);
    if (zoneId !== "overview") {
      setActiveZone(zoneId);
    } else {
      setActiveZone(null);
    }
  };

  return (
    <div className="fixed inset-0 top-[57px] bg-[#030306] overflow-hidden select-none">
      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeInDown {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      {/* Small corner controls keep the room as the main event. */}
      <header className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => { soundFX.playClick(); onNavigatePortfolio(); }}
            className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 text-[11px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-300/60 hover:text-white"
            aria-label="Back to developer portfolio"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Portfolio</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setViewMode(viewMode === "3d" ? "catalog" : "3d");
              setEditMode(false);
              setSelectedFurniture(null);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/45 text-zinc-300 shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:text-white"
            aria-label={viewMode === "3d" ? "Open room catalog" : "Return to 3D room"}
            title={viewMode === "3d" ? "Room catalog" : "3D room"}
          >
            {viewMode === "3d" ? <Grid size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <div className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1 shadow-lg backdrop-blur-xl">
          <button
            onClick={() => {
              soundFX.playClick();
              setRoomTheme("cyberpunk");
              try { window.localStorage.setItem("zynx-bedroom-theme-v1", "cyberpunk"); } catch {}
              setTargetZone("overview");
              setActiveZone(null);
              setEditMode(false);
              setSelectedFurniture(null);
            }}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-mono transition sm:px-3 sm:text-[11px] ${roomTheme === "cyberpunk" ? "bg-cyan-300 text-[#071014] font-bold" : "text-zinc-300 hover:text-white"}`}
            aria-pressed={roomTheme === "cyberpunk"}
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">Cyberpunk Space</span>
            <span className="sm:hidden">Space</span>
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              setRoomTheme("anime-bedroom");
              try { window.localStorage.setItem("zynx-bedroom-theme-v1", "anime-bedroom"); } catch {}
              setTargetZone("overview");
              setActiveZone(null);
              setEditMode(false);
              setSelectedFurniture(null);
            }}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-mono transition sm:px-3 sm:text-[11px] ${roomTheme === "anime-bedroom" ? "bg-rose-200 text-[#281c2b] font-bold" : "text-zinc-300 hover:text-white"}`}
            aria-pressed={roomTheme === "anime-bedroom"}
          >
            <BedDouble size={12} />
            <span className="hidden sm:inline">Anime Bedroom</span>
            <span className="sm:hidden">Bedroom</span>
          </button>
        </div>
      </header>

      {/* ── MODE 1: FULL 3D INTERACTIVE ROOM VIEWPORT ─────────────────────── */}
      {viewMode === "3d" && (
        <div className="w-full h-full relative">
          <ImmersiveRoom
            onZoneClick={handleZoneClick}
            activeZoneId={targetZone}
            theme={roomTheme}
            nightMode={nightMode}
            onLightingToggle={toggleRoomLighting}
            editMode={editMode}
            onEditModeChange={setEditMode}
            onEscape={handleRoomEscape}
            onFurnitureSelect={setSelectedFurniture}
            resetLayoutSignal={resetLayoutSignal}
            saveDefaultLayoutSignal={saveDefaultLayoutSignal}
            snapToGrid={snapToGrid}
            furnitureEditRequest={furnitureEditRequest}
            onPosterClick={handlePosterClick}
            onPhoneClick={handlePhoneClick}
          />

          <div className="absolute left-4 top-[4.25rem] z-20 flex max-w-[calc(100%-2rem)] flex-col gap-2 pointer-events-auto">
            <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">
              {roomTheme === "cyberpunk" ? "Cyberpunk Space" : "Anime Bedroom Studio"}
            </div>
            <button
              onClick={() => { soundFX.playClick(); setEditMode(!editMode); setSelectedFurniture(null); }}
              className={`flex h-9 items-center gap-2 self-start rounded-full border px-3 text-[11px] font-mono shadow-lg backdrop-blur-xl transition ${editMode ? "border-rose-200/50 bg-rose-100 text-[#281c2b]" : "border-white/10 bg-black/45 text-zinc-200 hover:border-cyan-200/50 hover:text-white"}`}
              aria-pressed={editMode}
            >
              <Move size={13} />
              {editMode ? "Finish arranging" : "Arrange room"}
            </button>
            {editMode && (
              <>
                <div className="max-w-[320px] rounded-2xl border border-white/10 bg-black/65 px-3 py-2 text-[10px] leading-relaxed text-zinc-300 backdrop-blur-xl">
                  {selectedFurniture ? <span className="text-white">Selected: {selectedFurniture}</span> : "Drag a room piece to move it"}
                  <span className="block text-zinc-500">Drag or arrows to move · PC tower and phone stay on the desk · Q/E rotates 15° · Tab cycles stacked pieces · middle-drag orbits · auto-saves here</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { soundFX.playClick(); setSnapToGrid(!snapToGrid); }}
                    className={`flex h-8 items-center rounded-full border px-2.5 text-[10px] font-mono shadow-lg backdrop-blur-xl transition ${snapToGrid ? "border-cyan-200/40 bg-cyan-950/65 text-cyan-100" : "border-amber-200/40 bg-amber-950/65 text-amber-100"}`}
                    aria-pressed={snapToGrid}
                  >
                    {snapToGrid ? "Grid snap · ¼ m" : "Free move"}
                  </button>
                  {selectedFurniture && (
                    <>
                      <button
                        onClick={() => { soundFX.playClick(); requestFurnitureRotation(-1); }}
                        className="flex h-8 items-center rounded-full border border-white/10 bg-black/60 px-2 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                        title="Fine rotate the selected object 1 degree counterclockwise"
                      >
                        −1°
                      </button>
                      <button
                        onClick={() => { soundFX.playClick(); requestFurnitureRotation(-15); }}
                        className="flex h-8 items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                        title="Rotate the selected object 15 degrees counterclockwise"
                      >
                        <RotateCcw size={12} /> −15°
                      </button>
                      <button
                        onClick={() => { soundFX.playClick(); requestFurnitureRotation(15); }}
                        className="flex h-8 items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                        title="Rotate the selected object 15 degrees clockwise"
                      >
                        <RotateCcw className="-scale-x-100" size={12} /> +15°
                      </button>
                      <button
                        onClick={() => { soundFX.playClick(); requestFurnitureRotation(1); }}
                        className="flex h-8 items-center rounded-full border border-white/10 bg-black/60 px-2 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                        title="Fine rotate the selected object 1 degree clockwise"
                      >
                        +1°
                      </button>
                      {!(["Anime art wall", "PC tower", "Desk phone"] as string[]).includes(selectedFurniture) && (
                        <>
                          <button
                            onClick={() => { soundFX.playClick(); requestFurnitureDock("left"); }}
                            className="flex h-8 items-center rounded-full border border-white/10 bg-black/60 px-2.5 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                            title="Turn this piece to face into the room and align it flush with the left wall"
                          >
                            Stick left
                          </button>
                          <button
                            onClick={() => { soundFX.playClick(); requestFurnitureDock("right"); }}
                            className="flex h-8 items-center rounded-full border border-white/10 bg-black/60 px-2.5 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/50 hover:text-white"
                            title="Turn this piece to face into the room and align it flush with the right wall"
                          >
                            Stick right
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => { soundFX.playClick(); setResetLayoutSignal((signal) => signal + 1); }}
                  className="flex h-9 items-center gap-2 self-start rounded-full border border-rose-200/25 bg-rose-950/50 px-3 text-[11px] font-mono text-rose-100 shadow-lg backdrop-blur-xl transition hover:border-rose-200/60 hover:bg-rose-900/60"
                  title="Restore the room layout saved as this browser's default"
                >
                  <RotateCcw size={13} />
                  Revert to default
                </button>
                <button
                  onClick={() => { soundFX.playClick(); setSaveDefaultLayoutSignal((signal) => signal + 1); }}
                  className="flex h-9 items-center gap-2 self-start rounded-full border border-cyan-200/25 bg-cyan-950/45 px-3 text-[11px] font-mono text-cyan-100 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/60 hover:bg-cyan-900/50"
                  title="Keep this arrangement as the room's reset default in this browser"
                >
                  <Save size={13} />
                  Make current default
                </button>
              </>
            )}
          </div>

          {/* Compact zone dock: the room stays visible while every exhibit remains one click away. */}
          {!editMode && <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[94vw] overflow-x-auto p-1.5 rounded-full cyber-glass border border-white/15 shadow-2xl backdrop-blur-2xl flex items-center gap-1">
            <button
              onClick={() => handleDockSelect("overview")}
              title="Room overview"
              aria-label="Room overview"
              className={`h-9 w-9 rounded-full text-xs font-mono transition-all flex shrink-0 items-center justify-center ${
                targetZone === "overview" && !activeZone
                  ? "bg-white/20 text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              ↺
            </button>

            {(Object.keys(ROOM_ZONES) as ZoneId[]).map((zid) => {
              const zone = ROOM_ZONES[zid];
              const isSelected = activeZone === zid;
              return (
                <button
                  key={zid}
                  onClick={() => handleDockSelect(zid)}
                  title={zone.label}
                  aria-label={zone.label}
                  className={`h-9 w-9 rounded-full text-sm font-mono transition-all flex shrink-0 items-center justify-center ${
                    isSelected
                      ? "font-bold text-white shadow-lg scale-105"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={isSelected ? { background: zone.color + "33", borderColor: zone.color, border: "1px solid" } : {}}
                >
                  <span style={{ color: zone.color }}>{zone.dot}</span>
                </button>
              );
            })}
          </nav>}

          <div className="absolute bottom-4 right-4 z-30 flex items-end gap-2 pointer-events-auto">
            {musicOpen && (
              <div className="max-w-[min(92vw,25rem)] animate-fadeIn">
                <BedroomAudioPlayer />
              </div>
            )}
            <button
              onClick={() => { soundFX.playClick(); setMusicOpen(!musicOpen); }}
              className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 text-[10px] font-mono text-zinc-200 shadow-lg backdrop-blur-xl transition hover:border-pink-300/50 hover:text-white"
              aria-expanded={musicOpen}
              aria-label={musicOpen ? "Hide room radio" : "Open room radio"}
            >
              <Music size={14} className="text-pink-300" />
              <span className="hidden sm:inline">FM</span>
            </button>
            <button
              onClick={() => { soundFX.playClick(); onNavigateCommunity(); }}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-zinc-300 shadow-lg backdrop-blur-xl transition hover:border-pink-300/50 hover:text-white sm:flex"
              aria-label="Open 7YNX music page"
              title="7YNX music"
            >
              <Disc3 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 2: ARCHITECTURAL CATALOG GRID VIEW (BOC Studio Style) ────── */}
      {viewMode === "catalog" && (
        <div className="w-full h-full overflow-y-auto pt-24 pb-28 px-8 max-w-7xl mx-auto space-y-12 animate-fadeIn">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              [ EXHIBITION ARCHIVE // ALL ZONES & CAPABILITIES ]
            </div>
            <h1 className="text-4xl font-display font-extrabold text-white">
              Spatial Artifacts & Engineering Showcase
            </h1>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Direct access index to all architectural workstations, electronics capstones, GLSL shaders, audio gear, and curated digital artwork.
            </p>
          </div>

          {/* Exhibition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(ROOM_ZONES) as ZoneId[]).map((zid) => {
              const z = ROOM_ZONES[zid];
              return (
                <MotoCard key={zid} glowColor={z.color + "33"}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{z.code}</span>
                      <span className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-white">{z.label}</h3>
                    </div>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setActiveZone(zid);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Examine Zone</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </MotoCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE ZONE MODAL DRAWER ─────────────────────────────────── */}
      {activeZone && (
        <ZoneModal zoneId={activeZone} onClose={() => setActiveZone(null)} onPosterClick={handlePosterClick} />
      )}
      {activePoster && <PosterView posterId={activePoster} onClose={closePoster} />}
      {phoneOpen && <PhoneExperience onClose={() => setPhoneOpen(false)} />}
    </div>
  );
};
