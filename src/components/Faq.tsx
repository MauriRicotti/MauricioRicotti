import SectionTitle from "./SectionTitle";
import { useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import WanderingEyes, { type WanderingEyesHandle } from "./WanderingEyes";
import { useLang } from "../i18n";
import { sound } from "../lib/sound";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function Faq({ onOpenContact }: { onOpenContact: () => void }) {
  const { faqs, faqSection } = useLang().c;
  // Una pregunta abierta a la vez (-1 = ninguna). Arranca abierta la primera.
  const [open, setOpen] = useState(0);
  const eyesDesktop = useRef<WanderingEyesHandle>(null);
  const eyesMobile = useRef<WanderingEyesHandle>(null);

  // Al pasar el mouse (o enfocar) el botón, los ojos lo miran
  const lookAtButton = (e: React.SyntheticEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    eyesDesktop.current?.lookAt(x, y);
    eyesMobile.current?.lookAt(x, y);
  };
  const stopLooking = () => {
    eyesDesktop.current?.lookAt(null);
    eyesMobile.current?.lookAt(null);
  };

  const toggle = (i: number) => {
    if (i === open) {
      sound.playClick();
      setOpen(-1);
    } else {
      sound.playPop(520);
      setOpen(i);
    }
  };

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-[#0e0f12] text-white border-t border-white/[0.06] scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Izquierda: título fijo + tarjeta que acompaña el scroll */}
        <div data-reveal className="lg:col-span-5 lg:sticky lg:top-24 xl:top-28 flex flex-col gap-8">
          <div>
            <h2 className="font-hero text-5xl sm:text-6xl md:text-7xl uppercase tracking-[-0.03em] leading-[0.92] text-[#f2ede4]">
              <SectionTitle title={faqSection.title} accent={faqSection.titleAccent} />
            </h2>
            <p className="mt-5 text-base sm:text-lg text-neutral-400 leading-relaxed max-w-sm">
              {faqSection.subtitle}
            </p>
          </div>

          {/* Tarjeta "¿No encontraste lo que buscabas?" visible en escritorio acompañando el scroll */}
          <div className="hidden lg:flex flex-col gap-4 rounded-2xl bg-[#131419] border border-white/[0.08] p-6 xl:p-7 max-w-md">
            <div className="flex items-center gap-3.5">
              <WanderingEyes
                ref={eyesDesktop}
                className="h-11 w-[68px] text-[#f2ede4] shrink-0"
              />
              <p className="text-base xl:text-lg font-semibold text-[#f2ede4] leading-snug">
                {faqSection.helpTitle}
              </p>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {faqSection.helpText}
            </p>
            <button
              type="button"
              onClick={() => {
                sound.playPop(600);
                onOpenContact();
              }}
              onPointerEnter={lookAtButton}
              onPointerLeave={stopLooking}
              onFocus={lookAtButton}
              onBlur={stopLooking}
              className="group w-full inline-flex items-center justify-between h-12 pl-5 pr-1.5 rounded-full bg-[#f2ede4] text-[#0e0f12] text-xs font-bold tracking-wider uppercase whitespace-nowrap hover:bg-accent active:scale-[0.98] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer mt-1 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#131419]"
            >
              <span>{faqSection.helpCta}</span>
              <span className="w-9 h-9 rounded-full bg-[#0e0f12] text-[#f2ede4] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0">
                <ArrowUpRight size={18} />
              </span>
            </button>
          </div>
        </div>

        {/* Derecha: acordeón */}
        <div className="lg:col-span-7">
          <ol className="border-b border-white/[0.08]">
            {faqs.map((f, i) => {
              const isOpen = i === open;
              return (
                <li
                  key={f.q}
                  data-reveal
                  data-reveal-delay={String((i % 4) + 1)}
                  className="border-t border-white/[0.08]"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    className="group w-full flex items-start gap-4 sm:gap-6 py-5 sm:py-6 px-2 -mx-2 rounded-lg text-left cursor-pointer hover:bg-white/[0.015] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
                  >
                    <span
                      className={`font-mono text-xs pt-1.5 transition-colors duration-150 ${
                        isOpen
                          ? "text-accent font-semibold"
                          : "text-neutral-400 group-hover:text-neutral-200"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex-1 text-lg sm:text-xl font-semibold leading-snug tracking-tight transition-colors duration-150 ${
                        isOpen
                          ? "text-white"
                          : "text-neutral-200 group-hover:text-white"
                      }`}
                    >
                      {f.q}
                    </span>
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        isOpen
                          ? "rotate-45 bg-accent border-accent text-[#0e0f12]"
                          : "border-white/15 bg-white/[0.02] text-neutral-400 group-hover:border-white/40 group-hover:text-white"
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className={`grid transition-[grid-template-rows] duration-[240ms] ${EASE} ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="pl-8 sm:pl-12 pr-4 sm:pr-8 pb-6 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl font-normal">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* En celular y tablet: tarjeta al final de las preguntas */}
          <div data-reveal data-reveal-delay="2" className="mt-10 sm:mt-12 rounded-2xl bg-[#131419] border border-white/[0.08] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7 lg:hidden">
            <WanderingEyes
              ref={eyesMobile}
              className="h-14 w-[75px] sm:h-16 sm:w-[86px] text-[#f2ede4]"
            />
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-semibold text-[#f2ede4] leading-snug">
                {faqSection.helpTitle}
              </p>
              <p className="mt-1 text-sm sm:text-base text-neutral-400 leading-relaxed">
                {faqSection.helpText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playPop(600);
                onOpenContact();
              }}
              onPointerEnter={lookAtButton}
              onPointerLeave={stopLooking}
              onFocus={lookAtButton}
              onBlur={stopLooking}
              className="group self-start sm:self-auto inline-flex items-center gap-3 h-12 pl-5 pr-1.5 rounded-full bg-[#f2ede4] text-[#0e0f12] text-sm font-bold tracking-wider uppercase whitespace-nowrap hover:bg-accent active:scale-[0.98] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#131419]"
            >
              <span>{faqSection.helpCta}</span>
              <span className="w-9 h-9 rounded-full bg-[#0e0f12] text-[#f2ede4] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
