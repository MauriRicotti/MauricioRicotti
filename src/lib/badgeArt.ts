/**
 * Arte de la credencial 3D del hero (frente, dorso y cinta).
 *
 * Se dibuja en el navegador con <canvas> usando las mismas tipografías de la web
 * (Anton y Plus Jakarta Sans): si cambiás tu nombre o tu rol en content.ts, la
 * tarjeta se actualiza sola. El retrato del diseño "foto" está en
 * src/assets/badge-portrait.webp (fondo transparente).
 *
 * Medidas: la tarjeta es vertical (1024 × 1440). Arriba al centro va la ranura
 * del broche, por eso esa zona queda libre.
 */

import portraitUrl from "../assets/badge-portrait.webp";
import { MR_FG, MR_SIL, MR_VIEWBOX } from "./logoMR";

/** "foto": tu retrato recortado sobre la credencial · "credencial": solo tipografía */
export type BadgeDesign = "foto" | "credencial";

export interface BadgeArt {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  strap: HTMLCanvasElement;
}

export interface BadgeTexts {
  name: string; // "Mauricio Ricotti"
  role: string; // "FULL STACK DEVELOPER"
  cta: string; // "HABLEMOS" / "LET'S TALK"
  year: string; // "2026"
}

// Frente y dorso conservan su detalle original también en teléfonos.
const W = 1024;
const H = 1440;

const INK = "#0e0f12";
const CREAM = "#eee9df";
const LIGHT = "#f2ede4";
/** Color de acento: se toma de la web (--color-accent en index.css) al dibujar. */
let TEAL = "#3cd3b7";
const readAccent = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim() || TEAL;

const ANTON = '"Anton", Impact, sans-serif';
const SANS =
  '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d", { alpha: false }) as Ctx;
  return { c, ctx };
}

/** Logo MR (el de la barra) con su silueta y su borde+letras en los colores indicados.
 *  (x, y) = esquina superior izquierda; w = ancho (el alto sale de la proporción). */
const MR_BOX = MR_VIEWBOX.split(" ").map(Number);
let mrPaths: { sil: Path2D; fg: Path2D } | null = null;
function logoMR(ctx: Ctx, x: number, y: number, w: number, sil: string, fg: string) {
  mrPaths ??= { sil: new Path2D(MR_SIL), fg: new Path2D(MR_FG) };
  const [vx, vy, vw] = MR_BOX;
  const k = w / vw;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-vx, -vy);
  ctx.fillStyle = sil;
  ctx.fill(mrPaths.sil, "evenodd");
  ctx.fillStyle = fg;
  ctx.fill(mrPaths.fg, "evenodd");
  ctx.restore();
}
const mrHeight = (w: number) => (w * MR_BOX[3]) / MR_BOX[2];

function grid(ctx: Ctx, w: number, h: number, color: string, step = 64) {
  ctx.fillStyle = color;
  for (let x = step; x < w; x += step) ctx.fillRect(x, 0, 2, h);
  for (let y = step; y < h; y += step) ctx.fillRect(0, y, w, 2);
}

function text(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  font: string,
  color: string,
  opts: { align?: CanvasTextAlign; spacing?: number } = {},
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = `${opts.spacing ?? 0}px`;
  ctx.fillText(value, x, y);
  ctx.letterSpacing = "0px";
}

/** Achica la fuente hasta que el texto entre en `max` píxeles de ancho. */
function fit(
  ctx: Ctx,
  value: string,
  family: string,
  size: number,
  max: number,
  weight = "",
) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(value).width > max && s > 10) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/** Código de barras decorativo (siempre igual, no aleatorio). */
function barcode(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const pattern = [
    3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2,
  ];
  const total = pattern.reduce((a, b) => a + b, 0) * 2;
  const unit = w / total;
  let cx = x;
  ctx.fillStyle = color;
  pattern.forEach((p, i) => {
    const bw = p * unit;
    if (i % 2 === 0) ctx.fillRect(cx, y, bw, h);
    cx += bw + unit;
  });
}

