import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { loaderDelay } from "../lib/loader";
import type { BadgeArt, BadgeDesign, BadgeTexts } from "../lib/badgeArt";

/**
 * Credencial 3D colgante del hero (Lanyard de React Bits).
 *
 * - La librería 3D baja en paralelo. Se prepara oculta durante la entrada y la
 *   caída arranca después del título, con texturas y shaders ya listos.
 * - Cuelga sobre el lado derecho del título, desde arriba de la pantalla. Su lienzo
 *   cubre TODO el hero (así, al estirarla, solo se corta en el borde de la pantalla)
 *   y va por delante de todo, pero deja pasar los clics: solo atrapa el puntero
 *   cuando está justo sobre la tarjeta (botones, textos y scroll funcionan normal).
 * - Se pausa sola fuera de pantalla y con la pestaña oculta.
 * - Si el navegador no tiene WebGL, simplemente no aparece.
 *
 * Para quitarla: borrá <HeroBadge /> en Hero.tsx (y los archivos Lanyard.tsx,
 * HeroBadge.tsx y lib/badgeArt.ts; y "three" de package.json).
 */

const Lanyard = lazy(() => import("./Lanyard"));
const loadArt = () => import("../lib/badgeArt");

/** Alto de la tarjeta, en proporción al alto del título */
const CARD = { desktop: 0.78, mobile: 0.48 };

/** Ajustes de la tarjeta (los podés cambiar a gusto) */
const SETTINGS = {
  design: "foto" as BadgeDesign, // "foto" (tu retrato) | "credencial" (solo tipografía)
  finish: "glossy" as const, // "glossy" | "matte" | "holographic" | "metallic"
  metal: "silver" as const, // "graphite" | "silver" | "gold"
  gravity: 2,
  damping: 0.5,
  elasticity: 0.5,
  breeze: 0.5, // viento suave (0 = quieta cuando nadie la toca)
  strapWidth: 0.65,
  cornerRadius: 0.3,
};

export default function HeroBadge({ texts }: { texts: BadgeTexts }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [art, setArt] = useState<BadgeArt | null>(null);
  const revealAt = useRef(0);
  const [box, setBox] = useState({
    ready: false,
    size: 0.3,
    x: 0.75,
    top: 0.15,
  });

  // Si el navegador pierde el contexto gráfico (pasa en celulares al ir a otra app, por
  // ejemplo a WhatsApp o al mail, o con poca memoria), al volver la tarjeta podía quedar
  // negra. Solución: cuando el contexto se recupera (o sigue perdido al volver a la
  // pestaña) se vuelve a crear la tarjeta desde cero.
  const [gen, setGen] = useState(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const rebuild = () => setGen((g) => g + 1);
    let timer = 0;
    const onVisible = () => {
      if (document.hidden) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const canvas = el.querySelector("canvas");
        const gl = canvas?.getContext("webgl2") as WebGL2RenderingContext | null;
        if (gl?.isContextLost()) rebuild();
      }, 1500);
    };
    // los eventos de contexto no burbujean: se escuchan en fase de captura
    el.addEventListener("webglcontextrestored", rebuild, true);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener("webglcontextrestored", rebuild, true);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Prepara el WebGL durante el loader, pero NO inicia la física hasta esta hora.
  // Así no compila shaders ni sube texturas cuando la tarjeta ya está cayendo.
  useEffect(() => {
    revealAt.current = performance.now() + 1300 + loaderDelay();
    void import("./Lanyard");
  }, []);

  // Dibuja el arte (y lo vuelve a dibujar si cambia el idioma)
  const key = JSON.stringify(texts);
  useEffect(() => {
    let alive = true;
    loadArt()
      .then((m) => m.drawBadgeArt(texts, SETTINGS.design))
      .then((a) => alive && setArt(a));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Posición y tamaño en píxeles, calculados a partir del título y del ancho de la página
  useEffect(() => {
    const el = boxRef.current;
    const section = el?.parentElement;
    const title = section?.querySelector(".hero-wrap");
    if (!el || !section || !title) return;
    const mobileMq = window.matchMedia("(max-width: 767px)");
    const desktopMq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const w = section.clientWidth;
      const h = section.offsetHeight;
      const titleH =
        title.getBoundingClientRect().bottom -
        section.getBoundingClientRect().top;
      if (w <= 0 || h <= 0 || titleH <= 0) return;
      const mobile = mobileMq.matches;
      // Centro horizontal del enganche
      let cx: number;
      if (desktopMq.matches) {
        const contentRight = Math.min(w, (w + 1408) / 2); // max-w-[88rem]
        cx = contentRight - 0.4 * Math.min(0.6 * w, 820);
      } else cx = w * (mobile ? 0.72 : 0.77);
      // Alto de la tarjeta y distancia de su borde superior al techo
      const cardPx = titleH * (mobile ? CARD.mobile : CARD.desktop);
      // En celular: bien a la derecha, pero con margen para que al balancearse
      // con el viento no toque el borde de la pantalla
      if (mobile) cx = Math.min(cx, w - cardPx * 0.36 - 34);
      const topPx = titleH * (mobile ? 0.25 : 0.19);
      setBox({
        ready: true,
        size: Math.min(0.9, cardPx / h),
        x: cx / w,
        top: topPx / h,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(title);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="absolute inset-0 z-10 pointer-events-none"
      // en línea también: si el CSS no carga, la tarjeta no tapa la página
      style={{ position: "absolute", inset: 0 }}
    >
      {art && box.ready && (
        <Suspense fallback={null}>
          <Lanyard
            key={gen}
            className="w-full h-full"
            frontImage={art.front}
            backImage={art.back}
            strapImage={art.strap}
            imageFit="cover"
            orientation="portrait"
            anchorX={box.x}
            cardTop={box.top}
            size={box.size}
            passThrough
            intro={gen === 0}
            revealAt={gen === 0 ? revealAt.current : 0}
            interactive
            finish={SETTINGS.finish}
            metal={SETTINGS.metal}
            gravity={SETTINGS.gravity}
            damping={SETTINGS.damping}
            elasticity={SETTINGS.elasticity}
            breeze={SETTINGS.breeze}
            strapWidth={SETTINGS.strapWidth}
            cornerRadius={SETTINGS.cornerRadius}
          />
        </Suspense>
      )}
    </div>
  );
}
