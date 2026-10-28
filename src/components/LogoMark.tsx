import { MR_FG, MR_SIL, MR_VIEWBOX } from "../lib/logoMR";

/** Logo "MR" (sticker) en vector. El borde y las letras usan el color del texto
 *  (`currentColor`), así cambian de color con hover; el fondo es casi negro. */
export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={MR_VIEWBOX}
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path fill="#0b0c0f" d={MR_SIL} />
      <path fill="currentColor" d={MR_FG} />
    </svg>
  );
}
