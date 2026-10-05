import sharp from "sharp";

export const MAX_PHOTOS_PER_VEHICLE = 12;
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // por arquivo, antes de comprimir
const MAX_SIDE = 1920;

/**
 * Prepara a foto enviada pelo cliente: respeita a orientação do celular (EXIF), limita a 1920 px no maior lado
 * e converte para WebP (~100–200 KB). O original NÃO é guardado: o banco gratuito tem 512 MB.
 * Lança erro se o arquivo não for uma imagem que o sharp entenda (JPG, PNG, WebP, AVIF, GIF).
 */
export async function processPhoto(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(input, { limitInputPixels: 120_000_000 })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
