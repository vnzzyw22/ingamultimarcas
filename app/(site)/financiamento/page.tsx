import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { FinanceSimulator } from "@/components/forms/finance-simulator";
import { getVehicleBySlug } from "@/lib/vehicles";
import { parseDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "Financiamento",
  description: "Simule a parcela do seu próximo carro e peça uma análise de crédito pelo WhatsApp.",
  alternates: { canonical: "/financiamento" },
};

export default async function FinancePage({ searchParams }: PageProps<"/financiamento">) {
  const sp = await searchParams;
  const slug = typeof sp.veiculo === "string" ? sp.veiculo : undefined;
  const vehicle = slug ? await getVehicleBySlug(slug) : null;
  const valor = typeof sp.valor === "string" ? parseDigits(sp.valor) : undefined;
  return (
    <>
      <PageIntro eyebrow="Financiamento" title="Simule sua parcela">
        {vehicle
          ? `Simulação para o ${vehicle.brand} ${vehicle.model} ${vehicle.version}.`
          : "Informe o valor do veículo, a entrada e o prazo. A loja faz a análise de crédito com as instituições parceiras."}
      </PageIntro>
      <div className="container-x py-16 lg:py-24">
        <FinanceSimulator key={vehicle?.id ?? valor ?? "default"} vehicle={vehicle ?? undefined} initialValue={valor} />
      </div>
    </>
  );
}
