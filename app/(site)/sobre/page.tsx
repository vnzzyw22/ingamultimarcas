import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a Ingá Multimarcas.",
  alternates: { canonical: "/sobre" },
};

/** PLACEHOLDER: nenhum fato sobre a empresa foi inventado. Aguardando texto oficial. */
export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Sobre" title="Ingá Multimarcas" />
      <div className="container-x grid gap-10 py-16 lg:grid-cols-12 lg:py-24">
        <div className="max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed text-ink/80 lg:col-span-7">
          <p className="border-l-2 border-red pl-5 text-sm text-mute">
            Conteúdo provisório. O texto institucional (história, equipe, diferenciais e fotos da loja) será fornecido pela Ingá Multimarcas.
          </p>
          <p>Este espaço vai apresentar a loja: como ela trabalha, o que oferece e onde fica. Números, prêmios ou depoimentos só entram aqui quando forem informados pela empresa.</p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <ButtonLink href="/estoque" size="lg" className="w-full">
            Ver estoque
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
