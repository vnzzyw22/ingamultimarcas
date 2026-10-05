/**
 * Carrega os veículos de DEMONSTRAÇÃO (data/vehicles.demo.ts) no MongoDB, para testar o painel e o site.
 * Uso:  npx tsx scripts/seed-demo.mts        (não duplica: pula o que já foi carregado)
 * Todos têm isDemo: true e as fotos apontam para os arquivos de exemplo em /images/cars/demo.
 * Para tirá-los antes de divulgar a loja: botão "Remover demonstrativos" no painel.
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { demoVehicles } from "../data/vehicles.demo";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.MONGODB_URI) throw new Error("MONGODB_URI ausente em .env.local");

const client = await new MongoClient(env.MONGODB_URI).connect();
try {
  const col = client.db().collection("vehicles");
  await col.createIndex({ slug: 1 }, { unique: true });
  let added = 0;
  for (const v of demoVehicles) {
    if (await col.findOne({ slug: v.slug }, { projection: { _id: 1 } })) continue;
    const { id: _id, images, ...rest } = v;
    void _id;
    // As fotos de demonstração são arquivos do site (não ficam no banco): guardamos o caminho em `demoImages`.
    await col.insertOne({ ...rest, photos: [], demoImages: images, updatedAt: v.createdAt });
    added++;
  }
  console.log(`${added} veículo(s) de demonstração adicionados (${demoVehicles.length - added} já existiam).`);
} finally {
  await client.close();
}
