"use client";

import { useEffect, useRef, useState } from "react";

export function ProductImageSection({
  mode,
  productId,
  initialUrl,
  initialAlt,
}: {
  mode: "create" | "edit";
  productId: string;
  initialUrl?: string;
  initialAlt?: string;
}) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canUpload = mode === "edit" || productId.trim().length > 0;

  useEffect(() => {
    return () => {
      if (filePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const displaySrc = filePreview ?? initialUrl ?? "";

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h3 className="text-sm font-semibold text-white">Imagen principal</h3>
      <p className="mt-1 text-xs text-slate-500">
        Supabase Storage. En producto nuevo, completá el ID arriba para poder subir archivo.
      </p>

      <input type="hidden" name="image" value={initialUrl ?? ""} readOnly />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-40 w-full max-w-[200px] overflow-hidden rounded-xl border border-white/[0.1] bg-black/40 sm:h-44">
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- URLs externas / storage
            <img src={displaySrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-500">
              Sin vista previa
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Archivo</span>
            <input
              ref={fileRef}
              type="file"
              name="image_file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!canUpload}
              required={mode === "create" && canUpload}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/[0.12] disabled:opacity-40"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) {
                  setFilePreview(null);
                  return;
                }
                setFilePreview(URL.createObjectURL(f));
              }}
            />
          </label>
          {mode === "create" && !productId.trim() ? (
            <p className="text-xs text-amber-200/90">
              Completá el identificador del producto arriba para habilitar la subida.
            </p>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Texto alternativo</span>
            <input
              name="image_alt"
              required
              defaultValue={initialAlt ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Ej. iPhone 16 Pro en color titanio"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
