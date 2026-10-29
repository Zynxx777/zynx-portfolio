import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BatteryFull,
  Check,
  Disc,
  Download,
  Flame,
  Home,
  Images,
  Mail,
  MessageSquare,
  Music,
  Pause,
  PhoneCall,
  Play,
  RotateCcw,
  Send,
  Signal,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Bot
} from "lucide-react";
import { downloadVCard } from "../utils/cardCanvas";
import { soundFX } from "../utils/audioFX";

export interface PhoneExperienceProps {
  onClose: () => void;
  initialApp?: "home" | "music" | "chat" | "phone" | "gallery";
}

type PhoneApp = "home" | "music" | "chat" | "phone" | "gallery";

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
    id: "studio-jam",
    title: "Studio Jam",
    artist: "7YNX // Joris Voorn",
    genre: "Melodic Techno House",
    bpm: "124 BPM",
    src: "/music/Joris Voorn - Studio Jam ｜ Melodic Atmospheric Techno House.opus",
    cover: "/images/sound/sound-studiojam.jpg"
  },
  {
    id: "regardless",
    title: "Regardless",
    artist: "7YNX DSP Lab",
    genre: "Synthwave & Trap Bass",
    bpm: "140 BPM",
    src: "/music/Regardless.mp3",
    cover: "/images/sound/sound-regardless.jpg"
  },
  {
    id: "lofi-study",
    title: "Lo-Fi Study Night",
    artist: "7YNX Ambient Beats",
    genre: "Warm Ambient Chill",
    bpm: "85 BPM",
    src: "/music/lofi-study.mp3",
    cover: "/images/ambient/lofi-study-night.jpg"
  }
];

interface ChatMessage {
  id: string;
  sender: "user" | "zynx";
  text: string;
  time: string;
}

const SUGGESTED_PROMPTS = [
  "Tell me about Z Card v0.1",
  "What is your Arch Linux setup?",
  "What embedded hardware have you built?",
  "Tell me about 7YNX audio production",
  "Are you open for hire or collaboration?"
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    sender: "zynx",
    text: "Hey! I'm Joshua's digital twin (ZYNX AI). Ask me anything about his embedded hardware innovations, Arch Linux setup, DSP music, or hiring availability!",
    time: "Just now"
  }
];

