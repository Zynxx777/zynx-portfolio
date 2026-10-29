import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  ExternalLink,
  Folder,
  User,
  Mail,
  Loader2,
  FileText,
  Copy,
  Check,
  Clock,
  Phone,
  Layers
} from 'lucide-react';
import { ZYNX_PROFILE } from '../data/portfolioData';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.6a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 1 0 3.32 0 1.66 1.66 0 0 0-1.66-1.66z" />
  </svg>
);

interface MonitorDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  openResume?: () => void;
  onOpenAnatomy?: () => void;
  onOpenProject?: (projectId: string) => void;
}

interface MonitorProject {
  slug: string;
  name: string;
  kind: string;
  cover?: string;
  tint: string;
  url: string;
  displayUrl: string;
  client: string;
  sector: string;
  location: string;
  stack: string[];
  summary: string;
  bullets: string[];
}

export const MONITOR_PROJECTS: MonitorProject[] = [
  {
    slug: 'zcard',
    name: 'Z Card v0.1',
    kind: 'Universal Smart Everything Card',
    cover: '/images/zcard/blueprint_hero.png',
    tint: '#EBF1F7',
    url: 'https://zynxx777.github.io/ZCard',
    displayUrl: 'zcard.zynx.dev',
    client: 'ZYNX Hardware Research',
    sector: 'Embedded Systems & Smart Cards',
    location: 'Bengaluru, India',
    stack: ['Blender 3D CAD', 'Three.js WebGL', 'nRF52840 BLE', 'E-Paper (EPD)', 'Qi Planar Inductive', 'Secure Element (EAL6+)'],
    summary: 'An all-in-one universal ID and payment card integrating bi-stable e-paper display, micro-solar harvesting, planar Qi wireless charging, and on-card biometrics in an ISO/IEC 7810 ID-1 standard form factor.',
    bullets: [
      'Consolidates debit, transit, national proof-of-identity, and FIDO2 physical authenticators into one unified 1.40mm smart card.',
      'Engineered with 9 harmonized micro-subsystems including 1.54" bi-stable E-Paper, a-Si solar ribbon, and solid-state lithium pouch.',
      'Interactive 3D blueprint CAD modeled in Blender with real-time Three.js WebGL exploded and X-ray inspector.'
    ]
  },
  {
    slug: 'sm-school',
    name: 'S.M. English School',
    kind: 'Educational Platform & Admissions',
    cover: '/images/projects/sm-school-logo.jpg',
    tint: '#FFF1E8',
    url: 'https://sm-english-school-web.vercel.app',
    displayUrl: 'smenglishschool.edu.in',
    client: 'S.M. English School Trust',
    sector: 'Education & Public Institutions',
    location: 'Karnataka, India',
    stack: ['Astro', 'Tailwind CSS', 'TypeScript', 'Supabase', 'Responsive Design'],
    summary: 'A high-performance digital presence for S.M. English School featuring interactive admissions inquiry routing, academic syllabus showcases, and faculty directory.',
    bullets: [
      'Near-instant mobile page loads across rural and suburban connectivity.',
      'Integrated inquiry routing and administrative circular announcements.',
      'Full mobile responsiveness and accessible design.'
    ]
  },
  {
    slug: 'arch-workstation',
    name: 'Arch Linux Workstation',
    kind: 'Custom Dotfiles & System Architecture',
    cover: '/images/space/gaming-cyber-room.jpg',
    tint: '#EDF4FA',
    url: 'https://github.com/Zynxx777/zynx-dotfiles',
    displayUrl: 'arch.zynx.internal',
    client: 'Personal Workstation',
    sector: 'Linux Systems & IT Administration',
    location: 'Channapatna, India',
    stack: ['Arch Linux', 'Hyprland', 'Wayland', 'Bash Scripts', 'Systemd', 'PipeWire'],
    summary: 'Personal daily-driver Arch Linux environment built on Hyprland Wayland compositor, automated pacman hook pipelines, pactree dependency audits, and tailored desktop ergonomics.',
    bullets: [
      'Automated workstation bootstrap pipelines with custom shell scripts.',
      'PipeWire audio routing with sub-5ms buffer latency.',
      'Tiling window manager shortcuts for maximum focus and flow.'
    ]
  },
  {
    slug: 'aaos-cockpit',
    name: 'Luxoft AAOS Cockpit',
    kind: 'Android Automotive OS & CAN Telematics',
    cover: '/images/projects/cockpit-cdc.jpg',
    tint: '#F2EEF9',
    url: 'https://github.com/Zynxx777/luxoft-aaos-project',
    displayUrl: 'telematics.luxoft.cockpit',
    client: 'Academic Research Capstone',
    sector: 'Automotive Embedded Systems',
    location: 'Bengaluru, India',
    stack: ['Android Automotive (AAOS)', 'CAN Bus', 'VHAL', 'Embedded C', 'Microcontrollers'],
    summary: 'Android Automotive OS cockpit cluster research and CAN bus vehicle telemetry interfacing developed during Electronics & Communication Engineering studies.',
    bullets: [
      'Vehicle Hardware Abstraction Layer (VHAL) interactions and cluster synchronization.',
      'Simulated CAN bus packet frames for speedometer, battery telemetry, and warning chimes.',
      'Bridged embedded microcontroller sensors with modern Android cockpit UI.'
    ]
  },
  {
    slug: 'medivend',
    name: 'MediVend Smart Dispenser',
    kind: 'Healthcare Dispenser & Verilog FSM',
    cover: '/images/projects/medivend-hardware.jpg',
    tint: '#E7F6EF',
    url: 'https://github.com/Zynxx777',
    displayUrl: 'medivend.hardware.prototype',
    client: 'DBIT Engineering Capstone',
    sector: 'Biomedical & Embedded Hardware',
    location: 'Bengaluru, India',
    stack: ['Arduino C++', 'Verilog HDL', 'Digital Logic FSM', 'Stepper Actuators', 'Circuit Design'],
    summary: 'Automated healthcare dispensing prototype synthesizing finite state machines, Verilog digital logic, and Arduino microcontroller stepper control.',
    bullets: [
      'Designed hardware schematic and power delivery stages for dispensing stepper servos and optical drop sensors.',
      'Programmed finite state machine in Verilog and integrated Arduino C++ controller for user keypad input.',
      'Built tamper-resistant medicine scheduling logic with real-time buzzer alarms.'
    ]
  },
  {
    slug: 'music-lab',
    name: '7YNX Audio Lab',
    kind: 'Electronic Soundscapes & Synthesis',
    cover: '/images/ambient/lofi-study-night.jpg',
    tint: '#FDF0F3',
    url: 'https://instagram.com/7ynx777',
    displayUrl: '7ynx.music.studio',
    client: '7YNX Music Studio',
    sector: 'Creative Audio & Sound Design',
    location: 'Karnataka, India',
    stack: ['FL Studio', 'Synthesizers', 'Audio Mastering', 'Music Theory', 'Sound Design'],
    summary: 'Personal creative audio production studio releasing under artist alias 7YNX, blending lofi beats, ambient soundscapes, and modular synthesizer sound design.',
    bullets: [
      'Composed and mixed original instrumental soundtracks including "Lofi Study" and "Regardless".',
      'Taught rhythm, notation, and keyboard basics at St. Sophia Convent High School.',
      'Custom modular VST patches and spatial audio sound design.'
    ]
  },
  {
    slug: 'jesper-wave',
    name: 'Jesper Landberg Wave 3D',
    kind: 'Curved WebGL Project Wave',
    cover: '/images/gallery/anime-moon-landscape.jpg',
    tint: '#E8F0FE',
    url: '/#showcase',
    displayUrl: 'zynx-portfolio.vercel.app/#showcase',
    client: 'Showcase Experience',
    sector: 'Creative Front-End & Shaders',
    location: 'Live WebGL',
    stack: ['Three.js', 'Custom GLSL Shaders', 'Raycasting', 'Touch Inertia', 'Responsive UI'],
    summary: 'Faithful replica of Jesper Landberg\'s iconic WebGL cylindrical wave project carousel featuring smooth touch inertia, raycasting, and profile modal.',
    bullets: [
      'WebGL vertex deformation for cylindrical page curvature.',
      'Smooth damping momentum on wheel and touch swipes.',
      'Seamless transition to modal inspection.'
    ]
  },
  {
    slug: '3d-room',
    name: 'ZYNX 3D Bedroom Studio',
    kind: 'Interactive 3D Three.js Spatial Environment',
    cover: '/images/gallery/winter-evening-japanese-village.jpg',
    tint: '#FDF6E2',
    url: '/#space',
    displayUrl: 'zynx-portfolio.vercel.app/#space',
    client: 'Personal Portfolio',
    sector: 'Spatial Web & Three.js',
    location: 'Live 3D',
    stack: ['Three.js', 'OrbitControls', 'Custom Shaders', 'Procedural Audio FX', 'Interactive 3D Furniture'],
    summary: 'A complete 3D interactive bedroom studio featuring a movable desk, clickable gadgets (laptop, tablet, phone, printer, Zoro bobblehead, diary), and customizable themes.',
    bullets: [
      'Realistic PBR materials, soft warm point lighting, and steam particles.',
      'Free draggable furniture arrangement with grid snap.',
      'Spatial audio engine for clicks, page turns, and ambient rain.'
    ]
  }
];

