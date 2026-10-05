// Passo 2: recompõe cada quadro: cenário único → texto "INGÁ" → sombra/reflexo → carro recortado.
//  - alfa dos quadros do meio = interpolação entre quadros-chave da IA (+ curva que endurece a borda)
//  - POSIÇÃO ESTÁVEL: âncora horizontal = centro da silhueta suavizado com σ=30 quadros (quase parado);
//    vertical = linha do chão fixa. O tremor residual do vídeo-fonte é removido com o caminho rastreado
//    (scripts/video/track.mjs). Escala CONSTANTE e deslocamento SUB-PIXEL (sem "degraus" de 1 px).
//  - sombra e reflexo vêm da PRÓPRIA silhueta do carro (achatada/espelhada na linha do chão): ficam colados nele
//  - quadros-fonte extraídos em BT.709 (o navegador interpreta vídeo HD sem tag como 709)
// Uso: node scripts/video/track.mjs civic && node scripts/video/compose.mjs civic [--only 1,50,100]
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CARS, FLOOR_Y, H, SUFFIX, W } from "./scene.mjs";

const name = process.argv[2];
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > 0 ? process.argv[onlyArg + 1].split(",").map(Number) : null;
if (!CARS[name]) throw new Error(`vídeo desconhecido: ${name}`);

const SW = 1280;
const SH = 720;
const N_PX = SW * SH;
const dir = path.resolve(`scripts/.tmp/video/${name}`);
const f709 = path.join(dir, "frames709");
const matteDir = path.join(dir, "matte");
const outDir = path.join(dir, `out${SUFFIX}`);
mkdirSync(f709, { recursive: true });
mkdirSync(outDir, { recursive: true });

if (readdirSync(f709).length === 0) {
  console.log(`[${name}] extraindo quadros em BT.709…`);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", path.resolve(`assets-src/videos/${name}.mp4`),
    "-vf", "scale=in_range=tv:in_color_matrix=bt709:out_range=pc", "-pix_fmt", "rgb24",
    path.join(f709, "%04d.png"),
  ]);
}
const total = readdirSync(f709).length;
const keys = readdirSync(matteDir).filter((f) => f.endsWith(".a8")).map((f) => parseInt(f, 10)).sort((a, b) => a - b);
if (keys.length < 2) throw new Error("faltam quadros-chave de recorte");
const trackFile = path.join(dir, "track.json");
if (!existsSync(trackFile)) throw new Error(`rode antes: node scripts/video/track.mjs ${name}`);
const P = JSON.parse(readFileSync(trackFile, "utf8")); // P[t-1] = deslocamento acumulado do conteúdo (px do vídeo-fonte)

// ---- alfa interpolado + curva -------------------------------------------------------------
const cache = new Map();
const readKey = (k) => {
  if (!cache.has(k)) cache.set(k, readFileSync(path.join(matteDir, `${String(k).padStart(4, "0")}.a8`)));
  if (cache.size > 4) cache.delete(cache.keys().next().value);
  return cache.get(k);
};
const LO = 0.22;
const HI = 0.8;
const lut = new Uint8Array(256);
for (let v = 0; v < 256; v++) {
  const x = Math.min(1, Math.max(0, (v / 255 - LO) / (HI - LO)));
  lut[v] = Math.round(x * x * (3 - 2 * x) * 255); // smoothstep
}
function alphaAt(t) {
  let k0 = keys[0];
  let k1 = keys[keys.length - 1];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] <= t) k0 = keys[i];
    if (keys[i] >= t) {
      k1 = keys[i];
      break;
    }
  }
  const a0 = readKey(k0);
  const out = new Uint8Array(N_PX);
  if (k0 === k1) {
    for (let i = 0; i < N_PX; i++) out[i] = lut[a0[i]];
    return out;
  }
  const a1 = readKey(k1);
  const w = (t - k0) / (k1 - k0);
  for (let i = 0; i < N_PX; i++) out[i] = lut[Math.round(a0[i] * (1 - w) + a1[i] * w)];
  return out;
}
function bboxOf(a) {
  let x0 = SW, x1 = -1, y0 = SH, y1 = -1;
  const colHit = new Uint32Array(SW);
  const rowHit = new Uint32Array(SH);
  for (let y = 0, i = 0; y < SH; y++) for (let x = 0; x < SW; x++, i++) if (a[i] > 127) { colHit[x]++; rowHit[y]++; }
  for (let x = 0; x < SW; x++) if (colHit[x] >= 3) { if (x < x0) x0 = x; x1 = x; }
  for (let y = 0; y < SH; y++) if (rowHit[y] >= 14) { if (y < y0) y0 = y; y1 = y; }
  return { x0, x1, y0, y1 };
}
const gauss = (arr, sigma) =>
  arr.map((_, i) => {
    // fora das pontas: reflexão ímpar (2·borda − espelho) para não criar um viés falso numa tendência linear
    const at = (j) => (j < 0 ? 2 * arr[0] - arr[Math.min(arr.length - 1, -j)] : j > arr.length - 1 ? 2 * arr[arr.length - 1] - arr[Math.max(0, 2 * (arr.length - 1) - j)] : arr[j]);
    let s = 0, ws = 0;
    for (let d = -sigma * 3; d <= sigma * 3; d++) {
      const w = Math.exp(-(d * d) / (2 * sigma * sigma));
      s += at(i + d) * w; ws += w;
    }
    return s / ws;
  });
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
async function oneChannel(img) {
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  if (info.channels === 1) return data;
  const out = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < out.length; i++) out[i] = data[i * info.channels];
  return out;
}

