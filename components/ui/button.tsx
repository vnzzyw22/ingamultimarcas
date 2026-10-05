import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "outline-light" | "ghost" | "whatsapp";
type Size = "md" | "lg" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-sans font-bold uppercase tracking-[0.08em] transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-quart)] active:translate-y-px disabled:pointer-events-none disabled:opacity-45 rounded-[var(--radius-xs)]";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white hover:bg-red-deep",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border border-paper/70 text-paper hover:bg-paper hover:text-ink",
  ghost: "text-ink hover:text-red-text px-0!",
  whatsapp: "bg-whatsapp text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.6875rem]",
  md: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-[0.8125rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({ variant, size, className, ...props }: CommonProps & ComponentProps<"button">) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** Link externo (WhatsApp, Instagram): abre em nova aba com rel seguro. */
export function ExternalButton({ variant, size, className, ...props }: CommonProps & ComponentProps<"a">) {
  return <a target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props} />;
}
