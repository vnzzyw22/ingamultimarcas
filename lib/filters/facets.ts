import type { BodyType, Condition, FeatureKey, Fuel, Transmission, Vehicle } from "@/types/vehicle";
import { BODY_TYPES, CONDITIONS, FEATURES, FUELS, TRANSMISSIONS } from "@/types/vehicle";
import type { ListDimension, VehicleFilters } from "@/lib/filters/types";
import { dimensionValue, matchesFilters } from "@/lib/filters/apply";
import { slugify } from "@/lib/slug";
import {
  AUTOMATIC_TRANSMISSIONS,
  bodyTypeLabels,
  conditionLabels,
  featureLabels,
  fuelLabels,
  transmissionLabels,
} from "@/lib/vehicles/labels";

export interface FacetOption<T extends string | number = string> {
  value: T;
  label: string;
  /** Quantos veículos aparecem se esta opção for somada aos filtros atuais. */
  count: number;
}

export interface Bounds {
  min: number;
  max: number;
}

export interface Facets {
  brand: FacetOption[];
  model: FacetOption[];
  version: FacetOption[];
  bodyType: FacetOption<BodyType>[];
  transmission: FacetOption<Transmission>[];
  fuel: FacetOption<Fuel>[];
  color: FacetOption[];
  doors: FacetOption<number>[];
  engine: FacetOption[];
  features: FacetOption<FeatureKey>[];
  condition: FacetOption<Condition>[];
  automaticCount: number;
  price: Bounds;
  year: Bounds;
  km: Bounds;
}

function bounds(values: number[]): Bounds {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Opções distintas de uma dimensão textual, com rótulo original e contagem contextual. */
function textOptions(
  pool: Vehicle[],
  all: Vehicle[],
  f: VehicleFilters,
  dim: "brand" | "model" | "version" | "color" | "engine",
  raw: (v: Vehicle) => string,
): FacetOption[] {
  const labels = new Map<string, string>();
  for (const v of pool) labels.set(slugify(raw(v)), raw(v));
  // Mantém visíveis opções já selecionadas mesmo que tenham saído do pool.
  for (const sel of f[dim]) {
    if (!labels.has(sel)) {
      const hit = all.find((v) => slugify(raw(v)) === sel);
      if (hit) labels.set(sel, raw(hit));
    }
  }
  return [...labels.entries()]
    .map(([value, label]) => ({
      value,
      label,
      count: all.filter((v) => matchesFilters(v, f, dim) && dimensionValue(v, dim) === value).length,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { numeric: true }));
}

function enumOptions<T extends string>(
  all: Vehicle[],
  f: VehicleFilters,
  dim: "bodyType" | "transmission" | "fuel" | "condition",
  order: readonly T[],
  labels: Record<T, string>,
): FacetOption<T>[] {
  const present = new Set(all.map((v) => dimensionValue(v, dim)));
  return order
    .filter((value) => present.has(value))
    .map((value) => ({
      value,
      label: labels[value],
      count: all.filter((v) => matchesFilters(v, f, dim) && dimensionValue(v, dim) === value).length,
    }));
}

/**
 * Deriva todas as opções de filtro a partir dos dados — nunca oferece opção sem
 * correspondência no estoque. Modelos dependem das marcas escolhidas; versões
 * dependem dos modelos escolhidos.
 */
export function deriveFacets(all: Vehicle[], f: VehicleFilters): Facets {
  const brandPool = all;
  const modelPool = f.brand.length ? all.filter((v) => f.brand.includes(slugify(v.brand))) : all;
  const versionPool = f.model.length
    ? modelPool.filter((v) => f.model.includes(slugify(v.model)))
    : modelPool;

  const presentFeatures = new Set(all.flatMap((v) => v.features));

  const doorValues = [...new Set(all.map((v) => v.doors))].sort((a, b) => a - b);

  return {
    brand: textOptions(brandPool, all, f, "brand", (v) => v.brand),
    model: textOptions(modelPool, all, f, "model", (v) => v.model),
    version: f.model.length ? textOptions(versionPool, all, f, "version", (v) => v.version) : [],
    color: textOptions(all, all, f, "color", (v) => v.color),
    engine: textOptions(all, all, f, "engine", (v) => v.engine),
    bodyType: enumOptions(all, f, "bodyType", BODY_TYPES, bodyTypeLabels),
    transmission: enumOptions(all, f, "transmission", TRANSMISSIONS, transmissionLabels),
    fuel: enumOptions(all, f, "fuel", FUELS, fuelLabels),
    condition: enumOptions(all, f, "condition", CONDITIONS, conditionLabels),
    doors: doorValues.map((value) => ({
      value,
      label: `${value} portas`,
      count: all.filter((v) => matchesFilters(v, f, "doors") && v.doors === value).length,
    })),
    features: FEATURES.filter((k) => presentFeatures.has(k)).map((value) => ({
      value,
      label: featureLabels[value],
      count: all.filter(
        (v) => matchesFilters(v, { ...f, features: [...new Set([...f.features, value])] }),
      ).length,
    })),
    automaticCount: all.filter(
      (v) => matchesFilters(v, f, "automatic") && AUTOMATIC_TRANSMISSIONS.includes(v.transmission),
    ).length,
    price: bounds(all.map((v) => v.price)),
    year: bounds(all.map((v) => v.year)),
    km: bounds(all.map((v) => v.mileage)),
  };
}

/**
 * Remove seleções órfãs: modelos cuja marca saiu da seleção e versões cujo
 * modelo saiu. Chamar sempre que marca/modelo mudarem.
 */
export function pruneDependents(all: Vehicle[], f: VehicleFilters): VehicleFilters {
  let model = f.model;
  if (f.brand.length) {
    const allowed = new Set(
      all.filter((v) => f.brand.includes(slugify(v.brand))).map((v) => slugify(v.model)),
    );
    model = model.filter((m) => allowed.has(m));
  }
  let version = f.version;
  if (!model.length) version = [];
  else {
    const allowed = new Set(
      all.filter((v) => model.includes(slugify(v.model))).map((v) => slugify(v.version)),
    );
    version = version.filter((x) => allowed.has(x));
  }
  return model === f.model && version === f.version ? f : { ...f, model, version };
}

export type { ListDimension };
