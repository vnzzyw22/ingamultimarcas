import { describe, expect, it } from "vitest";
import { demoVehicles } from "@/data/vehicles.demo";
import { applyFilters, sortVehicles } from "@/lib/filters/apply";
import { deriveFacets, pruneDependents } from "@/lib/filters/facets";
import { countActiveFilters, parseFilters, serializeFilters, stockHref } from "@/lib/filters/params";
import { emptyFilters } from "@/lib/filters/types";
import { getVehicles } from "@/lib/vehicles";

const listed = demoVehicles.filter((v) => v.status !== "vendido");
const f = (p: Partial<ReturnType<typeof emptyFilters>>) => ({ ...emptyFilters(), ...p });

describe("dados demo", () => {
  it("slugs e ids são únicos", () => {
    expect(new Set(demoVehicles.map((v) => v.slug)).size).toBe(demoVehicles.length);
    expect(new Set(demoVehicles.map((v) => v.id)).size).toBe(demoVehicles.length);
  });
  it("todos marcados como demo e com imagens", () => {
    for (const v of demoVehicles) {
      expect(v.isDemo).toBe(true);
      expect(v.stockCode.startsWith("DEMO-")).toBe(true);
      expect(v.images.length).toBeGreaterThan(0);
    }
  });
  it("cobre todas as carrocerias exigidas", () => {
    const bodies = new Set(listed.map((v) => v.bodyType));
    for (const b of ["suv", "sedan", "hatch", "pickup", "coupe"]) expect(bodies.has(b as never)).toBe(true);
  });
  it("vendidos não aparecem no estoque público", async () => {
    const list = await getVehicles();
    expect(list.some((v) => v.status === "vendido")).toBe(false);
    expect(list.length).toBe(listed.length);
  });
});

describe("applyFilters", () => {
  it("filtra por marca", () => {
    const r = applyFilters(listed, f({ brand: ["toyota"] }));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((v) => v.brand === "Toyota")).toBe(true);
  });
  it("filtra por faixa de preço (inclusiva)", () => {
    const r = applyFilters(listed, f({ priceMin: 100000, priceMax: 150000 }));
    expect(r.every((v) => v.price >= 100000 && v.price <= 150000)).toBe(true);
    expect(r.some((v) => v.price === 149900)).toBe(true);
  });
  it("combina dimensões com E e valores com OU", () => {
    const r = applyFilters(listed, f({ bodyType: ["suv", "pickup"], fuel: ["diesel"] }));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((v) => v.fuel === "diesel" && ["suv", "pickup"].includes(v.bodyType))).toBe(true);
  });
  it("opcionais exigem todos os itens marcados", () => {
    const r = applyFilters(listed, f({ features: ["4x4", "bancos-couro"] }));
    expect(r.every((v) => v.features.includes("4x4") && v.features.includes("bancos-couro"))).toBe(true);
  });
  it("atalho automático exclui câmbio manual", () => {
    const r = applyFilters(listed, f({ automatic: true }));
    expect(r.some((v) => v.transmission === "manual")).toBe(false);
    expect(r.length).toBe(listed.filter((v) => v.transmission !== "manual").length);
  });
  it("busca livre ignora acento e ordem das palavras", () => {
    expect(applyFilters(listed, f({ q: "2024 corolla" })).every((v) => v.model.startsWith("Corolla"))).toBe(true);
    expect(applyFilters(listed, f({ q: "eletrico" })).map((v) => v.brand)).toEqual(["BYD"]);
    expect(applyFilters(listed, f({ q: "picape diesel" })).every((v) => v.bodyType === "pickup")).toBe(true);
  });
  it("sem filtros retorna tudo", () => {
    expect(applyFilters(listed, emptyFilters()).length).toBe(listed.length);
  });
});

describe("sortVehicles", () => {
  it("menor preço / maior km / recentes", () => {
    const byPrice = sortVehicles(listed, "menor-preco").map((v) => v.price);
    expect(byPrice).toEqual([...byPrice].sort((a, b) => a - b));
    const byKm = sortVehicles(listed, "maior-km").map((v) => v.mileage);
    expect(byKm).toEqual([...byKm].sort((a, b) => b - a));
    const recent = sortVehicles(listed, "recentes");
    expect(recent[0]!.createdAt >= recent[recent.length - 1]!.createdAt).toBe(true);
  });
});

describe("facetas", () => {
  it("modelos dependem das marcas selecionadas", () => {
    const facets = deriveFacets(listed, f({ brand: ["honda"] }));
    expect(facets.model.map((m) => m.label).sort()).toEqual(["City", "Civic", "HR-V"]);
  });
  it("só oferece opções existentes nos dados", () => {
    const facets = deriveFacets(listed, emptyFilters());
    expect(facets.bodyType.map((o) => o.value)).toEqual(["suv", "sedan", "hatch", "pickup", "coupe"]);
    expect(facets.doors.map((o) => o.value)).toEqual([2, 4]);
  });
  it("contagem considera os demais filtros", () => {
    const facets = deriveFacets(listed, f({ bodyType: ["pickup"] }));
    const toyota = facets.brand.find((b) => b.value === "toyota");
    expect(toyota?.count).toBe(1);
    const suv = facets.bodyType.find((b) => b.value === "suv");
    expect(suv?.count).toBe(listed.filter((v) => v.bodyType === "suv").length);
  });
  it("remove modelos órfãos ao trocar marca", () => {
    const next = pruneDependents(listed, f({ brand: ["honda"], model: ["corolla", "civic"], version: ["xei-2-0"] }));
    expect(next.model).toEqual(["civic"]);
    expect(next.version).toEqual([]);
  });
});

describe("URL", () => {
  it("ida e volta preserva filtros e ordenação", () => {
    const original = f({ brand: ["toyota", "honda"], priceMax: 150000, bodyType: ["suv"], automatic: true, features: ["teto-solar"] });
    const params = serializeFilters(original, "menor-preco");
    const { filters, sort } = parseFilters(params);
    expect(filters).toEqual(original);
    expect(sort).toBe("menor-preco");
  });
  it("ignora valores inválidos", () => {
    const { filters, sort } = parseFilters(new URLSearchParams("carroceria=suv,foguete&ordem=xyz&preco-max=abc"));
    expect(filters.bodyType).toEqual(["suv"]);
    expect(filters.priceMax).toBeUndefined();
    expect(sort).toBe("recentes");
  });
  it("stockHref gera link de atalho", () => {
    expect(stockHref({ bodyType: ["suv"] })).toBe("/estoque?carroceria=suv");
    expect(stockHref()).toBe("/estoque");
  });
  it("conta filtros ativos (faixa conta 1)", () => {
    expect(countActiveFilters(f({ priceMin: 1, priceMax: 2, brand: ["a", "b"] }))).toBe(3);
  });
});
