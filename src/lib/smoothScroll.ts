import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/**
 * Inicializa Lenis para un smooth scroll fluido, con inercia orgánica y aceleración de hardware.
 * Desactiva automáticamente el suavizado si el usuario tiene activado prefers-reduced-motion.
 */
export function initSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const lenis = new Lenis({
    duration: 1.15,
    // Curva exponencial suave estándar en experiencias de alta ingeniería (Linear / Vercel)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
    syncTouch: false, // En móviles y tablets preserva el momentum nativo de 120Hz sin interferencias
  });

  lenisInstance = lenis;

  let rafId = 0;
  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(rafId);
    lenis.destroy();
    lenisInstance = null;
  };
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Lleva al inicio de la página con desplazamiento suave. */
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: 1.1 });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/** Lleva a una sección por id respetando el espacio del header fijo. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -68, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
