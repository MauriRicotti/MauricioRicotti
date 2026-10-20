export interface SocialLink {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  role: string;
  leftBio: string;
  centerBio: string;
  ctaText: string;
  email: string;
  /** Teléfono tal como se muestra (ej. "+54 11 4194-8773") */
  phone?: string;
  /** Número para WhatsApp: solo dígitos, con código de país y el 9 de celular (ej. "5491141948773") */
  whatsapp?: string;
  location: string;
  /** Horario de atención. days: 0 = domingo … 6 = sábado. Sin from/to = cerrado */
  hours?: { label: string; days: number[]; from?: string; to?: string }[];
  socials: SocialLink[];
}

export interface Project {
  id: string;
  /** Nombre corto: se muestra en vertical en la tarjeta cerrada */
  name: string;
  subtitle: string;
  category: string;
  year?: string;
  description: string;
  tags: string[];
  image: string;
  /** Versión chica de la captura (800px de ancho) para celulares. Opcional. */
  imageSmall?: string;
  demoUrl?: string;
  githubUrl?: string;
  /** "mobile" = app de celular: se muestra con captura vertical dentro de un teléfono */
  type?: "web" | "mobile";
  /** Etiqueta destacada (ej. "App estrella") */
  highlight?: string;
  /** Link de descarga (Play Store, APK, etc.) para apps de celular */
  downloadUrl?: string;
}

export interface TechItem {
  name: string;
  /** Clave del logo en src/lib/techIcons.ts (opcional: sin logo se muestra solo el texto) */
  icon?: string;
}

export interface TechGroup {
  title: string;
  /** Color de la etiqueta del grupo (opcional, ej. "#3cd3b7") */
  color?: string;
  items: TechItem[];
}
