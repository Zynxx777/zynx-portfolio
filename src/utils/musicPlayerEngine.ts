// Global Persistent Music Player & Live Stream Engine
// Persists audio streaming across SPA page transitions, navigation, and background tabs.

import { rainAmbience } from "./rainAmbience";

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  type: "procedural" | "local" | "stream";
  src?: string;
  backupSrc?: string;
  badge: string;
}

export interface PaletteTheme {
  name: string;
  glow: string;
  border: string;
  shadow: string;
  topColor: string;
  midColor: string;
  bottomColor: string;
  peak: string;
  pillBg: string;
  badgeBg: string;
  badgeText: string;
}

// 100% Verified High-Availability 24/7 Streams & Offline Local Productions
export const BEDROOM_PLAYLIST: AudioTrack[] = [
  {
    id: "synthwave-nightride",
    title: "Nightride FM Synthwave",
    artist: "24/7 Outrun & Retrowave",
    type: "stream",
    src: "https://stream.nightride.fm/nightride.mp3",
    backupSrc: "https://stream.nightride.fm/chillsynth.mp3",
    badge: "SYNTHWAVE",
  },
  {
    id: "chillsynth",
    title: "Chillsynth Radio",
    artist: "Nightride Chill Retrowave",
    type: "stream",
    src: "https://stream.nightride.fm/chillsynth.mp3",
    backupSrc: "https://stream.nightride.fm/spacesynth.mp3",
    badge: "CHILL RETRO",
  },
  {
    id: "spacesynth",
    title: "Spacesynth Cyber Radio",
    artist: "Futuristic Space Synth",
    type: "stream",
    src: "https://stream.nightride.fm/spacesynth.mp3",
    backupSrc: "https://stream.nightride.fm/darksynth.mp3",
    badge: "SPACE SYNTH",
  },
  {
    id: "plaza-stream",
    title: "Nightwave Plaza",
    artist: "24/7 Vaporwave & Synth",
    type: "stream",
    src: "https://radio.plaza.one/mp3",
    backupSrc: "https://stream.nightride.fm/chillsynth.mp3",
    badge: "VAPORWAVE",
  },
  {
    id: "lofi-stream",
    title: "24/7 Lo-Fi Radio",
    artist: "Live Chillhop Station",
    type: "stream",
    src: "https://boxradio-edge-00.streamafrica.net/lofi",
    backupSrc: "/music/lofi-study.mp3",
    badge: "LIVE STREAM",
  },
  {
    id: "lofi-study",
    title: "Midnight Lo-Fi Study",
    artist: "Chilled Beats",
    type: "local",
    src: "/music/lofi-study.mp3",
    badge: "LO-FI BEATS",
  },
  {
    id: "rain",
    title: "Lo-Fi Rain Ambience",
    artist: "Procedural Acoustics",
    type: "procedural",
    badge: "BINAURAL RAIN",
  },
  {
    id: "regardless",
    title: "Regardless",
    artist: "7YNX Original",
    type: "local",
    src: "/music/Regardless.mp3",
    badge: "7YNX ORIGINAL",
  },
  {
    id: "studio-jam",
    title: "Atmospheric Studio Jam",
    artist: "7YNX / Joris Voorn",
    type: "local",
    src: "/music/Joris Voorn - Studio Jam ｜ Melodic Atmospheric Techno House.opus",
    badge: "MELODIC TECHNO",
  },
];

