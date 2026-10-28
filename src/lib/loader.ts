/** Coordinación liviana con el loader inline de index.html.
 *  Ninguna de estas funciones espera a WebGL ni bloquea la entrada al contenido. */
interface LoaderGate {
  revealAt: number;
  opened: Promise<number>;
  finished: Promise<number>;
  start: () => void;
}

declare global {
  interface Window {
    __mrLoader?: LoaderGate;
    __mrReveal?: number;
    __mrIntroAt?: number;
  }
}

/** Milisegundos hasta la apertura prevista. 0 si no hay loader o ya abrió. */
export function loaderDelay(): number {
  if (typeof window === "undefined") return 0;
  const at = window.__mrLoader?.revealAt || window.__mrReveal;
  return typeof at === "number" ? Math.max(0, at - performance.now()) : 0;
}

/** El hero espera a la apertura real, no a un reloj iniciado antes del primer pintado. */
export function whenLoaderOpens(): Promise<number> {
  return typeof window === "undefined"
    ? Promise.resolve(0)
    : window.__mrLoader?.opened ?? Promise.resolve(performance.now());
}

let painted: Promise<void> | undefined;

/** Trabajo no esencial: después de quitar el loader y dar al navegador ocasión de pintar.
 *  Se comparte la misma promesa entre la tarjeta y la precarga del formulario. */
export function afterLoaderPaint(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  painted ??= (window.__mrLoader?.finished ?? Promise.resolve()).then(
    () => new Promise<void>((resolve) => {
      requestAnimationFrame(() => window.setTimeout(resolve, 0));
    }),
  );
  return painted;
}

/** Marca el comienzo efectivo del título, también cuando una fuente tarda en cargar. */
export function markHeroIntro(): void {
  if (typeof window.__mrIntroAt === "number") return;
  window.__mrIntroAt = performance.now();
  performance.mark("mr:hero-intro");
  window.dispatchEvent(new CustomEvent("mr:hero-intro", { detail: window.__mrIntroAt }));
}

/** La tarjeta puede llegar más tarde, pero nunca empieza su caída antes del título. */
export function whenHeroIntroStarts(): Promise<number> {
  if (typeof window === "undefined") return Promise.resolve(0);
  if (typeof window.__mrIntroAt === "number") return Promise.resolve(window.__mrIntroAt);
  // Respaldo para hot-reload en desarrollo, si el helper se actualizó tras la entrada.
  if (document.documentElement.classList.contains("intro-go")) return Promise.resolve(performance.now());
  return new Promise((resolve) => {
    window.addEventListener("mr:hero-intro", (event) => {
      resolve((event as CustomEvent<number>).detail);
    }, { once: true });
  });
}
