// Procedural Ambient Lo-Fi Rain & Windowpane Acoustics Engine
// Global persistent singleton designed to persist across navigation until browser reload

class RainAmbienceEngine {
  private ctx: AudioContext | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private dropSource: AudioBufferSourceNode | null = null;
  private oscNode: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  public isPlaying: boolean = false;
  private listeners: Set<(active: boolean) => void> = new Set();

  constructor() {
    // Check if singleton was already stored on window to survive Vite HMR
    if (typeof window !== "undefined" && (window as unknown as { __zynxRainEngine?: RainAmbienceEngine }).__zynxRainEngine) {
      return (window as unknown as { __zynxRainEngine: RainAmbienceEngine }).__zynxRainEngine;
    }
    if (typeof window !== "undefined") {
      (window as unknown as { __zynxRainEngine: RainAmbienceEngine }).__zynxRainEngine = this;
    }
  }

  private cleanupNodes() {
    try {
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
        this.noiseSource = null;
      }
    } catch {
      // Ignore if already stopped
    }
    try {
      if (this.dropSource) {
        this.dropSource.stop();
        this.dropSource.disconnect();
        this.dropSource = null;
      }
    } catch {
      // Ignore
    }
    try {
      if (this.oscNode) {
        this.oscNode.stop();
        this.oscNode.disconnect();
        this.oscNode = null;
      }
    } catch {
      // Ignore
    }
    try {
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
    } catch {
      // Ignore
    }
  }

  public stop() {
    this.cleanupNodes();
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.playOrOverwrite();
    }
  }

  public async playOrOverwrite() {
    if (typeof window === "undefined") return;

    // Clean up any existing nodes first to overwrite cleanly without stacking
    this.cleanupNodes();

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx || this.ctx.state === "closed") {
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      const sampleRate = this.ctx.sampleRate;
      const bufferDuration = 4; // 4 seconds seamless loop
      const bufferSize = sampleRate * bufferDuration;

      // 1. Stereo Decorrelated Binaural Pink Noise (Atmospheric Rain Field)
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const left = noiseBuffer.getChannelData(0);
      const right = noiseBuffer.getChannelData(1);

      // Paul Kellet's refined 6-stage pink noise filter applied independently to L and R channels
      const generateChannelPinkNoise = (channel: Float32Array) => {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.76160 * b5 - white * 0.0168980;
          channel[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.034;
          b6 = white * 0.115926;
        }
      };

      generateChannelPinkNoise(left);
      generateChannelPinkNoise(right);

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      this.noiseSource = noiseSource;

      // Dual acoustic filters: Lowpass to emulate warm window glass, Highpass to cut mud
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.value = 720;
      lpf.Q.value = 0.8;

      const hpf = this.ctx.createBiquadFilter();
      hpf.type = "highpass";
      hpf.frequency.value = 85;

      // 2. Windowpane Droplets Micro-crackles (gentle stereo raindrops hitting the sill)
      const dropBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const dropL = dropBuffer.getChannelData(0);
      const dropR = dropBuffer.getChannelData(1);
      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() < 0.00028) {
          const val = (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
          const pan = Math.random();
          dropL[i] = val * pan;
          dropR[i] = val * (1 - pan);
        }
      }

      const dropSource = this.ctx.createBufferSource();
      dropSource.buffer = dropBuffer;
      dropSource.loop = true;
      this.dropSource = dropSource;

      const dropFilter = this.ctx.createBiquadFilter();
      dropFilter.type = "bandpass";
      dropFilter.frequency.value = 1400;
      dropFilter.Q.value = 1.8;

      const dropGain = this.ctx.createGain();
      dropGain.gain.value = 0.45;

      // 3. Cozy Bedroom Sub-bass Resonance Drone (55Hz Sine Wave)
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 55;
      this.oscNode = osc;

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.012;
      osc.connect(oscGain);

      // 4. Master Gain & Signal Routing
      const master = this.ctx.createGain();
      master.gain.value = 0.36;
      this.masterGain = master;

      // Connect Pink Noise Layer
      noiseSource.connect(lpf);
      lpf.connect(hpf);
      hpf.connect(master);

      // Connect Window Droplets Layer
      dropSource.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(master);

      // Connect Warm Drone Layer
      oscGain.connect(master);

      // Connect to Destination
      master.connect(this.ctx.destination);

      // Start all streams
      noiseSource.start();
      dropSource.start();
      osc.start();

      this.isPlaying = true;
      this.notify();
    } catch (e) {
      console.warn("RainAmbience Engine:", e);
    }
  }

  public subscribe(listener: (active: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isPlaying));
  }
}

export const rainAmbience = new RainAmbienceEngine();
