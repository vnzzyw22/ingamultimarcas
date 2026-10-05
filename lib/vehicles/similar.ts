import type { Vehicle } from "@/types/vehicle";

/**
 * Pontua semelhança de forma explicável (não aleatória):
 * carroceria > faixa de preço > mesmo modelo/marca > câmbio/combustível > equipamentos em comum.
 */
export function similarityScore(base: Vehicle, other: Vehicle): number {
  let score = 0;
  if (other.bodyType === base.bodyType) score += 40;

  const priceDiff = Math.abs(other.price - base.price) / base.price;
  if (priceDiff <= 0.15) score += 30;
  else if (priceDiff <= 0.3) score += 18;
  else if (priceDiff <= 0.5) score += 6;

  if (other.brand === base.brand && other.model === base.model) score += 14;
  else if (other.brand === base.brand) score += 8;

  if (other.transmission === base.transmission) score += 4;
  if (other.fuel === base.fuel) score += 4;

  const shared = other.features.filter((f) => base.features.includes(f)).length;
  score += Math.min(shared, 8);

  if (other.status !== "disponivel") score -= 10;
  return score;
}

export function rankSimilar(base: Vehicle, pool: Vehicle[], limit: number): Vehicle[] {
  return pool
    .filter((v) => v.id !== base.id)
    .map((v) => ({ v, s: similarityScore(base, v) }))
    .sort((a, b) => b.s - a.s || Math.abs(a.v.price - base.price) - Math.abs(b.v.price - base.price))
    .slice(0, limit)
    .map(({ v }) => v);
}
