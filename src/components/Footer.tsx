import { useEffect, useState } from "react";
import { Download, Heart, Mail, MapPin } from "lucide-react";
import { siGithub, siInstagram, siWhatsapp } from "simple-icons";
import { scrollToId } from "../lib/smoothScroll";
import type { Profile } from "../types";
import { sound } from "../lib/sound";
import { fill, useLang } from "../i18n";

interface FooterProps {
  profile: Profile;
  onOpenContact: () => void;
}

export default function Footer({ profile, onOpenContact }: FooterProps) {
  const { footer, ui, navLinks } = useLang().c;
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
      className="relative bg-[#090a0d] text-white pt-20 sm:pt-28 pb-20 sm:pb-5 border-t border-white/10 overflow-hidden"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="font-hero text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight text-[#f2ede4] leading-none">
              {footer.title}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                aria-label={ui.sendEmail}
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
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  download
                  onClick={() => sound.playClick()}
                  className="group inline-flex items-center gap-3 h-12 pl-1.5 pr-6 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/35 text-sm font-semibold text-neutral-200 hover:text-white transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-[#3cd3b7] text-[#0e0f12] flex items-center justify-center group-hover:bg-[#f2ede4] transition-colors">
                    <Download size={16} />
                  </span>
                  <span>{ui.downloadCv}</span>
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

        {/* Tarjeta de cierre: texto, enlaces, redes y horario, con el nombre gigante cortado abajo */}
        <div className="relative mt-14 sm:mt-20 rounded-[26px] sm:rounded-[36px] lg:rounded-[44px] bg-[#15171c] border border-white/[0.06] overflow-hidden">
          <div className="px-5 sm:px-10 lg:px-12 pt-8 sm:pt-12 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-9 text-sm">
            <div className="col-span-2 lg:col-span-4">
              <p className="text-lg sm:text-xl lg:text-[1.35rem] font-semibold text-[#f2ede4] leading-snug max-w-sm text-balance">
                {footer.tagline}
              </p>
              <p className="mt-4 flex items-start gap-2 text-neutral-400">
                <MapPin size={15} className="text-[#3cd3b7] mt-0.5 shrink-0" />
                {profile.location}
              </p>
            </div>

            <nav aria-label={footer.explore} className="lg:col-span-2">
              <p className="text-neutral-200 font-medium mb-3">{footer.explore}</p>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (link.id === "contact") onOpenContact();
                        else scrollToId(link.id);
                      }}
                      className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {profile.socials.length > 0 && (
              <div className="lg:col-span-3">
                <p className="text-neutral-200 font-medium mb-3">{footer.follow}</p>
                <ul className="flex flex-wrap gap-2">
                  {profile.socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.url}
                        {...(s.url.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        onClick={() => sound.playClick()}
                        className="inline-flex items-center gap-2 h-8 pl-2.5 pr-3 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/20 text-xs text-neutral-300 hover:text-white transition-colors"
                      >
                        <SocialIcon label={s.label} />
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="col-span-2 lg:col-span-3">
              <p className="text-neutral-200 font-medium mb-3">{ui.hours}</p>
              {profile.hours && (
                <ul className="space-y-1.5 max-w-xs">
                  {profile.hours.map((h) => (
                    <li key={h.label} className="flex justify-between gap-4">
                      <span className="text-neutral-500">{h.label}</span>
                      <span className="font-mono text-xs text-neutral-300 pt-0.5">
                        {h.from && h.to ? `${h.from} – ${h.to}` : ui.closed}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs text-neutral-300">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${openNow ? "bg-emerald-400" : "bg-neutral-500"}`}
                />
                {openNow ? ui.openNow : ui.closedNow}
              </p>
              <p className="mt-1 pl-4 font-mono text-[11px] text-neutral-500">
                {fill(ui.localTime, { time })}
              </p>
            </div>
          </div>

          {/* Nombre gigante: una línea, color sólido, cortado por el borde de abajo */}
          <div className="footer-name-wrap relative mt-12 sm:mt-16 lg:mt-20 px-3 sm:px-6 lg:px-8">
            <p
              aria-hidden="true"
              className="footer-name footer-name--cut relative font-hero uppercase leading-[0.82] text-[#f2ede4] select-none"
            >
              {profile.name}
            </p>
          </div>
        </div>

        {/* Barra final */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 px-1 sm:px-4 text-[11px] text-neutral-500 font-mono text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {profile.name}. {ui.rights}
          </span>
          <span className="flex items-center gap-1">
            <span>{footer.credit}</span>
            <Heart size={11} className="text-[#ff2d60] inline fill-current" />
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Ícono chico para cada red (según su nombre) */
function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes("mail")) return <Mail size={13} aria-hidden="true" />;
  const icon = key.includes("github")
    ? siGithub
    : key.includes("instagram")
      ? siInstagram
      : key.includes("whatsapp")
        ? siWhatsapp
        : null;
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
