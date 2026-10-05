import type { Facets } from "@/lib/filters/facets";
import type { VehicleFilters } from "@/lib/filters/types";
import { formatMileage, formatPrice } from "@/lib/format";

export interface ActiveChip {
  id: string;
  label: string;
  /** Filtros resultantes ao remover este chip. */
  remove: (f: VehicleFilters) => VehicleFilters;
}

function rangeLabel(
  prefix: string,
  min: number | undefined,
  max: number | undefined,
  fmt: (n: number) => string,
): string {
  if (min !== undefined && max !== undefined) return `${prefix} ${fmt(min)} – ${fmt(max)}`;
  if (min !== undefined) return `${prefix} a partir de ${fmt(min)}`;
  return `${prefix} até ${fmt(max as number)}`;
}

type ListKey = "brand" | "model" | "version" | "bodyType" | "transmission" | "fuel" | "color" | "engine" | "features" | "condition";

export function activeChips(f: VehicleFilters, facets: Facets): ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (f.q.trim()) {
    chips.push({ id: "q", label: `“${f.q.trim()}”`, remove: (x) => ({ ...x, q: "" }) });
  }

  const listKeys: ListKey[] = ["brand", "model", "version", "bodyType", "condition", "transmission", "fuel", "color", "engine", "features"];
  for (const key of listKeys) {
    const options = facets[key];
    for (const value of f[key] as string[]) {
      const label = options.find((o) => o.value === value)?.label ?? value;
      chips.push({
        id: `${key}:${value}`,
        label: key === "engine" ? `Motor ${label}` : label,
        remove: (x) => ({ ...x, [key]: (x[key] as string[]).filter((v) => v !== value) }),
      });
    }
  }

  for (const d of f.doors) {
    chips.push({ id: `doors:${d}`, label: `${d} portas`, remove: (x) => ({ ...x, doors: x.doors.filter((v) => v !== d) }) });
  }
  if (f.automatic) {
    chips.push({ id: "automatic", label: "Automático", remove: (x) => ({ ...x, automatic: false }) });
  }
  if (f.priceMin !== undefined || f.priceMax !== undefined) {
    chips.push({
      id: "price",
      label: rangeLabel("Preço", f.priceMin, f.priceMax, formatPrice),
      remove: (x) => ({ ...x, priceMin: undefined, priceMax: undefined }),
    });
  }
  if (f.yearMin !== undefined || f.yearMax !== undefined) {
    chips.push({
      id: "year",
      label: rangeLabel("Ano", f.yearMin, f.yearMax, String),
      remove: (x) => ({ ...x, yearMin: undefined, yearMax: undefined }),
    });
  }
  if (f.kmMin !== undefined || f.kmMax !== undefined) {
    chips.push({
      id: "km",
      label: rangeLabel("Km", f.kmMin, f.kmMax, formatMileage),
      remove: (x) => ({ ...x, kmMin: undefined, kmMax: undefined }),
    });
  }
  return chips;
}
