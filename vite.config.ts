import path from "path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { seo as seoEn } from "./src/data/content.en";

/** Arma la página /en (dist/en/index.html) a partir de la página en español,
 *  con título, descripción y vista previa al compartir en inglés. */
function englishHtml(html: string, url: string) {
  const rep = (re: RegExp, to: string) => {
    if (!re.test(html))
      throw new Error(`[seo] No se encontró ${re} en index.html`);
    html = html.replace(re, to);
  };
  const desc = seoEn.description.replace(/"/g, "&quot;");
  rep(/<html lang="es">/, '<html lang="en">');
  rep(/<title>[^<]*<\/title>/, `<title>${seoEn.title}</title>`);
  rep(/(<meta\s+name="description"\s+content=")[^"]*/, `$1${desc}`);
  rep(/(<link rel="canonical" href=")[^"]*/, `$1${url}/en`);
  rep(/(<meta property="og:locale" content=")es_AR/, "$1en_US");
  rep(/(<meta property="og:locale:alternate" content=")en_US/, "$1es_AR");
  rep(/(<meta property="og:title" content=")[^"]*/, `$1${seoEn.title}`);
  rep(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${desc}`);
  rep(/(<meta property="og:url" content=")[^"]*/, `$1${url}/en`);
  rep(/(<meta name="twitter:title" content=")[^"]*/, `$1${seoEn.title}`);
  rep(/(<meta\s+name="twitter:description"\s+content=")[^"]*/, `$1${desc}`);
  rep(/"Desarrollo web"/, '"Web development"');
  return html;
}

/**
 * SEO: genera robots.txt y sitemap.xml con la dirección del sitio (VITE_SITE_URL en .env)
 * y precarga la tipografía de los títulos para que el hero no "salte" al cargar.
 */
function seo(siteUrl: string, single: boolean): Plugin {
  const url = siteUrl.replace(/\/+$/, "");
  let outDir = "dist";
  return {
    name: "portfolio-seo",
    apply: "build",
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    // Página en inglés: copia de index.html con las etiquetas traducidas
    closeBundle() {
      if (single) return;
      const html = readFileSync(path.join(outDir, "index.html"), "utf8");
      mkdirSync(path.join(outDir, "en"), { recursive: true });
      writeFileSync(
        path.join(outDir, "en", "index.html"),
        englishHtml(html, url),
      );
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...[
            [`${url}/`, "1.0"],
            [`${url}/en`, "0.9"],
          ].map(([loc, pr]) =>
            [
              `  <url>`,
              `    <loc>${loc}</loc>`,
              `    <xhtml:link rel="alternate" hreflang="es" href="${url}/" />`,
              `    <xhtml:link rel="alternate" hreflang="en" href="${url}/en" />`,
              `    <lastmod>${today}</lastmod>`,
              `    <changefreq>monthly</changefreq>`,
              `    <priority>${pr}</priority>`,
              `  </url>`,
            ].join("\n"),
          ),
          `</urlset>`,
          ``,
        ].join("\n"),
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        // Precarga de la tipografía Anton (solo en la versión de archivos separados)
        const font = Object.keys(ctx.bundle ?? {}).find((f) =>
          /anton-latin-400-normal.*\.woff2$/.test(f),
        );
        if (!font) return html;
        return html.replace(
          "</title>",
          `</title>\n    <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin />`,
        );
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // SINGLEFILE=1 → todo en un solo index.html (lo usa `npm run build:preview` para preview.html).
  // Normal (Vercel) → archivos separados, que el navegador puede guardar en caché.
  const single = process.env.SINGLEFILE === "1";
  return {
    plugins: [
      react(),
      tailwindcss(),
      seo(env.VITE_SITE_URL || "https://example.com", single),
      ...(single ? [viteSingleFile()] : []),
    ],
    // La tarjeta 3D (three.js) va en su propio archivo y se carga después; es esperable que pese ~530 KB.
    build: { chunkSizeWarningLimit: 600 },
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
