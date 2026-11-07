// Ejecutar después de npm run build. Verifica la página 404 estática integrada.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const output = process.argv[2] || "dist";
const filePath = `${output}/404.html`;

assert.ok(existsSync(filePath), `Falta ${filePath} en el directorio de salida`);
const html = readFileSync(filePath, "utf8");

// 1. Estructura básica y metadatos
assert.ok(html.includes("<!doctype html>"), "404.html: falta doctype");
assert.ok(html.includes('<html lang="es">'), "404.html: idioma inicial debe ser es");
assert.ok(html.includes('content="noindex, nofollow"'), "404.html: debe incluir noindex, nofollow");
assert.ok(html.includes("<title>404 — Página no encontrada | Mauricio Ricotti</title>"), "404.html: título incorrecto");

// 2. Elementos del hero 404 de pantalla rota (invertido: fondo oscuro, apertura clara)
assert.ok(
  html.includes('class="colossal-404"') && html.includes('class="digit-red"'),
  "404.html: debe incluir el hero colosal 404 con acento rojo"
);
assert.ok(
  !html.includes('colossal-404::before') && !html.includes('text-shadow: 0 0 60px'),
  "404.html: el 0 no debe tener resplandor ni glow según instrucción expresa"
);
assert.ok(
  !html.includes('class="status-badge"'),
  "404.html: el badge sobre el 404 debe estar removido según instrucción expresa"
);
assert.ok(
  !html.includes('class="scroll-cue"'),
  "404.html: el indicador de scroll debe estar eliminado según instrucción expresa"
);
assert.ok(
  html.includes('class="route-capsule"'),
  "404.html: debe incluir la cápsula de ruta solicitada"
);

// 3. Personaje y tarjetas encerradas removidas
assert.ok(
  !html.includes('data:image/webp;base64') && !html.includes('class="char-portrait"'),
  "404.html: el personaje debe estar completamente ausente"
);
assert.ok(
  !html.includes('class="proposal-card"') && !html.includes('class="hero-card"'),
  "404.html: no debe contener cajas o tarjetas contenedoras encerrando el hero"
);

// 4. Navbar limpio (solo sticker MR + controles; sin links de navegación)
assert.ok(html.includes('id="site-header"'), "404.html: falta el header");
assert.ok(html.includes('id="brand-logo"'), "404.html: falta el logo sticker");
assert.ok(
  !html.includes('id="nav-work"') && !html.includes('id="nav-about"'),
  "404.html: los links de navegación de sección deben estar removidos del navbar"
);
assert.ok(html.includes('data-lang="es"') && html.includes('data-lang="en"'), "404.html: falta selector de idioma ES/EN");
assert.ok(html.includes('id="sound-btn"'), "404.html: falta el botón de sonido");
assert.ok(html.includes('id="talk-btn"'), "404.html: falta el botón Hablemos");

// 5. Elementos de acción y navegación de rescate
assert.ok(html.includes('id="requested-path"'), "404.html: falta código de ruta solicitada");
assert.ok(html.includes('id="copy-route"'), "404.html: falta botón para copiar ruta");
assert.ok(html.includes('id="home-link"'), "404.html: falta enlace al inicio");
assert.ok(html.includes('id="projects-link"'), "404.html: falta enlace a proyectos");
assert.ok(html.includes('id="contact-link"'), "404.html: falta enlace de contacto");

// 6. Footer limpio con Parallax Reveal
assert.ok(
  !html.includes('id="footer-email-btn"') && !html.includes('id="footer-whatsapp-btn"'),
  "404.html: el footer no debe tener botones de CTA/contacto redundantes"
);
assert.ok(
  !html.includes('id="status-dot"') && !html.includes('id="local-time-text"'),
  "404.html: el footer no debe contener la grilla de horarios o estado"
);
assert.ok(
  html.includes('class="footer-reveal"') && html.includes('class="footer-inner"'),
  "404.html: debe tener la estructura de parallax reveal en el footer"
);
assert.ok(
  html.includes('footer-rise'),
  "404.html: debe incluir la animación parallax footer-rise"
);

// 7. Fórmula exacta de tamaño del footer para el nombre gigante
assert.ok(
  html.includes("calc(100cqw / 6.38)"),
  "404.html: la tipografía del nombre en escritorio debe usar calc(100cqw / 6.38)"
);
assert.ok(
  html.includes("calc(100cqw / 7.2)"),
  "404.html: la tipografía del nombre en celular debe usar calc(100cqw / 7.2)"
);
assert.ok(
  html.includes("MAURICIO RICOTTI"),
  "404.html: falta el nombre gigante en el footer"
);

// 8. Integración con sound.ts
assert.ok(
  html.includes('mr:sound-enabled'),
  "404.html: debe usar la clave de storage 'mr:sound-enabled'"
);

// 9. Sin placeholders
assert.ok(
  !/%VITE_|example\.com|tu-usuario/.test(html),
  "404.html: contiene placeholders no resueltos"
);

console.log("✓ 404.html: concepto de vidrio quebrado invertido verificado con éxito, responsivo y sin resplandor");
