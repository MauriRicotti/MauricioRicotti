import path from "path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { jsonLd, pageSeo, structuredData } from "./src/lib/seo";

const escapeAttribute = (s: string) => s
  .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** El mismo contenido y metadatos en el HTML servido y en React: sin cloaking. */
function localizedHtml(html: string, lang: "es" | "en", url: string) {
  const meta = pageSeo(lang, url);
  const replaceContent = (key: string, value: string) => {
    const re = new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*`);
    if (!re.test(html)) throw new Error(`[seo] Falta la meta ${key}`);
    html = html.replace(re, (_all, prefix) => `${prefix}${escapeAttribute(value)}`);
  };
  html = html.replace(/<html lang="[^"]+">/, `<html lang="${lang}">`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttribute(meta.title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*/, (_all, prefix) => `${prefix}${meta.canonical}`);
  replaceContent("description", meta.description);
  replaceContent("og:title", meta.title);
  replaceContent("og:description", meta.description);
  replaceContent("og:url", meta.canonical);
  replaceContent("og:locale", meta.locale);
  replaceContent("og:locale:alternate", meta.alternateLocale);
  replaceContent("twitter:title", meta.title);
  replaceContent("twitter:description", meta.description);
  html = html.replace(
    /(<script id="portfolio-schema" type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
    (_all, start, end) => `${start}${jsonLd(structuredData(lang, url))}${end}`,
  );
  return html;
}

/** Prerender ES/EN + sitemap/robots + verificación opcional de Search Console. */
function seo(siteUrl: string, single: boolean, verification: string): Plugin {
  const url = siteUrl.replace(/\/+$/, "");
  let root = process.cwd();
  let outDir = "dist";
  return {
    name: "portfolio-seo",
    apply: "build",
    configResolved(cfg) {
      root = cfg.root;
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    async closeBundle() {
      if (single) return;
      const template = readFileSync(path.join(outDir, "index.html"), "utf8");
      // Vite transforma el mismo JSX para Node. No corre navegador ni WebGL en el build.
      const server = await createServer({
        root,
        configFile: false,
        plugins: [react()],
        server: { middlewareMode: true, watch: null },
        appType: "custom",
        logLevel: "error",
      });
      try {
        const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
        for (const lang of ["es", "en"] as const) {
          const html = localizedHtml(template, lang, url).replace(
            '<div id="root"></div>',
            () => `<div id="root" data-prerendered="true">${render(lang)}</div>`,
          );
          if (!html.includes('data-prerendered="true"')) {
            throw new Error("[seo] No se pudo insertar el HTML pre-renderizado.");
          }
          const dir = lang === "en" ? path.join(outDir, "en") : outDir;
          mkdirSync(dir, { recursive: true });
          writeFileSync(path.join(dir, "index.html"), html);
        }
        console.log("[seo] HTML completo generado: / (ES) y /en (EN)");
      } finally {
        await server.close();
      }
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        // No se inventa un lastmod con la fecha de cada deploy.
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...[`${url}/`, `${url}/en`].map((loc) => [
            '  <url>',
            `    <loc>${loc}</loc>`,
            `    <xhtml:link rel="alternate" hreflang="es" href="${url}/" />`,
            `    <xhtml:link rel="alternate" hreflang="en" href="${url}/en" />`,
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${url}/" />`,
            '  </url>',
          ].join("\n")),
          '</urlset>',
          '',
        ].join("\n"),
      });
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        html = localizedHtml(html, "es", url);
        if (verification.trim()) {
          html = html.replace("</title>", `</title>\n    <meta name="google-site-verification" content="${escapeAttribute(verification.trim())}" />`);
        }
        // Precarga local de la tipografía del hero (no depende de Google Fonts/CDN).
        const font = Object.keys(ctx.bundle ?? {}).find((f) => /anton-latin-400-normal.*\.woff2$/.test(f));
        if (font) html = html.replace("</title>", `</title>\n    <link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin />`);
        return html;
      },
    },
  };
}

// El preview de Vite no lee vercel.json; sirve /en con el mismo HTML que producción.
const previewRoutes: Plugin = {
  name: "portfolio-preview-routes",
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (/^\/en\/?(?:\?|$)/.test(req.url || "")) {
        req.url = req.url!.replace(/^\/en\/?/, "/en/index.html");
      }
      next();
    });
  },
};

const DEFAULT_SITE_URL = "https://mauricio-ricotti.vercel.app";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Dominio estable de producción, nunca el dominio temporal de un preview de Vercel.
  const siteUrl = (
    env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, "");
  const parsed = new URL(siteUrl);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.search || parsed.hash || parsed.pathname !== "/") {
    throw new Error("VITE_SITE_URL debe ser el origen público del sitio, sin rutas, parámetros ni fragmentos.");
  }
  process.env.VITE_SITE_URL = siteUrl;
  const single = process.env.SINGLEFILE === "1";
  return {
    plugins: [
      previewRoutes,
      react(),
      tailwindcss(),
      seo(siteUrl, single, env.GOOGLE_SITE_VERIFICATION || ""),
      ...(single ? [viteSingleFile()] : []),
    ],
    build: { chunkSizeWarningLimit: 600 },
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    server: { host: "0.0.0.0", allowedHosts: true },
    preview: { host: "0.0.0.0", allowedHosts: true },
  };
});
