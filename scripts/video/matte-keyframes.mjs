// Passo 1 do pipeline de vídeo do hero: extrai os quadros dos vídeos-fonte e gera o recorte (matte)
// do carro por IA em quadros-chave (1 a cada STEP). Os quadros do meio são interpolados no passo 2.
// A IA leva ~20 s/quadro em CPU antiga, por isso o processo é RETOMÁVEL (pula o que já existe).
// Grava a máscara BRUTA (.a8 = 1 byte/pixel, 1280x720). Não usa sharp aqui: duas libvips no mesmo
// processo (a do projeto e a aninhada no pacote de IA) conflitam no Windows. O passo 2 converte.
// Uso: node scripts/video/matte-keyframes.mjs [civic hatch nivus]
import { removeBackground } from "@imgly/background-removal-node";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const STEP = 6;
const names = process.argv.slice(2).length ? process.argv.slice(2) : ["civic", "hatch", "nivus"];

for (const name of names) {
  const src = path.resolve(`assets-src/videos/${name}.mp4`);
  const dir = path.resolve(`scripts/.tmp/video/${name}`);
  const frames = path.join(dir, "frames");
  const matte = path.join(dir, "matte");
  mkdirSync(frames, { recursive: true });
  mkdirSync(matte, { recursive: true });

  if (readdirSync(frames).length === 0) {
    console.log(`[${name}] extraindo quadros…`);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, path.join(frames, "%04d.png")]);
  }
  const total = readdirSync(frames).length;
  const keys = [];
  for (let i = 1; i <= total; i += STEP) keys.push(i);
  if (keys[keys.length - 1] !== total) keys.push(total);

  let done = 0;
  for (const k of keys) {
    const id = String(k).padStart(4, "0");
    const out = path.join(matte, `${id}.a8`);
    done++;
    if (existsSync(out)) continue;
    const t = Date.now();
    const buf = await readFile(path.join(frames, `${id}.png`));
    const res = await removeBackground(new Blob([buf], { type: "image/png" }), {
      model: "medium",
      output: { format: "image/x-alpha8" },
    });
    // vem como RGBA cru (4 bytes/pixel); guarda só o canal alfa
    const raw = Buffer.from(await res.arrayBuffer());
    if (raw.length !== 1280 * 720 * 4) throw new Error();
    const alpha = Buffer.alloc(1280 * 720);
    for (let i = 0; i < alpha.length; i++) alpha[i] = raw[i * 4 + 3];
    await writeFile(out, alpha);
    console.log(`[${name}] ${done}/${keys.length} quadro ${id} (${Math.round((Date.now() - t) / 1000)}s)`);
  }
  console.log(`[${name}] pronto: ${keys.length} quadros-chave de ${total}`);
}
console.log("TUDO PRONTO");
