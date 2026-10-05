/**
 * Modelo de domínio do veículo.
 *
 * Pensado para migração direta para MongoDB: todos os campos são serializáveis
 * (sem Date, Map ou classes), `id` é string (compatível com ObjectId.toHexString())
 * e enums são strings estáveis em minúsculas, sem acento — o rótulo de exibição
 * fica em `lib/vehicles/labels.ts`, nunca no dado.
 */

export const BODY_TYPES = ["suv", "sedan", "hatch", "pickup", "coupe"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const TRANSMISSIONS = ["automatico", "cvt", "automatizado", "manual"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export const FUELS = ["flex", "gasolina", "diesel", "hibrido", "eletrico"] as const;
export type Fuel = (typeof FUELS)[number];

export const CONDITIONS = ["novo", "seminovo", "usado"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const VEHICLE_STATUSES = ["disponivel", "reservado", "vendido"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

/** Equipamentos/opcionais filtráveis. "automático" não está aqui: é derivado do câmbio. */
export const FEATURES = [
  "turbo",
  "4x4",
  "unico-dono",
  "blindado",
  "teto-solar",
  "bancos-couro",
  "multimidia",
  "camera-re",
  "sensor-estacionamento",
  "piloto-automatico",
  "ar-digital",
  "carplay-android-auto",
  "chave-presencial",
  "rodas-liga-leve",
  "farol-led",
] as const;
export type FeatureKey = (typeof FEATURES)[number];

export interface VehicleImage {
  /** Caminho local (/images/cars/...) ou URL absoluta de storage/CDN. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  /** Código de estoque/referência usado no atendimento ("Ref. 0123"). */
  stockCode: string;
  brand: string;
  model: string;
  version: string;
  /** Ano-modelo (o que o cliente procura e o que entra no título). */
  year: number;
  /** Ano de fabricação. Exibido como "2023/2024" quando difere do ano-modelo. */
  manufactureYear: number;
  /** Quilometragem em km. */
  mileage: number;
  /** Preço em reais inteiros (sem centavos). */
  price: number;
  oldPrice?: number;
  transmission: Transmission;
  fuel: Fuel;
  bodyType: BodyType;
  color: string;
  /** Cilindrada como texto curto: "1.0", "2.0", "Elétrico". */
  engine: string;
  /** Potência em cv. */
  power?: number;
  doors: number;
  condition: Condition;
  featured: boolean;
  status: VehicleStatus;
  description: string;
  features: FeatureKey[];
  /** Primeira imagem = capa. */
  images: VehicleImage[];
  /** ISO 8601. */
  createdAt: string;
  updatedAt?: string;
  /** Marca registros de demonstração. Deve ser false/ausente em estoque real. */
  isDemo?: boolean;
}
