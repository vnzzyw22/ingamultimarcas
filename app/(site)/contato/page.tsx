import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageIntro } from "@/components/layout/page-intro";
import { ExternalButton } from "@/components/ui/button";
import { WhatsApp } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contato",
  description: "Endereço, WhatsApp e telefone da Ingá Multimarcas em Maringá-PR.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  const { contact } = siteConfig;
  const rows: [string, React.ReactNode][] = [
    [
      "WhatsApp",
      <a key="w" href={whatsappUrl(`Olá! Vim pelo site da ${siteConfig.name}.`)} target="_blank" rel="noopener noreferrer" className="hover:text-red-text">
        {contact.whatsappDisplay}
      </a>,
    ],
    [
      "Telefone",
      <a key="t" href={`tel:+${contact.phone}`} className="hover:text-red-text">
        {contact.phoneDisplay}
      </a>,
    ],
    ...(contact.instagram
      ? ([
          [
            "Instagram",
            <a key="i" href={contact.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-text">
              {contact.instagram.handle}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    ["Endereço", `${contact.address.street} — ${contact.address.district}, ${contact.address.city}/${contact.address.state}`],
  ];
  return (
    <>
      <PageIntro eyebrow="Contato" title="Fale com a loja">
        O caminho mais rápido é o WhatsApp. Se preferir, venha ver os carros pessoalmente.
      </PageIntro>
      <div className="container-x grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <dl className="border-t border-ink">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-line py-6 sm:grid-cols-[12rem_1fr]">
                <dt className="eyebrow text-mute">{k}</dt>
                <dd className="font-display text-2xl uppercase sm:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
          {contact.isPlaceholder ? (
            <p className="mt-6 text-sm text-mute">⚠ Dados demonstrativos. Os contatos oficiais serão inseridos em config/site.ts.</p>
          ) : null}
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <h2 className="eyebrow text-mute">Horário de atendimento</h2>
          {contact.hours.length === 0 ? (
            <p className="mt-4 border-t border-line pt-4 text-[0.9375rem] text-mute">Para confirmar o horário de hoje, é só chamar a loja no WhatsApp.</p>
          ) : null}
          <ul className="mt-4 border-t border-line">
            {contact.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4 border-b border-line py-4 text-[0.9375rem]">
                <span className="font-semibold">{h.days}</span>
                <span className="text-mute">{h.time}</span>
              </li>
            ))}
          </ul>
          <ExternalButton href={whatsappUrl(`Olá! Vim pelo site da ${siteConfig.name}.`)} variant="whatsapp" size="lg" className="mt-8 w-full">
            <WhatsApp className="text-lg" /> Chamar no WhatsApp
          </ExternalButton>
          {contact.address.mapsUrl ? (
            <ExternalButton href={contact.address.mapsUrl} variant="outline" size="lg" className="mt-3 w-full">
              Abrir no mapa
            </ExternalButton>
          ) : null}
        </div>
      </div>
    </>
  );
}
