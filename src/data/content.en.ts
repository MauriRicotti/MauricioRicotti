/**
 * ============================================================
 *  CONTENIDO EN INGLÉS (versión /en del sitio)
 * ============================================================
 *  Misma estructura que content.ts, pero con los textos traducidos.
 *  Las fotos, links, email, WhatsApp y redes se toman de content.ts,
 *  así no hay que mantenerlos en dos lugares.
 *
 *  Si cambiás un texto en content.ts, actualizá también su traducción acá.
 * ============================================================
 */
import type { Profile, Project, TechGroup } from "../types";
import * as es from "./content";

/* 1. PROFILE */
export const profile: Profile = {
  ...es.profile,
  leftBio:
    "I build web applications end to end: from fast, polished interfaces to APIs, databases and production deployment.",
  centerBio:
    "I work with HTML, CSS, JavaScript, React and Node.js to build websites and apps that are fast, clear and easy to maintain, with a strong focus on user experience.",
  ctaText: "LET'S TALK",
  location: "Florencio Varela, Buenos Aires · Remote",
  hours: [
    {
      label: "Monday to Friday",
      days: [1, 2, 3, 4, 5],
      from: "09:00",
      to: "18:00",
    },
    { label: "Saturdays", days: [6], from: "10:00", to: "14:00" },
    { label: "Sundays", days: [0] },
  ],
  cvUrl: "/cv/Mauricio-Ricotti-CV-EN.pdf",
};

/* 2. NAVIGATION (same ids as in content.ts) */
export const navLinks = [
  { label: "Projects", id: "work" },
  { label: "About", id: "about" },
  { label: "Process", id: "process" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

/* 3. TECH STACK */
export const techStackTitle = "Tech stack";

// Same logos as content.ts; only group titles and generic names change
const techNames: Record<string, string> = {
  Herramientas: "Tools",
  "Bases de datos": "Databases",
  "Velocidad de carga": "Page speed",
};
export const techStack: TechGroup[] = es.techStack.map((g) => ({
  title: techNames[g.title] ?? g.title,
  items: g.items.map((i) => ({ ...i, name: techNames[i.name] ?? i.name })),
}));

/* 4. PROJECTS */
export const workSection = {
  ...es.workSection,
  title: "FEATURED WORK",
};

// Translations by project id (images and links come from content.ts)
const projectText: Record<
  string,
  Pick<Project, "subtitle" | "category" | "description" | "tags"> & {
    highlight?: string;
  }
> = {
  offbeat: {
    subtitle: "Local, offline and free music player for phones",
    category: "Mobile app",
    highlight: "Featured app",
    description:
      "My most complete project: an app to listen to the music stored on your phone, with no internet connection, no accounts and completely free. Built to be fast, simple and pleasant to use every day.",
    tags: ["Mobile app", "100% offline", "Free"],
  },
  "empa-market": {
    subtitle: "Artisan empanada shop with WhatsApp ordering",
    category: "Online store",
    description:
      "Online store with an optimized checkout flow, product filters and a design focused on conversion and usability.",
    tags: ["HTML5", "CSS3", "JavaScript"],
  },
  "fotocopiado-unaj": {
    subtitle: "System for the university's copy centers",
    category: "Software",
    description:
      "Custom web application with an admin panel and per-center access (Health, Social Sciences, Engineering and HEC). Modular design and optimized performance.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Database"],
  },
  "oklahoma-studio": {
    subtitle: "Website for a professional barbershop",
    category: "Landing page",
    description:
      "Modern website for a professional barbershop, with a polished design focused on quality and on conveying a premium experience.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
  },
  vaultmail: {
    subtitle: "Secure email and password manager",
    category: "Software",
    description:
      "Credential manager to store and manage emails and passwords securely, with categories, favorites, search, and data import and export.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
  },
  "powerlab-gym": {
    subtitle: "Gym website",
    category: "Landing page",
    description:
      "Gym website with a modern design, focused on performance, with clear sections to present services, plans and trainers.",
    tags: ["HTML5", "CSS3", "JavaScript"],
  },
  "becas-unaj": {
    subtitle: "Photocopy scholarship system for students",
    category: "Software",
    description:
      "System to manage UNAJ students' photocopy scholarships: student registration and search, tracking of used and remaining pages, prints per shift and history.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Database"],
  },
};
export const projects: Project[] = es.projects.map((p) => ({
  ...p,
  ...(projectText[p.id] ?? {}),
}));

