import { BODY_TYPES, CONDITIONS, FEATURES, FUELS, TRANSMISSIONS } from "@/types/vehicle";
import {
  DEFAULT_SORT,
  SORT_KEYS,
  emptyFilters,
  type SortKey,
  type VehicleFilters,
} from "@/lib/filters/types";

/**
 * Serialização filtros ⇄ URL. A URL é a fonte de verdade do estoque:
 * permite compartilhar, voltar no histórico e linkar atalhos da home
 * (ex.: /estoque?carroceria=suv).
 */
export const PARAM = {
  q: "q",
  brand: "marca",
  model: "modelo",
  version: "versao",
  priceMin: "preco-min",
  priceMax: "preco-max",
  yearMin: "ano-min",
  yearMax: "ano-max",
  kmMin: "km-min",
  kmMax: "km-max",
  bodyType: "carroceria",
  transmission: "cambio",
  fuel: "combustivel",
  color: "cor",
  doors: "portas",
  engine: "motor",
  features: "opcionais",
  automatic: "automatico",
  condition: "condicao",
  sort: "ordem",
} as const;

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function getAll(src: ParamSource, key: string): string[] {
  const raw =
    src instanceof URLSearchParams ? src.getAll(key) : ([] as string[]).concat(src[key] ?? []);
  return raw
    .flatMap((r) => r.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
}

function getOne(src: ParamSource, key: string): string | undefined {
  return getAll(src, key)[0];
}

function num(src: ParamSource, key: string): number | undefined {
  const s = getOne(src, key);
  if (s === undefined) return undefined;
  const n = Number(s.replace(/\D/g, ""));
  return Number.isFinite(n) && s.replace(/\D/g, "") !== "" ? n : undefined;
}

function oneOf<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return [...new Set(values)].filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export function parseFilters(src: ParamSource): { filters: VehicleFilters; sort: SortKey } {
  const f = emptyFilters();
  f.q = getOne(src, PARAM.q) ?? "";
  f.brand = [...new Set(getAll(src, PARAM.brand))];
  f.model = [...new Set(getAll(src, PARAM.model))];
  f.version = [...new Set(getAll(src, PARAM.version))];
  f.color = [...new Set(getAll(src, PARAM.color))];
  f.engine = [...new Set(getAll(src, PARAM.engine))];
  f.priceMin = num(src, PARAM.priceMin);
  f.priceMax = num(src, PARAM.priceMax);
  f.yearMin = num(src, PARAM.yearMin);
  f.yearMax = num(src, PARAM.yearMax);
  f.kmMin = num(src, PARAM.kmMin);
  f.kmMax = num(src, PARAM.kmMax);
  f.bodyType = oneOf(getAll(src, PARAM.bodyType), BODY_TYPES);
  f.transmission = oneOf(getAll(src, PARAM.transmission), TRANSMISSIONS);
  f.fuel = oneOf(getAll(src, PARAM.fuel), FUELS);
  f.condition = oneOf(getAll(src, PARAM.condition), CONDITIONS);
  f.features = oneOf(getAll(src, PARAM.features), FEATURES);
  f.doors = [...new Set(getAll(src, PARAM.doors).map(Number))].filter(
    (n) => Number.isInteger(n) && n > 0,
  );
  f.automatic = getOne(src, PARAM.automatic) === "1";

  const sortRaw = getOne(src, PARAM.sort);
  const sort = (SORT_KEYS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as SortKey)
    : DEFAULT_SORT;
  return { filters: f, sort };
}

export function serializeFilters(f: VehicleFilters, sort: SortKey = DEFAULT_SORT): URLSearchParams {
  const p = new URLSearchParams();
  const list = (key: string, values: readonly (string | number)[]) => {
    if (values.length) p.set(key, values.join(","));
  };
  const n = (key: string, value?: number) => {
    if (value !== undefined) p.set(key, String(value));
  };
  if (f.q.trim()) p.set(PARAM.q, f.q.trim());
  list(PARAM.brand, f.brand);
  list(PARAM.model, f.model);
  list(PARAM.version, f.version);
  n(PARAM.priceMin, f.priceMin);
  n(PARAM.priceMax, f.priceMax);
  n(PARAM.yearMin, f.yearMin);
  n(PARAM.yearMax, f.yearMax);
  n(PARAM.kmMin, f.kmMin);
  n(PARAM.kmMax, f.kmMax);
  list(PARAM.bodyType, f.bodyType);
  list(PARAM.transmission, f.transmission);
  list(PARAM.fuel, f.fuel);
  list(PARAM.color, f.color);
  list(PARAM.doors, f.doors);
  list(PARAM.engine, f.engine);
  list(PARAM.features, f.features);
  if (f.automatic) p.set(PARAM.automatic, "1");
  list(PARAM.condition, f.condition);
  if (sort !== DEFAULT_SORT) p.set(PARAM.sort, sort);
  return p;
}

export function stockHref(partial: Partial<VehicleFilters> = {}, sort?: SortKey): string {
  const qs = serializeFilters({ ...emptyFilters(), ...partial }, sort).toString();
  return qs ? `/estoque?${qs}` : "/estoque";
}

export function countActiveFilters(f: VehicleFilters): number {
  let n = f.q.trim() ? 1 : 0;
  n += f.brand.length + f.model.length + f.version.length;
  n += f.bodyType.length + f.transmission.length + f.fuel.length + f.color.length;
  n += f.doors.length + f.engine.length + f.features.length + f.condition.length;
  if (f.automatic) n++;
  if (f.priceMin !== undefined || f.priceMax !== undefined) n++;
  if (f.yearMin !== undefined || f.yearMax !== undefined) n++;
  if (f.kmMin !== undefined || f.kmMax !== undefined) n++;
  return n;
}
