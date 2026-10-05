/**
 * Vídeo do hero da home. ÚNICA fonte desses caminhos (como vehicle-images.ts).
 *
 * Gerado por scripts/video/* a partir de assets-src/videos/civic.mp4: carro recortado, cenário escuro único e o
 * nome "INGÁ" ATRÁS do carro. Há duas composições: larga (1920x800) e mobile (1080x800, recomposta).
 * É uma imagem DEMONSTRATIVA — trocar por vídeo de um veículo real do estoque quando houver.
 */
export const heroVideo = {
  alt: "Sedã preto girando em estúdio com o nome Ingá Multimarcas atrás — vídeo demonstrativo",
  video: { wide: "/videos/hero-civic.mp4", narrow: "/videos/hero-civic-m.mp4" },
  poster: { wide: "/videos/hero-civic.webp", narrow: "/videos/hero-civic-m.webp" },
  size: { wide: [1920, 800], narrow: [1080, 800] },
} as const;
