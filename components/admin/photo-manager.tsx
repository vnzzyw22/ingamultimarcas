"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { VehicleImage } from "@/types/vehicle";
import { movePhotoAction, removePhotoAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { btnDanger, btnOutline, btnSmall } from "@/components/admin/ui";

const MAX_SIDE = 1920;

/**
 * Reduz a foto no próprio navegador antes de enviar: o celular manda 4–8 MB, e isso estouraria o limite de
 * envio de muitas hospedagens (e gastaria o plano de dados do cliente). O servidor ainda refaz o ajuste.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // formato que o navegador não decodifica: manda o original e o servidor decide
  }
}

export function PhotoManager({ vehicleId, photos, max }: { vehicleId: string; photos: VehicleImage[]; max: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const room = max - photos.length;

  async function upload(files: File[]) {
    const list = files.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|avif|gif)$/i.test(f.name)).slice(0, Math.max(0, room));
    const skipped = files.length - list.length;
    const errs: string[] = skipped > 0 ? [`${skipped} arquivo(s) ignorado(s): não são fotos ou passam do limite de ${max}.`] : [];
    for (let i = 0; i < list.length; i++) {
      setBusy(`Enviando foto ${i + 1} de ${list.length}…`);
      const body = new FormData();
      body.set("vehicleId", vehicleId);
      body.set("file", await shrink(list[i]!), list[i]!.name.replace(/\.[^.]+$/, "") + ".jpg");
      try {
        const res = await fetch("/admin/api/fotos", { method: "POST", body });
        if (!res.ok) errs.push(`${list[i]!.name}: ${((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "falha no envio."}`);
      } catch {
        errs.push(`${list[i]!.name}: sem conexão. Tente de novo.`);
      }
    }
    setBusy(null);
    setErrors(errs);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <section id="fotos" className="border border-line bg-white p-5" aria-labelledby="fotos-titulo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="fotos-titulo" className="text-sm font-bold uppercase tracking-[0.1em]">
            Fotos
          </h2>
          <p className="mt-1 text-xs text-mute">
            {photos.length} de {max}. A primeira é a capa. Use fotos em JPG ou PNG (as do celular e do WhatsApp servem).
          </p>
        </div>
        <div>
          <input
            ref={input}
            id="fotos-input"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={!!busy || room <= 0}
            onChange={(e) => void upload(Array.from(e.target.files ?? []))}
          />
          <label htmlFor="fotos-input" className={`${btnOutline} cursor-pointer ${busy || room <= 0 ? "pointer-events-none opacity-50" : ""}`}>
            Adicionar fotos
          </label>
        </div>
      </div>

      <div role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold">
        {busy}
      </div>
      {errors.length ? (
        <ul role="alert" className="mt-2 grid gap-1 border border-red/40 bg-red/5 px-3 py-2 text-sm text-red-text">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : null}

      {photos.length === 0 ? (
        <p className="mt-4 border border-dashed border-line px-4 py-8 text-center text-sm text-mute">Nenhuma foto ainda. Clique em “Adicionar fotos” — dá para escolher várias de uma vez.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => {
            const id = p.src.split("/").pop()!;
            return (
              <li key={id} className="border border-line">
                <div className="relative aspect-[4/3] bg-paper-2">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 15vw, 45vw" className="object-cover" />
                  {i === 0 ? <span className="absolute left-2 top-2 bg-red px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white">Capa</span> : null}
                </div>
                <div className="flex flex-wrap gap-1.5 p-2">
                  {i > 0 ? (
                    <>
                      <form action={movePhotoAction}>
                        <input type="hidden" name="vehicleId" value={vehicleId} />
                        <input type="hidden" name="photoId" value={id} />
                        <input type="hidden" name="dir" value="-1" />
                        <button type="submit" className={btnSmall} aria-label={`Mover foto ${i + 1} para antes`}>
                          ◀
                        </button>
                      </form>
                    </>
                  ) : null}
                  {i < photos.length - 1 ? (
                    <form action={movePhotoAction}>
                      <input type="hidden" name="vehicleId" value={vehicleId} />
                      <input type="hidden" name="photoId" value={id} />
                      <input type="hidden" name="dir" value="1" />
                      <button type="submit" className={btnSmall} aria-label={`Mover foto ${i + 1} para depois`}>
                        ▶
                      </button>
                    </form>
                  ) : null}
                  {i > 0 ? (
                    <form action={movePhotoAction}>
                      <input type="hidden" name="vehicleId" value={vehicleId} />
                      <input type="hidden" name="photoId" value={id} />
                      <input type="hidden" name="dir" value="0" />
                      <button type="submit" className={btnSmall}>
                        Capa
                      </button>
                    </form>
                  ) : null}
                  <form action={removePhotoAction} className="ml-auto">
                    <input type="hidden" name="vehicleId" value={vehicleId} />
                    <input type="hidden" name="photoId" value={id} />
                    <ConfirmButton className={btnDanger} message="Excluir esta foto?">
                      Excluir
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
