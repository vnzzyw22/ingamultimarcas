import type { Metadata } from "next";

// O painel nunca deve aparecer em buscadores.
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel Ingá" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
