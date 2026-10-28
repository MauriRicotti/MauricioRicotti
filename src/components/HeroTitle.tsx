import type React from "react";
import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { loaderDelay } from "../lib/loader";

/**
 * Título gigante del hero ("FULL STACK / DEVELOPER") con dos efectos:
 *
 * 1) RODILLO: la primera parte (las palabras antes de la última) va cambiando letra
 *    por letra, como un tragamonedas: FULL STACK → FRONT END → BACK END.
 *    Las palabras salen de `profile.roleRoll` (content.ts). Cambia cada ROLL_EVERY ms.
 *    Se pausa si el título no está en pantalla, si la pestaña está oculta o mientras
 *    el mouse está encima del título (para que se pueda jugar con las letras).
 *
 * 2) LETRAS VIVAS: en PC, las letras cercanas al cursor se levantan y se tiñen de
 *    turquesa. En celular, al tocar el título las letras saltan en onda desde el dedo.
 *    No hay nada corriendo si nadie interactúa (solo se calcula al mover el mouse).
 *
 * Con "reducir movimiento" activado en el sistema, el título queda quieto.
 * Para los lectores de pantalla y Google, el h1 siempre dice el rol original.
 * Las letras las arma este componente a mano (fuera de React) para poder animarlas.
 */

const ROLL_EVERY = 2800; // ms entre cambios
const ROLL_START = 2600; // ms después de que termina la pantalla de carga (deja ver la entrada)
const LIVE_RADIUS = 1.3; // radio del efecto del cursor, en altos de letra
const TEAL = "#3cd3b7";
const CREAM = "#f2ede4";

/** Arma las letras de una palabra: .hl (se mide / rueda) > .hv (se levanta / colorea) */
function fillLetters(el: HTMLElement, word: string) {
  el.textContent = "";
  for (const c of word) {
    const hl = document.createElement("span");
    hl.className = "hl";
    const hv = document.createElement("span");
    hv.className = "hv";
    hv.textContent = c;
    hl.appendChild(hv);
    el.appendChild(hl);
  }
}