function drawFront(t: BadgeTexts) {
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  grid(ctx, W, H, "rgba(14,15,18,0.07)");

  const M = 72; // margen
  // Fila superior (a los costados de la ranura del broche)
  text(ctx, "PORTFOLIO", M, 112, `600 30px ${MONO}`, "rgba(14,15,18,0.6)", {
    spacing: 6,
  });
  text(ctx, t.year, W - M, 112, `600 30px ${MONO}`, "rgba(14,15,18,0.6)", {
    align: "right",
    spacing: 6,
  });

  // Logo MR
  logoMR(ctx, M - 6, 190, 540, INK, CREAM);

  // Nombre (una palabra por línea, achicando si hace falta)
  const words = t.name.toUpperCase().split(/\s+/).slice(0, 2);
  let y = 800;
  for (const word of words) {
    const s = fit(ctx, word, ANTON, 150, W - M * 2);
    text(ctx, word, M - 4, y, `${s}px ${ANTON}`, INK, { spacing: 2 });
    y += s * 1.02;
  }

  // Rol
  const roleSize = fit(
    ctx,
    t.role.toUpperCase(),
    SANS,
    58,
    W - M * 2 - 5 * t.role.length,
    "800",
  );
  text(ctx, t.role.toUpperCase(), M, y + 34, `800 ${roleSize}px ${SANS}`, INK, {
    spacing: 5,
  });
  ctx.fillStyle = TEAL;
  ctx.fillRect(M, y + 70, 120, 10);

  // Franja inferior oscura
  const fy = H - 196;
  ctx.fillStyle = INK;
  ctx.fillRect(0, fy, W, H - fy);
  text(ctx, "BUENOS AIRES · AR", M, fy + 84, `600 32px ${MONO}`, LIGHT, {
    spacing: 5,
  });
  text(ctx, "Nº 001", M, fy + 138, `600 32px ${MONO}`, TEAL, { spacing: 5 });
  barcode(ctx, W - M - 300, fy + 52, 300, 96, LIGHT);

  // Entrega el lienzo directamente: sin codificar PNG y volver a decodificarlo.
  return c;
}

/** Frente con retrato: "MR" verde gigante detrás de la figura recortada y panel
 *  oscuro abajo con nombre, rol y datos de la credencial. */
function drawFrontPhoto(t: BadgeTexts, photo: HTMLImageElement) {
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  grid(ctx, W, H, "rgba(14,15,18,0.07)");

  const M = 72;
  const PANEL = 1010; // donde empieza el panel oscuro

  text(ctx, "PORTFOLIO", M, 112, `600 30px ${MONO}`, "rgba(14,15,18,0.6)", {
    spacing: 6,
  });
  text(ctx, t.year, W - M, 112, `600 30px ${MONO}`, "rgba(14,15,18,0.6)", {
    align: "right",
    spacing: 6,
  });

  // Logo MR gigante (turquesa, letras en el color de la tarjeta) detrás del retrato
  const lw = 900;
  logoMR(ctx, (W - lw) / 2, 200, lw, TEAL, CREAM);

  // Retrato (fondo transparente), centrado; el panel tapa la parte de abajo
  const pw = 940;
  const ph = (photo.naturalHeight / photo.naturalWidth) * pw;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, PANEL);
  ctx.clip();
  ctx.drawImage(photo, (W - pw) / 2, 175, pw, ph);
  ctx.restore();

  // Panel oscuro
  ctx.fillStyle = INK;
  ctx.fillRect(0, PANEL, W, H - PANEL);
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, PANEL, W, 10);

  const name = t.name.toUpperCase();
  const ns = fit(ctx, name, ANTON, 132, W - M * 2);
  text(ctx, name, M - 2, PANEL + 158, `${ns}px ${ANTON}`, LIGHT, {
    spacing: 2,
  });
  const role = t.role.toUpperCase();
  const rs = fit(ctx, role, SANS, 42, W - M * 2 - 5 * role.length, "800");
  text(ctx, role, M, PANEL + 222, `800 ${rs}px ${SANS}`, TEAL, { spacing: 5 });

  ctx.fillStyle = "rgba(242,237,228,0.14)";
  ctx.fillRect(M, PANEL + 262, W - M * 2, 2);
  text(ctx, "BUENOS AIRES · AR", M, PANEL + 330, `600 30px ${MONO}`, LIGHT, {
    spacing: 5,
  });
  text(ctx, "Nº 001", M, PANEL + 378, `600 30px ${MONO}`, TEAL, {
    spacing: 5,
  });
  barcode(ctx, W - M - 270, PANEL + 296, 270, 88, LIGHT);

  // Entrega el lienzo directamente: sin codificar PNG y volver a decodificarlo.
  return c;
}

function loadPhoto(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = portraitUrl;
  });
}

