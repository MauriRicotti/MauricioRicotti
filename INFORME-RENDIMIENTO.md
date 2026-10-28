# Rendimiento móvil · 3D conservado

**Fecha:** 28 de octubre de 2026. **Estado:** nitidez corregida después de la primera optimización; pendiente de publicar y medir de nuevo.

> **Corrección de calidad:** el DPR de 0,65–1x y las texturas reducidas se veían borrosos. Se retiraron: la versión actual usa caras de 1024 × 1440, cinta de 192px, anisotropía hasta 8x y DPR real hasta 2x, sin reducir la resolución por el área del hero. Se mantienen los materiales livianos, la entrega directa de lienzos, la preparación oculta y los límites de cuadros. Los números históricos de abajo corresponden a la optimización anterior; no se presentan como resultados de esta corrección.

## Qué se mantuvo

La credencial sigue siendo 3D real: aparece automáticamente, cae, se balancea con el viento, se arrastra y gira al tocarla. No se reemplazó por una imagen ni se agregó un botón para activarla. Se conservaron el diseño del hero, DEVELOPER rojo, los brillos sutiles, la sombra suave, el footer nativo y los dos idiomas.

## Cambios aplicados

- **Perfil móvil / GPU por software:** iluminación Phong/Lambert con un pequeño entorno de reflejos. Evita generar PMREM y calcular materiales físicos complejos en esas pantallas. En una GPU de escritorio se mantiene el acabado físico; holográfico/metálico también conservan sus materiales completos.
- **Shader holográfico:** solo se añade si se utiliza ese acabado; antes también se inyectaba en glossy con intensidad cero.
- **Arte sin ida y vuelta a PNG:** los lienzos se entregan directamente a Three.js, sin `toDataURL()` y sin volver a cargar/decodificar esas tres imágenes. El contenido sigue generándose con las tipografías, el retrato y los textos del portfolio.
- **Menos geometría y trabajo en móvil:** menos muestras en la cinta y objetivo de aproximadamente 30 fps. Se recuperaron la resolución de las caras, la cinta y la densidad de píxeles; no se cambió el sistema de física, la caída ni la interacción.
- **Preparación por etapas:** se cede al navegador entre las subidas de texturas y se preparan los shaders antes de revelar la tarjeta.
- **Pausa y recuperación:** se cancelan los cuadros al salir de pantalla; si se pierde el contexto, el canvas se oculta y se prepara de nuevo antes de mostrarse.
- **OffBeat responsive:** imagen WebP adicional de 400px, aproximadamente 26 KiB en vez de 72 KiB cuando corresponde a la pantalla. `srcset` permite conservar el original en pantallas que requieren más resolución.

La adaptación usa tamaño de pantalla, puntero táctil y, si el navegador lo permite, renderer gráfico. **No se detecta Lighthouse ni Googlebot para mostrarles una web distinta.** Tampoco se demora artificialmente el 3D hasta después de la auditoría.

## El informe público original

