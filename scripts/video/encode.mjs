// Passo 3: codifica os quadros compostos em MP4 (H.264 High, yuv420p, BT.709) + poster WebP.
// Qualidade em primeiro lugar: CRF 15, preset slower, tune film; sem áudio; moov no início (faststart).
// Uso: node scripts/video/encode.mjs civic hatch nivus
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { FPS, SUFFIX } from "./scene.mjs";

const names = process.argv.slice(2);
const outDir = path.resolve("public/videos");
mkdirSync(outDir, { recursive: true });
const CRF = process.env.CRF ?? "15";

for (const name of names) {
  const frames = path.resolve(`scripts/.tmp/video/${name}/out${SUFFIX}/%04d.png`);
  const mp4 = path.join(outDir, `hero-${name}${SUFFIX}.mp4`);
  execFileSync(
    "ffmpeg",
    [
      "-v", "error", "-y", "-framerate", String(FPS), "-i", frames,
      "-vf", "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p",
      "-c:v", "libx264", "-profile:v", "high", "-preset", "slower", "-tune", "film", "-crf", CRF,
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-movflags", "+faststart", "-an", mp4,
    ],
    { stdio: "inherit" },
  );
  // poster = primeiro quadro (é o que aparece antes do vídeo e no LCP)
  const poster = path.join(outDir, `hero-${name}${SUFFIX}.webp`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.resolve(`scripts/.tmp/video/${name}/out${SUFFIX}/0001.png`), "-c:v", "libwebp", "-quality", "92", poster]);
  console.log(`${name}: ${(statSync(mp4).size / 1e6).toFixed(2)} MB (mp4), ${(statSync(poster).size / 1e3).toFixed(0)} KB (poster)`);
}
