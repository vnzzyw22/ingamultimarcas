import Link from "next/link";
import { legalNav, mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { BrandMark } from "@/components/layout/brand-mark";

export function SiteFooter() {
  const { contact } = siteConfig;
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-5">
          <BrandMark variant="completa" className="h-36 sm:h-44" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute-dark">
            Veículos novos e seminovos. Atendimento direto pelo WhatsApp.
          </p>
        </div>

        <nav aria-label="Rodapé" className="md:col-span-3">
          <p className="eyebrow mb-4 text-mute-dark">Navegação</p>
          <ul className="grid gap-2.5 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper/85 transition-colors hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="eyebrow mb-4 text-mute-dark">Contato</p>
          <ul className="grid gap-2.5 text-sm text-paper/85">
            <li>
              <a href={whatsappUrl(`Olá! Vim pelo site da ${siteConfig.name}.`)} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
                WhatsApp {contact.whatsappDisplay}
              </a>
            </li>
            {contact.instagram ? (
              <li>
                <a href={contact.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
                  Instagram {contact.instagram.handle}
                </a>
              </li>
            ) : null}
            <li>
              {contact.address.street} — {contact.address.district}, {contact.address.city}/{contact.address.state}
            </li>
          </ul>
          {contact.isPlaceholder ? (
            <p className="mt-4 text-xs text-mute-dark">Dados de contato demonstrativos — aguardando informações oficiais.</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-line-dark">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-mute-dark sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}
          </p>
          <ul className="flex gap-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
