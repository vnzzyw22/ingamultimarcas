"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "@/components/ui/icons";

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundário à direita (ex.: contagem). */
  hint?: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Rótulo da opção vazia ("Todas", "Qualquer"). Omitir = sem opção vazia. */
  placeholder?: string;
  disabled?: boolean;
  /** Nome para envio em <form> nativo (gera input hidden). */
  name?: string;
  /**
   * glass: sobre fotografia/fundo escuro (busca da home).
   * light: formulários e filtros em fundo claro.
   */
  tone?: "glass" | "light";
  /** Rótulo flutuante dentro do campo (busca da home) ou acima (padrão). */
  inlineLabel?: boolean;
  /** Mantém o rótulo só para leitores de tela. */
  hideLabel?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Select próprio no padrão "listbox" da WAI-ARIA (botão + lista).
 * Teclado: Enter/Espaço/↓/↑ abrem; ↑↓ Home End navegam; letras saltam pela
 * inicial; Enter seleciona; Esc/Tab fecham. Foco volta ao botão ao fechar.
 */
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  name,
  tone = "light",
  inlineLabel,
  hideLabel,
  className = "",
  testId,
}: Props) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", t: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  /** No celular a lista vira "bottom sheet": alvos maiores e sem cobrir o campo. */
  const [sheet, setSheet] = useState(false);

  const all: SelectOption[] = placeholder !== undefined ? [{ value: "", label: placeholder }, ...options] : options;
  const selectedIndex = Math.max(0, all.findIndex((o) => o.value === value));
  const selected = all[selectedIndex];
  const isPlaceholder = !value && placeholder !== undefined;
  const glass = tone === "glass";

  function openList() {
    if (disabled) return;
    // Abre para cima se não houver espaço abaixo.
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setDropUp(window.innerHeight - r.bottom < 300 && r.top > window.innerHeight - r.bottom);
    setSheet(window.matchMedia("(max-width: 639px)").matches);
    setActive(selectedIndex);
    setOpen(true);
  }

  function close(focusButton = true) {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }

  function choose(i: number) {
    const opt = all[i];
    if (opt) onChange(opt.value);
    close();
  }

  // Foco na lista ao abrir; fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Mantém a opção ativa visível.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onButtonKey(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = all.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(last, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = e.timeStamp;
          const t = typeahead.current;
          t.text = now - t.t > 700 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
          t.t = now;
          const hit = all.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (hit >= 0) setActive(hit);
        }
    }
  }

  const triggerCls = glass
    ? `h-16 border-0 bg-transparent px-4 text-paper hover:bg-white/[0.06] focus-visible:bg-white/[0.08] ${inlineLabel ? "pt-6 pb-2" : ""}`
    : `h-11 border border-line bg-white px-3 text-ink hover:border-ink/50 focus-visible:border-ink rounded-[var(--radius-xs)]`;

  // Vidro "denso": o desfoque dá profundidade sem prejudicar a leitura das opções.
  const panelCls = glass
    ? "border border-white/12 text-paper shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[28px] backdrop-saturate-150"
    : "border border-line text-ink shadow-[0_18px_40px_-18px_rgba(10,10,10,0.35)] backdrop-blur-xl backdrop-saturate-150";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <span
        id={`${id}-label`}
        className={
          hideLabel
            ? "sr-only"
            : inlineLabel
            ? `pointer-events-none absolute left-4 top-2.5 z-10 text-[0.625rem] font-bold uppercase tracking-[0.14em] ${glass ? "text-paper/55" : "text-mute"}`
            : "mb-2 block text-[0.8125rem] font-semibold text-ink"
        }
      >
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        id={`${id}-button`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-button`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKey}
        data-testid={testId}
        className={`tnum flex w-full items-center justify-between gap-2 text-left text-[0.9375rem] font-semibold outline-none transition-colors duration-150 disabled:cursor-not-allowed ${triggerCls}`}
      >
        <span className={`truncate ${isPlaceholder ? (glass ? "text-paper/60" : "text-mute") : ""} ${disabled ? "opacity-50" : ""}`}>
          {selected?.label}
        </span>
        <ChevronDown className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${glass ? "text-paper/60" : "text-mute"}`} />
      </button>

      <AnimatePresence>
        {open && sheet ? (
          <motion.div
            key="scrim"
            aria-hidden
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => close()}
          />
        ) : null}
        {open ? (
          <motion.div
            key="panel"
            initial={sheet ? { y: "100%" } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.985 }}
            animate={sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={sheet ? { y: "100%", transition: { duration: 0.2 } } : { opacity: 0, y: dropUp ? 4 : -4, transition: { duration: 0.12 } }}
            transition={sheet ? { duration: 0.32, ease: [0.25, 1, 0.5, 1] } : { duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
            style={sheet ? undefined : { transformOrigin: dropUp ? "bottom" : "top" }}
            className={
              sheet
                ? `fixed inset-x-0 bottom-0 z-[61] flex max-h-[72dvh] flex-col pb-[env(safe-area-inset-bottom)] ${panelCls} border-x-0 border-b-0 ${glass ? "bg-ink-2/95" : "bg-white/95"}`
                : `absolute left-0 z-50 w-full min-w-[12rem] rounded-[var(--radius-sm)] ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"} ${panelCls} ${glass ? "bg-ink-2/85" : "bg-white/90"}`
            }
          >
            {sheet ? (
              <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
                <span className={`eyebrow ${glass ? "text-paper/60" : "text-mute"}`}>{label}</span>
                <span aria-hidden className={`h-1 w-10 rounded-full ${glass ? "bg-white/25" : "bg-ink/20"}`} />
              </div>
            ) : null}
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={`${id}-label`}
              aria-activedescendant={`${id}-opt-${active}`}
              onKeyDown={onListKey}
              className={`overflow-y-auto overscroll-contain py-1.5 outline-none [scrollbar-width:thin] ${sheet ? "flex-1 pb-4" : "max-h-72"}`}
            >
              {all.map((o, i) => {
                const isSel = i === selectedIndex;
                const isActive = i === active;
                return (
                  <li
                    key={o.value || "__empty"}
                    id={`${id}-opt-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSel}
                    onPointerMove={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={`tnum relative flex cursor-pointer items-center gap-3 transition-colors duration-100 ${
                      sheet ? "min-h-14 px-5 text-base" : "min-h-11 px-4 text-[0.9375rem]"
                    } ${isActive ? (glass ? "bg-white/10" : "bg-ink/[0.05]") : ""} ${isSel ? "font-semibold" : ""} ${
                      !o.value && placeholder !== undefined ? (glass ? "text-paper/60" : "text-mute") : ""
                    }`}
                  >
                    {/* Barra vermelha marca a opção selecionada (uso pontual do vermelho) */}
                    <span aria-hidden className={`absolute inset-y-2 left-0 w-0.5 bg-red transition-opacity ${isSel ? "opacity-100" : "opacity-0"}`} />
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.hint ? <span className={`text-xs ${glass ? "text-paper/50" : "text-mute"}`}>{o.hint}</span> : null}
                    {isSel ? <Check className="shrink-0 text-red" /> : null}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
