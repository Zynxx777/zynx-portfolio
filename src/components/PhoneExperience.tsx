import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BatteryFull,
  Bot,
  Check,
  Disc,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Home,
  Images,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Music,
  Pause,
  PhoneCall,
  Play,
  RotateCcw,
  Search,
  Send,
  Signal,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { downloadVCard } from "../utils/cardCanvas";
import { soundFX } from "../utils/audioFX";
import { ZYNX_PROFILE } from "../data/portfolioData";

export type PhoneApp = "home" | "site" | "music" | "chat" | "phone" | "gallery";

export interface PhoneExperienceProps {
  onClose: () => void;
  initialApp?: PhoneApp;
  onOpenProject?: (projectId: string) => void;
}

interface LiveSiteEntry {
  id: string;
  projectId: string;
  shortName: string;
  title: string;
  subtitle: string;
  displayUrl: string;
  liveUrl: string;
  description: string;
  quickQuestions: string[];
  accentColor: string;
  heroTitle: string;
  heroBadge: string;
  listings: {
    id: string;
    title: string;
    tag: string;
    meta: string;
    summary: string;
    image: string;
  }[];
}

const LIVE_SITES: LiveSiteEntry[] = [
  {
    id: "sm-school",
    projectId: "sm-school",
    shortName: "S.M. School",
    title: "S.M. English School",
    subtitle: "Live school portal & admissions site",
    displayUrl: "sm-english-school-web.vercel.app",
    liveUrl: "https://sm-english-school-web.vercel.app",
    description:
      "Production multi-page school website built with Astro, Tailwind CSS & Supabase admin controls — live inside the phone.",
    quickQuestions: [
      "Tell me about S.M. English School",
      "What tech stack runs this site?",
      "Are you open for web or IT projects?",
    ],
    accentColor: "#16a34a",
    heroTitle: "ACADEMICS, ADMISSIONS & CAMPUS UPDATES",
    heroBadge: "Live Vercel Site",
    listings: [
      {
        id: "sm-adm",
        title: "Admissions 2026–27 Open",
        tag: "ADMISSIONS",
        meta: "Nursery to Grade X · Karnataka",
        summary:
          "Fast mobile-first admission enquiry form with instant parent guidance and structured fee overview.",
        image: "/images/projects/sm-school-logo.jpg",
      },
      {
        id: "sm-curr",
        title: "Interactive Science & Computer Labs",
        tag: "CAMPUS",
        meta: "STEM & Digital Literacy",
        summary:
          "Showcases classroom curriculum highlights, faculty directory, and campus calendar on mobile.",
        image: "/images/projects/lofi-bedroom.jpg",
      },
      {
        id: "sm-portal",
        title: "Circulars & Supabase Admin Noticeboard",
        tag: "LIVE PORTAL",
        meta: "Zero-latency Astro SSR",
        summary:
          "Sub-second page loads over rural mobile networks with authenticated staff notice publishing.",
        image: "/images/gallery/winter-evening-japanese-village.jpg",
      },
    ],
  },
  {
    id: "zcard",
    projectId: "zcard",
    shortName: "Z Card v0.1",
    title: "Z Card v0.1",
    subtitle: "Smart hardware & micro-solar ID site",
    displayUrl: "zynxx777.github.io/ZCard",
    liveUrl: "https://zynxx777.github.io/ZCard",
    description:
      "ISO/IEC 7810 ID-1 smart everything card uniting bi-stable E-Paper, solar harvesting, Qi charging & biometrics.",
    quickQuestions: [
      "Tell me about Z Card v0.1",
      "What hardware subsystems are inside?",
      "Are you open for embedded collaboration?",
    ],
    accentColor: "#0284c7",
    heroTitle: "UNIVERSAL SMART CARD · E-PAPER & SOLAR",
    heroBadge: "Hardware Portal",
    listings: [
      {
        id: "zc-epd",
        title: '1.54" Bi-Stable E-Paper Display',
        tag: "DISPLAY",
        meta: "1.40mm ISO ID-1 Thickness",
        summary:
          "Renders crisp dynamic QR codes, transit passes, and card identity with zero idle power draw.",
        image: "/images/zcard/blueprint_hero.png",
      },
      {
        id: "zc-pwr",
        title: "Micro-Solar + Planar Qi Coil",
        tag: "POWER",
        meta: "0.45mm Solid-State Li-Po",
        summary:
          "Dual energy harvesting architecture pairing indoor ambient photovoltaic cells with inductive Qi charging.",
        image: "/images/zcard/exploded.png",
      },
      {
        id: "zc-sec",
        title: "nRF52840 BLE + EAL6+ Secure Element",
        tag: "SECURITY",
        meta: "On-Card FIDO2 & Biometrics",
        summary:
          "Hardware-isolated cryptographic key vault paired with capacitive fingerprint authorization.",
        image: "/images/zcard/solar_biometric_detail.png",
      },
    ],
  },
  {
    id: "arch",
    projectId: "arch-workstation",
    shortName: "Arch Setup",
    title: "Arch Linux Workstation",
    subtitle: "Hyprland & Omarchy dotfiles live docs",
    displayUrl: "github.com/Zynxx777/zynx-dotfiles",
    liveUrl: "https://zynx.dev/workstation",
    description:
      "Joshua's daily-driver Arch Linux kernel & Hyprland Wayland setup with PipeWire audio routing & systemd services.",
    quickQuestions: [
      "What is your Arch Linux setup?",
      "What embedded hardware have you built?",
      "Tell me about 7YNX audio production",
    ],
    accentColor: "#7c3aed",
    heroTitle: "ARCH LINUX · HYPRLAND · PIPEWIRE",
    heroBadge: "Systems Notes",
    listings: [
      {
        id: "arch-hypr",
        title: "Hyprland Wayland Compositor",
        tag: "COMPOSITOR",
        meta: "Custom Lua / Waybar",
        summary:
          "Low-latency tiling workflows with dynamic workspace rules, crisp terminal ergonomics, and Waydroid Android emulation.",
        image: "/images/space/gaming-cyber-room.jpg",
      },
      {
        id: "arch-sys",
        title: "Pacman Hooks & Systemd Telemetry",
        tag: "LINUX ADMIN",
        meta: "Kernel 6.12 · pactree",
        summary:
          "Automated package audit checks, clean dependency trees, and reproducible workstation bootstrap scripts.",
        image: "/images/ambient/lofi-study-night.jpg",
      },
    ],
  },
];

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: string;
  src: string;
  cover: string;
}

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "afrotonic4",
    title: "Afrotonic 4",
    artist: "7YNX",
    genre: "Afro House & Melodic",
    bpm: "122 BPM",
    src: "/music/afrotonic4.mp3",
    cover: "/images/ambient/lofi-study-night.jpg",
  },
  {
    id: "analog",
    title: "Analog",
    artist: "7YNX",
    genre: "Analog Synthwave",
    bpm: "126 BPM",
    src: "/music/analog.mp3",
    cover: "/images/space/cosmic-stars-4k.jpg",
  },
  {
    id: "if-only-you",
    title: "If Only You",
    artist: "7YNX",
    genre: "Chill Electronic",
    bpm: "118 BPM",
    src: "/music/if only youuu.mp3",
    cover: "/images/gallery/anime-moon-landscape.jpg",
  },
  {
    id: "my-mind",
    title: "My Mind",
    artist: "7YNX",
    genre: "Deep House & Bass",
    bpm: "124 BPM",
    src: "/music/my mind2.mp3",
    cover: "/images/gallery/winter-evening-japanese-village.jpg",
  },
  {
    id: "lofi-study",
    title: "Lo-Fi Study Night",
    artist: "7YNX Ambient Beats",
    genre: "Warm Ambient Chill",
    bpm: "85 BPM",
    src: "/music/lofi-study.mp3",
    cover: "/images/ambient/lofi-study-night.jpg",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "zynx";
  text: string;
  time: string;
}

