import { NextResponse } from "next/server";
import { hasDatabase, getDb } from "@/lib/db/mongo";
import { getAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

/** Baixa os dados (veículos e contatos) em JSON. As fotos ficam de fora: são pesadas demais para um arquivo só. */
export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const db = await getDb();
  const [vehicles, leads] = await Promise.all([db.collection("vehicles").find().toArray(), db.collection("leads").find().toArray()]);
  const body = JSON.stringify({ geradoEm: new Date().toISOString(), observacao: "Fotos não incluídas.", veiculos: vehicles, contatos: leads }, null, 2);
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="inga-dados-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
