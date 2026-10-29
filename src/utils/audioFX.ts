// Procedural Web Audio Sound Generator for UI & 3D Interactivity
// Inspired by Lusion and Emotion Agency micro-sound design

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  // Card pickup: smooth paper/metal slide whoosh
  playCardPickup() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.32);
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.35);
    } catch {
      // Autoplay policy
    }
  }

  // Card flip: crisp mechanical / card flick snap
  playCardFlip() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Impulse 1: highpass card cut
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(3600, now + 0.07);
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.22, now + 0.004);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      noise.connect(filter);
      filter.connect(gain1);
      gain1.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.08);

      // Impulse 2: tactile resonance flick
      const osc = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1800, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain2.gain.setValueAtTime(0.0001, now + 0.06);
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.063);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain2);
      gain2.connect(ctx.destination);
      osc.start(now + 0.06);
      osc.stop(now + 0.13);
    } catch {
      // Autoplay policy
    }
  }

  // Card putdown: tactile wooden desk clack
  playCardPutdown() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      const gainOsc = ctx.createGain();
      gainOsc.gain.setValueAtTime(0.22, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.0001, now);
      gainNoise.gain.linearRampToValueAtTime(0.2, now + 0.002);
      gainNoise.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      noise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    } catch {
      // Autoplay policy
    }
  }

  // Subtle metallic UI tick on hover
  playHover() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Deep cyber magnetic snap for room clicks / transitions
  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  // Camera teleport whoosh sweep
  playZoom() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.25);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.25);
      filter.Q.value = 3.0;
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.28);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  // Polyphonic Synth Note for 3D MIDI Keyboard & interactive audio
  playSynthNote(freq: number = 440) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Dual oscillator for rich analog sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "square";
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.005, now); // slight detune

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3.5, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Ignore
    }
  }

  // Thermal Receipt Printer feed stepper motor & paper advance sound
  playPrinterThermalFeed() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Pulse stepper noise bursts
      for (let i = 0; i < 6; i++) {
        const t = now + i * 0.045;
        const noise = ctx.createBufferSource();
        noise.buffer = this.getNoiseBuffer(ctx);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2200 + i * 80, t);
        filter.Q.value = 4.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.09, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.04);
      }

      // Paper tear / slice snap at end
      const tearTime = now + 0.32;
      const osc = ctx.createOscillator();
      const tearGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, tearTime);
      osc.frequency.exponentialRampToValueAtTime(140, tearTime + 0.08);
      tearGain.gain.setValueAtTime(0.08, tearTime);
      tearGain.gain.exponentialRampToValueAtTime(0.0001, tearTime + 0.08);
      osc.connect(tearGain);
      tearGain.connect(ctx.destination);
      osc.start(tearTime);
      osc.stop(tearTime + 0.09);
    } catch {
      // Ignore
    }
  }

  // Realistic water droplet plink for succulent plant watering
  playWaterDrop() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }
}

export const soundFX = new SoundFXEngine();
