import { MongoClient, type Db } from "mongodb";

/**
 * Conexão única com o MongoDB Atlas. Em desenvolvimento o módulo é recarregado a cada edição,
 * então o cliente fica numa variável global para não abrir uma conexão nova a cada vez.
 */
declare global {
  var __ingaMongo: { client: Promise<MongoClient>; indexes?: Promise<void> } | undefined;
}

/**
 * Sem MONGODB_URI (ou com USE_DEMO_DATA=1, usado nos testes e2e) o site usa o estoque demonstrativo
 * de data/vehicles.demo.ts e o painel fica indisponível.
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI) && process.env.USE_DEMO_DATA !== "1";
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri || process.env.USE_DEMO_DATA === "1") throw new Error("Banco de dados não configurado (MONGODB_URI).");
  globalThis.__ingaMongo ??= { client: new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 }).connect() };
  const db = (await globalThis.__ingaMongo.client).db();
  globalThis.__ingaMongo.indexes ??= ensureIndexes(db);
  await globalThis.__ingaMongo.indexes;
  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("vehicles").createIndex({ slug: 1 }, { unique: true }),
    db.collection("vehicles").createIndex({ status: 1, createdAt: -1 }),
    db.collection("photos").createIndex({ vehicleId: 1 }),
    db.collection("leads").createIndex({ createdAt: -1 }),
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    // tentativas de login e de envio de formulário expiram sozinhas (limite de taxa)
    db.collection("rateLimits").createIndex({ at: 1 }, { expireAfterSeconds: 3600 }),
  ]);
}
