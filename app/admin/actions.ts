"use server";

import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb, hasDatabase } from "@/lib/db/mongo";
import { requireAdmin, type AdminDoc } from "@/lib/auth/guard";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { clearAttempts, clientIp, recordAttempt, tooManyAttempts } from "@/lib/auth/rate-limit";
import { parseVehicleForm, type FieldErrors } from "@/lib/admin/vehicle-schema";
import {
  createVehicle,
  deleteVehicle,
  removePhoto,
  setPhotoOrder,
  setVehicleStatus,
  toggleFeatured,
  updateVehicle,
} from "@/lib/admin/vehicle-store";
import { deleteLead, setLeadStatus, LEAD_STATUSES } from "@/lib/leads/store";
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicle";

/**
 * Ações do painel. TODAS (exceto o login) começam com requireAdmin(): o Next não refaz o layout a cada
 * navegação, então cada ação confere a sessão por conta própria.
 */
export interface FormState {
  errors?: FieldErrors;
  values?: Record<string, string | string[]>;
  message?: string;
  saved?: boolean;
}

const WINDOW_MS = 15 * 60 * 1000;

/** Volta para a tela de origem, mas só para caminhos do próprio painel (evita redirecionamento para fora). */
function backTo(fd: FormData, fallback: string): never {
  const back = String(fd.get("back") ?? "");
  redirect(back.startsWith("/admin") && !back.startsWith("//") ? back : fallback);
}

// ---- sessão ---------------------------------------------------------------------------------
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!hasDatabase()) return { message: "Banco de dados não configurado." };
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const ipKey = `login-ip:${await clientIp()}`;
  const mailKey = `login-mail:${email}`;
  if ((await tooManyAttempts(ipKey, 15, WINDOW_MS)) || (await tooManyAttempts(mailKey, 6, WINDOW_MS))) {
    return { message: "Muitas tentativas. Aguarde 15 minutos e tente de novo.", values: { email } };
  }
  const db = await getDb();
  const admin = await db.collection<AdminDoc>("admins").findOne({ email });
  // sempre roda uma verificação (mesmo sem usuário) para não revelar por tempo de resposta se o e-mail existe
  const ok = await verifyPassword(password, admin?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");
  if (!admin || !ok) {
    await Promise.all([recordAttempt(ipKey), recordAttempt(mailKey)]);
    return { message: "E-mail ou senha incorretos.", values: { email } };
  }
  await clearAttempts(mailKey);
  await setSessionCookie(String(admin._id), admin.tokenVersion);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const errors: FieldErrors = {};
  const problem = passwordProblem(next);
  if (problem) errors.next = problem;
  if (next !== confirm) errors.confirm = "As senhas não são iguais.";
  const db = await getDb();
  const admin = await db.collection<AdminDoc>("admins").findOne({ _id: new ObjectId(me.id) });
  if (!admin || !(await verifyPassword(current, admin.passwordHash))) errors.current = "Senha atual incorreta.";
  if (Object.keys(errors).length) return { errors };
  const tokenVersion = admin!.tokenVersion + 1; // derruba as sessões antigas em todos os aparelhos
  await db.collection<AdminDoc>("admins").updateOne({ _id: admin!._id }, { $set: { passwordHash: await hashPassword(next), tokenVersion }, $unset: { temporaryPassword: "" } });
  await setSessionCookie(me.id, tokenVersion); // mantém ESTE aparelho logado
  return { saved: true, message: "Senha alterada. Os outros aparelhos foram desconectados." };
}

export async function signOutEverywhereAction() {
  const me = await requireAdmin();
  const db = await getDb();
  const admin = await db.collection<AdminDoc>("admins").findOneAndUpdate({ _id: new ObjectId(me.id) }, { $inc: { tokenVersion: 1 } }, { returnDocument: "after" });
  if (admin) await setSessionCookie(me.id, admin.tokenVersion);
  redirect("/admin/conta?saiu=1");
}

// ---- veículos -------------------------------------------------------------------------------
export async function saveVehicleAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const all = fd.getAll(key).map(String);
    raw[key] = all.length > 1 || key === "features" ? all : (all[0] ?? "");
  }
  const parsed = parseVehicleForm(fd);
  if (!parsed.ok) return { errors: parsed.errors, values: raw, message: "Corrija os campos destacados." };
  if (id) {
    const ok = await updateVehicle(id, parsed.data);
    if (!ok) return { values: raw, message: "Veículo não encontrado." };
    return { saved: true, values: raw, message: "Alterações salvas." };
  }
  const newId = await createVehicle(parsed.data);
  redirect(`/admin/veiculos/${newId}?novo=1`);
}

const asStatus = (v: FormDataEntryValue | null): VehicleStatus | null => (VEHICLE_STATUSES as readonly string[]).includes(String(v)) ? (String(v) as VehicleStatus) : null;

export async function setStatusAction(fd: FormData) {
  await requireAdmin();
  const status = asStatus(fd.get("status"));
  if (status) await setVehicleStatus(String(fd.get("id")), status);
  backTo(fd, "/admin/veiculos");
}

export async function toggleFeaturedAction(fd: FormData) {
  await requireAdmin();
  await toggleFeatured(String(fd.get("id")));
  backTo(fd, "/admin/veiculos");
}

export async function deleteVehicleAction(fd: FormData) {
  await requireAdmin();
  await deleteVehicle(String(fd.get("id")));
  redirect("/admin/veiculos?excluido=1");
}

// ---- fotos (o envio em si está em /admin/api/fotos) ----------------------------------------------
export async function removePhotoAction(fd: FormData) {
  await requireAdmin();
  const vehicleId = String(fd.get("vehicleId"));
  await removePhoto(vehicleId, String(fd.get("photoId")));
  redirect(`/admin/veiculos/${vehicleId}#fotos`);
}

/** Troca a foto de lugar com a vizinha (dir = -1 sobe, 1 desce) ou a leva para a capa (dir = 0). */
export async function movePhotoAction(fd: FormData) {
  await requireAdmin();
  const vehicleId = String(fd.get("vehicleId"));
  const photoId = String(fd.get("photoId"));
  const dir = Number(fd.get("dir"));
  const order = await currentOrder(vehicleId);
  const i = order ? order.indexOf(photoId) : -1;
  if (order && i >= 0) {
    order.splice(i, 1);
    order.splice(dir === 0 ? 0 : Math.min(order.length, Math.max(0, i + dir)), 0, photoId);
    await setPhotoOrder(vehicleId, order);
  }
  redirect(`/admin/veiculos/${vehicleId}#fotos`);
}

async function currentOrder(vehicleId: string): Promise<string[] | null> {
  const db = await getDb();
  const doc = await db.collection<{ photos: { id: string }[] }>("vehicles").findOne({ _id: new ObjectId(vehicleId) }, { projection: { photos: 1 } });
  return doc ? doc.photos.map((p) => p.id) : null;
}

// ---- contatos -------------------------------------------------------------------------------
export async function setLeadStatusAction(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status"));
  if ((LEAD_STATUSES as readonly string[]).includes(status)) await setLeadStatus(String(fd.get("id")), status as (typeof LEAD_STATUSES)[number]);
  backTo(fd, "/admin/contatos");
}

export async function deleteLeadAction(fd: FormData) {
  await requireAdmin();
  await deleteLead(String(fd.get("id")));
  backTo(fd, "/admin/contatos");
}
