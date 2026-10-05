/**
 * ⚠️ ESTOQUE DEMONSTRATIVO — NÃO É O ESTOQUE REAL DA INGÁ MULTIMARCAS.
 *
 * Registros plausíveis, criados apenas para testar busca, filtros, ordenação,
 * página de veículo e simulação. Todos têm `isDemo: true` e código de estoque
 * com prefixo "DEMO-". Substituir pelo estoque real (ou pela fonte MongoDB)
 * via `lib/vehicles/repository.ts` — nenhum componente importa este arquivo.
 */
import type { Vehicle } from "@/types/vehicle";
import { photosFor } from "@/data/vehicle-images";
import { slugify } from "@/lib/slug";

type DemoInput = Omit<Vehicle, "id" | "slug" | "images" | "isDemo" | "stockCode"> & { n: number };

function demo(input: DemoInput): Vehicle {
  const { n, ...v } = input;
  const slug = slugify(`${v.brand} ${v.model} ${v.version} ${v.year}`);
  return {
    ...v,
    id: `demo-${String(n).padStart(3, "0")}`,
    stockCode: `DEMO-${String(n).padStart(3, "0")}`,
    slug,
    images: photosFor(slug, v.bodyType, `${v.brand} ${v.model} ${v.version} ${v.year}`),
    isDemo: true,
  };
}

