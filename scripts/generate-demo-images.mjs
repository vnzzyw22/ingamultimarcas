/**
 * Gera imagens PROVISÓRIAS (placeholders) por carroceria em public/images/cars/demo/.
 * Não são fotos de veículos reais — existem só para o layout, proporções e o
 * pipeline do next/image serem testados até as fotos reais chegarem.
 *
 * Uso: node scripts/generate-demo-images.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/images/cars/demo");
const W = 1600;
const H = 1067; // 3:2, proporção padrão de câmera

// Silhuetas laterais simplificadas (viewBox 0 0 1000 400, solo em y=330).
const silhouettes = {
  hatch:
    "M120 300 L130 240 Q160 215 260 205 L380 140 Q420 122 500 120 L640 122 Q700 126 740 170 L790 222 Q860 232 880 260 L885 300 Z",
  sedan:
    "M90 300 L100 248 Q130 222 250 210 L370 150 Q410 132 490 130 L610 132 Q660 136 700 170 L750 210 Q880 220 905 255 L910 300 Z",
  suv: "M100 305 L104 215 Q112 190 200 182 L300 120 Q330 102 420 100 L700 100 Q745 102 770 140 L815 190 Q885 200 900 235 L905 305 Z",
  pickup:
    "M80 305 L86 222 Q96 196 180 188 L280 128 Q306 112 380 110 L520 110 Q550 112 560 140 L565 195 L915 195 L922 305 Z",
  coupe:
    "M90 300 L96 262 Q120 236 250 222 L400 160 Q450 142 540 142 L620 146 Q680 152 730 190 L790 228 Q890 238 910 268 L912 300 Z",
};

const wheels = { hatch: [270, 760], sedan: [250, 770], suv: [260, 765], pickup: [245, 790], coupe: [255, 770] };

const shots = [
  { key: "01", label: "LATERAL", mirror: false, tone: ["#2a2a2a", "#121212"] },
  { key: "02", label: "DIANTEIRA 3/4", mirror: true, tone: ["#d9d9d6", "#a9a9a6"] },
  { key: "03", label: "TRASEIRA 3/4", mirror: false, tone: ["#3a3a3a", "#1a1a1a"] },
  { key: "04", label: "INTERIOR", mirror: true, tone: ["#bdbdb9", "#8e8e8a"] },
];

function svgFor(body, shot) {
  const [bgTop, bgBottom] = shot.tone;
  const dark = shot.tone[0].startsWith("#2") || shot.tone[0].startsWith("#3");
  const car = dark ? "#0b0b0b" : "#1b1b1b";
  const text = dark ? "#8a8a8a" : "#3d3d3d";
  const [w1, w2] = wheels[body];
  const flip = shot.mirror ? `translate(1000 0) scale(-1 1)` : "";
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 1600 1067">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBottom}"/>
    </linearGradient>
    <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1067" fill="url(#bg)"/>
  <rect y="760" width="1600" height="307" fill="#000" opacity="0.18"/>
  <g transform="translate(300 420) scale(1)">
    <ellipse cx="500" cy="335" rx="470" ry="28" fill="url(#floor)"/>
    <g transform="${flip}">
      <path d="${silhouettes[body]}" fill="${car}"/>
      <circle cx="${w1}" cy="300" r="56" fill="#050505"/><circle cx="${w1}" cy="300" r="30" fill="#2b2b2b"/>
      <circle cx="${w2}" cy="300" r="56" fill="#050505"/><circle cx="${w2}" cy="300" r="30" fill="#2b2b2b"/>
    </g>
  </g>
  <text x="64" y="86" font-family="Arial, sans-serif" font-size="18" letter-spacing="5" fill="${text}">FOTO DEMO · ${body.toUpperCase()} · ${shot.label}</text>
</svg>`;
}

await mkdir(OUT, { recursive: true });
for (const body of Object.keys(silhouettes)) {
  for (const shot of shots) {
    const file = path.join(OUT, `${body}-${shot.key}.jpg`);
    await sharp(Buffer.from(svgFor(body, shot))).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
    console.log("✓", path.relative(process.cwd(), file));
  }
}
