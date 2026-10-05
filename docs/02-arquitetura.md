# Arquitetura

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript estrito · Tailwind CSS 4 · Framer Motion · Vitest (lógica) · Playwright (E2E). Sem banco, sem backend, sem kit de componentes: os componentes acessíveis usam primitivas nativas (`<dialog>`, `<details>`, `<form>`).

## Pastas
```
app/                 rotas (home, estoque, veiculo/[slug], venda-seu-carro, financiamento, contato, sobre, legais, sitemap, robots)
components/
  layout/            header, footer, marca provisória, abertura de página, provider de movimento
  ui/                botão, ícones, cabeçalho de seção, reveal
  vehicles/          card, galeria, ficha técnica, CTAs (interesse/WhatsApp/compartilhar), barra fixa mobile
  filters/           painel de filtros, controles, explorador do estoque, skeleton
  forms/             busca rápida, simulador, venda seu carro
  home/              hero
config/              site (contatos PLACEHOLDER), finance (taxa DEMO), navigation
data/                vehicles.demo.ts (estoque DEMO) e vehicle-images.ts (ÚNICA fonte de fotos)
lib/
  vehicles/          repository (contrato de dados), index (serviço), similar, labels, summaries
  filters/           types, apply (filtrar/ordenar), facets (opções derivadas), params (URL), chips
  format, whatsapp, finance, slug
types/vehicle.ts     modelo de domínio
tests/unit|e2e       Vitest e Playwright
```

## Camada de dados (preparada para MongoDB)
```
UI (páginas/componentes)
   └─ lib/vehicles/index.ts      getVehicles, getVehicleBySlug, getFeaturedVehicles, getSimilarVehicles
        └─ VehicleRepository     findAll(), findBySlug()  ← contrato
             ├─ staticVehicleRepository   (hoje: data/vehicles.demo.ts)
             └─ mongoVehicleRepository    (fase 2: mesma interface)
```
- Componentes **nunca** importam `data/`. Trocar a fonte = implementar o repositório e mudar `getRepository()`.
- `Vehicle` é 100% serializável (ISO strings, enums em string), `id` é string (compatível com `ObjectId`).
- Regras de visibilidade (vendido sai do site) ficam no serviço, não no banco nem na UI.
- Filtros são funções puras. Com estoque grande no Mongo, `matchesFilters` pode ser traduzido para uma query/aggregation, e o estoque passa a filtrar no servidor via `searchParams` (o formato de URL já é o contrato).

## Estado do estoque
A **URL é a fonte de verdade** (`/estoque?marca=toyota&preco-max=150000&ordem=menor-preco`): é compartilhável, funciona com voltar/avançar e os atalhos da home são só links. O formato é parseado e validado em `lib/filters/params.ts`; valores inválidos são ignorados.

## Imagens
`data/vehicle-images.ts` concentra todas as fotos. Hoje são placeholders gerados (`scripts/generate-demo-images.mjs`), marcados "FOTO DEMO". Para fotos reais: salve em `public/images/cars/<slug>/` e registre em `realPhotos`, ou use URLs de storage (cadastre o host em `next.config.ts`). O `next/image` cuida de AVIF/WebP, `sizes` responsivo, lazy loading e prioridade só na imagem principal.

## Admin (implementado)
Rotas `/admin/*` (login, painel, veículos, contatos, conta), protegidas por cookie assinado + `requireAdmin()` em toda página/ação/rota, e bloqueadas em `robots.ts`. O site lê o estoque pelo mesmo `VehicleRepository`: `mongoVehicleRepository` quando há `MONGODB_URI`, senão o estoque de exemplo. Fotos ficam na coleção `photos` (WebP, servidas em `/fotos/[id]`). Os formulários públicos gravam contatos em `POST /api/leads` antes de abrir o WhatsApp.

## Pontos de configuração
| O quê | Onde |
|---|---|
| WhatsApp, telefone, endereço, Instagram, horários | `config/site.ts` (`isPlaceholder: true`) |
| Taxa de financiamento e prazos | `config/finance.ts` (`isDemoRate: true`) |
| Estoque | painel `/admin` (MongoDB); sem banco, `data/vehicles.demo.ts` |
| Fotos | `data/vehicle-images.ts` |
| Logo | `components/layout/brand-mark.tsx` |
| Cores, fontes, raios | `app/globals.css` (`@theme`) |
