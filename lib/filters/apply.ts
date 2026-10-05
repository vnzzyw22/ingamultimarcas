import type { Vehicle } from "@/types/vehicle";
import type { ListDimension, SortKey, VehicleFilters } from "@/lib/filters/types";
import { slugify } from "@/lib/slug";
import {
  AUTOMATIC_TRANSMISSIONS,
  bodyTypeLabels,
  conditionLabels,
  fuelLabels,
  transmissionLabels,
} from "@/lib/vehicles/labels";

/** Valor de um veículo em uma dimensão de lista, no mesmo formato guardado no filtro. */
export function dimensionValue(v: Vehicle, dim: Exclude<ListDimension, "features">): string | number {
  switch (dim) {
    case "brand":
      return slugify(v.brand);
    case "model":
      return slugify(v.model);
    case "version":
      return slugify(v.version);
    case "color":
      return slugify(v.color);
    case "engine":
      return slugify(v.engine);
    case "doors":
      return v.doors;
    case "bodyType":
      return v.bodyType;
    case "transmission":
      return v.transmission;
    case "fuel":
      return v.fuel;
    case "condition":
      return v.condition;
  }
}

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function searchHaystack(v: Vehicle): string {
  return normalize(
    [
      v.brand,
      v.model,
      v.version,
      v.year,
      v.manufactureYear,
      v.color,
      v.engine,
      v.stockCode,
      bodyTypeLabels[v.bodyType],
      fuelLabels[v.fuel],
      transmissionLabels[v.transmission],
      conditionLabels[v.condition],
    ].join(" "),
  );
}

/** Todas as palavras da busca precisam aparecer (ordem livre): "corolla 2024", "suv diesel". */
export function matchesQuery(v: Vehicle, q: string): boolean {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = searchHaystack(v);
  return terms.every((t) => hay.includes(t));
}

function inRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Aplica filtros. Dentro de uma dimensão é OU (SUV ou Sedan); entre dimensões é E.
 * Opcionais são E (precisa ter todos os marcados).
 * `except` ignora uma dimensão — usado para calcular contagens de facetas.
 */
export function matchesFilters(
  v: Vehicle,
  f: VehicleFilters,
  except?: ListDimension | "automatic",
): boolean {
  if (!matchesQuery(v, f.q)) return false;
  if (!inRange(v.price, f.priceMin, f.priceMax)) return false;
  if (!inRange(v.year, f.yearMin, f.yearMax)) return false;
  if (!inRange(v.mileage, f.kmMin, f.kmMax)) return false;

  const listDims = [
    "brand",
    "model",
    "version",
    "bodyType",
    "transmission",
    "fuel",
    "color",
    "doors",
    "engine",
    "condition",
  ] as const;
  for (const dim of listDims) {
    if (dim === except) continue;
    const selected = f[dim] as readonly (string | number)[];
    if (selected.length > 0 && !selected.includes(dimensionValue(v, dim))) return false;
  }

  if (except !== "features" && f.features.length > 0) {
    if (!f.features.every((feat) => v.features.includes(feat))) return false;
  }
  if (except !== "automatic" && f.automatic && !AUTOMATIC_TRANSMISSIONS.includes(v.transmission)) {
    return false;
  }
  return true;
}

export function applyFilters(vehicles: Vehicle[], f: VehicleFilters): Vehicle[] {
  return vehicles.filter((v) => matchesFilters(v, f));
}

export function sortVehicles(vehicles: Vehicle[], sort: SortKey): Vehicle[] {
  const list = [...vehicles];
  switch (sort) {
    case "menor-preco":
      return list.sort((a, b) => a.price - b.price);
    case "maior-preco":
      return list.sort((a, b) => b.price - a.price);
    case "menor-km":
      return list.sort((a, b) => a.mileage - b.mileage);
    case "maior-km":
      return list.sort((a, b) => b.mileage - a.mileage);
    case "recentes":
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
