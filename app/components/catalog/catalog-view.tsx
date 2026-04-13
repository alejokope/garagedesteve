"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TransitionEvent } from "react";
import { ProductFavoriteButton } from "@/app/components/product-favorite-button";
import { StoreRemoteImage } from "@/app/components/store-remote-image";
import { useCart } from "@/app/context/cart-context";
import { useAckFlash } from "@/app/hooks/use-ack-flash";
import {
  PAGE_SIZE,
  brandFilterOptionsFromProducts,
  catalogCategoriesFromUrl,
  categoryFilterOptionsFromProducts,
  type CatalogEstado,
  estadoFilterOptionsFromEnriched,
  type EnrichedProduct,
  parseBrandFilterKeysFromUrlParam,
  type ProductStockCondition,
  type ShopBrandFilterId,
  type SortKey,
  catalogProductPreviewImage,
  enrichProduct,
  filterEnriched,
  sortEnriched,
  stockFilterOptionsFromProducts,
} from "@/lib/catalog";
import { useCatalogProducts } from "@/app/context/catalog-products-context";
import { SiteRouteLoading } from "@/app/components/site/site-route-loading";
import { formatMoneyUsd } from "@/lib/format";

/** Opciones de orden (misma lista que en desktop). */
const CATALOG_SORT_OPTIONS = [
  ["relevancia", "Relevancia"],
  ["precio-asc", "Precio: Menor a Mayor"],
  ["novedad", "Novedad"],
] as const satisfies ReadonlyArray<readonly [SortKey, string]>;

const CATALOG_SHEET_PANEL_CLASS =
  "transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform";
const CATALOG_SHEET_BACKDROP_CLASS =
  "transition-opacity duration-300 ease-out will-change-opacity";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Debe ser ≥ duración CSS del panel (300ms) + margen para frame tardío. */
const CATALOG_SHEET_CLOSE_FALLBACK_MS = 380;

function useCatalogBottomSheet(open: boolean, onCloseComplete: () => void) {
  const [entered, setEntered] = useState(false);
  const closingRef = useRef(false);
  const closeFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseFallback = useCallback(() => {
    if (closeFallbackTimerRef.current !== null) {
      clearTimeout(closeFallbackTimerRef.current);
      closeFallbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      clearCloseFallback();
      startTransition(() => setEntered(false));
      closingRef.current = false;
      return;
    }
    closingRef.current = false;
    if (prefersReducedMotion()) {
      startTransition(() => setEntered(true));
      return;
    }
    startTransition(() => setEntered(false));
    let cancelled = false;
    let innerRaf: number | null = null;
    const outerRaf = requestAnimationFrame(() => {
      if (cancelled) return;
      innerRaf = requestAnimationFrame(() => {
        if (cancelled) return;
        startTransition(() => setEntered(true));
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      if (innerRaf !== null) cancelAnimationFrame(innerRaf);
    };
  }, [open, clearCloseFallback]);

  const requestClose = useCallback(() => {
    if (!open) return;
    if (prefersReducedMotion()) {
      clearCloseFallback();
      closingRef.current = false;
      onCloseComplete();
      return;
    }
    closingRef.current = true;
    clearCloseFallback();
    closeFallbackTimerRef.current = setTimeout(() => {
      closeFallbackTimerRef.current = null;
      if (!closingRef.current) return;
      closingRef.current = false;
      onCloseComplete();
    }, CATALOG_SHEET_CLOSE_FALLBACK_MS);
    startTransition(() => setEntered(false));
  }, [open, onCloseComplete, clearCloseFallback]);

  const onPanelTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "transform") return;
      if (!closingRef.current) return;
      closingRef.current = false;
      clearCloseFallback();
      onCloseComplete();
    },
    [onCloseComplete, clearCloseFallback],
  );

  return { entered, requestClose, onPanelTransitionEnd };
}

function parseList(s: string | null): string[] {
  if (!s?.trim()) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/** ~80 pasos útiles entre min y max sin pasos de 1 USD innecesarios. */
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
  const { on: addAck, trigger: triggerAddAck } = useAckFlash();

  const showDiscount = p.discountPercent != null && p.compareAtPrice != null;
  const badgeNuevo = p.estado === "nuevo" && !showDiscount && p.condition !== "used";
  const badgeMasVendido = p.estado === "mas-vendido" && !showDiscount && p.condition !== "used";
  const badgeUsado = p.condition === "used";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)]">
      <div className="absolute left-2 top-2 z-10">
        <ProductFavoriteButton
          product={p}
          className="h-9 w-9 border-white/80 bg-white/95 shadow-sm backdrop-blur-sm"
          iconClass="h-[18px] w-[18px]"
        />
      </div>
      <Link href={`/tienda/${p.id}`} className="relative block aspect-[4/3] bg-neutral-50">
        <StoreRemoteImage
          src={catalogProductPreviewImage(p)}
          alt={p.imageAlt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 34vw"
          className="object-contain object-center p-2 transition duration-500 group-hover:scale-[1.02]"
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
                {formatMoneyUsd(p.compareAtPrice!)}
              </p>
            ) : null}
            <p className="font-display text-lg font-bold tabular-nums text-neutral-900">
              {formatMoneyUsd(p.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              add(p);
              triggerAddAck();
            }}
            className={`shrink-0 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] ${addAck ? "egd-add-ack" : ""}`}
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