export const MonitorDesktopModal: React.FC<MonitorDesktopModalProps> = ({
  isOpen,
  onClose,
  openResume,
  onOpenAnatomy
}) => {
  // Navigation tabs: 'work' | 'about' | 'contact' | 'browser' | null (null = clean desktop OS background)
  const [activeTab, setActiveTab] = useState<'work' | 'about' | 'contact' | 'browser' | null>('work');
  const [selectedProject, setSelectedProject] = useState<MonitorProject>(MONITOR_PROJECTS[0]);

  // Live site iframe loading status
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Live Local Time in Bengaluru (IST)
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(new Date());
        setLocalTime(timeStr.toLowerCase());
      } catch {
        setLocalTime('3:30 am');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Escape closes active window, or exits back to desk if already on clean OS background
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTab === 'browser') {
          setActiveTab('work');
        } else if (activeTab !== null) {
          setActiveTab(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, activeTab, onClose]);

  // Handle opening a project into the browser window
  const openProjectInBrowser = (project: MonitorProject) => {
    setSelectedProject(project);
    setIframeStatus('loading');
    setActiveTab('browser');

    // Simulate realistic site loading progress
    const timer = setTimeout(() => {
      setIframeStatus('live');
    }, 1800);
    return () => clearTimeout(timer);
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(ZYNX_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Laptop Monitor Workstation"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-[#161210]/65 backdrop-blur-[3px] animate-fade-in select-none overflow-hidden"
    >
      {/* Top Outer Header Bar */}
      <div className="w-full flex items-center justify-between z-20">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-[14px] font-medium text-[#1D1D1F] shadow-md ring-1 ring-black/10 backdrop-blur-xl transition-all hover:bg-white hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the desk
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/60 px-3.5 text-xs font-mono text-zinc-300 ring-1 ring-white/15 hover:text-white hover:bg-black/80 transition-all"
        >
          <span>Esc</span>
        </button>
      </div>

      {/* Center Monitor Chassis & Bezel */}
      <div className="relative w-full max-w-[1240px] flex-1 my-2 flex items-center justify-center">
        
        {/* Sticky Notes Pinned to the Left Bezel */}
        <div className="hidden xl:flex absolute -left-28 top-8 flex-col gap-4 pointer-events-auto z-30">
          {/* Yellow Daily Checklist */}
          <div className="w-36 bg-[#FEF08A] text-slate-800 p-3 rounded-sm shadow-xl rotate-[-3.5deg] border border-amber-300/40 font-hand text-[14px] leading-[1.35] transition-transform hover:rotate-0 hover:scale-105 duration-200">
            <p className="font-bold text-[15px] border-b border-amber-400/50 pb-1 mb-1 text-slate-900">Today</p>
            <p className="text-slate-800">☑ Wake up to reality.</p>
            <p className="text-slate-800">☑ Train. Then again.</p>
            <p className="text-slate-800">☑ Outwork everyone.</p>
            <p className="text-slate-800">☑ Go past the limit.</p>
            <p className="text-slate-800">☑ Accept the pain.</p>
          </div>

          {/* Pink Hiring / Card Note */}
          <div className="w-36 bg-[#FBCFE8] text-slate-800 p-3 rounded-sm shadow-xl rotate-[4deg] border border-pink-300/40 font-hand text-[14px] leading-tight transition-transform hover:rotate-0 hover:scale-105 duration-200">
            <p className="font-bold text-[15px] text-pink-950">Hiring?</p>
            <p className="text-slate-800 mt-1">Got a project?</p>
            <p className="text-slate-800">Take my card ↗</p>
            {onOpenAnatomy && (
              <button
                type="button"
                onClick={onOpenAnatomy}
                className="mt-2 text-[11px] font-mono font-bold text-pink-900 underline block"
              >
                Inspect Z Card
              </button>
            )}
          </div>
        </div>

        {/* Sticky Notes Pinned to the Right Bezel */}
        <div className="hidden xl:flex absolute -right-28 top-8 flex-col gap-4 pointer-events-auto z-30">
          {/* Blue SIUUU Note */}
          <div className="w-36 bg-[#BAE6FD] text-slate-800 p-3 rounded-sm shadow-xl rotate-[3deg] border border-sky-300/40 font-hand text-[15px] leading-snug transition-transform hover:rotate-0 hover:scale-105 duration-200">
            <p className="font-bold text-[18px] text-sky-950">SIUUU! ⚽</p>
            <p className="text-[12px] opacity-75 mt-0.5">Ronaldo mindset.</p>
          </div>

          {/* Green Zoro Note */}
          <div className="w-36 bg-[#BBF7D0] text-slate-800 p-3 rounded-sm shadow-xl rotate-[-2.5deg] border border-emerald-300/40 font-hand text-[14px] leading-snug transition-transform hover:rotate-0 hover:scale-105 duration-200">
            <p className="font-bold text-[15px] text-emerald-950">Nothing happened.</p>
            <p className="text-[12px] opacity-70 mt-1">— Roronoa Zoro</p>
          </div>
        </div>

        {/* Monitor Physical Bezel & Display Screen */}
        <div className="relative w-full h-[620px] md:h-[680px] lg:h-[720px] max-h-[88vh] rounded-[24px] md:rounded-[30px] bg-[#101014] p-3 sm:p-4 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10 flex flex-col overflow-hidden">
          
          {/* Top Webcam Notch */}
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 mx-auto -mt-0.5 mb-2 ring-1 ring-white/10" />

          {/* Actual Desktop Screen Area */}
          <div className="relative w-full flex-1 rounded-[16px] overflow-hidden bg-[#EEF1F7] text-[#1D1D1F] flex flex-col select-none">
            
            {/* Soft Ambient Desktop Aura Glows */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-[10%] -top-[20%] h-[80%] w-[60%] rounded-full bg-[#D9E3FF] blur-[90px]" />
              <div className="absolute -right-[5%] top-[10%] h-[70%] w-[50%] rounded-full bg-[#FBE3D3] blur-[100px]" />
              <div className="absolute bottom-[-30%] left-[25%] h-[70%] w-[55%] rounded-full bg-[#E6F1E4] blur-[100px]" />
            </div>

            {/* MacOS Top Menu Bar */}
            <header className="relative z-20 flex h-8 shrink-0 items-center justify-between bg-white/60 px-4 text-[13px] backdrop-blur-xl border-b border-black/[0.06]">
              <div className="flex items-center gap-5">
                <span className="font-semibold tracking-tight text-zinc-900">Joshua D</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('work')}
                  className={`transition-colors ${activeTab === 'work' || activeTab === 'browser' ? 'text-[#2F5BEA] font-semibold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={`transition-colors ${activeTab === 'about' ? 'text-[#2F5BEA] font-semibold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`transition-colors ${activeTab === 'contact' ? 'text-[#2F5BEA] font-semibold' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  Contact
                </button>
              </div>

              {/* Right: Live Local City & Time */}
              <div className="flex items-center gap-2 tabular-nums text-zinc-700 text-[12px] font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bengaluru {localTime || '3:30 am'}</span>
              </div>
            </header>

            {/* Desktop Workspace */}
            <div className="relative flex-1 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
              
              {/* Right Side Desktop Shortcut Icons */}
              <div className="absolute right-6 top-6 flex flex-col gap-5 z-10">
                <button
                  type="button"
                  onClick={() => setActiveTab('work')}
                  className="group flex w-18 flex-col items-center gap-1.5 focus:outline-none"
                >
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200 group-hover:scale-105 group-hover:bg-white">
                    <Folder className="h-6 w-6 text-[#2F5BEA]" />
                  </span>
                  <span className="rounded px-1.5 text-[11px] font-medium text-zinc-800">Work</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className="group flex w-18 flex-col items-center gap-1.5 focus:outline-none"
                >
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200 group-hover:scale-105 group-hover:bg-white">
                    <User className="h-6 w-6 text-zinc-800" />
                  </span>
                  <span className="rounded px-1.5 text-[11px] font-medium text-zinc-800">About me</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="group flex w-18 flex-col items-center gap-1.5 focus:outline-none"
                >
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-white/85 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200 group-hover:scale-105 group-hover:bg-white">
                    <Mail className="h-6 w-6 text-zinc-800" />
                  </span>
                  <span className="rounded px-1.5 text-[11px] font-medium text-zinc-800">Contact</span>
                </button>
              </div>

              {/* Main Floating MacOS Window */}
              {activeTab !== null ? (
                <div className="relative z-10 w-full max-w-[960px] lg:max-w-[1020px] h-full max-h-[500px] md:max-h-[540px] bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-fade-in transition-all duration-300">
                  
                  {/* Window Chrome Titlebar */}
                  <div className="h-11 shrink-0 bg-[#F7F7F8] border-b border-black/[0.06] px-4 flex items-center justify-between text-zinc-800">
                    {/* Traffic Light Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab === 'browser') setActiveTab('work');
                          else setActiveTab(null);
                        }}
                        title="Close window (stay in desktop OS)"
                        className="h-3 w-3 rounded-full bg-[#FF5F57] ring-1 ring-black/10 hover:opacity-80 transition cursor-pointer"
                      />
                    <span className="h-3 w-3 rounded-full bg-[#FEBC2E] ring-1 ring-black/10" />
                    <span className="h-3 w-3 rounded-full bg-[#28C840] ring-1 ring-black/10" />

                    {activeTab === 'browser' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('work')}
                        className="ml-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-medium text-zinc-700 hover:bg-black/5 transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> All work
                      </button>
                    )}
                  </div>

                  {/* Center Title or Browser URL Bar */}
                  {activeTab === 'browser' ? (
                    <div className="mx-auto flex h-7 max-w-sm sm:max-w-md flex-1 items-center justify-center gap-1.5 rounded-md bg-black/[0.05] px-3 text-[12px] text-zinc-700 font-sans">
                      <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{selectedProject.displayUrl}</span>
                    </div>
                  ) : (
                    <p className="flex-1 text-center text-[13px] font-semibold text-zinc-800 pr-12">
                      {activeTab === 'work' ? 'Work' : activeTab === 'about' ? 'About me' : 'Contact'}
                    </p>
                  )}

                  {/* Right Action */}
                  {activeTab === 'browser' ? (
                    <a
                      href={selectedProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2F5BEA] hover:underline"
                    >
                      <span>Live site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="w-12" />
                  )}
                </div>

                {/* Window Inner Content Body */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  
                  {/* TAB 1: WORK SECTION */}
                  {activeTab === 'work' && (
                    <div className="px-6 sm:px-8 py-6">
                      <h2 className="text-[26px] sm:text-[28px] font-semibold tracking-tight text-zinc-900">
                        Eight projects, all running.
                      </h2>
                      <p className="mt-1 text-[14px] text-zinc-500">
                        Open one to use the real site. Everything here was built by me alone.
                      </p>

                      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                        {MONITOR_PROJECTS.map((proj) => (
                          <button
                            key={proj.slug}
                            type="button"
                            onClick={() => openProjectInBrowser(proj)}
                            className="group text-left focus:outline-none"
                          >
                            <span
                              className="block aspect-[16/10] overflow-hidden rounded-lg ring-1 ring-black/[0.08] transition-all duration-200 group-hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.3)] group-hover:scale-[1.02]"
                              style={{ background: proj.tint }}
                            >
                              {proj.cover ? (
                                <img
                                  src={proj.cover}
                                  alt={proj.name}
                                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                              ) : (
                                <span className="grid h-full place-items-center font-bold text-lg text-zinc-700">
                                  {proj.name}
                                </span>
                              )}
                            </span>
                            <span className="mt-2.5 block text-[14px] font-semibold text-zinc-900 leading-tight">
                              {proj.name}
                            </span>
                            <span className="mt-0.5 block text-[12px] text-zinc-500 truncate">
                              {proj.kind}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LIVE BROWSER WINDOW WITH IFRAME & LOADER */}
                  {activeTab === 'browser' && (
                    <div className="relative w-full h-full min-h-[380px] bg-white overflow-hidden flex flex-col">
                      {/* Loading Screen Overlay Card (Matching pradiplabs.dev exactly) */}
                      {iframeStatus === 'loading' && (
                        <div className="absolute inset-0 z-20 grid place-items-center bg-white/80 backdrop-blur-sm transition-opacity duration-500">
                          <div className="mx-4 w-full max-w-[19rem] rounded-2xl bg-white p-5 text-center shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
                            <p className="flex items-center justify-center gap-2 text-[15px] font-semibold text-zinc-900">
                              <Loader2 className="h-4 w-4 animate-spin text-[#2F5BEA]" />
                              Loading the live site
                            </p>
                            <p className="mt-1 truncate text-[13px] text-zinc-500 font-mono">
                              {selectedProject.displayUrl}
                            </p>
                            {/* Animated progress line */}
                            <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/[0.06]">
                              <div className="h-full rounded-full bg-[#2F5BEA] animate-pulse w-[90%]" />
                            </div>
                            <p className="mt-3 text-[12px] leading-snug text-zinc-400">
                              This is the real site, not a picture. It takes a few seconds.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Fallback Preview & Interactive iframe */}
                      <div className="relative flex-1 w-full h-full overflow-hidden">
                        {/* Live iframe */}
                        <iframe
                          src={selectedProject.url}
                          title={`${selectedProject.name} Live View`}
                          onLoad={() => setIframeStatus('live')}
                          referrerPolicy="strict-origin-when-cross-origin"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          className="w-full h-full border-0 bg-white"
                        />

                        {/* Floating live indicator badge */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center z-10">
                          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-1.5 text-[12px] font-medium text-white shadow-lg backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live. Scroll and click around.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ABOUT ME SECTION */}
                  {activeTab === 'about' && (
                    <div className="px-6 sm:px-10 py-8">
                      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
                        {/* Left column */}
                        <div>
                          <div className="flex items-center gap-4">
                            <img
                              src="/images/profile_pic.png"
                              alt="Joshua D"
                              className="h-[76px] w-[76px] shrink-0 rounded-full object-cover ring-2 ring-black/10 shadow-sm"
                            />
                            <div>
                              <p className="text-[22px] font-semibold tracking-tight text-zinc-900">Joshua D (ZYNX)</p>
                              <p className="text-[14px] text-zinc-500">
                                ECE Engineer · Junior Linux Admin · Full-Stack Craftsman
                              </p>
                            </div>
                          </div>

                          <h2 className="mt-6 text-[26px] font-semibold leading-[1.15] tracking-tight text-zinc-900">
                            Curious first, engineer second.
                          </h2>
                          <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-zinc-600">
                            Electronics and Communication Engineering graduate with deep hands-on expertise in Arch Linux system administration, embedded hardware architecture, and modern WebGL interfaces. Currently building next-generation hardware like Z Card and crafting tactile digital experiences.
                          </p>

                          {/* Badges */}
                          <div className="mt-5 flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[12px] font-medium border border-emerald-200">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Open to full-time roles & freelance
                            </span>

                            {openResume && (
                              <button
                                type="button"
                                onClick={openResume}
                                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-3 py-1 text-[12px] font-medium text-zinc-800 transition"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Download Résumé
                              </button>
                            )}
                          </div>

                          {/* 4 Cards (Matching pradiplabs.dev) */}
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                              <p className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                                💡 I ask a lot of questions
                              </p>
                              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                I study hardware datasheets, kernel logs, and network trace files before writing code.
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                              <p className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                                🖥️ I like simple screens
                              </p>
                              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Fast, keyboard-driven Arch Linux Hyprland tiling workflow tailored for flow state.
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                              <p className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                                ⚙️ I sweat the small stuff
                              </p>
                              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Sub-millimeter 1.40mm ISO card layout, 60fps WebGL rendering, and audio clicks.
                              </p>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                              <p className="font-semibold text-sm text-zinc-900 flex items-center gap-1.5">
                                🚀 Always exploring new tech
                              </p>
                              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Bridging physical hardware (nRF52840, E-Paper, CAN bus) with Three.js web apps.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right column sidebar */}
                        <div className="flex flex-col gap-3">
                          {/* Now Card */}
                          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-5">
                            <p className="flex items-center gap-2 text-[12px] font-semibold text-[#2F5BEA]">
                              <span className="h-2 w-2 rounded-full bg-[#2F5BEA] animate-ping" />
                              Now
                            </p>
                            <p className="mt-2 text-[18px] font-bold text-zinc-900 leading-tight">
                              Z Card v0.1 Architecture
                            </p>
                            <p className="mt-1 text-[13px] text-zinc-500">
                              Hardware Designer & Developer, since 2026
                            </p>
                          </div>

                          {/* Off the clock Card */}
                          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-5 space-y-3">
                            <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
                              Off the clock
                            </p>
                            <div>
                              <p className="text-xs font-bold text-zinc-800">🐧 Arch Linux Ricing</p>
                              <p className="text-[11px] text-zinc-500">Hyprland, Waybar, Alacritty terminal</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800">🎵 7YNX Audio Lab</p>
                              <p className="text-[11px] text-zinc-500">Electronic soundscapes & synthesis</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800">⚔️ Anime & Manga</p>
                              <p className="text-[11px] text-zinc-500">One Piece, Zoro, Bleach</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CONTACT SECTION */}
                  {activeTab === 'contact' && (
                    <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-6 py-10 text-center">
                      <p className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-zinc-900">
                        Let's build something your business runs on.
                      </p>
                      <p className="mt-2 max-w-md text-[14px] text-zinc-500">
                        Available for full-time IT support/Linux roles, embedded hardware projects, and web development.
                      </p>

                      {/* Main Email CTA */}
                      <a
                        href={`mailto:${ZYNX_PROFILE.email}?subject=Hello%20Joshua`}
                        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#2F5BEA] hover:bg-[#2449C7] px-7 text-[15px] font-medium text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                      >
                        <Mail className="h-4 w-4" />
                        {ZYNX_PROFILE.email}
                      </a>

                      {/* Social & Contact Links */}
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-4 text-xs font-medium text-zinc-800 transition"
                        >
                          {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedEmail ? 'Copied to clipboard' : 'Copy email'}
                        </button>

                        <a
                          href={ZYNX_PROFILE.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-4 text-xs font-medium text-zinc-800 transition"
                        >
                          <GithubIcon className="w-3.5 h-3.5" /> GitHub
                        </a>

                        <a
                          href={ZYNX_PROFILE.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-4 text-xs font-medium text-zinc-800 transition"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                        </a>

                        <a
                          href={ZYNX_PROFILE.socials.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 px-4 text-xs font-medium text-zinc-800 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Background OS State: When all windows are closed, user stays in macOS desktop */
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto animate-fade-in select-none">
                <div className="w-20 h-20 rounded-3xl bg-white/75 shadow-xl ring-1 ring-black/5 backdrop-blur-2xl flex items-center justify-center mb-4 text-[#2F5BEA]">
                  <Folder className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Joshua OS</h3>
                <p className="text-[13px] text-zinc-600 mt-1.5 leading-relaxed max-w-sm">
                  Windows closed. Click any application from the right desktop shortcuts, top menu bar, or dock below.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('work')}
                    className="px-4 py-2 rounded-full bg-[#2F5BEA] text-white text-xs font-semibold shadow-md hover:bg-blue-600 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Open Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className="px-4 py-2 rounded-full bg-white/85 ring-1 ring-black/10 text-zinc-800 text-xs font-semibold shadow-sm hover:bg-white transition active:scale-95 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>About Me</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className="px-4 py-2 rounded-full bg-white/85 ring-1 ring-black/10 text-zinc-800 text-xs font-semibold shadow-sm hover:bg-white transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>
                </div>

                <p className="mt-4 text-[11px] font-mono text-zinc-400">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-black/10 text-zinc-700 font-bold">Esc</kbd> or click Back to exit to desk
                </p>
              </div>
            )}

            </div>

            {/* Bottom Floating MacOS Dock */}
            <div className="relative z-20 pb-3 flex justify-center">
              <div className="flex items-end gap-2 rounded-[22px] bg-white/65 p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
                {/* Work Folder */}
                <button
                  type="button"
                  onClick={() => setActiveTab('work')}
                  title="Work (8 Live Projects)"
                  className="relative flex flex-col items-center transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-115 focus:outline-none"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[20%] bg-[#2F5BEA] text-white shadow-sm ring-1 ring-black/5">
                    <Folder className="h-5 w-5" />
                  </span>
                  {activeTab === 'work' && (
                    <span className="w-1 h-1 rounded-full bg-zinc-800 mt-1" />
                  )}
                </button>

                {MONITOR_PROJECTS.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => openProjectInBrowser(p)}
                    title={p.name}
                    className="relative transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-115 focus:outline-none"
                  >
                    <span
                      className="block h-10 w-10 rounded-[20%] overflow-hidden shadow-sm ring-1 ring-black/[0.08]"
                      style={{ background: p.tint }}
                    >
                      {p.cover ? (
                        <img src={p.cover} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-xs font-bold text-zinc-700">
                          {p.name.slice(0, 2)}
                        </span>
                      )}
                    </span>
                    {activeTab === 'browser' && selectedProject.slug === p.slug && (
                      <span className="w-1 h-1 rounded-full bg-zinc-800 mt-1" />
                    )}
                  </button>
                ))}

                <span className="mx-1 h-8 w-px self-center bg-black/10" aria-hidden="true" />

                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  title="About me"
                  className="relative grid h-10 w-10 place-items-center rounded-[20%] bg-white/90 shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-115"
                >
                  <User className="h-5 w-5 text-zinc-800" />
                  {activeTab === 'about' && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-zinc-800" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  title="Contact"
                  className="relative grid h-10 w-10 place-items-center rounded-[20%] bg-[#2F5BEA] text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-115"
                >
                  <Mail className="h-5 w-5" />
                  {activeTab === 'contact' && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>

                {openResume && (
                  <button
                    type="button"
                    onClick={openResume}
                    title="Open Resume"
                    className="grid h-10 w-10 place-items-center rounded-[20%] bg-emerald-600 text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-115"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                )}

                {onOpenAnatomy && (
                  <button
                    type="button"
                    onClick={onOpenAnatomy}
                    title="Anatomy CAD Reveal"
                    className="grid h-10 w-10 place-items-center rounded-[20%] bg-purple-600 text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-115"
                  >
                    <Layers className="h-5 w-5" />
                  </button>
                )}

                <span className="mx-0.5 h-8 w-px self-center bg-black/10" aria-hidden="true" />

                <button
                  type="button"
                  onClick={onClose}
                  title="Back to Desk (Esc)"
                  className="grid h-10 w-10 place-items-center rounded-[20%] bg-white/95 text-zinc-800 shadow-sm ring-1 ring-black/10 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-115"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
