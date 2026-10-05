import type { BodyType, Vehicle } from "@/types/vehicle";
import { BODY_TYPES } from "@/types/vehicle";
import { slugify } from "@/lib/slug";
import { bodyTypeLabels } from "@/lib/vehicles/labels";

export interface QuickSearchData {
  brands: { value: string; label: string; models: { value: string; label: string }[] }[];
  priceSteps: number[];
  years: number[];
}

const PRICE_STEPS = [30000, 50000, 70000, 90000, 110000, 130000, 150000, 200000, 250000, 300000, 400000, 500000];

/** Opções da busca rápida derivadas do estoque (nunca oferece opção sem veículo). */
export function buildQuickSearchData(vehicles: Vehicle[]): QuickSearchData {
  const brands = new Map<string, { label: string; models: Map<string, string> }>();
  for (const v of vehicles) {
    const b = slugify(v.brand);
    if (!brands.has(b)) brands.set(b, { label: v.brand, models: new Map() });
    brands.get(b)!.models.set(slugify(v.model), v.model);
  }
  const prices = vehicles.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  // Inclui o degrau imediatamente abaixo do mínimo e acima do máximo.
  const lo = [...PRICE_STEPS].reverse().find((p) => p <= min) ?? PRICE_STEPS[0]!;
  const hi = PRICE_STEPS.find((p) => p >= max) ?? PRICE_STEPS[PRICE_STEPS.length - 1]!;
  const years = [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a);

  return {
    brands: [...brands.entries()]
      .sort((a, b) => a[1].label.localeCompare(b[1].label, "pt-BR"))
      .map(([value, { label, models }]) => ({
        value,
        label,
        models: [...models.entries()]
          .sort((a, b) => a[1].localeCompare(b[1], "pt-BR", { numeric: true }))
          .map(([mv, ml]) => ({ value: mv, label: ml })),
      })),
    priceSteps: PRICE_STEPS.filter((p) => p >= lo && p <= hi),
    years,
  };
}

export interface BodyTypeSummary {
  bodyType: BodyType;
  label: string;
  count: number;
  fromPrice: number;
}

/** Contagem real por carroceria, com "a partir de". Carrocerias sem veículo ficam de fora. */
export function bodyTypeSummaries(vehicles: Vehicle[]): BodyTypeSummary[] {
  return BODY_TYPES.map((bodyType) => {
    const list = vehicles.filter((v) => v.bodyType === bodyType);
    return {
      bodyType,
      label: bodyTypeLabels[bodyType],
      count: list.length,
      fromPrice: list.length ? Math.min(...list.map((v) => v.price)) : 0,
    };
  }).filter((s) => s.count > 0);
}
