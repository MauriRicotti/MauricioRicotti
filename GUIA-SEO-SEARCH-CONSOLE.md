# Tu portfolio en Google: guía de Search Console

**Sitio de producción:** https://mauricio-ricotti.vercel.app/  
**Versión en inglés:** https://mauricio-ricotti.vercel.app/en  
**GitHub:** https://github.com/MauriRicotti

> Primero publicá esta actualización. El preview de Arena sirve para revisar la web, pero la propiedad que tenés que verificar e indexar es la dirección pública de producción.

## 1. Qué quedó preparado en el código

- El build genera HTML completo en español e inglés: títulos, biografía, proyectos, servicios, proceso, FAQ y contacto. El contenido no espera a que React ejecute JavaScript para existir en el HTML.
- Títulos y descripciones por idioma, con tu nombre, profesión y ubicación real.
- Un `h1` accesible con tu nombre y rol; jerarquía de títulos por sección.
- Canonical y `hreflang` coherentes para `/` y `/en`. Se actualizan también al usar el selector de idioma.
- Navegación e idiomas con enlaces reales, manteniendo las animaciones de la interfaz.
- Datos estructurados `Person`, `WebSite` y `ProfilePage`, vinculados a tu GitHub e Instagram reales. No se agregan reseñas, estrellas ni datos inventados.
- `robots.txt`, `sitemap.xml`, etiquetas sociales y favicon.
- Verificación de Search Console configurable mediante `GOOGLE_SITE_VERIFICATION` al compilar.

Esto prepara el sitio para el rastreo. No significa que ya esté verificado o indexado: eso se comprueba desde tu cuenta de Search Console. Google recomienda revisar el contenido renderizado con su herramienta de inspección. [1](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript?hl=en)

## 2. Publicá la actualización

1. Actualizá el repositorio de tu portfolio con los archivos del proyecto. No subas `node_modules`, `dist` ni `preview.html`.
2. Esperá a que el deploy de producción termine en **Ready**.
3. Comprobá estas cuatro direcciones en una ventana privada, sin iniciar sesión en el hosting:
   - https://mauricio-ricotti.vercel.app/
   - https://mauricio-ricotti.vercel.app/en
   - https://mauricio-ricotti.vercel.app/robots.txt
   - https://mauricio-ricotti.vercel.app/sitemap.xml
4. En la página principal usá **Ver código fuente**: buscá `Mauricio Ricotti`, `TRABAJOS DESTACADOS` y `github.com/MauriRicotti`. Deben estar en el HTML, no solamente en el inspector de elementos.

El dominio ya viene configurado como valor por defecto. En tu hosting podés fijar explícitamente:

```text
VITE_SITE_URL=https://mauricio-ricotti.vercel.app
```

## 3. Agregá la propiedad correcta

1. Entrá con tu cuenta de Google en https://search.google.com/search-console/.
2. Elegí **Añadir propiedad**.
3. Elegí **Prefijo de la URL**.
4. Pegá exactamente:

```text
https://mauricio-ricotti.vercel.app/
```

