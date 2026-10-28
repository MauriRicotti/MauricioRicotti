import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App";
import { LangProvider } from "./i18n";
import { markHeroIntro, whenLoaderOpens } from "./lib/loader";

// La fuente tiene como máximo 1,5 s de espera. El título arranca al abrirse
// realmente la cortina; la tarjeta no compite con el logo mientras se arma.
{
  const root = document.documentElement;
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    void whenLoaderOpens().then(() => {
      requestAnimationFrame(() => {
        root.classList.remove("intro-wait");
        root.classList.add("intro-go");
        markHeroIntro();
      });
    });
  };
  document.fonts?.load('400 1em "Anton"').then(go, go);
  setTimeout(go, 1500);
}

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>
);

// Producción sirve el contenido completo ya renderizado; React solo lo hace interactivo.
// El preview en un único archivo y el servidor de desarrollo siguen usando createRoot.
if (container.dataset.prerendered === "true") hydrateRoot(container, app);
else createRoot(container).render(app);