export default function HeroTitle({
  role,
  roll = [],
}: {
  role: string;
  roll?: string[];
}) {
  const words = role.trim().split(/\s+/);
  const last = words.pop() ?? "";
  // Frases del rodillo: solo las que tienen la misma cantidad de palabras (así no cambia
  // la cantidad de renglones en celular). La primera siempre es la del rol.
  const first = words.join(" ");
  const phrases = [
    first,
    ...roll.filter(
      (p) =>
        p.trim().split(/\s+/).length === words.length &&
        p.trim().toUpperCase() !== first.toUpperCase(),
    ),
  ].map((p) => p.trim().toUpperCase().split(/\s+/));

  const h1Ref = useRef<HTMLHeadingElement>(null);
  const slots = useRef<(HTMLSpanElement | null)[]>([]);
  const outRef = useRef<HTMLSpanElement>(null);
  const key = role + "|" + roll.join("|");

  // Letras iniciales (antes de pintar: sin parpadeo)
  useLayoutEffect(() => {
    slots.current.forEach((slot, i) => {
      if (!slot) return;
      slot.textContent = "";
      const layer = document.createElement("span");
      layer.className = "hero-roll-layer";
      fillLetters(layer, words[i] ?? "");
      slot.appendChild(layer);
    });
    if (outRef.current) fillLetters(outRef.current, last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const h1 = h1Ref.current;
    if (!h1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];
    let hovering = false;
    let visible = true;
    let dirty = true; // hay que volver a medir las letras

    /* ---------------- 1) Rodillo ---------------- */
    let k = 0;
    const swap = (slot: HTMLSpanElement, word: string, base: number) => {
      const old = slot.lastElementChild as HTMLElement | null;
      if (!old) return;
      // El ancho de la palabra cambia de a poco (si no, la palabra de al lado "salta")
      const oldW = slot.getBoundingClientRect().width;
      const nw = document.createElement("span");
      nw.className = "hero-roll-layer";
      fillLetters(nw, word);
      slot.appendChild(nw);
      slot.classList.add("is-rolling");
      // (el recorte suma un poquito de margen interno a los costados para no cortar las letras)
      const pad = 2 * parseFloat(getComputedStyle(slot).paddingLeft || "0");
      slot.style.width = `${oldW + pad}px`;
      const newW = nw.getBoundingClientRect().width + pad;
      const grow = slot.animate(
        [{ width: `${oldW + pad}px` }, { width: `${newW}px` }],
        {
          duration: 700,
          delay: base + 80,
          easing: "cubic-bezier(.65,0,.35,1)",
          fill: "forwards",
        },
      );
      Array.from(old.children).forEach((ch, i) => {
        (ch as HTMLElement).animate(
          [{ transform: "translateY(0)" }, { transform: "translateY(-1.2em)" }],
          {
            duration: 420,
            delay: base + i * 40,
            easing: "cubic-bezier(.6,0,.8,.3)",
            fill: "forwards",
          },
        );
      });
      const n = nw.children.length;
      Array.from(nw.children).forEach((ch, i) => {
        (ch as HTMLElement).animate(
          [{ transform: "translateY(1.2em)" }, { transform: "translateY(0)" }],
          {
            duration: 560,
            delay: base + 150 + i * 40,
            easing: "cubic-bezier(.2,.85,.25,1)",
            fill: "backwards",
          },
        );
      });
      timers.push(
        window.setTimeout(
          () => {
            old.remove();
            grow.cancel();
            slot.style.width = "";
            slot.classList.remove("is-rolling");
            dirty = true;
          },
          Math.max(base + 150 + n * 40 + 600, base + 80 + 720),
        ),
      );
    };
    const tick = () => {
      if (document.hidden || !visible || hovering) return;
      k = (k + 1) % phrases.length;
      slots.current.forEach((slot, i) => {
        if (slot) swap(slot, phrases[k][i], i * 140);
      });
    };
    if (phrases.length > 1) {
      let interval = 0;
      timers.push(
        window.setTimeout(() => {
          tick();
          interval = window.setInterval(tick, ROLL_EVERY);
          timers.push(interval);
        }, loaderDelay() + ROLL_START),
      );
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(h1);

    /* ---------------- 2) Letras vivas ---------------- */
    let letters: HTMLElement[] = [];
    let rects: [number, number, number][] = [];
    let mx = -1e5;
    let my = -1e5;
    let raf = 0;
    const measure = () => {
      letters = Array.from(h1.querySelectorAll<HTMLElement>(".hl")).filter(
        (l) => !l.closest(".hero-roll-layer:not(:last-child)"),
      );
      rects = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return [
          r.left + r.width / 2 + window.scrollX,
          r.top + r.height / 2 + window.scrollY,
          r.height,
        ];
      });
      dirty = false;
    };
    const paint = () => {
      raf = 0;
      if (dirty) measure();
      letters.forEach((l, i) => {
        const hv = l.firstElementChild as HTMLElement | null;
        if (!hv) return;
        const [cx, cy, h] = rects[i];
        const f = Math.max(0, 1 - Math.hypot(mx - cx, my - cy) / (h * LIVE_RADIUS));
        const outline = !!l.closest(".hero-outline");
        if (f > 0.03) {
          hv.style.transform = `translateY(${(-f * 0.12).toFixed(3)}em) scale(${(1 + f * 0.06).toFixed(3)})`;
          if (outline) {
            hv.style.color = `rgba(60,211,183,${f.toFixed(2)})`;
            hv.style.webkitTextStrokeColor = TEAL;
          } else {
            hv.style.color = `color-mix(in srgb, ${TEAL} ${Math.round(f * 100)}%, ${CREAM})`;
          }
        } else if (hv.style.transform) {
          hv.style.transform = "";
          hv.style.color = "";
          hv.style.webkitTextStrokeColor = "";
        }
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hovering = true;
      dirty = true;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mx = e.pageX;
      my = e.pageY;
      schedule();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hovering = false;
      mx = my = -1e5;
      schedule();
    };
    // Celular: onda de saltos desde donde se tocó
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      measure();
      letters.forEach((l, i) => {
        const hv = l.firstElementChild as HTMLElement | null;
        if (!hv) return;
        const d = Math.hypot(e.pageX - rects[i][0], e.pageY - rects[i][1]);
        hv.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-0.16em)", color: TEAL, offset: 0.35 },
            { transform: "translateY(0)" },
          ],
          { duration: 560, delay: d * 0.9, easing: "cubic-bezier(.3,.7,.4,1)" },
        );
      });
    };
    const onResize = () => {
      dirty = true;
    };
    h1.addEventListener("pointerenter", onEnter);
    h1.addEventListener("pointermove", onMove, { passive: true });
    h1.addEventListener("pointerleave", onLeave);
    h1.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      cancelAnimationFrame(raf);
      io.disconnect();
      h1.removeEventListener("pointerenter", onEnter);
      h1.removeEventListener("pointermove", onMove);
      h1.removeEventListener("pointerleave", onLeave);
      h1.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <h1
      ref={h1Ref}
      className="hero-title hero-live font-hero font-black uppercase tracking-tight leading-[0.88] text-[#f2ede4] text-left"
    >
      {/* Texto real (lectores de pantalla y Google) */}
      <span className="sr-only">{role}</span>
      {/* Versión visual animada. Celular: una palabra por línea. Escritorio: "FULL STACK"
          arriba a la izquierda y "DEVELOPER" abajo a la derecha, solo con contorno. */}
      <span aria-hidden="true" key={key}>
        <span className="sm:whitespace-nowrap">
          {words.map((_, i) => (
            <Fragment key={i}>
              <span
                data-intro="up"
                style={{ "--d": `${i * 0.09}s` } as React.CSSProperties}
                className="block sm:inline-block"
              >
                <span
                  className="hero-roll"
                  ref={(el) => {
                    slots.current[i] = el;
                  }}
                />
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>{" "}
        <span
          ref={outRef}
          data-intro="draw"
          style={{ "--d": "0.28s" } as React.CSSProperties}
          className="hero-outline block lg:text-right"
        />
      </span>
    </h1>
  );
}
