"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  PRODUCT_IMAGE_MAX_EDGE_PX,
  compressProductImageFile,
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

export function ProductMediaBlock({
  mode,
  productId,
  initialImage,
  initialAlt,
  initialGalleryExtras,
  skipNativeValidation = false,
  onCarouselThumbsChange,
  onMarkDirty,
}: {
  mode: "create" | "edit";
  productId: string;
  initialImage?: string;
  initialAlt?: string;
  initialGalleryExtras?: string[];
  skipNativeValidation?: boolean;
  /** Miniaturas del carrusel ya publicadas (misma fila que guarda el cliente); sin `blob:` de vista previa. */
  onCarouselThumbsChange?: (thumbSrcs: string[]) => void;
  /** Subidas no disparan `change` del formulario: avisá para mostrar la barra de guardar. */
  onMarkDirty?: () => void;
}) {
  const mainUrl = storedProductImageUrl(initialImage);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [hasPendingMainFile, setHasPendingMainFile] = useState(false);
  const [extras, setExtras] = useState<string[]>(() =>
    dedupeUrls((initialGalleryExtras ?? []).map((x) => storedProductImageUrl(x)).filter(Boolean)),
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const extrasInputRef = useRef<HTMLInputElement>(null);

  const pid = productId.trim();
  /** Subidas inmediatas a R2 (extras del carrusel) necesitan carpeta `products/{id}/`. */
  const canUploadToProductFolder = mode === "edit" || pid.length > 0;

  useEffect(() => {
    return () => {
      if (filePreview?.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const hiddenMainValue = mainUrl;

  const networkCarousel = useMemo(() => {
    const main = mainUrl;
    const parts = [main, ...extras].filter((u) => u && !u.startsWith("blob:"));
    return dedupeUrls(parts);
  }, [mainUrl, extras]);

  useEffect(() => {
    onCarouselThumbsChange?.(networkCarousel);
  }, [onCarouselThumbsChange, networkCarousel]);

  const appendExtraUrl = (url: string) => {
    const u = storedProductImageUrl(url);
    if (!u) return;
    setExtras((prev) => dedupeUrls([...prev, u]));
    onMarkDirty?.();
  };

  const removeExtra = (idx: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
    onMarkDirty?.();
  };

  const moveExtra = (idx: number, dir: -1 | 1) => {
    setExtras((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    onMarkDirty?.();
  };

  const onExtrasFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    /** Copiar antes de vaciar el input: si no, en algunos navegadores el `FileList` queda vacío al leerlo async. */
    const snapshot = input.files?.length ? Array.from(input.files) : [];
    input.value = "";
    if (!snapshot.length) return;
    if (!pid) {
      toast.error("Completá el ID del producto (paso Nombre) para subir más fotos al carrusel.");
      return;
    }
    void (async () => {
      const list = snapshot.filter((f) => f.size > 0);
      if (!list.length) {
        toast.error("No hay archivos válidos", { description: "Elegí imágenes JPG, PNG, WebP o GIF con tamaño mayor a 0." });
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
        toast.loading(list.length > 1 ? `Subiendo ${list.length} imágenes…` : "Subiendo imagen…", { id: loadingId });
        for (const file of optimized) {
          const fd = new FormData();
          fd.set("productId", pid);
          fd.set("file", file);
          const res = await uploadGalleryImageAction(null, fd);
          if (res.error) {
            toast.error("No se pudo subir una imagen", { description: res.error, id: loadingId });
            return;
          }
          if (res.url) {
            appendExtraUrl(res.url);
          }
        }
        toast.success("Imágenes agregadas al carrusel", { id: loadingId });
      } catch (err) {
        toast.error("Falló la subida", {
          description: err instanceof Error ? err.message : "Revisá la consola de red o la sesión del backoffice.",
          id: loadingId,
        });
      }
    })();
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h3 className="text-sm font-semibold text-white">Fotos del producto</h3>
      <p className="mt-1 text-xs text-slate-500">
        La primera es la <strong className="text-slate-300">principal</strong> (catálogo y miniaturas). Podés sumar más
        para el carrusel de la ficha. En variantes de color vas a enlazar cada tono a una de estas fotos.
      </p>

      <input type="hidden" name="image" value={hiddenMainValue} readOnly />
      <input type="hidden" name="gallery_images" value={JSON.stringify(extras)} readOnly />

      <div className="mt-4 flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium text-violet-200/90">Imagen principal</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-40 w-full max-w-[200px] overflow-hidden rounded-xl border border-white/[0.1] bg-black/40 sm:h-44">
              {filePreview || mainUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={filePreview ?? mainUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-500">
                  Sin vista previa
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-400">
                  Archivo principal (se optimiza en el navegador antes de guardar)
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  name="image_file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required={
                    mode === "create" &&
                    !skipNativeValidation &&
                    !hiddenMainValue.trim() &&
                    !hasPendingMainFile
                  }
                  className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/[0.12]"
                  onChange={(e) => {
                    const input = e.target;
                    const f = input.files?.[0];
                    if (!f) {
                      setFilePreview((prev) => {
                        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                        return null;
                      });
                      setHasPendingMainFile(false);
                      onMarkDirty?.();
                      return;
                    }
                    void (async () => {
                      let display = f;
                      try {
                        const compressed = await compressProductImageFile(f);
                        const dt = new DataTransfer();
                        dt.items.add(compressed);
                        input.files = dt.files;
                        display = compressed;
                      } catch {
                        /* input sigue con f */
                      }
                      setFilePreview((prev) => {
                        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                        return URL.createObjectURL(display);
                      });
                      setHasPendingMainFile(true);
                      onMarkDirty?.();
                    })();
                  }}
                />
              </label>
              {mode === "create" && !pid ? (
                <p className="text-xs text-amber-200/90">
                  Podés elegir la foto principal ya mismo; para <strong className="font-medium text-amber-100/95">más fotos
                  del carrusel</strong> completá el ID del producto (paso Nombre).
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-5">
          <p className="text-xs font-medium text-violet-200/90">Más fotos del carrusel</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Opcional. Se muestran en la ficha con flechas y miniaturas. Antes de subir se optimizan (máx.{" "}
            {PRODUCT_IMAGE_MAX_EDGE_PX}px, JPEG alta calidad, tope ~2,4&nbsp;MB) para equilibrar peso y nitidez.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="inline-flex min-w-0 max-w-md flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-400">Subir varias</span>
              <input
                id="bo-product-extras-files"
                ref={extrasInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                aria-label="Elegir imágenes extra del carrusel (una o varias)"
                onChange={onExtrasFiles}
              />
              <button
                type="button"
                onClick={() => extrasInputRef.current?.click()}
                className="w-fit rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-medium text-white hover:bg-white/[0.12]"
              >
                Elegir archivos
              </button>
              {!canUploadToProductFolder ? (
                <p className="text-[11px] text-amber-200/85">
                  Necesitás el ID del producto para subir fotos extra al carrusel.
                </p>
              ) : null}
            </div>
          </div>
          {extras.length ? (
            <ul className="mt-4 space-y-2">
              {extras.map((u, i) => (
                <li
                  key={`${u}-${i}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-black/25 px-2 py-2"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </div>
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-slate-500">{u}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Subir"
                      disabled={i === 0}
                      onClick={() => moveExtra(i, -1)}
                      className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="Bajar"
                      disabled={i === extras.length - 1}
                      onClick={() => moveExtra(i, 1)}
                      className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.06] disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExtra(i)}
                      className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[11px] text-slate-600">Ninguna foto extra todavía.</p>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Texto alternativo (principal)</span>
          <input
            name="image_alt"
            required={!skipNativeValidation}
            defaultValue={initialAlt ?? ""}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            placeholder="Ej. iPhone 16 Pro en color titanio"
          />
        </label>
      </div>
    </section>
  );
}
