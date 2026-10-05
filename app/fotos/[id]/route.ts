import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/mongo";
import { getPhoto } from "@/lib/admin/vehicle-store";

/** Serve a foto de um veículo guardada no MongoDB. O id muda a cada upload, então o cache pode ser eterno. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const photo = hasDatabase() ? await getPhoto(id) : null;
  if (!photo) return new NextResponse("Foto não encontrada", { status: 404 });
  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
