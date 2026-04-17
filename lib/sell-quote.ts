import { z } from "zod";

import type { TradeInSavedOffer } from "@/lib/trade-in-offer";

export const sellQuoteSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
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

export type SellQuote = z.infer<typeof sellQuoteSchema>;

export function sellQuoteSnapshotKey(q: Pick<SellQuote, "model" | "capacityGb" | "battery" | "price" | "currency">): string {
  return [q.model, q.capacityGb, q.battery, q.price, q.currency].join("|");
}

export function sellQuoteToTradeInOffer(q: SellQuote): TradeInSavedOffer {
  return {
    v: 1,
    savedAt: new Date().toISOString(),
    product: q.product,
    model: q.model,
    modelDisplay: q.modelDisplay,
    capacityGb: q.capacityGb,
    battery: q.battery,
    batteryShort: q.batteryShort,
    quality: q.quality,
    price: q.price,
    currency: q.currency,
  };
}

export function sellQuoteTitle(q: Pick<SellQuote, "modelDisplay" | "capacityGb">): string {
  return `${q.modelDisplay} · ${q.capacityGb} GB`;
}
