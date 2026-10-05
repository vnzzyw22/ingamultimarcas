import { siteConfig } from "@/config/site";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage, formatPrice, formatYear } from "@/lib/format";

/** Único ponto que monta links do WhatsApp. O número vem de config/site.ts. */
export function whatsappUrl(message: string, phone: string = siteConfig.contact.whatsapp): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function vehicleInterestMessage(
  v: Pick<Vehicle, "brand" | "model" | "version" | "year" | "price" | "stockCode">,
): string {
  return (
    `Olá! Tenho interesse no ${v.brand} ${v.model} ${v.version} ${v.year} ` +
    `anunciado pela ${siteConfig.name} por ${formatPrice(v.price)} (ref. ${v.stockCode}). ` +
    `Gostaria de receber mais informações.`
  );
}

export function vehicleWhatsappUrl(v: Parameters<typeof vehicleInterestMessage>[0]): string {
  return whatsappUrl(vehicleInterestMessage(v));
}

export interface TradeInData {
  name: string;
  whatsapp: string;
  brand: string;
  model: string;
  version?: string;
  year: string;
  mileage: string;
  notes?: string;
}

/** Mensagem estruturada do "Venda seu carro". Nada é salvo — o envio é pelo WhatsApp do usuário. */
export function tradeInMessage(d: TradeInData): string {
  const km = Number(d.mileage.replace(/\D/g, ""));
  const lines = [
    `Olá! Quero avaliar meu veículo com a ${siteConfig.name}.`,
    "",
    `*Nome:* ${d.name}`,
    `*WhatsApp:* ${d.whatsapp}`,
    `*Veículo:* ${d.brand} ${d.model}${d.version ? ` ${d.version}` : ""}`,
    `*Ano:* ${d.year}`,
    `*Quilometragem:* ${Number.isFinite(km) ? formatMileage(km) : d.mileage}`,
  ];
  if (d.notes?.trim()) lines.push(`*Observações:* ${d.notes.trim()}`);
  return lines.join("\n");
}

export function financeMessage(input: {
  vehicleValue: number;
  downPayment: number;
  installments: number;
  installmentValue: string;
  vehicle?: Pick<Vehicle, "brand" | "model" | "version" | "year" | "manufactureYear">;
}): string {
  const subject = input.vehicle
    ? `o ${input.vehicle.brand} ${input.vehicle.model} ${input.vehicle.version} ${formatYear(input.vehicle)}`
    : "um veículo";
  return (
    `Olá! Fiz uma simulação no site para ${subject}: valor ${formatPrice(input.vehicleValue)}, ` +
    `entrada ${formatPrice(input.downPayment)}, ${input.installments}x de aprox. ${input.installmentValue}. ` +
    `Gostaria de uma análise de crédito.`
  );
}
