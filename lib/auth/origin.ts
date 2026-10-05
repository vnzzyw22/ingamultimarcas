/**
 * Proteção CSRF para rotas que gravam dados: o navegador sempre manda `Origin` em POST, então exigimos que
 * ele aponte para o próprio site. (Ações do Next já fazem essa checagem; isto cobre as rotas /api e /admin/api.)
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