/* 5. ABOUT */
const aboutServices = [
  {
    title: "Landing pages",
    description:
      "Fast, modern pages focused on conversion. Ideal for campaigns, launches and specific products.",
    tags: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
  },
  {
    title: "Corporate websites",
    description:
      "Complete, professional websites to showcase your company: services, team and contact, with basic SEO from day one.",
    tags: ["WordPress", "SEO", "Responsive"],
  },
  {
    title: "Personal brand websites",
    description:
      "Portfolios and personal sites designed to boost your professional brand and highlight your services.",
    tags: ["React", "Tailwind CSS"],
  },
  {
    title: "Web apps & online stores",
    description:
      "Custom apps and stores: admin panels, databases and checkout flows ready to grow.",
    tags: ["React", "Node.js", "Databases"],
  },
  {
    title: "Maintenance & support",
    description:
      "Updates, improvements and optimizations to keep your site running at 100% after launch.",
    tags: ["Git", "GitHub", "Vercel"],
  },
  {
    title: "UX/UI design",
    description:
      "Design focused on experience and conversion, with Figma prototypes to validate everything before writing code.",
    tags: ["Figma", "Prototyping"],
  },
];
export const about = {
  title: "FROM IDEA TO DEPLOY",
  paragraphs: [
    "I'm Mauricio, a full stack developer. I like taking a problem from start to finish: understanding what the business needs, designing the architecture and building every layer, from the interface to the database.",
    "I write clean, maintainable code, I care about performance and SEO, and I don't consider a project finished until it's live and working well.",
  ],
  // Same colors as content.ts
  services: es.about.services.map((s, i) => ({
    ...s,
    ...(aboutServices[i] ?? {}),
  })),
};

/* 6b. GIANT TEXT BANDS */
export const marqueeRows: typeof es.marqueeRows = [
  { words: ["Design", "Code", "Deploy"], style: "solid" },
  { ...es.marqueeRows[1] },
  { words: ["Landing pages", "Online stores", "Web apps"], style: "outline" },
];

/* 6c. PROCESS */
export const processSection = {
  title: "HOW I WORK",
  subtitle: "Four clear steps, from our first chat until your website is live.",
};

const stepText = [
  {
    title: "Discovery & consultation",
    text: "We talk about your business, your goals and your audience. I define the scope, timeline and budget before we start — no surprises.",
    items: ["Kickoff meeting", "Goals & scope", "Clear quote"],
  },
  {
    title: "Design & prototyping",
    text: "I plan the structure and design of each section so you can see it and we can refine it together before a single line of code is written.",
    items: ["Site structure", "Design in Figma", "Tweaks from your feedback"],
  },
  {
    title: "Development & optimization",
    text: "I build the site with clean code, adapted to phones and optimized to load fast and show up on Google.",
    items: ["Responsive", "Page speed", "Basic SEO"],
  },
  {
    title: "Launch & support",
    text: "I publish your website, set up the domain and hosting, and keep supporting you after delivery so everything runs smoothly.",
    items: ["Domain & hosting", "Going live", "Post-launch support"],
  },
];
export const processSteps = es.processSteps.map((s, i) => ({
  ...s,
  ...(stepText[i] ?? {}),
}));

/* 7. CONTACT */
export const contact = {
  ...es.contact,
  eyebrow: "// Let's talk",
  title: "TELL ME ABOUT YOUR NEXT PROJECT",
  subtitle:
    "Available for selected projects, product consulting and collaborations.",
  projectTypes: [
    "Landing page",
    "Corporate website",
    "Personal brand website / portfolio",
    "Web app or online store",
    "Maintenance & updates",
    "UX/UI design",
  ],
  // Ranges in Argentine pesos (same as the Spanish version)
  budgets: [
    "Under ARS 1,000,000",
    "ARS 1,000,000 – 3,000,000",
    "ARS 3,000,000 – 7,000,000",
    "ARS 7,000,000 – 15,000,000",
    "Over ARS 15,000,000",
    "I'm not sure yet",
  ],
  questions: {
    name: "What's your name?",
    email: "Great, {name}. What email should I reply to?",
    projectType: "What do you want to build?",
    budget: "What's your budget?",
    message: "Tell me about your idea",
  },
  messagePlaceholder: "Goals, timeline, references...",
  directText: "Prefer to message me directly?",
  namePlaceholder: "Enter your name",
  emailPlaceholder: "Enter your email",
  whatsappMessage:
    "Hi Mauricio, I saw your portfolio and I'd like to ask you about a project.",
  sendingText: "Sending…",
  sendErrorText:
    "The message couldn't be sent. Please try again or message me on WhatsApp.",
  successTextForm: "I got your message. I'll reply to {email} within 24 hours.",
  successTitle: "Done, {name}!",
  successText:
    "{app} opened with your message ready to go. Send it and I'll reply within 24 hours.",
};

