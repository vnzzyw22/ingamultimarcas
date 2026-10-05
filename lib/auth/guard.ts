import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/mongo";
import { readSession } from "@/lib/auth/session";

export interface AdminDoc {
  email: string;
  name: string;
  passwordHash: string;
  /** Aumenta ao trocar a senha: invalida as sessões antigas. */
  tokenVersion: number;
  /** Senha definida na criação da conta (fraca/combinada de boca): o painel avisa até ser trocada. */
  temporaryPassword?: boolean;
  createdAt: string;
}
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  temporaryPassword: boolean;
}

/** Administrador logado (ou null). Confere a assinatura do cookie E a versão do token no banco. */
export async function getAdmin(): Promise<AdminUser | null> {
  const session = await readSession();
  if (!session || !ObjectId.isValid(session.sub)) return null;
  const db = await getDb();
  const admin = await db.collection<AdminDoc>("admins").findOne({ _id: new ObjectId(session.sub) });
  if (!admin || admin.tokenVersion !== session.v) return null;
  return { id: session.sub, email: admin.email, name: admin.name, temporaryPassword: admin.temporaryPassword === true };
}

/**
 * Chame em TODA página, ação e rota do painel. O Next não refaz o layout a cada navegação, então a
 * checagem no layout sozinha não protege: cada ponto de entrada confere por conta própria.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
