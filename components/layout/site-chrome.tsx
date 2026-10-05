import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MotionProvider } from "@/components/layout/motion-provider";

/** Moldura do site público: link de pular, header, conteúdo e rodapé. O admin NÃO usa esta moldura. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <MotionProvider>
        <SiteHeader />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </MotionProvider>
    </>
  );
}
