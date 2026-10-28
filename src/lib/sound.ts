/**
 * Pequeños efectos de sonido generados con Web Audio API (sin archivos de audio).
 */
/** Volumen general de los efectos (1 = original). Subilo o bajalo a gusto (máx. ~4). */
const VOLUME = 2.6;

class SoundEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  private tone(
    type: OscillatorType,
    from: number,
    to: number | null,
    gain: number,
    duration: number,
  ) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, now);
      if (to !== null)
        osc.frequency.exponentialRampToValueAtTime(to, now + duration);
      g.gain.setValueAtTime(Math.min(gain * VOLUME, 0.6), now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + duration + 0.01);
    } catch {
      /* el audio es opcional */
    }
  }

  playPop(freq = 440) {
    this.tone("sine", freq, freq * 1.5, 0.08, 0.08);
  }

  playSnap() {
    this.tone("triangle", 600, 220, 0.05, 0.05);
  }

  private lastMetal = -1e9;

  /**
   * "Clinc" metálico corto (al tocar la tarjeta 3D): tres parciales inarmónicos
   * como los de una pieza de metal chica + un golpecito de ruido para el ataque.
   */
  playMetal() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      const ctx = this.ctx;
      if (!ctx) return;
      const t = performance.now();
      if (t - this.lastMetal < 80) return; // evita que se amontonen
      this.lastMetal = t;
      const now = ctx.currentTime;
      const base = 1700 + Math.random() * 160; // pequeña variación en cada toque
      const out = ctx.createGain();
      out.gain.value = Math.min(0.05 * VOLUME, 0.25);
      out.connect(ctx.destination);
      // parciales: [relación de frecuencia, volumen, duración]
      const partials: [number, number, number][] = [
        [1, 1, 0.32],
        [2.76, 0.55, 0.2],
        [5.4, 0.3, 0.1],
      ];
      for (const [ratio, vol, dur] of partials) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(base * ratio, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(vol, now + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(g);
        g.connect(out);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      }
      // ataque: 15 ms de ruido agudo
      const len = Math.floor(ctx.sampleRate * 0.015);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 3500;
      const ng = ctx.createGain();
      ng.gain.value = 0.35;
      noise.connect(hp);
      hp.connect(ng);
      ng.connect(out);
      noise.start(now);
    } catch {
      /* el audio es opcional */
    }
  }

  playClick() {
    this.tone("sine", 320, null, 0.04, 0.03);
  }
}

export const sound = new SoundEngine();
