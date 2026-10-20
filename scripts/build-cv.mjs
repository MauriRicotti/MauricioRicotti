/**
 * Genera el CV en PDF (español e inglés) a partir del MISMO contenido de la web
 * (src/data/content.ts y content.en.ts). Si cambiás un proyecto o un texto allá,
 * volvé a correr esto y el CV queda actualizado.
 *
 *   npm i --no-save playwright && npx playwright install chromium   (solo la primera vez)
 *   npm run cv
 *
 * Salida: public/cv/Mauricio-Ricotti-CV.pdf y public/cv/Mauricio-Ricotti-CV-EN.pdf
 */
import { build } from "esbuild";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";

// ---------- Datos extra que no están en la web (completalos si querés) ----------
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

const LABELS = {
  es: {
    profile: "Perfil",
    projects: "Proyectos destacados",
    skills: "Habilidades",
    services: "Servicios",
    languages: "Idiomas",
    education: "Formación",
    process: "Cómo trabajo",
    contact: "Contacto",
    updated: "Actualizado",
    month: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
  },
  en: {
    profile: "Profile",
    projects: "Featured projects",
    skills: "Skills",
    services: "Services",
    languages: "Languages",
    education: "Education",
    process: "How I work",
    contact: "Contact",
    updated: "Updated",
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  },
};

// ---------- Cargar el contenido (TypeScript) con esbuild ----------
async function load(file) {
  const out = await build({
    entryPoints: [file],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent",
  });
  const code = out.outputFiles[0].text;
  return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

const env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const SITE = (env.match(/^VITE_SITE_URL=(.+)$/m)?.[1] || "https://example.com")
  .trim()
  .replace(/\/+$/, "");

const font = (p) => readFileSync(p).toString("base64");
const ANTON = font("node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2");
const JAKARTA = font(
  "node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
);

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const host = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return u;
  }
};
const real = (u) => u && !/tu-usuario/.test(u);