export const demoVehicles: Vehicle[] = [
  demo({
    n: 1, brand: "Toyota", model: "Corolla", version: "XEi 2.0", year: 2024, manufactureYear: 2023,
    mileage: 18400, price: 129900, transmission: "cvt", fuel: "flex", bodyType: "sedan", color: "Prata",
    engine: "2.0", power: 177, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "Sedan médio com câmbio CVT, revisões em concessionária e manual completo.",
    features: ["unico-dono", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-26T10:00:00.000Z",
  }),
  demo({
    n: 2, brand: "Toyota", model: "Corolla Cross", version: "XRE 2.0", year: 2023, manufactureYear: 2023,
    mileage: 34200, price: 148900, transmission: "cvt", fuel: "flex", bodyType: "suv", color: "Branco",
    engine: "2.0", power: 177, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "SUV com teto solar, bancos em couro e pacote de assistências de condução.",
    features: ["teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-24T10:00:00.000Z",
  }),
  demo({
    n: 3, brand: "Toyota", model: "Hilux", version: "SRX Plus 2.8 4x4", year: 2023, manufactureYear: 2022,
    mileage: 52800, price: 289900, transmission: "automatico", fuel: "diesel", bodyType: "pickup", color: "Preto",
    engine: "2.8", power: 204, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "Picape diesel com tração 4x4, cabine dupla e revisões registradas.",
    features: ["turbo", "4x4", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-20T10:00:00.000Z",
  }),
  demo({
    n: 4, brand: "Volkswagen", model: "T-Cross", version: "Highline 250 TSI", year: 2024, manufactureYear: 2024,
    mileage: 12100, price: 152900, oldPrice: 158900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Cinza",
    engine: "1.4", power: 150, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "SUV compacto turbo, versão topo de linha, com painel digital e teto solar panorâmico.",
    features: ["turbo", "unico-dono", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-28T10:00:00.000Z",
  }),
  demo({
    n: 5, brand: "Volkswagen", model: "Polo", version: "Highline 200 TSI", year: 2022, manufactureYear: 2021,
    mileage: 41300, price: 89900, transmission: "automatico", fuel: "flex", bodyType: "hatch", color: "Vermelho",
    engine: "1.0", power: 116, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "Hatch turbo automático com central multimídia e sensores.",
    features: ["turbo", "multimidia", "camera-re", "sensor-estacionamento", "ar-digital", "carplay-android-auto", "rodas-liga-leve"],
    createdAt: "2026-09-15T10:00:00.000Z",
  }),
  demo({
    n: 6, brand: "Volkswagen", model: "Nivus", version: "Comfortline 200 TSI", year: 2023, manufactureYear: 2022,
    mileage: 29800, price: 114900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Azul",
    engine: "1.0", power: 128, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "SUV cupê compacto com motor turbo e conectividade sem fio.",
    features: ["turbo", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "carplay-android-auto", "rodas-liga-leve"],
    createdAt: "2026-09-12T10:00:00.000Z",
  }),
  demo({
    n: 7, brand: "Volkswagen", model: "Amarok", version: "Extreme V6 3.0 4Motion", year: 2022, manufactureYear: 2021,
    mileage: 68900, price: 239900, transmission: "automatico", fuel: "diesel", bodyType: "pickup", color: "Cinza",
    engine: "3.0", power: 258, doors: 4, condition: "usado", featured: false, status: "disponivel",
    description: "Picape V6 diesel com tração integral e acabamento Extreme.",
    features: ["turbo", "4x4", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "rodas-liga-leve"],
    createdAt: "2026-08-30T10:00:00.000Z",
  }),
  demo({
    n: 8, brand: "Chevrolet", model: "Onix", version: "LTZ 1.0 Turbo", year: 2023, manufactureYear: 2023,
    mileage: 22500, price: 84900, transmission: "automatico", fuel: "flex", bodyType: "hatch", color: "Branco",
    engine: "1.0", power: 116, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "Hatch turbo automático com Wi-Fi nativo e multimídia.",
    features: ["turbo", "unico-dono", "multimidia", "camera-re", "sensor-estacionamento", "carplay-android-auto", "rodas-liga-leve"],
    createdAt: "2026-09-22T10:00:00.000Z",
  }),
  demo({
    n: 9, brand: "Chevrolet", model: "Tracker", version: "Premier 1.2 Turbo", year: 2024, manufactureYear: 2023,
    mileage: 15800, price: 139900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Preto",
    engine: "1.2", power: 133, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "SUV turbo com teto solar panorâmico e assistente de estacionamento.",
    features: ["turbo", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-27T10:00:00.000Z",
  }),
  demo({
    n: 10, brand: "Chevrolet", model: "S10", version: "High Country 2.8 4x4", year: 2021, manufactureYear: 2020,
    mileage: 87400, price: 199900, transmission: "automatico", fuel: "diesel", bodyType: "pickup", color: "Branco",
    engine: "2.8", power: 200, doors: 4, condition: "usado", featured: false, status: "disponivel",
    description: "Picape diesel cabine dupla com tração 4x4 e bancos em couro.",
    features: ["turbo", "4x4", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "rodas-liga-leve"],
    createdAt: "2026-08-21T10:00:00.000Z",
  }),
  demo({
    n: 11, brand: "Fiat", model: "Toro", version: "Volcano 2.0 Diesel 4x4", year: 2023, manufactureYear: 2022,
    mileage: 39600, price: 164900, transmission: "automatico", fuel: "diesel", bodyType: "pickup", color: "Cinza",
    engine: "2.0", power: 170, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "Picape média diesel com tração 4x4 e câmbio automático de 9 marchas.",
    features: ["turbo", "4x4", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-18T10:00:00.000Z",
  }),
  demo({
    n: 12, brand: "Fiat", model: "Pulse", version: "Impetus 1.0 Turbo", year: 2024, manufactureYear: 2024,
    mileage: 9800, price: 112900, transmission: "cvt", fuel: "flex", bodyType: "suv", color: "Vermelho",
    engine: "1.0", power: 130, doors: 4, condition: "seminovo", featured: false, status: "reservado",
    description: "SUV compacto turbo, versão Impetus, com central de 10 polegadas.",
    features: ["turbo", "unico-dono", "multimidia", "camera-re", "sensor-estacionamento", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-25T10:00:00.000Z",
  }),
  demo({
    n: 13, brand: "Fiat", model: "Argo", version: "Drive 1.0", year: 2022, manufactureYear: 2022,
    mileage: 46700, price: 64900, transmission: "manual", fuel: "flex", bodyType: "hatch", color: "Prata",
    engine: "1.0", power: 75, doors: 4, condition: "usado", featured: false, status: "disponivel",
    description: "Hatch econômico com câmbio manual, ideal para uso urbano.",
    features: ["multimidia", "carplay-android-auto"],
    createdAt: "2026-09-02T10:00:00.000Z",
  }),
  demo({
    n: 14, brand: "Jeep", model: "Compass", version: "Limited 1.3 T270", year: 2023, manufactureYear: 2023,
    mileage: 27300, price: 169900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Cinza",
    engine: "1.3", power: 185, doors: 4, condition: "seminovo", featured: true, status: "disponivel",
    description: "SUV médio turbo com acabamento Limited e pacote de segurança.",
    features: ["turbo", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-21T10:00:00.000Z",
  }),
  demo({
    n: 15, brand: "Jeep", model: "Renegade", version: "Sport 1.3 T270", year: 2022, manufactureYear: 2022,
    mileage: 38900, price: 104900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Verde",
    engine: "1.3", power: 185, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "SUV compacto turbo com câmbio automático de 6 marchas.",
    features: ["turbo", "multimidia", "camera-re", "sensor-estacionamento", "carplay-android-auto", "rodas-liga-leve"],
    createdAt: "2026-09-08T10:00:00.000Z",
  }),
  demo({
    n: 16, brand: "Honda", model: "Civic", version: "Touring 1.5 Turbo", year: 2021, manufactureYear: 2020,
    mileage: 55100, price: 139900, transmission: "cvt", fuel: "gasolina", bodyType: "sedan", color: "Preto",
    engine: "1.5", power: 173, doors: 4, condition: "usado", featured: false, status: "disponivel",
    description: "Sedan turbo, versão topo de linha, com teto solar e bancos em couro.",
    features: ["turbo", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-05T10:00:00.000Z",
  }),
  demo({
    n: 17, brand: "Honda", model: "HR-V", version: "EXL 1.5", year: 2024, manufactureYear: 2023,
    mileage: 16900, price: 154900, transmission: "cvt", fuel: "flex", bodyType: "suv", color: "Branco",
    engine: "1.5", power: 126, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "SUV compacto com bancos em couro e pacote de assistências Honda Sensing.",
    features: ["unico-dono", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-23T10:00:00.000Z",
  }),
  demo({
    n: 18, brand: "Honda", model: "City", version: "Hatchback EXL 1.5", year: 2023, manufactureYear: 2022,
    mileage: 31200, price: 104900, transmission: "cvt", fuel: "flex", bodyType: "hatch", color: "Cinza",
    engine: "1.5", power: 126, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "Hatch com câmbio CVT, bancos em couro e central multimídia.",
    features: ["bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "carplay-android-auto", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-10T10:00:00.000Z",
  }),
  demo({
    n: 19, brand: "Hyundai", model: "Creta", version: "Ultimate 2.0", year: 2023, manufactureYear: 2022,
    mileage: 33600, price: 134900, transmission: "automatico", fuel: "flex", bodyType: "suv", color: "Prata",
    engine: "2.0", power: 167, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "SUV com teto solar panorâmico e ar-condicionado digital.",
    features: ["teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-14T10:00:00.000Z",
  }),
  demo({
    n: 20, brand: "Hyundai", model: "HB20", version: "Platinum 1.0 Turbo", year: 2024, manufactureYear: 2024,
    mileage: 0, price: 109900, transmission: "automatico", fuel: "flex", bodyType: "hatch", color: "Azul",
    engine: "1.0", power: 120, doors: 4, condition: "novo", featured: false, status: "disponivel",
    description: "Hatch 0 km, versão Platinum, com motor turbo e câmbio automático.",
    features: ["turbo", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-29T10:00:00.000Z",
  }),
  demo({
    n: 21, brand: "Ford", model: "Mustang", version: "GT 5.0 V8", year: 2020, manufactureYear: 2019,
    mileage: 24300, price: 399900, transmission: "automatico", fuel: "gasolina", bodyType: "coupe", color: "Vermelho",
    engine: "5.0", power: 466, doors: 2, condition: "usado", featured: true, status: "disponivel",
    description: "Esportivo V8 com câmbio automático de 10 marchas e escapamento ativo.",
    features: ["bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-19T10:00:00.000Z",
  }),
  demo({
    n: 22, brand: "BMW", model: "420i", version: "Coupé M Sport 2.0", year: 2022, manufactureYear: 2022,
    mileage: 21700, price: 319900, transmission: "automatico", fuel: "gasolina", bodyType: "coupe", color: "Branco",
    engine: "2.0", power: 184, doors: 2, condition: "seminovo", featured: false, status: "disponivel",
    description: "Cupê turbo com pacote M Sport, teto solar e bancos esportivos em couro.",
    features: ["turbo", "unico-dono", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-16T10:00:00.000Z",
  }),
  demo({
    n: 23, brand: "BMW", model: "X1", version: "sDrive20i M Sport", year: 2023, manufactureYear: 2023,
    mileage: 19900, price: 279900, transmission: "automatico", fuel: "gasolina", bodyType: "suv", color: "Preto",
    engine: "2.0", power: 204, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "SUV premium blindado nível III-A, com teto solar e pacote M Sport.",
    features: ["turbo", "blindado", "teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-11T10:00:00.000Z",
  }),
  demo({
    n: 24, brand: "Nissan", model: "Kicks", version: "Exclusive 1.6", year: 2022, manufactureYear: 2021,
    mileage: 48200, price: 94900, transmission: "cvt", fuel: "flex", bodyType: "suv", color: "Laranja",
    engine: "1.6", power: 114, doors: 4, condition: "usado", featured: false, status: "disponivel",
    description: "SUV compacto com câmbio CVT e câmera 360°.",
    features: ["bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "carplay-android-auto", "rodas-liga-leve"],
    createdAt: "2026-08-27T10:00:00.000Z",
  }),
  demo({
    n: 25, brand: "BYD", model: "Dolphin", version: "GS 180 EV", year: 2025, manufactureYear: 2025,
    mileage: 0, price: 149800, transmission: "automatico", fuel: "eletrico", bodyType: "hatch", color: "Branco",
    engine: "Elétrico", power: 95, doors: 4, condition: "novo", featured: true, status: "disponivel",
    description: "Hatch 100% elétrico 0 km, com teto panorâmico e tela giratória.",
    features: ["teto-solar", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-30T10:00:00.000Z",
  }),
  demo({
    n: 26, brand: "Toyota", model: "Corolla", version: "Altis Hybrid 1.8", year: 2023, manufactureYear: 2022,
    mileage: 36800, price: 149900, transmission: "cvt", fuel: "hibrido", bodyType: "sedan", color: "Branco",
    engine: "1.8", power: 122, doors: 4, condition: "seminovo", featured: false, status: "disponivel",
    description: "Sedan híbrido com consumo urbano reduzido e pacote Toyota Safety Sense.",
    features: ["teto-solar", "bancos-couro", "multimidia", "camera-re", "sensor-estacionamento", "piloto-automatico", "ar-digital", "carplay-android-auto", "chave-presencial", "rodas-liga-leve", "farol-led"],
    createdAt: "2026-09-07T10:00:00.000Z",
  }),
  demo({
    n: 27, brand: "Chevrolet", model: "Cruze", version: "LT 1.4 Turbo", year: 2019, manufactureYear: 2019,
    mileage: 91200, price: 82900, transmission: "automatico", fuel: "flex", bodyType: "sedan", color: "Prata",
    engine: "1.4", power: 153, doors: 4, condition: "usado", featured: false, status: "vendido",
    description: "Registro vendido — não deve aparecer no estoque público.",
    features: ["turbo", "multimidia", "camera-re"],
    createdAt: "2026-07-01T10:00:00.000Z",
  }),
];
