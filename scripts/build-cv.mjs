/**
 * CV A4 en español e inglés con la identidad actual del portfolio.
 * Datos: src/data/content.ts / content.en.ts. Diseño: scripts/cv-template.html.
 * Logo: src/lib/logoMR.ts. Acento: --color-accent en src/index.css.
 *
 * Preparación (una vez):
 *   npm i --no-save playwright && npx playwright install chromium
 * Generar:
 *   npm run cv
 *   CV_HTML=1 npm run cv   # además guarda HTML autónomos para revisión
 *
 * Solo reemplaza los PDF después de validar ambos idiomas. Actualiza ?v=hash
 * en profile.cvUrl para no reutilizar un PDF viejo desde la caché del navegador.
 */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import {
  readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync,
  copyFileSync, rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

// Datos extra que no están en la web. No se inventa formación ni nivel de inglés.
const EXTRA = {
  es: {
    languages: [["Español", "Nativo"]],
    // education: [["Carrera / curso", "Institución · 2020 – 2024"]],
    education: [],
  },
  en: {
    languages: [["Spanish", "Native"]],
    // education: [["Degree / course", "Institution · 2020 – 2024"]],
    education: [],
  },
};

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(join(ROOT, file), "utf8");
const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (value) => JSON.stringify(value)
  .replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

const now = new Date();
const month = (locale) => now.toLocaleDateString(locale, {
  month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires",
});
const LABELS = {
  es: {
    kicker: "Currículum vitae", profile: "Perfil", projects: "Proyectos destacados",
    skills: "Habilidades", services: "Servicios", process: "Cómo trabajo",
    languages: "Idiomas", education: "Formación", updated: "Actualizado", month: month("es-AR"),
  },
  en: {
    kicker: "Curriculum vitae", profile: "Profile", projects: "Featured projects",
    skills: "Skills", services: "Services", process: "How I work",
    languages: "Languages", education: "Education", updated: "Updated", month: month("en-US"),
  },
};

async function load(file) {
  const result = await build({
    entryPoints: [join(ROOT, file)], bundle: true, format: "esm",
    platform: "node", write: false, logLevel: "silent",
  });
  return import("data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64"));
}

// El PDF recibe solo los campos que utiliza, no la configuración del formulario.
function select(c) {
  return {
    profile: Object.fromEntries(
      ["name", "role", "email", "phone", "whatsapp", "location", "socials"].map((key) => [key, c.profile[key]]),
    ),
    projects: c.projects.map((p) => Object.fromEntries(
      ["id", "name", "subtitle", "category", "highlight", "description", "tags", "demoUrl"].map((key) => [key, p[key]]),
    )),
    about: { paragraphs: c.about.paragraphs, services: c.about.services.map((s) => ({ title: s.title })) },
    techStack: c.techStack.map((g) => ({ title: g.title, items: g.items.map((i) => ({ name: i.name })) })),
    processSteps: c.processSteps.map((s) => ({ title: s.title })),
  };
}

const entries = [
  { lang: "es", source: "src/data/content.ts", out: "public/cv/Mauricio-Ricotti-CV.pdf", url: "/cv/Mauricio-Ricotti-CV.pdf" },
  { lang: "en", source: "src/data/content.en.ts", out: "public/cv/Mauricio-Ricotti-CV-EN.pdf", url: "/cv/Mauricio-Ricotti-CV-EN.pdf" },
];
const data = {};
for (const entry of entries) data[entry.lang] = select(await load(entry.source));

