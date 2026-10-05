"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Vehicle } from "@/types/vehicle";
import { heroVideo } from "@/data/hero-video";
import { formatMileage, formatPrice, formatYear } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Pause, Play } from "@/components/ui/icons";

/**
 * Hero: um vídeo de carro girando em estúdio. O nome "INGÁ" já está NO vídeo, atrás do carro (composição feita
 * por scripts/video/*). Toca uma vez e para no último quadro. Respeita "reduzir movimento" (fica só o poster,
 * sem autoplay) e tem botão de pausar/repetir. Abaixo, a faixa de destaques do estoque (troca manual).
 */
export function HeroShowcase({ featured, search }: { featured: Vehicle[]; search?: ReactNode }) {
  const [paused, setPaused] = useState(false); // intenção do usuário (botão)
  const [endedFor, setEndedFor] = useState<boolean | null>(null); // versão (larga/estreita) cujo vídeo já terminou
  const [reduced, setReduced] = useState(false);
  const [wide, setWide] = useState<boolean | null>(null); // null = ainda não montou (sem vídeo no SSR)
  const video = useRef<HTMLVideoElement>(null);

  // Preferências do ambiente lidas só após montar: o HTML do servidor nunca diverge do cliente.
  useEffect(() => {
    const mqWide = window.matchMedia("(min-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setWide(mqWide.matches);
      setReduced(mqMotion.matches);
    };
    sync();
    mqWide.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqWide.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  const ended = endedFor !== null && endedFor === wide; // trocar de versão = outro vídeo, que recomeça

  // Play/pause conforme a intenção do usuário e a preferência de movimento.
  useEffect(() => {
    const v = video.current;
    if (!v || ended) return;
    if (paused || reduced) v.pause();
    else v.play().catch(() => setPaused(true)); // autoplay bloqueado → mostra o botão "reproduzir"
  }, [paused, reduced, ended, wide]);

  const running = !paused && !reduced && !ended;
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (ended) {
      v.currentTime = 0;
      setEndedFor(null);
      setPaused(false);
    } else setPaused((p) => !p);
  };

  const featuredTotal = featured.length;
  const [fi, setFi] = useState(0);
  const fv = featured[fi];
  const go = (d: number) => setFi((x) => (x + d + featuredTotal) % featuredTotal);
  const [pw, ph] = heroVideo.size.wide;
  const [nw, nh] = heroVideo.size.narrow;

  return (
    <section className="relative isolate z-10 flex flex-col overflow-x-clip bg-ink pt-16 text-paper lg:pt-[4.5rem]" aria-label="Destaque">
      {/* Palco do vídeo. A proporção acompanha o arquivo (largo no desktop, mais quadrado no celular). */}
      <div className="relative aspect-[1080/800] w-full overflow-hidden bg-ink md:aspect-[1920/800]" data-testid="hero-stage">
        {/* Poster: vem no HTML do servidor (é o LCP) e fica sob o vídeo. */}
        <picture>
          <source media="(min-width: 768px)" srcSet={heroVideo.poster.wide} width={pw} height={ph} />
          <img
            src={heroVideo.poster.narrow}
            alt={heroVideo.alt}
            width={nw}
            height={nh}
            className="absolute inset-0 size-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        {wide !== null ? (
          <video
            ref={video}
            key={wide ? "wide" : "narrow"}
            src={wide ? heroVideo.video.wide : heroVideo.video.narrow}
            muted
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 size-full object-cover"
            onEnded={() => setEndedFor(wide)}
          />
        ) : null}
        {/* Esmaece a base do vídeo na cor da página para não aparecer uma "caixa". */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Pausar / repetir (movimento com mais de 5 s precisa de controle). No desktop fica sobre o piso do vídeo. */}
      <div className="container-x relative z-10 flex justify-end pb-1 pt-1 md:-mt-[3.75rem] md:pb-3">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex size-11 shrink-0 items-center justify-center border border-paper/25 bg-ink/40 text-base hover:border-paper"
          aria-label={ended ? "Repetir vídeo" : running ? "Pausar vídeo" : "Reproduzir vídeo"}
        >
          {running ? <Pause /> : <Play />}
        </button>
      </div>

      <div className="container-x relative z-10 pb-8 pt-8 lg:pb-10 lg:pt-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="display text-[2rem] sm:text-5xl lg:text-[2.75rem]">
            <span className="sr-only">Ingá Multimarcas. </span>
            Escolha no estoque.
            <span className="block text-paper/55">Fale direto com a loja.</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/estoque" size="lg">
              Ver estoque <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/venda-seu-carro" size="lg" variant="outline-light" className="max-sm:hidden">
              Avaliar meu carro
            </ButtonLink>
          </div>
        </div>
        {search ? <div className="relative z-20 mt-8 lg:mt-10">{search}</div> : null}
      </div>

      {fv ? (
        <div className="border-t border-paper/15">
          <div className="container-x flex items-stretch justify-between gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={fv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="min-w-0 py-5"
              >
                <Link href={`/veiculo/${fv.slug}`} className="group block">
                  <p className="tnum text-xs text-paper/60">
                    Destaque · {formatYear(fv)} · {formatMileage(fv.mileage)}
                  </p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-4">
                    <span className="display truncate text-2xl group-hover:underline group-hover:decoration-red group-hover:decoration-2 group-hover:underline-offset-4 sm:text-3xl">
                      {fv.brand} {fv.model}
                    </span>
                    <span className="tnum font-display text-xl text-red-on-dark sm:text-2xl">{formatPrice(fv.price)}</span>
                  </p>
                </Link>
              </motion.div>
            </AnimatePresence>
            {featuredTotal > 1 ? (
              <div className="flex shrink-0 items-center gap-1">
                <span className="tnum mr-3 hidden text-xs font-bold tracking-[0.14em] text-paper/60 sm:inline" aria-live="polite">
                  {String(fi + 1).padStart(2, "0")} / {String(featuredTotal).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => go(-1)} className="inline-flex size-11 items-center justify-center border border-paper/25 text-lg hover:border-paper" aria-label="Destaque anterior">
                  <ArrowLeft />
                </button>
                <button type="button" onClick={() => go(1)} className="inline-flex size-11 items-center justify-center border border-paper/25 text-lg hover:border-paper" aria-label="Próximo destaque">
                  <ArrowRight />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
