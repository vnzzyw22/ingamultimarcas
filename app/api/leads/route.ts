import { hasDatabase } from "@/lib/db/mongo";
import { isSameOrigin } from "@/lib/auth/origin";
import { clientIp, recordAttempt, tooManyAttempts } from "@/lib/auth/rate-limit";
import { createLead, leadInputSchema } from "@/lib/leads/store";

/** Recebe os contatos dos formulários públicos ("Tenho interesse" e "Venda seu carro"). Sempre responde 204. */
export async function POST(req: Request) {
  const silent = new Response(null, { status: 204 });
  if (!hasDatabase()) return silent;
  if (!isSameOrigin(req)) return new Response(null, { status: 403 });
  const text = await req.text();
  if (text.length > 8_000) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = leadInputSchema.safeParse(json);
  if (!parsed.success) return silent; // inclui a isca de robô preenchida: finge que deu certo
  const key = `lead:${await clientIp()}`;
  if (await tooManyAttempts(key, 12, 60 * 60 * 1000)) return silent;
  await recordAttempt(key);
  await createLead(parsed.data);
  return silent;
}
