import { useEffect, useRef } from "react";
import type { Lang } from "../i18n";

/**
 * Cortina del cambio de idioma: un panel crema barre la pantalla de izquierda a derecha
 * con el nombre del idioma en grande. Cuando tapa todo, se cambia el texto de la web
 * (onCovered) y el panel sigue de largo (onDone). Total ≈ 0,9 s.
 * Solo transform (liviano). Con "reducir movimiento" no se usa (el cambio es directo).
 */
const IN_MS = 400;
const HOLD_MS = 110;
const OUT_MS = 420;
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(14,15,18,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,15,18,0.07) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

export default function LangCurtain({
  from,
  to,
  onCovered,
  onDone,
}: {
  from: Lang;
  to: Lang;
  onCovered: () => void;
  onDone: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  // Refs para no reiniciar la animación si cambian las funciones
  const cb = useRef({ onCovered, onDone });
  cb.current = { onCovered, onDone };

  useEffect(() => {
    const panel = panelRef.current;
    const text = textRef.current;
    if (!panel || !text) return;
    let cancelled = false;
    let timer = 0;
    const opts = (duration: number): KeyframeAnimationOptions => ({
      duration,
      easing: EASE,
      fill: "forwards",
    });

    // Entra desde la izquierda (el texto se mueve un poco menos: efecto de profundidad)
    const a = panel.animate(
      [{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }],
      opts(IN_MS),
    );
    text.animate(
      [{ transform: "translateX(-35%)" }, { transform: "translateX(0)" }],
      opts(IN_MS),
    );

    a.onfinish = () => {
      if (cancelled) return;
      cb.current.onCovered();
      timer = window.setTimeout(() => {
        if (cancelled) return;
        // Sale por la derecha
        const b = panel.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(101%)" }],
          opts(OUT_MS),
        );
        text.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(35%)" }],
          opts(OUT_MS),
        );
        b.onfinish = () => !cancelled && cb.current.onDone();
      }, HOLD_MS);
    };

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] overflow-hidden pointer-events-auto"
    >
      <div
        ref={panelRef}
        style={{ ...GRID_BG, transform: "translateX(-101%)" }}
        className="absolute inset-0 bg-[#eee9df] text-[#0e0f12] flex items-center justify-center will-change-transform"
      >
        <div
          ref={textRef}
          className="flex flex-col items-center gap-4 sm:gap-6"
        >
          <span className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-[#0e0f12]/55">
            {from} → {to}
          </span>
          <span className="font-hero uppercase leading-none tracking-tight text-[min(20vw,15rem)]">
            {to === "en" ? "English" : "Español"}
          </span>
        </div>
      </div>
    </div>
  );
}
