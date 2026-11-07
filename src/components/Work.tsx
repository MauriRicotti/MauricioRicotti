import SectionTitle from "./SectionTitle";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowUpRight, Download, Plus, Star } from "lucide-react";
import { siGithub } from "simple-icons";
import type { CSSProperties } from "react";
import type { Project } from "../types";
import { useLang } from "../i18n";
import { sound } from "../lib/sound";
import PhoneFrame from "./PhoneFrame";

interface WorkProps {
  projects: Project[];
}

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const num = (i: number) => String(i + 1).padStart(2, "0");

/* ---------- Partes compartidas ---------- */

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li
          key={t}
          className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-neutral-300 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-colors"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Links({ project }: { project: Project }) {
  const { ui } = useLang().c;
  if (!project.demoUrl && !project.githubUrl && !project.downloadUrl)
    return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.downloadUrl && (
        <a
          href={project.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-[#0e0f12] text-xs sm:text-sm font-semibold hover:bg-[#f2ede4] active:scale-[0.97] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
        >
          <Download size={15} className="transition-transform duration-150 group-hover:translate-y-0.5" />
          <span>{ui.download}</span>
        </a>
      )}
      {project.demoUrl && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f2ede4] text-[#0e0f12] text-xs sm:text-sm font-semibold hover:bg-accent active:scale-[0.97] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
        >
          <span>{ui.viewDemo}</span>
          <ArrowUpRight
            size={15}
            className="transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/[0.04] text-xs sm:text-sm font-semibold text-[#f2ede4] hover:border-white/50 hover:bg-white/[0.08] active:scale-[0.97] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0f12]"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 fill-current opacity-85 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            <path d={siGithub.path} />
          </svg>
          <span>{ui.code}</span>
        </a>
      )}
    </div>
  );
}

/** srcSet con la versión chica (si existe), para que cada pantalla baje la imagen justa. */
const srcSetOf = (p: Project) =>
  p.imageSmall ? `${p.imageSmall} 800w, ${p.image} 1200w` : undefined;

