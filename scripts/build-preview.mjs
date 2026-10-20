// Genera preview.html: una versión de la web en un solo archivo, con las imágenes
// incrustadas, para verla en el visor de archivos sin necesidad de un servidor.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { extname } from "node:path";

const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
let html = readFileSync("dist/index.html", "utf8");
html = html.replace(/(["'(])\/images\/([\w\-./]+\.(?:jpe?g|png|webp|svg))/g, (m, q, file) => {
  const path = `public/images/${file}`;
  if (!existsSync(path)) return m;
  const data = readFileSync(path).toString("base64");
  return `${q}data:${mime[extname(file).toLowerCase()]};base64,${data}`;
});
writeFileSync("preview.html", html);
console.log(`preview.html generado (${(html.length / 1024).toFixed(0)} KB)`);
