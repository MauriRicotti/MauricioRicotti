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
  lib/sound.ts           ← efectos de sonido (Web Audio, sin archivos). playMetal() = "clinc" al tocar la tarjeta 3D
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

## Título del hero (rodillo)

`src/components/HeroTitle.tsx`:

- **Rodillo:** la primera parte del título (“FULL STACK”) va cambiando letra por letra por las frases de
  `roleRoll` en `content.ts` (FRONT END → BACK END) y vuelve. Cada frase debe tener la
  misma cantidad de palabras que “FULL STACK” (2). `roleRoll: []` = no cambia. Velocidad: `ROLL_EVERY`.
  Se pausa fuera de pantalla y con la pestaña oculta.
- Con “reducir movimiento” activado, el título queda quieto. Para Google y lectores de pantalla el h1
  siempre dice el rol original (`role`).

## Preguntas frecuentes: bloque con ojitos

Al final de las preguntas hay un bloque “¿No encontraste lo que buscabas?” con unos ojos que miran
a los costados y parpadean (`src/components/WanderingEyes.tsx`, basado en *Wandering eyes* de
Loading UI). Al pasar el mouse por el botón “Preguntame directo”, los ojos lo miran; el botón abre
el formulario de contacto.

- Textos: `faqSection.helpTitle`, `helpText` y `helpCta` en `content.ts` / `content.en.ts`.
- Estilos y animación: bloque “Ojos que miran” al final de `src/index.css` (solo transform; en pausa
  fuera de pantalla; quietos con “reducir movimiento”). Velocidad: `--duration` (10s por defecto).

## Fondo del hero

El fondo del hero es CSS puro (`.hero-bg` en `src/index.css`): cuadrícula que se desvanece (sin grano),
sin brillos, blur, sombras ni `mask-image` (eso bajaba los FPS al hacer scroll en celulares).
Los desvanecidos se hacen con capas de degradado del mismo color del fondo (`#0e0f12`).

- Más/menos visible la cuadrícula: cambiá el `0.045` de las dos líneas.
- Para quitar el fondo: borrá el `<div className="hero-bg" />` en `src/components/Hero.tsx`.

## Scroll

El scroll con rueda / trackpad / táctil es el **nativo del navegador** (sin suavizado extra).
Solo los links del menú y el botón "volver arriba" se desplazan con una animación corta
(`src/lib/smoothScroll.ts`). Para que salten de golpe, cambiá `behavior: "smooth"` por `"auto"`.

Las **franjas de palabras** (`Marquee.tsx`) tienen inercia: siguen al scroll con un pequeño retraso y frenan
de a poco. Ajustá `EASE` (más bajo = frenan más lento).

## Credencial 3D del hero

