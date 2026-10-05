import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guard";
import { listLeads, LEAD_STATUSES, type LeadStatus } from "@/lib/leads/store";
import { deleteLeadAction, setLeadStatusAction } from "@/app/admin/actions";
import { PageTitle, btnDanger, btnOutline, btnSmall, dateTime } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const metadata: Metadata = { title: "Contatos" };

const typeLabel = { interesse: "Interesse em veículo", venda: "Quer vender o carro", contato: "Contato" } as const;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (LEAD_STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as LeadStatus) : undefined;
  const leads = await listLeads({ status });
  const back = status ? `/admin/contatos?status=${status}` : "/admin/contatos";

  return (
    <>
      <PageTitle title="Contatos" subtitle="Pessoas que preencheram “Tenho interesse” ou “Venda seu carro” no site.">
        <a href="/admin/contatos" className={btnOutline} aria-current={!status ? "page" : undefined}>
          Todos
        </a>
        <a href="/admin/contatos?status=novo" className={btnOutline} aria-current={status === "novo" ? "page" : undefined}>
          Novos
        </a>
        <a href="/admin/contatos?status=atendido" className={btnOutline} aria-current={status === "atendido" ? "page" : undefined}>
          Atendidos
        </a>
      </PageTitle>

      {leads.length === 0 ? (
        <div className="border border-line bg-white p-8 text-center">
          <p className="font-semibold">Nenhum contato por aqui.</p>
          <p className="mt-1 text-sm text-mute">Quando alguém preencher um formulário do site, aparece nesta lista.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {leads.map((l) => {
            const phoneDigits = l.phone.replace(/\D/g, "");
            const wa = phoneDigits.length >= 10 ? `https://wa.me/${phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`}` : null;
            return (
              <li key={l.id} className={`border bg-white p-4 ${l.status === "novo" ? "border-red/50" : "border-line"}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${l.status === "novo" ? "text-red-text" : "text-mute"}`}>{l.status === "novo" ? "Novo" : "Atendido"}</span>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-mute">{typeLabel[l.type]}</span>
                  <span className="tnum text-xs text-mute">{dateTime(l.createdAt)}</span>
                </div>
                <p className="mt-1 text-lg font-bold">{l.name}</p>
                {l.subject ? <p className="text-sm">{l.subject}</p> : null}
                <p className="mt-1 text-sm text-mute">
                  {l.phone ? (
                    <>
                      WhatsApp: <span className="tnum font-semibold text-ink">{l.phone}</span>
                    </>
                  ) : (
                    "Sem telefone: a pessoa seguiu pelo WhatsApp da loja."
                  )}
                </p>
                {l.message ? <p className="mt-2 max-w-3xl whitespace-pre-line border-l-2 border-line pl-3 text-sm text-ink/80">{l.message}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className={btnSmall}>
                      Chamar no WhatsApp
                    </a>
                  ) : null}
                  <form action={setLeadStatusAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="back" value={back} />
                    <input type="hidden" name="status" value={l.status === "novo" ? "atendido" : "novo"} />
                    <button type="submit" className={btnSmall}>
                      {l.status === "novo" ? "Marcar como atendido" : "Voltar para novo"}
                    </button>
                  </form>
                  <form action={deleteLeadAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="back" value={back} />
                    <ConfirmButton className={btnDanger} message="Excluir este contato?">
                      Excluir
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
