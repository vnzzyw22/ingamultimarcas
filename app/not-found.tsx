import { ButtonLink } from "@/components/ui/button";
import { SiteChrome } from "@/components/layout/site-chrome";

export default function NotFound() {
  return (
    <SiteChrome>
    <section className="bg-ink pb-24 pt-36 text-paper">
      <div className="container-x">
        <p className="eyebrow mb-4 text-mute-dark">404</p>
        <h1 className="display text-5xl sm:text-6xl">Página não encontrada.</h1>
        <p className="mt-5 max-w-lg text-paper/75">O veículo pode ter sido vendido ou o endereço mudou. Veja o que está disponível agora.</p>
        <div className="mt-8">
          <ButtonLink href="/estoque">Ver estoque</ButtonLink>
        </div>
      </div>
    </section>
    </SiteChrome>
  );
}
