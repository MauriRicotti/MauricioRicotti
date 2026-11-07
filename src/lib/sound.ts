/**
 * Pequeños efectos de sonido generados con Web Audio API (sin archivos de audio).
 * La preferencia se guarda por origen en localStorage, no en sessionStorage.
 */
export const SOUND_STORAGE_KEY = "mr:sound-enabled";
const DEFAULT_ENABLED = true;

/** Volumen general de los efectos (1 = original). Subilo o bajalo a gusto (máx. ~4). */
const VOLUME = 2.6;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private value = DEFAULT_ENABLED;
  private preferenceLoaded = false;
  private listening = false;
  private listeners = new Set<() => void>();
  private active = new Set<OscillatorNode>();

  private readPreference(): boolean | undefined {
    if (typeof window === "undefined") return undefined;
    try {
      const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
      return saved === "false" ? false : DEFAULT_ENABLED;
    } catch {
      // El visor aislado, algunas WebViews y el modo privado pueden bloquear storage.
      return undefined;
    }
  }

  private apply(value: boolean) {
    const changed = this.value !== value;
    this.value = value;
    if (!value) {
      // También interrumpe un efecto que estuviera sonando al apagar el interruptor.
      for (const oscillator of this.active) {
        try { oscillator.stop(); } catch { /* ya terminó */ }
      }
      this.active.clear();
    }
    if (changed) this.listeners.forEach((listener) => listener());
  }

  private refreshPreference = () => {
    const saved = this.readPreference();
    if (saved !== undefined) this.apply(saved);
  };

  private onStorage = (event: StorageEvent) => {
    if (event.key !== SOUND_STORAGE_KEY && event.key !== null) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch {
      return;
    }
    this.refreshPreference();
  };

  private loadPreference() {
    if (typeof window === "undefined" || this.preferenceLoaded) return;
    this.preferenceLoaded = true;
    this.refreshPreference();
    if (!this.listening) {
      this.listening = true;
      window.addEventListener("storage", this.onStorage);
      // Al volver desde otra página o desde la caché de navegación, relee el ajuste.
      window.addEventListener("pageshow", this.refreshPreference);
    }
  }

  get enabled() {
    this.loadPreference();
    return this.value;
  }

  set enabled(value: boolean) {
    this.loadPreference();
    // Un fallo al guardar nunca debe impedir que el usuario silencie esta visita.
    try {
      if (typeof window !== "undefined")
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(value));
    } catch { /* sin storage: se mantiene la elección en memoria */ }
    this.apply(value);
  }

  // Snapshot estable para que el interruptor y el motor usen una única preferencia.
  getSnapshot = () => this.enabled;
  // SSR no conoce el navegador: no anuncia sonido activado antes de leer su elección.
  getServerSnapshot = () => false;
  subscribe = (listener: () => void) => {
    this.loadPreference();
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === "suspended")
      void this.ctx.resume().catch(() => { /* el navegador requiere interacción */ });
  }

  private tone(
    type: OscillatorType,
    from: number,
    to: number | null,
    gain: number,
    duration: number,
  ) {
    // Lee lo guardado ANTES de crear un AudioContext o programar una nota.
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
      this.active.add(osc);
      osc.onended = () => {
        this.active.delete(osc);
        osc.disconnect();
        g.disconnect();
      };
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
