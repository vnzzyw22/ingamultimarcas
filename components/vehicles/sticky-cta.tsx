"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Barra fixa inferior (mobile) que só aparece quando os CTAs principais
 * saem da tela — evita duplicar o preço/botão logo na primeira dobra.
 */
export function StickyCta({ targetId, children }: { targetId: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry!.isIntersecting && entry!.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-sm transition-transform duration-300 ease-[var(--ease-out-quart)] lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      {children}
    </div>
  );
}
