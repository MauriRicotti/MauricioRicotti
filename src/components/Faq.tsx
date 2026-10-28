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
  const eyes = useRef<WanderingEyesHandle>(null);
  // Al pasar el mouse (o enfocar) el botón, los ojos lo miran
  const lookAtButton = (e: React.SyntheticEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    eyes.current?.lookAt(r.left + r.width / 2, r.top + r.height / 2);
  };
  const stopLooking = () => eyes.current?.lookAt(null);

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
      className="py-20 sm:py-28 bg-[#0e0f12] text-white border-t border-white/5 scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Izquierda: título fijo */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <h2 className="font-hero text-6xl sm:text-7xl uppercase tracking-tight leading-[0.9] text-[#f2ede4]">
            {faqSection.title}
          </h2>
          <p className="mt-6 text-base text-neutral-400 leading-relaxed max-w-sm">
            {faqSection.subtitle}
          </p>
        </div>

        {/* Derecha: acordeón + bloque "¿No encontraste lo que buscabas?" */}
        <div className="lg:col-span-8">
          <ol className="border-b border-white/10">
            {faqs.map((f, i) => {
              const isOpen = i === open;
              return (
                <li key={f.q} className="border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    className="group w-full flex items-start gap-4 sm:gap-6 py-5 sm:py-6 text-left cursor-pointer"
                  >
                    <span
                      className={`font-mono text-xs pt-1.5 transition-colors ${
                        isOpen
                          ? "text-accent"
                          : "text-[#8c8c8c] group-hover:text-neutral-300"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`flex-1 text-lg sm:text-xl font-semibold leading-snug transition-colors ${
                        isOpen
                          ? "text-white"
                          : "text-neutral-200 group-hover:text-white"
                      }`}
                    >
                      {f.q}
                    </span>
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-[transform,background-color,color,border-color] duration-200 ${
                        isOpen
                          ? "rotate-45 bg-accent border-accent text-[#0e0f12]"
                          : "border-white/15 text-neutral-400 group-hover:border-white/40"
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
                      <p className="pl-9 sm:pl-12 pr-12 pb-6 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Ojitos curiosos + empujón para escribir */}
          <div className="mt-10 sm:mt-12 rounded-2xl bg-[#15171c] border border-white/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
            <WanderingEyes
              ref={eyes}
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
              className="group self-start sm:self-auto inline-flex items-center gap-3 h-12 pl-5 pr-1.5 rounded-full bg-[#f2ede4] text-[#0e0f12] text-sm font-bold tracking-wider uppercase whitespace-nowrap shadow-[3px_3px_0_var(--color-accent)] hover:shadow-[1px_1px_0_var(--color-accent)] hover:translate-x-[2px] hover:translate-y-[2px] transition-[transform,box-shadow] duration-200 cursor-pointer"
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
