import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getSimilarVehicles, getVehicleBySlug } from "@/lib/vehicles";
import { formatMileage, formatPrice, formatYear } from "@/lib/format";
import { stockHref } from "@/lib/filters/params";
import { bodyTypeLabels, conditionLabels, fuelLabels, transmissionLabels } from "@/lib/vehicles/labels";
import { VehicleGallery } from "@/components/vehicles/vehicle-gallery";
import { VehicleFeatures, VehicleSpecs } from "@/components/vehicles/vehicle-specs";
import { VehicleWhatsAppButton } from "@/components/vehicles/whatsapp-button";
import { InterestDialog } from "@/components/vehicles/interest-dialog";
import { ShareButton } from "@/components/vehicles/share-button";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { StickyCta } from "@/components/vehicles/sticky-cta";
import { FinanceSimulator } from "@/components/forms/finance-simulator";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowLeft } from "@/components/ui/icons";

// O estoque vem do banco e muda pelo painel: renderiza a cada visita (há cache curto em lib/vehicles).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/veiculo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Veículo não encontrado" };
  const title = `${v.brand} ${v.model} ${v.version} ${formatYear(v)}`;
  const description = `${title} · ${formatMileage(v.mileage)} · ${transmissionLabels[v.transmission]} · ${fuelLabels[v.fuel]} · ${formatPrice(v.price)}. Fotos, ficha técnica e contato pelo WhatsApp.`;
  const cover = v.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/veiculo/${v.slug}` },
    openGraph: {
      title: `${title} — ${formatPrice(v.price)}`,
      description,
      type: "website",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined,
    },
  };
}

export default async function VehiclePage({ params }: PageProps<"/veiculo/[slug]">) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();
  const similar = await getSimilarVehicles(v, 4);
  const title = `${v.brand} ${v.model}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.brand} ${v.model} ${v.version}`,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleModelDate: String(v.year),
    productionDate: String(v.manufactureYear),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "KMT" },
    fuelType: fuelLabels[v.fuel],
    vehicleTransmission: transmissionLabels[v.transmission],
    bodyType: bodyTypeLabels[v.bodyType],
    color: v.color,
    numberOfDoors: v.doors,
    itemCondition: v.condition === "novo" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    image: v.images.map((i) => new URL(i.src, siteConfig.url).toString()),
    description: v.description,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "BRL",
      availability: v.status === "disponivel" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      seller: { "@type": "AutoDealer", name: siteConfig.name },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-x pb-2 pt-16 lg:pb-4 lg:pt-20">
        <nav aria-label="Trilha" className="flex items-center justify-between gap-4 py-3">
          <Link href="/estoque" className="inline-flex h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink hover:text-red-text">
            <ArrowLeft className="text-base" /> Estoque
          </Link>
          <ShareButton title={`${title} ${v.version} ${formatYear(v)}`} />
        </nav>
      </div>

      <div className="container-x grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <VehicleGallery images={v.images} title={`${title} ${v.version}`} />
        </div>

        {/* Painel de compra: identidade → preço → ação. Fixo no desktop. */}
        <aside className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="tnum eyebrow text-mute">
              {formatYear(v)} · {formatMileage(v.mileage)} · {conditionLabels[v.condition]}
            </p>
            <h1 className="display mt-3 text-5xl sm:text-6xl">{title}</h1>
            <p className="mt-2 text-lg text-ink/80">{v.version}</p>

            <div className="mt-8 border-t border-line pt-6">
              {v.oldPrice ? (
                <p className="tnum text-sm text-mute line-through">
                  <span className="sr-only">De </span>
                  {formatPrice(v.oldPrice)}
                </p>
              ) : null}
              <p className="tnum font-display text-5xl font-semibold leading-none text-red" data-testid="vehicle-price">
                {v.oldPrice ? <span className="sr-only">Por </span> : null}
                {formatPrice(v.price)}
              </p>
              {v.status === "reservado" ? (
                <p className="mt-3 text-sm font-semibold text-ink">Veículo reservado — fale com a loja para entrar na fila.</p>
              ) : null}
            </div>

            <div id="vehicle-cta" className="mt-6 grid gap-2.5">
              <InterestDialog vehicle={v} className="w-full" />
              <VehicleWhatsAppButton vehicle={v} className="w-full" />
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-px bg-line text-sm">
              {[
                ["Câmbio", transmissionLabels[v.transmission]],
                ["Combustível", fuelLabels[v.fuel]],
                ["Motor", v.engine],
                ["Cor", v.color],
              ].map(([k, val]) => (
                <li key={k} className="bg-paper py-3 pr-3">
                  <span className="block text-xs text-mute">{k}</span>
                  <span className="font-semibold">{val}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-mute">
              Ref. {v.stockCode}
              {v.isDemo ? " · anúncio demonstrativo" : ""}
            </p>
          </div>
        </aside>
      </div>

      <section className="container-x mt-20 lg:mt-28" aria-labelledby="detalhes">
        <SectionHeading id="detalhes" eyebrow="Ficha técnica" title="Detalhes do veículo" />
        <p className="mt-6 max-w-3xl text-[1.0625rem] leading-relaxed text-ink/85">{v.description}</p>
        <div className="mt-10">
          <VehicleSpecs vehicle={v} />
        </div>
      </section>

      <section className="container-x mt-20 lg:mt-28" aria-labelledby="equipamentos">
        <SectionHeading id="equipamentos" eyebrow={`${v.features.length} itens`} title="Equipamentos" />
        <div className="mt-8">
          <VehicleFeatures vehicle={v} />
        </div>
      </section>

      <section className="mt-20 bg-ink py-20 text-paper lg:mt-28 lg:py-24" aria-labelledby="simular">
        <div className="container-x">
          <SectionHeading id="simular" tone="dark" eyebrow="Financiamento" title={`Simule o ${v.model}`} />
          <div className="mt-10">
            <FinanceSimulator vehicle={v} tone="dark" />
          </div>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="container-x py-20 lg:py-28" aria-labelledby="semelhantes">
          <SectionHeading
            id="semelhantes"
            eyebrow={`Mais ${bodyTypeLabels[v.bodyType]} e faixa de preço próxima`}
            title="Você também pode gostar"
            action={
              <Link href={stockHref({ bodyType: [v.bodyType] })} className="text-xs font-bold uppercase tracking-[0.12em] underline decoration-red decoration-2 underline-offset-4">
                Ver todos {bodyTypeLabels[v.bodyType]}
              </Link>
            }
          />
          <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((s) => (
              <li key={s.id}>
                <VehicleCard vehicle={s} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Mobile: preço e ação sempre ao alcance do polegar */}
      <StickyCta targetId="vehicle-cta">
        <div className="container-x flex items-center gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-mute">{title}</p>
            <p className="tnum font-display text-2xl font-semibold leading-none text-red">{formatPrice(v.price)}</p>
          </div>
          <VehicleWhatsAppButton vehicle={v} label="Conversar" className="h-12! px-5!" />
        </div>
      </StickyCta>
    </>
  );
}