// ---- passo A: medidas e trajetória estável ------------------------------------------------
console.log(`[${name}] medindo o carro em ${total} quadros…`);
const boxes = [];
for (let t = 1; t <= total; t++) boxes.push(bboxOf(alphaAt(t)));
const anchorX = gauss(boxes.map((b) => (b.x0 + b.x1) / 2), 30); // centro da silhueta, quase parado
const yRef = median(boxes.map((b) => b.y1)); // linha do chão no vídeo-fonte (base das rodas)
const meanH = boxes.reduce((s, b) => s + (b.y1 - b.y0), 0) / boxes.length;
const meanW = boxes.reduce((s, b) => s + (b.x1 - b.x0), 0) / boxes.length;
const S = CARS[name].targetH / meanH; // escala constante
// tremor do vídeo-fonte = caminho rastreado − sua versão suavizada; é subtraído quadro a quadro
const px = P.map((p) => p[0]);
const jx = gauss(px, 5).map((v, i) => v - px[i]);
const jy = P.map((p) => -(p[1] - P[0][1])); // trava a vertical: o carro não sobe nem desce
console.log(`[${name}] altura ${Math.round(meanH)}px → escala ${S.toFixed(3)}; linha do chão (fonte) y=${yRef}`);

// ---- passo B: composição ------------------------------------------------------------------
const base = await sharp(`scripts/.tmp/video/base${SUFFIX}.png`).removeAlpha().toBuffer();
const list = only ?? Array.from({ length: total }, (_, i) => i + 1);
const RH = 150; // alcance do reflexo (px)
let n = 0;
for (const t of list) {
  const id = String(t).padStart(4, "0");
  const outFile = path.join(outDir, `${id}.png`);
  if (!only && existsSync(outFile)) continue;

  const a = alphaAt(t);
  const alphaImg = await oneChannel(sharp(Buffer.from(a), { raw: { width: SW, height: SH, channels: 1 } }).blur(0.7));
  const rgb = await sharp(path.join(f709, `${id}.png`)).removeAlpha().raw().toBuffer();
  // 1) junta o alfa ao RGB (etapa própria: joinChannel roda depois do resize no pipeline do sharp)
  const full = await sharp(rgb, { raw: { width: SW, height: SH, channels: 3 } })
    .joinChannel(alphaImg, { raw: { width: SW, height: SH, channels: 1 } })
    .raw()
    .toBuffer();

  // 2) posição (float) do quadro-fonte inteiro no canvas; a parte fracionária vira deslocamento sub-pixel
  const cxF = W / 2 - anchorX[t - 1] * S + jx[t - 1] * S;
  const cyF = FLOOR_Y - yRef * S + jy[t - 1] * S;
  const cx0 = Math.floor(cxF);
  const cy0 = Math.floor(cyF);
  const scaled = await sharp(full, { raw: { width: SW, height: SH, channels: 4 } })
    .affine([S, 0, 0, S], { odx: cxF - cx0, ody: cyF - cy0, interpolator: "bicubic", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 1 })
    .toBuffer({ resolveWithObject: true });
  const car = scaled.data;
  const iw = scaled.info.width;
  const ih = scaled.info.height;
  const comps = [];

  // 3) sombra de contato: a silhueta do carro (só a faixa do chão), achatada e borrada
  const carTopRow = Math.max(0, Math.floor(FLOOR_Y - cy0 - CARS[name].targetH - 6));
  const carBotRow = Math.min(ih, FLOOR_Y - cy0 + 10);
  if (carBotRow > carTopRow + 20) {
    const band = await sharp(car).extract({ left: 0, top: carTopRow, width: iw, height: carBotRow - carTopRow }).toBuffer();
    const alphaBand = await oneChannel(sharp(band).extractChannel(3));
    const bh = carBotRow - carTopRow;
    const sqH = Math.max(12, Math.round(bh * 0.1));
    const squashed = await oneChannel(
      sharp(alphaBand, { raw: { width: iw, height: bh, channels: 1 } }).resize({ width: iw, height: sqH, fit: "fill" }).blur(7),
    );
    for (let i = 0; i < squashed.length; i++) squashed[i] = Math.round(squashed[i] * 0.88);
    const shadow = await sharp(Buffer.alloc(iw * sqH * 3, 0), { raw: { width: iw, height: sqH, channels: 3 } })
      .joinChannel(squashed, { raw: { width: iw, height: sqH, channels: 1 } })
      .png()
      .toBuffer();
    comps.push({ input: shadow, left: cx0, top: FLOOR_Y + 9 - sqH });
    // sombra ambiente larga e suave
    const ew = Math.round(meanW * S * 1.05);
    const amb = await sharp(
      Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ew + 160}" height="140"><ellipse cx="${(ew + 160) / 2}" cy="70" rx="${ew / 2}" ry="26" fill="#000" fill-opacity="0.55"/></svg>`),
    ).blur(16).png().toBuffer();
    comps.unshift({ input: amb, left: Math.round(W / 2 - (ew + 160) / 2), top: FLOOR_Y - 70 + 10 });
  }

  // 4) reflexo: o quadro espelhado em torno da linha do chão, esmaecendo para baixo
  const topRef = 2 * FLOOR_Y - cy0 - ih + 1; // y (canvas) da 1ª linha do quadro espelhado
  const r0 = Math.max(0, FLOOR_Y - 24 - topRef); // começa um pouco acima do chão (fica escondido atrás do carro)
  const r1 = Math.min(ih, FLOOR_Y + RH - topRef);
  if (r1 > r0 + 4) {
    const rh = r1 - r0;
    const grad = Buffer.alloc(iw * rh * 4, 255);
    for (let r = 0; r < rh; r++) {
      const d = topRef + r0 + r - FLOOR_Y; // distância abaixo do chão
      const al = d < 0 ? 0.34 : 0.34 * Math.pow(Math.max(0, 1 - d / RH), 1.6);
      const v = Math.round(255 * al);
      for (let x = 0; x < iw; x++) grad[(r * iw + x) * 4 + 3] = v;
    }
    const refl = await sharp(car)
      .flip()
      .extract({ left: 0, top: r0, width: iw, height: rh })
      .composite([{ input: grad, raw: { width: iw, height: rh, channels: 4 }, blend: "dest-in" }])
      .blur(1.2)
      .png()
      .toBuffer();
    comps.push({ input: refl, left: cx0, top: topRef + r0 });
  }

  comps.push({ input: car, left: cx0, top: cy0 });

  // o sharp não aceita camada maior que o canvas nem posição negativa: recorta o que sair do quadro
  const safe = [];
  for (const c of comps) {
    const m = await sharp(c.input).metadata();
    const x0 = Math.max(0, -c.left);
    const y0 = Math.max(0, -c.top);
    const w = Math.min(m.width - x0, W - Math.max(0, c.left));
    const h = Math.min(m.height - y0, H - Math.max(0, c.top));
    if (w <= 0 || h <= 0) continue;
    const clipped = x0 || y0 || w !== m.width || h !== m.height;
    safe.push({
      input: clipped ? await sharp(c.input).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer() : c.input,
      left: Math.max(0, c.left),
      top: Math.max(0, c.top),
    });
  }
  await sharp(base).composite(safe).png({ compressionLevel: 2 }).toFile(outFile);
  if (++n % 24 === 0) console.log(`[${name}] ${t}/${total}`);
}
console.log(`[${name}] composição pronta (${n} quadros)`);
