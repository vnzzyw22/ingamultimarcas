import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guard";
import { signOutEverywhereAction } from "@/app/admin/actions";
import { PageTitle, btnOutline } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/password-form";

export const metadata: Metadata = { title: "Conta" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saiu?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  return (
    <>
      <PageTitle title="Conta" subtitle={`${me.name} · ${me.email}`} />

      <div className="grid gap-6">
        <section className="border border-line bg-white p-5" aria-labelledby="senha">
          <h2 id="senha" className="mb-4 text-sm font-bold uppercase tracking-[0.1em]">
            Trocar senha
          </h2>
          <PasswordForm />
        </section>

        <section className="border border-line bg-white p-5" aria-labelledby="aparelhos">
          <h2 id="aparelhos" className="text-sm font-bold uppercase tracking-[0.1em]">
            Sair dos outros aparelhos
          </h2>
          <p className="mt-2 max-w-xl text-sm text-mute">Use se entrou num computador que não é seu. Este aparelho continua conectado; todos os outros precisam entrar de novo.</p>
          {sp.saiu ? (
            <p role="status" className="mt-3 border border-ok/30 bg-ok/10 px-3 py-2 text-sm font-semibold text-ok">
              Pronto: os outros aparelhos foram desconectados.
            </p>
          ) : null}
          <form action={signOutEverywhereAction} className="mt-4">
            <button type="submit" className={btnOutline}>
              Desconectar os outros aparelhos
            </button>
          </form>
        </section>

        <section className="border border-line bg-white p-5" aria-labelledby="backup">
          <h2 id="backup" className="text-sm font-bold uppercase tracking-[0.1em]">
            Cópia de segurança
          </h2>
          <p className="mt-2 max-w-xl text-sm text-mute">
            Baixa um arquivo com todos os veículos e contatos. <strong>As fotos não vão neste arquivo</strong> (são muito pesadas). Guarde uma cópia de vez em quando, por exemplo uma vez por mês.
          </p>
          <a href="/admin/api/backup" className={`${btnOutline} mt-4`} download>
            Baixar cópia dos dados
          </a>
        </section>
      </div>
    </>
  );
}
