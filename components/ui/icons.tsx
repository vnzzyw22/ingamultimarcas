import type { SVGProps } from "react";

/** Conjunto mínimo de ícones (traço 1.75, 24px). Decorativos por padrão. */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Base>
);
export const ArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Base>
);
export const Close = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Base>
);
export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7h18M3 12h18M3 17h12" />
  </Base>
);
export const Sliders = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <path d="M14 4v4M8 10v4M16 16v4" />
  </Base>
);
export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9l6 6 6-6" />
  </Base>
);
export const Expand = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Base>
);
export const Share = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v12M7 8l5-5 5 5M5 13v8h14v-8" />
  </Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Base>
);
export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Base>
);

/** Marca do WhatsApp (preenchida) — reconhecimento imediato do canal. */
export const WhatsApp = ({ title, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...p}>
    {title ? <title>{title}</title> : null}
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm.01 18.15h-.01a8.23 8.23 0 01-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
export const Play = (p: IconProps) => (
  <Base {...p} fill="currentColor" strokeWidth={0}>
    <path d="M8 5.5v13l11-6.5z" />
  </Base>
);
export const Pause = (p: IconProps) => (
  <Base {...p} fill="currentColor" strokeWidth={0}>
    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
  </Base>
);
