import { beforeAll, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { isSameOrigin } from "@/lib/auth/origin";
import { parseMoney, parseVehicleForm } from "@/lib/admin/vehicle-schema";
import { leadInputSchema } from "@/lib/leads/store";
import { MAX_PHOTOS_PER_VEHICLE, processPhoto } from "@/lib/photos/process";

// o módulo de sessão importa next/headers (só usado nas funções de cookie, não nas de assinatura)
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }));

describe("senha do painel", () => {
  it("o hash não revela a senha e só confere com a senha certa", async () => {
    const h = await hashPassword("uma frase longa e segura");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(h).not.toContain("uma frase");
    expect(await verifyPassword("uma frase longa e segura", h)).toBe(true);
    expect(await verifyPassword("outra senha qualquer", h)).toBe(false);
  });
  it("dois hashes da mesma senha são diferentes (sal aleatório)", async () => {
    expect(await hashPassword("mesma-senha-123")).not.toBe(await hashPassword("mesma-senha-123"));
  });
  it("rejeita formato inválido sem lançar erro", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "texto-qualquer")).toBe(false);
  });
  it("exige senha com 10+ caracteres", () => {
    expect(passwordProblem("curta")).toMatch(/10/);
    expect(passwordProblem("uma-senha-boa-123")).toBeNull();
  });
});

describe("sessão assinada", () => {
  beforeAll(() => {
    process.env.ADMIN_SESSION_SECRET = "x".repeat(48);
  });
  it("aceita um cookie válido e devolve o administrador e a versão", async () => {
    const { decodeSession, encodeSession } = await import("@/lib/auth/session");
    const p = decodeSession(encodeSession("abc123", 4));
    expect(p).toMatchObject({ sub: "abc123", v: 4 });
  });
  it("recusa cookie adulterado, sem assinatura ou de outro formato", async () => {
    const { decodeSession, encodeSession } = await import("@/lib/auth/session");
    const t = encodeSession("abc123", 1);
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "outro", v: 1, exp: 9_999_999_999 })).toString("base64url");
    expect(decodeSession(`${forged}.${sig}`)).toBeNull();
    expect(decodeSession(`${body}.`)).toBeNull();
    expect(decodeSession(body)).toBeNull();
    expect(decodeSession(undefined)).toBeNull();
    expect(decodeSession("lixo")).toBeNull();
  });
  it("expira depois de 7 dias", async () => {
    const { decodeSession, encodeSession } = await import("@/lib/auth/session");
    const now = Date.now();
    const t = encodeSession("abc123", 1, now);
    expect(decodeSession(t, now + 6 * 24 * 3600 * 1000)).not.toBeNull();
    expect(decodeSession(t, now + 8 * 24 * 3600 * 1000)).toBeNull();
  });
  it("não assina nada sem um segredo forte", async () => {
    const { encodeSession } = await import("@/lib/auth/session");
    process.env.ADMIN_SESSION_SECRET = "curto";
    expect(() => encodeSession("a", 1)).toThrow();
    process.env.ADMIN_SESSION_SECRET = "x".repeat(48);
  });
});

describe("origem das requisições (CSRF)", () => {
  const req = (headers: Record<string, string>) => new Request("http://localhost/api", { method: "POST", headers });
  it("aceita a mesma origem e recusa as outras", () => {
    expect(isSameOrigin(req({ origin: "https://loja.com", host: "loja.com" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "loja.com" }))).toBe(false);
    expect(isSameOrigin(req({ host: "loja.com" }))).toBe(false); // sem Origin
    expect(isSameOrigin(req({ origin: "não é url", host: "loja.com" }))).toBe(false);
  });
});

describe("formulário de veículo", () => {
  const base = {
    brand: "Toyota", model: "Corolla", version: "XEi 2.0", year: "2024", mileage: "18.400", price: "R$ 129.900,00",
    transmission: "cvt", fuel: "flex", bodyType: "sedan", color: "Prata", engine: "2.0", doors: "4", condition: "seminovo",
    status: "disponivel", description: "ok",
  };
  const fd = (o: Record<string, string | string[]>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
    return f;
  };
  it("entende dinheiro e números no formato brasileiro", () => {
    expect(parseMoney("R$ 129.900,00")).toBe(129900);
    expect(parseMoney("129.900")).toBe(129900);
    expect(parseMoney("129900")).toBe(129900);
    expect(parseMoney("")).toBeUndefined();
  });
  it("aceita um cadastro válido e normaliza os campos", () => {
    const r = parseVehicleForm(fd({ ...base, featured: "on", features: ["turbo", "inventado"] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toMatchObject({ price: 129900, mileage: 18400, year: 2024, featured: true, features: ["turbo"] });
    }
  });
  it("devolve erro por campo e não aceita enum inventado", () => {
    const r = parseVehicleForm(fd({ ...base, brand: "", price: "", fuel: "vapor", year: "1900" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(expect.arrayContaining(["brand", "price", "fuel", "year"]));
  });
  it("preço antigo precisa ser maior que o atual", () => {
    const r = parseVehicleForm(fd({ ...base, oldPrice: "100.000" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.oldPrice).toBeTruthy();
  });
});

describe("contatos do site", () => {
  it("aceita 'interesse' só com nome e exige WhatsApp em 'venda'", () => {
    expect(leadInputSchema.safeParse({ type: "interesse", name: "Ana" }).success).toBe(true);
    expect(leadInputSchema.safeParse({ type: "venda", name: "Ana" }).success).toBe(false);
    expect(leadInputSchema.safeParse({ type: "venda", name: "Ana", phone: "(44) 99999-0000" }).success).toBe(true);
  });
  it("a isca de robô preenchida invalida o contato", () => {
    expect(leadInputSchema.safeParse({ type: "interesse", name: "Ana", site: "http://spam" }).success).toBe(false);
  });
  it("recusa texto grande demais", () => {
    expect(leadInputSchema.safeParse({ type: "contato", name: "Ana", message: "x".repeat(2000) }).success).toBe(false);
  });
});

describe("fotos", () => {
  it("reduz para 1920 px, vira WebP e corrige a orientação", async () => {
    const big = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#3366cc" } }).jpeg().toBuffer();
    const out = await processPhoto(big);
    expect(out.width).toBe(1920);
    expect(out.height).toBe(1440);
    expect((await sharp(out.data).metadata()).format).toBe("webp");
    expect(out.data.length).toBeLessThan(big.length);
  });
  it("não amplia foto pequena", async () => {
    const small = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#cc3333" } }).png().toBuffer();
    expect((await processPhoto(small)).width).toBe(800);
  });
  it("rejeita arquivo que não é imagem", async () => {
    await expect(processPhoto(Buffer.from("isto não é uma foto"))).rejects.toThrow();
  });
  it("há um limite de fotos por veículo", () => {
    expect(MAX_PHOTOS_PER_VEHICLE).toBeGreaterThan(0);
  });
});