Para esta dirección alojada en `vercel.app`, usá el prefijo y la verificación HTML: no necesitás gestionar el DNS de `vercel.app`. Si más adelante comprás un dominio propio y controlás su DNS, podés crear una propiedad de dominio y verificarla con el registro que te indique Google. La verificación con etiqueta HTML corresponde a propiedades de prefijo de URL. [2](https://support.google.com/webmasters/answer/9008080?hl=es)

## 4. Verificá con la etiqueta HTML

1. Abrí **Otros métodos de verificación → Etiqueta HTML**.
2. Google te mostrará algo con esta estructura; el valor real lo genera Google para tu cuenta:

```html
<meta name="google-site-verification" content="VALOR_QUE_TE_DA_GOOGLE" />
```

3. Copiá **solo el texto dentro de `content="…"`**.
4. En tu proyecto de Vercel: **Settings → Environment Variables**.
5. Creá la variable `GOOGLE_SITE_VERIFICATION` y pegá ese valor, sin comillas ni la etiqueta completa. Aplicala al entorno **Production**.
6. Guardá y hacé un nuevo **Redeploy** de producción. Una variable nueva no modifica el HTML de un deploy ya publicado.
7. Cuando termine, abrí el código fuente público y buscá `google-site-verification`. Debe aparecer dentro de `<head>` con el valor exacto.
8. Volvé a Search Console y presioná **Verificar**.

**Alternativa:** podés pasarme la etiqueta que te dio Google para incorporarla al proyecto. Es una etiqueta pública de verificación; no necesito tu contraseña, códigos de acceso ni sesión de Google.

No borres la etiqueta ni la variable después de verificar: Google puede volver a comprobarla. [2](https://support.google.com/webmasters/answer/9008080?hl=es)

## 5. Enviá el sitemap

Ya dentro de la propiedad:

1. Abrí **Sitemaps** en el menú lateral.
2. En **Añadir un sitemap**, escribí `sitemap.xml` si el campo ya muestra el dominio.
3. Si te pide la dirección completa, usá:

```text
https://mauricio-ricotti.vercel.app/sitemap.xml
```

4. Presioná **Enviar** y revisá que se procese correctamente.

El sitemap contiene dos páginas: `/` y `/en`. `#work`, `#about`, `#process`, `#faq` y `#contact` son secciones de la misma página, no páginas independientes para enviar. Google permite descubrir páginas sin sitemap, pero enviarlo ayuda a su descubrimiento y permite controlar su procesamiento. [2](https://developers.google.com/search/docs/monitor-debug/search-console-start)

## 6. Inspeccioná las dos páginas

En la barra de inspección de arriba, hacé esto para cada URL:

- `https://mauricio-ricotti.vercel.app/`
- `https://mauricio-ricotti.vercel.app/en`

1. Pegá la URL completa.
2. Usá **Probar URL publicada**.
3. Revisá que Google pueda obtenerla y que no haya un bloqueo de rastreo o indexación.
4. En **Ver página probada**, revisá HTML/captura y recursos disponibles.
5. Si la prueba permite indexarla, tocá **Solicitar indexación**. [1](https://support.google.com/webmasters/answer/9012289?hl=es)

Que la prueba sea correcta no garantiza que se indexe ni una posición determinada. El proceso puede tardar; no hace falta repetir la solicitud todos los días. [2](https://support.google.com/webmasters/answer/9012289?hl=en)

## 7. Qué revisar después

- **Indexación → Páginas:** verificá el estado de las URLs canónicas y los motivos de exclusión que aparezcan.
- **Rendimiento → Resultados de búsqueda:** revisá impresiones, clics, consultas y páginas. Al principio puede no haber datos suficientes. Estos informes son los recomendados para supervisar el sitio. [2](https://developers.google.com/search/docs/monitor-debug/search-console-start)
- Como próxima mejora de contenido, prepará casos de estudio reales para tus proyectos: problema, solución, tecnologías y resultado, sin inventar métricas.
- En tu perfil público de GitHub agregá el portfolio como sitio web. No se modificó tu cuenta desde acá.

## Si algo falla

| Mensaje / síntoma | Qué revisar |
| --- | --- |
| No encuentra la etiqueta | El deploy nuevo debe estar publicado; el valor tiene que coincidir y estar en `<head>`, en la URL de producción. |
| Sitemap no se pudo obtener | Abrí su URL pública; no debe pedir contraseña ni devolver HTML de la portada. |
| Página bloqueada | Revisá `robots.txt`, una posible directiva `noindex` o protección de acceso en el hosting. |
| Google no reconoce la URL | Probá la URL publicada y solicitá indexación. |
| Aparece otra canonical | Compará la URL declarada con la elegida por Google en la inspección. |

La verificación y las causas de fallo están documentadas en la ayuda oficial. [2](https://support.google.com/webmasters/answer/9008080?hl=es) La inspección explica los estados de rastreo, canonical e indexación. [1](https://support.google.com/webmasters/answer/9012289?hl=es)

## Comprobación técnica local (opcional)

```bash
npm ci
npm run check
```

El comando valida TypeScript, genera las dos versiones y comprueba HTML completo, metadatos, JSON-LD, URLs del sitemap, enlaces, IDs y recursos locales. Si la verificación aún no está configurada lo informa como pendiente, no como un error del build.
