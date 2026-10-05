"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import type { FacetOption } from "@/lib/filters/facets";
import { formatNumber, parseDigits } from "@/lib/format";
import { ChevronDown } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";

/** Grupo recolhível (details/summary nativo: teclado e leitor de tela de graça). */
export function FilterGroup({
  title,
  children,
  defaultOpen = true,
  activeCount = 0,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
}) {
  return (
    <details open={defaultOpen} className="group/fg border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-ink">
          {title}
          {activeCount > 0 ? <span className="ml-2 text-red-text">{activeCount}</span> : null}
        </span>
        <ChevronDown className="text-base text-mute transition-transform group-open/fg:rotate-180" />
      </summary>
      <div className="grid gap-5 pb-5">{children}</div>
    </details>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[0.8125rem] font-semibold text-ink">
      {children}
    </label>
  );
}

/** Lista de checkboxes com contagem; opções sem resultado ficam desabilitadas (não somem). */
export function CheckboxList<T extends string | number>({
  legend,
  options,
  selected,
  onToggle,
  initialVisible = 6,
}: {
  legend: string;
  options: FacetOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (options.length === 0) return null;
  // Selecionados sempre visíveis, mesmo além do corte.
  const visible = expanded
    ? options
    : options.filter((o, i) => i < initialVisible || selected.includes(o.value));
  const hidden = options.length - visible.length;

  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">{legend}</legend>
      <ul className="grid gap-0.5">
        {visible.map((o) => {
          const checked = selected.includes(o.value);
          const disabled = !checked && o.count === 0;
          return (
            <li key={String(o.value)}>
              <label
                className={`flex min-h-10 cursor-pointer items-center gap-3 text-sm ${disabled ? "cursor-not-allowed text-mute/70" : "text-ink"}`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(o.value)}
                />
                <span
                  aria-hidden
                  className="grid size-[1.125rem] shrink-0 place-items-center border border-ink/40 transition-colors peer-checked:border-red peer-checked:bg-red peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red peer-disabled:border-line"
                >
                  <svg viewBox="0 0 12 12" className={`size-2.5 text-white ${checked ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6.5l2.5 2.5L10 3.5" />
                  </svg>
                </span>
                <span className="flex-1">{o.label}</span>
                <span className="tnum text-xs text-mute" aria-hidden>
                  {o.count}
                </span>
                <span className="sr-only">, {o.count} {o.count === 1 ? "veículo" : "veículos"}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {hidden > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 min-h-10 text-xs font-bold uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          {expanded ? "Mostrar menos" : `Mostrar mais ${hidden}`}
        </button>
      ) : null}
    </fieldset>
  );
}

/** Botões de alternância (carroceria, condição): mais rápidos que checkbox para poucas opções. */
export function ToggleChips<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: FacetOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const pressed = selected.includes(o.value);
          const disabled = !pressed && o.count === 0;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={pressed}
              disabled={disabled}
              onClick={() => onToggle(o.value)}
              className="h-10 border border-line px-3.5 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper disabled:cursor-not-allowed disabled:text-mute/60 disabled:hover:border-line rounded-[var(--radius-xs)]"
            >
              {o.label}
              <span className="tnum ml-1.5 text-xs font-medium opacity-60">{o.count}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Par mínimo/máximo numérico. Mantém texto local enquanto o usuário digita
 * e só confirma (onCommit) após pausa, blur ou Enter — evita navegar a cada tecla.
 */
export function RangeInputs({
  legend,
  min,
  max,
  placeholderMin,
  placeholderMax,
  onCommit,
  prefix,
  suffix,
}: {
  legend: string;
  min?: number;
  max?: number;
  placeholderMin: string;
  placeholderMax: string;
  onCommit: (min?: number, max?: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  const id = useId();
  const fmt = (n?: number) => (n === undefined ? "" : formatNumber(n));
  const [a, setA] = useState(fmt(min));
  const [b, setB] = useState(fmt(max));

  // Sincroniza quando o filtro muda por fora (chip removido, limpar filtros).
  const [prev, setPrev] = useState({ min, max });
  if (prev.min !== min || prev.max !== max) {
    setPrev({ min, max });
    setA(fmt(min));
    setB(fmt(max));
  }

  const commit = (nextA = a, nextB = b) => {
    const lo = parseDigits(nextA);
    const hi = parseDigits(nextB);
    if (lo === min && hi === max) return;
    onCommit(lo, hi);
  };

  // Debounce durante a digitação.
  useEffect(() => {
    const t = setTimeout(() => commit(), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b]);

  const invalid = (() => {
    const lo = parseDigits(a);
    const hi = parseDigits(b);
    return lo !== undefined && hi !== undefined && lo > hi;
  })();

  const input = (value: string, set: (s: string) => void, label: string, placeholder: string, key: string) => (
    <div className="relative flex-1">
      <label htmlFor={`${id}-${key}`} className="sr-only">
        {legend} {label}
      </label>
      {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mute">{prefix}</span> : null}
      <input
        id={`${id}-${key}`}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(e) => set(e.target.value.replace(/[^\d.]/g, ""))}
        onBlur={() => commit()}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className={`tnum h-11 w-full border border-line bg-white text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none aria-invalid:border-red rounded-[var(--radius-xs)] ${prefix ? "pl-9" : "pl-3"} ${suffix ? "pr-9" : "pr-3"}`}
      />
      {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-mute">{suffix}</span> : null}
    </div>
  );

  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">{legend}</legend>
      <div className="flex items-center gap-2">
        {input(a, setA, "mínimo", placeholderMin, "min")}
        <span aria-hidden className="text-mute">
          –
        </span>
        {input(b, setB, "máximo", placeholderMax, "max")}
      </div>
      {invalid ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-red-text">
          O mínimo está maior que o máximo.
        </p>
      ) : null}
    </fieldset>
  );
}

/** Ano mínimo/máximo (lista curta e finita, derivada dos dados). */
export function YearRange({
  min,
  max,
  bounds,
  onChange,
}: {
  min?: number;
  max?: number;
  bounds: { min: number; max: number };
  onChange: (min?: number, max?: number) => void;
}) {
  const years: number[] = [];
  for (let y = bounds.max; y >= bounds.min; y--) years.push(y);
  const toNum = (v: string) => (v ? Number(v) : undefined);
  const opts = (keep: (y: number) => boolean) => years.filter(keep).map((y) => ({ value: String(y), label: String(y) }));
  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">Ano do modelo</legend>
      <div className="flex items-center gap-2">
        <Select
          label="Ano mínimo"
          hideLabel
          className="flex-1"
          value={min === undefined ? "" : String(min)}
          onChange={(v) => onChange(toNum(v), max)}
          options={opts((y) => max === undefined || y <= max)}
          placeholder="De"
          testId="year-min"
        />
        <span aria-hidden className="text-mute">
          –
        </span>
        <Select
          label="Ano máximo"
          hideLabel
          className="flex-1"
          value={max === undefined ? "" : String(max)}
          onChange={(v) => onChange(min, toNum(v))}
          options={opts((y) => min === undefined || y >= min)}
          placeholder="Até"
          testId="year-max"
        />
      </div>
    </fieldset>
  );
}
