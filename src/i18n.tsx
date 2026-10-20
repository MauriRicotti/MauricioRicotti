/**
 * Idiomas del sitio (español / inglés).
 *  - "/"   → español (content.ts)
 *  - "/en" → inglés  (content.en.ts)
 * El botón ES / EN cambia el idioma sin recargar (con una cortina animada, ver
 * components/LangCurtain.tsx) y actualiza la dirección.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as es from "./data/content";
import * as en from "./data/content.en";
import LangCurtain from "./components/LangCurtain";

export type Lang = "es" | "en";
export type Content = typeof es;

const dict: Record<Lang, Content> = { es, en };

const langFromPath = (): Lang =>
  typeof window !== "undefined" && /^\/en(\/|$)/.test(window.location.pathname)
    ? "en"
    : "es";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Todo el contenido en el idioma actual */
  c: Content;
}

const Ctx = createContext<LangCtx>({ lang: "es", setLang: () => {}, c: es });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(langFromPath);
  // Cortina animada en curso (idioma de destino) y si está ocupada
  const [curtain, setCurtain] = useState<{ from: Lang; to: Lang } | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;
  const busy = useRef(false);

  // Botones atrás / adelante del navegador
  useEffect(() => {
    const onPop = () => setLangState(langFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Idioma del documento, título y descripción de la pestaña
  useEffect(() => {
    const c = dict[lang];
    document.documentElement.lang = lang;
    document.title = c.seo.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", c.seo.description);
  }, [lang]);

  // Cambia el idioma y la dirección (/ o /en). En el visor de archivos puede no estar permitido.
  const apply = useCallback((l: Lang) => {
    setLangState(l);
    try {
      const path = l === "en" ? "/en" : "/";
      if (window.location.protocol.startsWith("http"))
        window.history.pushState(null, "", path + window.location.hash);
    } catch {
      /* sin cambio de dirección: el idioma igual cambia */
    }
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      if (busy.current || l === langRef.current) return;
      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return apply(l);
      busy.current = true;
      setCurtain({ from: langRef.current, to: l });
    },
    [apply],
  );

  const value = useMemo(
    () => ({ lang, setLang, c: dict[lang] }),
    [lang, setLang],
  );
  return (
    <Ctx.Provider value={value}>
      {children}
      {curtain && (
        <LangCurtain
          from={curtain.from}
          to={curtain.to}
          onCovered={() => apply(curtain.to)}
          onDone={() => {
            busy.current = false;
            setCurtain(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);

/** Reemplaza {clave} en un texto: fill("Hola {name}", { name: "Ana" }) */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