function html(c, lang) {
  const L = LABELS[lang];
  const X = EXTRA[lang];
  const p = c.profile;
  const site = lang === "en" ? `${SITE}/en` : SITE;
  const github = p.socials.find((s) => s.label === "GitHub" && real(s.url));
  const linkedin = p.socials.find((s) => s.label === "LinkedIn" && real(s.url));

  const contacts = [
    ["mailto:" + p.email, p.email],
    ["https://wa.me/" + p.whatsapp, p.phone],
    [site, host(site)],
    github && [github.url, host(github.url) + new URL(github.url).pathname],
    linkedin && [linkedin.url, "LinkedIn"],
  ].filter(Boolean);

  const projects = c.projects
    .map(
      (pr) => `
      <article class="proj">
        <div class="proj-head">
          <h3>${esc(pr.name)}</h3>
          <span class="cat">${esc(pr.category)}${pr.highlight ? ` · <b>${esc(pr.highlight)}</b>` : ""}</span>
          ${pr.demoUrl ? `<a class="lnk" href="${esc(pr.demoUrl)}">${esc(host(pr.demoUrl))} ↗</a>` : ""}
        </div>
        <p class="desc"><b class="sub">${esc(pr.subtitle)}.</b> ${esc(pr.description)}</p>
        <p class="tags">${pr.tags.map(esc).join(" · ")}</p>
      </article>`,
    )
    .join("");

  const skills = c.techStack
    .map(
      (g) => `
      <div class="skill">
        <h4>${esc(g.title)}</h4>
        <p>${g.items.map((i) => `<span class="chip">${esc(i.name)}</span>`).join("")}</p>
      </div>`,
    )
    .join("");

  const list = (items) =>
    `<ul class="plain">${items.map(([a, b]) => `<li><b>${esc(a)}</b>${b ? ` — ${esc(b)}` : ""}</li>`).join("")}</ul>`;

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8" />
<title>${esc(p.name)} — CV</title>
<style>
  @font-face { font-family: Anton; src: url(data:font/woff2;base64,${ANTON}) format("woff2"); }
  @font-face { font-family: Jakarta; src: url(data:font/woff2;base64,${JAKARTA}) format("woff2"); font-weight: 200 800; }
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 210mm; }
  body { font-family: Jakarta, sans-serif; font-size: 8.2pt; line-height: 1.4; color: #23252b;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  a { color: inherit; text-decoration: none; }
  .page { width: 210mm; height: 297mm; display: flex; flex-direction: column; overflow: hidden; }
  header { background: #0e0f12; color: #f2ede4; padding: 10mm 14mm 8mm; display: flex; justify-content: space-between; align-items: flex-end; gap: 8mm;
           background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
           background-size: 7mm 7mm; }
  .mono { font-family: Anton; font-size: 11pt; letter-spacing: .02em; color: #f2ede4; border-bottom: 1.5px solid #3cd3b7; padding-bottom: 1mm; display: inline-block; margin-bottom: 3mm; }
  h1 { font-family: Anton; font-weight: 400; font-size: 32pt; line-height: 1; letter-spacing: .015em; text-transform: uppercase; }
  .role { font-family: Anton; font-size: 13pt; letter-spacing: .08em; color: #3cd3b7; margin-top: 1.5mm; }
  .contact { list-style: none; text-align: right; font-size: 8.4pt; line-height: 1.75; color: rgba(242,237,228,.85); white-space: nowrap; }
  .contact .loc { color: rgba(242,237,228,.6); }
  .body { flex: 1; display: grid; grid-template-columns: 1fr 52mm; gap: 7mm; padding: 7.5mm 14mm 0; }
  h2 { font-family: Anton; font-weight: 400; font-size: 12pt; letter-spacing: .05em; text-transform: uppercase; color: #0e0f12;
       display: flex; align-items: center; gap: 2.5mm; margin-bottom: 3mm; }
  h2::before { content: ""; width: 5mm; height: 2px; background: #3cd3b7; }
  section + section { margin-top: 4.5mm; }
  .intro { color: #3b3e46; }
  .intro + .intro { margin-top: 1.6mm; }
  .proj { padding: 1.7mm 0; border-top: 1px solid #e6e3dc; break-inside: avoid; }
  .proj:first-of-type { border-top: 0; padding-top: 0; }
  .proj-head { display: flex; align-items: baseline; gap: 2.5mm; }
  h3 { font-family: Anton; font-weight: 400; font-size: 11.5pt; letter-spacing: .03em; text-transform: uppercase; color: #0e0f12; }
  .cat { font-size: 7.6pt; color: #7a7d86; text-transform: uppercase; letter-spacing: .06em; }
  .cat b { color: #1f9c86; font-weight: 700; }
  .lnk { margin-left: auto; font-size: 7.8pt; color: #1f9c86; font-weight: 600; white-space: nowrap; }
  .sub { font-weight: 700; color: #23252b; }
  .desc { color: #4a4d55; margin-top: .4mm; }
  .tags { margin-top: .8mm; font-size: 7.5pt; color: #7a7d86; letter-spacing: .02em; }
  aside { border-left: 1px solid #e6e3dc; padding-left: 6mm; }
  .skill + .skill { margin-top: 3mm; }
  h4 { font-size: 7.6pt; text-transform: uppercase; letter-spacing: .08em; color: #7a7d86; font-weight: 700; margin-bottom: 1.4mm; }
  .chip { display: inline-block; border: 1px solid #d9d5cc; border-radius: 99px; padding: .5mm 2.2mm; margin: 0 1.2mm 1.4mm 0; font-size: 7.8pt; color: #23252b; }
  .plain { list-style: none; }
  .plain li { padding: 1mm 0; border-top: 1px solid #eeebe5; }
  .plain li:first-child { border-top: 0; padding-top: 0; }
  .steps { list-style: none; counter-reset: s; }
  .steps li { counter-increment: s; padding: .8mm 0; }
  .steps li::before { content: counter(s, decimal-leading-zero); font-size: 7.4pt; color: #1f9c86; font-weight: 700; margin-right: 2mm; }
  footer { margin: 4mm 14mm 7mm; padding-top: 3mm; border-top: 1px solid #e6e3dc; display: flex; justify-content: space-between; font-size: 7.6pt; color: #8a8d95; }
  footer b { font-family: Anton; font-weight: 400; color: #0e0f12; letter-spacing: .04em; font-size: 9pt; }
</style></head>
<body><div class="page">
  <header>
    <div>
      <span class="mono">MR</span>
      <h1>${esc(p.name)}</h1>
      <p class="role">${esc(p.role)}</p>
    </div>
    <ul class="contact">
      ${contacts.map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join("")}
      <li class="loc">${esc(p.location)}</li>
    </ul>
  </header>

  <div class="body">
    <main>
      <section>
        <h2>${L.profile}</h2>
        ${c.about.paragraphs.map((t) => `<p class="intro">${esc(t)}</p>`).join("")}
      </section>
      <section>
        <h2>${L.projects}</h2>
        ${projects}
      </section>
    </main>
    <aside>
      <section>
        <h2>${L.skills}</h2>
        ${skills}
      </section>
      <section>
        <h2>${L.services}</h2>
        <ul class="plain">${c.about.services.map((s) => `<li>${esc(s.title)}</li>`).join("")}</ul>
      </section>
      <section>
        <h2>${L.process}</h2>
        <ol class="steps">${c.processSteps.map((s) => `<li>${esc(s.title)}</li>`).join("")}</ol>
      </section>
      ${X.education.length ? `<section><h2>${L.education}</h2>${list(X.education)}</section>` : ""}
      <section>
        <h2>${L.languages}</h2>
        ${list(X.languages)}
      </section>
    </aside>
  </div>

  <footer>
    <span><b>MR</b>&nbsp;&nbsp;${esc(p.name)} · <a href="${esc(site)}">${esc(host(site))}</a></span>
    <span>${L.updated}: ${esc(L.month)}</span>
  </footer>
</div></body></html>`;
}

// ---------- Generar los PDF ----------
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Falta Playwright. Instalalo una vez con:\n  npm i --no-save playwright && npx playwright install chromium",
  );
  process.exit(1);
}

mkdirSync("public/cv", { recursive: true });
const browser = await chromium.launch();
for (const [lang, file, out] of [
  ["es", "src/data/content.ts", "public/cv/Mauricio-Ricotti-CV.pdf"],
  ["en", "src/data/content.en.ts", "public/cv/Mauricio-Ricotti-CV-EN.pdf"],
]) {
  const c = await load(file);
  const page = await browser.newPage();
  const doc = html(c, lang);
  if (process.env.CV_HTML) writeFileSync(out.replace(/\.pdf$/, ".html"), doc); // para revisar el diseño
  await page.setContent(doc, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Aviso si el contenido no entra en una sola página
  const over = await page.evaluate(() => {
    const pg = document.querySelector(".page");
    return pg.scrollHeight - pg.clientHeight;
  });
  if (over > 1) console.warn(`⚠️  ${out}: el contenido se pasa ${over}px de una hoja A4 (se recorta).`);
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  await page.close();
  console.log(`✓ ${out}`);
}
await browser.close();
