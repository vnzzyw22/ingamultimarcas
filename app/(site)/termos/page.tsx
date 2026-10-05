import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = { title: "Termos de uso", robots: { index: false } };

/** PLACEHOLDER: texto jurídico deve ser fornecido/validado pela empresa. */
export default function Page() {
  return (
    <>
      <PageIntro eyebrow="Institucional" title="Termos de uso" />
      <div className="container-x max-w-3xl py-16 text-[0.9375rem] leading-relaxed text-ink/80 lg:py-24">
        <p>
          Documento em elaboração. O texto oficial será publicado após revisão jurídica da Ingá Multimarcas.
        </p>
        <p className="mt-4">
          Este site não armazena dados pessoais: formulários apenas montam mensagens que você envia, por conta própria, pelo WhatsApp.
        </p>
      </div>
    </>
  );
}