export const PhoneExperience: React.FC<PhoneExperienceProps> = ({
  onClose,
  initialApp = "home"
}) => {
  const [app, setApp] = useState<PhoneApp>(initialApp);
  const [clock, setClock] = useState(() => new Date());
  const [notice, setNotice] = useState<string | null>(null);

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

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio setup
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
        handleNextTrack();
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

  // Update audio source when track changes
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

  // Handle play / pause toggle
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
    setTimeout(() => setNotice(null), 2500);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (lightboxImg) {
          setLightboxImg(null);
        } else if (app !== "home") {
          setApp("home");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [app, lightboxImg, onClose]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (app === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, app]);

  // AI Response Generator
  const generateBotResponse = (prompt: string): string => {
    const q = prompt.toLowerCase();
    if (q.includes("z card") || q.includes("card") || q.includes("smart card") || q.includes("solar")) {
      return "Z Card v0.1 is Joshua's flagship hardware innovation: an ISO/IEC 7810 ID-1 standard smart card with an ultra-low-power bi-stable e-paper display, micro-solar energy harvesting, planar Qi wireless charging, and on-card biometrics. You can also click 'Z Card Anatomy' on the desk to view the full 3D CAD exploded model!";
    }
    if (q.includes("arch") || q.includes("linux") || q.includes("hyprland") || q.includes("kernel")) {
      return "Joshua runs Arch Linux (Kernel 6.12) as his daily driver with a bespoke Hyprland Wayland compositor setup configured in Lua. His workstation features custom Waybar telemetry modules, Kitty/Foot terminal workflows, GNU Stow dotfile symlinking, and local AI voice integration.";
    }
    if (q.includes("embedded") || q.includes("hardware") || q.includes("medivend") || q.includes("can") || q.includes("verilog")) {
      return "Joshua graduated with a B.E. in Electronics & Communication Engineering from DBIT Bangalore (2021–2025). His embedded work includes: (1) MediVend automated medicine dispenser with Verilog FPGA state machines & motor drivers; (2) Luxoft AAOS automotive research on CAN bus architecture; and (3) STM32/ESP32 sensor telemetry nodes.";
    }
    if (q.includes("music") || q.includes("7ynx") || q.includes("audio") || q.includes("producer") || q.includes("track")) {
      return "7YNX is Joshua's music production and DSP alias. He produces atmospheric melodic techno, synthwave, and lo-fi beats in FL Studio and experiments with Web Audio synthesizers. Check out the '7YNX DSP Player' tab right here on this phone to stream his music live!";
    }
    if (q.includes("hire") || q.includes("job") || q.includes("work") || q.includes("collaborat") || q.includes("contact") || q.includes("reach")) {
      return "Joshua is actively open for entry-level IT Support, Junior Linux Administration, and Embedded / Web engineering roles! You can email him at joshuajosh3055@gmail.com, call +91 72599 87691, or tap the WhatsApp button below to start a conversation right now.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hey there! Glad you stopped by Joshua's workspace. Feel free to ask about his hardware projects (like Z Card), Arch Linux setup, music tracks, or how to get in touch!";
    }
    return `Thanks for asking about "${prompt}". Joshua combines hands-on electronics hardware engineering with deep Linux administration and modern WebGL development. For detailed discussions or project collaborations, reach out directly via WhatsApp (+91 72599 87691) or email joshuajosh3055@gmail.com!`;
  };

  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text) return;
    soundFX.playClick();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      soundFX.playHover();
    }, 450);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md sm:p-5 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="7YNX Interactive Smartphone"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center gap-6 max-w-5xl w-full justify-center">
        {/* ── DESKTOP STICKY NOTE (Matching pradiplabs.dev Miami Motors desk note) ── */}
        <div className="hidden lg:flex flex-col w-72 p-5 rounded-2xl bg-[#fefce8] dark:bg-[#1c1917] border border-amber-300/40 dark:border-amber-900/40 shadow-2xl text-slate-900 dark:text-amber-100/90 font-sans rotate-[-1.5deg] relative">
          <div className="w-8 h-3.5 bg-amber-200/80 dark:bg-amber-800/60 rounded-sm mx-auto -mt-6 mb-3 shadow-sm border border-amber-400/30" />
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>7YNX Live Phone</span>
          </div>
          <h3 className="mt-1.5 text-base font-bold tracking-tight">
            DSP Radio & AI Chat
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-amber-200/70 leading-relaxed">
            This is Joshua's personal smartphone running in real-time WebGL. Stream his audio tracks or ask the AI twin anything.
          </p>

          <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/50 space-y-2">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-amber-300">Quick Prompts:</p>
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setApp("chat");
                  handleSendChat(prompt);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-black/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-300/30 text-[11px] text-slate-800 dark:text-amber-200 transition-all truncate"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
            <button
              onClick={() => {
                setApp("music");
                if (!isPlaying) togglePlay();
              }}
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isPlaying ? "Now Playing" : "Stream Beats"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-amber-200 dark:text-slate-900 text-[11px] font-medium hover:opacity-90"
            >
              Put back (Esc)
            </button>
          </div>
        </div>

        {/* ── SMARTPHONE CHASSIS (iPhone Titanium Design) ── */}
        <div className="relative h-[min(840px,calc(100dvh-1.5rem))] w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-[3.2rem] border-[4px] border-[#2d2d32] bg-[#000000] p-[7px] shadow-[0_30px_100px_rgba(0,0,0,0.85)] ring-1 ring-white/10 shrink-0">
          {/* Inner OLED Bezel & Display Screen */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#090b10] text-white">
            
            {/* Status Bar & Dynamic Island */}
            <div className="relative flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-white/90 z-30">
              <span>{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

              {/* Dynamic Island Pill with Interactive Audio Mini-Widget */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setApp(app === "music" ? "home" : "music");
                }}
                className={`absolute left-1/2 top-1.5 -translate-x-1/2 rounded-full bg-black border border-white/10 flex items-center justify-between px-2.5 py-1 transition-all duration-300 shadow-md ${
                  isPlaying ? "w-36 h-6.5" : "w-24 h-6"
                }`}
                title="Dynamic Island"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  {isPlaying ? (
                    <span className="text-[9px] font-mono text-cyan-300 truncate max-w-[65px]">
                      {currentTrack.title}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-white/40">Z7X</span>
                  )}
                </div>

                {/* Animated Mini Equalizer Bars */}
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2.5" />
                    <span className="w-0.5 bg-cyan-300 rounded-full animate-pulse h-3" />
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-1.5" />
                  </div>
                ) : (
                  <Disc className="w-3 h-3 text-white/30" />
                )}
              </button>

              <div className="flex items-center gap-1.5 tracking-tight text-white/80">
                <Signal className="w-3 h-3" />
                <span className="text-[10px]">5G</span>
                <BatteryFull className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* App Header Navigation Bar */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.08] px-4 z-20 bg-black/40 backdrop-blur-md">
              {app === "home" ? (
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                  <img src="/images/z7x-logo.svg" alt="Z7X" className="h-5 w-5 object-contain" />
                  <span>7YNX OS</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setApp("home");
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Home</span>
                </button>
              )}

              <div className="flex items-center gap-1">
                {app !== "home" && (
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setApp("home");
                    }}
                    className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                    title="Phone Home"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                  title="Close Phone (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── APP VIEWS ── */}
            <div className="relative flex-1 min-h-0 overflow-y-auto">
              
              {/* 1. HOME SCREEN */}
              {app === "home" && (
                <div className="min-h-full flex flex-col justify-between p-5 bg-gradient-to-b from-[#0c1220] via-[#090b10] to-[#05070a]">
                  <div>
                    {/* Date & Greeting */}
                    <div className="mb-4">
                      <p className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-widest">
                        {clock.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                      <h2 className="mt-0.5 text-2xl font-bold tracking-tight">Joshua D.</h2>
                      <p className="text-xs text-zinc-400">Arch Linux & Embedded Hardware</p>
                    </div>

                    {/* Live Music Widget Banner */}
                    <div
                      onClick={() => {
                        soundFX.playClick();
                        setApp("music");
                      }}
                      className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/20 shadow-xl cursor-pointer hover:border-cyan-400/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                          <img
                            src={currentTrack.cover}
                            alt={currentTrack.title}
                            className={`w-full h-full object-cover ${isPlaying ? "animate-spin" : ""}`}
                            style={{ animationDuration: "10s" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                            {isPlaying ? (
                              <Pause className="w-4 h-4 text-cyan-300" />
                            ) : (
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                            <Disc className="w-3 h-3" />
                            <span>7YNX DSP RADIO</span>
                          </div>
                          <p className="text-xs font-semibold truncate text-white mt-0.5">
                            {currentTrack.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {currentTrack.artist} · {currentTrack.bpm}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Chat Prompt Banner */}
                    <div
                      onClick={() => {
                        soundFX.playClick();
                        setApp("chat");
                      }}
                      className="mb-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/30 cursor-pointer transition-all shadow-md flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                          <Sparkles className="w-3 h-3" />
                          <span>ZYNX AI ASSISTANT</span>
                        </div>
                        <p className="text-xs text-white/90 truncate mt-0.5 font-medium">
                          Ask about Z Card, Arch setup & hiring
                        </p>
                      </div>
                    </div>

                    {/* Grid of Apps */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Music App */}
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("music");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
                          <Music className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Music</span>
                      </button>

                      {/* AI Chat App */}
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("chat");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">AI Chat</span>
                      </button>

                      {/* Gallery App */}
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("gallery");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                          <Images className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Gallery</span>
                      </button>

                      {/* Phone App */}
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setApp("phone");
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                          <PhoneCall className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] text-white/80">Phone</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Dock */}
                  <div className="mt-6 p-2 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/10 flex items-center justify-around">
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setApp("phone");
                      }}
                      className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md active:scale-95 transition-transform"
                      title="Call"
                    >
                      <PhoneCall className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setApp("chat");
                      }}
                      className="p-2.5 rounded-2xl bg-blue-500 text-white shadow-md active:scale-95 transition-transform"
                      title="AI Chat"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setApp("music");
                      }}
                      className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md active:scale-95 transition-transform"
                      title="7YNX Music"
                    >
                      <Disc className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setApp("gallery");
                      }}
                      className="p-2.5 rounded-2xl bg-purple-500 text-white shadow-md active:scale-95 transition-transform"
                      title="Gallery"
                    >
                      <Images className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. 7YNX DSP MUSIC PLAYER APP */}
              {app === "music" && (
                <div className="min-h-full flex flex-col justify-between p-5 bg-gradient-to-b from-[#13111c] via-[#0b0c14] to-[#05070a]">
                  <div>
                    {/* Header Banner */}
                    <div className="text-center mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] font-mono text-cyan-300">
                        <Flame className="w-3 h-3 text-cyan-400" />
                        7YNX SOUND LAB // DSP RADIO
                      </span>
                    </div>

                    {/* Album Art with Vinyl Spinning Effect */}
                    <div className="relative mx-auto w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border border-white/15 my-3 group">
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

                    {/* Track Title & Artist */}
                    <div className="text-center mt-3">
                      <h3 className="text-lg font-bold truncate text-white">{currentTrack.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{currentTrack.artist} · {currentTrack.bpm}</p>
                    </div>

                    {/* Live Frequency Visualizer Bars */}
                    <div className="flex items-end justify-center gap-1 h-8 my-3">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const height = isPlaying ? 8 + Math.abs(Math.sin((i + clock.getSeconds()) * 0.7) * 20) : 4;
                        return (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-75 ${
                              isPlaying ? "bg-gradient-to-t from-cyan-400 to-blue-500" : "bg-white/20"
                            }`}
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>

                    {/* Progress Slider */}
                    <div className="mt-2">
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

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-5 mt-3">
                      <button
                        onClick={handlePrevTrack}
                        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        title="Previous Track"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/30 active:scale-95 transition-all"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>

                      <button
                        onClick={handleNextTrack}
                        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        title="Next Track"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Volume & Loop Slider */}
                    <div className="flex items-center justify-between gap-3 mt-4 px-2">
                      <button onClick={toggleMute} className="text-white/60 hover:text-white">
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
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
                        title="Toggle Loop"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Track List */}
                  <div className="mt-5 pt-3 border-t border-white/10 space-y-1.5">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      Playlist ({AUDIO_TRACKS.length} tracks)
                    </p>
                    {AUDIO_TRACKS.map((t, idx) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          soundFX.playClick();
                          setCurrentTrackIdx(idx);
                          if (!isPlaying) togglePlay();
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          idx === currentTrackIdx
                            ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                            : "hover:bg-white/5 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-zinc-500">0{idx + 1}</span>
                          <span className="font-semibold truncate">{t.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">{t.bpm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. ZYNX AI ASSISTANT CHAT APP */}
              {app === "chat" && (
                <div className="min-h-full flex flex-col justify-between bg-[#0b0f19]">
                  {/* Chat Sub-Header */}
                  <div className="p-3 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
                        Z
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">Joshua (ZYNX AI)</h4>
                        <p className="text-[9px] text-emerald-400">Online · Instant Answers</p>
                      </div>
                    </div>

                    <a
                      href="https://wa.me/917259987691"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Messages Scroll Area */}
                  <div
                    ref={chatScrollRef}
                    className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[460px]"
                  >
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-md ${
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

                    {/* Typing Bouncing Dots */}
                    {isTyping && (
                      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#161d2e] border border-white/10 w-16">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="p-2 border-t border-white/[0.06] bg-black/30">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {SUGGESTED_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChat(p)}
                          className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] text-zinc-300 transition-all truncate"
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input Field */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendChat();
                        }}
                        placeholder="Ask Joshua anything..."
                        className="flex-1 bg-white/[0.07] border border-white/15 focus:border-cyan-400 rounded-full px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                      <button
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim()}
                        className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PHONE / CONTACTS APP */}
              {app === "phone" && (
                <div className="min-h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#0e1626] to-[#070a12] text-center">
                  <div>
                    <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-xl mb-3">
                      <img
                        src="/images/profile_avatar.webp"
                        alt="Joshua D"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white">Joshua D (ZYNX)</h3>
                    <p className="text-xs text-cyan-300 mt-0.5">Electronics & Communication Engineer</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Channapatna / Bengaluru, India</p>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono mt-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Available for Hire & IT Roles</span>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 mt-6">
                      <a
                        href="tel:+917259987691"
                        className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg transition-all"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Call Joshua</span>
                      </a>

                      <a
                        href="https://wa.me/917259987691"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-semibold text-xs shadow-lg transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href="mailto:joshuajosh3055@gmail.com"
                        className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 font-semibold text-xs shadow-lg transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Email</span>
                      </a>

                      <button
                        onClick={() => {
                          soundFX.playClick();
                          downloadVCard();
                          showToast("Contact card downloaded!");
                        }}
                        className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-semibold text-xs shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>Save Contact</span>
                      </button>
                    </div>

                    {/* Social Handles */}
                    <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-left">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Social Handles</p>
                      
                      <a
                        href="https://instagram.com/7osh___"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs text-zinc-300 transition-colors"
                      >
                        <span>Instagram (Personal)</span>
                        <span className="text-zinc-500 text-[11px] font-mono">@7osh___</span>
                      </a>

                      <a
                        href="https://instagram.com/7ynx777"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs text-zinc-300 transition-colors"
                      >
                        <span>Instagram (Producer)</span>
                        <span className="text-cyan-400 text-[11px] font-mono">@7ynx777</span>
                      </a>

                      <a
                        href="https://github.com/Zynxx777"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs text-zinc-300 transition-colors"
                      >
                        <span>GitHub</span>
                        <span className="text-zinc-500 text-[11px] font-mono">Zynxx777</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. GALLERY / BLUEPRINTS APP */}
              {app === "gallery" && (
                <div className="p-4 bg-[#080a10] min-h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">CAD & Wallpapers</h3>
                      <p className="text-[10px] text-zinc-400">High-res hardware blueprints & studio art</p>
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
                      { src: "/images/projects/lofi-bedroom.jpg", title: "Lo-Fi Bedroom Studio" },
                      { src: "/images/gallery/winter-evening-japanese-village.jpg", title: "Winter Village" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          soundFX.playClick();
                          setLightboxImg(item);
                        }}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer shadow-md"
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-medium truncate">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="flex h-6 shrink-0 items-center justify-center bg-black/60 backdrop-blur-md">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setApp("home");
                }}
                className="h-1 w-24 rounded-full bg-white/40 hover:bg-white/70 transition-colors"
                title="Return to Home"
              />
            </div>

            {/* Toast Notification */}
            {notice && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/95 border border-white/15 text-white text-[11px] shadow-2xl animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{notice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Gallery Images */}
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
            <img src={lightboxImg.src} alt={lightboxImg.title} className="max-w-full max-h-[85vh] object-contain" />
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
