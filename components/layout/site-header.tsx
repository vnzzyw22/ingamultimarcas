"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { BrandMark } from "@/components/layout/brand-mark";
import { ButtonLink, ExternalButton } from "@/components/ui/button";
import { Close, Menu, WhatsApp } from "@/components/ui/icons";

export function SiteHeader() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastY = useRef(0);

  // Esconde ao rolar para baixo, reaparece ao rolar para cima.
  // No estoque o header fica fixo: a barra de resultados/filtros encosta nele.
  const pinned = pathname.startsWith("/estoque");
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (pinned) setHidden(false);
      else if (y > 240 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y <= 240) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pinned]);

  // Fecha o menu mobile ao navegar.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Só a home tem hero escuro sob o header; nas demais o header é sempre sólido.
  const solid = scrolled || pathname !== "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 text-paper transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-out-quart)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "border-b border-line-dark bg-ink" : "border-b border-transparent bg-ink/0"}`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Link href="/" aria-label={`${siteConfig.name} — página inicial`} className="shrink-0">
            <BrandMark variant="completa" priority className="h-[3.25rem] lg:h-16" />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="relative py-2 text-[0.8125rem] font-semibold tracking-[0.02em] text-paper/80 transition-colors hover:text-paper aria-[current=page]:text-paper after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/estoque" size="sm" className="max-sm:hidden">
              Ver estoque
            </ButtonLink>
            <Link
              href="/estoque"
              className="inline-flex h-10 items-center px-3 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-paper sm:hidden"
            >
              Estoque
            </Link>
            <button
              type="button"
              onClick={() => dialogRef.current?.showModal()}
              className="-mr-2 inline-flex size-11 items-center justify-center text-2xl text-paper lg:hidden"
              aria-label="Abrir menu"
              aria-haspopup="dialog"
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-ink/80 open:flex open:flex-col lg:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="container-x flex h-16 shrink-0 items-center justify-between">
          <BrandMark variant="completa" className="h-[3.25rem]" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-mr-2 inline-flex size-11 items-center justify-center text-2xl"
            aria-label="Fechar menu"
            autoFocus
          >
            <Close />
          </button>
        </div>
        <nav aria-label="Menu mobile" className="container-x flex-1 overflow-y-auto pt-6">
          <ul className="border-t border-line-dark">
            {mainNav.map((item, i) => (
              <li key={item.href} className="border-b border-line-dark">
                <Link
                  href={item.href}
                  onClick={() => dialogRef.current?.close()}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-baseline justify-between py-5 aria-[current=page]:text-red-on-dark"
                >
                  <span className="display text-[2rem]">{item.label}</span>
                  <span className="tnum text-xs text-mute-dark">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-x grid shrink-0 gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
          <ButtonLink href="/estoque" size="lg" onClick={() => dialogRef.current?.close()}>
            Ver estoque
          </ButtonLink>
          <ExternalButton href={whatsappUrl(`Olá! Vim pelo site da ${siteConfig.name}.`)} variant="outline-light" size="lg">
            <WhatsApp className="text-lg" /> WhatsApp
          </ExternalButton>
        </div>
      </dialog>
    </>
  );
}
