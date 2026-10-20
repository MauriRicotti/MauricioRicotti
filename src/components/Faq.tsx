import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useLang } from "../i18n";
import { sound } from "../lib/sound";

const EASE = "ease-[cubic-bezier(0.65,0,0.25,1)]";

export default function Faq({ onOpenContact }: { onOpenContact: () => void }) {
  const { faqs, faqSection } = useLang().c;
  // Una pregunta abierta a la vez (-1 = ninguna). Arranca abierta la primera.
  const [open, setOpen] = useState(0);

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
          <button
            onClick={() => {
              sound.playPop(600);
              onOpenContact();
            }}
            className="group mt-8 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#f2ede4] border-b-2 border-white pb-0.5 hover:text-[#3cd3b7] hover:border-[#3cd3b7] transition-colors cursor-pointer"
          >
            {faqSection.ctaText}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Derecha: acordeón */}
        <ol className="lg:col-span-8 border-b border-white/10">
          {faqs.map((f, i) => {
            const isOpen = i === open;
            return (
              <li key={f.q} className="border-t border-white/10">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="group w-full flex items-start gap-4 sm:gap-6 py-5 sm:py-6 text-left cursor-pointer"
                >
                  <span
                    className={`font-mono text-xs pt-1.5 transition-colors ${
                      isOpen
                        ? "text-[#3cd3b7]"
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
                    className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-[transform,background-color,color,border-color] duration-300 ${
                      isOpen
                        ? "rotate-45 bg-[#3cd3b7] border-[#3cd3b7] text-[#0e0f12]"
                        : "border-white/15 text-neutral-400 group-hover:border-white/40"
                    }`}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-400 ${EASE} ${
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
      </div>
    </section>
  );
}
