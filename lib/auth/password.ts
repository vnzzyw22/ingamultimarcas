import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/** Hash de senha com scrypt (nativo do Node, sem dependências). Formato: scrypt$N$r$p$salt$hash (base64). */
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

const scrypt = (password: string, salt: Buffer, n: number, r: number, p: number) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (e, key) => (e ? reject(e) : resolve(key))),
  );

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scrypt(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Regra mínima de senha do painel: 10+ caracteres. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Use pelo menos 10 caracteres.";
  if (pw.length > 128) return "Use no máximo 128 caracteres.";
  return null;
}
