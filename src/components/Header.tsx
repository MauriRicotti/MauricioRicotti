import LogoMark from "./LogoMark";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Download, Volume2, VolumeX } from "lucide-react";
import { sound } from "../lib/sound";
import { scrollToTop } from "../lib/smoothScroll";
import { useLang, type Lang } from "../i18n";

interface HeaderProps {
  name: string;
  onOpenContact: () => void;
  onNavigate: (id: string) => void;
}

export default function Header({
  name,
  onOpenContact,
  onNavigate,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const soundOn = useSyncExternalStore(
    sound.subscribe,
    sound.getSnapshot,
    sound.getServerSnapshot,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, c } = useLang();
  const { navLinks, ui, profile } = c;
  const changeLang = (l: Lang) => {
    if (l === lang) return;
    sound.playPop(620);
    setLang(l);
    // Si se cambió desde el menú del celular, se cierra detrás de la cortina
    if (menuOpen) setTimeout(() => setMenuOpen(false), 380);
  };

  // Scroll (como mucho una vez por cuadro): estado del header, barra de progreso de la
  // página (solo transform, no provoca re-render) y sección activa del menú.
  const sectionIds = navLinks.map((l) => l.id).filter((id) => id !== "contact");
  const idsKey = sectionIds.join("|");
  useEffect(() => {
    const ids = idsKey.split("|");
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${p})`;
      // Sección activa: la que cruza una línea imaginaria al 45% de la pantalla
      const line = vh * 0.45;
      let current: string | null = null;
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top <= line && r.bottom > line) {
          current = id;
          break;
        }
      }
      setActive(current);
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
  }, [idsKey]);

  // Con el menú abierto: se cierra con Escape.
  // (No se bloquea el scroll del body: en celulares eso hace "saltar" la página al cerrar.
  //  En su lugar, el fondo y el panel usan touch-action: none para que no se pueda arrastrar.)
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Si se agranda la pantalla a escritorio, cierra el menú
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleSound = () => {
    const next = !sound.enabled;
    sound.enabled = next;
    if (next) sound.playPop(600);
  };

  const handleNav = (id: string) => {
    sound.playClick();
    setMenuOpen(false);
    if (id === "contact") onOpenContact();
    else onNavigate(id);
  };

  const toggleMenu = () => {
    sound.playClick();
    setMenuOpen((o) => !o);
  };

  const solid = scrolled || menuOpen;

  return (
    <>
      {/* Barra de progreso de lectura, arriba de todo */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[55] h-[3px] pointer-events-none"
      >
        <div
          ref={progressRef}
          className="h-full w-full bg-accent origin-left will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <header
        data-intro="down"
        style={{ "--d": "0.5s" } as React.CSSProperties}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,border-color] duration-300 border-b ${
          scrolled ? "py-3.5" : "py-5 sm:py-7"
        } ${solid ? "bg-[#0e0f12] border-white/[0.08]" : "bg-transparent border-transparent"}`}
      >
        {/* En PC (desde 1280 px): tres columnas, las de los costados iguales, así los links quedan centrados de verdad respecto de la pantalla. En pantallas más angostas no entra: van entre el logo y los botones. */}
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
          {/* Logo: solo el sticker "MR" (en PC y en celular). El nombre queda para lectores de pantalla. */}
          <button
            onClick={() => {
              sound.playClick();
              setMenuOpen(false);
              scrollToTop();
            }}
            title={ui.goHome}
            className="group justify-self-start flex items-center focus:outline-none cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <LogoMark className="h-10 md:h-11 w-auto text-[#f2ede4] group-hover:text-accent group-focus-visible:text-accent transition-[color,transform] duration-200 group-active:scale-95" />
            <span className="sr-only">
              {name}, {ui.goHome.toLowerCase()}
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-5 lg:gap-8">
            {navLinks.map((link) => {
              const on = link.id === active;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    handleNav(link.id);
                  }}
                  aria-current={on ? "true" : undefined}
                  className={`group/link relative py-1.5 text-sm font-medium whitespace-nowrap cursor-pointer rounded-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    on ? "text-white" : "text-white/65 hover:text-white"
                  }`}
                >
                  {link.label}
                  {/* subrayado: crece desde el centro; en la sección activa queda fijo y turquesa */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full origin-center transition-[transform,background-color] duration-300 ease-out ${
                      on
                        ? "scale-x-100 bg-accent"
                        : "scale-x-0 bg-white group-hover/link:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="justify-self-end flex items-center gap-3 sm:gap-4">
            {/* Idioma en escritorio: selector ES | EN (en celular está dentro del menú) */}
            <div
              role="group"
              aria-label={ui.language}
              className="hidden md:flex items-center h-9 p-1 rounded-full border border-white/20 font-mono text-[11px]"
            >
              {(["es", "en"] as const).map((l) => (
                <a
                  key={l}
                  href={l === "en" ? "/en" : "/"}
                  hrefLang={l}
                  lang={l}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    changeLang(l);
                  }}
                  aria-current={lang === l ? "page" : undefined}
                  className={`inline-flex items-center justify-center h-full px-2.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    lang === l
                      ? "bg-[#f2ede4] text-[#0e0f12] font-semibold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {l}
                </a>
              ))}
            </div>

            {/* Sonido: en escritorio en la barra, en celular dentro del menú */}
            <button
              onClick={toggleSound}
              aria-label={ui.soundToggle}
              aria-pressed={soundOn}
              title={soundOn ? ui.soundOn : ui.soundOff}
              className="hidden md:flex relative w-9 h-9 rounded-full border border-white/20 text-white/75 hover:text-white hover:border-white/40 items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent before:content-[''] before:absolute before:-inset-1"
            >
              {soundOn ? (
                <Volume2 size={14} />
              ) : (
                <VolumeX size={14} className="opacity-50" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playPop(650);
                onOpenContact();
              }}
              className="group hidden md:flex items-center gap-3 h-10 pl-5 pr-1 rounded-full bg-[#f2ede4] text-[#0e0f12] text-sm font-semibold hover:bg-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
            >
              <span>{ui.talk}</span>
              <span className="w-8 h-8 rounded-full bg-[#0e0f12] text-[#f2ede4] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </button>

            {/* Botón hamburguesa: las dos líneas se cruzan y forman una X (mínimo 44x44px táctil WCAG) */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? ui.closeMenu : ui.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`md:hidden relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12] ${
                menuOpen
                  ? "bg-white/10 border border-white/25 text-white"
                  : "bg-white/[0.06] border border-white/15 text-white"
              }`}
            >
              <span
                className={`absolute h-[2px] w-[18px] rounded-full bg-white transition-[transform,background-color] duration-300 ${
                  menuOpen
                    ? "rotate-45"
                    : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-[2px] w-[18px] rounded-full bg-white transition-[transform,background-color] duration-300 ${
                  menuOpen
                    ? "-rotate-45"
                    : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Menú móvil ===== */}
      <div className="md:hidden">
        {/* Fondo oscuro sin blur: cero lag en GPU */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/75 touch-none transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        <div
          id="mobile-menu"
          inert={!menuOpen}
          className={`fixed left-0 right-0 ${scrolled ? "top-[70px]" : "top-[82px]"} z-40 mx-3 rounded-[24px] touch-none bg-[#121318] text-[#f2ede4] border border-white/[0.12] shadow-2xl origin-top will-change-transform transition-[transform,opacity] duration-200 ease-out overflow-hidden ${
            menuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
                <nav className="px-5 pt-3 pb-2 divide-y divide-white/[0.06]">
                  {navLinks.map((link, i) => (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        handleNav(link.id);
                      }}
                      aria-current={link.id === active ? "true" : undefined}
                      className="w-full flex items-center gap-3.5 py-3 text-left cursor-pointer group active:opacity-75 transition-opacity"
                    >
                      <span
                        className={`relative font-mono text-xs ${
                          link.id === active
                            ? "text-accent font-semibold"
                            : "text-neutral-500"
                        }`}
                      >
                        {link.id === active && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent"
                          />
                        )}
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-hero text-3xl sm:text-4xl uppercase tracking-[-0.02em] leading-none text-[#f2ede4] group-active:text-accent transition-colors">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="ml-auto text-neutral-500 group-active:text-accent transition-colors"
                      />
                    </a>
                  ))}
                </nav>

                <div className="px-5 py-3.5 border-t border-white/[0.08] bg-[#0f1014] flex items-center justify-between gap-3">
                  {/* Interruptor de sonido (área táctil accesible de 44px) */}
                  <button
                    onClick={toggleSound}
                    role="switch"
                    aria-label={ui.soundToggle}
                    aria-checked={soundOn}
                    className="flex items-center gap-2.5 min-h-[44px] cursor-pointer active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                  >
                    <span
                      className={`relative w-11 h-6 rounded-full border border-white/20 transition-colors duration-200 ${
                        soundOn ? "bg-accent border-accent" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-[#0e0f12] transition-transform duration-200 ${
                          soundOn ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-300">
                      {soundOn ? <Volume2 size={14} className="text-accent" /> : <VolumeX size={14} className="text-neutral-500" />}
                      {soundOn ? ui.soundShort : ui.muteShort}
                    </span>
                  </button>

                  {/* Idioma */}
                  <div
                    role="group"
                    aria-label={ui.language}
                    className="flex items-center h-9 p-1 rounded-full border border-white/20 font-mono text-xs"
                  >
                    {(["es", "en"] as const).map((l) => (
                      <a
                        key={l}
                        href={l === "en" ? "/en" : "/"}
                        hrefLang={l}
                        lang={l}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                          e.preventDefault();
                          changeLang(l);
                        }}
                        aria-current={lang === l ? "page" : undefined}
                        className={`inline-flex items-center justify-center h-full min-w-[38px] px-3 rounded-full uppercase tracking-wider text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          lang === l
                            ? "bg-[#f2ede4] text-[#0e0f12] font-semibold"
                            : "text-white/60 active:bg-white/10"
                        }`}
                      >
                        {l}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="px-5 pt-2 pb-5 border-t border-white/[0.06] bg-[#0f1014] flex items-center gap-3">
                  {profile.cvUrl && (
                    <a
                      href={profile.cvUrl}
                      download
                      onClick={() => {
                        sound.playClick();
                        setMenuOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/20 bg-white/[0.04] text-xs font-semibold text-[#f2ede4] active:scale-[0.97] hover:border-white/40 transition-all select-none"
                    >
                      <Download size={14} /> {ui.downloadCv}
                    </a>
                  )}
                  <button
                    onClick={() => {
                      sound.playPop(650);
                      setMenuOpen(false);
                      onOpenContact();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap bg-[#f2ede4] text-[#0e0f12] text-xs font-bold uppercase tracking-wider hover:bg-accent active:scale-[0.97] transition-all select-none cursor-pointer"
                  >
                    <span>{ui.talk}</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
    </>
  );
}
