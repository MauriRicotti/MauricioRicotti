import { Fragment, useEffect, useRef } from "react";
import { useLang } from "../i18n";

/**
 * Franjas de texto gigante que se desplazan hacia los costados según el scroll
 * (una a la izquierda, la siguiente a la derecha, etc.).
 *
 * Tienen inercia: siguen al scroll con un pequeño retraso y frenan de a poco.
 * Rendimiento: no hay animación continua. Solo se anima mientras la franja se está
 * moviendo (hasta que se detiene) y únicamente si la sección está en pantalla.
 * Se mueve con transform (lo hace la placa de video, sin recalcular la página).
 */

const COPIES = 4; // repeticiones del texto para que la franja nunca quede corta (con 3 ya alcanza en 360–2560 px)

/** Estrella separadora, del mismo color que el texto (en la fila de contorno, solo borde). */
function Star({ outline = false }: { outline?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="inline-block w-[0.45em] h-[0.45em] mx-[0.35em] align-middle shrink-0 overflow-visible"
    >
      <path
        d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
        fill={outline ? "none" : "currentColor"}
        stroke={outline ? "#f2ede4" : "none"}
        strokeWidth={outline ? 1.5 : 0}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function Marquee() {
  const { marqueeRows } = useLang().c;
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Inercia: la franja no salta a la posición del scroll, se acerca de a poco.
    // Cuando el scroll frena, sigue deslizándose y se detiene suavemente.
    const EASE = 0.06; // fracción del camino que recorre por cuadro (más bajo = frena más lento)
    let raf = 0;
    let current = 0; // desplazamiento actual (px)
    let target = 0; // desplazamiento según el scroll (px)
    let last = 0;

    const visible = () => {
      const r = section.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const computeTarget = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // -0.5 cuando la sección entra por abajo … +0.5 cuando sale por arriba
      const p = Math.min(
        0.5,
        Math.max(-0.5, (vh - r.top) / (vh + r.height) - 0.5),
      );
      const vw = window.innerWidth;
      // en celular el recorrido es mayor (las letras son más grandes respecto de la pantalla)
      const dist = vw < 640 ? vw * 1.2 : Math.min(vw, 1600) * 0.6;
      target = p * dist;
    };
    const apply = () => {
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const dir = i % 2 === 0 ? -1 : 1;
        row.style.transform = `translate3d(calc(-25% + ${(dir * current).toFixed(2)}px), 0, 0)`;
      });
    };
    const tick = (now: number) => {
      const dt = Math.min(64, now - (last || now - 16.7));
      last = now;
      computeTarget();
      if (!visible()) {
        // fuera de pantalla: se ubica directo y se detiene (no gasta nada; si no cambió, ni lo toca)
        if (current !== target) {
          current = target;
          apply();
        }
        raf = 0;
        return;
      }
      const k = 1 - Math.pow(1 - EASE, dt / 16.7); // igual a cualquier tasa de refresco
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.2) current = target;
      apply();
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    computeTarget();
    current = target;
    apply();
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", start);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="marquee"
      aria-label={marqueeRows.map((r) => r.words.join(", ")).join(". ")}
      className="relative py-20 sm:py-24 bg-[#0e0f12] text-white overflow-hidden border-t border-white/5 select-none"
    >
      {marqueeRows.map((row, i) => {
        const words = Array.from({ length: COPIES }, () => row.words).flat();
        const line = (
          <div
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="flex w-max items-center whitespace-nowrap will-change-transform"
            style={{ transform: "translate3d(-25%, 0, 0)" }}
          >
            {words.map((w, j) => (
              <Fragment key={j}>
                <span>{w}</span>
                <Star outline={row.style === "outline"} />
              </Fragment>
            ))}
          </div>
        );

        if (row.style === "band") {
          return (
            <div
              key={i}
              className="relative z-10 my-8 sm:my-10 -mx-[5vw] -rotate-3 sm:-rotate-2 bg-accent text-[#0e0f12] py-3 sm:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.45)] font-hero uppercase tracking-tight leading-none text-[15vw] sm:text-[clamp(2.4rem,6vw,5.5rem)]"
            >
              {line}
            </div>
          );
        }
        return (
          <div
            key={i}
            className={`font-hero uppercase tracking-tight leading-[0.95] text-[30vw] sm:text-[clamp(4rem,11vw,10.5rem)] ${
              row.style === "outline" ? "marquee-outline" : "text-[#f2ede4]"
            }`}
          >
            {line}
          </div>
        );
      })}
    </section>
  );
}
