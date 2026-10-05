import type { Vehicle } from "@/types/vehicle";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
const brlCents = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const int = new Intl.NumberFormat("pt-BR");

/** 129900 → "R$ 129.900" (sem ",00": centavos não ajudam a decidir). */
export function formatPrice(value: number): string {
  return brl.format(value).replace(/ /g, " ");
}

/** Para parcelas, onde centavos importam. */
export function formatMoney(value: number): string {
  return brlCents.format(value).replace(/ /g, " ");
}

/** 18400 → "18.400 km"; 0 → "0 km" */
export function formatMileage(km: number): string {
  return `${int.format(km)} km`;
}

export function formatNumber(n: number): string {
  return int.format(n);
}

/** "2023/2024" quando fabricação ≠ modelo; senão "2024". */
export function formatYear(v: Pick<Vehicle, "year" | "manufactureYear">): string {
  return v.manufactureYear !== v.year ? `${v.manufactureYear}/${v.year}` : String(v.year);
}

export function vehicleName(v: Pick<Vehicle, "brand" | "model">): string {
  return `${v.brand} ${v.model}`;
}

export function vehicleFullName(v: Pick<Vehicle, "brand" | "model" | "version" | "year">): string {
  return `${v.brand} ${v.model} ${v.version} ${v.year}`;
}

/** Extrai dígitos de um texto ("R$ 120.000" → 120000). Retorna undefined se vazio. */
export function parseDigits(input: string): number | undefined {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
}
