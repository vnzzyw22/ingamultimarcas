import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { PageTitle, btnOutline } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/vehicle-form";

export const metadata: Metadata = { title: "Cadastrar veículo" };

export default async function NewVehiclePage() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Cadastrar veículo" subtitle="Preencha os dados. Na tela seguinte você adiciona as fotos.">
        <Link href="/admin/veiculos" className={btnOutline}>
          Cancelar
        </Link>
      </PageTitle>
      <VehicleForm />
    </>
  );
}
