# Direção visual — PROVISÓRIA

> **Status: aberta.** A identidade só vai ser fechada depois de recebermos o logo/fachada da Ingá. Tudo abaixo vive em tokens (`app/globals.css`) e em `brand-mark.tsx`, então o ajuste não exige mexer nos componentes.

## Já decidido (independe do logo)
- **Hierarquia:** a foto do veículo domina; a informação vem em 3 níveis (ano·km → nome → preço).
- **Geometria:** cantos de 2–3px, sem sombras, sem glass/blur decorativo, sem gradiente de cor. Separação por linhas finas e alternância de polaridade (seções claras/escuras), não por caixas.
- **Vermelho controlado:** CTA principal, preço na página do veículo, estado ativo, sublinhados. Nunca em grandes áreas, exceto o CTA final (a revisar com o logo).
- **Movimento:** reveal curto (16px/0,5s, uma vez), crossfade de galeria, fade entre páginas, transição de grid nos filtros. Respeita "reduzir movimento".
- **Acessibilidade de cor (medida):** `mute #6b6b68` sobre `paper` 4,9:1; `mute-dark #8a8a8a` sobre `ink` 5,7:1; branco sobre `red` 4,9:1; branco sobre `whatsapp #0f7a40` 5,4:1. Vermelho como **texto pequeno** usa `red-text #b8050f` (6,8:1); o `#E30613` puro só em texto ≥ 24px ou bold ≥ 18,66px.

## A validar com o logo
- **Tipografia:** Oswald (display) + Manrope (UI). A Oswald conversa com "tipografia pesada e condensada", mas precisa ser comparada com o desenho real do logo; se o logo usar uma grotesca condensada mais larga/pesada, testar alternativas antes de trocar.
- **Vermelho exato** (`#E30613` é o ponto de partida do briefing).
- **Marca no header/rodapé:** hoje é tipográfica e provisória.
- **Tom do hero e copy** ("Escolha no estoque. Fale direto com a loja."): funcional, a revisar com a marca.
- **Fotografia:** padrão de fundo/enquadramento das fotos reais (a Honda Freeway mostra o valor da consistência).
