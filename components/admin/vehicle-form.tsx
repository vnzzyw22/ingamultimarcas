"use client";

import { useActionState } from "react";
import { saveVehicleAction, type FormState } from "@/app/admin/actions";
import type { Vehicle } from "@/types/vehicle";
import { BODY_TYPES, CONDITIONS, FEATURES, FUELS, TRANSMISSIONS, VEHICLE_STATUSES } from "@/types/vehicle";
import { bodyTypeLabels, conditionLabels, featureLabels, fuelLabels, statusLabels, transmissionLabels } from "@/lib/vehicles/labels";
import { Field, btnPrimary, inputCls, textareaCls } from "@/components/admin/ui";

const initial: FormState = {};

/**
 * Formulário de cadastro/edição. Mostra o erro junto de cada campo e, se a validação falhar, devolve o
 * que a pessoa digitou (nada se perde). O preço aceita "129.900" ou "129900".
 */
export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action, pending] = useActionState(saveVehicleAction, initial);
  const e = state.errors ?? {};
  // valor atual de um campo: o que foi digitado (se houve erro) → o veículo salvo → vazio
  const val = (key: string, fallback?: string | number) => {
    const typed = state.values?.[key];
    if (typeof typed === "string") return typed;
    return fallback === undefined ? "" : String(fallback);
  };
  const checkedFeatures = new Set<string>(Array.isArray(state.values?.features) ? state.values.features : (vehicle?.features ?? []));
  const err = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-erro` : undefined });
  const select = (name: string, label: string, options: readonly string[], labels: Record<string, string>, fallback: string) => (
    <Field label={label} name={name} error={e[name]}>
      <select id={name} name={name} defaultValue={val(name, fallback)} className={inputCls} {...err(name)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </Field>
  );
  const text = (name: string, label: string, opts: { fallback?: string | number; hint?: string; placeholder?: string; mode?: "numeric" | "text"; className?: string } = {}) => (
    <Field label={label} name={name} error={e[name]} hint={opts.hint} className={opts.className}>
      <input id={name} name={name} defaultValue={val(name, opts.fallback)} placeholder={opts.placeholder} inputMode={opts.mode} className={inputCls} {...err(name)} />
    </Field>
  );

  return (
    <form action={action} className="grid gap-8" noValidate>
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

      {state.message ? (
        <p role={state.saved ? "status" : "alert"} className={`border px-4 py-3 text-sm font-semibold ${state.saved ? "border-ok/30 bg-ok/10 text-ok" : "border-red/40 bg-red/5 text-red-text"}`}>
          {state.message}
        </p>
      ) : null}

      <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Identificação</legend>
        {text("brand", "Marca", { fallback: vehicle?.brand, placeholder: "Toyota" })}
        {text("model", "Modelo", { fallback: vehicle?.model, placeholder: "Corolla" })}
        {text("version", "Versão", { fallback: vehicle?.version, placeholder: "XEi 2.0" })}
        {text("year", "Ano do modelo", { fallback: vehicle?.year, mode: "numeric", placeholder: "2024" })}
        {text("manufactureYear", "Ano de fabricação", { fallback: vehicle?.manufactureYear, mode: "numeric", hint: "Se vazio, usa o ano do modelo." })}
        {text("color", "Cor", { fallback: vehicle?.color, placeholder: "Prata" })}
      </fieldset>

      <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Preço e quilometragem</legend>
        {text("price", "Preço (R$)", { fallback: vehicle?.price, mode: "numeric", placeholder: "129900", hint: "Só números. Ex.: 129900" })}
        {text("oldPrice", "Preço antigo (opcional)", { fallback: vehicle?.oldPrice, mode: "numeric", hint: "Aparece riscado. Deve ser maior que o preço." })}
        {text("mileage", "Quilometragem (km)", { fallback: vehicle?.mileage, mode: "numeric", placeholder: "18400" })}
      </fieldset>

      <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Ficha técnica</legend>
        {select("bodyType", "Carroceria", BODY_TYPES, bodyTypeLabels, vehicle?.bodyType ?? "sedan")}
        {select("transmission", "Câmbio", TRANSMISSIONS, transmissionLabels, vehicle?.transmission ?? "automatico")}
        {select("fuel", "Combustível", FUELS, fuelLabels, vehicle?.fuel ?? "flex")}
        {text("engine", "Motor", { fallback: vehicle?.engine, placeholder: "2.0", hint: "Ex.: 1.0, 2.0, Elétrico" })}
        {text("power", "Potência em cv (opcional)", { fallback: vehicle?.power, mode: "numeric" })}
        {text("doors", "Portas", { fallback: vehicle?.doors ?? 4, mode: "numeric" })}
        {select("condition", "Condição", CONDITIONS, conditionLabels, vehicle?.condition ?? "seminovo")}
      </fieldset>

      <fieldset className="border border-line bg-white p-5">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Opcionais</legend>
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <label key={f} className="flex min-h-9 items-center gap-2 text-sm">
              <input type="checkbox" name="features" value={f} defaultChecked={checkedFeatures.has(f)} className="size-4 accent-[var(--color-red)]" />
              {featureLabels[f]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 border border-line bg-white p-5">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Descrição</legend>
        <Field label="Texto que aparece na página do veículo" name="description" error={e.description} hint="Estado de conservação, revisões, histórico. Até 2000 caracteres.">
          <textarea id="description" name="description" rows={5} defaultValue={val("description", vehicle?.description)} className={textareaCls} {...err("description")} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
        <legend className="px-2 text-sm font-bold uppercase tracking-[0.1em]">Situação</legend>
        {select("status", "Situação", VEHICLE_STATUSES, statusLabels, vehicle?.status ?? "disponivel")}
        <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold">
          <input type="checkbox" name="featured" defaultChecked={state.values ? state.values.featured === "on" : (vehicle?.featured ?? false)} className="size-4 accent-[var(--color-red)]" />
          Mostrar em destaque na página inicial
        </label>
        <p className="text-xs text-mute sm:col-span-2">Veículos “Vendido” saem do site automaticamente, mas continuam aqui no painel.</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Salvando…" : vehicle ? "Salvar alterações" : "Cadastrar e adicionar fotos"}
        </button>
        {!vehicle ? <p className="text-xs text-mute">As fotos são adicionadas na tela seguinte.</p> : null}
      </div>
    </form>
  );
}
