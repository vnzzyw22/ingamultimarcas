import type { BodyType, Condition, FeatureKey, Fuel, Transmission, VehicleStatus } from "@/types/vehicle";

export const bodyTypeLabels: Record<BodyType, string> = {
  suv: "SUV",
  sedan: "Sedan",
  hatch: "Hatch",
  pickup: "Picape",
  coupe: "Cupê",
};

export const transmissionLabels: Record<Transmission, string> = {
  automatico: "Automático",
  cvt: "CVT",
  automatizado: "Automatizado",
  manual: "Manual",
};

export const fuelLabels: Record<Fuel, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  diesel: "Diesel",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

export const conditionLabels: Record<Condition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  usado: "Usado",
};

export const statusLabels: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const featureLabels: Record<FeatureKey, string> = {
  turbo: "Turbo",
  "4x4": "Tração 4x4",
  "unico-dono": "Único dono",
  blindado: "Blindado",
  "teto-solar": "Teto solar",
  "bancos-couro": "Bancos de couro",
  multimidia: "Central multimídia",
  "camera-re": "Câmera de ré",
  "sensor-estacionamento": "Sensor de estacionamento",
  "piloto-automatico": "Piloto automático",
  "ar-digital": "Ar-condicionado digital",
  "carplay-android-auto": "Apple CarPlay / Android Auto",
  "chave-presencial": "Chave presencial",
  "rodas-liga-leve": "Rodas de liga leve",
  "farol-led": "Faróis de LED",
};

/** Câmbios que contam como "automático" no filtro rápido. */
export const AUTOMATIC_TRANSMISSIONS: readonly Transmission[] = ["automatico", "cvt", "automatizado"];
