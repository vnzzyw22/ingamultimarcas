# Próxima tarefa: refazer o hero da home

Ideia aprovada: o nome "INGÁ" gigante ao fundo e o carro recortado na frente, cobrindo a parte de baixo das letras, no mesmo espírito do logo da loja (carro na frente do escudo).

- Imagens: em public/images/hero/. Registre em data/vehicle-images.ts (ex.: heroImage, heroCutout). Nunca coloque caminho de imagem direto no componente.
- Fonte do nome: o logo usa uma serifada pesada. Opções: Playfair Display 900 (recomendada, mais fiel ao logo e com cara de capa de revista) ou Archivo Expanded 900 (mais esportiva). Carregue com next/font/google em app/layout.tsx e exponha como token em app/globals.css (@theme).
- Composição em components/home/hero-showcase.tsx:
  - Camadas: fundo escuro → "INGÁ" gigante → carro recortado com sombra de chão → textos, CTA e busca em vidro.
  - Animação discreta na entrada (o nome surge e o carro desliza alguns px), respeitando prefers-reduced-motion.
  - No mobile, compor de novo, não só encolher: nome em cima, carro mais embaixo e maior.
  - Manter a busca rápida em vidro (components/forms/quick-search.tsx) e a faixa de destaques.
  - Imagem do carro com priority (LCP) e sizes correto.
- Logo: vai chegar em alta qualidade depois. Hoje components/layout/brand-mark.tsx é texto provisório.
- Cor: o vermelho do logo é mais fechado (carmim) que o #E30613 atual. Ajuste só os tokens em app/globals.css e confira o contraste (WCAG AA).
- O Next 16 tem mudanças de API: consulte node_modules/next/dist/docs/ antes de usar recursos do framework.

Regras: nada de glassmorphism espalhado (só na busca e nas listas), gradiente colorido, cantos muito arredondados ou excesso de sombra. Vermelho só em CTA, preço, estado ativo e detalhes. Acessibilidade: foco visível, teclado, labels e alt text. Ao terminar, rode lint, typecheck, test, build e test:e2e, e me mostre no navegador em 1440px e 390px.
