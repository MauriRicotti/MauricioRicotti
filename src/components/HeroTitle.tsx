import type React from "react";
import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { loaderDelay } from "../lib/loader";

/**
 * Título gigante del hero ("FULL STACK / DEVELOPER") con efecto RODILLO: la primera parte (las palabras antes de la última) va cambiando letra
 *    por letra, como un tragamonedas: FULL STACK → FRONT END → BACK END.
 *    Las palabras salen de `profile.roleRoll` (content.ts). Cambia cada ROLL_EVERY ms.
 *    Se pausa si el título no está en pantalla o si la pestaña está oculta.
 *
 * Con "reducir movimiento" activado en el sistema, el título queda quieto.
 * Para los lectores de pantalla y Google, el h1 siempre dice el rol original.
 * Las letras las arma este componente a mano (fuera de React) para poder animarlas.
 */

const ROLL_EVERY = 2800; // ms entre cambios
const ROLL_START = 2600; // ms después de que termina la pantalla de carga (deja ver la entrada)

/** Arma las letras de una palabra (cada una en su span, para poder animarlas) */
function fillLetters(el: HTMLElement, word: string) {
  el.textContent = "";
  for (const c of word) {
    const hl = document.createElement("span");
    hl.className = "hl";
    hl.textContent = c;
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
    let visible = true;

    /* ---------------- Rodillo ---------------- */
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
          },
          Math.max(base + 150 + n * 40 + 600, base + 80 + 720),
        ),
      );
    };
    const tick = () => {
      if (document.hidden || !visible) return;
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

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <h1
      ref={h1Ref}
      className="hero-title font-hero font-black uppercase tracking-tight leading-[0.88] text-[#f2ede4] text-left"
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
