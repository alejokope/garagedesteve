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

import { sellQuoteSchema, type SellQuote } from "@/lib/sell-quote";

const STORAGE_KEY = "egd-sell-quotes-v1";
const MAX_QUOTES = 24;

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): SellQuote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SellQuote[] = [];
    for (const row of parsed) {
      try {
        out.push(sellQuoteSchema.parse(row));
      } catch {
        /* skip corrupt */
      }
    }
    return out.slice(0, MAX_QUOTES);
  } catch {
    return [];
  }
}

export type SellQuotesContextValue = {
  hydrated: boolean;
  quotes: SellQuote[];
  count: number;
  addQuote: (input: Omit<SellQuote, "id" | "createdAt">) => SellQuote;
  removeQuote: (id: string) => void;
  getById: (id: string) => SellQuote | undefined;
};

const SellQuotesContext = createContext<SellQuotesContextValue | null>(null);

export function SellQuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<SellQuote[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setQuotes(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      if (quotes.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes.slice(0, MAX_QUOTES)));
    } catch {
      /* quota */
    }
  }, [quotes, hydrated]);

  const getById = useCallback(
    (id: string) => quotes.find((q) => q.id === id),
    [quotes],
  );

  const addQuote = useCallback((input: Omit<SellQuote, "id" | "createdAt">): SellQuote => {
    const next: SellQuote = {
      ...input,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    setQuotes((prev) => [next, ...prev].slice(0, MAX_QUOTES));
    return next;
  }, []);

  const removeQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const count = quotes.length;

  const value = useMemo(
    () => ({
      hydrated,
      quotes,
      count,
      addQuote,
      removeQuote,
      getById,
    }),
    [hydrated, quotes, count, addQuote, removeQuote, getById],
  );

  return <SellQuotesContext.Provider value={value}>{children}</SellQuotesContext.Provider>;
}

export function useSellQuotes() {
  const ctx = useContext(SellQuotesContext);
  if (!ctx) throw new Error("useSellQuotes debe usarse dentro de SellQuotesProvider");
  return ctx;
}
