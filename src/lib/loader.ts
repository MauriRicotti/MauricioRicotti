/** Pantalla de carga (está en index.html): cuántos ms faltan para que empiece a abrirse.
 *  0 si no se muestra (ya se vio en esta visita o "reducir movimiento" está activado). */
export function loaderDelay(): number {
  const at = (window as Window & { __mrReveal?: number }).__mrReveal;
  return typeof at === "number" ? Math.max(0, at - performance.now()) : 0;
}
