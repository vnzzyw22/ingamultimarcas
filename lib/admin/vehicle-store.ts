import { Binary, ObjectId } from "mongodb";
import type { Vehicle, VehicleStatus } from "@/types/vehicle";
import { getDb } from "@/lib/db/mongo";
import { invalidateVehicleCache, isValidId, toVehicle, type VehicleDoc } from "@/lib/vehicles/mongo-repository";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/photos/process";
import { slugify } from "@/lib/slug";
import type { VehicleFormInput } from "@/lib/admin/vehicle-schema";

/** Operações do painel sobre veículos e fotos. Toda gravação limpa o cache do site. */
interface PhotoDoc {
  _id: ObjectId;
  vehicleId: ObjectId;
  data: Binary;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
}

const vehicles = async () => (await getDb()).collection<VehicleDoc>("vehicles");
const photos = async () => (await getDb()).collection<PhotoDoc>("photos");
const oid = (id: string) => {
  if (!isValidId(id)) throw new Error("Identificador inválido.");
  return new ObjectId(id);
};

export interface AdminVehicleFilter {
  q?: string;
  status?: VehicleStatus;
}

export async function listAdminVehicles(filter: AdminVehicleFilter = {}): Promise<Vehicle[]> {
  const q: Record<string, unknown> = {};
  if (filter.status) q.status = filter.status;
  const docs = await (await vehicles()).find(q).sort({ createdAt: -1 }).toArray();
  let list = docs.map(toVehicle);
  const term = filter.q?.trim().toLowerCase();
  if (term) list = list.filter((v) => `${v.brand} ${v.model} ${v.version} ${v.year} ${v.stockCode} ${v.color}`.toLowerCase().includes(term));
  return list;
}

export async function getAdminVehicle(id: string): Promise<Vehicle | null> {
  if (!isValidId(id)) return null;
  const doc = await (await vehicles()).findOne({ _id: new ObjectId(id) });
  return doc ? toVehicle(doc) : null;
}

