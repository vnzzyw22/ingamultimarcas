import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getFeaturedVehicles, getVehicles } from "@/lib/vehicles";
import { bodyTypeSummaries, buildQuickSearchData } from "@/lib/vehicles/summaries";
import { stockHref } from "@/lib/filters/params";
import { formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { QuickSearch } from "@/components/forms/quick-search";
import { FinanceSimulator } from "@/components/forms/finance-simulator";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink, ExternalButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ArrowRight, WhatsApp } from "@/components/ui/icons";

// O estoque vem do banco e muda pelo painel: renderiza a cada visita (há cache curto em lib/vehicles).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [vehicles, featured] = await Promise.all([getVehicles(), getFeaturedVehicles(6)]);
  const bodies = bodyTypeSummaries(vehicles);
  const qs = buildQuickSearchData(vehicles);
  const { contact } = siteConfig;

  return (
    <>
      <HeroShowcase featured={featured} search={<QuickSearch data={qs} />} />

      {/* 1. Atalhos por carroceria (a busca rápida fica dentro do hero, sobre a foto) */}
      <section className="bg-ink pb-12 pt-8 text-paper" aria-label="Atalhos por carroceria">
        <div className="container-x">
          <nav aria-label="Atalhos por carroceria" className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <span className="eyebrow mr-3 text-mute-dark">Carroceria</span>
            {bodies.map((b) => (
              <Link
                key={b.bodyType}
                href={stockHref({ bodyType: [b.bodyType] })}
                className="group inline-flex h-11 items-center gap-2 border border-line-dark px-4 text-[0.8125rem] font-bold uppercase tracking-[0.08em] transition-colors hover:border-paper rounded-[var(--radius-xs)]"
                data-testid={`body-shortcut-${b.bodyType}`}
              >
                {b.label}
                <span className="tnum text-xs font-medium text-mute-dark group-hover:text-paper">{b.count}</span>
              </Link>
            ))}
            <Link href="/estoque" className="ml-auto hidden h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-paper/80 hover:text-paper sm:inline-flex">
              Estoque completo <ArrowRight />
            </Link>
          </nav>
        </div>
      </section>

      {/* 2. Destaques */}
      <section className="container-x py-20 lg:py-28" aria-labelledby="destaques">
        <SectionHeading
          id="destaques"
          eyebrow="Selecionados"
          title="Em destaque"
          action={
            <ButtonLink href="/estoque" variant="outline">
              Ver todo o estoque
            </ButtonLink>
          }
        />
        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v, idx) => (
            <li key={v.id}>
              <Reveal delay={(idx % 3) * 0.06}>
                <VehicleCard vehicle={v} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Estoque por carroceria — índice tipográfico com dados reais */}
      <section className="border-t border-line" aria-labelledby="categorias">
        <div className="container-x py-20 lg:py-28">
          <SectionHeading id="categorias" eyebrow="Estoque" title="Por carroceria" />
          <ul className="mt-12 border-t border-ink">
            {bodies.map((b) => (
              <li key={b.bodyType} className="border-b border-line">
                <Link
                  href={stockHref({ bodyType: [b.bodyType] })}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 sm:grid-cols-[1fr_auto_auto] lg:py-8"
                >
                  <span className="display text-5xl transition-colors group-hover:text-red sm:text-6xl lg:text-7xl">{b.label}</span>
                  <span className="tnum row-start-2 text-sm text-mute sm:row-start-auto">
                    {b.count} {b.count === 1 ? "veículo" : "veículos"} · a partir de {formatPrice(b.fromPrice)}
                  </span>
                  <ArrowRight className="col-start-2 row-span-2 text-2xl transition-transform group-hover:translate-x-1.5 sm:col-start-3 sm:row-span-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Venda seu carro */}
      <section className="bg-ink text-paper" aria-labelledby="venda">
        <div className="container-x grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <p className="eyebrow text-mute-dark">Venda ou troca</p>
            <h2 id="venda" className="display mt-4 text-5xl sm:text-6xl lg:text-7xl">
              Seu carro entra
              <span className="block text-red-on-dark">no negócio.</span>
            </h2>
          </div>
          <div className="flex flex-col justify-end lg:col-span-5">
            <p className="max-w-md text-[1.0625rem] leading-relaxed text-paper/75">
              Mande os dados do seu veículo e receba uma avaliação da loja pelo WhatsApp. Serve para vender ou para usar como entrada.
            </p>
            <div className="mt-8">
              <ButtonLink href="/venda-seu-carro" size="lg">
                Avaliar meu carro <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Financiamento */}
      <section className="container-x py-20 lg:py-28" aria-labelledby="financiamento">
        <SectionHeading id="financiamento" eyebrow="Financiamento" title="Simule a parcela" />
        <div className="mt-12">
          <FinanceSimulator initialValue={120000} />
        </div>
      </section>

      {/* 6. Sobre — PLACEHOLDER até receber o texto oficial */}
      <section className="border-t border-line bg-paper-2" aria-labelledby="sobre">
        <div className="container-x grid gap-8 py-20 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className="eyebrow text-mute">Sobre</p>
            <h2 id="sobre" className="display mt-4 text-5xl sm:text-6xl">
              Ingá Multimarcas
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {/* TODO(cliente): substituir pelo texto institucional oficial. */}
            <p className="text-[1.0625rem] leading-relaxed text-ink/80">
              Espaço reservado para o texto institucional da Ingá Multimarcas — história, forma de trabalho e o que a loja oferece. Conteúdo a ser fornecido pela empresa.
            </p>
            <Link href="/sobre" className="mt-6 inline-flex h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] underline decoration-red decoration-2 underline-offset-4">
              Conhecer a loja
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CTA final */}
      <section className="bg-red text-white" aria-labelledby="cta-final">
        <div className="container-x flex flex-col gap-8 py-16 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div>
            <h2 id="cta-final" className="display text-5xl sm:text-6xl lg:text-7xl">
              Viu um carro?
              <span className="block">Chama a gente.</span>
            </h2>
            <p className="mt-4 text-sm text-white/85">
              {contact.address.street} — {contact.address.district}, {contact.address.city}/{contact.address.state}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExternalButton href={whatsappUrl(`Olá! Vim pelo site da ${siteConfig.name}.`)} size="lg" className="bg-ink text-white hover:bg-ink-3">
              <WhatsApp className="text-lg" /> WhatsApp
            </ExternalButton>
            <ButtonLink href="/contato" size="lg" variant="outline-light" className="border-white text-white hover:bg-white hover:text-red-deep">
              Endereço e horários
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
