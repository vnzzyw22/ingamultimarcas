import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { listAdminVehicles } from "@/lib/admin/vehicle-store";
import { setStatusAction, toggleFeaturedAction } from "@/app/admin/actions";
import { VEHICLE_STATUSES, type VehicleStatus } from "@/types/vehicle";
import { statusLabels } from "@/lib/vehicles/labels";
import { PageTitle, StatusBadge, btnOutline, btnPrimary, btnSmall, inputCls, money } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Veículos" };

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; excluido?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (VEHICLE_STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as VehicleStatus) : undefined;
  const list = await listAdminVehicles({ q: sp.q, status });
  const back = `/admin/veiculos${sp.status || sp.q ? `?${new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}) })}` : ""}`;

  return (
    <>
      <PageTitle title="Veículos" subtitle={`${list.length} ${list.length === 1 ? "veículo" : "veículos"}${status ? ` · ${statusLabels[status].toLowerCase()}` : ""}`}>
        <Link href="/admin/veiculos/novo" className={btnPrimary}>
          Cadastrar veículo
        </Link>
      </PageTitle>

      {sp.excluido ? (
        <p role="status" className="mb-4 border border-ok/30 bg-ok/10 px-4 py-3 text-sm font-semibold text-ok">
          Veículo excluído.
        </p>
      ) : null}

      <form method="get" className="mb-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Buscar por marca, modelo, ano ou código" aria-label="Buscar veículo" className={`${inputCls} max-w-sm`} />
        <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por situação" className={`${inputCls} w-auto`}>
          <option value="">Todas as situações</option>
          {VEHICLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <button type="submit" className={btnOutline}>
          Filtrar
        </button>
      </form>

      {list.length === 0 ? (
        <div className="border border-line bg-white p-8 text-center">
          <p className="font-semibold">Nenhum veículo encontrado.</p>
          <p className="mt-1 text-sm text-mute">Cadastre o primeiro ou mude o filtro.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {list.map((v) => {
            const cover = v.images[0];
            return (
              <li key={v.id} className="grid gap-4 border border-line bg-white p-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
                <Link href={`/admin/veiculos/${v.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-paper-2 sm:w-36" aria-label={`Editar ${v.brand} ${v.model}`}>
                  {cover ? (
                    <Image src={cover.src} alt="" fill sizes="144px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[0.6875rem] font-semibold uppercase text-mute">Sem foto</span>
                  )}
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={v.status} />
                    {v.featured ? <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-red-text">Destaque</span> : null}
                    {v.isDemo ? <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-mute">Demonstração</span> : null}
                    <span className="tnum text-xs text-mute">{v.stockCode}</span>
                  </div>
                  <Link href={`/admin/veiculos/${v.id}`} className="mt-1 block truncate text-lg font-bold hover:underline">
                    {v.brand} {v.model} {v.version}
                  </Link>
                  <p className="tnum text-sm text-mute">
                    {v.year} · {v.mileage.toLocaleString("pt-BR")} km · <span className="font-semibold text-ink">{money(v.price)}</span> · {v.images.length} foto(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <form action={setStatusAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="back" value={back} />
                    <input type="hidden" name="status" value={v.status === "vendido" ? "disponivel" : "vendido"} />
                    <button type="submit" className={btnSmall}>
                      {v.status === "vendido" ? "Voltar a disponível" : "Marcar vendido"}
                    </button>
                  </form>
                  <form action={toggleFeaturedAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="back" value={back} />
                    <button type="submit" className={btnSmall}>
                      {v.featured ? "Tirar destaque" : "Destacar"}
                    </button>
                  </form>
                  <Link href={`/admin/veiculos/${v.id}`} className={btnSmall}>
                    Editar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
