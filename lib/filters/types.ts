import type { BodyType, Condition, FeatureKey, Fuel, Transmission } from "@/types/vehicle";

/**
 * Estado completo de filtros do estoque.
 * Dimensões textuais (marca, modelo, versão, cor, motor) guardam o SLUG do valor,
 * para que a URL fique legível (/estoque?marca=toyota&modelo=corolla-cross).
 */
export interface VehicleFilters {
  q: string;
  brand: string[];
  model: string[];
  version: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMin?: number;
  kmMax?: number;
  bodyType: BodyType[];
  transmission: Transmission[];
  fuel: Fuel[];
  color: string[];
  doors: number[];
  engine: string[];
  features: FeatureKey[];
  /** Atalho "automático": qualquer câmbio não manual. */
  automatic: boolean;
  condition: Condition[];
}

export const SORT_KEYS = ["recentes", "menor-preco", "maior-preco", "menor-km", "maior-km"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const sortLabels: Record<SortKey, string> = {
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "menor-km": "Menor quilometragem",
  "maior-km": "Maior quilometragem",
};

export const DEFAULT_SORT: SortKey = "recentes";

export function emptyFilters(): VehicleFilters {
  return {
    q: "",
    brand: [],
    model: [],
    version: [],
    bodyType: [],
    transmission: [],
    fuel: [],
    color: [],
    doors: [],
    engine: [],
    features: [],
    automatic: false,
    condition: [],
  };
}

/** Dimensões de múltipla escolha (todas exceto texto, faixas e o booleano). */
export type ListDimension =
  | "brand"
  | "model"
  | "version"
  | "bodyType"
  | "transmission"
  | "fuel"
  | "color"
  | "doors"
  | "engine"
  | "features"
  | "condition";

export type RangeDimension = "price" | "year" | "km";
