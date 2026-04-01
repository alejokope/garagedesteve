import Link from "next/link";

import { listProductsAdmin } from "@/lib/backoffice/products-db";

import { ProductsAdminTable } from "./products-admin-table";

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
            ). Solo los marcados como <strong className="text-slate-300">visibles</strong> aparecen en la
            tienda pública; podés publicar u ocultar desde la columna En la web o al editar el producto.
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
        <ProductsAdminTable
          rows={rows.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            category: p.category,
            stock_condition: p.stock_condition,
            published: p.published,
          }))}
        />
      ) : null}
    </div>
  );
}
