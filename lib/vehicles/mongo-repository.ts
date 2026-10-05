import { ObjectId, type WithId } from "mongodb";
import type { FeatureKey, Vehicle, VehicleImage } from "@/types/vehicle";
import { getDb } from "@/lib/db/mongo";
import type { VehicleRepository } from "@/lib/vehicles/repository";

/** Como o veículo é gravado no MongoDB. As fotos ficam na coleção `photos`; aqui só a ordem e o tamanho. */
export interface VehicleDoc extends Omit<Vehicle, "id" | "images" | "features" | "updatedAt" | "createdAt"> {
  features: FeatureKey[];
  photos: { id: string; width: number; height: number }[];
  /** Só nos veículos de demonstração: fotos de exemplo que são ARQUIVOS do site (não ficam no banco). */
  demoImages?: VehicleImage[];
  createdAt: string;
  updatedAt: string;
}

export const photoUrl = (id: string) => `/fotos/${id}`;

export function toVehicle(doc: WithId<VehicleDoc>): Vehicle {
  const { _id, photos, demoImages, ...rest } = doc;
  const title = `${doc.brand} ${doc.model} ${doc.version} ${doc.year}`.replace(/\s+/g, " ").trim();
  const images: VehicleImage[] = photos.length
    ? photos.map((p, i) => ({ src: photoUrl(p.id), alt: `${title} — foto ${i + 1}`, width: p.width, height: p.height }))
    : (demoImages ?? []);
  return { ...rest, id: _id.toHexString(), images };
}

// Cache curto em memória: o site lê o estoque em toda visita e o Atlas gratuito é compartilhado.
// Gravações do painel limpam o cache (nesta instância); nas demais, o valor expira em poucos segundos.
const TTL_MS = 15_000;
let cache: { at: number; data: Vehicle[] } | null = null;
export const invalidateVehicleCache = () => {
  cache = null;
};

export const mongoVehicleRepository: VehicleRepository = {
  async findAll() {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
    const db = await getDb();
    const docs = await db.collection<VehicleDoc>("vehicles").find().sort({ createdAt: -1 }).toArray();
    const data = docs.map(toVehicle);
    cache = { at: Date.now(), data };
    return data;
  },
  async findBySlug(slug) {
    const all = await this.findAll();
    return all.find((v) => v.slug === slug) ?? null;
  },
};

export const isValidId = (id: string) => ObjectId.isValid(id) && String(new ObjectId(id)) === id;
