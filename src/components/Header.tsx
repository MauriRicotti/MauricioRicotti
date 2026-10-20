import { useEffect, useState } from "react";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { sound } from "../lib/sound";
import { scrollToTop } from "../lib/smoothScroll";
import { navLinks } from "../data/content";

interface HeaderProps {
  name: string;
  onOpenContact: () => void;
  onNavigate: (id: string) => void;
}

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(14,15,18,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,15,18,0.07) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

export default function Header({
  name,
  onOpenContact,
  onNavigate,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    const next = !soundOn;
    setSoundOn(next);
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,border-color] duration-300 border-b ${
          scrolled ? "py-3.5" : "py-5 sm:py-7"
        } ${solid ? "bg-[#0e0f12]/95 border-white/10" : "bg-transparent border-transparent"}`}
      >
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo: monograma "MR" en la tipografía del título + nombre.
              En celular no se muestra el monograma: el nombre queda alineado a la izquierda. */}
          <button
            onClick={() => {
              sound.playClick();
              setMenuOpen(false);
              scrollToTop();
            }}
            title="Ir al inicio"
            className="group flex items-center gap-3 whitespace-nowrap focus:outline-none cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="hidden md:inline font-hero uppercase leading-none text-[2rem] tracking-[-0.01em] text-[#f2ede4] group-hover:text-[#3cd3b7] group-focus-visible:text-[#3cd3b7] transition-colors duration-200"
            >
              MR
            </span>
            <span
              aria-hidden="true"
              className="hidden md:block w-px h-6 bg-white/20"
            />
            <span className="font-hero uppercase leading-none tracking-[0.02em] text-[1.4rem] sm:text-2xl md:text-xl text-[#f2ede4] md:text-white/80 group-hover:text-white md:group-hover:text-white transition-colors duration-200">
              {name}
            </span>
            <span className="sr-only">, ir al inicio</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-150 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="justify-self-end flex items-center gap-3 sm:gap-4">
            {/* Sonido: en escritorio en la barra, en celular dentro del menú */}
            <button
              onClick={toggleSound}
              aria-label="Activar o silenciar sonidos"
              title={soundOn ? "Sonido activado" : "Sonido silenciado"}
              className="hidden md:flex w-8 h-8 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 items-center justify-center transition-colors"
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
              className="group hidden md:flex items-center gap-3 h-10 pl-5 pr-1 rounded-full bg-[#f2ede4] text-[#0e0f12] text-sm font-semibold hover:bg-[#3cd3b7] transition-colors duration-200 cursor-pointer"
            >
              <span>Hablemos</span>
              <span className="w-8 h-8 rounded-full bg-[#0e0f12] text-[#f2ede4] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </button>

            {/* Botón hamburguesa: las dos líneas se cruzan y forman una X */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`md:hidden relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                menuOpen
                  ? "bg-[#eee9df]"
                  : "bg-white/[0.06] border border-white/15"
              }`}
            >
              <span
                className={`absolute h-[2px] w-[18px] rounded-full transition-[transform,background-color] duration-300 ${
                  menuOpen
                    ? "rotate-45 bg-[#0e0f12]"
                    : "-translate-y-[4px] bg-white"
                }`}
              />
              <span
                className={`absolute h-[2px] w-[18px] rounded-full transition-[transform,background-color] duration-300 ${
                  menuOpen
                    ? "-rotate-45 bg-[#0e0f12]"
                    : "translate-y-[4px] bg-white"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Menú móvil ===== */}
      <div className="md:hidden">
        {/* Fondo oscuro: al tocarlo se cierra */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/60 touch-none transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        <div
          id="mobile-menu"
          inert={!menuOpen}
          className={`fixed left-0 right-0 ${scrolled ? "top-[68px]" : "top-[80px]"} z-40 mx-2 rounded-[28px] touch-none bg-[#eee9df] text-[#0e0f12] shadow-2xl origin-top transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.65,0,0.25,1)] ${
            menuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
          style={GRID_BG}
        >
          <nav className="px-6 pt-4">
            {navLinks.map((link, i) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="w-full flex items-center gap-4 py-4 border-b border-[#0e0f12]/15 text-left cursor-pointer group"
              >
                <span className="font-mono text-xs text-[#0e0f12]/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-hero text-5xl uppercase tracking-tight leading-none">
                  {link.label}
                </span>
                <ArrowUpRight
                  size={22}
                  className="ml-auto text-[#0e0f12]/40 group-active:text-[#0e0f12] transition-colors"
                />
              </button>
            ))}
          </nav>

          <div className="px-6 pt-5 pb-6 flex items-center justify-between gap-3">
            {/* Interruptor de sonido */}
            <button
              onClick={toggleSound}
              role="switch"
              aria-checked={soundOn}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span
                className={`relative w-12 h-7 rounded-full border-2 border-[#0e0f12] transition-colors duration-200 ${
                  soundOn ? "bg-[#3cd3b7]" : "bg-white"
                }`}
              >
                <span
                  className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-[#0e0f12] transition-transform duration-200 ${
                    soundOn ? "translate-x-5" : ""
                  }`}
                />
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                {soundOn ? "Sonido" : "Silencio"}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playPop(650);
                setMenuOpen(false);
                onOpenContact();
              }}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-[#0e0f12] text-[#f2ede4] text-sm font-semibold shadow-[3px_3px_0_#3cd3b7]"
            >
              Hablemos <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
