"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="bg-ink pb-24 pt-36 text-paper">
      <div className="container-x">
        <p className="eyebrow mb-4 text-mute-dark">Erro</p>
        <h1 className="display text-5xl sm:text-6xl">Algo não carregou.</h1>
        <p className="mt-5 max-w-lg text-paper/75">Tente novamente. Se o problema continuar, fale com a loja pelo WhatsApp.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Tentar novamente</Button>
          <ButtonLink href="/estoque" variant="outline-light">
            Ir para o estoque
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
