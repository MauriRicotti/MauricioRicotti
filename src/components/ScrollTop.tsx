import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { sound } from "../lib/sound";
import { scrollToTop } from "../lib/smoothScroll";

/** Botón flotante (abajo a la derecha) que aparece al bajar y lleva al inicio.
 *  Se oculta al llegar al nombre gigante del footer. */
export default function ScrollTop() {
  const [scrolled, setScrolled] = useState(false);
  const [atFooterName, setAtFooterName] = useState(false);
  const visible = scrolled && !atFooterName;

  useEffect(() => {
    // Solo actualiza el estado cuando cruza el umbral (no en cada scroll)
    let shown = false;
    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.8;
      if (next !== shown) {
        shown = next;
        setScrolled(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Se oculta cuando aparece el nombre gigante del footer (para no taparlo)
    const name = document.querySelector(".footer-name");
    const io = name
      ? new IntersectionObserver(([e]) => setAtFooterName(e.isIntersecting))
      : null;
    if (name && io) io.observe(name);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        sound.playPop(600);
        scrollToTop();
      }}
      aria-label="Volver arriba"
      title="Volver arriba"
      tabIndex={visible ? 0 : -1}
      className={`group fixed z-30 right-4 bottom-4 sm:right-8 sm:bottom-8 w-12 h-12 rounded-full bg-[#f2ede4] text-[#0e0f12] border border-[#0e0f12]/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)] flex items-center justify-center hover:bg-[#3cd3b7] transition-[opacity,transform,background-color] duration-300 cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp
        size={20}
        className="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
