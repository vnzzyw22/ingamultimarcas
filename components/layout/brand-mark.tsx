import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * Logo da Ingá. Arquivos gerados por scripts/make-logo.mjs a partir de assets-src/logo/original.jpg
 * (estrelas corrigidas para 5 vermelhas, sem marca-d'água, fundo transparente).
 * Quando chegar o arquivo em alta (SVG de preferência), troque os arquivos e as dimensões aqui.
 *  - "completa": a logo inteira, exatamente como a marca é (header, menu mobile e rodapé)
 *  - "nome":     só o nome em serifada (reserva; hoje sem uso)
 */
const LOGOS = {
  nome: { src: "/images/logo/inga-nome.png", width: 862, height: 76 },
  completa: { src: "/images/logo/inga-logo.png", width: 947, height: 576 },
} as const;

export function BrandMark({
  variant = "nome",
  priority = false,
  className = "",
}: {
  variant?: keyof typeof LOGOS;
  priority?: boolean;
  className?: string;
}) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={logo.src}
      alt={siteConfig.name}
      width={logo.width}
      height={logo.height}
      priority={priority}
      quality={92}
      sizes={variant === "nome" ? "240px" : "(min-width: 768px) 320px, 140px"}
      className={`w-auto ${className}`}
    />
  );
}
