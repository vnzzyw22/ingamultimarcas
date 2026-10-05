/**
 * Cópia de segurança COMPLETA: veículos, contatos e todas as fotos (o botão do painel não leva as fotos).
 * Uso:  npm run backup        → grava em backups/AAAA-MM-DD/ (ignorado pelo git)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.MONGODB_URI) throw new Error("MONGODB_URI ausente em .env.local");

const dir = path.join("backups", new Date().toISOString().slice(0, 10));
mkdirSync(path.join(dir, "fotos"), { recursive: true });

const client = await new MongoClient(env.MONGODB_URI).connect();
try {
  const db = client.db();
  const [vehicles, leads] = await Promise.all([db.collection("vehicles").find().toArray(), db.collection("leads").find().toArray()]);
  writeFileSync(path.join(dir, "veiculos.json"), JSON.stringify(vehicles, null, 2));
  writeFileSync(path.join(dir, "contatos.json"), JSON.stringify(leads, null, 2));
  let n = 0;
  let bytes = 0;
  for await (const p of db.collection("photos").find()) {
    const buf = Buffer.from(p.data.buffer);
    writeFileSync(path.join(dir, "fotos", `${p._id.toHexString()}.webp`), buf);
    n++;
    bytes += buf.length;
  }
  console.log(`Backup em ${dir}: ${vehicles.length} veículo(s), ${leads.length} contato(s), ${n} foto(s) (${(bytes / 1048576).toFixed(1)} MB).`);
} finally {
  await client.close();
}
