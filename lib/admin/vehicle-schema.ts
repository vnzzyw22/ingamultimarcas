import { z } from "zod";
import { BODY_TYPES, CONDITIONS, FEATURES, FUELS, TRANSMISSIONS, VEHICLE_STATUSES } from "@/types/vehicle";

/** "129.900", "R$ 129.900,00", "129900" → 129900 (reais inteiros; o site não usa centavos). */
export function parseMoney(raw: unknown): number | undefined {
  if (typeof raw === "number") return Math.round(raw);
  if (typeof raw !== "string") return undefined;
  const cleaned = raw.replace(/[R$\s]/g, "").replace(/,\d{1,2}$/, ""); // tira centavos
  const digits = cleaned.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
}
const intFrom = (raw: unknown): number | undefined => {
  if (typeof raw === "number") return Math.trunc(raw);
  if (typeof raw !== "string") return undefined;
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : undefined;
};
const text = (max: number, min = 0) =>
  z.string().trim().min(min, min ? "Obrigatório." : undefined).max(max, `No máximo ${max} caracteres.`);
const oneOf = <T extends readonly [string, ...string[]]>(values: T, msg: string) =>
  z.string().refine((v) => (values as readonly string[]).includes(v), msg) as unknown as z.ZodType<T[number]>;

const thisYear = new Date().getFullYear();

/** Esquema do formulário do painel. Recebe os campos já lidos do FormData (tudo texto). */
export const vehicleFormSchema = z
  .object({
    brand: text(40, 1),
    model: text(60, 1),
    version: text(80),
    year: z.preprocess(intFrom, z.number({ message: "Informe o ano." }).int().min(1980, "Ano inválido.").max(thisYear + 1, "Ano inválido.")),
    manufactureYear: z.preprocess(intFrom, z.number().int().min(1980).max(thisYear + 1).optional()),
    mileage: z.preprocess(intFrom, z.number({ message: "Informe a quilometragem." }).int().min(0).max(999_999, "Quilometragem inválida.")),
    price: z.preprocess(parseMoney, z.number({ message: "Informe o preço." }).int().min(1, "Informe o preço.").max(99_999_999)),
    oldPrice: z.preprocess(parseMoney, z.number().int().min(1).max(99_999_999).optional()),
    transmission: oneOf(TRANSMISSIONS, "Escolha o câmbio."),
    fuel: oneOf(FUELS, "Escolha o combustível."),
    bodyType: oneOf(BODY_TYPES, "Escolha a carroceria."),
    color: text(30, 1),
    engine: text(20, 1),
    power: z.preprocess(intFrom, z.number().int().min(1).max(2000).optional()),
    doors: z.preprocess(intFrom, z.number().int().min(2).max(5)),
    condition: oneOf(CONDITIONS, "Escolha a condição."),
    status: oneOf(VEHICLE_STATUSES, "Escolha a situação."),
    featured: z.boolean(),
    description: text(2000),
    features: z.array(z.string()).transform((a) => a.filter((f): f is (typeof FEATURES)[number] => (FEATURES as readonly string[]).includes(f))),
  })
  .refine((v) => !v.manufactureYear || v.manufactureYear <= v.year + 1, { path: ["manufactureYear"], message: "Não pode ser bem maior que o ano-modelo." })
  .refine((v) => !v.oldPrice || v.oldPrice > v.price, { path: ["oldPrice"], message: "O preço antigo deve ser maior que o preço atual." });

export type VehicleFormInput = z.output<typeof vehicleFormSchema>;
export type FieldErrors = Partial<Record<string, string>>;

/** Lê o FormData do painel e valida. Devolve os dados ou os erros por campo (para mostrar junto de cada input). */
export function parseVehicleForm(fd: FormData): { ok: true; data: VehicleFormInput } | { ok: false; errors: FieldErrors } {
  const get = (k: string) => (fd.get(k) as string | null) ?? "";
  const parsed = vehicleFormSchema.safeParse({
    brand: get("brand"),
    model: get("model"),
    version: get("version"),
    year: get("year"),
    manufactureYear: get("manufactureYear"),
    mileage: get("mileage"),
    price: get("price"),
    oldPrice: get("oldPrice"),
    transmission: get("transmission"),
    fuel: get("fuel"),
    bodyType: get("bodyType"),
    color: get("color"),
    engine: get("engine"),
    power: get("power"),
    doors: get("doors") || "4",
    condition: get("condition"),
    status: get("status") || "disponivel",
    featured: fd.get("featured") === "on",
    description: get("description"),
    features: fd.getAll("features").map(String),
  });
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return { ok: false, errors };
}
