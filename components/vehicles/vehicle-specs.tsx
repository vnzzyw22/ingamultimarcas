import type { Vehicle } from "@/types/vehicle";
import { formatMileage, formatYear } from "@/lib/format";
import { bodyTypeLabels, featureLabels, fuelLabels, transmissionLabels } from "@/lib/vehicles/labels";
import { Check } from "@/components/ui/icons";

export function VehicleSpecs({ vehicle: v }: { vehicle: Vehicle }) {
  const rows: [string, string][] = [
    ["Ano", formatYear(v)],
    ["Quilometragem", formatMileage(v.mileage)],
    ["Câmbio", transmissionLabels[v.transmission]],
    ["Combustível", fuelLabels[v.fuel]],
    ["Motor", v.engine],
    ["Potência", v.power ? `${v.power} cv` : "—"],
    ["Cor", v.color],
    ["Portas", String(v.doors)],
    ["Carroceria", bodyTypeLabels[v.bodyType]],
    ["Referência", v.stockCode],
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-5">
      {rows.map(([label, value]) => (
        <div key={label} className="border-b border-line py-5 pr-4">
          <dt className="eyebrow text-mute">{label}</dt>
          <dd className="tnum mt-2 font-display text-xl uppercase">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function VehicleFeatures({ vehicle: v }: { vehicle: Vehicle }) {
  if (v.features.length === 0) {
    return <p className="text-sm text-mute">Lista de equipamentos não informada. Consulte a loja.</p>;
  }
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {v.features.map((f) => (
        <li key={f} className="flex items-center gap-3 border-b border-line py-3.5 text-[0.9375rem]">
          <Check className="shrink-0 text-red" />
          {featureLabels[f]}
        </li>
      ))}
    </ul>
  );
}
