import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sessão do painel: cookie HttpOnly assinado com HMAC-SHA256 (ADMIN_SESSION_SECRET).
 * O cookie carrega só {id do admin, versão do token, expiração}; a versão fica no banco, então trocar a senha
 * (ou "sair de todos os aparelhos") invalida todas as sessões antigas.
 */
export const SESSION_COOKIE = "inga_admin";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 dias

interface Payload {
  sub: string;
  v: number;
  exp: number;
}

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres).");
  return s;
}
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function encodeSession(sub: string, v: number, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ sub, v, exp: Math.floor(now / 1000) + MAX_AGE_S } satisfies Payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined, now = Date.now()): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return typeof p.sub === "string" && typeof p.v === "number" && p.exp > Math.floor(now / 1000) ? p : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(sub: string, v: number) {
  (await cookies()).set(SESSION_COOKIE, encodeSession(sub, v), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<Payload | null> {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}
