"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Vehicle } from "@/types/vehicle";
import { formatPrice, formatYear } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { sendLead } from "@/lib/leads/client";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Close, WhatsApp } from "@/components/ui/icons";

const INTENTS = [
  { value: "visita", label: "Agendar uma visita", text: "Gostaria de agendar uma visita para ver o carro." },
  { value: "financiamento", label: "Financiar", text: "Gostaria de simular um financiamento." },
  { value: "troca", label: "Dar meu carro na troca", text: "Tenho um veículo para dar na troca." },
  { value: "duvidas", label: "Tirar dúvidas", text: "Gostaria de tirar algumas dúvidas." },
] as const;

/**
 * "Tenho interesse": coleta intenção + nome, registra o contato no painel e abre o WhatsApp com a mensagem
 * completa. O registro é só um aviso para a loja; quem confirma o envio é o usuário, no WhatsApp.
 */
export function InterestDialog({
  vehicle: v,
  className,
  size = "lg",
}: {
  vehicle: Vehicle;
  className?: string;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [intent, setIntent] = useState<(typeof INTENTS)[number]["value"]>("visita");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Informe seu nome para a loja saber com quem está falando.");
      return;
    }
    const chosen = INTENTS.find((i) => i.value === intent)!;
    const msg =
      `Olá! Sou ${name.trim()}. Tenho interesse no ${v.brand} ${v.model} ${v.version} ${formatYear(v)} ` +
      `anunciado pela ${siteConfig.name} por ${formatPrice(v.price)} (ref. ${v.stockCode}). ${chosen.text}`;
    sendLead({ type: "interesse", name: name.trim(), message: chosen.text, subject: `${v.brand} ${v.model} ${v.version} ${formatYear(v)} (ref. ${v.stockCode})`, vehicleSlug: v.slug });
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
    ref.current?.close();
  }

  return (
    <>
      <Button size={size} className={className} onClick={() => ref.current?.showModal()} aria-haspopup="dialog" data-testid="interest-open">
        Tenho interesse
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={`${id}-title`}
        className="m-auto w-[calc(100%-2rem)] max-w-lg bg-paper p-0 text-ink backdrop:bg-ink/70"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <form onSubmit={onSubmit} noValidate className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-mute">
                {v.brand} {v.model} · {formatYear(v)}
              </p>
              <h2 id={`${id}-title`} className="display mt-2 text-3xl">
                Como podemos ajudar?
              </h2>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="-mr-2 -mt-1 inline-flex size-11 items-center justify-center text-2xl" aria-label="Fechar">
              <Close />
            </button>
          </div>

          <fieldset className="mt-6">
            <legend className="sr-only">O que você quer fazer</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {INTENTS.map((i) => (
                <label
                  key={i.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 border border-line px-4 text-sm font-semibold transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-red rounded-[var(--radius-xs)]"
                >
                  <input type="radio" name="intent" value={i.value} checked={intent === i.value} onChange={() => setIntent(i.value)} className="sr-only" />
                  {i.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor={`${id}-name`} className="mb-2 block text-[0.8125rem] font-semibold">
              Seu nome
            </label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              autoComplete="given-name"
              aria-invalid={!!error || undefined}
              aria-describedby={error ? `${id}-err` : undefined}
              className="h-12 w-full border border-line bg-white px-3 text-[0.9375rem] focus:border-ink focus:outline-none aria-invalid:border-red rounded-[var(--radius-xs)]"
            />
            {error ? (
              <p id={`${id}-err`} className="mt-1.5 text-xs text-red-text">
                {error}
              </p>
            ) : null}
          </div>

          <Button type="submit" variant="whatsapp" size="lg" className="mt-6 w-full">
            <WhatsApp className="text-lg" /> Continuar no WhatsApp
          </Button>
          <p className="mt-3 text-center text-xs text-mute">A mensagem abre pronta no WhatsApp; você revisa antes de enviar.</p>
        </form>
      </dialog>
    </>
  );
}
