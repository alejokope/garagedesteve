"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatMoneyUsd } from "@/lib/format";

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

type ConditionFilter = "all" | "new" | "used" | "unset";
type PublishedFilter = "all" | "yes" | "no";

function matchesCondition(row: ProductListRow, f: ConditionFilter): boolean {
  if (f === "all") return true;
  if (f === "new") return row.stock_condition === "new";
  if (f === "used") return row.stock_condition === "used";
  return row.stock_condition !== "new" && row.stock_condition !== "used";
}

function matchesPublished(row: ProductListRow, f: PublishedFilter): boolean {
  if (f === "all") return true;
  if (f === "yes") return row.published;
  return !row.published;
}

const selectClass =
  "min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40";

export function ProductsAdminTable({ rows }: { rows: ProductListRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<ConditionFilter>("all");
  const [published, setPublished] = useState<PublishedFilter>("all");

  const categoryOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.category).filter((c) => c.trim()));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  const hasActiveFilters =
    Boolean(query.trim()) || Boolean(category) || condition !== "all" || published !== "all";

  const filtered = useMemo(() => {
    return rows.filter(
      (r) =>
        matchesQuery(r, query) &&
        (!category || r.category === category) &&
        matchesCondition(r, condition) &&
        matchesPublished(r, published),
    );
  }, [rows, query, category, condition, published]);

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setCondition("all");
    setPublished("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <div className="relative min-w-0 flex-1 lg:max-w-xl">
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

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-slate-500">
            Categoría
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">Todas</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-slate-500">
            Condición
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ConditionFilter)}
              className={selectClass}
            >
              <option value="all">Todas</option>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
              <option value="unset">Sin definir</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-slate-500 sm:col-span-2 lg:col-span-1">
            En la web
            <select
              value={published}
              onChange={(e) => setPublished(e.target.value as PublishedFilter)}
              className={selectClass}
            >
              <option value="all">Todos</option>
              <option value="yes">Visibles</option>
              <option value="no">Ocultos</option>
            </select>
          </label>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 rounded-xl border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06] lg:self-end"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">
        {hasActiveFilters ? (
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
                    onClick={resetFilters}
                    className="font-medium text-violet-300 hover:text-violet-200"
                  >
                    Limpiar filtros
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
                    {formatMoneyUsd(p.price)}
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
