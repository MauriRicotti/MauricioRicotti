import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App";
import { LangProvider } from "./i18n";
import { loaderDelay } from "./lib/loader";

// Animación de entrada: arranca cuando la tipografía del título ya cargó
// (si no, se animaría con las letras todavía invisibles). Máximo 1,5 s de espera.
// Si se está mostrando la pantalla de carga, espera a que empiece a abrirse.
{
  const root = document.documentElement;
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    setTimeout(
      () =>
        requestAnimationFrame(() => {
          root.classList.remove("intro-wait");
          root.classList.add("intro-go");
        }),
      loaderDelay(),
    );
  };
  document.fonts?.load('400 1em "Anton"').then(go, go);
  setTimeout(go, 1500);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
);
