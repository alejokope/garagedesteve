"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/context/cart-context";
import {
  PAGE_SIZE,
  brandFilterOptionsFromProducts,
  catalogCategoriesFromUrl,
  CATALOG_FILTER_CATEGORY_IDS,
  type CatalogEstado,
  type EnrichedProduct,
  parseBrandFilterKeysFromUrlParam,
  type ProductStockCondition,
  type ShopBrandFilterId,
  type SortKey,
  enrichProduct,
  filterEnriched,
  shopEstados,
  shopStockConditions,
  sortEnriched,
} from "@/lib/catalog";
import type { CategoryId } from "@/lib/data";
import { categories } from "@/lib/data";
import { useCatalogProducts } from "@/app/context/catalog-products-context";
import { formatMoneyArs } from "@/lib/format";

function parseList(s: string | null): string[] {
  if (!s?.trim()) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/** ~80 pasos útiles entre min y max sin pasos gigantes ni de 1 peso innecesarios. */
function priceSliderStep(min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return 1;
  const rough = Math.ceil(span / 80);
  if (rough < 10) return rough;
  const pow = 10 ** Math.floor(Math.log10(rough));
  return Math.max(pow, Math.round(rough / pow) * pow);
}

function CatalogCard({ p }: { p: EnrichedProduct }) {
  const { add } = useCart();

  const showDiscount = p.discountPercent != null && p.compareAtPrice != null;
  const badgeNuevo = p.estado === "nuevo" && !showDiscount && p.condition !== "used";
  const badgeMasVendido = p.estado === "mas-vendido" && !showDiscount && p.condition !== "used";
  const badgeUsado = p.condition === "used";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)]">
      <Link href={`/tienda/${p.id}`} className="relative block aspect-[4/3] bg-neutral-50">
        <Image
          src={p.image}
          alt={p.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
          {showDiscount ? (
            <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              -{p.discountPercent}%
            </span>
          ) : null}
          {badgeUsado ? (
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Usado
            </span>
          ) : null}
          {badgeNuevo ? (
            <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Nuevo
            </span>
          ) : null}
          {badgeMasVendido ? (
            <span className="rounded-md bg-[var(--brand-from)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Más vendido
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {p.brand?.trim() ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-600">
              {p.brand.trim()}
            </p>
          ) : null}
          {p.brand?.trim() ? (
            <span className="text-[10px] text-neutral-300" aria-hidden>
              ·
            </span>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {p.categoryLabel}
          </p>
        </div>
        <Link href={`/tienda/${p.id}`}>
          <h3 className="font-display mt-2 text-base font-semibold leading-snug text-neutral-900 group-hover:text-[var(--brand-from)]">
            {p.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{p.short}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div>
            {showDiscount ? (
              <p className="text-xs text-neutral-400 line-through">
                {formatMoneyArs(p.compareAtPrice!)}
              </p>
            ) : null}
            <p className="font-display text-lg font-bold tabular-nums text-neutral-900">
              {formatMoneyArs(p.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => add(p)}
            className="shrink-0 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99]"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

function buildPageList(total: number, current: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [];
  const add = (n: number | "ellipsis") => {
    if (out.length && out[out.length - 1] === n) return;
    out.push(n);
  };
  add(1);
  if (current > 3) add("ellipsis");
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let i = lo; i <= hi; i++) add(i);
  if (current < total - 2) add("ellipsis");
  add(total);
  return out;
}

function PaginationNav({
  totalPages,
  currentPage,
  setPage,
}: {
  totalPages: number;
  currentPage: number;
  setPage: (n: number) => void;
}) {
  const items = useMemo(
    () => buildPageList(totalPages, currentPage),
    [totalPages, currentPage],
  );
  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginación"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
        aria-label="Anterior"
      >
        ‹
      </button>
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span key={`e-${idx}`} className="px-1 text-neutral-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => setPage(item)}
            className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
              item === currentPage
                ? "bg-[var(--brand-from)] text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
        aria-label="Siguiente"
      >
        ›
      </button>
    </nav>
  );
}

function CatalogLoadingSkeleton() {
  return (
    <div className="min-h-[50vh] bg-[#f3f4f6] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-14 rounded-2xl bg-neutral-200" />
        <div className="mt-8 flex gap-8">
          <div className="hidden w-[280px] shrink-0 rounded-2xl bg-neutral-200 lg:block" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-40 rounded bg-neutral-200" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl bg-neutral-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatalogView() {
  const searchParams = useSearchParams();
  const { products: catalogProducts, status, error, reload } = useCatalogProducts();

  const enriched = useMemo(
    () => catalogProducts.map(enrichProduct),
    [catalogProducts],
  );

  const brandFilterOptions = useMemo(
    () => brandFilterOptionsFromProducts(catalogProducts),
    [catalogProducts],
  );

  const catalogCategoryOptions = useMemo(() => {
    const allowed = new Set<CategoryId>(CATALOG_FILTER_CATEGORY_IDS);
    return categories.filter(
      (c): c is { id: CategoryId; label: string } => c.id !== "all" && allowed.has(c.id),
    );
  }, []);

  /** Filtros solo en memoria: no usar router (evita navegaciones /tienda en cada tecla). */
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>(
    () => (searchParams.get("sort") ?? "relevancia") as SortKey,
  );
  const [page, setPage] = useState(() =>
    Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  );
  const [marcas, setMarcas] = useState<ShopBrandFilterId[]>(() =>
    parseBrandFilterKeysFromUrlParam(searchParams.get("marcas")),
  );
  const [categorias, setCategorias] = useState<CategoryId[]>(() =>
    catalogCategoriesFromUrl(searchParams),
  );
  const [estados, setEstados] = useState<CatalogEstado[]>(
    () => parseList(searchParams.get("estados")) as CatalogEstado[],
  );
  const [stockConditions, setStockConditions] = useState<ProductStockCondition[]>(
    () => parseList(searchParams.get("condicion")) as ProductStockCondition[],
  );
  const [precioMax, setPrecioMax] = useState<number | null>(null);

  const validBrandFilterIds = useMemo(
    () => new Set(brandFilterOptions.map((o) => o.id)),
    [brandFilterOptions],
  );

  /** Ignora claves de URL que ya no existen en el catálogo cargado. */
  const effectiveMarcas = useMemo(() => {
    if (validBrandFilterIds.size === 0) return marcas;
    return marcas.filter((id) => validBrandFilterIds.has(id));
  }, [marcas, validBrandFilterIds]);

  /** Min/max de precio según filtros actuales (sin tope de precio), para el slider realista. */
  const priceScope = useMemo(() => {
    const withoutPrice = filterEnriched(enriched, {
      q,
      marcas: effectiveMarcas,
      categorias,
      estados,
      stockConditions,
      precioMax: Number.POSITIVE_INFINITY,
    });
    const basis = withoutPrice.length > 0 ? withoutPrice : enriched;
    const prices = basis.map((p) => p.price).filter((n) => typeof n === "number" && !Number.isNaN(n));
    if (prices.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [enriched, q, effectiveMarcas, categorias, estados, stockConditions]);

  const minCatalogPrice = priceScope.min;
  const maxCatalogPrice = priceScope.max;
  const sliderStep = useMemo(
    () => priceSliderStep(minCatalogPrice, maxCatalogPrice),
    [minCatalogPrice, maxCatalogPrice],
  );

  useEffect(() => {
    if (status !== "ready") return;
    setPrecioMax((prev) => {
      const clamp = (v: number) => Math.min(maxCatalogPrice, Math.max(minCatalogPrice, v));
      if (prev === null) {
        const raw = searchParams.get("max");
        const parsed = raw ? parseInt(raw, 10) : NaN;
        if (!Number.isNaN(parsed) && parsed > 0) return clamp(parsed);
        return maxCatalogPrice;
      }
      return clamp(prev);
    });
  }, [status, minCatalogPrice, maxCatalogPrice, searchParams]);

  const effectivePrecioMax = precioMax ?? maxCatalogPrice;
  const clampedPrecioMax = Math.min(
    maxCatalogPrice,
    Math.max(minCatalogPrice, effectivePrecioMax),
  );

  const filtered = useMemo(() => {
    const f = filterEnriched(enriched, {
      q,
      marcas: effectiveMarcas,
      categorias,
      estados,
      stockConditions,
      precioMax: clampedPrecioMax,
    });
    return sortEnriched(f, sort);
  }, [enriched, q, effectiveMarcas, categorias, estados, stockConditions, clampedPrecioMax, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleMarcas = (id: ShopBrandFilterId) => {
    setMarcas((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return [...set];
    });
    setPage(1);
  };

  const toggleCategoria = (id: CategoryId) => {
    setCategorias((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return [...set] as CategoryId[];
    });
    setPage(1);
  };

  const toggleEstados = (id: CatalogEstado) => {
    setEstados((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return [...set] as CatalogEstado[];
    });
    setPage(1);
  };

  const toggleStockCondition = (id: ProductStockCondition) => {
    setStockConditions((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return [...set] as ProductStockCondition[];
    });
    setPage(1);
  };

  const clearFilters = useCallback(() => {
    setQ("");
    setSort("relevancia");
    setPage(1);
    setMarcas([]);
    setCategorias([]);
    setEstados([]);
    setStockConditions([]);
    setPrecioMax(maxCatalogPrice);
  }, [maxCatalogPrice]);

  if (status === "loading" || status === "idle") {
    return <CatalogLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <div id="catalogo" className="scroll-mt-24 bg-[#f3f4f6] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200/80 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-800">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 rounded-xl bg-[var(--brand-from)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="catalogo" className="scroll-mt-24 bg-[#f3f4f6] pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Barra búsqueda + orden */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {(
              [
                ["relevancia", "Relevancia"],
                ["precio-asc", "Precio: Menor a Mayor"],
                ["novedad", "Novedad"],
              ] as const
            ).map(([key, label]) => {
              const active =
                key === "relevancia"
                  ? sort === "relevancia"
                  : sort === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSort(key === "relevancia" ? "relevancia" : key);
                    setPage(1);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Sidebar filtros */}
          <aside className="w-full shrink-0 lg:w-[280px]">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h2 className="font-display text-base font-semibold text-neutral-900">
                  Filtros
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[var(--brand-from)] hover:underline"
                >
                  Limpiar
                </button>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Marca
                </p>
                <p className="mt-1 text-[11px] leading-snug text-neutral-400">
                  Se generan desde el campo marca de cada producto. “Otras marcas” = sin marca definida.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {brandFilterOptions.length === 0 ? (
                    <span className="text-xs text-neutral-400">No hay marcas en el catálogo.</span>
                  ) : (
                    brandFilterOptions.map((m) => {
                      const on = marcas.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMarcas(m.id)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            on
                              ? "border-[var(--brand-from)] bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
                              : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Categoría
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {catalogCategoryOptions.map((t) => {
                    const on = categorias.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleCategoria(t.id)}
                        className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                          on
                            ? "border-[var(--brand-from)] bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Rango de precio
                </p>
                <div className="mt-3">
                  <input
                    type="range"
                    min={minCatalogPrice}
                    max={maxCatalogPrice}
                    step={sliderStep}
                    value={clampedPrecioMax}
                    disabled={minCatalogPrice >= maxCatalogPrice}
                    onChange={(e) => {
                      setPrecioMax(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="h-2 w-full cursor-pointer accent-[var(--brand-from)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-valuemin={minCatalogPrice}
                    aria-valuemax={maxCatalogPrice}
                    aria-valuenow={clampedPrecioMax}
                  />
                  <div className="mt-2 flex justify-between gap-2 text-xs text-neutral-500">
                    <span className="min-w-0 shrink truncate">{formatMoneyArs(minCatalogPrice)}</span>
                    <span className="shrink-0 text-center font-semibold text-neutral-800">
                      Hasta {formatMoneyArs(clampedPrecioMax)}
                    </span>
                    <span className="min-w-0 shrink truncate text-right">{formatMoneyArs(maxCatalogPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Condición
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shopStockConditions.map((c) => {
                    const on = stockConditions.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleStockCondition(c.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          on
                            ? "border-[var(--brand-from)] bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Etiqueta
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Destacados en catálogo (oferta, más vendido, etc.)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shopEstados.map((e) => {
                    const on = estados.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => toggleEstados(e.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          on
                            ? "border-[var(--brand-from)] bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-500">
              Mostrando{" "}
              <span className="font-semibold text-neutral-800">{filtered.length}</span>{" "}
              productos
            </p>

            {slice.length === 0 ? (
              <p className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-500">
                No hay resultados con estos filtros.{" "}
                <button type="button" onClick={clearFilters} className="font-semibold text-[var(--brand-from)] hover:underline">
                  Limpiar filtros
                </button>
              </p>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {slice.map((p) => (
                  <CatalogCard key={p.id} p={p} />
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <PaginationNav
                totalPages={totalPages}
                currentPage={currentPage}
                setPage={setPage}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
