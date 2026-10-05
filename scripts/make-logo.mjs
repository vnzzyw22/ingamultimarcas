// Corrige a logo da Ingá a partir do original (assets-src/logo/original.jpg):
//  - remove a marca-d'água do Gemini (canto inferior direito)
//  - troca as 7 estrelas cinza do escudo por 5 estrelas vermelhas facetadas
//  - gera versões com fundo transparente (chave por luminância) para o site
// Uso: node scripts/make-logo.mjs
import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const SRC = path.resolve("assets-src/logo/original.jpg");
const OUT = path.resolve("public/images/logo");
await mkdir(OUT, { recursive: true });

const BG = { r: 4, g: 4, b: 4 }; // preto do fundo da logo
const fill = (x, y, w, h) => ({ x, y, w, h });

// Centros e raios das 7 estrelas originais (medidos em 1024x1024). Raio externo aprox.
const OLD = [
  [356, 345, 14], [420, 329, 16], [487, 317, 18], [560, 311, 22], [633, 317, 18], [700, 329, 16], [764, 345, 14],
];
// 5 estrelas novas, nas posições das 5 centrais, mesma curva do arco
const NEW = [
  [420, 329, 17], [487, 317, 19], [560, 311, 23], [633, 317, 19], [700, 329, 17],
];
const RED_LIGHT = "#d2283a";
const RED_DARK = "#8f1220";

function starFacets(cx, cy, R) {
  const r = R * 0.42;
  const pt = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  const out = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const tip = pt(R, a);
    const left = pt(r, a - Math.PI / 5);
    const right = pt(r, a + Math.PI / 5);
    out.push(`<polygon points="${cx},${cy} ${tip} ${left}" fill="${RED_LIGHT}"/>`);
    out.push(`<polygon points="${cx},${cy} ${tip} ${right}" fill="${RED_DARK}"/>`);
  }
  return out.join("");
}

// 1. limpa estrelas antigas e marca-d'água com retângulos da cor do fundo
const wipe = [
  ...OLD.map(([cx, cy, R]) => fill(cx - R - 9, cy - R - 3 > 288 ? cy - R - 3 : 288, 2 * R + 18, 2 * R + 14)),
  fill(930, 930, 80, 80), // sparkle do Gemini
];
const wipeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${wipe
  .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgb(${BG.r},${BG.g},${BG.b})"/>`)
  .join("")}</svg>`;

// 2. estrelas novas (supersample 4x e reduz, para borda suave)
const SS = 4;
const starsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${1024 * SS}" height="${1024 * SS}" viewBox="0 0 1024 1024" shape-rendering="geometricPrecision">${NEW.map(
  ([cx, cy, R]) => starFacets(cx, cy, R),
).join("")}</svg>`;
const starsPng = await sharp(Buffer.from(starsSvg)).resize(1024, 1024).png().toBuffer();

const fixed = await sharp(SRC)
  .composite([{ input: Buffer.from(wipeSvg), top: 0, left: 0 }, { input: starsPng, top: 0, left: 0 }])
  .removeAlpha()
  .toBuffer();
await sharp(fixed).png().toFile(path.join(OUT, "inga-logo-fundo-preto.png"));

// 3. fundo transparente: só o preto vira transparente (rampa curta); as cores originais ficam intactas
const { data, info } = await sharp(fixed).raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
const LOW = 8; // abaixo disso é fundo
const HIGH = 26; // acima disso é opaco
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const m = Math.max(data[i], data[i + 1], data[i + 2]);
  const a = m <= LOW ? 0 : m >= HIGH ? 255 : Math.round(((m - LOW) / (HIGH - LOW)) * 255);
  rgba[j] = data[i];
  rgba[j + 1] = data[i + 1];
  rgba[j + 2] = data[i + 2];
  rgba[j + 3] = a;
}
const keyed = sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } });
const full = await keyed.clone().png().toBuffer();

// 4. recortes: logo completa e só o nome (para o header)
const trim = async (buf, region, file) => {
  const piece = sharp(buf).extract(region);
  const t = await piece.png().toBuffer();
  const { data: tb, info: ti } = await sharp(t).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  await sharp(tb).png({ compressionLevel: 9 }).toFile(path.join(OUT, file));
  console.log(file, ti.width, "x", ti.height);
};
await trim(full, { left: 40, top: 230, width: 960, height: 600 }, "inga-logo.png");
await trim(full, { left: 140, top: 532, width: 880, height: 85 }, "inga-nome.png");
await trim(full, { left: 40, top: 230, width: 960, height: 290 }, "inga-emblema.png");
