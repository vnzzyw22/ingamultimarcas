"use client";

import { useState } from "react";
import { Check, Share } from "@/components/ui/icons";

/** Compartilhar nativo no celular; no desktop copia o link e confirma visualmente. */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function onShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      setState("error");
    }
    setTimeout(() => setState("idle"), 2400);
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className={`inline-flex h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:text-red-text ${className}`}
    >
      {state === "copied" ? <Check className="text-base text-ok" /> : <Share className="text-base" />}
      <span aria-live="polite">
        {state === "copied" ? "Link copiado" : state === "error" ? "Não foi possível copiar" : "Compartilhar"}
      </span>
    </button>
  );
}
