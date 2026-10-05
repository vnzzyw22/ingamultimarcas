// Rastreia o movimento global do carro entre quadros (translação sub-pixel, Lucas-Kanade) para
//  (a) MEDIR tremor e (b) gerar o caminho usado na estabilização (scripts/.tmp/video/<nome>/track.json).
// Uso: node scripts/video/track.mjs civic            -> rastreia o vídeo-fonte (máscara = recorte da IA)
//      node scripts/video/track.mjs civic --out      -> rastreia o vídeo composto (mede o que foi entregue)
import sharp from "sharp";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SUFFIX } from "./scene.mjs";

const name = process.argv[2];
const measureOut = process.argv.includes("--out");
const dir = path.resolve(`scripts/.tmp/video/${name}`);

async function gray(file, blur = 1.2) {
  let img = sharp(file).removeAlpha().greyscale();
  if (blur > 0) img = img.blur(blur); // sharp só aceita sigma >= 0.3
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const f = new Float32Array(info.width * info.height);
  for (let i = 0; i < f.length; i++) f[i] = data[i * info.channels];
  return { f, w: info.width, h: info.height };
}

function erode(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let run = 0;
    for (let x = 0; x < w; x++) {
      run = mask[y * w + x] ? run + 1 : 0;
      tmp[y * w + x] = run > r ? 1 : 0; // precisa de r+1 vizinhos ligados à esquerda
    }
  }
  for (let x = 0; x < w; x++) {
    let run = 0;
    for (let y = 0; y < h; y++) {
      run = tmp[y * w + x] ? run + 1 : 0;
      out[y * w + x] = run > r ? 1 : 0;
    }
  }
  return out;
}

const bil = (f, w, h, x, y) => {
  if (x < 1 || y < 1 || x > w - 2 || y > h - 2) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * w + x0;
  return f[i] * (1 - fx) * (1 - fy) + f[i + 1] * fx * (1 - fy) + f[i + w] * (1 - fx) * fy + f[i + w + 1] * fx * fy;
};

function lk(I0, I1, w, h, mask) {
  let dx = 0, dy = 0;
  for (let it = 0; it < 8; it++) {
    let a = 0, b = 0, c = 0, e1 = 0, e2 = 0, n = 0;
    for (let y = 3; y < h - 3; y += 2) {
      for (let x = 3; x < w - 3; x += 2) {
        if (!mask[y * w + x]) continue;
        const wv = bil(I1, w, h, x + dx, y + dy);
        if (Number.isNaN(wv)) continue;
        const gx = (bil(I1, w, h, x + dx + 1, y + dy) - bil(I1, w, h, x + dx - 1, y + dy)) / 2;
        const gy = (bil(I1, w, h, x + dx, y + dy + 1) - bil(I1, w, h, x + dx, y + dy - 1)) / 2;
        const r = wv - I0[y * w + x];
        a += gx * gx; b += gx * gy; c += gy * gy; e1 += gx * r; e2 += gy * r; n++;
      }
    }
    const det = a * c - b * b;
    if (n < 500 || Math.abs(det) < 1e-6) break;
    const ddx = -(c * e1 - b * e2) / det;
    const ddy = -(-b * e1 + a * e2) / det;
    dx += ddx; dy += ddy;
    if (Math.abs(ddx) < 0.002 && Math.abs(ddy) < 0.002) break;
  }
  return [dx, dy];
}

const frames = measureOut
  ? readdirSync(path.join(dir, `out${SUFFIX}`)).sort().map((f) => path.join(dir, `out${SUFFIX}`, f))
  : readdirSync(path.join(dir, "frames709")).sort().map((f) => path.join(dir, "frames709", f));
const keys = existsSync(path.join(dir, "matte")) ? readdirSync(path.join(dir, "matte")).filter((f) => f.endsWith(".a8")).map((f) => parseInt(f, 10)).sort((a, b) => a - b) : [];
const base = measureOut ? await gray(`scripts/.tmp/video/base${SUFFIX}.png`, 0) : null;

const steps = [];
let prev = await gray(frames[0]);
for (let t = 1; t < frames.length; t++) {
  const cur = await gray(frames[t]);
  const { w, h } = cur;
  let mask = new Uint8Array(w * h);
  if (measureOut) {
    const raw = await gray(frames[t], 0);
    for (let i = 0; i < mask.length; i++) mask[i] = Math.abs(raw.f[i] - base.f[i]) > 14 ? 1 : 0;
  } else {
    const k = keys.reduce((best, v) => (Math.abs(v - (t + 1)) < Math.abs(best - (t + 1)) ? v : best), keys[0]);
    const a = readFileSync(path.join(dir, "matte", `${String(k).padStart(4, "0")}.a8`));
    for (let i = 0; i < mask.length; i++) mask[i] = a[i] > 200 ? 1 : 0;
  }
  mask = erode(mask, w, h, 8);
  // LK: quanto o conteúdo de `cur` se deslocou em relação a `prev` (prev(x) ≈ cur(x + d))
  steps.push(lk(prev.f, cur.f, w, h, mask));
  prev = cur;
}
// caminho acumulado (posição do carro no quadro, relativa ao quadro 0)
const path2 = [[0, 0]];
for (const [dx, dy] of steps) {
  const [px, py] = path2[path2.length - 1];
  path2.push([px + dx, py + dy]);
}
// tremor = parte de alta frequência do caminho (caminho − média móvel gaussiana de σ=5 quadros)
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
const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
const px = path2.map((p) => p[0]);
const py = path2.map((p) => p[1]);
const hx = px.map((v, i) => v - gauss(px, 5)[i]);
const hy = py.map((v, i) => v - gauss(py, 5)[i]);
console.log(`[${name}${measureOut ? " (saída)" : " (fonte)"}] deslocamento total: dx=${px.at(-1).toFixed(1)}px dy=${py.at(-1).toFixed(1)}px`);
console.log(`[${name}${measureOut ? " (saída)" : " (fonte)"}] TREMOR (RMS alta frequência): x=${rms(hx).toFixed(3)}px  y=${rms(hy).toFixed(3)}px  | pico: x=${Math.max(...hx.map(Math.abs)).toFixed(2)} y=${Math.max(...hy.map(Math.abs)).toFixed(2)}`);
// quadros com maior tremor (para investigar)
const worst = hx.map((v, i) => [i + 1, Math.abs(v)]).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`[${name}] PICOS x (quadro: px):`, worst.map(([f, v]) => `${f}: ${v.toFixed(2)}`).join(" | "));
if (!measureOut) writeFileSync(path.join(dir, "track.json"), JSON.stringify(path2));
