/** Se ejecuta solo durante el build: contenido idéntico para personas y buscadores. */
import { renderToString } from "react-dom/server";
import App from "./App";
import { LangProvider, type Lang } from "./i18n";

export function render(lang: Lang) {
  return renderToString(
    <LangProvider initialLang={lang}>
      <App />
    </LangProvider>,
  );
}
