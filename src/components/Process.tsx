import type { CSSProperties } from "react";
import { processSection, processSteps } from "../data/content";

/**
 * "Cómo trabajo": tarjetas grandes que se van apilando una sobre otra al hacer scroll.
 * Es solo CSS (position: sticky), sin JavaScript: no agrega trabajo al scroll.
 * Cada tarjeta se frena un poco más abajo que la anterior, así se ve el borde de las de atrás.
 */
export default function Process() {
  const total = String(processSteps.length).padStart(2, "0");

  return (
    <section
      id="process"
      className="py-20 sm:py-28 bg-[#0e0f12] text-white scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-16 grid lg:grid-cols-12 gap-6 items-end">
          <h2 className="lg:col-span-7 font-hero text-6xl sm:text-7xl xl:text-8xl uppercase tracking-tight leading-[0.9] text-[#f2ede4]">
            {processSection.title}
          </h2>
          <p className="lg:col-span-5 text-base sm:text-lg text-neutral-400 leading-relaxed lg:text-right">
            {processSection.subtitle}
          </p>
        </div>

        <ol className="process-stack">
          {processSteps.map((s, i) => (
            <li
              key={s.title}
              className="process-card"
              style={{ "--i": i } as CSSProperties}
            >
              <article
                className="rounded-xl p-6 sm:p-10 lg:p-14 text-[#0e0f12] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 shadow-[0_-16px_40px_rgba(0,0,0,0.45)] min-h-[min(440px,calc(100svh-140px))]"
                style={{ background: s.color }}
              >
                <div className="lg:col-span-5 flex lg:flex-col justify-between items-start gap-4">
                  <span className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-widest opacity-90">
                    Paso {String(i + 1).padStart(2, "0")} / {total}
                  </span>
                  <span className="font-hero leading-[0.8] text-[clamp(5rem,16vw,13rem)] tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-end">
                  <h3 className="font-hero uppercase tracking-tight leading-[0.92] text-[clamp(2.6rem,5.5vw,5.5rem)]">
                    {s.title}
                  </h3>
                  <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed max-w-xl opacity-85">
                    {s.text}
                  </p>
                  <ul className="mt-6 sm:mt-8 flex flex-wrap gap-2">
                    {s.items.map((t) => (
                      <li
                        key={t}
                        className="px-3 py-1.5 rounded-full border-[1.5px] border-[#0e0f12]/80 text-sm font-medium"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
