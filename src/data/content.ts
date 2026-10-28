/**
 * ============================================================
 *  CONTENIDO DEL PORTFOLIO
 * ============================================================
 *  Todos los textos del sitio están en este archivo.
 *  Para personalizar el portfolio con tus datos, editá solo esto:
 *  no hace falta tocar los componentes.
 *
 *  🌐 VERSIÓN EN INGLÉS: está en content.en.ts. Si cambiás un texto acá,
 *     cambiá también su traducción allá. Las fotos, links y datos de contacto
 *     se toman de este archivo (no hace falta repetirlos).
 * ============================================================
 */
import type { Profile, Project, TechGroup } from "../types";

/* ------------------------------------------------------------------ */
/*  1. PERFIL — nombre, rol, bio, foto y contacto                     */
/* ------------------------------------------------------------------ */
export const profile: Profile = {
  name: "Mauricio Ricotti",
  // Texto gigante del hero. Corto = más impacto (2–3 palabras).
  role: "FULL STACK DEVELOPER",
  // Rodillo del hero: la primera parte del título va cambiando por estas frases (y vuelve).
  // Cada una con la MISMA cantidad de palabras que "FULL STACK" (2). Dejá [] para que no cambie.
  roleRoll: ["FRONT END", "BACK END"],
  leftBio:
    "Desarrollo aplicaciones web de **punta a punta**: desde interfaces rápidas y cuidadas hasta *APIs*, *bases de datos* y el *deploy* en producción.",
  centerBio:
    "Trabajo con **HTML**, **CSS**, **JavaScript**, **React** y **Node.js** para construir sitios y aplicaciones *rápidos, claros y fáciles de mantener*, con foco en la experiencia de usuario.",
  ctaText: "HABLEMOS",
  email: "ricottim4@gmail.com",
  phone: "+54 11 4194-8773",
  whatsapp: "5491141948773", // para el link de WhatsApp (wa.me)
  location: "Florencio Varela, Buenos Aires · Remoto",
  // Horario de atención (días: 0 = domingo … 6 = sábado; sin "from/to" = cerrado)
  hours: [
    {
      label: "Lunes a viernes",
      days: [1, 2, 3, 4, 5],
      from: "09:00",
      to: "18:00",
    },
    { label: "Sábados", days: [6], from: "10:00", to: "14:00" },
    { label: "Domingos", days: [0] },
  ],
  socials: [
    { label: "Email", url: "mailto:ricottim4@gmail.com" },
    { label: "GitHub", url: "https://github.com/MauriRicotti" },
    { label: "WhatsApp", url: "https://wa.me/5491141948773" },
    { label: "Instagram", url: "https://www.instagram.com/mauri._r" },
  ],
  // CV en PDF (está en public/cv/). La versión en inglés usa su propio archivo.
  cvUrl: "/cv/Mauricio-Ricotti-CV.pdf?v=ef0b845c8b",
};

/* ------------------------------------------------------------------ */
/*  2. NAVEGACIÓN                                                     */
/* ------------------------------------------------------------------ */
export const navLinks = [
  { label: "Proyectos", id: "work" },
  { label: "Sobre mí", id: "about" },
  { label: "Proceso", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "Contacto", id: "contact" }, // abre el formulario de contacto
];

/* ------------------------------------------------------------------ */
/*  3. STACK TECNOLÓGICO — banda debajo del hero                       */
/*     icon = clave del logo (ver src/lib/techIcons.ts). Es opcional.  */
/* ------------------------------------------------------------------ */
export const techStackTitle: string = "Stack tecnológico";

