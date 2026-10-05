import Link from "next/link";
import { redirect } from "next/navigation";
import { hasDatabase } from "@/lib/db/mongo";
import { requireAdmin } from "@/lib/auth/guard";
import { countNewLeads } from "@/lib/leads/store";
import { logoutAction } from "@/app/admin/actions";
import { BrandMark } from "@/components/layout/brand-mark";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

/** Moldura do painel. A checagem de login aqui é só a primeira barreira: cada página e ação confere de novo. */
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) redirect("/admin/login");
  const me = await requireAdmin();
  const newLeads = await countNewLeads();
  return (
    <>
      <header className="bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 sm:px-6">
          <Link href="/admin" aria-label="Painel da Ingá" className="py-2">
            <BrandMark variant="completa" className="h-12" />
          </Link>
          <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
            <AdminNav newLeads={newLeads} />
          </div>
          <div className="order-2 flex items-center gap-4 sm:order-3">
            <Link href="/" target="_blank" className="text-[0.75rem] font-semibold text-paper/70 hover:text-paper">
              Ver site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-[0.75rem] font-semibold text-paper/70 hover:text-paper" title={me.email}>
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
