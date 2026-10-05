"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { PARAM, stockHref } from "@/lib/filters/params";
import { formatPrice } from "@/lib/format";
import type { QuickSearchData } from "@/lib/vehicles/summaries";
import { Select } from "@/components/ui/select";
import { Search } from "@/components/ui/icons";

/**
 * Busca rápida da home, em vidro sobre a fotografia do hero.
 * O desfoque fica numa camada de fundo irmã (não no <form>): um elemento com
 * backdrop-filter isola o desfoque dos descendentes, e as listas abertas
 * precisam desfocar a página abaixo da barra.
 */
export function QuickSearch({ data }: { data: QuickSearchData }) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");

  const models = useMemo(
    () => (brand ? (data.brands.find((b) => b.value === brand)?.models ?? []) : []),
    [brand, data.brands],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = (s: string) => (s ? Number(s) : undefined);
    router.push(
      stockHref({
        brand: brand ? [brand] : [],
        model: model ? [model] : [],
        priceMin: n(priceMin),
        priceMax: n(priceMax),
        yearMin: n(yearMin),
        yearMax: n(yearMax),
      }),
    );
  }

  const prices = data.priceSteps.map((p) => ({ value: String(p), label: formatPrice(p) }));
  const years = data.years.map((y) => ({ value: String(y), label: String(y) }));
  const cell = "border-white/10 [&:not(:last-child)]:border-b md:border-b-0 md:[&:not(:last-child)]:border-r";

  return (
    <form action="/estoque" method="get" onSubmit={onSubmit} role="search" aria-label="Busca rápida de veículos" className="relative isolate">
      {/* Camada de vidro */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 border border-white/15 bg-ink/45 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl backdrop-saturate-150 rounded-[var(--radius-sm)]"
      />
      <div className="grid grid-cols-2 md:grid-cols-[1.3fr_1.3fr_1fr_1fr] xl:grid-cols-[1.3fr_1.3fr_1fr_1fr_0.8fr_0.8fr_auto]">
        <Select
          tone="glass"
          inlineLabel
          label="Marca"
          name={PARAM.brand}
          value={brand}
          onChange={(v) => {
            setBrand(v);
            setModel("");
          }}
          options={data.brands.map((b) => ({ value: b.value, label: b.label }))}
          placeholder="Todas"
          testId="qs-brand"
          className={`${cell} max-md:border-r`}
        />
        <Select
          tone="glass"
          inlineLabel
          label="Modelo"
          name={PARAM.model}
          value={model}
          onChange={setModel}
          options={models}
          placeholder={brand ? "Todos" : "Escolha a marca"}
          disabled={!brand}
          testId="qs-model"
          className={cell}
        />
        <Select
          tone="glass"
          inlineLabel
          label="Preço mín."
          name={PARAM.priceMin}
          value={priceMin}
          onChange={setPriceMin}
          options={prices.filter((p) => !priceMax || Number(p.value) <= Number(priceMax))}
          placeholder="Qualquer"
          testId="qs-pmin"
          className={`${cell} max-md:border-r`}
        />
        <Select
          tone="glass"
          inlineLabel
          label="Preço máx."
          name={PARAM.priceMax}
          value={priceMax}
          onChange={setPriceMax}
          options={prices.filter((p) => !priceMin || Number(p.value) >= Number(priceMin))}
          placeholder="Qualquer"
          testId="qs-pmax"
          className={`${cell} xl:border-r`}
        />
        <Select
          tone="glass"
          inlineLabel
          label="Ano de"
          name={PARAM.yearMin}
          value={yearMin}
          onChange={setYearMin}
          options={years.filter((y) => !yearMax || Number(y.value) <= Number(yearMax))}
          placeholder="Todos"
          testId="qs-ymin"
          className={`${cell} max-md:border-r md:border-t md:border-white/10 xl:border-t-0`}
        />
        <Select
          tone="glass"
          inlineLabel
          label="Ano até"
          name={PARAM.yearMax}
          value={yearMax}
          onChange={setYearMax}
          options={years.filter((y) => !yearMin || Number(y.value) >= Number(yearMin))}
          placeholder="Todos"
          testId="qs-ymax"
          className={`${cell} md:border-t md:border-white/10 xl:border-t-0`}
        />
        <div className="col-span-2 p-2 md:col-span-2 md:border-t md:border-white/10 xl:col-span-1 xl:border-t-0">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-3 bg-red px-7 text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep rounded-[var(--radius-xs)]"
            data-testid="qs-submit"
          >
            <Search className="text-lg" /> Buscar veículos
          </button>
        </div>
      </div>
    </form>
  );
}
