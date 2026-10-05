"use client";

import { useEffect, useId, useState } from "react";
import type { Facets } from "@/lib/filters/facets";
import type { VehicleFilters } from "@/lib/filters/types";
import type { FeatureKey } from "@/types/vehicle";
import { formatNumber } from "@/lib/format";
import { CheckboxList, FilterGroup, RangeInputs, ToggleChips, YearRange } from "@/components/filters/filter-controls";
import { Search } from "@/components/ui/icons";

interface Props {
  filters: VehicleFilters;
  facets: Facets;
  onChange: (next: VehicleFilters) => void;
}

/** Valor sintético: "automático" é derivado do câmbio, mas aparece junto dos opcionais. */
const AUTO = "__automatico" as const;

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Painel completo de filtros. Usado na lateral (desktop) e no drawer (mobile). */
export function FilterPanel({ filters: f, facets, onChange }: Props) {
  const searchId = useId();
  const [q, setQ] = useState(f.q);
  // Ressincroniza quando a busca muda por fora (chip removido, limpar filtros).
  const [prevQ, setPrevQ] = useState(f.q);
  if (f.q !== prevQ) {
    setPrevQ(f.q);
    setQ(f.q);
  }
  useEffect(() => {
    if (q === f.q) return;
    const t = setTimeout(() => onChange({ ...f, q }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const set = (patch: Partial<VehicleFilters>) => onChange({ ...f, ...patch });

  const identCount = f.brand.length + f.model.length + f.version.length;
  const charCount = f.bodyType.length + f.condition.length + f.transmission.length + f.fuel.length + f.color.length + f.doors.length + f.engine.length;
  const optCount = f.features.length + (f.automatic ? 1 : 0);

  return (
    <div>
      <div className="pb-5">
        <label htmlFor={searchId} className="sr-only">
          Buscar no estoque
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-mute" />
          <input
            id={searchId}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Marca, modelo, ano…"
            className="h-11 w-full border border-line bg-white pl-10 pr-3 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none rounded-[var(--radius-xs)]"
          />
        </div>
      </div>

      <div className="border-t border-line">
        <FilterGroup title="Identificação" activeCount={identCount}>
          <CheckboxList legend="Marca" options={facets.brand} selected={f.brand} onToggle={(v) => set({ brand: toggle(f.brand, v) })} />
          {f.brand.length > 0 || facets.model.length <= 12 ? (
            <CheckboxList legend="Modelo" options={facets.model} selected={f.model} onToggle={(v) => set({ model: toggle(f.model, v) })} />
          ) : (
            <p className="text-xs text-mute">Escolha uma marca para ver os modelos.</p>
          )}
          {facets.version.length > 0 ? (
            <CheckboxList legend="Versão" options={facets.version} selected={f.version} onToggle={(v) => set({ version: toggle(f.version, v) })} />
          ) : null}
        </FilterGroup>

        <FilterGroup title="Preço e ano" activeCount={(f.priceMin !== undefined || f.priceMax !== undefined ? 1 : 0) + (f.yearMin !== undefined || f.yearMax !== undefined ? 1 : 0)}>
          <RangeInputs
            legend="Preço"
            prefix="R$"
            min={f.priceMin}
            max={f.priceMax}
            placeholderMin={formatNumber(facets.price.min)}
            placeholderMax={formatNumber(facets.price.max)}
            onCommit={(priceMin, priceMax) => set({ priceMin, priceMax })}
          />
          <YearRange min={f.yearMin} max={f.yearMax} bounds={facets.year} onChange={(yearMin, yearMax) => set({ yearMin, yearMax })} />
        </FilterGroup>

        <FilterGroup title="Quilometragem" defaultOpen={false} activeCount={f.kmMin !== undefined || f.kmMax !== undefined ? 1 : 0}>
          <RangeInputs
            legend="Quilometragem"
            suffix="km"
            min={f.kmMin}
            max={f.kmMax}
            placeholderMin={formatNumber(facets.km.min)}
            placeholderMax={formatNumber(facets.km.max)}
            onCommit={(kmMin, kmMax) => set({ kmMin, kmMax })}
          />
        </FilterGroup>

        <FilterGroup title="Características" activeCount={charCount}>
          <ToggleChips legend="Carroceria" options={facets.bodyType} selected={f.bodyType} onToggle={(v) => set({ bodyType: toggle(f.bodyType, v) })} />
          <ToggleChips legend="Condição" options={facets.condition} selected={f.condition} onToggle={(v) => set({ condition: toggle(f.condition, v) })} />
          <CheckboxList legend="Câmbio" options={facets.transmission} selected={f.transmission} onToggle={(v) => set({ transmission: toggle(f.transmission, v) })} />
          <CheckboxList legend="Combustível" options={facets.fuel} selected={f.fuel} onToggle={(v) => set({ fuel: toggle(f.fuel, v) })} />
          <CheckboxList legend="Cor" options={facets.color} selected={f.color} onToggle={(v) => set({ color: toggle(f.color, v) })} initialVisible={5} />
          <CheckboxList legend="Portas" options={facets.doors} selected={f.doors} onToggle={(v) => set({ doors: toggle(f.doors, v) })} />
          <CheckboxList legend="Motor" options={facets.engine} selected={f.engine} onToggle={(v) => set({ engine: toggle(f.engine, v) })} initialVisible={5} />
        </FilterGroup>

        <FilterGroup title="Opcionais" activeCount={optCount} defaultOpen={false}>
          <CheckboxList
            legend="Equipamentos"
            options={[{ value: AUTO as typeof AUTO | FeatureKey, label: "Câmbio automático", count: facets.automaticCount }, ...facets.features]}
            selected={[...(f.automatic ? [AUTO] : []), ...f.features]}
            initialVisible={8}
            onToggle={(v) =>
              v === AUTO ? set({ automatic: !f.automatic }) : set({ features: toggle(f.features, v) })
            }
          />
        </FilterGroup>
      </div>
    </div>
  );
}