const env = existsSync(join(ROOT, ".env")) ? read(".env") : "";
const SITE = (process.env.VITE_SITE_URL || env.match(/^VITE_SITE_URL=(.+)$/m)?.[1] || "https://mauricio-ricotti.vercel.app")
  .trim().replace(/^(["'])(.*)\1$/, "$2").replace(/\/+$/, "");
const siteUrl = new URL(SITE);
if (!["https:", "http:"].includes(siteUrl.protocol) || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  throw new Error("VITE_SITE_URL debe ser el origen público del portfolio, sin rutas ni parámetros.");
}
const accent = read("src/index.css").match(/--color-accent:\s*(#[\da-f]{3,8})\s*;/i)?.[1];
if (!accent) throw new Error("No se encontró --color-accent en src/index.css.");
const { MR_VIEWBOX, MR_SIL, MR_FG } = await load("src/lib/logoMR.ts");
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeHtml(MR_VIEWBOX)}" fill-rule="evenodd"><path fill="#0b0c0f" d="${escapeHtml(MR_SIL)}"/><path fill="#f2ede4" d="${escapeHtml(MR_FG)}"/></svg>`;
const font = (file) => readFileSync(join(ROOT, file)).toString("base64");
const template = read("scripts/cv-template.html");
const common = {
  __CV_ANTON_WOFF2__: font("node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2"),
  __CV_JAKARTA_WOFF2__: font("node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2"),
  __CV_DATA_JSON__: json(data), __CV_SITE_JSON__: json(SITE), __CV_LOGO_JSON__: json(logo),
  __CV_EXTRA_JSON__: json(EXTRA), __CV_LABELS_JSON__: json(LABELS), __CV_ACCENT__: accent,
};
function html(lang) {
  let result = template;
  const values = {
    ...common, __CV_LANG_JSON__: json(lang), __CV_LANG__: lang,
    __CV_TITLE__: escapeHtml(`${data[lang].profile.name} — CV — ${lang.toUpperCase()}`),
  };
  for (const [token, value] of Object.entries(values)) result = result.replaceAll(token, () => value);
  if (/__CV_[A-Z_]+__/.test(result)) throw new Error("Quedaron campos sin completar en cv-template.html.");
  return result;
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Falta Playwright. Instalalo una vez con:\n  npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const temp = mkdtempSync(join(tmpdir(), "portfolio-cv-"));
const plans = [];
let browser;
try {
  browser = await chromium.launch();
  for (const entry of entries) {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    // Fuentes, logo y datos están embebidos. No se permite depender de una red/CDN.
    await page.route(/^https?:\/\//, (route) => route.abort());
    await page.emulateMedia({ media: "print" });
    const doc = html(entry.lang);
    await page.setContent(doc, { waitUntil: "load" });
    await page.waitForFunction(() => window.__cvReady === true);
    await page.evaluate(() => document.fonts.ready);
    if (errors.length) throw new Error(`${entry.lang}: ${errors.join("\n")}`);
    const metrics = await page.evaluate(() => {
      const sheet = document.getElementById("sheet");
      const main = document.querySelector(".cv-main").getBoundingClientRect();
      const side = document.querySelector(".cv-side").getBoundingClientRect();
      const footer = document.querySelector(".cv-footer").getBoundingClientRect();
      const name = document.querySelector(".cv-name").getBoundingClientRect();
      const contacts = document.querySelector(".cv-contact").getBoundingClientRect();
      const overflow = [...document.querySelectorAll(".cv-body, .project-heading, .cv-contact")]
        .some((el) => el.scrollWidth > el.clientWidth + 1);
      return {
        width: sheet.getBoundingClientRect().width, height: sheet.getBoundingClientRect().height,
        pageOverflow: sheet.scrollHeight - sheet.clientHeight,
        bottomGap: footer.top - Math.max(main.bottom, side.bottom),
        headerGap: contacts.left - name.right, overflow,
        projects: document.querySelectorAll(".project").length,
      };
    });
    if (metrics.pageOverflow > 1 || metrics.bottomGap < 8 || metrics.headerGap < 6 || metrics.overflow) {
      throw new Error(`${entry.lang}: el contenido no entra con seguridad en una hoja A4. No se reemplazaron los PDF. Revisá tamaños/espaciados en scripts/cv-template.html. ${JSON.stringify(metrics)}`);
    }
    if (metrics.projects !== data[entry.lang].projects.length) throw new Error(`${entry.lang}: falta contenido de proyectos.`);
    const staged = join(temp, basename(entry.out));
    const bytes = await page.pdf({ path: staged, format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true });
    if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error(`${entry.lang}: PDF inválido.`);
    const version = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
    const cvUrl = `${entry.url}?v=${version}`;
    const source = read(entry.source);
    const field = /(\bcvUrl\s*:\s*)(["'])([^"']+)\2/;
    const found = source.match(field);
    if (!found || new URL(found[3], SITE).pathname !== entry.url) {
      throw new Error(`${entry.source}: no se encontró el cvUrl local esperado. No se reemplazaron los PDF.`);
    }
    const updatedSource = source.replace(field, (_all, prefix, quote) => `${prefix}${quote}${cvUrl}${quote}`);
    plans.push({ ...entry, staged, updatedSource, doc, version, metrics });
    await page.close();
  }
  // Publicar solo cuando los DOS idiomas se hayan generado y validado sin recortes.
  mkdirSync(join(ROOT, "public/cv"), { recursive: true });
  for (const plan of plans) copyFileSync(plan.staged, join(ROOT, plan.out));
  for (const plan of plans) {
    writeFileSync(join(ROOT, plan.source), plan.updatedSource);
    if (process.env.CV_HTML && process.env.CV_HTML !== "0") writeFileSync(join(ROOT, plan.out.replace(/\.pdf$/, ".html")), plan.doc);
    console.log(`✓ ${plan.out}: A4, ${plan.metrics.projects} proyectos, sin recortes, logo MR y acento ${accent}; descarga ?v=${plan.version}`);
  }
} finally {
  await browser?.close();
  rmSync(temp, { recursive: true, force: true });
}
