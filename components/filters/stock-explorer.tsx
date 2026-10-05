"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useTransition } from "react";
import type { Vehicle } from "@/types/vehicle";
import { applyFilters, sortVehicles } from "@/lib/filters/apply";
import { activeChips } from "@/lib/filters/chips";
import { deriveFacets, pruneDependents } from "@/lib/filters/facets";
import { countActiveFilters, parseFilters, serializeFilters } from "@/lib/filters/params";
import { SORT_KEYS, emptyFilters, sortLabels, type SortKey, type VehicleFilters } from "@/lib/filters/types";
import { FilterPanel } from "@/components/filters/filter-panel";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { Close, Sliders } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";

function resultLabel(n: number) {
  if (n === 0) return "Nenhum veículo encontrado";
  return n === 1 ? "1 veículo encontrado" : `${n} veículos encontrados`;
}

/**
 * Estoque interativo. A URL é a fonte de verdade (compartilhável, volta no
 * histórico); filtros/ordenação são funções puras de lib/filters.
 */
export function StockExplorer({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { filters, sort } = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const facets = useMemo(() => deriveFacets(vehicles, filters), [vehicles, filters]);
  const results = useMemo(() => sortVehicles(applyFilters(vehicles, filters), sort), [vehicles, filters, sort]);
  const chips = useMemo(() => activeChips(filters, facets), [filters, facets]);
  const activeCount = countActiveFilters(filters);

  const navigate = useCallback(
    (next: VehicleFilters, nextSort: SortKey = sort) => {
      const qs = serializeFilters(pruneDependents(vehicles, next), nextSort).toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, sort, vehicles],
  );

  const clearAll = () => navigate(emptyFilters());

  const sortSelect = (testId: string) => (
    <Select
      label="Ordenar por"
      hideLabel
      value={sort}
      onChange={(v) => navigate(filters, v as SortKey)}
      options={SORT_KEYS.map((k) => ({ value: k, label: sortLabels[k] }))}
      testId={testId}
    />
  );

  return (
    <div className="container-x pb-24 pt-8 lg:grid lg:grid-cols-[17.5rem_1fr] lg:gap-12 lg:pt-12 xl:grid-cols-[19rem_1fr] xl:gap-16">
      {/* Desktop: lateral fixa durante a rolagem */}
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8 pr-2 [scrollbar-width:thin]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="display text-2xl">Filtrar</h2>
            {activeCount > 0 ? (
              <button type="button" onClick={clearAll} className="text-xs font-bold uppercase tracking-[0.1em] text-red-text hover:underline">
                Limpar filtros
              </button>
            ) : null}
          </div>
          <FilterPanel filters={filters} facets={facets} onChange={(n) => navigate(n)} />
        </div>
      </aside>

      <div ref={resultsRef}>
        {/* Barra de resultado + ordenação. No mobile fica fixa sob o header. */}
        <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <p className="tnum text-sm font-semibold text-ink" aria-live="polite" data-testid="result-count">
              {resultLabel(results.length)}
            </p>
            <div className="hidden w-56 lg:block">{sortSelect("sort-desktop")}</div>
            <button
              type="button"
              onClick={() => drawerRef.current?.showModal()}
              className="inline-flex h-11 items-center gap-2 border border-ink px-4 text-xs font-bold uppercase tracking-[0.1em] text-ink lg:hidden rounded-[var(--radius-xs)]"
              aria-haspopup="dialog"
            >
              <Sliders className="text-base" />
              Filtros
              {activeCount > 0 ? <span className="tnum grid size-5 place-items-center bg-red text-[0.6875rem] text-white">{activeCount}</span> : null}
            </button>
          </div>
        </div>

        {chips.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Filtros ativos">
            {chips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  onClick={() => navigate(chip.remove(filters))}
                  className="inline-flex h-9 items-center gap-2 bg-ink pl-3 pr-2.5 text-xs font-semibold text-paper transition-colors hover:bg-red-deep rounded-[var(--radius-xs)]"
                  aria-label={`Remover filtro ${chip.label}`}
                >
                  {chip.label}
                  <Close className="text-sm opacity-70" />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="inline-flex h-9 items-center px-2 text-xs font-bold uppercase tracking-[0.1em] text-ink underline decoration-red decoration-2 underline-offset-4">
                Limpar tudo
              </button>
            </li>
          </ul>
        ) : null}

        <div className={`mt-8 transition-opacity duration-200 ${isPending ? "opacity-50" : "opacity-100"}`} aria-busy={isPending}>
          {results.length === 0 ? (
            <div className="border-y border-line py-20 text-center">
              <p className="display text-3xl sm:text-4xl">Nada por aqui.</p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-mute">
                Não encontramos veículos com esses filtros. Tente remover algum critério ou fale com a loja — podemos procurar o carro para você.
              </p>
              <div className="mt-8 flex justify-center">
                <Button onClick={clearAll}>Limpar filtros</Button>
              </div>
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" data-testid="vehicle-grid">
              <AnimatePresence initial={false} mode="popLayout">
                {results.map((v, i) => (
                  <motion.li
                    key={v.id}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <VehicleCard vehicle={v} priority={i < 3} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Mobile: drawer de filtros (dialog nativo = foco preso + Esc). */}
      <dialog
        ref={drawerRef}
        aria-label="Filtros"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 text-ink backdrop:bg-ink/60 open:flex open:flex-col lg:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className="display text-2xl">Filtros</h2>
          <button type="button" onClick={() => drawerRef.current?.close()} className="-mr-2 inline-flex size-11 items-center justify-center text-2xl" aria-label="Fechar filtros">
            <Close />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-5">
          <div className="mb-5">{sortSelect("sort-mobile")}</div>
          <FilterPanel filters={filters} facets={facets} onChange={(n) => navigate(n)} />
        </div>
        <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line bg-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <Button variant="outline" onClick={clearAll} disabled={activeCount === 0}>
            Limpar
          </Button>
          <Button onClick={() => drawerRef.current?.close()} data-testid="drawer-apply">
            {results.length === 0 ? "Nenhum resultado" : `Ver ${results.length} ${results.length === 1 ? "veículo" : "veículos"}`}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
