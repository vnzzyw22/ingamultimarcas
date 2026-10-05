import type { Metadata } from "next";
import { Suspense } from "react";
import { getVehicles } from "@/lib/vehicles";
import { StockExplorer } from "@/components/filters/stock-explorer";
import { StockSkeleton } from "@/components/filters/stock-skeleton";

export const metadata: Metadata = {
  title: "Estoque de veículos",
  description: "Filtre por marca, modelo, preço, ano, quilometragem, carroceria e opcionais. Fotos, ficha técnica e contato direto pelo WhatsApp.",
  alternates: { canonical: "/estoque" },
};

// O estoque vem do banco e muda pelo painel: renderiza a cada visita (há cache curto em lib/vehicles).
export const dynamic = "force-dynamic";

export default async function StockPage() {
  const vehicles = await getVehicles();
  return (
    <>
      <section className="bg-ink pb-8 pt-24 text-paper lg:pb-12 lg:pt-36">
        <div className="container-x">
          <p className="eyebrow mb-3 text-mute-dark">Estoque</p>
          <h1 className="display text-[2.75rem] sm:text-6xl lg:text-7xl">Todos os veículos</h1>
        </div>
      </section>
      <Suspense fallback={<StockSkeleton />}>
        <StockExplorer vehicles={vehicles} />
      </Suspense>
    </>
  );
}
