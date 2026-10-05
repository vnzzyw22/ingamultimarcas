import type { LeadType } from "@/lib/leads/store";

/**
 * Registra o contato no painel. Roda ANTES de abrir o WhatsApp e nunca atrapalha: se falhar (sem internet,
 * banco fora do ar), o WhatsApp abre do mesmo jeito. `keepalive` deixa o envio terminar mesmo se a aba mudar.
 */
export function sendLead(lead: { type: LeadType; name: string; phone?: string; message?: string; subject?: string; vehicleSlug?: string }): void {
  try {
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, site: "" }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* sem rede: ignora */
  }
}
