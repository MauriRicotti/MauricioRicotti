/**
 * Logos disponibles para la banda de tecnologías (vienen de simple-icons).
 * En content.ts usá la clave de la izquierda en el campo `icon`.
 * Si necesitás otra tecnología, importala acá y agregala al objeto.
 * Lista completa: https://simpleicons.org
 */
import {
  siBootstrap,
  siCss,
  siDocker,
  siFigma,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
  siWoocommerce,
  siWordpress,
} from "simple-icons";

export interface TechIcon {
  path: string;
  hex: string;
}

export const techIcons: Record<string, TechIcon> = {
  bootstrap: siBootstrap,
  css: siCss,
  docker: siDocker,
  figma: siFigma,
  git: siGit,
  github: siGithub,
  html5: siHtml5,
  javascript: siJavascript,
  mongodb: siMongodb,
  mysql: siMysql,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  php: siPhp,
  postgresql: siPostgresql,
  react: siReact,
  tailwind: siTailwindcss,
  typescript: siTypescript,
  vercel: siVercel,
  woocommerce: siWoocommerce,
  wordpress: siWordpress,
};

/** Color de marca, pero legible sobre fondo oscuro (los logos negros se muestran claros). */
export function brandColor(hex: string): string {
  const n = parseInt(hex, 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum < 70 ? "#f2ede4" : `#${hex}`;
}
