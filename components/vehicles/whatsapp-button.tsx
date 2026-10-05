import type { Vehicle } from "@/types/vehicle";
import { vehicleWhatsappUrl } from "@/lib/whatsapp";
import { ExternalButton } from "@/components/ui/button";
import { WhatsApp } from "@/components/ui/icons";

export function VehicleWhatsAppButton({
  vehicle,
  label = "WhatsApp",
  variant = "whatsapp",
  className,
}: {
  vehicle: Vehicle;
  label?: string;
  variant?: "whatsapp" | "primary" | "outline";
  className?: string;
}) {
  return (
    <ExternalButton
      href={vehicleWhatsappUrl(vehicle)}
      variant={variant}
      size="lg"
      className={className}
      data-testid="vehicle-whatsapp"
      aria-label={`${label}: falar sobre o ${vehicle.brand} ${vehicle.model} pelo WhatsApp (abre em nova aba)`}
    >
      <WhatsApp className="text-lg" aria-hidden /> {label}
    </ExternalButton>
  );
}