export const techStack: TechGroup[] = [
  {
    title: "Frontend",
    items: [
      { name: "HTML5", icon: "html5" },
      { name: "CSS3", icon: "css" },
      { name: "JavaScript", icon: "javascript" },
      { name: "React", icon: "react" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Bootstrap", icon: "bootstrap" },
    ],
  },
  {
    title: "Backend & CMS",
    items: [
      { name: "Node.js", icon: "nodejs" },
      { name: "WordPress", icon: "wordpress" },
      { name: "Bases de datos" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "VS Code" },
      { name: "Figma", icon: "figma" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    title: "Web",
    items: [
      { name: "SEO" },
      { name: "Responsive" },
      { name: "Velocidad de carga" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  4. PROYECTOS                                                      */
/* ------------------------------------------------------------------ */
export const workSection = {
  title: "TRABAJOS DESTACADOS",
  /** Segundos que se muestra cada proyecto antes de pasar al siguiente (0 = sin pase automático) */
  autoplaySeconds: 6,
};

/*
 * Cada proyecto:
 *  - name:     nombre corto (es el que se ve en vertical en la tarjeta cerrada)
 *  - subtitle: qué es, en pocas palabras
 *  - tags:     tecnologías usadas
 *  - image:    captura en public/images/projects/ (ideal horizontal, 1600×1000 aprox.)
 *  - demoUrl / githubUrl: opcionales (si no los ponés, no aparece el botón)
 * El orden de la lista es el orden en pantalla; el primero arranca abierto.
 */
export const projects: Project[] = [
  {
    // App estrella. TODO: reemplazar descripción/tecnologías por las reales.
    // Captura vertical en public/images/projects/offbeat.webp (para cambiarla, reemplazá ese
    // archivo). Si dejás image: "", se muestra una pantalla de reproductor de ejemplo hecha en código.
    id: "offbeat",
    name: "OffBeat",
    subtitle: "Reproductor de música local, offline y gratuito para celulares",
    category: "App móvil",
    type: "mobile",
    highlight: "App estrella",
    description:
      "Mi proyecto más completo: una app para escuchar la música guardada en tu teléfono, sin conexión a internet, sin cuentas y gratis. Pensada para ser rápida, simple y agradable de usar todos los días.",
    tags: ["App móvil", "100% offline", "Gratuita"],
    image: "/images/projects/offbeat.webp",
    imageSmall: "/images/projects/offbeat-400.webp",
    // downloadUrl: "https://play.google.com/store/apps/details?id=...",
  },
  {
    id: "empa-market",
    name: "Empa-Market",
    subtitle: "Tienda de empanadas artesanales con pedidos por WhatsApp",
    category: "Tienda online",
    description:
      "Tienda online con un flujo de compra optimizado, filtros de productos y un diseño enfocado en la conversión y la usabilidad.",
    tags: ["HTML5", "CSS3", "JavaScript"],
    image: "/images/projects/empa-market.webp",
    imageSmall: "/images/projects/empa-market-800.webp",
    demoUrl: "https://empa-market.vercel.app/",
  },
  {
    id: "fotocopiado-unaj",
    name: "Fotocopiado UNAJ",
    subtitle: "Sistema para los centros de fotocopiado de la universidad",
    category: "Software",
    description:
      "Aplicación web a medida con panel de administración y acceso por centro de fotocopiado (Salud, Sociales, Ingeniería y HEC). Diseño modular y rendimiento optimizado.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Base de datos"],
    image: "/images/projects/fotocopiado-unaj.webp",
    imageSmall: "/images/projects/fotocopiado-unaj-800.webp",
  },
  {
    id: "oklahoma-studio",
    name: "Oklahoma Studio",
    subtitle: "Web para barbería profesional",
    category: "Landing page",
    description:
      "Web moderna para una barbería profesional, con un diseño cuidado enfocado en la calidad y en transmitir una experiencia premium.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    image: "/images/projects/oklahoma-studio.webp",
    imageSmall: "/images/projects/oklahoma-studio-800.webp",
    demoUrl: "https://oklahoma-studio.vercel.app/",
  },
  {
    id: "vaultmail",
    name: "VaultMail",
    subtitle: "Gestor seguro de correos y contraseñas",
    category: "Software",
    description:
      "Gestor de credenciales para guardar y administrar correos y contraseñas de forma protegida, con categorías, favoritos, búsqueda e importación y exportación de datos.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    image: "/images/projects/vaultmail.webp",
    imageSmall: "/images/projects/vaultmail-800.webp",
    demoUrl: "https://vaultmail.vercel.app",
  },
  {
    id: "powerlab-gym",
    name: "PowerLab GYM",
    subtitle: "Web para gimnasio",
    category: "Landing page",
    description:
      "Sitio para un gimnasio con diseño moderno, enfocado en el rendimiento y con secciones claras para presentar servicios, planes y entrenadores.",
    tags: ["HTML5", "CSS3", "JavaScript"],
    image: "/images/projects/powerlab-gym.webp",
    imageSmall: "/images/projects/powerlab-gym-800.webp",
    demoUrl: "https://powerlab-gamma.vercel.app/",
  },
  {
    id: "becas-unaj",
    name: "Becas UNAJ",
    subtitle: "Sistema de becas de fotocopias para estudiantes",
    category: "Software",
    // ⚠️ Descripción armada a partir de la captura: revisala
    description:
      "Sistema para administrar las becas de fotocopias de los estudiantes de la UNAJ: registro y búsqueda de estudiantes, control de carillas usadas y restantes, impresiones por turno e historial.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Base de datos"],
    image: "/images/projects/becas-unaj.webp",
    imageSmall: "/images/projects/becas-unaj-800.webp",
  },
];

/* ------------------------------------------------------------------ */
/*  5. SOBRE MÍ                                                       */
/* ------------------------------------------------------------------ */
export const about = {
  title: "DE LA IDEA AL DEPLOY",
  paragraphs: [
    "Soy Mauricio, desarrollador full stack. Me gusta tomar un problema de punta a punta: entender qué necesita el negocio, diseñar la arquitectura y construir cada capa, desde la interfaz hasta la base de datos.",
    "Escribo código prolijo y fácil de mantener, cuido el rendimiento y el SEO, y no doy un proyecto por terminado hasta que está online y funcionando bien.",
  ],
  // Lista numerada de la derecha: qué hacés
  services: [
    {
      title: "Landing pages",
      color: "var(--color-accent)",
      description:
        "Páginas rápidas, modernas y enfocadas en convertir. Ideales para campañas, lanzamientos y productos puntuales.",
      tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    },
    {
      title: "Sitios corporativos",
      color: "#ffd23f",
      description:
        "Webs completas y profesionales para mostrar tu empresa: servicios, equipo y contacto, con SEO básico desde el primer día.",
      tags: ["WordPress", "SEO", "Responsive"],
    },
    {
      title: "Webs de marca personal",
      color: "#ff4f7b",
      description:
        "Portfolios y sitios personales pensados para potenciar tu marca profesional y destacar tus servicios.",
      tags: ["React", "Tailwind CSS"],
    },
    {
      title: "Web apps & tiendas online",
      color: "#ff7a1a",
      description:
        "Aplicaciones y tiendas a medida: paneles de administración, bases de datos y flujos de compra listos para crecer.",
      tags: ["React", "Node.js", "Bases de datos"],
    },
    {
      title: "Mantenimiento & soporte",
      color: "#a3e635",
      description:
        "Actualizaciones, mejoras y optimizaciones para que tu sitio siga funcionando al 100% después del lanzamiento.",
      tags: ["Git", "GitHub", "Vercel"],
    },
    {
      title: "Diseño UX/UI",
      color: "#5ee7df",
      description:
        "Diseño centrado en la experiencia y la conversión, con prototipos en Figma para validar todo antes de programar.",
      tags: ["Figma", "Prototipado"],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  6b. FRANJAS DE TEXTO GIGANTE (se mueven con el scroll)            */
/* ------------------------------------------------------------------ */
// style: "solid" = letras rellenas · "band" = franja inclinada del color de acento · "outline" = solo contorno
export const marqueeRows: {
  words: string[];
  style: "solid" | "band" | "outline";
}[] = [
  { words: ["Diseño", "Código", "Deploy"], style: "solid" },
  {
    words: ["React", "Node.js", "WordPress", "Tailwind", "JavaScript", "Figma"],
    style: "band",
  },
  { words: ["Landing pages", "Tiendas online", "Web apps"], style: "outline" },
];

/* ------------------------------------------------------------------ */
/*  6c. PROCESO — tarjetas que se apilan al hacer scroll              */
/* ------------------------------------------------------------------ */
export const processSection = {
  title: "CÓMO TRABAJO",
  subtitle:
    "Cuatro pasos claros, de la primera charla hasta que tu web está online.",
};

export const processSteps = [
  {
    title: "Análisis y consulta",
    text: "Charlamos sobre tu negocio, tus objetivos y tu público. Defino el alcance, los tiempos y el presupuesto antes de empezar, sin sorpresas.",
    items: ["Reunión inicial", "Objetivos y alcance", "Presupuesto claro"],
    color: "var(--color-accent)",
  },
  {
    title: "Diseño y prototipado",
    text: "Armo la estructura y el diseño de cada sección para que lo veas y lo ajustemos juntos antes de escribir una sola línea de código.",
    items: [
      "Estructura del sitio",
      "Diseño en Figma",
      "Ajustes con tu feedback",
    ],
    color: "#ffd23f",
  },
  {
    title: "Desarrollo y optimización",
    text: "Programo el sitio con código prolijo, adaptado a celulares y optimizado para que cargue rápido y aparezca en Google.",
    items: ["Responsive", "Velocidad de carga", "SEO básico"],
    color: "#ff4f7b",
  },
  {
    title: "Lanzamiento y soporte",
    text: "Publico tu web, configuro el dominio y el hosting, y te sigo acompañando después de la entrega para que todo funcione bien.",
    items: ["Dominio y hosting", "Publicación online", "Soporte post-entrega"],
    color: "#9b8cff",
  },
];

/* ------------------------------------------------------------------ */
/*  7. CONTACTO                                                       */
/* ------------------------------------------------------------------ */
export const contact = {
  eyebrow: "// Empecemos a charlar",
  title: "CONTAME SOBRE TU PRÓXIMO PROYECTO",
  subtitle:
    "Disponible para proyectos seleccionados, consultoría de producto y colaboraciones.",
  projectTypes: [
    "Landing page",
    "Sitio corporativo",
    "Web de marca personal / portfolio",
    "Web app o tienda online",
    "Mantenimiento y actualizaciones",
    "Diseño UX/UI",
  ],
  // Rangos en pesos argentinos (ajustalos cuando quieras)
  budgets: [
    "Menos de $ 1.000.000",
    "$ 1.000.000 – $ 3.000.000",
    "$ 3.000.000 – $ 7.000.000",
    "$ 7.000.000 – $ 15.000.000",
    "Más de $ 15.000.000",
    "Todavía no lo sé",
  ],
  // Preguntas del contacto paso a paso ({name} se reemplaza por el nombre del visitante)
  questions: {
    name: "¿Cómo te llamás?",
    email: "Genial, {name}. ¿A qué email te respondo?",
    projectType: "¿Qué querés construir?",
    budget: "¿Con qué presupuesto contás?",
    message: "Contame tu idea",
  },
  messagePlaceholder: "Objetivos, plazos, referencias...",
  directText: "¿Preferís escribirme directo?",
  namePlaceholder: "Ingresa tu nombre",
  emailPlaceholder: "Ingresa tu Email",
  whatsappMessage:
    "Hola Mauricio, vi tu portfolio y quería consultarte por un proyecto.",
  /* Envío directo del formulario (sin abrir el correo del visitante), con Web3Forms (gratis).
     1. Entrá a https://web3forms.com, poné tu email (ricottim4@gmail.com) y te llega una "Access Key".
     2. Pegala acá abajo entre las comillas. Mientras esté vacía, el botón abre el correo (mailto) como antes. */
  formAccessKey: "7eae8bbd-f94f-4242-8451-58965beaef0c",
  sendingText: "Enviando…",
  sendErrorText:
    "No se pudo enviar el mensaje. Probá de nuevo o escribime por WhatsApp.",
  successTextForm:
    "Recibí tu mensaje. Te respondo a {email} en menos de 24 horas.",
  successTitle: "¡Listo, {name}!",
  successText:
    "Se abrió {app} con tu mensaje armado. Envialo y te respondo en menos de 24 horas.",
};

/* ------------------------------------------------------------------ */
/*  7b. PREGUNTAS FRECUENTES                                          */
/* ------------------------------------------------------------------ */
export const faqSection = {
  title: "PREGUNTAS FRECUENTES",
  subtitle: "Respuestas rápidas a las dudas más comunes.",
  // Bloque con ojitos al final de las preguntas (abre el formulario de contacto)
  helpTitle: "¿No encontraste lo que buscabas?",
  helpText: "Contame tu caso y te respondo personalmente.",
  helpCta: "Preguntame directo",
};

export const faqs = [
  {
    q: "¿Cuánto tarda en estar lista una web?",
    a: "Una landing o un sitio básico suele estar listo en 1 a 3 semanas, según el contenido y las revisiones. Los proyectos más complejos llevan entre 4 y 8 semanas.",
  },
  {
    q: "¿Cuánto cuesta una web?",
    a: "Depende del tipo de proyecto y de su complejidad. Te paso un presupuesto personalizado y sin compromiso: escribime y lo vemos.",
  },
  {
    q: "¿Qué medios de pago aceptás?",
    a: "Mercado Pago, transferencia bancaria (CVU/alias), tarjetas de crédito y débito —con opción de cuotas— y efectivo para proyectos locales.",
  },
  {
    q: "¿Ofrecés mantenimiento después del lanzamiento?",
    a: "Sí. Tengo planes de mantenimiento y soporte para actualizaciones, seguridad y mejoras continuas, y hago seguimiento del rendimiento y del SEO.",
  },
  {
    q: "¿Qué pasa después de la entrega?",
    a: "Te explico cómo usar y administrar el sitio, y te ofrezco soporte técnico y planes de mantenimiento según lo que necesites.",
  },
  {
    q: "¿Incluís SEO?",
    a: "Sí, todos los proyectos incluyen SEO básico: estructura de la página, meta tags, velocidad de carga y diseño responsive.",
  },
  {
    q: "¿Tengo que tener los textos y las fotos?",
    a: "Lo ideal es que los tengas, pero si no, te ayudo a crearlos por un costo adicional o buscamos imágenes en bancos de fotos.",
  },
  {
    q: "¿Qué incluye el hosting?",
    a: "Espacio para imágenes y contenido, ancho de banda, certificado SSL y soporte técnico. Te recomiendo el plan según el tráfico que esperes.",
  },
  {
    q: "¿Tomás proyectos urgentes?",
    a: "Sí, según mi disponibilidad. Escribime directo y vemos si se puede armar un plan acelerado.",
  },
];

/* ------------------------------------------------------------------ */
/*  8. FOOTER                                                         */
/* ------------------------------------------------------------------ */
export const footer = {
  title: "¿TENÉS UNA IDEA EN MENTE?",
  ctaText: "EMPECEMOS ➔",
  credit: "Diseñado y desarrollado con dedicación",
  timeZone: "America/Argentina/Buenos_Aires",
  // Tarjeta del final
  tagline:
    "Full Stack Developer independiente. Diseño y desarrollo sitios y aplicaciones web de punta a punta.",
  explore: "Explorar",
  follow: "Seguime",
};

/* ------------------------------------------------------------------ */
/*  9. SEO — título y descripción de la pestaña (por idioma)          */
/* ------------------------------------------------------------------ */
export const seo = {
  title: "Mauricio Ricotti | Desarrollador web Full Stack",
  description:
    "Desarrollador web Full Stack en Florencio Varela, Buenos Aires. Sitios y aplicaciones con React y Node.js. Conocé mis proyectos y pedí tu presupuesto.",
};

/* ------------------------------------------------------------------ */
/*  10. TEXTOS DE LA INTERFAZ — botones, etiquetas y mensajes cortos   */
/* ------------------------------------------------------------------ */
export const ui = {
  // Barra de navegación
  goHome: "Ir al inicio",
  soundToggle: "Activar o silenciar sonidos",
  soundOn: "Sonido activado",
  soundOff: "Sonido silenciado",
  soundShort: "Sonido",
  muteShort: "Silencio",
  talk: "Hablemos",
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  language: "Idioma",
  switchTo: "Switch to English", // se lee en el idioma al que se cambia
  // CV
  downloadCv: "Descargar CV",
  // Proyectos
  viewDemo: "Ver demo",
  download: "Descargar",
  code: "Código",
  openProject: "abrir proyecto",
  screenshotOf: "Captura de {name}",
  // Proceso
  step: "Paso",
  // Footer
  sendEmail: "Enviar un email",
  location: "Ubicación",
  hours: "Horario de atención",
  now: "Ahora",
  openNow: "En horario de atención",
  closedNow: "Fuera de horario · te respondo pronto",
  localTime: "Hora local: {time} hs",
  closed: "Cerrado",
  rights: "Todos los derechos reservados.",
  backToTop: "Volver arriba",
  // Formulario de contacto
  contactDialog: "Contacto",
  sent: "Enviado",
  stepOf: "Paso {n} de {total}",
  close: "Cerrar",
  backToSite: "Volver al sitio",
  yourMailApp: "tu app de correo",
  next: "Siguiente",
  orPressEnter: "o presioná Enter",
  prevStep: "Paso anterior",
  sendMessage: "Enviar mensaje",
  sendByEmail: "Enviar por email",
  sendByWhatsapp: "Enviar por WhatsApp",
  errName: "Necesito tu nombre para seguir.",
  errEmail: "Revisá el email, parece que falta algo.",
  errOption: "Elegí una opción.",
  errMessage: "Contame aunque sea en una línea.",
  // Mensaje armado que se envía por email o WhatsApp
  sumHello: "Hola Mauricio, soy {name}.",
  sumEmail: "Email",
  sumProject: "Proyecto",
  sumBudget: "Presupuesto (ARS)",
  sumSubject: "Nuevo proyecto: {type} — {name}",
};
