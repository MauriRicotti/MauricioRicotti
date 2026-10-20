import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App";
import { initSmoothScroll } from "./lib/smoothScroll";

// Scroll suave en toda la web (ver src/lib/smoothScroll.ts)
initSmoothScroll();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
