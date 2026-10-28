// Ejecutar después de npm run build. No requiere navegador ni servicios externos.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const output = process.argv[2] || "dist";
const read = (file) => readFileSync(`${output}/${file}`, "utf8");
const match = (html, re, label) => {
  const found = html.match(re);
  assert.ok(found, `Falta ${label}`);
  return found[1];
};
const canonicals = [];
for (const [file, lang, heading] of [
  ["index.html", "es", "TRABAJOS DESTACADOS"],
  ["en/index.html", "en", "FEATURED WORK"],
]) {
  const html = read(file);
  assert.ok(html.includes(`<html lang="${lang}">`), `${file}: idioma incorrecto`);
  assert.ok(html.includes('id="root" data-prerendered="true"'), `${file}: falta pre-render`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: se necesita un solo h1`);
  const h1 = match(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/, "h1").replace(/<[^>]*>/g, "");
  assert.ok(h1.includes("Mauricio Ricotti — FULL STACK DEVELOPER"), `${file}: h1 incompleto`);
  assert.ok(html.includes(heading), `${file}: contenido sin traducir`);
  assert.ok(html.includes("https://github.com/MauriRicotti"), "Falta GitHub real");
  assert.ok(!/%VITE_|tu-usuario|example\.com|content="noindex/.test(html), `${file}: placeholder/noindex`);
  const canonical = match(html, /rel="canonical" href="([^"]+)"/, "canonical");
  assert.ok(new URL(canonical).protocol === "https:", "La URL pública debe usar HTTPS");
  assert.equal(new URL(canonical).pathname, lang === "en" ? "/en" : "/");
  canonicals.push(canonical);
  for (const alt of ["es", "en", "x-default"]) assert.ok(html.includes(`hreflang="${alt}"`));
  const title = match(html, /<title>([^<]+)<\/title>/, "title");
  assert.ok(title.includes("Mauricio Ricotti") && title.length <= 70);
  const description = match(html, /name="description"\s+content="([^"]+)"/, "description");
  assert.ok(description.length >= 90 && description.length <= 180);
  const schema = JSON.parse(match(html, /<script id="portfolio-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/, "JSON-LD"));
  assert.equal(schema["@context"], "https://schema.org");
  const person = schema["@graph"].find((item) => item["@type"] === "Person");
  assert.ok(person.sameAs.includes("https://github.com/MauriRicotti"));
  assert.ok(schema["@graph"].some((item) => item["@type"] === "ProfilePage" && item.url === canonical));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: IDs duplicados`);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((m) => m[1]);
  for (const asset of assets) assert.ok(existsSync(`${output}${asset}`), `Falta ${asset}`);
  console.log(`✓ ${file}: HTML completo, título, descripción, canonical, idiomas, JSON-LD, links e IDs`);
}
const sitemap = read("sitemap.xml");
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]), canonicals);
const robots = read("robots.txt");
assert.ok(robots.includes(`Sitemap: ${new URL(canonicals[0]).origin}/sitemap.xml`));
assert.ok(!/Disallow:\s*\/\s*(?:\n|$)/.test(robots));
console.log("✓ sitemap.xml y robots.txt: URLs públicas coherentes y rastreo permitido");
const tokens = canonicals.map((_url, i) => (read(i ? "en/index.html" : "index.html").match(/name="google-site-verification" content="([^"]+)"/) || [])[1]);
assert.equal(tokens[0], tokens[1], "Verificación distinta entre idiomas");
console.log(tokens[0] ? "✓ Etiqueta de verificación presente en ambos idiomas" : "ℹ Search Console pendiente: configurar GOOGLE_SITE_VERIFICATION y volver a publicar");
