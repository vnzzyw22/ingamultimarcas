import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getVehicles } from "@/lib/vehicles";

// O estoque vem do banco e muda pelo painel: renderiza a cada visita (há cache curto em lib/vehicles).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const vehicles = await getVehicles();
  const statics = ["", "/estoque", "/venda-seu-carro", "/financiamento", "/sobre", "/contato"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/estoque" || path === "" ? ("daily" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/estoque" ? 0.9 : 0.5,
  }));
  return [
    ...statics,
    ...vehicles.map((v) => ({
      url: `${base}/veiculo/${v.slug}`,
      lastModified: v.updatedAt ?? v.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
