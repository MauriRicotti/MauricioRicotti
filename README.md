# Portfolio personal

React 19 · Vite 7 · Tailwind CSS v4 · TypeScript

## Cómo editar el contenido
**Todo el texto está en `src/data/content.ts`**: perfil, redes, proyectos, habilidades,
experiencia, contacto y footer. No hace falta tocar los componentes.

- Imágenes de proyectos: `public/images/projects/`.

## Comandos
```bash
npm install
npm run dev      # desarrollo (más lento, con recarga instantánea)
npm run live     # versión final optimizada, se reconstruye sola al guardar (puerto 5173)
npm run build    # genera dist/index.html (un solo archivo)
npm run build:preview  # genera preview.html (con imágenes incrustadas, se abre sin servidor)
```

## Estructura
```
src/
  data/content.ts        ← tus textos
  types.ts
  lib/sound.ts           ← efectos de sonido
  components/
    Header, Hero, Work, About, Footer,
    ContactModal
```

### Banda de tecnologías
Se edita en `src/data/content.ts` → `techStackTitle` y `techStack` (grupos con título e ítems).
Cada ítem tiene `name` y, opcionalmente, `icon` con la clave de un logo de `src/lib/techIcons.ts`
(react, typescript, nextjs, nodejs, postgresql, docker, etc.). Si una tecnología no tiene logo,
dejá `icon` vacío y se muestra solo el texto. Para sumar logos nuevos, importalos de
`simple-icons` en `techIcons.ts` (lista completa en https://simpleicons.org).

### Contacto
En `content.ts` → `profile`: `email`, `phone` (como se muestra) y `whatsapp` (solo dígitos,
con 549 + código de área sin 0 + número, ej. `5491141948773`). El contacto paso a paso
(`ContactFlow.tsx`, textos en `contact`) tiene las preguntas, los tipos de proyecto, los rangos de
presupuesto en pesos y los textos de ayuda. El modal anterior quedó en `ContactModal.tsx`
(para volver a usarlo, cambiá `ContactFlow` por `ContactModal` en `App.tsx`).


## Formulario de contacto: envío directo (Web3Forms)

Por defecto el botón final del contacto abre el correo del visitante con el mensaje armado (mailto).
Para que los mensajes te lleguen directo al mail, sin que el visitante salga de la web:

1. Entrá a https://web3forms.com, escribí tu email (ricottim4@gmail.com) y pedí la "Access Key" (gratis).
2. Te llega por mail. Pegala en `src/data/content.ts` → `contact.formAccessKey: "tu-clave"`.
3. Listo: el botón pasa a decir "Enviar mensaje" y el mensaje te llega con nombre, email,
   tipo de proyecto, presupuesto y la idea. Tiene un campo oculto anti-spam.

Nota: en `preview.html` (visor de Arena) no hay conexión a internet, así que el envío solo funciona
en la web publicada o en `npm run live`.

## Secciones con movimiento

- **Franjas de texto gigante** (`Marquee.tsx`): se desplazan hacia los costados con el scroll.
  Los textos están en `marqueeRows` (content.ts). Solo calculan mientras hay scroll y la sección está en pantalla.
- **Cómo trabajo** (`Process.tsx`): tarjetas que se apilan al hacer scroll (solo CSS, `position: sticky`).
  Los pasos están en `processSteps` (content.ts).

## Fondo del hero

El fondo del hero es CSS puro (`.hero-bg` en `src/index.css`): cuadrícula que se desvanece (sin grano),
sin brillos, blur, sombras ni `mask-image` (eso bajaba los FPS al hacer scroll en celulares).
Los desvanecidos se hacen con capas de degradado del mismo color del fondo (`#0e0f12`).

- Más/menos visible la cuadrícula: cambiá el `0.045` de las dos líneas.
- Para quitar el fondo: borrá el `<div className="hero-bg" />` en `src/components/Hero.tsx`.

## Scroll suave

Toda la web usa **Lenis** (`src/lib/smoothScroll.ts`, se activa en `src/main.tsx`).

- Con mouse/trackpad el scroll arranca y frena de a poco. En celulares se usa el scroll táctil nativo.
- Suavidad: `lerp` en `smoothScroll.ts` (más bajo = más suave/lento; por defecto 0.085).
- Si el sistema tiene "reducir movimiento" activado, no se activa.
- Para desactivarlo: borrá `initSmoothScroll()` en `src/main.tsx`.

Las **franjas de palabras** (`Marquee.tsx`) tienen inercia: siguen al scroll con un pequeño retraso y frenan
de a poco. Ajustá `EASE` (más bajo = frenan más lento).

## SEO, favicon y vista previa al compartir

- **Dirección del sitio:** editá `VITE_SITE_URL` en `.env` (sin "/" al final) cuando tengas el dominio real.
  De ahí salen la URL canónica, la imagen al compartir (`og:image`), `sitemap.xml` y `robots.txt`
  (se generan solos al compilar; ver el plugin `seo` en `vite.config.ts`).
  En Vercel también podés cargarla en *Settings → Environment Variables*.
- **Etiquetas:** título, descripción, Open Graph (WhatsApp, LinkedIn, Facebook, Discord), Twitter/X y datos
  estructurados de Google (persona + profesión) están en `index.html`.
- **Imagen al compartir:** `public/og-image.jpg` (1200×630). Reemplazala por otra del mismo tamaño si querés.
- **Favicon (monograma MR):** `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png` y `site.webmanifest`.
- **Probar la vista previa** después de publicar: https://www.opengraph.xyz o el "Post Inspector" de LinkedIn.
  WhatsApp guarda la vista previa en caché: si cambiás la imagen, puede tardar en actualizarse.

## Rendimiento

- `npm run build` genera archivos separados (lo que usa Vercel). `npm run build:preview` arma además
  `preview.html` en un solo archivo (`SINGLEFILE=1`).
- Imágenes de proyectos en WebP, con versión chica `-800.webp` (campo `imageSmall`) para celulares.
  En celular cada imagen se descarga recién al abrir el proyecto.
- El formulario de contacto se carga aparte, cuando el navegador queda libre.
- La sección de proyectos dibuja solo el diseño de la pantalla actual (paneles en PC, franjas en celular).
- Lighthouse (local): celular 98 · 100 · 100 · 100 — PC 100 · 100 · 100 · 100
  (rendimiento · accesibilidad · buenas prácticas · SEO).

## Deploy en Vercel

1. Subí esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`; ya están en `.gitignore`).
2. En https://vercel.com → **Add New… → Project** → importá el repositorio.
3. Vercel detecta Vite solo (`vercel.json`): build `npm run build`, salida `dist`. Tocá **Deploy**.
4. Si la dirección final no es `https://mauricioricotti.vercel.app`, cambiá `VITE_SITE_URL` en `.env`
   (o en *Settings → Environment Variables*) y volvé a publicar.

Alternativa sin GitHub: `npm i -g vercel` y, dentro de la carpeta, `vercel` (y después `vercel --prod`).
