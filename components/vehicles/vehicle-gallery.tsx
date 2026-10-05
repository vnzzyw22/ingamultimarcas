"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { VehicleImage } from "@/types/vehicle";
import { ArrowLeft, ArrowRight, Close, Expand } from "@/components/ui/icons";

const SWIPE_THRESHOLD = 60;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Galeria do veículo.
 * - Principal com prioridade (LCP); demais carregam sob demanda.
 * - Setas, teclado (← →), swipe no toque, miniaturas, contador.
 * - Tela cheia em <dialog> com object-contain (sem corte) e zoom por clique.
 */
export function VehicleGallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const total = images.length;
  const current = images[index];

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setDirection(delta);
      setZoom(null);
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  const select = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setZoom(null);
    setIndex(i);
  };

  // Mantém a miniatura ativa visível.
  useEffect(() => {
    const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const toggleZoom = (e: MouseEvent<HTMLDivElement>) => {
    if (zoom) return setZoom(null);
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  if (!current) {
    return <div className="aspect-[3/2] bg-paper-2" role="img" aria-label="Fotos indisponíveis" />;
  }

  const counter = (testId: string) => (
    <span className="tnum text-xs font-bold tracking-[0.14em]" aria-live="polite" data-testid={testId}>
      <span className="sr-only">Foto </span>
      {pad(index + 1)}
      <span className="mx-1.5 opacity-50">/</span>
      {pad(total)}
    </span>
  );

  return (
    <div className="select-none" role="region" aria-roledescription="galeria" aria-label={`Fotos do ${title}`}>
      <div
        className="group relative aspect-[3/2] overflow-hidden bg-ink-2 outline-none focus-visible:outline-2 focus-visible:outline-red"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="Use as setas do teclado para navegar entre as fotos"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            className="absolute inset-0 touch-pan-y"
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) go(1);
              else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
            }}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-0 top-1/2 z-10 hidden size-14 -translate-y-1/2 items-center justify-center bg-ink/70 text-xl text-paper opacity-0 transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
              aria-label="Foto anterior"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-0 top-1/2 z-10 hidden size-14 -translate-y-1/2 items-center justify-center bg-ink/70 text-xl text-paper opacity-0 transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
              aria-label="Próxima foto"
            >
              <ArrowRight />
            </button>
          </>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent px-4 pb-3 pt-10 text-paper">
          {counter("gallery-counter")}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="pointer-events-auto -mr-2 inline-flex h-10 items-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.12em]"
            aria-label="Ver fotos em tela cheia"
          >
            <Expand className="text-base" /> <span className="hidden sm:inline">Tela cheia</span>
          </button>
        </div>
      </div>

      {total > 1 ? (
        <ul ref={thumbsRef} className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={img.src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => select(i)}
                aria-label={`Ver foto ${i + 1} de ${total}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block aspect-[3/2] w-24 overflow-hidden bg-paper-2 opacity-55 transition-opacity hover:opacity-100 aria-[current=true]:opacity-100 sm:w-28 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-red after:opacity-0 aria-[current=true]:after:opacity-100"
              >
                <Image src={img.src} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={`Fotos do ${title} em tela cheia`}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-ink open:flex open:flex-col"
        onKeyDown={onKey}
        onClose={() => setZoom(null)}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
          {counter("fullscreen-counter")}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-mr-2 inline-flex size-11 items-center justify-center text-2xl"
            aria-label="Fechar tela cheia"
            autoFocus
          >
            <Close />
          </button>
        </div>
        <div className="relative flex-1">
          <div
            className={`absolute inset-0 overflow-hidden ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={toggleZoom}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain transition-transform duration-300 ease-[var(--ease-out-quart)]"
              style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </div>
          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-ink/70 text-xl sm:left-6"
                aria-label="Foto anterior"
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-ink/70 text-xl sm:right-6"
                aria-label="Próxima foto"
              >
                <ArrowRight />
              </button>
            </>
          ) : null}
        </div>
        <p className="shrink-0 px-4 py-4 text-center text-xs text-mute-dark sm:px-6">
          {zoom ? "Clique para afastar" : "Clique na foto para ampliar"}
        </p>
      </dialog>
    </div>
  );
}
