/** Metadatos compartidos por el HTML estático y por el cambio de idioma en React. */
import * as es from "../data/content";
import * as en from "../data/content.en";

type SeoLang = "es" | "en";

export function pageSeo(lang: SeoLang, siteUrl: string) {
  const c = lang === "en" ? en : es;
  const base = siteUrl.replace(/\/+$/, "");
  return {
    ...c.seo,
    canonical: lang === "en" ? `${base}/en` : `${base}/`,
    locale: lang === "en" ? "en_US" : "es_AR",
    alternateLocale: lang === "en" ? "es_AR" : "en_US",
    image: `${base}/og-image.jpg`,
  };
}

/** Solo datos reales del perfil. Sin estrellas, reseñas ni promesas de rich results. */
export function structuredData(lang: SeoLang, siteUrl: string) {
  const base = siteUrl.replace(/\/+$/, "");
  const meta = pageSeo(lang, base);
  const personId = `${base}/#person`;
  const siteId = `${base}/#website`;
  const sameAs = es.profile.socials
    .filter((s) => ["github", "instagram"].includes(s.label.toLowerCase()))
    .map((s) => s.url);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: es.profile.name,
        jobTitle: lang === "en" ? "Full Stack Web Developer" : "Desarrollador web Full Stack",
        url: `${base}/`,
        email: `mailto:${es.profile.email}`,
        sameAs,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Florencio Varela",
          addressRegion: "Buenos Aires",
          addressCountry: "AR",
        },
        knowsAbout: ["HTML", "CSS", "JavaScript", "React", "Node.js", "WordPress", "Web development"],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: es.profile.name,
        url: `${base}/`,
        inLanguage: ["es-AR", "en"],
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: lang === "en" ? "en" : "es-AR",
        isPartOf: { "@id": siteId },
        mainEntity: { "@id": personId },
      },
    ],
  };
}

/** Evita que un texto de contenido cierre accidentalmente el script JSON-LD. */
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
