import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CornerDownLeft,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import type { Profile } from "../types";
import { sound } from "../lib/sound";
import { contact as baseContact } from "../data/content";
import { fill as fillText, useLang } from "../i18n";

/**
 * Contacto conversacional: una pregunta por pantalla (estilo Typeform).
 * Al final se envía:
 *  - directo a tu email con Web3Forms (si cargaste contact.formAccessKey en content.ts), o
 *  - abriendo el correo del visitante (mailto) si la clave está vacía, o
 *  - por WhatsApp (wa.me) con el mensaje ya armado.
 * Reemplaza a ContactModal.tsx (que queda guardado como respaldo).
 */

interface ContactFlowProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

type StepId = "name" | "email" | "projectType" | "budget" | "message";
const STEPS: StepId[] = ["name", "email", "projectType", "budget", "message"];
const LETTERS = "ABCDEFGHIJ";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const hasFormKey = baseContact.formAccessKey.trim().length > 0;

// Celulares/tablets: pantalla táctil sin mouse
const isTouch =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

const emptyForm = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  message: "",
};

export default function ContactFlow({
  isOpen,
  onClose,
  profile,
}: ContactFlowProps) {
  const { lang, c } = useLang();
  const { contact, ui } = c;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [sentVia, setSentVia] = useState<null | "form" | "email" | "whatsapp">(
    null,
  );
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false); // muestra el botón de respaldo (mailto)
  const honeypotRef = useRef<HTMLInputElement>(null); // campo oculto anti-spam
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  // Teclado en pantalla abierto: alto y posición de la parte visible (visualViewport)
  const [vv, setVv] = useState<{ h: number; top: number } | null>(null);
  const kb = vv !== null;

  const id = STEPS[step];
  const firstName = form.name.trim().split(" ")[0] || "";
  const fill = (t: string) => t.replace("{name}", firstName);

  const close = useCallback(() => {
    sound.playClick();
    onClose();
  }, [onClose]);

  // Al cerrar después de enviar, deja todo listo para un nuevo mensaje
  useEffect(() => {
    if (!isOpen && sentVia) {
      setSentVia(null);
      setSendFailed(false);
      setStep(0);
      setForm(emptyForm);
    }
  }, [isOpen, sentVia]);

  // Celular: detecta el teclado en pantalla y ajusta el formulario a la parte visible
  useEffect(() => {
    const v = window.visualViewport;
    if (!isOpen || !isTouch || !v) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hidden =
          document.documentElement.clientHeight - v.height * v.scale;
        const typing =
          !!inputRef.current && document.activeElement === inputRef.current;
        setVv(
          hidden > 120 && typing
            ? { h: Math.round(v.height), top: Math.round(v.offsetTop) }
            : null,
        );
      });
    };
    update();
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      setVv(null);
    };
  }, [isOpen]);

  // Enfoca el campo de cada paso (sin mover el scroll).
  // En celulares no: el teclado aparece recién cuando la persona toca el campo.
  useEffect(() => {
    if (!isOpen || sentVia || isTouch) return;
    const t = setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      60,
    );
    return () => clearTimeout(t);
  }, [isOpen, step, sentVia]);

  const validate = (): string => {
    if (id === "name" && !form.name.trim()) return ui.errName;
    if (id === "email" && !EMAIL_RE.test(form.email.trim())) return ui.errEmail;
    if (id === "projectType" && !form.projectType) return ui.errOption;
    if (id === "budget" && !form.budget) return ui.errOption;
    if (id === "message" && !form.message.trim()) return ui.errMessage;
    return "";
  };

  // Cambia de paso. En celular, si se está escribiendo y el próximo paso también
  // es de texto, pasa el foco en el mismo toque para que el teclado no se cierre.
  const goTo = (to: number) => {
    const typing =
      isTouch &&
      !!inputRef.current &&
      document.activeElement === inputRef.current;
    const toText = STEPS[to] === "name" || STEPS[to] === "email";
    if (typing && toText) {
      flushSync(() => setStep(to));
      inputRef.current?.focus({ preventScroll: true });
    } else {
      if (typing) inputRef.current?.blur();
      setStep(to);
    }
  };

  const next = () => {
    const err = validate();
    if (err) {
      setError(err);
      sound.playClick();
      return;
    }
    setError("");
    if (step < STEPS.length - 1) {
      sound.playPop(460 + step * 60);
      goTo(step + 1);
    }
  };

  const back = () => {
    if (step === 0) return;
    sound.playClick();
    setError("");
    goTo(step - 1);
  };

  const choose = (field: "projectType" | "budget", value: string) => {
    sound.playPop(620);
    setError("");
    setForm((f) => ({ ...f, [field]: value }));
    // Avanza solo, con una pausa corta para que se vea la selección
    setTimeout(() => setStep((s) => (STEPS[s] === field ? s + 1 : s)), 280);
  };

  // Teclado: Esc cierra; en las preguntas de opciones, las letras eligen y Enter avanza
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (sentVia) return;
      if (id === "projectType" || id === "budget") {
        const list =
          id === "projectType" ? contact.projectTypes : contact.budgets;
        const idx = LETTERS.indexOf(e.key.toUpperCase());
        if (e.key.length === 1 && idx >= 0 && idx < list.length)
          choose(id, list[idx]);
        else if (e.key === "Enter") next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const summary = () =>
    [
      fillText(ui.sumHello, { name: form.name.trim() }),
      `${ui.sumEmail}: ${form.email.trim()}`,
      `${ui.sumProject}: ${form.projectType}`,
      `${ui.sumBudget}: ${form.budget}`,
      "",
      form.message.trim(),
    ].join("\n");

  // Envío directo (Web3Forms): el mensaje te llega al mail sin que el visitante salga de la web
  const sendForm = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    if (sending) return;
    setError("");
    // Si un bot completó el campo oculto, se simula el envío y no se manda nada
    if (honeypotRef.current?.checked) {
      setSentVia("form");
      return;
    }
    setSending(true);
    setSendFailed(false);
    try {
      // FormData (y no JSON): es un envío "simple" que el navegador manda sin consulta previa (CORS)
      const fd = new FormData();
      fd.append("access_key", contact.formAccessKey);
      fd.append(
        "subject",
        `${lang === "en" ? "[EN] " : ""}Nuevo proyecto: ${form.projectType} — ${form.name.trim()}`,
      );
      fd.append("from_name", `Portfolio · ${form.name.trim()}`);
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("replyto", form.email.trim());
      fd.append("Tipo de proyecto", form.projectType);
      fd.append("Presupuesto (ARS)", form.budget);
      fd.append("Idioma", lang === "en" ? "Inglés" : "Español");
      fd.append("message", form.message.trim());
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "error");
      sound.playPop(700);
      setSentVia("form");
    } catch {
      sound.playClick();
      setSendFailed(true);
      setError(contact.sendErrorText);
    } finally {
      setSending(false);
    }
  };

  const send = (via: "email" | "whatsapp") => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    sound.playPop(700);
    if (via === "email") {
      const subject = fillText(ui.sumSubject, {
        type: form.projectType,
        name: form.name.trim(),
      });
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
    } else if (profile.whatsapp) {
      window.open(
        `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(summary())}`,
        "_blank",
        "noopener",
      );
    }
    setSentVia(via);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  if (!isOpen) return null;

  const question = fill(contact.questions[id]);
  const options =
    id === "projectType"
      ? contact.projectTypes
      : id === "budget"
        ? contact.budgets
        : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ui.contactDialog}
      className="fixed inset-0 z-[60] bg-[#0e0f12] text-white overflow-y-auto overscroll-contain animate-flow-in"
      style={vv ? { top: vv.top, height: vv.h, bottom: "auto" } : undefined}
    >
      {/* Barra de progreso */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-10">
        <div
          className="h-full bg-[#3cd3b7] origin-left transition-transform duration-500 ease-out"
          style={{
            transform: `scaleX(${sentVia ? 1 : (step + 1) / STEPS.length})`,
          }}
        />
      </div>

      <div className="min-h-full max-w-5xl mx-auto px-5 sm:px-10 flex flex-col">
        {/* Barra superior */}
        <div
          className={`flex items-center justify-between ${kb ? "py-3" : "py-5 sm:py-7"}`}
        >
          <span className="font-mono text-xs text-[#8c8c8c]">
            {sentVia
              ? ui.sent
              : fillText(ui.stepOf, { n: step + 1, total: STEPS.length })}
          </span>
          <button
            onClick={close}
            aria-label={ui.close}
            className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 rounded border border-white/15">
              Esc
            </span>
            <span className="w-10 h-10 rounded-full border border-white/15 group-hover:border-white/40 flex items-center justify-center">
              <X size={18} />
            </span>
          </button>
        </div>

        {/* Contenido del paso */}
        <div
          className={`flex-1 flex flex-col ${kb ? "justify-start pt-1" : "justify-center py-8 sm:py-12"}`}
        >
          {sentVia ? (
            <div key="done" className="animate-step-in">
              <h2 className="font-hero text-6xl sm:text-8xl lg:text-9xl uppercase tracking-tight leading-[0.9] text-[#f2ede4]">
                {fill(contact.successTitle)}
              </h2>
              <p className="mt-6 max-w-xl text-lg sm:text-xl text-neutral-300 leading-relaxed">
                {sentVia === "form"
                  ? contact.successTextForm.replace(
                      "{email}",
                      form.email.trim(),
                    )
                  : contact.successText.replace(
                      "{app}",
                      sentVia === "email" ? ui.yourMailApp : "WhatsApp",
                    )}
              </p>
              <button
                onClick={close}
                className="mt-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#f2ede4] text-[#0e0f12] font-semibold hover:bg-[#3cd3b7] transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} /> {ui.backToSite}
              </button>
            </div>
          ) : (
            <form
              key={id}
              onSubmit={onSubmit}
              className={`animate-step-in ${kb ? "flex-1 flex flex-col" : ""}`}
              noValidate
            >
              <p
                className={`font-mono text-sm text-[#3cd3b7] mb-4 items-center gap-2 ${kb ? "hidden" : "flex"}`}
              >
                {String(step + 1).padStart(2, "0")} <ArrowRight size={14} />
              </p>
              <h2
                className={`font-hero uppercase tracking-tight leading-[0.92] text-[#f2ede4] ${kb ? "text-3xl" : "text-5xl sm:text-7xl lg:text-8xl"}`}
              >
                {question}
              </h2>

              <div className={kb ? "mt-5" : "mt-10 sm:mt-14"}>
                {(id === "name" || id === "email") && (
                  <input
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    type={id === "email" ? "email" : "text"}
                    inputMode={id === "email" ? "email" : "text"}
                    autoComplete={id === "email" ? "email" : "name"}
                    enterKeyHint="next"
                    value={form[id]}
                    onChange={(e) => {
                      setError("");
                      setForm({ ...form, [id]: e.target.value });
                    }}
                    placeholder={
                      id === "email"
                        ? contact.emailPlaceholder
                        : contact.namePlaceholder
                    }
                    className="w-full bg-transparent border-0 border-b-2 border-white/15 focus:border-[#3cd3b7] outline-none pb-3 text-2xl sm:text-4xl font-medium text-white placeholder:text-neutral-600 transition-colors"
                  />
                )}

                {id === "message" && (
                  <textarea
                    ref={(el) => {
                      inputRef.current = el;
                    }}
                    rows={kb ? 3 : 4}
                    value={form.message}
                    onChange={(e) => {
                      setError("");
                      setForm({ ...form, message: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        if (hasFormKey) sendForm();
                        else send("email");
                      }
                    }}
                    placeholder={contact.messagePlaceholder}
                    className="w-full bg-transparent border-0 border-b-2 border-white/15 focus:border-[#3cd3b7] outline-none pb-3 text-xl sm:text-3xl font-medium text-white placeholder:text-neutral-600 resize-none leading-snug transition-colors"
                  />
                )}

                {options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl">
                    {options.map((opt, i) => {
                      const selected =
                        form[id as "projectType" | "budget"] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            choose(id as "projectType" | "budget", opt)
                          }
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-base sm:text-lg transition-colors cursor-pointer ${
                            selected
                              ? "border-[#3cd3b7] bg-[#3cd3b7]/10 text-white"
                              : "border-white/15 text-neutral-200 hover:border-white/40 hover:bg-white/[0.03]"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 shrink-0 rounded-md border font-mono text-xs flex items-center justify-center ${
                              selected
                                ? "bg-[#3cd3b7] border-[#3cd3b7] text-[#0e0f12]"
                                : "border-white/25 text-neutral-400"
                            }`}
                          >
                            {LETTERS[i]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p
                  className={`${kb ? "mt-2" : "mt-4"} text-sm text-[#ff4f7b] min-h-[1.25rem] ${error ? "" : "invisible"}`}
                  role="alert"
                >
                  {error || "·"}
                </p>
              </div>

              {/* Acciones */}
              <div
                className={`flex flex-wrap items-center gap-3 ${kb ? "mt-auto sticky bottom-0 bg-[#0e0f12] py-3" : "mt-4"}`}
              >
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label={ui.prevStep}
                    className="w-12 h-12 rounded-full border border-white/15 hover:border-white/40 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}

                {id !== "message" ? (
                  <>
                    <button
                      type="submit"
                      onMouseDown={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-[#f2ede4] text-[#0e0f12] font-semibold hover:bg-[#3cd3b7] transition-colors cursor-pointer"
                    >
                      {ui.next} <ArrowRight size={18} />
                    </button>
                    <span className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-[#8c8c8c]">
                      {ui.orPressEnter} <CornerDownLeft size={13} />
                    </span>
                  </>
                ) : (
                  <>
                    {/* Campo trampa para bots: invisible para las personas */}
                    <input
                      ref={honeypotRef}
                      type="checkbox"
                      name="botcheck"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />
                    {hasFormKey ? (
                      <button
                        type="button"
                        onClick={sendForm}
                        disabled={sending}
                        aria-busy={sending}
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-[#f2ede4] text-[#0e0f12] font-semibold hover:bg-[#3cd3b7] disabled:opacity-70 disabled:cursor-wait transition-colors cursor-pointer"
                      >
                        {sending ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />{" "}
                            {contact.sendingText}
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span className="whitespace-nowrap">
                              {ui.sendMessage}
                            </span>
                          </>
                        )}
                      </button>
                    ) : null}
                    {hasFormKey && sendFailed && (
                      <button
                        type="button"
                        onClick={() => send("email")}
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-white/25 text-neutral-200 font-semibold hover:border-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        <Mail size={18} /> {ui.sendByEmail}
                      </button>
                    )}
                    {!hasFormKey && (
                      <button
                        type="button"
                        onClick={() => send("email")}
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-[#f2ede4] text-[#0e0f12] font-semibold hover:bg-[#3cd3b7] transition-colors cursor-pointer"
                      >
                        <Mail size={18} /> {ui.sendByEmail}
                      </button>
                    )}
                    {profile.whatsapp && (
                      <button
                        type="button"
                        onClick={() => send("whatsapp")}
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-full border-2 border-[#3cd3b7] text-[#3cd3b7] font-semibold hover:bg-[#3cd3b7] hover:text-[#0e0f12] transition-colors cursor-pointer"
                      >
                        <MessageCircle size={18} /> {ui.sendByWhatsapp}
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Contacto directo */}
        <div
          className={`py-6 border-t border-white/10 flex-col ${kb ? "hidden" : "flex"} sm:flex-row sm:items-center gap-x-6 gap-y-2 font-mono text-xs text-[#8c8c8c]`}
        >
          <span>{contact.directText}</span>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1 text-neutral-300 hover:text-[#3cd3b7] transition-colors"
          >
            Email <ArrowUpRight size={12} />
          </a>
          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-neutral-300 hover:text-[#3cd3b7] transition-colors"
            >
              WhatsApp <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
