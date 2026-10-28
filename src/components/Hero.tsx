import type { Profile } from "../types";
import { ArrowUpRight, Download } from "lucide-react";
import { sound } from "../lib/sound";
import { useLang } from "../i18n";
import HeroBadge from "./HeroBadge";
import HeroTitle from "./HeroTitle";

interface HeroProps {
  profile: Profile;
  onOpenContact: () => void;
}

export default function Hero({ profile, onOpenContact }: HeroProps) {
  const { ui } = useLang().c;
  return (
    <section className="relative isolate overflow-hidden pt-28 sm:pt-36 pb-10 sm:pb-14 lg:pb-20 lg:min-h-svh lg:flex lg:flex-col bg-[#0e0f12] text-white">
      {/* Fondo: cuadrícula que se desvanece. Estático, sin brillos ni máscaras. */}
      <div aria-hidden="true" className="hero-bg" />
      {/* Credencial 3D colgante (se carga después de la animación del título) */}
      <HeroBadge
        texts={{
          name: profile.name,
          role: profile.role,
          cta: profile.ctaText,
          year: String(new Date().getFullYear()),
        }}
      />
      <div className="relative w-full max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
        <div className="hero-wrap mb-8 sm:mb-10 lg:mb-[clamp(2.5rem,7svh,5rem)]">
          {/* Tamaño fluido: ocupa casi todo el ancho en celulares, con tope de 12.2rem en escritorio */}
          <HeroTitle role={profile.role} roll={profile.roleRoll} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 xl:grid-cols-[1fr_1fr_auto] gap-6 sm:gap-8 lg:gap-x-12 xl:gap-x-16 items-start pb-2">
          <div
            data-intro="fade"
            style={{ "--d": "0.6s" } as React.CSSProperties}
            className="md:col-span-6 lg:col-span-4 xl:col-span-1 text-neutral-400 text-sm sm:text-base leading-relaxed"
          >
            <p>{profile.leftBio}</p>
          </div>
          <div
            data-intro="fade"
            style={{ "--d": "0.68s" } as React.CSSProperties}
            className="md:col-span-6 lg:col-span-4 xl:col-span-1 text-neutral-400 text-sm sm:text-base leading-relaxed"
          >
            <p>{profile.centerBio}</p>
          </div>
          <div
            data-intro="fade"
            style={{ "--d": "0.76s" } as React.CSSProperties}
            className="md:col-span-12 lg:col-span-4 xl:col-span-1 flex flex-wrap items-center lg:justify-end gap-3 pt-2 lg:pt-0"
          >
            <button
              onClick={() => {
                sound.playPop(580);
                onOpenContact();
              }}
              className="group flex-1 sm:flex-none inline-flex items-center justify-between sm:justify-start gap-3 h-14 pl-6 pr-1.5 rounded-full bg-[#f2ede4] text-[#0e0f12] text-sm sm:text-[15px] font-bold tracking-wider uppercase whitespace-nowrap shadow-[4px_4px_0_#3cd3b7] hover:shadow-[1px_1px_0_#3cd3b7] hover:translate-x-[3px] hover:translate-y-[3px] transition-[transform,box-shadow] duration-200 cursor-pointer"
            >
              <span>{profile.ctaText}</span>
              <span className="w-11 h-11 rounded-full bg-[#0e0f12] text-[#f2ede4] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={20} />
              </span>
            </button>
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                download
                onClick={() => sound.playClick()}
                aria-label={ui.downloadCv}
                className="group inline-flex items-center justify-center gap-2 h-14 px-5 sm:px-6 rounded-full border-2 border-white/30 text-[#f2ede4] text-sm sm:text-[15px] font-bold tracking-wider uppercase whitespace-nowrap hover:border-[#3cd3b7] hover:text-[#3cd3b7] transition-colors"
              >
                <Download
                  size={18}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
                <span className="sm:hidden">CV</span>
                <span className="hidden sm:inline">{ui.downloadCv}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
