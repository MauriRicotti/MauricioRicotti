import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * SEO: genera robots.txt y sitemap.xml con la dirección del sitio (VITE_SITE_URL en .env)
 * y precarga la tipografía de los títulos para que el hero no "salte" al cargar.
 */
function seo(siteUrl: string): Plugin {
  const url = siteUrl.replace(/\/+$/, "");
  return {
    name: "portfolio-seo",
    apply: "build",
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
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
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
      seo(env.VITE_SITE_URL || "https://example.com"),
      ...(single ? [viteSingleFile()] : []),
    ],
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