/** Mini ventana de navegador alrededor de la captura del proyecto. */
function BrowserFrame({ project: p }: { project: Project }) {
  let host = "";
  try {
    host = p.demoUrl ? new URL(p.demoUrl).hostname : "";
  } catch {
    host = "";
  }
  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-white/[0.08] bg-[#14151a] overflow-hidden">
      <div className="h-7 shrink-0 flex items-center gap-3 px-3 border-b border-white/[0.06] bg-[#111216]">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <div className="flex-1 flex justify-center pr-10">
          <span className="h-[18px] w-full max-w-[260px] rounded-md bg-white/[0.04] border border-white/[0.04] text-[10px] font-mono text-neutral-400 flex items-center justify-center truncate px-2 select-none">
            {host || p.name.toLowerCase().replace(/\s+/g, "") + ".app"}
          </span>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 bg-[#0c0d10]">
        <img
          src={p.image}
          srcSet={srcSetOf(p)}
          sizes="(min-width: 1536px) 820px, 60vw"
          alt={p.name}
          width={1200}
          height={675}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>
    </div>
  );
}

/** Etiqueta destacada (ej. "App estrella") */
function Highlight({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[#0e0f12] text-[10px] font-bold uppercase tracking-wider select-none">
      <Star size={11} className="fill-current" />
      {label}
    </span>
  );
}

/** Escritorio, proyecto abierto de tipo "mobile": teléfono a la izquierda + información a la derecha. */
function MobileAppOpen({
  project: p,
  index: i,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div className="absolute inset-0 flex gap-4 p-3">
      {/* Escenario con cuadrícula suave; el teléfono se ajusta al espacio disponible */}
      <div className="phone-stage relative flex-1 min-w-0 rounded-lg border border-white/[0.08] bg-[#14151a] p-4 flex items-center justify-center overflow-hidden">
        <PhoneFrame project={p} />
      </div>

      <div className="w-[220px] xl:w-[320px] shrink-0 flex flex-col justify-between gap-5 px-3 py-3">
        <div className="min-w-0">
          {p.highlight && <Highlight label={p.highlight} />}
          <p className="mt-3 font-mono text-xs text-neutral-400 tracking-wide">
            <span className="text-accent font-semibold">{num(i)}</span>
            <span className="mx-2 text-neutral-700">/</span>
            {p.category}
            {p.year ? ` · ${p.year}` : ""}
          </p>
          <h3 className="mt-2 font-hero text-4xl xl:text-6xl uppercase tracking-[-0.03em] leading-[0.92] text-[#f2ede4] break-words">
            {p.name}
          </h3>
          <p className="mt-2.5 text-sm xl:text-base text-neutral-200 font-medium tracking-tight">
            {p.subtitle}
          </p>
          <p className="mt-2.5 text-xs xl:text-sm leading-relaxed text-neutral-400 line-clamp-4 xl:line-clamp-none">
            {p.description}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Tags tags={p.tags} />
          <Links project={p} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Escritorio: panel vertical ----------
   memo: al cambiar de proyecto solo se vuelven a dibujar los 2 paneles que cambian. */

interface PanelProps {
  project: Project;
  index: number;
  open: boolean;
  autoplayMs: number; // 0 = sin pase automático
  onOpen: (i: number) => void;
  onProgressEnd: () => void;
}

const DesktopPanel = memo(function DesktopPanel({
  project: p,
  index: i,
  open,
  autoplayMs,
  onOpen,
  onProgressEnd,
}: PanelProps) {
  const { ui } = useLang().c;
  return (
    <article
      style={{ flexBasis: "var(--panel-closed)", contain: "layout paint" }}
      className={`relative shrink-0 overflow-hidden rounded-xl border transition-[flex-grow,border-color,background-color] duration-[320ms] ${EASE} ${
        open
          ? "grow border-white/20 bg-[#131419]"
          : "grow-0 border-white/[0.08] bg-[#0f1014] hover:border-white/25 hover:bg-[#14151b]"
      }`}
    >
      {/* Cerrada: número + nombre en vertical */}
      <button
        type="button"
        onClick={() => onOpen(i)}
        aria-expanded={open}
        aria-controls={`work-desktop-${p.id}`}
        tabIndex={open ? -1 : 0}
        className={`group absolute inset-0 flex flex-col items-center justify-between py-6 cursor-pointer transition-opacity duration-150 ${
          open ? "opacity-0 pointer-events-none" : "opacity-100 delay-100"
        }`}
      >
        <span className="flex flex-col items-center gap-2">
          <span
            aria-hidden="true"
            className="font-mono text-xs text-neutral-400 group-hover:text-accent transition-colors"
          >
            {num(i)}
          </span>
          {p.highlight && (
            <Star
              size={13}
              className="text-accent fill-current"
              aria-hidden="true"
            />
          )}
        </span>
        <span className="font-hero text-3xl xl:text-4xl uppercase tracking-[-0.02em] text-[#f2ede4]/80 group-hover:text-[#f2ede4] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 transition-colors">
          {p.name}
        </span>
        <span className="sr-only">
          {p.highlight ? ` (${p.highlight})` : ""}, {ui.openProject}
        </span>
        <span className="w-8 h-8 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-neutral-400 group-hover:text-[#0e0f12] group-hover:bg-accent group-hover:border-accent active:scale-90 transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <Plus size={15} />
        </span>
      </button>

      {/* Abierta: app de celular (teléfono + info) o web (captura en marco de navegador + info) */}
      <div
        id={`work-desktop-${p.id}`}
        inert={!open}
        className={`work-panel-content absolute inset-0 flex flex-col p-3 transition-opacity ${
          open
            ? "opacity-100 duration-200 delay-[60ms]"
            : "opacity-0 duration-100 pointer-events-none"
        }`}
      >
        {p.type === "mobile" ? (
          <MobileAppOpen project={p} index={i} />
        ) : (
          <>
            <BrowserFrame project={p} />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] items-end gap-x-8 gap-y-3 px-3 pt-4 pb-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-neutral-400 tracking-wide">
                  <span className="text-accent font-semibold">{num(i)}</span>
                  <span className="mx-2 text-neutral-700">/</span>
                  {p.category}
                  {p.year ? ` · ${p.year}` : ""}
                </p>
                <h3 className="mt-1.5 font-hero text-3xl xl:text-5xl uppercase tracking-[-0.03em] leading-[0.95] text-[#f2ede4] truncate">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm xl:text-base text-neutral-200 font-medium tracking-tight">
                  {p.subtitle}
                </p>
                <p className="hidden xl:block mt-1.5 text-xs xl:text-sm leading-relaxed text-neutral-400 line-clamp-2 max-w-2xl">
                  {p.description}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 xl:flex-col xl:items-end xl:justify-end xl:max-w-[280px]">
                <div className="min-w-0 xl:[&_ul]:justify-end">
                  <Tags tags={p.tags} />
                </div>
                <Links project={p} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Barra de progreso del pase automático (la pausa se maneja por CSS, sin re-render) */}
      {autoplayMs > 0 && open && (
        <div className="absolute left-6 right-6 bottom-0 h-[2.5px] rounded-full bg-white/[0.04] overflow-hidden pointer-events-none">
          <div
            onAnimationEnd={onProgressEnd}
            className="h-full bg-accent origin-left animate-progress"
            style={{ animationDuration: `${autoplayMs}ms` }}
          />
        </div>
      )}
    </article>
  );
});

/* ---------- Celular y tablet: franja desplegable ---------- */

interface RowProps {
  project: Project;
  index: number;
  open: boolean;
  onToggle: (i: number, el: HTMLElement | null) => void;
}

const MobileRow = memo(function MobileRow({
  project: p,
  index: i,
  open,
  onToggle,
}: RowProps) {
  const ref = useRef<HTMLElement>(null);
  // La imagen se descarga recién la primera vez que se abre el proyecto
  const [everOpen, setEverOpen] = useState(open);
  if (open && !everOpen) setEverOpen(true);
  return (
    <article
      ref={ref}
      className={`rounded-xl border transition-colors duration-200 ${
        open ? "border-white/20 bg-[#131419]" : "border-white/[0.08] bg-[#0f1014]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(i, ref.current)}
        aria-expanded={open}
        aria-controls={`work-mobile-${p.id}`}
        className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 text-left cursor-pointer active:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <span
          className={`font-mono text-xs ${open ? "text-accent font-semibold" : "text-neutral-400"}`}
        >
          {num(i)}
        </span>
        <span className="font-hero text-2xl sm:text-3xl uppercase tracking-[-0.02em] text-[#f2ede4] leading-none">
          {p.name}
        </span>
        {p.highlight && (
          <Star
            size={13}
            className="text-accent fill-current shrink-0 -ml-1 sm:-ml-2"
            aria-hidden="true"
          />
        )}
        <span className="ml-auto font-mono text-[11px] text-neutral-400 hidden sm:inline">
          {p.category}
          {p.year ? ` · ${p.year}` : ""}
        </span>
        <span
          className={`ml-auto sm:ml-0 w-8 h-8 shrink-0 rounded-full border flex items-center justify-center active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            open
              ? "rotate-45 bg-accent border-accent text-[#0e0f12]"
              : "border-white/15 bg-white/[0.02] text-neutral-400"
          }`}
        >
          <Plus size={15} />
        </span>
      </button>

      <div
        id={`work-mobile-${p.id}`}
        className={`grid transition-[grid-template-rows] duration-[280ms] ${EASE} ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 grid md:grid-cols-2 gap-4 md:gap-6">
            {p.type === "mobile" ? (
              <div className="rounded-lg border border-white/[0.08] bg-[#14151a] flex justify-center py-6 sm:py-8">
                <PhoneFrame project={p} className="w-[min(220px,60vw)]" />
              </div>
            ) : (
              <div className="relative aspect-[16/10] rounded-lg border border-white/[0.08] overflow-hidden bg-[#0c0d10]">
                {everOpen && (
                  <img
                    src={p.image}
                    srcSet={srcSetOf(p)}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    alt={p.name}
                    width={1200}
                    height={627}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                )}
              </div>
            )}
            <div className="px-1 pb-1 md:py-2 flex flex-col gap-4">
              <div>
                {p.highlight && (
                  <div className="mb-3">
                    <Highlight label={p.highlight} />
                  </div>
                )}
                <p className="font-mono text-[11px] text-neutral-400 sm:hidden mb-1">
                  {p.category}
                  {p.year ? ` · ${p.year}` : ""}
                </p>
                <p className="text-base text-neutral-200 font-medium tracking-tight">
                  {p.subtitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {p.description}
                </p>
              </div>
              <Tags tags={p.tags} />
              <Links project={p} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

/* ---------- Sección ---------- */

// Solo se dibuja el diseño que corresponde a la pantalla (paneles en PC, franjas en
// celular/tablet): la mitad de elementos en la página → carga y scroll más livianos.
const DESKTOP_MQ = "(min-width: 1024px)";
const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = () => window.matchMedia(DESKTOP_MQ).matches;
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = () => window.matchMedia(REDUCED_MQ).matches;

export default function Work({ projects }: WorkProps) {
  const { workSection } = useLang().c;
  // Índice del proyecto abierto (uno a la vez). En celular se puede cerrar todo (-1).
  const [openIdx, setOpenIdx] = useState(0);
  const desktopIdx = openIdx < 0 ? 0 : openIdx;
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktop,
    () => null,
  );
  const count = projects.length;

  /* ---- Pase automático (solo escritorio) ----
     La barra de progreso de la tarjeta abierta se llena y al terminar pasa a la siguiente.
     Se pausa (vía CSS, sin volver a dibujar la sección) con el mouse encima,
     cuando la sección no está en pantalla o la pestaña está oculta. */
  // Snapshot de servidor estable: evita diferencias de hidratación si el SO reduce movimiento.
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const autoplayMs = reduced || count < 2 ? 0 : (workSection.autoplaySeconds ?? 0) * 1000;
  const panelsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = panelsRef.current;
    if (!el || !autoplayMs) return;
    let inView = false;
    const update = () => {
      if (inView && !document.hidden) el.removeAttribute("data-paused");
      else el.setAttribute("data-paused", "");
    };
    update();
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        update();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [autoplayMs, isDesktop]);

  const next = useCallback(
    () => setOpenIdx((i) => ((i < 0 ? 0 : i) + 1) % count),
    [count],
  );

  // Referencia al índice abierto para que los callbacks sean estables (no rompen el memo)
  const openRef = useRef(openIdx);
  openRef.current = openIdx;

  const openDesktop = useCallback((i: number) => {
    const cur = openRef.current < 0 ? 0 : openRef.current;
    if (cur === i) return;
    sound.playPop(480);
    setOpenIdx(i);
  }, []);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
  }, []);

  const toggleMobile = useCallback((i: number, el: HTMLElement | null) => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    const nextIdx = openRef.current === i ? -1 : i;
    setOpenIdx(nextIdx);
    if (nextIdx < 0) {
      sound.playClick();
      return;
    }
    sound.playPop(480);
    // Si al cerrarse otra tarjeta la elegida quedó fuera de vista, la acomoda
    scrollTimer.current = setTimeout(() => {
      if (!el || openRef.current !== i) return;
      const top = el.getBoundingClientRect().top;
      if (top < 80) window.scrollBy({ top: top - 90, behavior: "smooth" });
    }, 290);
  }, []);

  return (
    <section
      id="work"
      className="py-20 sm:py-28 bg-[#0e0f12] text-white scroll-mt-16"
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-10 sm:mb-16 grid lg:grid-cols-12 gap-6 items-end">
          <h2 className="lg:col-span-7 font-hero text-5xl sm:text-6xl md:text-7xl xl:text-8xl uppercase tracking-tight leading-[0.9] text-[#f2ede4]">
            <SectionTitle title={workSection.title} accent={workSection.titleAccent} />
          </h2>
          {workSection.subtitle && (
            <p className="lg:col-span-5 text-base sm:text-lg text-neutral-400 leading-relaxed lg:text-right">
              {workSection.subtitle}
            </p>
          )}
        </div>

        {/* ===== Escritorio: paneles verticales ===== */}
        {isDesktop !== false && (
          <div data-reveal data-reveal-delay="1" className="work-wrap hidden lg:block">
            <div
              ref={panelsRef}
              className="work-panels flex gap-3"
              style={{ "--closed": count - 1 } as CSSProperties}
            >
              {projects.map((p, i) => (
                <DesktopPanel
                  key={p.id}
                  project={p}
                  index={i}
                  open={i === desktopIdx}
                  autoplayMs={autoplayMs}
                  onOpen={openDesktop}
                  onProgressEnd={next}
                />
              ))}
            </div>
          </div>
        )}
        {/* ===== Celular y tablet: franjas apiladas ===== */}
        {isDesktop !== true && (
          <div data-reveal data-reveal-delay="1" className="flex flex-col gap-3 lg:hidden">
            {projects.map((p, i) => (
              <MobileRow
                key={p.id}
                project={p}
                index={i}
                open={i === openIdx}
                onToggle={toggleMobile}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
