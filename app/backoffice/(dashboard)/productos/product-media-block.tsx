"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  PRODUCT_IMAGE_MAX_EDGE_PX,
  compressProductImageFiles,
} from "@/lib/client/compress-product-image";

import { uploadGalleryImageAction } from "./upload-actions";

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const t = u.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** URLs que pueden guardarse en BD / R2 (nunca `blob:` ni `data:` de la vista previa local). */
function storedProductImageUrl(raw: string | undefined): string {
  const u = (raw ?? "").trim();
  if (!u || u.startsWith("blob:") || u.startsWith("data:")) return "";
  return u;
}

function initialPhotosList(main: string | undefined, extras: string[] | undefined): string[] {
  const m = storedProductImageUrl(main);
  const ex = (extras ?? []).map((x) => storedProductImageUrl(x)).filter(Boolean);
  if (!m) return dedupeUrls(ex);
  return dedupeUrls([m, ...ex.filter((u) => u !== m)]);
}

export function ProductMediaBlock({
  productId,
  initialImage,
  initialGalleryExtras,
  onCarouselThumbsChange,
  onMarkDirty,
}: {
  productId: string;
  initialImage?: string;
  initialGalleryExtras?: string[];
  /** Misma fila que el carrusel en la tienda (orden = índices en variantes). */
  onCarouselThumbsChange?: (thumbSrcs: string[]) => void;
  /** Subidas no disparan `change` del formulario: avisá para mostrar la barra de guardar. */
  onMarkDirty?: () => void;
}) {
  const [photos, setPhotos] = useState<string[]>(() =>
    initialPhotosList(initialImage, initialGalleryExtras),
  );

  const pid = productId.trim();
  const canUpload = pid.length > 0;

  const hiddenMainValue = photos[0] ?? "";
  const hiddenGalleryJson = JSON.stringify(photos.slice(1));

  const thumbStripForVariants = useMemo(() => photos.filter((u) => u && !u.startsWith("blob:")), [photos]);

  useEffect(() => {
    onCarouselThumbsChange?.(thumbStripForVariants);
  }, [onCarouselThumbsChange, thumbStripForVariants]);

  const appendPhotoUrls = (urls: string[]) => {
    const next = urls.map(storedProductImageUrl).filter(Boolean);
    if (!next.length) return;
    setPhotos((prev) => dedupeUrls([...prev, ...next]));
    onMarkDirty?.();
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    onMarkDirty?.();
  };

  const movePhoto = (idx: number, dir: -1 | 1) => {
    setPhotos((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    onMarkDirty?.();
  };

  const onPhotosFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const snapshot = input.files?.length ? Array.from(input.files) : [];
    input.value = "";
    if (!snapshot.length) return;
    if (!pid) {
      toast.error("Completá el ID del producto (Nombre y textos) para subir fotos.");
      return;
    }
    void (async () => {
      const list = snapshot.filter((f) => f.size > 0);
      if (!list.length) {
        toast.error("No hay archivos válidos", {
          description: "Elegí imágenes JPG, PNG, WebP o GIF con tamaño mayor a 0.",
        });
        return;
      }
      const loadingId = toast.loading("Optimizando tamaño…");
      try {
        let optimized: File[];
        try {
          optimized = await compressProductImageFiles(list);
        } catch (c) {
          toast.error("No se pudieron preparar las imágenes", {
            description: c instanceof Error ? c.message : "Probá con JPG o PNG más chicos.",
            id: loadingId,
          });
          return;
        }
        toast.loading(
          optimized.length > 1 ? `Subiendo ${optimized.length} imágenes…` : "Subiendo imagen…",
          { id: loadingId },
        );
        const urls: string[] = [];
        for (const file of optimized) {
          const fd = new FormData();
          fd.set("productId", pid);
          fd.set("file", file);
          const res = await uploadGalleryImageAction(null, fd);
          if (res.error) {
            toast.error("No se pudo subir una imagen", { description: res.error, id: loadingId });
            return;
          }
          if (res.url) urls.push(res.url);
        }
        appendPhotoUrls(urls);
        toast.success(
          urls.length > 1 ? `${urls.length} fotos agregadas al carrusel` : "Foto agregada",
          { id: loadingId },
        );
      } catch (err) {
        toast.error("Falló la subida", {
          description: err instanceof Error ? err.message : "Revisá la consola de red o la sesión del backoffice.",
        });
      }
    })();
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h3 className="text-sm font-semibold text-white">Fotos del producto</h3>
      <p className="mt-1 text-xs text-slate-500">
        Un solo lugar para sumar imágenes: podés elegir <strong className="text-slate-300">una o varias</strong> a la
        vez. Una sola foto es la ficha completa; varias forman el carrusel en ese orden. La{" "}
        <strong className="text-slate-300">primera</strong> es la de la grilla y la que abre la ficha. En{" "}
        <strong className="text-slate-300">Variantes</strong> enlazás cada color a una de estas fotos.
      </p>

      <input type="hidden" name="image" value={hiddenMainValue} readOnly />
      <input type="hidden" name="gallery_images" value={hiddenGalleryJson} readOnly />

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">
            Agregar fotos (una o varias; se optimizan antes de subir, máx. {PRODUCT_IMAGE_MAX_EDGE_PX}px, tope ~2,4&nbsp;MB
            c/u)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={!canUpload}
            className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/[0.12] disabled:opacity-40"
            onChange={onPhotosFiles}
          />
        </label>
        {!canUpload ? (
          <p className="text-xs text-amber-200/90">
            Completá el <strong className="font-medium text-amber-100/95">ID del producto</strong> arriba (Nombre y
            textos) para poder subir archivos.
          </p>
        ) : null}

        {photos.length ? (
          <ul className="space-y-2">
            {photos.map((u, i) => (
              <li
                key={`${u}-${i}`}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-black/25 px-2 py-2"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  {i === 0 ? (
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-200/90">
                      1ª — grilla y carrusel
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500">Foto {i + 1}</p>
                  )}
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">{u}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Subir"
                    disabled={i === 0}
                    onClick={() => movePhoto(i, -1)}
                    className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Bajar"
                    disabled={i === photos.length - 1}
                    onClick={() => movePhoto(i, 1)}
                    className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-slate-600">Todavía no hay fotos. Elegí una o más arriba.</p>
        )}

        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3">
          <p className="text-xs font-medium text-slate-400">Texto alternativo (principal)</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Se guarda automáticamente como el <strong className="font-medium text-slate-300">ID del producto</strong>{" "}
            (mismo valor que el identificador arriba). No hace falta escribir nada acá.
          </p>
          <p className="mt-2 font-mono text-sm text-white">
            {pid ? pid : "— completá el ID del producto para que coincida al guardar —"}
          </p>
          <input type="hidden" name="image_alt" value={pid} />
        </div>
      </div>
    </section>
  );
}