export const FIFO_PALETTES: PaletteTheme[] = [
  {
    name: "Cyber Cyan",
    glow: "#00F2FE",
    border: "rgba(0, 242, 254, 0.75)",
    shadow: "rgba(0, 242, 254, 0.35)",
    topColor: "#00F2FE",
    midColor: "#4FACFE",
    bottomColor: "#0052D4",
    peak: "#ffffff",
    pillBg: "rgba(0, 16, 26, 0.75)",
    badgeBg: "rgba(0, 242, 254, 0.2)",
    badgeText: "#00F2FE",
  },
  {
    name: "Synthwave Magenta",
    glow: "#F72585",
    border: "rgba(247, 37, 133, 0.8)",
    shadow: "rgba(247, 37, 133, 0.35)",
    topColor: "#FF007F",
    midColor: "#F72585",
    bottomColor: "#7209B7",
    peak: "#ffffff",
    pillBg: "rgba(25, 4, 18, 0.75)",
    badgeBg: "rgba(247, 37, 133, 0.22)",
    badgeText: "#F72585",
  },
  {
    name: "Electric Emerald",
    glow: "#10B981",
    border: "rgba(16, 185, 129, 0.75)",
    shadow: "rgba(16, 185, 129, 0.35)",
    topColor: "#34D399",
    midColor: "#10B981",
    bottomColor: "#065F46",
    peak: "#ffffff",
    pillBg: "rgba(4, 25, 16, 0.75)",
    badgeBg: "rgba(16, 185, 129, 0.22)",
    badgeText: "#34D399",
  },
  {
    name: "Outrun Sunset",
    glow: "#FB8500",
    border: "rgba(251, 133, 0, 0.8)",
    shadow: "rgba(251, 133, 0, 0.35)",
    topColor: "#FFB703",
    midColor: "#FB8500",
    bottomColor: "#D90429",
    peak: "#ffffff",
    pillBg: "rgba(28, 14, 2, 0.75)",
    badgeBg: "rgba(251, 133, 0, 0.22)",
    badgeText: "#FFB703",
  },
  {
    name: "Ultra Violet",
    glow: "#9D4EDD",
    border: "rgba(157, 78, 221, 0.8)",
    shadow: "rgba(157, 78, 221, 0.35)",
    topColor: "#E0AAFF",
    midColor: "#9D4EDD",
    bottomColor: "#3C096C",
    peak: "#ffffff",
    pillBg: "rgba(18, 5, 28, 0.75)",
    badgeBg: "rgba(157, 78, 221, 0.22)",
    badgeText: "#E0AAFF",
  },
  {
    name: "Neon Laser",
    glow: "#FF0055",
    border: "rgba(255, 0, 85, 0.8)",
    shadow: "rgba(255, 0, 85, 0.35)",
    topColor: "#FF5470",
    midColor: "#FF0055",
    bottomColor: "#990033",
    peak: "#ffffff",
    pillBg: "rgba(28, 3, 10, 0.75)",
    badgeBg: "rgba(255, 0, 85, 0.22)",
    badgeText: "#FF5470",
  },
];

export interface PlayerState {
  trackIndex: number;
  currentTrack: AudioTrack;
  isPlaying: boolean;
  isBuffering: boolean;
  nowPlaying: string | null;
  paletteIndex: number;
  currentPalette: PaletteTheme;
  beatPulse: number;
  volume: number;
}

class MusicPlayerEngine {
  private audio: HTMLAudioElement | null = null;
  private trackIndex: number = 0;
  private isPlaying: boolean = false;
  private isBuffering: boolean = false;
  private nowPlaying: string | null = null;
  private paletteIndex: number = 0;
  private beatPulse: number = 0;
  private volume: number = 0.75;

