/**
 * Pequeños efectos de sonido generados con Web Audio API (sin archivos de audio).
 */
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
      g.gain.setValueAtTime(gain, now);
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

  playClick() {
    this.tone("sine", 320, null, 0.04, 0.03);
  }
}

export const sound = new SoundEngine();
