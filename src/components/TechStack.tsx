import type { CSSProperties } from "react";
import type { TechGroup } from "../types";
import { brandColor, techIcons } from "../lib/techIcons";
import { useLang } from "../i18n";

interface TechStackProps {
  title: string;
  groups: TechGroup[];
}

export default function TechStack({ title, groups }: TechStackProps) {
  const { lang } = useLang();

  // Repartimos los elementos en dos cintas dinámicas para movimiento continuo cruzado
  const allItems = groups.flatMap((g) => g.items);
  const mid = Math.ceil(allItems.length / 2);
  const stream1 = allItems.slice(0, mid);
  const stream2 = allItems.slice(mid);

  return (
    <section
      id="stack"
      aria-label={title}
      className="relative z-10 bg-[#0e0f12] text-white py-14 sm:py-20 border-y border-white/[0.08] overflow-hidden"
    >
      {/* Encabezado limpio sin badges pesados */}
      <div data-reveal className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-hero text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#f2ede4]">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-[#f2ede4]/60 font-mono tracking-wide max-w-md">
          {lang === "en"
            ? "Production-tested tools for fast, scalable, and resilient web applications."
            : "Herramientas probadas en producción para aplicaciones web rápidas, escalables y seguras."}
        </p>
      </div>

      {/* Contenedor de doble cinta cruzada */}
      <div data-reveal data-reveal-delay="1" className="relative flex flex-col gap-3 sm:gap-4 overflow-hidden select-none">
        {/* Degradados laterales estáticos (cero costo de composición para la GPU, 60/120 fps fluidos) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#0e0f12] to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#0e0f12] to-transparent z-10"
        />

        {/* Cinta 1: Hacia la izquierda (Frameworks y Core) */}
        <div className="group flex overflow-hidden">
          <div className="animate-marquee-left flex items-center gap-3 sm:gap-4 group-hover:[animation-play-state:paused]">
            {[...stream1, ...stream1, ...stream1, ...stream1].map((item, index) => {
              const icon = item.icon ? techIcons[item.icon] : undefined;
              const color = icon ? brandColor(icon.hex) : "#F46200";
              return (
                <div
                  key={`${item.name}-${index}`}
                  style={{ "--brand": color } as CSSProperties}
                  className="group/chip inline-flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.07] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                >
                  {icon ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 fill-white/45 group-hover/chip:fill-[var(--brand)] transition-colors duration-150"
                      aria-hidden="true"
                    >
                      <path d={icon.path} />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover/chip:bg-accent transition-colors duration-150 shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium text-white/75 group-hover/chip:text-white transition-colors duration-150">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cinta 2: Hacia la derecha (Plataformas y Delivery) */}
        <div className="group flex overflow-hidden">
          <div className="animate-marquee-right flex items-center gap-3 sm:gap-4 group-hover:[animation-play-state:paused]">
            {[...stream2, ...stream2, ...stream2, ...stream2].map((item, index) => {
              const icon = item.icon ? techIcons[item.icon] : undefined;
              const color = icon ? brandColor(icon.hex) : "#F46200";
              return (
                <div
                  key={`${item.name}-${index}`}
                  style={{ "--brand": color } as CSSProperties}
                  className="group/chip inline-flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.07] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                >
                  {icon ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 fill-white/45 group-hover/chip:fill-[var(--brand)] transition-colors duration-150"
                      aria-hidden="true"
                    >
                      <path d={icon.path} />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover/chip:bg-accent transition-colors duration-150 shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium text-white/75 group-hover/chip:text-white transition-colors duration-150">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
