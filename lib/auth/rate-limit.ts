import { headers } from "next/headers";
import { getDb } from "@/lib/db/mongo";

/** Limite de taxa simples, guardado no MongoDB (coleção com TTL). Serve para login e formulários públicos. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim().slice(0, 64);
}

export async function tooManyAttempts(key: string, max: number, windowMs: number): Promise<boolean> {
  const db = await getDb();
  const n = await db.collection("rateLimits").countDocuments({ key, at: { $gt: new Date(Date.now() - windowMs) } });
  return n >= max;
}

export async function recordAttempt(key: string): Promise<void> {
  const db = await getDb();
  await db.collection("rateLimits").insertOne({ key, at: new Date() });
}

export async function clearAttempts(key: string): Promise<void> {
  const db = await getDb();
  await db.collection("rateLimits").deleteMany({ key });
}