function drawBack(t: BadgeTexts) {
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  grid(ctx, W, H, "rgba(255,255,255,0.05)");

  const M = 72;
  text(ctx, "PORTFOLIO", M, 112, `600 30px ${MONO}`, "rgba(242,237,228,0.5)", {
    spacing: 6,
  });
  text(ctx, t.year, W - M, 112, `600 30px ${MONO}`, "rgba(242,237,228,0.5)", {
    align: "right",
    spacing: 6,
  });

  // Logo MR (igual al de la barra)
  const bw = 600;
  logoMR(ctx, (W - bw) / 2, 850 - mrHeight(bw), bw, "#050608", LIGHT);

  const nameUpper = t.name.toUpperCase();
  const ns = fit(ctx, nameUpper, ANTON, 104, W - M * 2);
  text(ctx, nameUpper, W / 2, 980, `${ns}px ${ANTON}`, LIGHT, {
    align: "center",
    spacing: 2,
  });
  const rs = fit(ctx, t.role.toUpperCase(), SANS, 34, W - M * 2, "600");
  text(
    ctx,
    t.role.toUpperCase(),
    W / 2,
    1050,
    `600 ${rs}px ${SANS}`,
    "rgba(242,237,228,0.6)",
    {
      align: "center",
      spacing: 7,
    },
  );

  // Píldora "HABLEMOS ↗" (decorativa)
  ctx.font = `800 40px ${SANS}`;
  ctx.letterSpacing = "5px";
  const label = `${t.cta.toUpperCase()}  ↗`;
  const pw = ctx.measureText(label).width + 96;
  ctx.letterSpacing = "0px";
  const ph = 104;
  const px = (W - pw) / 2;
  const py = 1170;
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.roundRect(px + 10, py + 10, pw, ph, ph / 2);
  ctx.fill();
  ctx.fillStyle = LIGHT;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, ph / 2);
  ctx.fill();
  text(ctx, label, W / 2, py + 66, `800 40px ${SANS}`, INK, {
    align: "center",
    spacing: 5,
  });

  // Entrega el lienzo directamente: sin codificar PNG y volver a decodificarlo.
  return c;
}

/** Cinta: se repite a lo largo; el alto de la imagen ocupa el ancho de la cinta. */
function drawStrap(t: BadgeTexts) {
  const h = 192;
  const font = `118px ${ANTON}`;
  const { ctx: m } = canvas(1, 1);
  m.font = font;
  m.letterSpacing = "6px";
  const label = t.name.toUpperCase();
  const gap = 70;
  const lh = 132; // alto del logo MR en la cinta
  const lw = (lh * MR_BOX[2]) / MR_BOX[3];
  const w = Math.ceil(lw + gap + m.measureText(label).width + gap);
  m.letterSpacing = "0px";

  const { c, ctx } = canvas(w, h);
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, w, h);
  // Costuras
  ctx.fillStyle = "rgba(242,237,228,0.18)";
  for (let x = 0; x < w; x += 18) {
    ctx.fillRect(x, 16, 9, 3);
    ctx.fillRect(x, h - 19, 9, 3);
  }
  const base = h / 2 + 42;
  ctx.font = font;
  ctx.letterSpacing = "6px";
  ctx.textBaseline = "alphabetic";
  logoMR(ctx, gap / 2, (h - lh) / 2, lw, "#050608", TEAL);
  ctx.fillStyle = LIGHT;
  ctx.fillText(label, gap / 2 + lw + gap, base);
  ctx.letterSpacing = "0px";
  // Entrega el lienzo directamente: sin codificar PNG y volver a decodificarlo.
  return c;
}

/** Espera las tipografías y dibuja las tres imágenes. */
export async function drawBadgeArt(
  t: BadgeTexts,
  design: BadgeDesign = "foto",
): Promise<BadgeArt> {
  TEAL = readAccent();
  const photo = design === "foto" ? loadPhoto() : Promise.resolve(null);
  try {
    await Promise.all([
      document.fonts.load(`400 100px ${ANTON}`),
      document.fonts.load(`700 40px ${SANS}`),
    ]);
  } catch {
    /* si falla, se dibuja con la tipografía de respaldo */
  }
  const img = await photo;
  return {
    // si la foto no carga, usa el diseño tipográfico
    front: img ? drawFrontPhoto(t, img) : drawFront(t),
    back: drawBack(t),
    strap: drawStrap(t),
  };
}
