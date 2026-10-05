import type { Metadata, Viewport } from "next";
import { Manrope, Oswald } from "next/font/google";
import { indexingAllowed, siteConfig } from "@/config/site";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin", "latin-ext"], variable: "--font-oswald", weight: ["500", "600", "700"], display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — Veículos novos e seminovos`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  ...(indexingAllowed ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${manrope.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
