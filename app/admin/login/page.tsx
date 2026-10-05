import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasDatabase } from "@/lib/db/mongo";
import { getAdmin } from "@/lib/auth/guard";
import { BrandMark } from "@/components/layout/brand-mark";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (hasDatabase() && (await getAdmin())) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center bg-ink px-6 py-6">
        <BrandMark variant="completa" priority className="h-28" />
      </div>
      <h1 className="display text-3xl">Painel da loja</h1>
      <p className="mb-6 mt-1 text-sm text-mute">Entre para cadastrar e atualizar os veículos.</p>
      {hasDatabase() ? (
        <LoginForm />
      ) : (
        <p role="alert" className="border border-line bg-white px-3 py-3 text-sm">
          O banco de dados não está configurado neste ambiente (falta <code>MONGODB_URI</code>), então o painel está indisponível.
        </p>
      )}
    </main>
  );
}
