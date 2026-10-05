// Gera o cenário único e a camada de texto "INGÁ / MULTIMARCAS".
// Saídas em scripts/.tmp/video/: backdrop.png, text-layer.png, base.png (cenário + texto).
// A fonte do nome é ajustada sozinha para ocupar TEXT.nameWidth, e a linha de base é posta para que o carro
// cubra TEXT.coverage da altura das letras.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { BRAND, CARS, FLOOR_Y, FONTS, H, SUFFIX, TEXT, W } from "./scene.mjs";

mkdirSync("scripts/.tmp/video", { recursive: true });
const F = FONTS[TEXT.font];
if (!F) throw new Error(`fonte desconhecida: ${TEXT.font} (use ${Object.keys(FONTS).join(" | ")})`);

const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?${F.css}&display=block" rel="stylesheet">
<style>
  html,body{margin:0;background:transparent}
  .c{position:relative;width:${W}px;height:${H}px;overflow:hidden}
  .t{position:absolute;left:0;right:0;text-align:center;font-family:'${F.family}',sans-serif;font-weight:${F.weight};font-stretch:${F.stretch};white-space:nowrap;line-height:1;text-transform:uppercase}
  .name{color:${BRAND.white};letter-spacing:${F.tracking}}
  .sub{color:${BRAND.red};letter-spacing:${TEXT.subTracking}em;padding-left:${TEXT.subTracking}em;font-size:${TEXT.subSize}px;font-weight:${F.weight === 400 ? 400 : 800}}
</style></head><body><div class="c">
  <div class="t sub" id="sub">Multimarcas</div>
  <div class="t name" id="name">INGÁ</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);

const roofY = FLOOR_Y - CARS.civic.targetH; // topo do teto do carro
const layout = await p.evaluate(({ target, roofY, coverage }) => {
  const name = document.getElementById("name");
  // 1) ajusta o tamanho até a largura-alvo
  name.style.fontSize = "100px";
  const range = document.createRange();
  range.selectNodeContents(name);
  const w100 = range.getBoundingClientRect().width;
  const size = (100 * target) / w100;
  name.style.fontSize = size + "px";
  // 2) mede altura das letras (caixa-alta) e do acento (Á)
  const cv = document.createElement("canvas").getContext("2d");
  const cs = getComputedStyle(name);
  cv.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  if (parseFloat(cs.fontStretch) >= 120) cv.fontStretch = "expanded"; // o canvas só entende palavras-chave
  const cap = cv.measureText("H").actualBoundingBoxAscent;
  const withAccent = cv.measureText("Á").actualBoundingBoxAscent;
  // 3) linha de base: o carro (teto em roofY) cobre `coverage` das letras
  const baseline = roofY + coverage * cap;
  const place = (el, base) => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    el.appendChild(probe);
    const off = probe.getBoundingClientRect().top - el.getBoundingClientRect().top;
    el.style.top = base - off + "px";
    probe.remove();
  };
  place(name, baseline);
  const subBase = Math.max(40, baseline - withAccent - 26);
  place(document.getElementById("sub"), subBase);
  return { size, cap, withAccent, baseline, subBase, fontOk: document.fonts.check(`${cs.fontWeight} 100px ${cs.fontFamily}`) };
}, { target: TEXT.nameWidth, roofY, coverage: TEXT.coverage });
console.log(`fonte ${F.family}: tamanho ${layout.size.toFixed(0)}px, letras ${layout.cap.toFixed(0)}px de altura, linha de base y=${layout.baseline.toFixed(0)}, carregada=${layout.fontOk}`);
await p.screenshot({ path: `scripts/.tmp/video/text-layer${SUFFIX}.png`, omitBackground: true });
await b.close();

// cenário: parede quase preta + piso levemente mais claro com poça de luz (neutra) sob o carro
const backdropSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#090909"/><stop offset="${(FLOOR_Y - 90) / H}" stop-color="#0e0e0e"/>
      <stop offset="${(FLOOR_Y - 90) / H}" stop-color="#0e0e0e"/><stop offset="1" stop-color="#0b0b0b"/>
    </linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f5f5f3" stop-opacity="0.085"/><stop offset="1" stop-color="#f5f5f3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect y="${FLOOR_Y - 90}" width="${W}" height="1" fill="#1b1b1b"/>
  <ellipse cx="${W / 2}" cy="${FLOOR_Y + 8}" rx="${Math.round(W * 0.4)}" ry="92" fill="url(#pool)"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
await sharp(Buffer.from(backdropSvg)).png().toFile(`scripts/.tmp/video/backdrop${SUFFIX}.png`);
// dither: ruído estático de ±2 níveis no cenário. Sem isso, o degradê escuro vira faixas no H.264.
{
  const { data, info } = await sharp(`scripts/.tmp/video/backdrop${SUFFIX}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let seed = 1234567;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(data[i] + (rnd() + rnd() - 1) * 3)));
  await sharp(data, { raw: info }).png().toFile(`scripts/.tmp/video/backdrop${SUFFIX}.png`);
}
await sharp(`scripts/.tmp/video/backdrop${SUFFIX}.png`)
  .composite([{ input: `scripts/.tmp/video/text-layer${SUFFIX}.png` }])
  .png()
  .toFile(`scripts/.tmp/video/base${SUFFIX}.png`);
console.log("cenário e texto gerados");
