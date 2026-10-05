import type { ReactNode } from "react";
import type { VehicleStatus } from "@/types/vehicle";
import { statusLabels } from "@/lib/vehicles/labels";

/** Peças visuais do painel. Segue os tokens do site (cantos de 2–3 px, sem sombras, vermelho só em ação/estado). */
export const inputCls =
  "h-11 w-full border border-line bg-white px-3 text-[0.9375rem] text-ink placeholder:text-mute/70 focus:border-ink focus:outline-none aria-invalid:border-red rounded-[var(--radius-xs)]";
export const textareaCls =
  "w-full border border-line bg-white px-3 py-2.5 text-[0.9375rem] text-ink placeholder:text-mute/70 focus:border-ink focus:outline-none aria-invalid:border-red rounded-[var(--radius-xs)]";
export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-xs)] bg-red px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-deep disabled:pointer-events-none disabled:opacity-50";
export const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-xs)] border border-ink px-5 text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-50";
export const btnSmall =
  "inline-flex h-9 items-center justify-center rounded-[var(--radius-xs)] border border-line bg-white px-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:border-ink";
export const btnDanger =
  "inline-flex h-9 items-center justify-center rounded-[var(--radius-xs)] border border-line bg-white px-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-red-text transition-colors hover:border-red-text";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-[0.8125rem] font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
      {error ? (
        <p id={`${name}-erro`} role="alert" className="mt-1 text-xs font-semibold text-red-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const statusTone: Record<VehicleStatus, string> = {
  disponivel: "bg-ok/10 text-ok border-ok/30",
  reservado: "bg-amber-50 text-amber-800 border-amber-300",
  vendido: "bg-paper-2 text-mute border-line",
};
export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] rounded-[var(--radius-xs)] ${statusTone[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function PageTitle({ title, children, subtitle }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-3xl sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-mute">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
