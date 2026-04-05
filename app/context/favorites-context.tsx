"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useShopFeedback } from "@/app/context/shop-feedback-context";
import type { Product } from "@/lib/data";

const STORAGE_KEY = "egd-favorites-v1";

function isStoredProduct(o: unknown): o is Product {
  if (!o || typeof o !== "object") return false;
  const x = o as Record<string, unknown>;
  return (
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.short === "string" &&
    typeof x.price === "number" &&
    typeof x.image === "string" &&
    typeof x.imageAlt === "string" &&
    typeof x.category === "string"
  );
}

function loadFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredProduct);
  } catch {
    return [];
  }
}

export type FavoritesContextValue = {
  items: Product[];
  count: number;
  has: (productId: string) => boolean;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { celebrateFavorite } = useShopFeedback();
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private mode */
    }
  }, [items, hydrated]);

  const has = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items],
  );

  const add = useCallback(
    (product: Product) => {
      let added = false;
      setItems((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        added = true;
        return [...prev, product];
      });
      if (added) celebrateFavorite();
    },
    [celebrateFavorite],
  );

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggle = useCallback(
    (product: Product) => {
      let becameFavorite = false;
      setItems((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) return prev.filter((p) => p.id !== product.id);
        becameFavorite = true;
        return [...prev, product];
      });
      if (becameFavorite) celebrateFavorite();
    },
    [celebrateFavorite],
  );

  const count = items.length;

  const value = useMemo(
    () => ({ items, count, has, add, remove, toggle }),
    [items, count, has, add, remove, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
