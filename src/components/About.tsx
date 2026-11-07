import SectionTitle from "./SectionTitle";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";

export default function About() {
  const { lang, c } = useLang();
  const { about } = c;
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
      className="py-20 sm:py-28 bg-[#0c0d10] text-white border-t border-white/[0.06] scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sobre mí: índice editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Izquierda: queda fija mientras se recorre la lista */}
          <div data-reveal className="lg:col-span-5 lg:sticky lg:top-24 xl:top-28">
            <h2 className="font-hero text-5xl sm:text-6xl md:text-7xl xl:text-8xl uppercase tracking-[-0.03em] leading-[0.9] text-[#f2ede4]">
              <SectionTitle title={about.title} accent={about.titleAccent} />
            </h2>
            <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-5">
              {about.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-base sm:text-lg font-medium text-neutral-100 leading-relaxed tracking-tight"
                      : "text-sm sm:text-base text-neutral-400 leading-relaxed font-normal"
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Derecha: lista numerada de lo que hago */}
          <div className="lg:col-span-7 flex flex-col">
            <div data-reveal className="relative lg:sticky lg:top-24 xl:top-28 z-20 bg-[#0c0d10] pt-1 pb-5 sm:pb-6 border-b border-white/[0.08] flex items-baseline justify-between gap-4">
              {/* Máscara sólida superior: oculta al 100% el texto de los servicios que suben por scroll */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute -top-48 left-0 right-0 h-48 bg-[#0c0d10] pointer-events-none"
              />
              <span className="relative z-10 font-mono text-xs text-neutral-400 select-none">
                01 — {String(about.services.length).padStart(2, "0")}
              </span>
              <h3 className="relative z-10 font-hero text-2xl sm:text-3xl md:text-4xl uppercase tracking-[-0.02em] text-[#f2ede4] text-right">
                {about.servicesTitle ?? (lang === "en" ? "Services I offer" : "Servicios que ofrezco")}
              </h3>
            </div>

            <ol
              ref={listRef}
              className="svc-list border-b border-white/[0.08]"
            >
              {about.services.map((s, i) => (
                <li
                  key={s.title}
                  data-reveal
                  data-reveal-delay={String((i % 4) + 1)}
                  data-active={i === active ? "" : undefined}
                  className="group first:border-t-0 border-t border-white/[0.08] hover:border-white/20 py-8 sm:py-10 grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8 transition-colors duration-200"
                >
                  <span
                    className="svc-hl font-mono text-xs sm:text-sm pt-2 sm:pt-3 select-none"
                    style={
                      { "--c": s.color, "--n": "#a3a3a3" } as React.CSSProperties
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3
                      className="svc-hl font-hero text-4xl sm:text-5xl xl:text-6xl uppercase tracking-[-0.02em] leading-[0.95] transition-colors duration-200"
                      style={
                        {
                          "--c": s.color,
                          "--n": "#f2ede4",
                        } as React.CSSProperties
                      }
                    >
                      {s.title}
                    </h3>
                    <p className="mt-3.5 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-400">
                      {s.description}
                    </p>
                    <ul className="mt-4 sm:mt-5 flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (
                        <li
                          key={t}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-neutral-300 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors duration-150"
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
      </div>
    </section>
  );
}
