import type { TechGroup } from "../types";
import { techIcons } from "../lib/techIcons";

interface TechStackProps {
  title: string;
  groups: TechGroup[];
}

/** Colores de las etiquetas de cada grupo (se repiten si hay más grupos). */
const LABEL_COLORS = [
  "#3cd3b7",
  "#ffd23f",
  "#ff4f7b",
  "#ff7a1a",
  "#a3e635",
  "#5ee7df",
];
const LABEL_TILT = [-3, 2, -2, 3];

/** Color de marca legible sobre fondo claro (los logos muy claros se muestran oscuros). */
function colorOnLight(hex: string): string {
  const n = parseInt(hex, 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 185 ? "#1a1a1a" : `#${hex}`;
}

export default function TechStack({ title, groups }: TechStackProps) {
  return (
    <section
      id="stack"
      aria-label={title}
      className="bg-[#0e0f12] pb-2 sm:pb-4 overflow-hidden"
    >
      {/* Título solo para lectores de pantalla (mantiene el orden h1 → h2 → h3) */}
      <h2 className="sr-only">{title}</h2>
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Franja: nace en el borde izquierdo de la pantalla y se redondea a la derecha */}
        <div
          className="ml-[calc(50%-50vw)] rounded-r-2xl sm:rounded-r-3xl bg-[#eee9df] text-[#0e0f12] py-10 sm:py-14 pl-[calc(50vw-50%)] pr-8 sm:pr-24 lg:pr-36"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,15,18,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,15,18,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {groups.map((group, i) => (
              <div key={group.title}>
                <h3
                  className="inline-block font-hero text-2xl sm:text-[1.7rem] uppercase tracking-tight leading-none px-4 py-2.5 rounded-md border-2 border-[#0e0f12] shadow-[4px_4px_0_#0e0f12] mb-5"
                  style={{
                    backgroundColor:
                      group.color ?? LABEL_COLORS[i % LABEL_COLORS.length],
                    transform: `rotate(${LABEL_TILT[i % LABEL_TILT.length]}deg)`,
                  }}
                >
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const icon = item.icon ? techIcons[item.icon] : undefined;
                    return (
                      <li
                        key={item.name}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-[1.5px] border-[#0e0f12]/80 text-sm font-medium text-[#0e0f12]"
                      >
                        {icon && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill={colorOnLight(icon.hex)}
                            aria-hidden="true"
                          >
                            <path d={icon.path} />
                          </svg>
                        )}
                        {item.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
