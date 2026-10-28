import { lazy, Suspense, useEffect, useState } from "react";
import { useLang } from "./i18n";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TechStack from "./components/TechStack";
import Work from "./components/Work";
import About from "./components/About";
import Marquee from "./components/Marquee";
import Process from "./components/Process";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import ScrollTop from "./components/ScrollTop";
// El formulario se carga aparte (no frena la carga inicial de la página)
const ContactFlow = lazy(() => import("./components/ContactFlow"));
import { scrollToId } from "./lib/smoothScroll";

export default function App() {
  const { profile, projects, techStack, techStackTitle } = useLang().c;
  const [contactOpen, setContactOpen] = useState(false);
  const [flowReady, setFlowReady] = useState(false);

  // Precarga el formulario cuando el navegador queda libre, así abre al instante
  useEffect(() => {
    const ready = () => setFlowReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(ready, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(ready, 1500);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id: string) => scrollToId(id);

  const openContact = () => setContactOpen(true);

  return (
    <div className="min-h-screen bg-[#0e0f12] text-white selection:bg-accent selection:text-black">
      <Header
        name={profile.name}
        onOpenContact={openContact}
        onNavigate={scrollTo}
      />

      {/* main va por encima del footer (que queda detrás, "pegado"): esquinas de abajo
          redondeadas y una sombra, para que se vea cómo la página se levanta */}
      <main className="relative z-10 bg-[#0e0f12] overflow-clip rounded-b-[32px] sm:rounded-b-[56px] border-b border-[#d9dde5]/25 shadow-[0_24px_48px_rgba(0,0,0,0.55)]">
        <Hero profile={profile} onOpenContact={openContact} />
        <TechStack title={techStackTitle} groups={techStack} />
        <Work projects={projects} />
        <About />
        <Marquee />
        <Process />
        <Faq onOpenContact={openContact} />
      </main>

      <Footer profile={profile} onOpenContact={openContact} />

      <ScrollTop />
      {(flowReady || contactOpen) && (
        <Suspense fallback={null}>
          <ContactFlow
            isOpen={contactOpen}
            onClose={() => setContactOpen(false)}
            profile={profile}
          />
        </Suspense>
      )}
    </div>
  );
}
