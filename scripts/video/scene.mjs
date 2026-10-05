// Parâmetros da cena do hero (compartilhados pelo texto, pelo cenário, pela composição e pela codificação).
// Dois perfis: desktop (1920x800, faixa larga) e mobile (1080x800, mais quadrado, recomposto — não é só um recorte).
// Mexeu aqui? Rode (desktop):  node scripts/video/render-text-layer.mjs && node scripts/video/compose.mjs civic
//             Rode (mobile):   PROFILE=mobile node scripts/video/render-text-layer.mjs && PROFILE=mobile node scripts/video/compose.mjs civic
// Trocar a fonte do nome:      FONT=anton node scripts/video/render-text-layer.mjs   (archivo | anton | big)
const mobile = process.env.PROFILE === "mobile";

export const PROFILE = mobile ? "mobile" : "desktop";
/** sufixo dos arquivos do perfil (hero-civic-m.mp4, out-m/, base-m.png) */
export const SUFFIX = mobile ? "-m" : "";
export const W = mobile ? 1080 : 1920;
export const H = 800;
export const FPS = 24;
export const FLOOR_Y = mobile ? 706 : 712; // linha onde as rodas tocam o piso

export const BRAND = {
  white: "#f5f5f3",
  red: "#a81f2e", // carmim do logo (MULTIMARCAS ≈ #981A26), um tom acima para ler sobre o fundo escuro
  ink: "#0a0a0a",
};

/** Fontes sem serifa, pesadas, para o nome gigante. `css` é o trecho da URL do Google Fonts. */
export const FONTS = {
  archivo: { family: "Archivo", css: "family=Archivo:wdth,wght@125,900", weight: 900, stretch: "125%", tracking: "-0.01em" },
  anton: { family: "Anton", css: "family=Anton", weight: 400, stretch: "100%", tracking: "0.01em" },
  big: { family: "Big Shoulders Display", css: "family=Big+Shoulders+Display:wght@900", weight: 900, stretch: "100%", tracking: "0.005em" },
};

export const TEXT = {
  font: process.env.FONT ?? "archivo",
  /** largura-alvo de "INGÁ": a fonte é ajustada automaticamente para chegar nela */
  nameWidth: mobile ? 1000 : 1280,
  /** fração da altura das letras que o carro cobre no ponto mais alto do teto */
  coverage: 0.4,
  subSize: mobile ? 30 : 38, // "MULTIMARCAS"
  subTracking: mobile ? 0.9 : 0.95, // em
};

/** Altura final do carro no quadro (px do canvas). O carro não é ampliado além de ~1x do vídeo-fonte. */
export const CARS = mobile ? { civic: { targetH: 352 } } : { civic: { targetH: 370 } };
