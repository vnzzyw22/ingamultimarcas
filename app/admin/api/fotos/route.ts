import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/mongo";
import { getAdmin } from "@/lib/auth/guard";
import { isSameOrigin } from "@/lib/auth/origin";
import { MAX_UPLOAD_BYTES, processPhoto } from "@/lib/photos/process";
import { addPhotos } from "@/lib/admin/vehicle-store";

export const runtime = "nodejs";

/**
 * Recebe UMA foto por requisição (o painel envia uma de cada vez, já reduzida no navegador).
 * Assim cada envio fica abaixo do limite de corpo das hospedagens e um erro não derruba o lote.
 */
export async function POST(req: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  if (!(await getAdmin())) return NextResponse.json({ error: "Sessão expirada. Entre de novo." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const vehicleId = String(form?.get("vehicleId") ?? "");
  const file = form?.get("file");
  if (!form || !(file instanceof File) || !vehicleId) return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Foto grande demais (máximo 12 MB)." }, { status: 413 });

  let processed;
  try {
    processed = await processPhoto(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "Esse arquivo não parece ser uma foto válida (use JPG, PNG ou WebP)." }, { status: 415 });
  }
  try {
    const res = await addPhotos(vehicleId, [processed]);
    if (res.added === 0) return NextResponse.json({ error: "Limite de fotos por veículo atingido." }, { status: 409 });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  }
}
