import Lenis from "lenis";

/**
 * Scroll suave para toda la web (Lenis).
 *
 * - Con mouse/trackpad el desplazamiento se suaviza (lerp): arranca y frena de a poco.
 * - En celulares se deja el scroll táctil nativo (ya tiene inercia propia y es lo más fluido).
 * - Si el sistema tiene "reducir movimiento" activado, no se activa.
 * - Cualquier contenedor con el atributo `data-lenis-prevent` (p. ej. el formulario de
 *   contacto a pantalla completa) scrollea de forma nativa.
 *
 * Para desactivarlo: borrá la llamada a `initSmoothScroll()` en `src/main.tsx`.
 */

let lenis: Lenis | null = null;

/** Desplazamiento extra al navegar. Lenis ya respeta el `scroll-mt-16` de cada sección
 *  (deja lugar para el header fijo), así que no hace falta sumar nada. */
const HEADER_OFFSET = 0;

export function initSmoothScroll() {
  if (lenis || typeof window === "undefined") return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return null;
  lenis = new Lenis({
    autoRaf: true, // Lenis maneja su propio requestAnimationFrame
    lerp: 0.085, // más bajo = más suave/lento al frenar (0.1 es el valor por defecto)
    smoothWheel: true,
    syncTouch: false, // táctil nativo
    wheelMultiplier: 1,
  });
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Lleva al inicio de la página (suave). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Lleva a una sección por id (suave), dejando lugar para el header. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: HEADER_OFFSET, duration: 1.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Frena / reanuda el scroll de la página (p. ej. con el formulario abierto). */
export function setSmoothScrollPaused(paused: boolean) {
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}
