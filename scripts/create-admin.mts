/**
 * Cria (ou redefine a senha de) um administrador do painel.
 * Uso:  npx tsx scripts/create-admin.mts <email> "<Nome>" [--reset] [--password <senha>]
 * A senha é gerada aleatoriamente e gravada em .admin-credentials.txt (ignorado pelo git). Nada vai para o terminal.
 */
import { randomInt } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { hashPassword, passwordProblem } from "../lib/auth/password";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.MONGODB_URI) throw new Error("MONGODB_URI ausente em .env.local");

const [email, name] = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--password");
const reset = process.argv.includes("--reset");
const pwIdx = process.argv.indexOf("--password");
const given = pwIdx > 0 ? process.argv[pwIdx + 1] : undefined;
if (!email || !name) throw new Error('Uso: npx tsx scripts/create-admin.mts <email> "<Nome>" [--reset]');

// senha legível de 18 caracteres, sem letras que se confundem (0/O, 1/l/I)
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const password = given ?? Array.from({ length: 18 }, () => alphabet[randomInt(alphabet.length)]).join("");

const client = await new MongoClient(env.MONGODB_URI).connect();
try {
  const admins = client.db().collection<{ email: string; name: string; passwordHash: string; tokenVersion: number; createdAt: string }>("admins");
  await admins.createIndex({ email: 1 }, { unique: true });
  const normalized = email.trim().toLowerCase();
  const existing = await admins.findOne({ email: normalized });
  if (existing && !reset) {
    console.log(`Já existe um administrador com ${normalized}. Use --reset para gerar uma senha nova.`);
  } else {
    const passwordHash = await hashPassword(password);
    // senha informada à mão e fraca (< 10 caracteres): o painel mostra aviso até ser trocada
    const temporaryPassword = given !== undefined && passwordProblem(given) !== null;
    if (existing) await admins.updateOne({ _id: existing._id }, { $set: { passwordHash, name, ...(temporaryPassword ? { temporaryPassword: true } : {}) }, $inc: { tokenVersion: 1 } });
    else await admins.insertOne({ email: normalized, name, passwordHash, tokenVersion: 1, createdAt: new Date().toISOString(), ...(temporaryPassword ? { temporaryPassword: true } : {}) });
    if (given === undefined) writeFileSync(".admin-credentials.txt", `Painel da Ingá — acesso

Endereço: /admin
E-mail:   ${normalized}
Senha:    ${password}

Troque a senha no primeiro acesso (menu Conta). Apague este arquivo depois.
`);
    console.log(`Administrador ${existing ? "atualizado" : "criado"}: ${normalized}${given === undefined ? ". Credenciais gravadas em .admin-credentials.txt" : " (senha informada por você)"}${temporaryPassword ? " — marcada como provisória" : ""}`);
  }
} finally {
  await client.close();
}
