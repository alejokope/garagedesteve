"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Product } from "@/lib/data";

type Status = "idle" | "loading" | "ready" | "error";

export type CatalogCategoryFilterOption = { id: string; label: string };

type CatalogProductsValue = {
  products: Product[];
  /** Categorías activas desde Supabase; vacío = el catálogo arma opciones desde los productos. */
  categoryFilterOptions: CatalogCategoryFilterOption[];
  status: Status;
  error: string | null;
  productLookup: Record<string, Product>;
  reload: () => void;
};

const CatalogProductsContext = createContext<CatalogProductsValue | null>(null);

type CatalogFetchResult = { products: Product[]; categoryFilterOptions: CatalogCategoryFilterOption[] };

/** Solo deduplica peticiones en vuelo; no guarda el resultado (evita catálogo viejo al navegar o recargar). */
let catalogInflight: Promise<CatalogFetchResult> | null = null;

function parseCatalogResponse(raw: unknown): CatalogFetchResult {
  if (Array.isArray(raw)) {
    return { products: raw as Product[], categoryFilterOptions: [] };
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const products = Array.isArray(o.products) ? (o.products as Product[]) : [];
    const categoryFilterOptions = Array.isArray(o.categoryFilterOptions)
      ? (o.categoryFilterOptions as CatalogCategoryFilterOption[])
      : [];
    return { products, categoryFilterOptions };
  }
  return { products: [], categoryFilterOptions: [] };
}

function fetchCatalogOnce(forceNew: boolean): Promise<CatalogFetchResult> {
  if (forceNew) catalogInflight = null;
  if (catalogInflight) return catalogInflight;

  // Cada carga nueva = URL distinta → el navegador no puede servir un GET cacheado (F5, volver a la tienda).
  const url = `/api/catalog/products?_=${Date.now()}`;
  const p = fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  })
    .then(async (r) => {
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo cargar el catálogo");
      }
      return parseCatalogResponse(await r.json());
    })
    .finally(() => {
      if (catalogInflight === p) catalogInflight = null;
    });

  catalogInflight = p;
  return p;
}

const SHOP_CATALOG_PATH = /^\/(tienda(\/.*)?|carrito|favoritos)$/;

export function CatalogProductsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilterOptions, setCategoryFilterOptions] = useState<CatalogCategoryFilterOption[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const isFirstPathEffect = useRef(true);

  const runLoad = useCallback((forceNew: boolean) => {
    setError(null);
    setStatus("loading");
    fetchCatalogOnce(forceNew)
      .then((data) => {
        setProducts(data.products);
        setCategoryFilterOptions(data.categoryFilterOptions);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        setProducts([]);
        setError(e instanceof Error ? e.message : "Error al cargar el catálogo");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    if (isFirstPathEffect.current) {
      isFirstPathEffect.current = false;
      runLoad(true);
      return;
    }
    if (SHOP_CATALOG_PATH.test(pathname)) {
      runLoad(true);
    }
  }, [pathname, runLoad]);

  const reload = useCallback(() => {
    runLoad(true);
  }, [runLoad]);

  const productLookup = useMemo(() => {
    const m: Record<string, Product> = {};
    for (const p of products) m[p.id] = p;
    return m;
  }, [products]);

  const value = useMemo<CatalogProductsValue>(
    () => ({
      products,
      categoryFilterOptions,
      status,
      error,
      productLookup,
      reload,
    }),
    [products, categoryFilterOptions, status, error, productLookup, reload],
  );

  return (
    <CatalogProductsContext.Provider value={value}>{children}</CatalogProductsContext.Provider>
  );
}

export function useCatalogProducts(): CatalogProductsValue {
  const ctx = useContext(CatalogProductsContext);
  if (!ctx) {
    throw new Error("useCatalogProducts debe usarse dentro de CatalogProductsProvider");
  }
  return ctx;
}
