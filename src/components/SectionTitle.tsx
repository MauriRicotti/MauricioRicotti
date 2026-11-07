interface SectionTitleProps {
  title: string;
  accent: string;
}

/** Colorea un fragmento sin cambiar el texto, los saltos naturales ni el h2. */
export default function SectionTitle({ title, accent }: SectionTitleProps) {
  const start = accent ? title.indexOf(accent) : -1;
  if (start < 0) return <>{title}</>;

  const end = start + accent.length;
  return (
    <>
      {title.slice(0, start)}
      <span className="text-accent">{title.slice(start, end)}</span>
      {title.slice(end)}
    </>
  );
}
