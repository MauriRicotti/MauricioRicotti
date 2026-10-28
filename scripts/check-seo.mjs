// Ejecutar después de npm run build. No requiere navegador ni servicios externos.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

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
  const expectedCv = `/cv/Mauricio-Ricotti-CV${lang === "en" ? "-EN" : ""}.pdf`;
  const cvLinks = [...html.matchAll(/href="(\/cv\/[^"]+\.pdf(?:\?[^"]*)?)"/g)].map((m) => m[1]);
  assert.ok(cvLinks.length >= 3, `${file}: faltan botones de descarga del CV`);
  for (const href of cvLinks) {
    const url = new URL(href, canonical);
    assert.equal(url.pathname, expectedCv, `${file}: CV del idioma incorrecto`);
    const version = url.searchParams.get("v");
    assert.ok(version, `${file}: falta versión del CV para evitar caché vieja`);
    assert.ok(existsSync(`${output}${url.pathname}`), `Falta ${url.pathname}`);
    const pdf = readFileSync(`${output}${url.pathname}`);
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-", `${file}: PDF inválido`);
    if (/^[a-f0-9]{10}$/.test(version)) {
      assert.equal(createHash("sha256").update(pdf).digest("hex").slice(0, 10), version, `${file}: regenerar CV o renovar su versión`);
    }
  }
  console.log(`✓ ${file}: HTML completo, metadatos, JSON-LD, links e IDs; CV correcto y versionado`);
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
