/**
 * Navegación dentro de la página.
 *
 * El scroll con la rueda / el trackpad es el NATIVO del navegador (sin suavizado
 * extra). Solo los clicks del menú y el botón "volver arriba" se desplazan con
 * una animación corta del propio navegador.
 */

/** Lleva al inicio de la página. */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Lleva a una sección por id (respeta el `scroll-mt` de cada sección, que deja
 *  lugar para el header fijo). */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
