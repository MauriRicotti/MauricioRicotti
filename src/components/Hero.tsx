import { Fragment } from "react";
import type { Profile } from "../types";
import { Download } from "lucide-react";
import { sound } from "../lib/sound";
import { useLang } from "../i18n";

interface HeroProps {
  profile: Profile;
  onOpenContact: () => void;
}

export default function Hero({ profile, onOpenContact }: HeroProps) {
  const { ui } = useLang().c;
  return (
    <section className="relative isolate overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-10 sm:pb-14 bg-[#0e0f12] text-white">
      {/* Fondo: cuadrícula que se desvanece. Estático, sin brillos ni máscaras. */}
      <div aria-hidden="true" className="hero-bg" />
      <div className="relative max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hero-wrap mb-8 sm:mb-10">
          {/* Tamaño fluido: ocupa casi todo el ancho en celulares, con tope de 12.2rem en escritorio */}
          <h1 className="hero-title font-hero font-black uppercase tracking-tight leading-[0.88] text-[#f2ede4] text-left">
            {(() => {
              // Celular: una palabra por línea. Escritorio: "FULL STACK" arriba a la izquierda y "DEVELOPER" abajo a la derecha.
              // La última palabra va solo con contorno, sin relleno.
              const words = profile.role.trim().split(/\s+/);
              const last = words.pop();
              return (
                <>
                  {/* Animación de entrada: cada palabra sube; la última se "dibuja" (ver index.css) */}
                  {words.map((w, i) => (
                    <Fragment key={w}>
                      <span
                        data-intro="up"
                        style={{ "--d": `${i * 0.09}s` } as React.CSSProperties}
                        className="block sm:inline-block"
                      >
                        {w}
                      </span>{" "}
                    </Fragment>
                  ))}
                  <span
                    data-intro="draw"
                    style={{ "--d": "0.28s" } as React.CSSProperties}
                    className="hero-outline block lg:text-right"
                  >
                    {last}
                  </span>
                </>
              );
            })()}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start pb-2">
          <div
            data-intro="fade"
            style={{ "--d": "0.6s" } as React.CSSProperties}
            className="md:col-span-5 text-neutral-400 text-sm sm:text-base leading-relaxed"
          >
            <p>{profile.leftBio}</p>
          </div>
          <div
            data-intro="fade"
            style={{ "--d": "0.68s" } as React.CSSProperties}
            className="md:col-span-5 text-neutral-400 text-sm sm:text-base leading-relaxed"
          >
            <p>{profile.centerBio}</p>
          </div>
          <div
            data-intro="fade"
            style={{ "--d": "0.76s" } as React.CSSProperties}
            className="md:col-span-2 flex flex-wrap md:flex-col items-center md:items-end gap-x-7 gap-y-4"
          >
            <button
              onClick={() => {
                sound.playPop(580);
                onOpenContact();
              }}
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-widest text-[#f2ede4] uppercase border-b-2 border-white pb-0.5 hover:text-[#3cd3b7] hover:border-[#3cd3b7] transition-colors cursor-pointer"
            >
              <span>{profile.ctaText}</span>
              <span className="group-hover:translate-x-1 transition-transform inline-block">
                →
              </span>
            </button>
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                download
                onClick={() => sound.playClick()}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-widest text-neutral-400 uppercase border-b-2 border-white/25 pb-0.5 hover:text-[#3cd3b7] hover:border-[#3cd3b7] transition-colors whitespace-nowrap"
              >
                <span>CV</span>
                <Download
                  size={14}
                  className="group-hover:translate-y-0.5 transition-transform"
                />
                <span className="sr-only">{ui.downloadCv}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
