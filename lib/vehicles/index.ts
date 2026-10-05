import type { Vehicle } from "@/types/vehicle";
import { getRepository } from "@/lib/vehicles/repository";
import { rankSimilar } from "@/lib/vehicles/similar";

/** Visível no site: disponível ou reservado. Vendidos ficam fora do estoque público. */
export function isPubliclyListed(v: Vehicle): boolean {
  return v.status !== "vendido";
}

export async function getVehicles(): Promise<Vehicle[]> {
  const all = await getRepository().findAll();
  return all.filter(isPubliclyListed);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const v = await getRepository().findBySlug(slug);
  return v && isPubliclyListed(v) ? v : null;
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const list = await getVehicles();
  return list
    .filter((v) => v.featured && v.status === "disponivel")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function getSimilarVehicles(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
  return rankSimilar(vehicle, await getVehicles(), limit);
}