Tarjeta colgante interactiva (componente **Lanyard** de [React Bits](https://reactbits.dev), licencia
MIT + Commons Clause; usa `three`). Se carga aparte, después de la animación del título.

- **Ajustes:** `SETTINGS` en `src/components/HeroBadge.tsx`: `design` (`"foto"` con tu retrato o
  `"credencial"` solo tipografía), acabado, metal, gravedad, viento (`breeze`, 0 = quieta), etc.
  Tamaño: `CARD` en el mismo archivo.
- **Retrato:** `src/assets/badge-portrait.webp` (PNG/WebP con fondo transparente, vertical 3:4).
- **Diseños** (frente, dorso y cinta): `src/lib/badgeArt.ts`. El dorso muestra logo, nombre, rol y “Hablemos” (sin redes).
- **Interacción:** el lienzo cubre todo el hero y va por delante, pero deja pasar los clics
  (`passThrough`): solo atrapa el puntero sobre la tarjeta.
- **Quitarla:** borrá `<HeroBadge … />` en `Hero.tsx`, los archivos `Lanyard.tsx`, `HeroBadge.tsx`,
  `lib/badgeArt.ts` y `three` de `package.json`.
- **Arrastre con límite:** la tarjeta no se puede llevar fuera del hero (ni debajo de la franja de
  tecnologías ni cortada por los costados). Si se suelta el clic fuera de la ventana, se suelta sola.
- **Fluidez:** mientras se hace scroll la tarjeta se queda quieta (no se dibuja) y retoma el
  balanceo al parar. En pantallas de 120/144 Hz se dibuja a ~60–75 cuadros por segundo.

## SEO, favicon y vista previa al compartir

- **Dirección del sitio:** editá `VITE_SITE_URL` en `.env` (sin "/" al final) si cambiás de dominio (por defecto: `https://mauricio-ricotti.vercel.app`).
  De ahí salen la URL canónica, la imagen al compartir (`og:image`), `sitemap.xml` y `robots.txt`
  (se generan solos al compilar; ver el plugin `seo` en `vite.config.ts`).
  En Vercel también podés cargarla en *Settings → Environment Variables*.
- **Etiquetas:** título, descripción, Open Graph (WhatsApp, LinkedIn, Facebook, Discord), Twitter/X y datos
  estructurados de Google (persona + profesión) están en `index.html`.
- **Imagen al compartir:** `public/og-image.jpg` (1200×630). Reemplazala por otra del mismo tamaño si querés.
- **Favicon (logo MR):** `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`,
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

## Pantalla de carga y logo

- **Pantalla de carga** (al entrar a la web): el logo MAURTTI se arma pieza por pieza y la pantalla
  se va en franjas verticales (negras y después turquesas, como una ola; ≈2,5 s). Está **dentro de `index.html`** (bloques
  `loader:start` / `loader-markup:start`), así aparece al instante sin esperar a que cargue nada.
  - Se muestra **cada vez que se carga o recarga la página**.
  - Con "reducir movimiento" activado en el sistema no se muestra.
  - El título del hero y la credencial esperan a que las franjas empiecen a abrirse (`src/lib/loader.ts`).
- **Logo MR** en la barra (solo el logo, sin el nombre, en PC y celular): `src/components/LogoMark.tsx`.
  El mismo logo se usa en la **credencial 3D** (detrás del retrato, en el dorso y en la cinta).
  Los trazos están en un solo lugar: `src/lib/logoMR.ts`.
  Con el mouse encima, el borde y las letras se ponen turquesa.
- **Favicon e íconos:** `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png` (todos con el logo MR). Si los cambiás, subí el número
  `?v=2` de los enlaces en `index.html` (y en `site.webmanifest`) para que los navegadores no usen el viejo.
- Los dos logos en vector (para usar donde quieras): `src/assets/logo/logo-mauritti.svg` y `logo-mr.svg`.

## Footer

- Arriba: "¿Tenés una idea en mente?" con los botones Email, WhatsApp, Descargar CV y Empecemos.
- Debajo, una tarjeta oscura redondeada con 4 columnas: frase corta + ubicación, **Explorar**
  (los mismos enlaces de la barra), **Seguime** (las redes de `profile.socials`, con su ícono) y
  **Horario de atención** (con "abierto/fuera de horario" y la hora de Argentina).
- Al pie de la tarjeta, "MAURICIO RICOTTI" gigante en una línea, cortado por el borde de abajo
  (cuánto se corta: `.footer-name--cut` en `src/index.css`).
- Los textos de la tarjeta están en `footer` de `content.ts` / `content.en.ts` (`tagline`, `explore`, `follow`).

## Deploy en Vercel

1. Subí esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`; ya están en `.gitignore`).
2. En https://vercel.com → **Add New… → Project** → importá el repositorio.
3. Vercel detecta Vite solo (`vercel.json`): build `npm run build`, salida `dist`. Tocá **Deploy**.
4. Dirección del sitio: `https://mauricio-ricotti.vercel.app`. Ya viene como valor por defecto en
   `vite.config.ts`, así que funciona aunque `.env` no se suba (GitHub en la web suele omitir los
   archivos ocultos). Si cambiás de dominio, editá `VITE_SITE_URL` en `.env` o en Vercel →
   *Settings → Environment Variables*, y volvé a publicar.

**Al subir por la web de GitHub:** cada subida (commit) dispara un deploy nuevo. Si subís los archivos
en varias tandas, por unos minutos el sitio puede verse roto (sin estilos) mientras faltan archivos o
mientras se publica la siguiente tanda. Lo ideal: subir todo en una sola tanda (máximo 100 archivos
por vez), esperar a que Vercel marque *Ready* y recargar la página.

Alternativa sin GitHub: `npm i -g vercel` y, dentro de la carpeta, `vercel` (y después `vercel --prod`).

## Idiomas (español / inglés)

- `/` = español (`src/data/content.ts`) · `/en` = inglés (`src/data/content.en.ts`).
- Botón **ES | EN** en la barra (en celular, un botón con el otro idioma al lado del menú). Cambia al instante.
- `content.en.ts` solo tiene los **textos**: fotos, links, email, WhatsApp y redes se toman de `content.ts`.
  Si cambiás un texto en español, actualizá también su traducción.
- Los textos chicos de la interfaz (botones, etiquetas, mensajes del formulario) están en el bloque `ui` de cada archivo.
- Al compilar se genera `dist/en/index.html` con título, descripción y vista previa al compartir en inglés,
  y `sitemap.xml` incluye las dos versiones (con `hreflang` para Google). `vercel.json` sirve `/en` con esa página.
- Los mensajes del formulario te llegan en español; si la persona escribió desde la versión en inglés,
  el asunto empieza con **[EN]** y se agrega el campo "Idioma".

## CV descargable (PDF)

- Archivos: `public/cv/Mauricio-Ricotti-CV.pdf` (español) y `public/cv/Mauricio-Ricotti-CV-EN.pdf` (inglés).
  Los botones "Descargar CV" (hero, footer y menú del celular) bajan el del idioma actual (`profile.cvUrl`).
- Se arman solos con el **mismo contenido de la web** (perfil, proyectos, habilidades, servicios y proceso):
  `scripts/build-cv.mjs`. Si cambiás algo en `content.ts` / `content.en.ts`, regeneralos:
  ```bash
  npm i --no-save playwright && npx playwright install chromium   # solo la primera vez
  npm run cv
  ```
- Formación e idiomas extra: completalos arriba de todo en `scripts/build-cv.mjs` (bloque `EXTRA`).
- ¿Preferís usar tu propio CV? Reemplazá los PDF por los tuyos con el mismo nombre.
