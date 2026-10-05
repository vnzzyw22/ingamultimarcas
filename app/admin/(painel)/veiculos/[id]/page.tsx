import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminVehicle } from "@/lib/admin/vehicle-store";
import { MAX_PHOTOS_PER_VEHICLE } from "@/lib/photos/process";
import { deleteVehicleAction } from "@/app/admin/actions";
import { PageTitle, StatusBadge, btnDanger, btnOutline } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { PhotoManager } from "@/components/admin/photo-manager";

export const metadata: Metadata = { title: "Editar veículo" };

export default async function EditVehiclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const vehicle = await getAdminVehicle(id);
  if (!vehicle) notFound();

  return (
    <>
      <PageTitle title={`${vehicle.brand} ${vehicle.model}`} subtitle={`${vehicle.version} · ${vehicle.year} · ${vehicle.stockCode}`}>
        {vehicle.status !== "vendido" ? (
          <Link href={`/veiculo/${vehicle.slug}`} target="_blank" className={btnOutline}>
            Ver no site
          </Link>
        ) : null}
        <Link href="/admin/veiculos" className={btnOutline}>
          Voltar à lista
        </Link>
      </PageTitle>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={vehicle.status} />
        {vehicle.status === "vendido" ? <span className="text-sm text-mute">Este veículo não aparece no site.</span> : null}
      </div>

      {sp.novo ? (
        <p role="status" className="mb-6 border border-ok/30 bg-ok/10 px-4 py-3 text-sm font-semibold text-ok">
          Veículo cadastrado. Agora adicione as fotos abaixo — sem fotos, o carro aparece no site sem imagem.
        </p>
      ) : null}

      <div className="grid gap-8">
        {/* fotos de exemplo dos veículos de demonstração são arquivos do site: não entram no gerenciador */}
        <PhotoManager vehicleId={vehicle.id} photos={vehicle.images.filter((i) => i.src.startsWith("/fotos/"))} max={MAX_PHOTOS_PER_VEHICLE} />
        <VehicleForm vehicle={vehicle} />
        <section className="border border-line bg-white p-5" aria-labelledby="excluir">
          <h2 id="excluir" className="text-sm font-bold uppercase tracking-[0.1em]">
            Excluir veículo
          </h2>
          <p className="mt-2 max-w-xl text-sm text-mute">
            Apaga o veículo e todas as fotos, sem volta. Se ele foi vendido, prefira “Marcar vendido” na lista: ele some do site mas continua no seu histórico.
          </p>
          <form action={deleteVehicleAction} className="mt-4">
            <input type="hidden" name="id" value={vehicle.id} />
            <ConfirmButton className={btnDanger} message={`Excluir ${vehicle.brand} ${vehicle.model} e todas as fotos? Não dá para desfazer.`}>
              Excluir definitivamente
            </ConfirmButton>
          </form>
        </section>
      </div>
    </>
  );
}
