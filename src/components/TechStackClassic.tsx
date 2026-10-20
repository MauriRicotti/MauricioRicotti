import type { CSSProperties } from "react";
import type { TechGroup } from "../types";
import { brandColor, techIcons } from "../lib/techIcons";

interface TechStackProps {
  title: string;
  groups: TechGroup[];
}

export default function TechStackClassic({ title, groups }: TechStackProps) {
  return (
    <section id="stack" className="bg-[#0e0f12] text-white pb-2 sm:pb-4">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-y border-white/10 py-8 sm:py-10">
          <p className="text-xs font-mono tracking-widest text-[#3cd3b7] uppercase mb-6 sm:mb-8">
            // {title}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="font-hero text-2xl sm:text-3xl uppercase text-[#f2ede4] mb-4 tracking-tight">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const icon = item.icon ? techIcons[item.icon] : undefined;
                    return (
                      <li
                        key={item.name}
                        style={
                          icon
                            ? ({
                                "--brand": brandColor(icon.hex),
                              } as CSSProperties)
                            : undefined
                        }
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:text-white hover:border-white/25 transition-colors"
                      >
                        {icon && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 fill-neutral-400 group-hover:fill-[var(--brand)] transition-colors"
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
