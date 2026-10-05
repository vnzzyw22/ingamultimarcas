"use client";

import { useId, useState, type FormEvent } from "react";
import { tradeInMessage, whatsappUrl, type TradeInData } from "@/lib/whatsapp";
import { sendLead } from "@/lib/leads/client";
import { formatNumber } from "@/lib/format";
import { Button, ExternalButton } from "@/components/ui/button";
import { ChevronDown, WhatsApp } from "@/components/ui/icons";

type Errors = Partial<Record<keyof TradeInData, string>>;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1990 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(d: TradeInData): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Informe seu nome.";
  if (d.whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "Informe um WhatsApp com DDD.";
  if (!d.brand.trim()) e.brand = "Informe a marca.";
  if (!d.model.trim()) e.model = "Informe o modelo.";
  if (!d.year) e.year = "Selecione o ano.";
  if (!d.mileage.replace(/\D/g, "")) e.mileage = "Informe a quilometragem aproximada.";
  return e;
}

/**
 * Sem backend: o formulário valida e monta uma mensagem estruturada para o
 * WhatsApp. Não exibimos "recebemos seus dados" — o envio acontece quando o
 * usuário confirma no WhatsApp. Antes disso o contato também é registrado no painel (/api/leads).
 */
export function TradeInForm() {
  const id = useId();
  const [data, setData] = useState<TradeInData>({ name: "", whatsapp: "", brand: "", model: "", version: "", year: "", mileage: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState<string | null>(null);

  const set = (key: keyof TradeInData, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setReady(null);
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate(data);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    sendLead({ type: "venda", name: data.name, phone: data.whatsapp, message: tradeInMessage(data), subject: `${data.brand} ${data.model} ${data.year}`.trim() });
    const url = whatsappUrl(tradeInMessage(data));
    setReady(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputCls =
    "h-12 w-full border border-line bg-white px-3 text-[0.9375rem] text-ink placeholder:text-mute/80 focus:border-ink focus:outline-none aria-invalid:border-red rounded-[var(--radius-xs)]";

  const field = (key: keyof TradeInData, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="mb-2 block text-[0.8125rem] font-semibold text-ink">
        {label} {optional ? <span className="font-normal text-mute">(opcional)</span> : null}
      </label>
      <input
        id={`${id}-${key}`}
        name={key}
        value={data[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={!!errors[key] || undefined}
        aria-describedby={errors[key] ? `${id}-${key}-err` : undefined}
        className={inputCls}
        {...props}
      />
      {errors[key] ? (
        <p id={`${id}-${key}-err`} className="mt-1.5 text-xs text-red-text">
          {errors[key]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10" aria-label="Avaliação do seu veículo">
      <fieldset className="grid gap-5">
        <legend className="eyebrow mb-5 text-mute">01 — Seus dados</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("name", "Nome", { autoComplete: "name" })}
          {field("whatsapp", "WhatsApp", {
            inputMode: "tel",
            autoComplete: "tel-national",
            placeholder: "(00) 00000-0000",
            onChange: (e) => set("whatsapp", maskPhone(e.target.value)),
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="eyebrow mb-5 text-mute">02 — Seu veículo</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("brand", "Marca", { placeholder: "Ex.: Volkswagen" })}
          {field("model", "Modelo", { placeholder: "Ex.: Polo" })}
          {field("version", "Versão", { placeholder: "Ex.: Highline 200 TSI" }, true)}
          <div>
            <label htmlFor={`${id}-year`} className="mb-2 block text-[0.8125rem] font-semibold text-ink">
              Ano do modelo
            </label>
            <div className="relative">
              <select
                id={`${id}-year`}
                name="year"
                value={data.year}
                onChange={(e) => set("year", e.target.value)}
                aria-invalid={!!errors.year || undefined}
                aria-describedby={errors.year ? `${id}-year-err` : undefined}
                className={`${inputCls} tnum appearance-none pr-9`}
              >
                <option value="">Selecione</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" />
            </div>
            {errors.year ? (
              <p id={`${id}-year-err`} className="mt-1.5 text-xs text-red-text">
                {errors.year}
              </p>
            ) : null}
          </div>
          {field("mileage", "Quilometragem", {
            inputMode: "numeric",
            placeholder: "Ex.: 45.000",
            onChange: (e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
              set("mileage", digits ? formatNumber(Number(digits)) : "");
            },
          })}
        </div>
        <div>
          <label htmlFor={`${id}-notes`} className="mb-2 block text-[0.8125rem] font-semibold text-ink">
            Observações <span className="font-normal text-mute">(opcional)</span>
          </label>
          <textarea
            id={`${id}-notes`}
            name="notes"
            rows={4}
            value={data.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Estado de conservação, revisões, detalhes, se quer usar na troca…"
            className="w-full border border-line bg-white px-3 py-3 text-[0.9375rem] text-ink placeholder:text-mute/80 focus:border-ink focus:outline-none rounded-[var(--radius-xs)]"
          />
        </div>
      </fieldset>

      <div className="grid gap-4 border-t border-line pt-8">
        <Button type="submit" variant="whatsapp" size="lg" className="w-full sm:w-auto sm:justify-self-start" data-testid="tradein-submit">
          <WhatsApp className="text-lg" /> Enviar pelo WhatsApp
        </Button>
        <p className="text-sm text-mute">
          Abrimos o WhatsApp com a mensagem pronta. A loja recebe quando você tocar em enviar. Fotos podem ser mandadas na própria conversa.
        </p>
        {ready ? (
          <div role="status" className="border-l-2 border-ok bg-white px-5 py-4 text-sm" data-testid="tradein-ready">
            <p className="font-semibold text-ink">Mensagem pronta no WhatsApp.</p>
            <p className="mt-1 text-mute">Se a conversa não abriu, use o botão abaixo.</p>
            <ExternalButton href={ready} variant="outline" size="sm" className="mt-3">
              Abrir WhatsApp
            </ExternalButton>
          </div>
        ) : null}
      </div>
    </form>
  );
}
