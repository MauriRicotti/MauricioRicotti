/**
 * Observador de micro-animaciones al hacer scroll (Scroll Reveal).
 * Revela suavemente elementos con el atributo [data-reveal] una sola vez al entrar
 * al viewport con aceleración por hardware (GPU) y curva de desaceleración orgánica.
 */
export function initScrollReveal(): () => void {
  if (typeof window === "undefined") return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.add("is-revealed");
    });
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -30px 0px",
    },
  );

  const observeElements = () => {
    document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => {
      observer.observe(el);
    });
  };

  observeElements();

  // Vigila nuevos elementos montados en el DOM (hidratación o lazy-loading)
  const mo = new MutationObserver(observeElements);
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mo.disconnect();
  };
}
