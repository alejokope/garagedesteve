import Link from "next/link";

import { formatMoneyArs } from "@/lib/format";
import { listProductsAdmin } from "@/lib/backoffice/products-db";

import { deleteProductAdminAction } from "./actions";

export default async function BackofficeProductosPage() {
  let rows: Awaited<ReturnType<typeof listProductsAdmin>> = [];
  let loadError: string | null = null;

  try {
    rows = await listProductsAdmin();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "No se pudo cargar el catálogo";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Productos
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Catálogo
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Datos en Supabase (<code className="rounded bg-white/[0.06] px-1 font-mono text-xs">products</code>
            ). Los borradores no se muestran en la tienda con la clave anon.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/backoffice"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            ← Inicio
          </Link>
          <Link
            href="/backoffice/productos/nuevo"
            className="rounded-xl bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/[0.12]"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {loadError}
        </div>
      ) : null}

      {!loadError && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-14 text-center text-sm text-slate-400">
          No hay productos en la base. Creá el primero con{" "}
          <Link href="/backoffice/productos/nuevo" className="text-violet-300 hover:text-violet-200">
            Nuevo producto
          </Link>
          .
        </div>
      ) : null}

      {!loadError && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-200">{p.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {formatMoneyArs(p.price)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200/90">
                        Publicado
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200/90">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/backoffice/productos/${encodeURIComponent(p.id)}`}
                        className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.1]"
                      >
                        Editar
                      </Link>
                      <form action={deleteProductAdminAction} className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
                        >
                          Borrar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
