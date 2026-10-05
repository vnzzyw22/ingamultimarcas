import type { BodyType, VehicleImage } from "@/types/vehicle";

/**
 * ÚNICA fonte de fotos dos veículos.
 *
 * Hoje todas apontam para placeholders gerados (public/images/cars/demo/).
 * Para usar fotos reais de um veículo:
 *   1. salve os arquivos em public/images/cars/<slug>/01.jpg, 02.jpg ...
 *      (ou use URLs de um storage e registre o host em next.config.ts);
 *   2. adicione uma entrada em `realPhotos` abaixo com o slug do veículo.
 * Nenhum componente referencia caminhos de imagem diretamente.
 */

const DEMO_W = 1600;
const DEMO_H = 1067;
const DEMO_SHOTS = [
  { file: "01", label: "lateral" },
  { file: "02", label: "dianteira" },
  { file: "03", label: "traseira" },
  { file: "04", label: "interior" },
] as const;

function demoPhotos(bodyType: BodyType, vehicleName: string): VehicleImage[] {
  return DEMO_SHOTS.map((shot) => ({
    src: `/images/cars/demo/${bodyType}-${shot.file}.jpg`,
    alt: `${vehicleName} — imagem demonstrativa (${shot.label})`,
    width: DEMO_W,
    height: DEMO_H,
  }));
}

/** Fotos reais por slug. Vazio até o cliente enviar o material. */
const realPhotos: Record<string, VehicleImage[]> = {};

export function photosFor(slug: string, bodyType: BodyType, vehicleName: string): VehicleImage[] {
  return realPhotos[slug] ?? demoPhotos(bodyType, vehicleName);
}
