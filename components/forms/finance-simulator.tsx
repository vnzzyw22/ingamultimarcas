"use client";

import { useId, useMemo, useState } from "react";
import type { Vehicle } from "@/types/vehicle";
import { financeConfig } from "@/config/finance";
import { simulateFinancing } from "@/lib/finance";
import { formatMoney, formatNumber, formatPrice, parseDigits } from "@/lib/format";
import { financeMessage, whatsappUrl } from "@/lib/whatsapp";
import { ExternalButton } from "@/components/ui/button";
import { WhatsApp } from "@/components/ui/icons";

interface Props {
  vehicle?: Pick<Vehicle, "brand" | "model" | "version" | "year" | "manufactureYear" | "price">;
  initialValue?: number;
  tone?: "light" | "dark";
}

/** Simulação estimativa (Tabela Price) com taxa configurável em config/finance.ts. */
export function FinanceSimulator({ vehicle, initialValue, tone = "light" }: Props) {
  const id = useId();
  const start = vehicle?.price ?? initialValue ?? 100000;
  const [valueText, setValueText] = useState(formatNumber(start));
  const [downText, setDownText] = useState(formatNumber(Math.round(start * financeConfig.defaultDownPaymentRatio)));
  const [installments, setInstallments] = useState<number>(financeConfig.defaultInstallments);

  const value = parseDigits(valueText) ?? 0;
  const down = parseDigits(downText) ?? 0;
  const result = useMemo(
    () => simulateFinancing({ vehicleValue: value, downPayment: down, installments }),
    [value, down, installments],
  );

  const dark = tone === "dark";
  const errors = {
    value: value <= 0 ? "Informe o valor do veículo." : "",
    down: down >= value && value > 0 ? "A entrada cobre o valor total — não há o que financiar." : "",
  };
  const valid = !errors.value && !errors.down;

  const inputCls = `tnum h-14 w-full border pl-11 pr-3 font-display text-2xl focus:outline-none rounded-[var(--radius-xs)] ${
    dark ? "border-line-dark bg-ink-2 text-paper focus:border-paper" : "border-line bg-white text-ink focus:border-ink"
  }`;
  const labelCls = `mb-2 block text-[0.8125rem] font-semibold ${dark ? "text-paper" : "text-ink"}`;
  const muted = dark ? "text-mute-dark" : "text-mute";

  const money = (key: string, label: string, text: string, set: (s: string) => void, error: string, hint?: string) => (
    <div>
      <label htmlFor={`${id}-${key}`} className={labelCls}>
        {label}
      </label>
      <div className="relative">
        <span className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${muted}`}>R$</span>
        <input
          id={`${id}-${key}`}
          inputMode="numeric"
          autoComplete="off"
          value={text}
          onChange={(e) => {
            const n = parseDigits(e.target.value);
            set(n === undefined ? "" : formatNumber(n));
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={`${id}-${key}-msg`}
          className={inputCls}
          data-testid={`finance-${key}`}
        />
      </div>
      <p id={`${id}-${key}-msg`} className={`mt-1.5 min-h-4 text-xs ${error ? (dark ? "text-red-on-dark" : "text-red-text") : muted}`}>
        {error || hint}
      </p>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
      <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()} aria-label="Dados da simulação">
        {money("value", "Valor do veículo", valueText, setValueText, errors.value)}
        {money(
          "down",
          "Entrada",
          downText,
          setDownText,
          errors.down,
          value > 0 ? `${Math.round((down / value) * 100)}% do valor` : undefined,
        )}
        <fieldset>
          <legend className={labelCls}>Número de parcelas</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {financeConfig.installmentOptions.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={installments === n}
                onClick={() => setInstallments(n)}
                className={`tnum h-12 border font-display text-lg transition-colors rounded-[var(--radius-xs)] ${
                  dark
                    ? "border-line-dark text-paper hover:border-paper aria-pressed:border-red aria-pressed:bg-red"
                    : "border-line text-ink hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <div className={`flex flex-col border-t-2 pt-6 ${dark ? "border-red" : "border-ink"}`} aria-live="polite">
        <p className={`eyebrow ${muted}`}>Parcela estimada</p>
        <p className="tnum mt-3 font-display text-5xl font-semibold leading-none sm:text-6xl" data-testid="finance-installment">
          {valid ? (
            <>
              <span className="mr-2 align-top text-2xl">{installments}x</span>
              {formatMoney(result.installment)}
            </>
          ) : (
            "—"
          )}
        </p>
        <dl className={`mt-6 grid gap-2 text-sm ${muted}`}>
          <div className="flex justify-between gap-4">
            <dt>Valor financiado</dt>
            <dd className={`tnum font-semibold ${dark ? "text-paper" : "text-ink"}`}>{valid ? formatPrice(result.financed) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total a prazo (estimado)</dt>
            <dd className={`tnum font-semibold ${dark ? "text-paper" : "text-ink"}`}>{valid ? formatPrice(Math.round(result.total + down)) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Taxa de referência</dt>
            <dd className="tnum">
              {(financeConfig.monthlyRate * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.m.
              {financeConfig.isDemoRate ? " (demo)" : ""}
            </dd>
          </div>
        </dl>
        <p className={`mt-6 text-xs leading-relaxed ${muted}`}>{financeConfig.disclaimer}</p>

        <ExternalButton
          href={
            valid
              ? whatsappUrl(
                  financeMessage({
                    vehicleValue: value,
                    downPayment: down,
                    installments,
                    installmentValue: formatMoney(result.installment),
                    vehicle,
                  }),
                )
              : undefined
          }
          aria-disabled={!valid || undefined}
          variant="whatsapp"
          size="lg"
          className={`mt-6 ${valid ? "" : "pointer-events-none opacity-45"}`}
        >
          <WhatsApp className="text-lg" /> Pedir análise de crédito
        </ExternalButton>
      </div>
    </div>
  );
}
