import {
  Music2,
  Pause,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  WifiOff,
} from "lucide-react";
import type { Project } from "../types";

/**
 * Marco de teléfono para apps de celular (captura vertical).
 * Si el proyecto tiene `image`, muestra la captura. Si no, una pantalla de
 * reproductor de ejemplo hecha en código (para OffBeat, hasta tener la captura real).
 *
 * Todo se dimensiona en "cqw" (porcentaje del ancho del teléfono), así se ve igual
 * en cualquier tamaño. Estático: sin animaciones, sombras ni blur.
 */
export default function PhoneFrame({
  project: p,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  return (
    // phone-wrap = contenedor de referencia para las unidades cqw (un elemento no puede usar las suyas)
    <div className={`phone-wrap aspect-[9/19.5] ${className}`}>
      <div className="relative w-full h-full rounded-[14cqw] bg-[#050506] border border-white/15 p-[2.6cqw]">
        <div className="relative w-full h-full rounded-[11.5cqw] overflow-hidden bg-[#0b0c10]">
          {p.image ? (
            <img
              src={p.image}
              alt={`Captura de ${p.name}`}
              width={1080}
              height={2340}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <PlayerMock name={p.name} />
          )}
          {/* Cámara (isla) */}
          <span
            aria-hidden="true"
            className="absolute top-[2.6cqw] left-1/2 -translate-x-1/2 w-[26cqw] h-[7cqw] rounded-full bg-black"
          />
        </div>
      </div>
    </div>
  );
}

/** Pantalla de ejemplo: reproductor de música offline. */
function PlayerMock({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col px-[7cqw] pt-[3.2cqw] pb-[6cqw] text-[#f2ede4] select-none"
    >
      {/* Barra de estado */}
      <div className="flex items-center justify-between text-[3.6cqw] font-semibold text-white/80 h-[7cqw]">
        <span>9:41</span>
        <span className="flex items-center gap-[1.5cqw]">
          <span className="w-[5cqw] h-[2.6cqw] rounded-[0.8cqw] border border-white/60" />
        </span>
      </div>

      {/* Encabezado */}
      <div className="mt-[5cqw] flex items-center justify-between">
        <span className="font-hero uppercase text-[7.5cqw] leading-none tracking-tight">
          {name}
        </span>
        <span className="flex items-center gap-[1.4cqw] rounded-full border border-[#3cd3b7]/40 text-[#3cd3b7] px-[2.6cqw] py-[1cqw] text-[3cqw] font-semibold">
          <WifiOff className="w-[3.4cqw] h-[3.4cqw]" /> Offline
        </span>
      </div>

      {/* Portada */}
      <div className="mt-[7cqw] relative aspect-square rounded-[6cqw] overflow-hidden bg-[#3cd3b7]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#3cd3b7_0%,#2a8f9c_45%,#5b4fd6_100%)]" />
        {/* Disco */}
        <div className="absolute inset-[16%] rounded-full bg-[#0e0f12] flex items-center justify-center">
          <div className="absolute inset-[9%] rounded-full border border-white/10" />
          <div className="absolute inset-[20%] rounded-full border border-white/10" />
          <div className="absolute inset-[31%] rounded-full border border-white/10" />
          <div className="w-[22%] aspect-square rounded-full bg-[#f2ede4] flex items-center justify-center">
            <Music2 className="w-[55%] h-[55%] text-[#0e0f12]" />
          </div>
        </div>
      </div>

      {/* Tema */}
      <div className="mt-[7cqw]">
        <p className="text-[5.4cqw] font-bold leading-tight truncate">
          Nombre de la canción
        </p>
        <p className="mt-[1cqw] text-[3.8cqw] text-white/65 truncate">
          Artista · Álbum
        </p>
      </div>

      {/* Progreso */}
      <div className="mt-[6cqw]">
        <div className="h-[1.2cqw] rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[38%] rounded-full bg-[#3cd3b7]" />
        </div>
        <div className="mt-[2cqw] flex justify-between text-[3cqw] font-mono text-white/65">
          <span>1:24</span>
          <span>3:47</span>
        </div>
      </div>

      {/* Controles */}
      <div className="mt-[4cqw] flex items-center justify-between">
        <Shuffle className="w-[5.5cqw] h-[5.5cqw] text-white/50" />
        <SkipBack className="w-[7cqw] h-[7cqw] fill-current" />
        <span className="w-[17cqw] h-[17cqw] rounded-full bg-[#f2ede4] text-[#0e0f12] flex items-center justify-center">
          <Pause className="w-[7cqw] h-[7cqw] fill-current" />
        </span>
        <SkipForward className="w-[7cqw] h-[7cqw] fill-current" />
        <Repeat className="w-[5.5cqw] h-[5.5cqw] text-[#3cd3b7]" />
      </div>

      {/* Siguiente en la cola */}
      <div className="mt-auto flex items-center gap-[3cqw] rounded-[4cqw] bg-white/[0.05] border border-white/[0.06] p-[2.6cqw]">
        <span className="w-[10cqw] h-[10cqw] rounded-[2.4cqw] bg-[linear-gradient(135deg,#ffd23f,#ff7a3d)] shrink-0" />
        <span className="min-w-0">
          <span className="block text-[3.4cqw] font-semibold truncate">
            Siguiente tema
          </span>
          <span className="block text-[3cqw] text-white/65 truncate">
            Desde tu biblioteca
          </span>
        </span>
      </div>
    </div>
  );
}
