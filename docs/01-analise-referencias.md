# Análise das referências

**Escopo e limitação.** Os três sites (hondafreeway.com.br, castrocarmga.com.br,
garciamultimarcasmga.com.br) estão **bloqueados pela política de rede** do
ambiente de desenvolvimento: não foi possível navegar neles. Esta análise foi
feita a partir de:

- 5 capturas de tela enviadas pelo cliente: estoque da Honda Freeway, destaques
  da Castro Car, barra de busca rápida, header com busca e categorias da Honda
  Freeway;
- estrutura de URLs e trechos indexados por buscadores (`/busca/marcas/chevrolet`,
  `/Veiculos`, `/Seminovas/<código>-<modelo>`).

Para fechar a análise, falta navegar nas páginas de veículo, financiamento e
venda de cada referência. É preciso liberar os domínios na rede do ambiente ou
mandar mais capturas.

Observação: a **Honda Freeway é concessionária de motos**. Ela serve como
referência de *apresentação de estoque e filtros*, não de categorias.

---

## A) O que cada uma faz bem

| Referência | Acertos observados |
|---|---|
| **Honda Freeway** | Fotografia **consistente** (mesmo fundo/estúdio em todas as motos), o que faz o estoque parecer curado. Layout **filtro lateral + grid** é o padrão certo para estoque. Card mostra **km e ano** com destaque e **código de referência** ("Ref. 021745"), útil no atendimento. Atalhos de **categoria** no topo. |
| **Castro Car** | **Ano no início do título** ("2027 BYD DOLPHIN MINI"): é a primeira pergunta de quem compra seminovo. Fotos **reais do showroom**. **WhatsApp direto no card** (conversão em 1 toque). **Busca textual livre** no header ("marca, modelo, ano…"). Menu inclui **Avaliação** e **Financiamento** como itens de primeiro nível. |
| **Busca rápida (Garcia)** | Faixa única com **Marca → Modelo → Preço de/até → Ano de/até → Localizar** logo após o hero. Resolve a intenção principal em uma linha. |

## B) O que fazem mal

| Referência | Problemas |
|---|---|
| **Honda Freeway** | Título genérico ("Confira modelos disponíveis" / "a qualidade que você merece"). Tudo **centralizado** no card, o que dificulta a comparação. **Logo da loja repetido em cada card** (ruído). "Apenas R$" (tom de varejo). Slider de preço duplo **quebrado visualmente**. Botão flutuante de WhatsApp **sobrepondo o reCAPTCHA**. Chips de categoria com sombra e cantos arredondados quebrando em 2 linhas. |
| **Castro Car** | Card **sem quilometragem** (o dado mais importante depois do preço). Meta "BYD, BRANCO, OUTROS" mostra **dado sujo** (combustível "outros"). Preço com **",00"** (ruído). Barra social flutuante lateral (Facebook/Instagram/WhatsApp/Tour) competindo com o conteúdo. Cards cinza genéricos com títulos centralizados. |
| **Busca rápida (Garcia)** | **Select de modelo sem rótulo** (vazio). Preços e anos em selects sem contexto. Não fica claro como a faixa se comporta no mobile. |

## C) Padrões aproveitados (e como)

1. **Busca rápida logo após o hero**, com dependência marca → modelo (o modelo fica desabilitado até escolher a marca) e **rótulos sempre visíveis**.
2. **Filtro lateral + grid** no desktop; **drawer** no mobile, com contagem ao vivo no botão ("Ver 12 veículos").
3. **Ano + km no topo do card**, preço grande e **código de referência** na página do veículo.
4. **Atalhos de carroceria que filtram de verdade**, com contagem real (`/estoque?carroceria=suv`).
5. **WhatsApp com mensagem contextual** (modelo, versão, ano, preço e ref.).
6. **Busca textual livre** no estoque ("corolla 2024", "suv diesel"), sem diferenciar acentos.
7. **Avaliação/Venda** e **Financiamento** como itens de navegação de primeiro nível.

## D) Padrões evitados

- Botões e barras flutuantes sobrepostos ao conteúdo (WhatsApp/redes laterais). No mobile, a ação fica numa **barra inferior que aparece só depois que o CTA principal sai da tela**.
- Logo repetido nos cards; "Apenas R$"; centavos no preço; textos promocionais vazios.
- Sliders de preço duplos (frágeis no toque). Usamos **campos mín./máx. numéricos** com validação.
- Chips arredondados com sombra; cards cinza com tudo centralizado.
- Filtros com opções sem correspondência no estoque. Aqui as opções **são derivadas dos dados**, com contagem; opções sem resultado ficam desabilitadas, não somem.

## E) Síntese própria da Ingá

O conceito é **showroom editorial**: fotografia grande e tipografia condensada pesada (fachada/identidade), com informação comercial organizada por alinhamento, não por caixas.

- Card sem moldura: foto 3:2 domina, linha de **ano · km**, nome em display, versão, câmbio/combustível e o preço. Uma linha fina fecha o card.
- Página do veículo: galeria grande + painel de compra fixo (identidade → preço → ações).
- **Dois CTAs com funções distintas**: *Tenho interesse* abre um painel curto (visita, financiar, troca, dúvidas + nome) e monta uma mensagem completa; *WhatsApp* é o atalho direto.
- Simulador de financiamento embutido na página do veículo, já com o preço preenchido.
- "Você também pode gostar" ordenado por **pontuação explicável** (carroceria > faixa de preço > marca/modelo > câmbio/combustível > equipamentos), não aleatório.