  private bufferWatchdog: ReturnType<typeof setTimeout> | null = null;
  private metaInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: PlayerState) => void> = new Set();

  constructor() {
    if (typeof window === "undefined") return;

    // Singleton check on window to survive Vite HMR without audio duplication
    const win = window as unknown as { __zynxMusicEngine?: MusicPlayerEngine; __zynxGlobalAudio?: HTMLAudioElement };
    if (win.__zynxMusicEngine) {
      return win.__zynxMusicEngine;
    }
    win.__zynxMusicEngine = this;

    // Persistent HTMLAudioElement
    if (!win.__zynxGlobalAudio) {
      const a = new Audio();
      a.preload = "auto";
      a.volume = this.volume;
      win.__zynxGlobalAudio = a;
    }
    this.audio = win.__zynxGlobalAudio;
    if (this.audio) {
      this.audio.volume = this.volume;
    }

    this.setupAudioListeners();
    this.setupMediaSession();
  }

  private setupAudioListeners() {
    if (!this.audio) return;
    const audio = this.audio;

    audio.addEventListener("playing", () => {
      this.isBuffering = false;
      this.isPlaying = true;
      this.clearBufferWatchdog();
      this.updateMediaSession();
      this.notify();
    });

    audio.addEventListener("waiting", () => {
      if (this.isPlaying) {
        this.isBuffering = true;
        this.notify();
      }
    });

    audio.addEventListener("canplay", () => {
      this.isBuffering = false;
      this.notify();
    });

    audio.addEventListener("error", () => {
      console.warn("Global audio error caught. Attempting failover...");
      this.isBuffering = false;
      const track = BEDROOM_PLAYLIST[this.trackIndex];
      if (track?.backupSrc && audio.src !== track.backupSrc) {
        audio.src = track.backupSrc;
        audio.play().catch(() => {});
      }
      this.notify();
    });

    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }

  private setupMediaSession() {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", () => this.play());
      navigator.mediaSession.setActionHandler("pause", () => this.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => this.prevTrack());
      navigator.mediaSession.setActionHandler("nexttrack", () => this.nextTrack());
    } catch (e) {
      console.warn("MediaSession handler error:", e);
    }
  }

  private updateMediaSession() {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      const track = BEDROOM_PLAYLIST[this.trackIndex];
      const title = this.nowPlaying || track.title;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: this.nowPlaying ? track.title : track.artist,
        album: "7YNX Cyber Sanctuary",
        artwork: [
          { src: "/favicon.ico", sizes: "96x96", type: "image/x-icon" },
        ],
      });
      navigator.mediaSession.playbackState = this.isPlaying ? "playing" : "paused";
    } catch {}
  }

  private clearBufferWatchdog() {
    if (this.bufferWatchdog) {
      clearTimeout(this.bufferWatchdog);
      this.bufferWatchdog = null;
    }
  }

  private clearMetaPolling() {
    if (this.metaInterval) {
      clearInterval(this.metaInterval);
      this.metaInterval = null;
    }
  }

  // Fetch real-time live song title from online radio metadata endpoints
  public async fetchNowPlaying(track: AudioTrack) {
    if (track.type !== "stream") {
      this.nowPlaying = null;
      this.notify();
      return;
    }

    try {
      // Nightride FM Network (Nightride Synthwave, Chillsynth, Spacesynth)
      if (track.id.includes("nightride") || track.id === "chillsynth" || track.id === "spacesynth") {
        const res = await fetch("https://stream.nightride.fm/status-json.xsl", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const sources = data?.icestats?.source;
          if (Array.isArray(sources)) {
            const matchKey = track.id === "synthwave-nightride" ? "nightride.mp3" : `${track.id}.mp3`;
            const source = sources.find((s: any) => s.listenurl && s.listenurl.includes(matchKey));
            if (source?.title) {
              this.nowPlaying = source.title.trim();
              this.updateMediaSession();
              this.notify();
              return;
            }
          }
        }
      }

      // 3. Nightwave Plaza (24/7 Vaporwave / Future Funk)
      if (track.id === "plaza-stream") {
        const res = await fetch("https://api.plaza.one/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.song?.title) {
            const artist = data.song.artist ? `${data.song.artist} - ` : "";
            this.nowPlaying = `${artist}${data.song.title}`.trim();
            this.updateMediaSession();
            this.notify();
            return;
          }
        }
      }

      // 4. 24/7 Lo-Fi Radio (streamafrica)
      if (track.id === "lofi-stream") {
        try {
          const res = await fetch("/api/lofi-stats", { cache: "no-store" });
          if (res.ok) {
            const text = await res.text();
            const match = text.match(/Mount Point \/lofi.*?Current Song:<\/td><td class="streamdata">(.*?)<\/td>/s);
            if (match && match[1]) {
              this.nowPlaying = match[1].trim();
              this.updateMediaSession();
              this.notify();
              return;
            }
          }
        } catch {}
      }
    } catch {
      // Graceful fallback to static track metadata
    }
  }

  public getState(): PlayerState {
    return {
      trackIndex: this.trackIndex,
      currentTrack: BEDROOM_PLAYLIST[this.trackIndex],
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      nowPlaying: this.nowPlaying,
      paletteIndex: this.paletteIndex,
      currentPalette: FIFO_PALETTES[this.paletteIndex],
      beatPulse: this.beatPulse,
      volume: this.volume,
    };
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
    }
    rainAmbience.setVolume(clamped);
    this.notify();
  }

  public getVolume(): number {
    return this.volume;
  }

  public triggerBeatPulse(pulse: number) {
    this.beatPulse = pulse;
  }

  public nextPalette() {
    this.paletteIndex = (this.paletteIndex + 1) % FIFO_PALETTES.length;
    this.beatPulse = 1.0;
    this.notify();
  }

  public setPalette(index: number) {
    this.paletteIndex = (index + FIFO_PALETTES.length) % FIFO_PALETTES.length;
    this.notify();
  }

  public pause() {
    this.clearBufferWatchdog();
    this.clearMetaPolling();
    rainAmbience.stop();
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.isBuffering = false;
    this.updateMediaSession();
    this.notify();
  }

  public play() {
    this.startTrack(this.trackIndex, false);
  }

  public togglePlay() {
    if (this.isPlaying || this.isBuffering) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    const nextIndex = (this.trackIndex + 1) % BEDROOM_PLAYLIST.length;
    this.startTrack(nextIndex, true);
  }

  public prevTrack() {
    const prevIndex = (this.trackIndex - 1 + BEDROOM_PLAYLIST.length) % BEDROOM_PLAYLIST.length;
    this.startTrack(prevIndex, true);
  }

  public startTrack(index: number, advancePalette: boolean = true) {
    this.clearBufferWatchdog();
    this.clearMetaPolling();
    rainAmbience.stop();

    this.trackIndex = (index + BEDROOM_PLAYLIST.length) % BEDROOM_PLAYLIST.length;
    const track = BEDROOM_PLAYLIST[this.trackIndex];
    this.nowPlaying = null;

    if (advancePalette) {
      this.paletteIndex = (this.paletteIndex + 1) % FIFO_PALETTES.length;
    }

    if (track.type === "procedural") {
      if (this.audio) {
        this.audio.pause();
      }
      this.isBuffering = false;
      rainAmbience.playOrOverwrite();
      this.isPlaying = true;
      this.updateMediaSession();
      this.notify();
      return;
    }

    if (track.src && this.audio) {
      const audio = this.audio;
      this.isBuffering = true;
      this.isPlaying = true;

      // Cleanly transition source without calling removeAttribute/load() which causes AbortErrors
      audio.pause();
      audio.src = track.src;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isBuffering = false;
            this.isPlaying = true;
            this.updateMediaSession();
            this.notify();
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              console.warn("Audio play issue, trying fallback:", err);
              if (track.backupSrc) {
                audio.src = track.backupSrc;
                audio
                  .play()
                  .then(() => {
                    this.isBuffering = false;
                    this.isPlaying = true;
                    this.updateMediaSession();
                    this.notify();
                  })
                  .catch(() => {
                    this.isBuffering = false;
                    this.isPlaying = false;
                    this.updateMediaSession();
                    this.notify();
                  });
              } else {
                this.isBuffering = false;
                this.isPlaying = false;
                this.updateMediaSession();
                this.notify();
              }
            }
          });
      }

      // Live station metadata polling
      if (track.type === "stream") {
        this.fetchNowPlaying(track);
        this.metaInterval = setInterval(() => {
          this.fetchNowPlaying(BEDROOM_PLAYLIST[this.trackIndex]);
        }, 15000);

        // 4.5s Buffer Watchdog: automatically fail over if external server connection hangs
        this.bufferWatchdog = setTimeout(() => {
          if (audio.readyState < 3 && track.backupSrc) {
            console.warn("Stream buffer watchdog triggered. Re-tuning to backup...");
            audio.src = track.backupSrc;
            audio.play().then(() => {
              this.isBuffering = false;
              this.isPlaying = true;
              this.notify();
            }).catch(() => {});
          }
        }, 4500);
      }

      this.updateMediaSession();
      this.notify();
    }
  }

  public subscribe(listener: (state: PlayerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

export const musicPlayerEngine = new MusicPlayerEngine();