const SUGGESTED_PROMPTS = [
  "Tell me about S.M. English School",
  "Tell me about Z Card v0.1",
  "What is your Arch Linux setup?",
  "What embedded hardware have you built?",
  "Tell me about 7YNX audio production",
  "Are you open for hire or collaboration?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    sender: "zynx",
    text: "Hey! I'm Joshua's digital twin (ZYNX AI). Ask me anything about S.M. English School web, Z Card hardware, Arch Linux systems, 7YNX music, or hiring availability!",
    time: "Just now",
  },
];

export const PhoneExperience: React.FC<PhoneExperienceProps> = ({
  onClose,
  initialApp = "site",
  onOpenProject,
}) => {
  const [app, setApp] = useState<PhoneApp>(initialApp);
  const [clock, setClock] = useState(() => new Date());
  const [notice, setNotice] = useState<string | null>(null);

  // Live Website Browser State
  const [selectedSiteIdx, setSelectedSiteIdx] = useState(0);
  const [siteRenderMode, setSiteRenderMode] = useState<"iframe" | "interactive">("iframe");
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [siteSearch, setSiteSearch] = useState("");
  const [activeListingModal, setActiveListingModal] = useState<
    LiveSiteEntry["listings"][number] | null
  >(null);

  const activeSite = LIVE_SITES[selectedSiteIdx];

  // Auto-hide iframe loading overlay gracefully so users see either live iframe or crisp switch option
  useEffect(() => {
    setIframeLoading(true);
    const timer = window.setTimeout(() => {
      setIframeLoading(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [selectedSiteIdx, iframeKey, siteRenderMode]);

  // If the chosen site has no external embeddable host (e.g. local docs), switch cleanly to interactive portal
  useEffect(() => {
    if (activeSite.id === "arch") {
      setSiteRenderMode("interactive");
    }
  }, [activeSite.id]);

  // Audio Player State
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Gallery lightbox state
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string } | null>(null);

  const currentTrack = AUDIO_TRACKS[currentTrackIdx];

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.src;
    audio.loop = isLooping;
    audio.volume = volume;
    audioElemRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (!isLooping) {
        setCurrentTrackIdx((prev) => (prev + 1) % AUDIO_TRACKS.length);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audioElemRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioElemRef.current) return;
    const audio = audioElemRef.current;
    const wasPlaying = isPlaying;
    audio.src = currentTrack.src;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentTrackIdx]);

  const togglePlay = () => {
    soundFX.playClick();
    if (!audioElemRef.current) return;
    if (isPlaying) {
      audioElemRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElemRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleNextTrack = () => {
    soundFX.playClick();
    setCurrentTrackIdx((prev) => (prev + 1) % AUDIO_TRACKS.length);
  };

  const handlePrevTrack = () => {
    soundFX.playClick();
    setCurrentTrackIdx((prev) => (prev - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioElemRef.current) {
      audioElemRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioElemRef.current) {
      audioElemRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    soundFX.playClick();
    if (!audioElemRef.current) return;
    if (isMuted) {
      audioElemRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioElemRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2400);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (lightboxImg) {
          setLightboxImg(null);
        } else if (activeListingModal) {
          setActiveListingModal(null);
        } else if (app !== "site" && app !== "home") {
          setApp("site");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [app, lightboxImg, activeListingModal, onClose]);

  useEffect(() => {
    if (app === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, app]);

  const generateBotResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    if (q.includes("school") || q.includes("s.m") || q.includes("astro") || q.includes("supabase")) {
      return "S.M. English School is a live multi-page web platform Joshua built with Astro, Tailwind CSS, and Supabase admin notices — optimized for sub-second loading on rural mobile connections.";
    }
    if (q.includes("z card") || q.includes("card") || q.includes("smart card") || q.includes("solar") || q.includes("subsystem")) {
      return "Z Card v0.1 is Joshua's flagship hardware innovation: an ISO/IEC 7810 ID-1 smart card integrating a bi-stable E-Paper screen, thin-film micro-solar harvesting, planar Qi wireless charging, and FIDO2 biometrics on an nRF52840 BLE MCU.";
    }
    if (q.includes("arch") || q.includes("linux") || q.includes("hyprland") || q.includes("kernel") || q.includes("stack")) {
      return "Joshua runs Arch Linux (Kernel 6.12) daily with a custom Hyprland Wayland setup, PipeWire low-latency audio, Waybar telemetry, and automated pacman dependency checks.";
    }
    if (q.includes("embedded") || q.includes("hardware") || q.includes("medivend") || q.includes("can") || q.includes("verilog")) {
      return "Joshua earned his B.E. in Electronics & Communication Engineering (DBIT, 2021–2025). His hardware work includes MediVend (Verilog FSM & stepper actuators), Luxoft AAOS CAN bus studies, and Z Card v0.1.";
    }
    if (q.includes("music") || q.includes("7ynx") || q.includes("audio") || q.includes("producer") || q.includes("track")) {
      return "7YNX is Joshua's electronic music & DSP alias. Tap the Music tab right below to play his originals like Afrotonic 4 and Analog, or open Zynx Player on the desk iPad.";
    }
    if (q.includes("hire") || q.includes("job") || q.includes("work") || q.includes("collaborat") || q.includes("contact") || q.includes("reach")) {
      return "Joshua is actively open for IT Support, Junior Linux Admin, Embedded, and Web roles! Email joshuadecedbit@gmail.com, call +91 72599 87691, or tap WhatsApp below.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hey! Welcome to Joshua's desk phone. Browse the live websites in the Site tab or ask me anything about his work!";
    }
    return `Great question about "${prompt}". Joshua combines embedded electronics, Arch Linux administration, and modern React/Three.js engineering. Reach out via WhatsApp (+91 72599 87691) or email joshuadecedbit@gmail.com for details!`;
  };

  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text) return;
    soundFX.playClick();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botReply = generateBotResponse(text);
      const botMsg: ChatMessage = {
        id: `zynx-${Date.now()}`,
        sender: "zynx",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      soundFX.playHover();
    }, 420);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const filteredSiteListings = activeSite.listings.filter((item) => {
    const q = siteSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-2 backdrop-blur-md sm:p-5 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Smartphone live website & AI experience"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          soundFX.playClick();
          onClose();
        }
      }}
    >
      {/* Top-Left "Back to the desk" pill matching video 00:49 */}
      <button
        onClick={() => {
          soundFX.playClick();
          onClose();
        }}
        className="fixed top-3 sm:top-5 left-3 sm:left-6 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-medium shadow-xl ring-1 ring-black/10 transition active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to the desk</span>
      </button>

      <div className="flex items-center gap-6 max-w-5xl w-full justify-center">
        {/* ── LEFT CONTEXT CARD (Matching Pradip Labs video 00:50–00:59!) ── */}
        <div className="hidden lg:flex flex-col w-80 p-5 rounded-3xl bg-white/95 border border-black/10 shadow-2xl text-zinc-900 font-sans">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-500">
              {activeSite.title} · Live mobile view
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <h3 className="mt-2 text-lg font-bold tracking-tight text-zinc-900 leading-snug">
            Browse real projects right inside the phone.
          </h3>

          <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
            {activeSite.description}
          </p>

          {/* Project Switcher Tabs in Card */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {LIVE_SITES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedSiteIdx(idx);
                  setSiteRenderMode(s.id === "arch" ? "interactive" : "iframe");
                  setApp("site");
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                  selectedSiteIdx === idx
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                }`}
              >
                {s.shortName}
              </button>
            ))}
          </div>

          {/* Clickable Quick Questions matching 00:50 video layout */}
          <div className="mt-4 pt-3 border-t border-zinc-200 space-y-1.5">
            <p className="text-[11px] font-semibold text-zinc-500 mb-1">
              Ask the AI twin or tap below:
            </p>
            {activeSite.quickQuestions.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setApp("chat");
                  handleSendChat(prompt);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-zinc-50 hover:bg-blue-50 border border-zinc-200/80 hover:border-blue-300 text-xs text-zinc-800 transition truncate"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Case study & external actions */}
          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
            {onOpenProject ? (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                  onOpenProject(activeSite.projectId);
                }}
                className="text-xs font-semibold text-[#2F5BEA] hover:underline flex items-center gap-1"
              >
                <span>Read case study →</span>
              </button>
            ) : (
              <a
                href={activeSite.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#2F5BEA] hover:underline flex items-center gap-1"
              >
                <span>Open live URL →</span>
              </a>
            )}

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-medium hover:opacity-90"
            >
              Put back (Esc)
            </button>
          </div>
        </div>

        {/* ── SMARTPHONE CHASSIS ── */}
        <div className="relative h-[min(810px,calc(100dvh-2rem))] w-[min(392px,calc(100vw-1.5rem))] overflow-hidden rounded-[3rem] border-[4px] border-[#2d2d32] bg-[#000000] p-[7px] shadow-[0_30px_100px_rgba(0,0,0,0.85)] ring-1 ring-white/10 shrink-0">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2.6rem] border border-white/10 bg-white text-zinc-900">
            {/* Status Bar & Dynamic Island */}
            <div
              className={`relative flex h-10 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold z-30 ${
                app === "site"
                  ? "bg-white text-zinc-900 border-b border-zinc-100"
                  : "bg-[#090b10] text-white"
              }`}
            >
              <span>{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

              {/* Dynamic Island */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setApp(app === "music" ? "site" : "music");
                }}
                className={`absolute left-1/2 top-1.5 -translate-x-1/2 rounded-full bg-black text-white border border-white/10 flex items-center justify-between px-2.5 py-0.5 transition-all duration-300 shadow-md ${
                  isPlaying ? "w-36 h-6" : "w-24 h-5"
                }`}
                title="Dynamic Island"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPlaying ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-white/90 truncate max-w-[70px]">
                    {isPlaying ? currentTrack.title : "LIVE"}
                  </span>
                </div>
                <Disc className={`w-3 h-3 text-white/50 ${isPlaying ? "animate-spin" : ""}`} />
              </button>

              <div className="flex items-center gap-1.5 tracking-tight">
                <Signal className="w-3 h-3" />
                <span className="text-[10px]">5G</span>
                <BatteryFull className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* ── MAIN SCREEN AREA ── */}
            <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* 1. LIVE WEBSITE BROWSER VIEW (Default — Matching video 00:49–00:58!) */}
              {app === "site" && (
                <div className="relative flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
                  {/* Browser Bar: Site Selector Pills + Address */}
                  <div className="bg-white border-b border-zinc-200 px-3 pt-2 pb-2 space-y-2 shrink-0">
                    {/* Site Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {LIVE_SITES.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            soundFX.playClick();
                            setSelectedSiteIdx(idx);
                            setSiteRenderMode(s.id === "arch" ? "interactive" : "iframe");
                          }}
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                            selectedSiteIdx === idx
                              ? "bg-[#2F5BEA] text-white shadow-sm"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          {s.shortName}
                        </button>
                      ))}
                    </div>

                    {/* URL Bar + Live Embed / Interactive Switch */}
                    <div className="flex items-center gap-1.5 bg-zinc-100 rounded-xl px-2.5 py-1.5 border border-zinc-200/80">
                      <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-mono text-zinc-700 truncate flex-1">
                        {activeSite.displayUrl}
                      </span>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setSiteRenderMode((m) => (m === "iframe" ? "interactive" : "iframe"));
                        }}
                        className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50 shrink-0"
                        title="Switch between embedded live site and offline-safe interactive mobile UI"
                      >
                        {siteRenderMode === "iframe" ? "App UI" : "Live URL"}
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setIframeKey((k) => k + 1);
                        }}
                        className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 shrink-0"
                        title="Reload live site"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>

                      <a
                        href={activeSite.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-md text-[#2F5BEA] hover:bg-blue-50 shrink-0"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Browser Viewport */}
                  <div className="relative flex-1 min-h-0 overflow-hidden bg-white">
                    {siteRenderMode === "iframe" ? (
                      <>
                        {/* "Loading the live site" card matching video 00:50 */}
                        {iframeLoading && (
                          <div className="absolute inset-0 z-20 grid place-items-center bg-white/85 backdrop-blur-sm p-4 transition-opacity">
                            <div className="w-full max-w-[260px] rounded-2xl bg-white p-4 text-center shadow-2xl border border-zinc-200">
                              <p className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-900">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2F5BEA]" />
                                <span>Loading the live site</span>
                              </p>
                              <p className="mt-1 text-[11px] font-mono text-zinc-500 truncate">
                                {activeSite.displayUrl}
                              </p>
                              <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100">
                                <div className="h-full w-4/5 rounded-full bg-[#2F5BEA] animate-pulse" />
                              </div>
                              <p className="mt-2.5 text-[10px] leading-snug text-zinc-400">
                                Real site loading inside the phone. Switch to App UI anytime if blocked offline.
                              </p>
                            </div>
                          </div>
                        )}

                        <iframe
                          key={`${activeSite.id}-${iframeKey}`}
                          src={activeSite.liveUrl}
                          title={`${activeSite.title} live phone view`}
                          onLoad={() => setIframeLoading(false)}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          className="w-full h-full border-0 bg-white"
                        />
                      </>
                    ) : (
                      /* Interactive Material Mobile Showcase Portal (Always works offline/sandboxed too!) */
                      <div className="h-full overflow-y-auto p-3.5 space-y-3 bg-[#f6f8fb]">
                        {/* Hero Dark Banner */}
                        <div className="rounded-2xl bg-[#11151d] text-white p-3.5 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {activeSite.heroBadge}
                            </span>
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                setApp("chat");
                              }}
                              className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold transition"
                            >
                              Ask AI Twin
                            </button>
                          </div>
                          <h4 className="mt-2.5 text-sm font-bold tracking-tight">
                            {activeSite.title}
                          </h4>
                          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                            {activeSite.heroTitle}
                          </p>
                        </div>

                        {/* Search Field */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-zinc-200 shadow-sm">
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder={`Search ${activeSite.shortName}...`}
                            value={siteSearch}
                            onChange={(e) => setSiteSearch(e.target.value)}
                            className="flex-1 text-xs text-zinc-800 placeholder-zinc-400 outline-none bg-transparent"
                          />
                          {siteSearch && (
                            <button
                              onClick={() => setSiteSearch("")}
                              className="text-zinc-400 hover:text-zinc-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Interactive Feature / Listing Cards matching 00:52 mobile cards */}
                        <div className="space-y-2.5 pb-14">
                          {filteredSiteListings.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-sm"
                            >
                              <div className="relative h-28 bg-zinc-100">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-mono font-bold">
                                  {item.tag}
                                </span>
                              </div>
                              <div className="p-3">
                                <h5 className="text-xs font-bold text-zinc-900">{item.title}</h5>
                                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                  {item.meta}
                                </p>
                                <p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">
                                  {item.summary}
                                </p>
                                <div className="mt-2.5 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      soundFX.playClick();
                                      setApp("chat");
                                      handleSendChat(`Tell me more about ${item.title}`);
                                    }}
                                    className="flex-1 py-1.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-[11px] font-semibold transition"
                                  >
                                    Enquire
                                  </button>
                                  <button
                                    onClick={() => {
                                      soundFX.playClick();
                                      setActiveListingModal(item);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold transition"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Floating "Live. Scroll and click around." badge + Green Chat Action FAB (00:52) */}
                    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 text-white text-[10px] font-medium shadow-lg backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live · Scroll and click around</span>
                      </span>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("chat");
                        }}
                        className="pointer-events-auto w-10 h-10 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white shadow-xl flex items-center justify-center transition active:scale-95"
                        title="Ask ZYNX AI about this site"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. HOME APPS LAUNCHER */}
              {app === "home" && (
                <div className="flex-1 overflow-y-auto flex flex-col justify-between p-5 bg-gradient-to-b from-[#0c1220] via-[#090b10] to-[#05070a] text-white">
                  <div>
                    <div className="mb-4">
                      <p className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-widest">
                        {clock.toLocaleDateString([], {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <h2 className="mt-0.5 text-2xl font-bold tracking-tight">Joshua D.</h2>
                      <p className="text-xs text-zinc-400">Arch Linux & Embedded Hardware</p>
                    </div>

                    {/* Live Site Launcher Banner */}
                    <div
                      onClick={() => {
                        soundFX.playClick();
                        setApp("site");
                      }}
                      className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-blue-950/50 border border-emerald-400/30 shadow-lg cursor-pointer hover:border-emerald-400/60 transition flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono text-emerald-300 uppercase">
                          LIVE BROWSER
                        </p>
                        <p className="text-xs font-bold text-white truncate">
                          {activeSite.title} · Live Site
                        </p>
                      </div>
                    </div>

                    {/* Live Music Banner */}
                    <div
                      onClick={() => {
                        soundFX.playClick();
                        setApp("music");
                      }}
                      className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/20 shadow-xl cursor-pointer hover:border-cyan-400/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                          <img
                            src={currentTrack.cover}
                            alt={currentTrack.title}
                            className={`w-full h-full object-cover ${isPlaying ? "animate-spin" : ""}`}
                            style={{ animationDuration: "10s" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono text-cyan-400">7YNX DSP RADIO</p>
                          <p className="text-xs font-semibold truncate text-white">
                            {currentTrack.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {currentTrack.artist} · {currentTrack.bpm}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Grid of Apps */}
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("site");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                          <Globe className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Live Site</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("chat");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">AI Chat</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("music");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                          <Music className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Music</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("gallery");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                          <Images className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 7YNX DSP MUSIC PLAYER APP */}
              {app === "music" && (
                <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-[#13111c] via-[#0b0c14] to-[#05070a] text-white">
                  <div className="text-center mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] font-mono text-cyan-300">
                      <Flame className="w-3 h-3 text-cyan-400" />
                      7YNX SOUND LAB // DSP RADIO
                    </span>
                  </div>

                  <div className="relative mx-auto w-44 h-44 rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-2">
                    <img
                      src={currentTrack.cover}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isPlaying ? "scale-105" : "scale-100"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-cyan-300 border border-white/10">
                        {currentTrack.genre}
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <h3 className="text-lg font-bold truncate text-white">{currentTrack.title}</h3>
                    <p className="text-xs text-zinc-400">
                      {currentTrack.artist} · {currentTrack.bpm}
                    </p>
                  </div>

                  <div className="mt-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-5 mt-3">
                    <button
                      onClick={handlePrevTrack}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={handleNextTrack}
                      className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 px-2">
                    <button onClick={toggleMute} className="text-white/60 hover:text-white">
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setIsLooping(!isLooping);
                        if (audioElemRef.current) audioElemRef.current.loop = !isLooping;
                      }}
                      className={`text-xs p-1 rounded ${isLooping ? "text-cyan-400" : "text-white/40"}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                    {AUDIO_TRACKS.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          soundFX.playClick();
                          setCurrentTrackIdx(idx);
                          if (!isPlaying) togglePlay();
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          idx === currentTrackIdx
                            ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                            : "hover:bg-white/5 text-zinc-300"
                        }`}
                      >
                        <span className="font-semibold truncate">{t.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">{t.bpm}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ZYNX AI ASSISTANT CHAT APP */}
              {app === "chat" && (
                <div className="flex-1 flex flex-col justify-between bg-[#0b0f19] text-white overflow-hidden">
                  <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                        Z
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">Joshua (ZYNX AI)</h4>
                        <p className="text-[9px] text-emerald-400">Online · Instant Answers</p>
                      </div>
                    </div>

                    <a
                      href={ZYNX_PROFILE.socials.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div ref={chatScrollRef} className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-md ${
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none"
                              : "bg-[#161d2e] border border-white/10 text-zinc-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#161d2e] border border-white/10 w-16">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-white/[0.06] bg-black/40 shrink-0">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {SUGGESTED_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChat(p)}
                          className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] text-zinc-300"
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendChat();
                        }}
                        placeholder="Ask Joshua anything..."
                        className="flex-1 bg-white/[0.07] border border-white/15 focus:border-cyan-400 rounded-full px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                      />
                      <button
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim()}
                        className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. PHONE / CONTACTS APP */}
              {app === "phone" && (
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0e1626] to-[#070a12] text-white text-center">
                  <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-xl mb-3">
                    <img
                      src="/images/profile_avatar.webp"
                      alt="Joshua D"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold">Joshua D (ZYNX)</h3>
                  <p className="text-xs text-cyan-300 mt-0.5">
                    Electronics & Communication Engineer
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">Channapatna / Bengaluru, India</p>

                  <div className="grid grid-cols-2 gap-2.5 mt-5">
                    <a
                      href={`tel:${ZYNX_PROFILE.phone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                    <a
                      href={ZYNX_PROFILE.socials.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-semibold text-xs"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:${ZYNX_PROFILE.email}`}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-semibold text-xs"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        downloadVCard();
                        showToast("Contact card downloaded!");
                      }}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.08] border border-white/15 text-white font-semibold text-xs"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Save vCard</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 6. GALLERY APP */}
              {app === "gallery" && (
                <div className="flex-1 overflow-y-auto p-4 bg-[#080a10] text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold">CAD & Wallpapers</h3>
                      <p className="text-[10px] text-zinc-400">Blueprints & studio artwork</p>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">7YNX VAULT</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { src: "/images/zcard/blueprint_hero.png", title: "Z Card Blueprint" },
                      { src: "/images/zcard/exploded.png", title: "Z Card CAD Exploded" },
                      { src: "/images/zcard/front.png", title: "Z Card ISO-7810" },
                      { src: "/images/gallery/anime-moon-landscape.jpg", title: "Anime Moonscape" },
                      { src: "/images/gallery/samurai-woman-bridge-rain.jpg", title: "Samurai Rain Bridge" },
                      { src: "/images/space/cosmic-stars-4k.jpg", title: "Deep Cosmic Stars" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          soundFX.playClick();
                          setLightboxImg(item);
                        }}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Listing Details Sheet inside Phone */}
              {activeListingModal && (
                <div
                  onClick={() => setActiveListingModal(null)}
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end p-2.5"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-2xl bg-white p-4 text-zinc-900 shadow-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2F5BEA] text-[10px] font-mono font-bold">
                        {activeListingModal.tag}
                      </span>
                      <button
                        onClick={() => setActiveListingModal(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold">{activeListingModal.title}</h4>
                    <p className="text-[11px] font-mono text-zinc-500">
                      {activeListingModal.meta}
                    </p>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {activeListingModal.summary}
                    </p>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const q = `Tell me more about ${activeListingModal.title}`;
                          setActiveListingModal(null);
                          setApp("chat");
                          handleSendChat(q);
                        }}
                        className="flex-1 py-2 rounded-xl bg-[#2F5BEA] text-white text-xs font-semibold"
                      >
                        Ask AI about this
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Phone App Switcher Bar */}
            <div
              className={`shrink-0 border-t px-2 py-1.5 flex items-center justify-around text-[10px] font-medium ${
                app === "site"
                  ? "bg-white border-zinc-200 text-zinc-600"
                  : "bg-[#0a0d14] border-white/10 text-zinc-400"
              }`}
            >
              {(
                [
                  { id: "site", label: "Site", icon: Globe },
                  { id: "chat", label: "AI Chat", icon: Bot },
                  { id: "music", label: "Music", icon: Music },
                  { id: "phone", label: "Contact", icon: PhoneCall },
                  { id: "home", label: "Apps", icon: Home },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const isSelected = app === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      soundFX.playClick();
                      setApp(id);
                    }}
                    className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition ${
                      isSelected
                        ? app === "site"
                          ? "text-[#2F5BEA] font-bold bg-blue-50"
                          : "text-cyan-400 font-bold bg-white/10"
                        : "hover:opacity-80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {notice && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/95 border border-white/15 text-white text-[11px] shadow-2xl">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{notice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImg.src}
              alt={lightboxImg.title}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <div className="p-3 bg-black/80 text-center text-xs font-semibold text-white">
              {lightboxImg.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneExperience;
