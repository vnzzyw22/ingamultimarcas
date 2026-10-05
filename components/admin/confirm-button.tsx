"use client";

import type { ReactNode } from "react";

/** Botão de envio que pede confirmação antes (ações que apagam algo). Sem JavaScript, o envio não acontece. */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
