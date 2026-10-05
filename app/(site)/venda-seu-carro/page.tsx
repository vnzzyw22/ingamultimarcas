import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { TradeInForm } from "@/components/forms/trade-in-form";

export const metadata: Metadata = {
  title: "Venda seu carro",
  description: "Envie os dados do seu veículo e receba uma avaliação da Ingá Multimarcas pelo WhatsApp — para vender ou usar na troca.",
  alternates: { canonical: "/venda-seu-carro" },
};

const STEPS = [
  ["Preencha", "Dados básicos do carro: marca, modelo, ano e quilometragem."],
  ["Envie", "A mensagem abre pronta no WhatsApp da loja. Mande fotos na conversa, se quiser."],
  ["Receba a avaliação", "A loja responde com a proposta ou combina uma vistoria."],
] as const;

export default function TradeInPage() {
  return (
    <>
      <PageIntro eyebrow="Venda ou troca" title="Venda seu carro">
        Avaliação para vender ou para usar como entrada em um veículo do estoque.
      </PageIntro>
      <div className="container-x grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <ol className="grid content-start gap-8 lg:col-span-4">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="grid grid-cols-[auto_1fr] gap-5 border-t border-line pt-6">
              <span className="tnum font-display text-4xl leading-none text-red">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="display text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-mute">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="lg:col-span-7 lg:col-start-6">
          <TradeInForm />
        </div>
      </div>
    </>
  );
}
