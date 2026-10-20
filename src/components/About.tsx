import type React from "react";
import { useEffect, useRef, useState } from "react";
import { about } from "../data/content";

export default function About() {
  /* Al hacer scroll, se "enciende" (mismo aspecto que el hover) el servicio que cruza una
     línea imaginaria al 45% del alto de la pantalla, así se van activando de arriba hacia abajo.
     Se calcula a mano (y no con IntersectionObserver + rootMargin) porque dentro de un iframe,
     como la vista previa, el navegador ignora el rootMargin. Solo corre mientras hay scroll,
     como mucho una vez por cuadro, y actualiza el estado solo cuando cambia el activo. */
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.children) as HTMLElement[];
    let raf = 0;
    let last = -2;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let idx = -1;
      const box = list.getBoundingClientRect();
      if (box.top <= line && box.bottom > line) {
        idx = items.findIndex((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= line && r.bottom > line;
        });
      }
      if (idx !== last) {
        last = idx;
        setActive(idx);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="about"
      className="py-20 sm:py-28 bg-[#0c0d10] text-white border-t border-white/5 scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sobre mí: índice editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Izquierda: queda fija mientras se recorre la lista */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <h2 className="font-hero text-6xl sm:text-7xl xl:text-8xl uppercase tracking-tight leading-[0.9] text-[#f2ede4]">
              {about.title}
            </h2>
            <div className="mt-8 space-y-4">
              {about.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`${i === 0 ? "text-neutral-200" : "text-neutral-400"} text-base leading-relaxed`}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Derecha: lista numerada de lo que hago */}
          <ol
            ref={listRef}
            className="svc-list lg:col-span-7 border-b border-white/10"
          >
            {about.services.map((s, i) => (
              <li
                key={s.title}
                data-active={i === active ? "" : undefined}
                className="border-t border-white/10 py-8 sm:py-10 grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8"
              >
                <span
                  className="svc-hl font-mono text-xs sm:text-sm pt-2 sm:pt-3"
                  style={
                    { "--c": s.color, "--n": "#8c8c8c" } as React.CSSProperties
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3
                    className="svc-hl font-hero text-4xl sm:text-5xl xl:text-6xl uppercase tracking-tight leading-[0.95]"
                    style={
                      {
                        "--c": s.color,
                        "--n": "#f2ede4",
                      } as React.CSSProperties
                    }
                  >
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-400">
                    {s.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <li
                        key={t}
                        className="px-2.5 py-1 rounded-full text-[11px] font-mono text-neutral-300 bg-white/[0.04] border border-white/10"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