export function CatalogView() {
  const searchParams = useSearchParams();
  const { products: catalogProducts, categoryFilterOptions, status, error, reload } =
    useCatalogProducts();

  const enriched = useMemo(
    () => catalogProducts.map(enrichProduct),
    [catalogProducts],
  );

  const brandFilterOptions = useMemo(
    () => brandFilterOptionsFromProducts(catalogProducts),
    [catalogProducts],
  );

  const catalogCategoryOptions = useMemo(
    () => categoryFilterOptionsFromProducts(catalogProducts, categoryFilterOptions),
    [catalogProducts, categoryFilterOptions],
  );

  const stockFilterOptions = useMemo(
    () => stockFilterOptionsFromProducts(catalogProducts),
    [catalogProducts],
  );

  const estadoFilterOptions = useMemo(
    () => estadoFilterOptionsFromEnriched(enriched),
    [enriched],
  );

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
  const [categorias, setCategorias] = useState<string[]>(() =>
    catalogCategoriesFromUrl(searchParams),
  );
  const [estados, setEstados] = useState<CatalogEstado[]>(
    () => parseList(searchParams.get("estados")) as CatalogEstado[],
  );
  const [stockConditions, setStockConditions] = useState<ProductStockCondition[]>(
    () => parseList(searchParams.get("condicion")) as ProductStockCondition[],
  );
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const validBrandFilterIds = useMemo(
    () => new Set(brandFilterOptions.map((o) => o.id)),
    [brandFilterOptions],
  );

  /** Ignora claves de URL que ya no existen en el catálogo cargado. */
  const effectiveMarcas = useMemo(() => {
    if (validBrandFilterIds.size === 0) return marcas;
    return marcas.filter((id) => validBrandFilterIds.has(id));
  }, [marcas, validBrandFilterIds]);

  const validCategoryFilterIds = useMemo(
    () => new Set(catalogCategoryOptions.map((o) => o.id)),
    [catalogCategoryOptions],
  );

  const effectiveCategorias = useMemo(() => {
    if (validCategoryFilterIds.size === 0) return categorias;
    return categorias.filter((id) => validCategoryFilterIds.has(id));
  }, [categorias, validCategoryFilterIds]);

  /** Min/max de precio según filtros actuales (sin tope de precio), para el slider realista. */
  const priceScope = useMemo(() => {
    const withoutPrice = filterEnriched(enriched, {
      q,
      marcas: effectiveMarcas,
      categorias: effectiveCategorias,
      estados,
      stockConditions,
      precioMax: Number.POSITIVE_INFINITY,
    });
    const basis = withoutPrice.length > 0 ? withoutPrice : enriched;
    const prices = basis.map((p) => p.price).filter((n) => typeof n === "number" && !Number.isNaN(n));
    if (prices.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [enriched, q, effectiveMarcas, effectiveCategorias, estados, stockConditions]);

  const minCatalogPrice = priceScope.min;
  const maxCatalogPrice = priceScope.max;
  const sliderStep = useMemo(
    () => priceSliderStep(minCatalogPrice, maxCatalogPrice),
    [minCatalogPrice, maxCatalogPrice],
  );

  useEffect(() => {
    if (status !== "ready") return;
    startTransition(() => {
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
    });
  }, [status, minCatalogPrice, maxCatalogPrice, searchParams]);

  const effectivePrecioMax = precioMax ?? maxCatalogPrice;
  const clampedPrecioMax = Math.min(
    maxCatalogPrice,
    Math.max(minCatalogPrice, effectivePrecioMax),
  );

  const activeFilterCount = useMemo(() => {
    let n =
      marcas.length + effectiveCategorias.length + estados.length + stockConditions.length;
    if (
      maxCatalogPrice > minCatalogPrice &&
      clampedPrecioMax < maxCatalogPrice
    ) {
      n += 1;
    }
    return n;
  }, [
    marcas.length,
    effectiveCategorias.length,
    estados.length,
    stockConditions.length,
    clampedPrecioMax,
    maxCatalogPrice,
    minCatalogPrice,
  ]);

  const currentSortLabel = useMemo(() => {
    const row = CATALOG_SORT_OPTIONS.find(([key]) =>
      key === "relevancia" ? sort === "relevancia" : sort === key,
    );
    return row?.[1] ?? "Relevancia";
  }, [sort]);

  const filtered = useMemo(() => {
    const f = filterEnriched(enriched, {
      q,
      marcas: effectiveMarcas,
      categorias: effectiveCategorias,
      estados,
      stockConditions,
      precioMax: clampedPrecioMax,
    });
    return sortEnriched(f, sort);
  }, [
    enriched,
    q,
    effectiveMarcas,
    effectiveCategorias,
    estados,
    stockConditions,
    clampedPrecioMax,
    sort,
  ]);

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

  const toggleCategoria = (id: string) => {
    setCategorias((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return [...set];
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

  const closeSortSheetComplete = useCallback(() => setSortSheetOpen(false), []);
  const closeFiltersSheetComplete = useCallback(() => setFiltersOpen(false), []);
  const sortSheetAnim = useCatalogBottomSheet(sortSheetOpen, closeSortSheetComplete);
  const filtersSheetAnim = useCatalogBottomSheet(filtersOpen, closeFiltersSheetComplete);

  const sortRequestCloseRef = useRef(sortSheetAnim.requestClose);
  const filtersRequestCloseRef = useRef(filtersSheetAnim.requestClose);
  useLayoutEffect(() => {
    sortRequestCloseRef.current = sortSheetAnim.requestClose;
    filtersRequestCloseRef.current = filtersSheetAnim.requestClose;
  }, [sortSheetAnim.requestClose, filtersSheetAnim.requestClose]);

  useEffect(() => {
    if (!filtersOpen && !sortSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sortSheetOpen) sortRequestCloseRef.current();
      else if (filtersOpen) filtersRequestCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen, sortSheetOpen]);

  useEffect(() => {
    if (!filtersOpen && !sortSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen, sortSheetOpen]);

  if (status === "loading" || status === "idle") {
    return (
      <div id="catalogo" className="scroll-mt-24 bg-[#f3f4f6] px-4 py-10 sm:px-8">
        <SiteRouteLoading />
      </div>
    );
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

  const filterSections = (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Marca</p>
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

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Categoría</p>
        <div className="mt-2 flex flex-col gap-2">
          {catalogCategoryOptions.length === 0 ? (
            <span className="text-xs text-neutral-400">No hay categorías en el catálogo cargado.</span>
          ) : (
            catalogCategoryOptions.map((t) => {
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
            })
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Rango de precio</p>
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
            <span className="min-w-0 shrink truncate">{formatMoneyUsd(minCatalogPrice)}</span>
            <span className="shrink-0 text-center font-semibold text-neutral-800">
              Hasta {formatMoneyUsd(clampedPrecioMax)}
            </span>
            <span className="min-w-0 shrink truncate text-right">{formatMoneyUsd(maxCatalogPrice)}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Condición</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stockFilterOptions.length === 0 ? (
            <span className="text-xs text-neutral-400">Sin opciones para este catálogo.</span>
          ) : (
            stockFilterOptions.map((c) => {
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
            })
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Etiqueta</p>
        <p className="mt-1 text-[11px] text-neutral-400">
          Destacados en catálogo (oferta, más vendido, etc.)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {estadoFilterOptions.length === 0 ? (
            <span className="text-xs text-neutral-400">Sin etiquetas en el catálogo cargado.</span>
          ) : (
            estadoFilterOptions.map((e) => {
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
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div id="catalogo" className="scroll-mt-24 bg-[#f3f4f6] pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Barra búsqueda + orden */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-5">
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
          <div className="hidden flex-wrap gap-2 lg:flex lg:justify-end">
            {CATALOG_SORT_OPTIONS.map(([key, label]) => {
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

        {/* Móvil / tablet: barra única (misma línea visual que las cards del catálogo) */}
        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] lg:hidden">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={() => {
                setFiltersOpen(false);
                setSortSheetOpen(true);
              }}
              className="group flex min-h-[2.75rem] min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-neutral-100/90 px-3.5 py-2 text-left text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-from)]/20 focus-visible:ring-offset-2 sm:max-w-[13.5rem] sm:px-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.65}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 4v8m0 0l2.5-2.5M7 12l-2.5-2.5M17 20v-8m0 0l2.5 2.5M17 12l-2.5 2.5"
                  />
                </svg>
                <span className="min-w-0 text-left">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Ordenar
                  </span>
                  <span className="line-clamp-1 font-display text-[15px] font-semibold leading-tight tracking-tight text-neutral-900">
                    {currentSortLabel}
                  </span>
                </span>
              </span>
              <svg
                className="h-5 w-5 shrink-0 text-neutral-400 transition group-hover:text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setSortSheetOpen(false);
                setFiltersOpen(true);
              }}
              className="group flex min-h-[2.75rem] min-w-0 flex-1 items-center justify-between gap-3 rounded-xl bg-neutral-950 px-3.5 py-2 text-left text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 sm:px-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-white/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.65}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Refinar
                  </span>
                  <span className="font-display text-[15px] font-semibold leading-tight tracking-tight text-white">
                    Filtros
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {activeFilterCount > 0 ? (
                  <span className="rounded-md bg-white px-2 py-1 text-center text-[11px] font-bold tabular-nums leading-none text-neutral-950">
                    {activeFilterCount}
                  </span>
                ) : null}
                <svg
                  className="h-5 w-5 text-white/45 transition group-hover:text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Sidebar filtros — solo desktop */}
          <aside className="hidden w-full shrink-0 lg:block lg:w-[280px]">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h2 className="font-display text-base font-semibold text-neutral-900">Filtros</h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[var(--brand-from)] hover:underline"
                >
                  Limpiar
                </button>
              </div>
              <div className="mt-5">{filterSections}</div>
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

      {filtersOpen || sortSheetOpen ? (
        <button
          type="button"
          className={`fixed inset-0 z-[90] cursor-pointer bg-black/35 backdrop-blur-[1px] lg:hidden ${CATALOG_SHEET_BACKDROP_CLASS} ${
            (sortSheetOpen && sortSheetAnim.entered) || (filtersOpen && filtersSheetAnim.entered)
              ? "opacity-100"
              : "opacity-0"
          }`}
          aria-label="Cerrar panel"
          onClick={() => {
            if (sortSheetOpen) sortSheetAnim.requestClose();
            else if (filtersOpen) filtersSheetAnim.requestClose();
          }}
        />
      ) : null}

      {sortSheetOpen ? (
        <div
          className={`fixed bottom-0 left-0 right-0 z-[95] flex max-h-[min(55dvh,420px)] flex-col rounded-t-2xl border border-[var(--border)] border-b-0 bg-white shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.18)] lg:hidden ${CATALOG_SHEET_PANEL_CLASS} ${
            sortSheetAnim.entered ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-sort-sheet-title"
          onTransitionEnd={sortSheetAnim.onPanelTransitionEnd}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <h2
              id="catalog-sort-sheet-title"
              className="font-display text-base font-semibold text-neutral-900"
            >
              Ordenar por
            </h2>
            <button
              type="button"
              onClick={sortSheetAnim.requestClose}
              className="rounded-xl p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Cerrar ordenar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col gap-1 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" role="listbox">
            {CATALOG_SORT_OPTIONS.map(([key, label]) => {
              const selected =
                key === "relevancia" ? sort === "relevancia" : sort === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setSort(key === "relevancia" ? "relevancia" : key);
                      setPage(1);
                      sortSheetAnim.requestClose();
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-medium transition ${
                      selected
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
                    }`}
                  >
                    <span className={selected ? "font-display font-semibold" : ""}>{label}</span>
                    {selected ? (
                      <svg
                        className="h-5 w-5 shrink-0 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.25}
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {filtersOpen ? (
        <div
          className={`fixed bottom-0 left-0 right-0 z-[95] flex max-h-[min(90dvh,720px)] flex-col rounded-t-2xl border border-[var(--border)] border-b-0 bg-white shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.18)] lg:hidden ${CATALOG_SHEET_PANEL_CLASS} ${
            filtersSheetAnim.entered ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-filters-sheet-title"
          onTransitionEnd={filtersSheetAnim.onPanelTransitionEnd}
        >
            <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2
                  id="catalog-filters-sheet-title"
                  className="font-display text-base font-semibold text-neutral-900"
                >
                  Filtros
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-0.5 text-left text-xs font-semibold text-[var(--brand-from)] hover:underline"
                >
                  Limpiar todo
                </button>
              </div>
              <button
                type="button"
                onClick={filtersSheetAnim.requestClose}
                className="rounded-xl p-2.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Cerrar filtros"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {filterSections}
            </div>
            <div className="shrink-0 border-t border-[var(--border)] bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={filtersSheetAnim.requestClose}
                className="h-12 w-full rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Ver {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              </button>
            </div>
          </div>
      ) : null}
    </div>
  );
}