Informe facilitado por Mauricio: [PageSpeed móvil](https://pagespeed.web.dev/analysis/https-mauricio-ricotti-vercel-app/0lw7u669k1?form_factor=mobile&hl=es).

- Rendimiento **51**; accesibilidad, prácticas recomendadas y SEO **100**.
- TBT **20.043 ms**; LCP **3,001 s**; CLS **0,001**.
- El módulo Lanyard acumulaba **37,436 s de CPU** de unos 40,5 s del hilo principal. Predominaba la categoría “Other”, no la descarga ni el parseo de JavaScript.

**Este sigue siendo un resultado histórico de la versión anterior; no es una medición de este paquete.** No hubo despliegue en la cuenta del usuario desde esta conversación.

## Comparación local histórica · anterior a la corrección de nitidez

Lighthouse **12.8.2**, Chromium **156.0.8078.4**, misma máquina y servidor con gzip, viewport móvil **412 × 823**, DPR emulado **1,75**, slow 4G simulada (RTT 150ms, 1638,4kbps), CPU ×1,2 y GPU SwiftShader. Cada auditoría abrió un navegador/perfil nuevo. Se conservaron los archivos compilados anteriores en una copia independiente.

La base de comparación usa la **mediana de tres corridas anteriores**, sin compilaciones ni otras pruebas de navegador simultáneas. La columna derecha corresponde a la **auditoría de la optimización anterior, antes de corregir la nitidez**, no a la versión actual ni a una mediana inventada. Una primera corrida de preparación, con tareas de configuración simultáneas, quedó fuera de esta comparación.

| Métrica local | Antes: mediana de 3 | Optimización anterior: 1 corrida |
|---|---:|---:|
| Rendimiento | 59 | 71 |
| TBT / bloqueo acumulado | 3.120 ms | 804 ms |
| Trabajo total del hilo principal | 5,00 s | 2,62 s |
| Primera pintura de contenido | 1,69 s | 1,70 s |
| LCP | 3,37 s | 3,26 s |
| CLS | 0,0047 | 0,0047 |
| Accesibilidad / buenas prácticas / SEO | 100 / 100 / 100 | 100 / 100 / 100 |

En esta comparación el bloqueo bajó aproximadamente **74%** y el trabajo del hilo principal aproximadamente **48%**. En las iteraciones optimizadas, el rendimiento local osciló entre **70 y 73**, y el TBT entre **704 y 804ms**. Son datos de laboratorio, no una garantía para todos los teléfonos. Los tamaños de JavaScript no bajaron sustancialmente: el objetivo principal fue reducir el costo de preparar y dibujar la escena, no maquillar el tamaño del bundle.

Además se midió el renderizado durante una ventana fija de ocho segundos, con la tarjeta visible, no solo la carga: aproximadamente **6 fps antes y 21 fps con el perfil liviano** en esta GPU por software. En ambas versiones hubo **0 cuadros al estar fuera de pantalla** y **0 subidas de texturas / compilaciones de shader con la tarjeta visible** durante esa prueba. Ese FPS no representa el de un celular físico y el límite de 30 fps es un objetivo, no una promesa.

Los resúmenes numéricos están en `mediciones/rendimiento.json`. Los informes históricos completos de una corrida original y de la primera optimización están en `mediciones/antes.lighthouse.json` y `mediciones/despues.lighthouse.json`.

## Validaciones realizadas

- TypeScript, compilación de producción y `npm run check`.
- HTML pre-renderizado ES/EN, canonical, hreflang, JSON-LD, GitHub real, sitemap y etiqueta de Search Console conservados.
- Cuatro escenarios sin JavaScript: ES/EN, móvil/escritorio.
- Navegación, proyectos, FAQ y formulario; credencial automática, arrastre y giro.
- Perfil físico de escritorio, perfil móvil, movimiento reducido y navegador sin WebGL (sin romper el resto del sitio).
- Cambio de idioma y recuperación forzada del contexto gráfico.
- Vista previa independiente, imágenes incluidas y funcionamiento sin conexión.

No se enviaron formularios ni se efectuaron solicitudes de indexación, cambios de cuenta o despliegues.

## Corrección posterior: tarjeta nítida

La versión actual deja de reducir la resolución por el tamaño del hero. En una pantalla de DPR 2:

| Control | Versión borrosa | Corrección actual |
|---|---:|---:|
| Texturas de frente y dorso | 512 × 720 | 1024 × 1440 |
| Ancho de textura de cinta | 96px | 192px |
| Canvas móvil (CSS 412 × 682) | 412 × 682 | 824 × 1364 |
| Canvas escritorio (CSS 1280 × 800, GPU por software) | 832 × 520 | 2560 × 1600 |

Se compararon capturas al mismo tamaño y se validó el framebuffer en pantallas de DPR 1, 2 y 3 (límite de render 2x). No hubo subidas de texturas ni compilaciones de shaders con la tarjeta visible en esos controles. Se volvieron a comprobar la caída automática, el arrastre táctil, el giro al tocar, la recuperación de contexto y los idiomas ES/EN. El detalle está en `mediciones/nitidez.json`.

Recuperar los píxeles aumenta el trabajo gráfico respecto de la versión borrosa. Se mantienen las otras optimizaciones, pero **no se atribuyen a esta corrección el puntaje ni los FPS históricos**: hacen falta mediciones nuevas para cuantificar ese equilibrio.

## Ajuste posterior: prioridad al loader · 28 de octubre de 2026

El loader conserva el vector, los colores y la cortina. El reloj de la animación
empieza tras un primer pintado; las letras se ensamblan antes para dejar unos
0,4 s con el logo completo. Se retira sin esperar a WebGL. La importación del 3D,
el dibujo de las caras y la precarga automática del formulario ocurren después
de quitarlo y ceder un pintado al navegador. El título usa la apertura real de
la cortina y la tarjeta sigue cayendo automáticamente cuando está preparada.
En teléfonos lentos la tarjeta puede aparecer más tarde; no se reduce su nitidez.

Se comprobó el orden en Chromium local (móvil ES con CPU ×4; móvil EN y escritorio
ES con CPU ×1): antes había inicialización WebGL con el loader activo; en los
casos actualizados no. Las 26 piezas estaban completamente visibles durante la
pausa del logo. Se repitieron los diez casos funcionales (ES/EN, sin JS, arrastre,
giro, recuperación de contexto, escritorio, movimiento reducido y sin WebGL),
y cinco escenarios de fallo/cancelación. No hubo errores de página ni subidas
de texturas o compilaciones con la tarjeta visible en esos controles.

La franja central ahora usa el acento; las otras dos y su movimiento no cambian.
No se agrega el logo a «De la idea al deploy»: esa ubicación fue descartada.
`Lanyard.tsx`, `badgeArt.ts`, el CSS general, About, Header, Footer y ambos CV
conservan los mismos bytes. Evidencia resumida: `mediciones/entrada.json`.

**No es un nuevo puntaje PageSpeed, una comparación estadística de velocidad,
ni una medición del celular del usuario.** Sigue pendiente comprobarlo en su
teléfono tras publicar. No hubo despliegue público.

## Después de publicarlo

1. Subir los archivos actualizados al proyecto que se despliega y generar un nuevo deploy de producción. Un redeploy del código anterior no incorpora estos cambios.
2. Volver a medir la URL pública en PageSpeed, móvil, idealmente tres veces y comparar medianas. Conservar la URL del nuevo informe.
3. Probar en un celular real la caída inicial, el giro, el arrastre y el scroll hasta el footer.

El PageSpeed público anterior usó otra versión de Lighthouse/Chrome y otra infraestructura; **no corresponde afirmar que el 51 público pasó a 71** por esta comparación local. El resultado público nuevo solo se conocerá después de desplegar y medir. Tampoco hay garantía de 90+, de indexación o de posicionamiento.
