import { describe, expect, it } from "vitest";
import { demoVehicles } from "@/data/vehicles.demo";
import { simulateFinancing } from "@/lib/finance";
import { formatMileage, formatPrice, formatYear } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { rankSimilar } from "@/lib/vehicles/similar";
import { tradeInMessage, vehicleInterestMessage, whatsappUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

describe("format", () => {
  it("preço, km e ano", () => {
    expect(formatPrice(129900)).toBe("R$ 129.900");
    expect(formatMileage(18400)).toBe("18.400 km");
    expect(formatYear({ year: 2024, manufactureYear: 2023 })).toBe("2023/2024");
    expect(formatYear({ year: 2024, manufactureYear: 2024 })).toBe("2024");
  });
  it("slugify", () => {
    expect(slugify("Toyota Corolla XEi 2.0 2024")).toBe("toyota-corolla-xei-2-0-2024");
    expect(slugify("BMW 420i Coupé")).toBe("bmw-420i-coupe");
  });
});

describe("whatsapp", () => {
  const corolla = demoVehicles.find((v) => v.slug === "toyota-corolla-xei-2-0-2024")!;
  it("mensagem contextual do veículo", () => {
    expect(vehicleInterestMessage(corolla)).toBe(
      "Olá! Tenho interesse no Toyota Corolla XEi 2.0 2024 anunciado pela Ingá Multimarcas por R$ 129.900 (ref. DEMO-001). Gostaria de receber mais informações.",
    );
  });
  it("link usa o número central e codifica o texto", () => {
    const url = whatsappUrl("Olá & tchau");
    expect(url).toBe(`https://wa.me/${siteConfig.contact.whatsapp}?text=Ol%C3%A1%20%26%20tchau`);
  });
  it("mensagem de avaliação estruturada", () => {
    const msg = tradeInMessage({ name: "Ana", whatsapp: "(44) 99999-0000", brand: "Fiat", model: "Argo", year: "2020", mileage: "45000", notes: "" });
    expect(msg).toContain("*Veículo:* Fiat Argo");
    expect(msg).toContain("*Quilometragem:* 45.000 km");
    expect(msg).not.toContain("Observações");
  });
});

describe("financiamento", () => {
  it("tabela Price confere com cálculo de referência", () => {
    const r = simulateFinancing({ vehicleValue: 100000, downPayment: 30000, installments: 48, monthlyRate: 0.0189 });
    expect(r.financed).toBe(70000);
    // 70000·0.0189/(1−1.0189^−48) = 1323/0.59292 ≈ 2231.35
    expect(r.installment).toBeCloseTo(2231.35, 1);
    expect(r.total).toBeCloseTo(r.installment * 48, 6);
  });
  it("entrada ≥ valor zera o financiamento", () => {
    expect(simulateFinancing({ vehicleValue: 50000, downPayment: 60000, installments: 12 }).installment).toBe(0);
  });
  it("taxa zero divide igualmente", () => {
    expect(simulateFinancing({ vehicleValue: 12000, downPayment: 0, installments: 12, monthlyRate: 0 }).installment).toBe(1000);
  });
});

describe("semelhantes", () => {
  it("prioriza mesma carroceria e faixa de preço, sem incluir o próprio", () => {
    const base = demoVehicles.find((v) => v.slug.startsWith("jeep-compass"))!;
    const pool = demoVehicles.filter((v) => v.status !== "vendido");
    const r = rankSimilar(base, pool, 4);
    expect(r).toHaveLength(4);
    expect(r.some((v) => v.id === base.id)).toBe(false);
    expect(r.every((v) => v.bodyType === "suv")).toBe(true);
  });
});
