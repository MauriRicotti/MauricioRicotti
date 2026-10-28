import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type { Profile } from "../types";
import { sound } from "../lib/sound";
import { contact } from "../data/content";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent focus:outline-none text-sm text-white placeholder-neutral-500 font-sans";
const selectClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b22] border border-white/10 focus:border-accent focus:outline-none text-sm text-white font-sans";
const labelClass =
  "block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1";

export default function ContactModal({
  isOpen,
  onClose,
  profile,
}: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientEmail: "",
    projectType: contact.projectTypes[0],
    budget: contact.budgets[0],
    message: "",
  });

  if (!isOpen) return null;

  const close = () => {
    sound.playClick();
    onClose();
  };

  const copyEmail = () => {
    navigator.clipboard?.writeText(profile.email);
    setCopied(true);
    sound.playPop(700);
    setTimeout(() => setCopied(false), 2200);
  };

  // Arma un email con los datos del formulario y abre el cliente de correo del visitante.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sound.playPop(650);
    const subject = `Nuevo proyecto: ${form.projectType} — ${form.name}`;
    const body = [
      `Nombre: ${form.name}`,
      `Email: ${form.clientEmail}`,
      `Tipo de proyecto: ${form.projectType}`,
      `Presupuesto (ARS): ${form.budget}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={close}
      />
      <div className="relative bg-[#13141a] border border-white/15 w-full max-w-2xl rounded-3xl p-6 sm:p-10 text-white shadow-2xl z-10 my-auto">
        <button
          onClick={close}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {sent ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent text-accent mx-auto flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-sans">
              {contact.successTitle.replace(" {name}", "")}
            </h3>
            <p className="text-neutral-300 text-sm max-w-md mx-auto">
              {contact.successText.replace("{app}", "tu app de correo")}
            </p>
            <p className="text-[#8c8c8c] text-xs font-mono">
              ¿No se abrió? Escribime directo a{" "}
              <a
                href={`mailto:${profile.email}`}
                className="text-accent underline"
              >
                {profile.email}
              </a>
            </p>
            <button
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs font-mono uppercase tracking-wider"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 space-y-2 pr-8">
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                {contact.eyebrow}
              </span>
              <h2 className="font-hero text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#f2ede4]">
                {contact.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                {contact.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-accent shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Email directo
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-medium text-white truncate block">
                      {profile.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={copyEmail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {profile.whatsapp && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-accent shrink-0">
                      <MessageCircle size={16} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                        WhatsApp
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-medium text-white truncate block">
                        {profile.phone}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playPop(700)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors shrink-0"
                  >
                    <span>Escribir</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>

            {profile.socials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors"
                  >
                    {s.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tu nombre *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={contact.namePlaceholder}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tu email *</label>
                  <input
                    type="email"
                    required
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm({ ...form, clientEmail: e.target.value })
                    }
                    placeholder={contact.emailPlaceholder}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de proyecto</label>
                  <select
                    value={form.projectType}
                    onChange={(e) =>
                      setForm({ ...form, projectType: e.target.value })
                    }
                    className={selectClass}
                  >
                    {contact.projectTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Presupuesto estimado (ARS)
                  </label>
                  <select
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                    className={selectClass}
                  >
                    {contact.budgets.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Contame tu idea *</label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Objetivos, plazos, referencias..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-[#eee9df] font-bold text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                <span>Enviar mensaje</span>
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
