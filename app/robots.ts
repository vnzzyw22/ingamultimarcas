import type { MetadataRoute } from "next";
import { indexingAllowed, siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
