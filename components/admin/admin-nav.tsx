"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Painel", exact: true },
  { href: "/admin/veiculos", label: "Veículos" },
  { href: "/admin/contatos", label: "Contatos" },
  { href: "/admin/conta", label: "Conta" },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1 overflow-x-auto">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex h-11 shrink-0 items-center gap-2 px-3 text-[0.8125rem] font-semibold transition-colors ${
              active ? "text-paper after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:bg-red" : "text-paper/65 hover:text-paper"
            }`}
          >
            {it.label}
            {it.href === "/admin/contatos" && newLeads > 0 ? (
              <span className="tnum inline-flex min-w-5 items-center justify-center bg-red px-1.5 text-[0.6875rem] font-bold text-white rounded-[var(--radius-xs)]" aria-label={`${newLeads} novos`}>
                {newLeads}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
