import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../lib/sound";
import { scrollToTop } from "../lib/smoothScroll";
import { useLang } from "../i18n";

/** Botón flotante (abajo a la derecha) que aparece al bajar y lleva al inicio.
 *  Se oculta al llegar al nombre gigante del footer. */
export default function ScrollTop() {
  const { ui } = useLang().c;
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
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => {
            sound.playPop(600);
            scrollToTop();
          }}
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.85 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={ui.backToTop}
          title={ui.backToTop}
          className="group fixed z-30 right-4 bottom-4 sm:right-8 sm:bottom-8 w-12 h-12 rounded-full bg-[#f2ede4] text-[#0e0f12] border border-[#0e0f12]/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)] flex items-center justify-center hover:bg-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
        >
          <ArrowUp
            size={20}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
