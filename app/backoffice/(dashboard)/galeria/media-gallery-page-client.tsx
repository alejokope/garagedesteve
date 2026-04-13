"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteMediaGalleryItemAction,
  listMediaGalleryPageAction,
  uploadMediaGalleryInboxAction,
} from "@/app/backoffice/(dashboard)/productos/upload-actions";
import type { MediaGalleryListRow } from "@/lib/backoffice/media-gallery-db";

export function MediaGalleryPageClient({
  initialItems,
  initialHasMore,
}: {
  initialItems: MediaGalleryListRow[];
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState<MediaGalleryListRow[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageRef = useRef(0);
  const busyRef = useRef(false);

  const [uploadState, uploadAction, uploadPending] = useActionState(uploadMediaGalleryInboxAction, null);

  useEffect(() => {
    if (uploadState?.error) toast.error(uploadState.error);
    if (uploadState?.ok && uploadState.url) {
      toast.success("Imagen agregada a la galería");
      setItems((prev) => [
        {
          id: uploadState.id ?? `local-${Date.now()}`,
          public_url: uploadState.url!,
          bytes: 0,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }, [uploadState]);

  const loadMore = () => {
    if (!hasMore || busyRef.current) return;
    busyRef.current = true;
    const next = pageRef.current + 1;
    startTransition(async () => {
      try {
        const { items: chunk, hasMore: more } = await listMediaGalleryPageAction(next);
        pageRef.current = next;
        setItems((prev) => [...prev, ...chunk]);
        setHasMore(more);
      } catch {
        setHasMore(false);
      } finally {
        busyRef.current = false;
      }
    });
  };

  function requestDeleteItem(it: MediaGalleryListRow) {
    if (deletingId) return;
    if (it.id.startsWith("local-")) {
      if (!confirm("¿Quitar esta imagen de la lista? (solo estaba en pantalla, no en la base de datos)")) return;
      setItems((prev) => prev.filter((x) => x.id !== it.id));
      return;
    }
    if (!confirm("¿Eliminar esta imagen del almacenamiento y de la galería? Los productos que la usen seguirán mostrando la URL hasta que la cambies.")) {
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

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Galería</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Todas las imágenes subidas desde productos o desde acá. En el alta de producto podés reutilizarlas con
          &quot;Galería&quot;. Listado paginado: solo metadatos y miniaturas con{" "}
          <code className="text-violet-200/90">loading=&quot;lazy&quot;</code>. Las URLs públicas de Storage salen con
          cache HTTP largo (un año): el navegador reutiliza la descarga cuando volvés al panel.
        </p>
      </header>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-white">Subir nueva</h2>
        <p className="mt-1 text-xs text-slate-500">Queda en Storage y se registra automáticamente.</p>
        <form action={uploadAction} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] text-slate-500">Archivo</span>
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="block w-full max-w-md text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600/80 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={uploadPending}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {uploadPending ? "Subiendo…" : "Subir a la galería"}
          </button>
        </form>
      </section>

      <section className="min-h-[40vh]">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">
          Biblioteca <span className="text-slate-500">({items.length} en pantalla)</span>
        </h2>
        {items.length === 0 && !isPending ? (
          <p className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-8 text-center text-sm text-slate-500">
            Vacío. Subí una imagen arriba o cargá productos con foto.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 [contain:content]">
            {items.map((it) => (
              <li key={it.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.public_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover"
                  sizes="(max-width:768px) 33vw, 12vw"
                />
                <a
                  href={it.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
                >
                  <span className="text-[10px] font-medium text-white">Abrir</span>
                </a>
                <button
                  type="button"
                  title="Eliminar de la galería"
                  disabled={deletingId === it.id}
                  onClick={(e) => {
                    e.preventDefault();
                    requestDeleteItem(it);
                  }}
                  className="absolute right-1 top-1 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-black/75 text-sm text-red-200 shadow-md hover:bg-red-950/80 disabled:opacity-40"
                >
                  {deletingId === it.id ? "…" : "×"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled={isPending || busyRef.current}
              onClick={loadMore}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-violet-100/95 hover:bg-white/[0.05] disabled:opacity-50"
            >
              {isPending ? "Cargando…" : "Cargar más"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
