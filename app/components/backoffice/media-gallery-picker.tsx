"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteMediaGalleryItemAction,
  listMediaGalleryPageAction,
} from "@/app/backoffice/(dashboard)/productos/upload-actions";

type Row = { id: string; public_url: string; bytes: number };

export function MediaGalleryPicker({
  open,
  onClose,
  onPick,
  title = "Elegir de la galería",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
  title?: string;
}) {
  const [items, setItems] = useState<Row[]>([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback((page: number, append: boolean) => {
    startTransition(async () => {
      try {
        const { items: chunk, hasMore: more } = await listMediaGalleryPageAction(page);
        setItems((prev) => (append ? [...prev, ...chunk] : chunk));
        setHasMore(more);
        setPageIdx(page);
      } catch {
        if (!append) setItems([]);
        setHasMore(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    load(0, false);
  }, [open, load]);

  function deleteItem(it: Row, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (deletingId) return;
    if (
      !confirm(
        "¿Eliminar esta imagen del almacenamiento y de la galería? Los productos que la usen seguirán mostrando la URL hasta que la cambies.",
      )
    ) {
      return;
    }
    setDeletingId(it.id);
    startTransition(async () => {
      const res = await deleteMediaGalleryItemAction(it.id);
      setDeletingId(null);
      if ("error" in res && res.error) {
        toast.error("No se pudo borrar", { description: res.error });
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== it.id));
      toast.success("Imagen eliminada");
    });
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(90dvh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0f1117] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/[0.06]"
          >
            Cerrar
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {items.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No hay imágenes registradas. Subí fotos al crear productos o desde la página Galería.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 [contain:content]">
              {items.map((it) => (
                <li key={it.id} className="aspect-square">
                  <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.public_url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-cover"
                      sizes="120px"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onPick(it.public_url);
                        onClose();
                      }}
                      className="group absolute inset-0 z-10 outline-none ring-violet-500/40 focus-visible:ring-2"
                      aria-label="Elegir esta imagen"
                    >
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 pt-8 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                        Elegir
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Eliminar de la galería"
                      disabled={deletingId === it.id}
                      onClick={(e) => deleteItem(it, e)}
                      className="absolute right-1 top-1 z-20 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/40 bg-black/80 text-xs font-bold text-red-200 hover:bg-red-950/90 disabled:opacity-40"
                    >
                      {deletingId === it.id ? "…" : "×"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hasMore ? (
            <div className="mt-4 flex justify-center pb-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => load(pageIdx + 1, true)}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-violet-100/95 hover:bg-white/[0.05] disabled:opacity-50"
              >
                {loading ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
