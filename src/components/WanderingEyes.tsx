import type React from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Ojos que miran a los costados y parpadean.
 * Basado en "Wandering eyes" de Loading UI (loading-ui.com), adaptado:
 * - Se mueve con transform (más liviano que animar el fondo y el alto, como el original).
 * - Solo se anima mientras está en pantalla (fuera de pantalla queda en pausa).
 * - Con "reducir movimiento" activado, quedan quietos.
 * - lookAt(x, y): mira hacia un punto de la pantalla (ej. un botón); lookAt(null) vuelve a pasear.
 *
 * Tamaño: con className (ej. "h-16 w-[86px]": con ancho ≈ 1,33 × alto los ojos ocupan justo la caja).
 * Color: hereda el color del texto (la pupila es currentColor y el ojo, una versión tenue).
 * Duración de la vuelta completa: style={{ "--duration": "10s" }}.
 */

export interface WanderingEyesHandle {
  lookAt: (x: number | null, y?: number) => void;
}

const WanderingEyes = forwardRef<
  WanderingEyesHandle,
  { className?: string; style?: React.CSSProperties }
>(function WanderingEyes({ className = "", style }, ref) {
  const root = useRef<HTMLSpanElement>(null);

  // En pausa fuera de pantalla
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) {
      el?.classList.add("is-on");
      return;
    }
    const io = new IntersectionObserver(([e]) =>
      el.classList.toggle("is-on", e.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    lookAt(x, y = 0) {
      const el = root.current;
      if (!el) return;
      if (x === null) {
        el.classList.remove("is-looking");
        return;
      }
      const r = el.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      el.style.setProperty("--look-x", (dx / len).toFixed(3));
      el.style.setProperty("--look-y", (dy / len).toFixed(3));
      el.classList.add("is-looking");
    },
  }));

  return (
    <span
      ref={root}
      aria-hidden="true"
      className={`wandering-eyes ${className}`}
      style={style}
    >
      <span className="we-pair">
        <span className="we-eye">
          <span className="we-pupil" />
        </span>
        <span className="we-eye">
          <span className="we-pupil" />
        </span>
      </span>
    </span>
  );
});

export default WanderingEyes;
