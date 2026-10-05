# Ingá Multimarcas — showroom digital

Site da Ingá Multimarcas: estoque com filtros, página de veículo com galeria, simulação de financiamento, avaliação para venda/troca e contato via WhatsApp.

> ⚠️ **Dados demonstrativos.** Sem `MONGODB_URI` o site usa o estoque de exemplo (`data/vehicles.demo.ts`). A taxa de financiamento (`config/finance.ts`) é DEMO. Endereço e telefone em `config/site.ts` vêm da ficha da loja no Google; Instagram, e-mail e horários ainda não foram informados.

## Comandos
```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck    # next typegen + tsc
npm test             # Vitest (filtros, URL, facetas, formatação, WhatsApp, financiamento, semelhantes)
npm run test:e2e     # Playwright (requer `npm run build`), desktop 1440 e mobile 390
node scripts/generate-demo-images.mjs   # regera os placeholders
```

## Painel de administração (`/admin`)
Login do dono, cadastro/edição de veículos com fotos, contatos dos formulários e cópia de segurança. Dados e fotos ficam no **MongoDB Atlas** (copie `.env.example` para `.env.local` e preencha).
```bash
npm run admin:criar -- email@loja.com "Nome" [--password SENHA]   # cria/redefine um administrador (sem --password gera uma e grava em .admin-credentials.txt)
npm run seed:demo      # carrega os 27 veículos de exemplo no banco
npm run backup         # cópia COMPLETA (dados + fotos) em backups/
```
Testes e2e rodam sempre com o estoque de exemplo (`USE_DEMO_DATA=1`), nunca no banco real.

## Documentação
- [docs/01-analise-referencias.md](docs/01-analise-referencias.md): análise das referências (Honda Freeway, Castro Car, Garcia)
- [docs/02-arquitetura.md](docs/02-arquitetura.md): estrutura, camada de dados, migração para MongoDB, admin
- [docs/03-direcao-visual.md](docs/03-direcao-visual.md): direção visual
- [docs/04-proximos-passos-hero.md](docs/04-proximos-passos-hero.md): histórico da tarefa do hero (hoje o hero é um vídeo; ver `scripts/video/`)
