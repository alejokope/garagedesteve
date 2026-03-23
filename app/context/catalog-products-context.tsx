"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/lib/data";

type Status = "idle" | "loading" | "ready" | "error";

type CatalogProductsValue = {
  products: Product[];
  status: Status;
  error: string | null;
  productLookup: Record<string, Product>;
  reload: () => void;
};

const CatalogProductsContext = createContext<CatalogProductsValue | null>(null);

/** Una sola petición en vuelo / resultado cacheado para toda la SPA. */
let catalogPromise: Promise<Product[]> | null = null;

function getCatalogPromise(forceNew: boolean): Promise<Product[]> {
  if (forceNew) catalogPromise = null;
  if (!catalogPromise) {
    catalogPromise = fetch("/api/catalog/products")
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "No se pudo cargar el catálogo");
        }
        return r.json() as Promise<Product[]>;
      })
      .catch((e) => {
        catalogPromise = null;
        throw e;
      });
  }
  return catalogPromise;
}

export function CatalogProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const runLoad = useCallback((forceNew: boolean) => {
    setError(null);
    setStatus("loading");
    getCatalogPromise(forceNew)
      .then((data) => {
        setProducts(data);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        setProducts([]);
        setError(e instanceof Error ? e.message : "Error al cargar el catálogo");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    runLoad(false);
  }, [runLoad]);

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
      status,
      error,
      productLookup,
      reload,
    }),
    [products, status, error, productLookup, reload],
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
