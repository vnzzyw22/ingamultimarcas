/**
 * Configuração única da empresa.
 *
 * Endereço e telefone vêm da ficha da loja no Google (informados pelo cliente em 2026-10-05).
 * O número é de celular e está sendo usado como WhatsApp E telefone — CONFIRMAR com a loja.
 * Ainda SEM dado confiável (por isso ausentes, nunca inventados): Instagram, e-mail e a grade de horários
 * (a ficha só mostrava "Aberto · Fecha 18:00" do dia).
 */
export const siteConfig = {
  name: "Ingá Multimarcas",
  shortName: "Ingá",
  /** URL pública de produção (usada em canonical, sitemap e Open Graph). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "pt_BR",
  description:
    "Estoque de veículos novos e seminovos da Ingá Multimarcas. Veja fotos, ficha técnica e fale direto com a loja pelo WhatsApp.",

  contact: {
    /** Só vira true se algum dado acima voltar a ser demonstrativo (mostra um aviso no site). */
    isPlaceholder: false,
    /** Somente dígitos, com DDI e DDD. */
    whatsapp: "5544999382375",
    whatsappDisplay: "(44) 99938-2375",
    phone: "5544999382375",
    phoneDisplay: "(44) 99938-2375",
    /** Sem Instagram oficial confirmado: não mostrar. Formato: { handle: "@loja", url: "https://..." } */
    instagram: null as { handle: string; url: string } | null,
    address: {
      street: "Av. Dona Sophia Rasgulaeff, 607",
      district: "Jardim Oasis",
      city: "Maringá",
      state: "PR",
      zip: "87047-300",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Dona+Sophia+Rasgulaeff%2C+607%2C+Jardim+Oasis%2C+Maring%C3%A1+-+PR%2C+87047-300",
    },
    /** Vazio até a loja informar os horários (não inventar). Formato: { days: "Segunda a sexta", time: "8h às 18h" } */
    hours: [] as { days: string; time: string }[],
  },
} as const;

/**
 * Buscadores só podem indexar o site quando ALLOW_INDEXING=1 (definido SÓ no ambiente de produção do domínio
 * oficial). Em qualquer outro endereço (demonstração, *.vercel.app, local) o site se declara noindex, para que
 * uma versão de testes com dados de exemplo nunca apareça no Google.
 */
export const indexingAllowed = process.env.ALLOW_INDEXING === "1";

export type SiteConfig = typeof siteConfig;
