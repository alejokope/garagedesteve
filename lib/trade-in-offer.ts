import { z } from "zod";

import type { SellCurrency } from "@/lib/sell-pricing-schema";

export const TRADE_IN_STORAGE_KEY = "egd.tradeInCheckout.v1" as const;

export const tradeInSavedOfferSchema = z.object({
  v: z.literal(1),
  savedAt: z.string(),
  product: z.string(),
  model: z.string(),
  modelDisplay: z.string(),
  capacityGb: z.number().int().positive(),
  battery: z.string(),
  batteryShort: z.string(),
  quality: z.string(),
  price: z.number().nonnegative(),
  currency: z.enum(["USD", "ARS"]),
});

export type TradeInSavedOffer = z.infer<typeof tradeInSavedOfferSchema>;

const persistedSchema = z.object({
  offer: tradeInSavedOfferSchema.nullable(),
  applyInCheckout: z.boolean(),
});

export type TradeInPersisted = z.infer<typeof persistedSchema>;

export function defaultTradeInPersisted(): TradeInPersisted {
  return { offer: null, applyInCheckout: false };
}

export function parseTradeInPersisted(raw: unknown): TradeInPersisted {
  const base = defaultTradeInPersisted();
  if (!raw || typeof raw !== "object") return base;
  try {
    return persistedSchema.parse({ ...base, ...(raw as object) });
  } catch {
    return base;
  }
}

export function loadTradeInFromLocalStorage(): TradeInPersisted {
  if (typeof window === "undefined") return defaultTradeInPersisted();
  try {
    const raw = localStorage.getItem(TRADE_IN_STORAGE_KEY);
    if (!raw?.trim()) return defaultTradeInPersisted();
    return parseTradeInPersisted(JSON.parse(raw) as unknown);
  } catch {
    return defaultTradeInPersisted();
  }
}

export function saveTradeInToLocalStorage(data: TradeInPersisted): void {
  if (typeof window === "undefined") return;
  try {
    if (!data.offer && !data.applyInCheckout) {
      localStorage.removeItem(TRADE_IN_STORAGE_KEY);
      return;
    }
    localStorage.setItem(TRADE_IN_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* */
  }
}