/* 7b. FAQ */
export const faqSection = {
  title: "FREQUENTLY ASKED QUESTIONS",
  subtitle: "Quick answers to the most common questions.",
  helpTitle: "Didn't find what you were looking for?",
  helpText: "Tell me about your project and I'll get back to you personally.",
  helpCta: "Ask me directly",
};

export const faqs = [
  {
    q: "How long does it take to build a website?",
    a: "A landing page or a basic site is usually ready in 1 to 3 weeks, depending on the content and revisions. More complex projects take between 4 and 8 weeks.",
  },
  {
    q: "How much does a website cost?",
    a: "It depends on the type of project and its complexity. I'll send you a personalized, no-obligation quote — just message me and we'll go over it.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Mercado Pago, bank transfer (CVU/alias), credit and debit cards — with installment options — and cash for local projects.",
  },
  {
    q: "Do you offer maintenance after launch?",
    a: "Yes. I offer maintenance and support plans for updates, security and ongoing improvements, and I keep track of performance and SEO.",
  },
  {
    q: "What happens after delivery?",
    a: "I show you how to use and manage the site, and I offer technical support and maintenance plans based on what you need.",
  },
  {
    q: "Is SEO included?",
    a: "Yes, every project includes basic SEO: page structure, meta tags, loading speed and responsive design.",
  },
  {
    q: "Do I need to have the texts and photos?",
    a: "Ideally yes, but if you don't, I can help you create them for an additional fee, or we can use stock photos.",
  },
  {
    q: "What does hosting include?",
    a: "Space for images and content, bandwidth, an SSL certificate and technical support. I'll recommend a plan based on the traffic you expect.",
  },
  {
    q: "Do you take urgent projects?",
    a: "Yes, depending on my availability. Message me directly and we'll see if we can put together a fast-track plan.",
  },
];

/* 8. FOOTER */
export const footer = {
  ...es.footer,
  title: "GOT AN IDEA IN MIND?",
  ctaText: "LET'S START ➔",
  credit: "Designed and built with care",
  tagline:
    "Independent Full Stack Developer. I design and build websites and web apps end to end.",
  explore: "Explore",
  follow: "Follow me",
};

/* 9. SEO */
export const seo = {
  title: "Mauricio Ricotti | Full Stack Developer",
  description:
    "Portfolio of Mauricio Ricotti, Full Stack Developer based in Buenos Aires, Argentina. I build fast websites and web apps with React, TypeScript and Node.js.",
};

/* 10. INTERFACE TEXTS */
export const ui: typeof es.ui = {
  goHome: "Go to top",
  soundToggle: "Turn sounds on or off",
  soundOn: "Sound on",
  soundOff: "Sound off",
  soundShort: "Sound",
  muteShort: "Muted",
  talk: "Let's talk",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  language: "Language",
  switchTo: "Cambiar a español",
  downloadCv: "Download CV",
  viewDemo: "View demo",
  download: "Download",
  code: "Code",
  openProject: "open project",
  screenshotOf: "Screenshot of {name}",
  step: "Step",
  sendEmail: "Send an email",
  location: "Location",
  hours: "Working hours",
  now: "Now",
  openNow: "Within working hours",
  closedNow: "Outside working hours · I'll reply soon",
  localTime: "Buenos Aires time: {time}",
  closed: "Closed",
  rights: "All rights reserved.",
  backToTop: "Back to top",
  contactDialog: "Contact",
  sent: "Sent",
  stepOf: "Step {n} of {total}",
  close: "Close",
  backToSite: "Back to the site",
  yourMailApp: "Your email app",
  next: "Next",
  orPressEnter: "or press Enter",
  prevStep: "Previous step",
  sendMessage: "Send message",
  sendByEmail: "Send by email",
  sendByWhatsapp: "Send via WhatsApp",
  errName: "I need your name to continue.",
  errEmail: "Check your email, something seems to be missing.",
  errOption: "Pick an option.",
  errMessage: "Tell me about it, even in one line.",
  sumHello: "Hi Mauricio, I'm {name}.",
  sumEmail: "Email",
  sumProject: "Project",
  sumBudget: "Budget",
  sumSubject: "New project: {type} — {name}",
};
