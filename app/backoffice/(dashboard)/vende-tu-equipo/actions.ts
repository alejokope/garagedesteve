"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { SELL_PRICING_KEY, sellPricingPayloadSchema } from "@/lib/sell-pricing-schema";

export async function saveSellPricingAction(payload: unknown) {
  await requireBackofficeSession();
  const parsed = sellPricingPayloadSchema.parse(payload);
  await upsertContentEntryAdmin({
    key: SELL_PRICING_KEY,
    label: "Vendé tu equipo — Simulador de precios",
    payload: parsed,
  });
  revalidatePath("/vende-tu-equipo");
  revalidatePath("/backoffice/vende-tu-equipo/precios");
}