async function nextStockCode(): Promise<string> {
  const db = await getDb();
  const counter = await db
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate({ _id: "vehicle" }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
  return `ING-${String(counter?.seq ?? 1).padStart(4, "0")}`;
}

async function uniqueSlug(base: string): Promise<string> {
  const col = await vehicles();
  const root = base || "veiculo";
  let slug = root;
  for (let n = 2; await col.findOne({ slug }, { projection: { _id: 1 } }); n++) slug = `${root}-${n}`;
  return slug;
}

export async function createVehicle(input: VehicleFormInput): Promise<string> {
  const now = new Date().toISOString();
  const slug = await uniqueSlug(slugify(`${input.brand} ${input.model} ${input.version} ${input.year}`));
  const doc: VehicleDoc = {
    ...input,
    manufactureYear: input.manufactureYear ?? input.year,
    slug,
    stockCode: await nextStockCode(),
    photos: [],
    createdAt: now,
    updatedAt: now,
  };
  const res = await (await vehicles()).insertOne(doc as never);
  invalidateVehicleCache();
  return res.insertedId.toHexString();
}

/** O endereço (slug) NÃO muda ao editar: links já compartilhados continuam valendo. */
export async function updateVehicle(id: string, input: VehicleFormInput): Promise<boolean> {
  const set: Record<string, unknown> = { ...input, manufactureYear: input.manufactureYear ?? input.year, updatedAt: new Date().toISOString() };
  const unset: Record<string, ""> = {};
  for (const k of ["oldPrice", "power"] as const) {
    if (input[k] === undefined) {
      delete set[k];
      unset[k] = "";
    }
  }
  const res = await (await vehicles()).updateOne({ _id: oid(id) }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  invalidateVehicleCache();
  return res.matchedCount > 0;
}

export async function setVehicleStatus(id: string, status: VehicleStatus): Promise<void> {
  await (await vehicles()).updateOne({ _id: oid(id) }, { $set: { status, updatedAt: new Date().toISOString() } });
  invalidateVehicleCache();
}

export async function toggleFeatured(id: string): Promise<void> {
  const col = await vehicles();
  const doc = await col.findOne({ _id: oid(id) }, { projection: { featured: 1 } });
  if (doc) await col.updateOne({ _id: doc._id }, { $set: { featured: !doc.featured, updatedAt: new Date().toISOString() } });
  invalidateVehicleCache();
}

export async function deleteVehicle(id: string): Promise<void> {
  const _id = oid(id);
  await (await photos()).deleteMany({ vehicleId: _id });
  await (await vehicles()).deleteOne({ _id });
  invalidateVehicleCache();
}

export interface ProcessedPhoto {
  data: Buffer;
  width: number;
  height: number;
}

/** Adiciona fotos ao fim da galeria. Respeita o limite por veículo e devolve quantas entraram. */
export async function addPhotos(vehicleId: string, files: ProcessedPhoto[]): Promise<{ added: number; skipped: number }> {
  const _id = oid(vehicleId);
  const col = await vehicles();
  const doc = await col.findOne({ _id }, { projection: { photos: 1 } });
  if (!doc) throw new Error("Veículo não encontrado.");
  const room = Math.max(0, MAX_PHOTOS_PER_VEHICLE - doc.photos.length);
  const take = files.slice(0, room);
  if (!take.length) return { added: 0, skipped: files.length };
  const now = new Date().toISOString();
  const rows = take.map((f) => ({ _id: new ObjectId(), vehicleId: _id, data: new Binary(f.data), bytes: f.data.length, width: f.width, height: f.height, createdAt: now }));
  await (await photos()).insertMany(rows);
  await col.updateOne(
    { _id },
    { $push: { photos: { $each: rows.map((r) => ({ id: r._id.toHexString(), width: r.width, height: r.height })) } }, $set: { updatedAt: now } },
  );
  invalidateVehicleCache();
  return { added: take.length, skipped: files.length - take.length };
}

export async function removePhoto(vehicleId: string, photoId: string): Promise<void> {
  const _id = oid(vehicleId);
  await (await vehicles()).updateOne({ _id }, { $pull: { photos: { id: photoId } }, $set: { updatedAt: new Date().toISOString() } });
  await (await photos()).deleteOne({ _id: oid(photoId), vehicleId: _id });
  invalidateVehicleCache();
}

/** Define a ordem das fotos (a primeira é a capa). Ignora ids que não pertencem ao veículo; nada se perde. */
export async function setPhotoOrder(vehicleId: string, orderedIds: string[]): Promise<void> {
  const col = await vehicles();
  const doc = await col.findOne({ _id: oid(vehicleId) }, { projection: { photos: 1 } });
  if (!doc) return;
  const byId = new Map(doc.photos.map((p) => [p.id, p]));
  const next = orderedIds.flatMap((id) => {
    const p = byId.get(id);
    return p ? [p] : [];
  });
  for (const p of doc.photos) if (!next.includes(p)) next.push(p);
  await col.updateOne({ _id: doc._id }, { $set: { photos: next, updatedAt: new Date().toISOString() } });
  invalidateVehicleCache();
}

export async function getPhoto(id: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (!isValidId(id)) return null;
  const doc = await (await photos()).findOne({ _id: new ObjectId(id) }, { projection: { data: 1 } });
  return doc ? { data: Buffer.from(doc.data.buffer), contentType: "image/webp" } : null;
}

export interface AdminStats {
  total: number;
  byStatus: Record<VehicleStatus, number>;
  featured: number;
  photoCount: number;
  photoBytes: number;
}

export async function getStats(): Promise<AdminStats> {
  const db = await getDb();
  const [byStatus, featured, agg] = await Promise.all([
    db.collection<VehicleDoc>("vehicles").aggregate<{ _id: VehicleStatus; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray(),
    db.collection<VehicleDoc>("vehicles").countDocuments({ featured: true, status: { $ne: "vendido" } }),
    db.collection<PhotoDoc>("photos").aggregate<{ n: number; bytes: number }>([{ $group: { _id: null, n: { $sum: 1 }, bytes: { $sum: "$bytes" } } }]).toArray(),
  ]);
  const counts: Record<VehicleStatus, number> = { disponivel: 0, reservado: 0, vendido: 0 };
  for (const r of byStatus) counts[r._id] = r.n;
  return {
    total: counts.disponivel + counts.reservado + counts.vendido,
    byStatus: counts,
    featured,
    photoCount: agg[0]?.n ?? 0,
    photoBytes: agg[0]?.bytes ?? 0,
  };
}
