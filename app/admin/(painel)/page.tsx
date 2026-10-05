import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { getStats } from "@/lib/admin/vehicle-store";
import { countNewLeads } from "@/lib/leads/store";
import { PageTitle, btnOutline, btnPrimary } from "@/components/admin/ui";

export default async function DashboardPage() {
  const me = await requireAdmin();
  const [stats, newLeads] = await Promise.all([getStats(), countNewLeads()]);

  const cards = [
    { label: "Disponíveis", value: stats.byStatus.disponivel, href: "/admin/veiculos?status=disponivel" },
    { label: "Reservados", value: stats.byStatus.reservado, href: "/admin/veiculos?status=reservado" },
    { label: "Vendidos", value: stats.byStatus.vendido, href: "/admin/veiculos?status=vendido" },
    { label: "Em destaque", value: stats.featured, href: "/admin/veiculos" },
    { label: "Contatos novos", value: newLeads, href: "/admin/contatos", hot: newLeads > 0 },
  ];

  return (
    <>
      <PageTitle title={`Olá, ${me.name.split(" ")[0]}`} subtitle="Resumo da loja.">
        <Link href="/admin/veiculos/novo" className={btnPrimary}>
          Cadastrar veículo
        </Link>
      </PageTitle>

      {me.temporaryPassword ? (
        <p role="alert" className="mb-6 border border-red/40 bg-red/5 px-4 py-3 text-sm text-red-text">
          <strong>Sua senha é provisória e fraca.</strong> Antes de publicar o site, troque por uma senha de verdade em{" "}
          <Link href="/admin/conta" className="font-bold underline">
            Conta
          </Link>
          . Este aviso some quando você trocar.
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block border border-line bg-white p-4 transition-colors hover:border-ink">
              <span className={`tnum display block text-4xl ${c.hot ? "text-red-text" : ""}`}>{c.value}</span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.1em] text-mute">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/veiculos" className={btnOutline}>
          Ver todos os veículos
        </Link>
        <Link href="/admin/contatos" className={btnOutline}>
          Ver contatos
        </Link>
      </div>
    </>
  );
}
