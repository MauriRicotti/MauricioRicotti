import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, Mail, MapPin } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import type { Profile } from "../types";
import { sound } from "../lib/sound";
import { footer } from "../data/content";

interface FooterProps {
  profile: Profile;
  onOpenContact: () => void;
}

export default function Footer({ profile, onOpenContact }: FooterProps) {
  const [time, setTime] = useState("");
  const [openNow, setOpenNow] = useState(false);

  // Hora local (Buenos Aires) y si estás dentro del horario de atención
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          timeZone: footer.timeZone,
        }),
      );
      const parts = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: footer.timeZone,
      }).formatToParts(now);
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
        get("weekday"),
      );
      const hm = `${get("hour")}:${get("minute")}`;
      setOpenNow(
        (profile.hours ?? []).some(
          (h) =>
            h.days.includes(day) && h.from && h.to && hm >= h.from && hm < h.to,
        ),
      );
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, [profile.hours]);

  return (
    <footer
      id="contact"
      className="relative bg-[#090a0d] text-white pt-20 sm:pt-28 pb-3 sm:pb-5 border-t border-white/10 overflow-hidden"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-16 sm:pb-24 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="font-hero text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight text-[#f2ede4] leading-none">
              {footer.title}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                aria-label="Enviar un email"
                onClick={() => sound.playClick()}
                className="group inline-flex items-center gap-3 h-12 pl-1.5 pr-6 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/35 text-sm font-semibold text-neutral-200 hover:text-white transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-[#f2ede4] text-[#0e0f12] flex items-center justify-center group-hover:bg-[#3cd3b7] transition-colors">
                  <Mail size={16} />
                </span>
                <span>Email</span>
              </a>
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="group inline-flex items-center gap-3 h-12 pl-1.5 pr-6 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/35 text-sm font-semibold text-neutral-200 hover:text-white transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-[#25d366] text-[#0e0f12] flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={siWhatsapp.path} />
                    </svg>
                  </span>
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPop(650);
              onOpenContact();
            }}
            className="px-8 py-4 rounded-full bg-white text-black hover:bg-[#3cd3b7] font-hero text-lg sm:text-xl font-black uppercase tracking-wider transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 shrink-0"
          >
            {footer.ctaText}
          </button>
        </div>

        {/* Ubicación y horario */}
        <div className="py-10 border-b border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#8c8c8c] mb-3">
              Ubicación
            </p>
            <p className="text-neutral-200 flex items-start gap-2">
              <MapPin size={16} className="text-[#3cd3b7] mt-0.5 shrink-0" />
              {profile.location}
            </p>
          </div>
          {profile.hours && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#8c8c8c] mb-3">
                Horario de atención
              </p>
              <ul className="space-y-1.5">
                {profile.hours.map((h) => (
                  <li
                    key={h.label}
                    className="flex justify-between gap-4 max-w-xs"
                  >
                    <span className="text-neutral-400">{h.label}</span>
                    <span className="font-mono text-neutral-200">
                      {h.from && h.to ? `${h.from} – ${h.to}` : "Cerrado"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#8c8c8c] mb-3">
              Ahora
            </p>
            <p className="flex items-center gap-2 text-neutral-200">
              <span
                className={`w-2 h-2 rounded-full ${openNow ? "bg-emerald-400" : "bg-neutral-500"}`}
              />
              {openNow
                ? "En horario de atención"
                : "Fuera de horario · te respondo pronto"}
            </p>
            <p className="mt-1.5 font-mono text-xs text-[#8c8c8c]">
              Hora local: {time} hs
            </p>
          </div>
        </div>

        {profile.socials.length > 0 && (
          <div className="py-8 border-b border-white/10 flex flex-wrap gap-3">
            {profile.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                {...(s.url.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onClick={() => sound.playClick()}
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-xs font-mono text-neutral-300 hover:text-white transition-all"
              >
                <span>{s.label}</span>
                <ArrowUpRight
                  size={13}
                  className="group-hover:rotate-45 transition-transform"
                />
              </a>
            ))}
          </div>
        )}

        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <span>
            © {new Date().getFullYear()} {profile.name}. Todos los derechos
            reservados.
          </span>
          <span className="flex items-center gap-1 text-[#8c8c8c]">
            <span>{footer.credit}</span>
            <Heart size={11} className="text-[#ff2d60] inline fill-current" />
          </span>
        </div>

        {/* Nombre gigante al cierre: siempre en una sola línea, a todo el ancho, con degradado negro abajo */}
        <div className="footer-name-wrap relative mt-12 sm:mt-16">
          <p
            aria-hidden="true"
            className="footer-name relative font-hero uppercase leading-[0.82] text-[#f2ede4] select-none"
          >
            {profile.name}
            {/* Degradado negro de abajo hacia arriba (capa encima, sin máscaras).
                Baja un poco más que la línea para cubrir el pie de las letras. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 -bottom-[0.12em] pointer-events-none bg-gradient-to-t from-[#090a0d] from-10% to-transparent"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
