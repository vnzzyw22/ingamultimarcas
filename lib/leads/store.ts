import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@/lib/db/mongo";

export const LEAD_TYPES = ["interesse", "venda", "contato"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];
export const LEAD_STATUSES = ["novo", "atendido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  phone: string;
  message: string;
  /** Veículo de interesse (para "interesse") ou do cliente (para "venda"). */
  subject?: string;
  vehicleSlug?: string;
  createdAt: string;
}
type LeadDoc = Omit<Lead, "id">;

/** Contato vindo dos formulários públicos. `site` é a isca para robôs (campo escondido, deve vir vazio). */
export const leadInputSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).default(""),
  message: z.string().trim().max(1500).default(""),
  subject: z.string().trim().max(160).optional(),
  vehicleSlug: z.string().trim().max(160).optional(),
  site: z.string().max(0).optional(),
}).refine((l) => l.type !== "venda" || l.phone.length >= 8, { path: ["phone"], message: "Informe o WhatsApp." });
export type LeadInput = z.infer<typeof leadInputSchema>;

const leads = async () => (await getDb()).collection<LeadDoc>("leads");
const toLead = (d: LeadDoc & { _id: ObjectId }): Lead => ({ ...d, id: d._id.toHexString() });

export async function createLead(input: LeadInput): Promise<void> {
  const { site: _bot, ...rest } = input;
  void _bot;
  await (await leads()).insertOne({ ...rest, status: "novo", createdAt: new Date().toISOString() });
}

export async function listLeads(filter: { status?: LeadStatus } = {}): Promise<Lead[]> {
  const docs = await (await leads()).find(filter.status ? { status: filter.status } : {}).sort({ createdAt: -1 }).limit(500).toArray();
  return docs.map(toLead);
}

export async function countNewLeads(): Promise<number> {
  return (await leads()).countDocuments({ status: "novo" });
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<void> {
  if (!ObjectId.isValid(id)) return;
  await (await leads()).updateOne({ _id: new ObjectId(id) }, { $set: { status } });
}

export async function deleteLead(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) return;
  await (await leads()).deleteOne({ _id: new ObjectId(id) });
}
