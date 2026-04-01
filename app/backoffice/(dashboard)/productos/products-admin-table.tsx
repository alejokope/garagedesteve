"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatMoneyArs } from "@/lib/format";

import { deleteProductAdminAction } from "./actions";
import { ProductPublishedToggle } from "./product-published-toggle";

export type ProductListRow = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  category: string;
  stock_condition: string | null;
  published: boolean;
};

function matchesQuery(row: ProductListRow, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const blob = [row.id, row.name, row.brand ?? "", row.category].join(" ").toLowerCase();
  return blob.includes(t);
}

export function ProductsAdminTable({ rows }: { rows: ProductListRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => matchesQuery(r, query));
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <label htmlFor="bo-product-search" className="sr-only">
          Buscar productos
        </label>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="bo-product-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, ID, marca o categoría…"
          autoComplete="off"
          className="w-full rounded-xl border border-white/[0.1] bg-black/30 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        {query.trim() ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.08] hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">
        {query.trim() ? (
          <>
            <span className="font-medium text-slate-300">{filtered.length}</span> de {rows.length}{" "}
            productos
          </>
        ) : (
          <>{rows.length} productos</>
        )}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Condición</th>
              <th className="px-4 py-3 font-medium">En la web</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                  No hay coincidencias.{" "}
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="font-medium text-violet-300 hover:text-violet-200"
                  >
                    Borrar búsqueda
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-200">{p.name}</td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-slate-400">
                    {p.brand ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {formatMoneyArs(p.price)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.stock_condition === "new"
                      ? "Nuevo"
                      : p.stock_condition === "used"
                        ? "Usado"
                        : "—"}
                  </td>
                  <td className="max-w-[160px] px-4 py-3">
                    <ProductPublishedToggle productId={p.id} published={p.published} />
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
