import type { Vehicle } from "@/types/vehicle";
import { demoVehicles } from "@/data/vehicles.demo";
import { hasDatabase } from "@/lib/db/mongo";
import { mongoVehicleRepository } from "@/lib/vehicles/mongo-repository";

/** Contrato de acesso ao estoque. A UI só conhece este contrato (via lib/vehicles/index.ts). */
export interface VehicleRepository {
  /** Todos os veículos, incluindo vendidos (o filtro de visibilidade fica no serviço). */
  findAll(): Promise<Vehicle[]>;
  findBySlug(slug: string): Promise<Vehicle | null>;
}

export const staticVehicleRepository: VehicleRepository = {
  async findAll() {
    return demoVehicles;
  },
  async findBySlug(slug) {
    return demoVehicles.find((v) => v.slug === slug) ?? null;
  },
};

/** MongoDB quando configurado; senão o estoque demonstrativo (testes e desenvolvimento sem banco). */
export function getRepository(): VehicleRepository {
  return hasDatabase() ? mongoVehicleRepository : staticVehicleRepository;
}
