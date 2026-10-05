import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/types/vehicle";
import { formatMileage, formatPrice, formatYear } from "@/lib/format";
import { fuelLabels, transmissionLabels } from "@/lib/vehicles/labels";
import { ArrowRight } from "@/components/ui/icons";

interface Props {
  vehicle: Vehicle;
  /** Primeiros cards visíveis podem ter prioridade de carregamento. */
  priority?: boolean;
  tone?: "light" | "dark";
  sizes?: string;
}

/**
 * Card de veículo: a foto domina; texto em 3 níveis (identificação, uso, preço).
 * O card inteiro é clicável via link "esticado" no título (um único alvo de foco).
 */
export function VehicleCard({
  vehicle: v,
  priority,
  tone = "light",
  sizes = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw",
}: Props) {
  const cover = v.images[0];
  const dark = tone === "dark";
  const isNew = v.condition === "novo" && v.mileage === 0;
  return (
    <article className="group relative flex flex-col">
      <div className={`relative aspect-[3/2] overflow-hidden ${dark ? "bg-ink-3" : "bg-paper-2"}`}>
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.035]"
          />
        ) : null}
        {v.status === "reservado" ? (
          <span className="absolute left-0 top-4 bg-ink px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-paper">
            Reservado
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col border-b pb-5 pt-4 ${dark ? "border-line-dark" : "border-line"}`}>
        <p className={`tnum text-[0.75rem] font-semibold uppercase tracking-[0.12em] ${dark ? "text-mute-dark" : "text-mute"}`}>
          {formatYear(v)} <span aria-hidden>·</span> {isNew ? "0 km" : formatMileage(v.mileage)}
        </p>
        <h3 className="mt-2">
          <Link
            href={`/veiculo/${v.slug}`}
            className="display text-[1.75rem] leading-none outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-red"
          >
            {v.brand} {v.model}
          </Link>
        </h3>
        <p className={`mt-1.5 line-clamp-1 text-sm ${dark ? "text-paper/75" : "text-ink/75"}`}>{v.version}</p>
        <p className={`mt-1 text-xs ${dark ? "text-mute-dark" : "text-mute"}`}>
          {transmissionLabels[v.transmission]} <span aria-hidden>·</span> {fuelLabels[v.fuel]}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            {v.oldPrice ? (
              <p className={`tnum text-xs line-through ${dark ? "text-mute-dark" : "text-mute"}`}>
                <span className="sr-only">De </span>
                {formatPrice(v.oldPrice)}
              </p>
            ) : null}
            <p className={`tnum font-display text-[1.75rem] font-semibold leading-none ${dark ? "text-paper" : "text-ink"}`}>
              {v.oldPrice ? <span className="sr-only">Por </span> : null}
              {formatPrice(v.price)}
            </p>
          </div>
          <span
            aria-hidden
            className={`inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${dark ? "text-paper" : "text-ink"}`}
          >
            Ver veículo
            <ArrowRight className="text-red transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
