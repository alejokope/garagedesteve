"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import {
  REPAIR_PRICING_KEY,
  repairPricingPayloadSchema,
} from "@/lib/repair-pricing-schema";

export async function saveRepairPricingAction(payload: unknown) {
  await requireBackofficeSession();
  const parsed = repairPricingPayloadSchema.parse(payload);
  await upsertContentEntryAdmin({
    key: REPAIR_PRICING_KEY,
    label: "Servicio técnico — Precios",
    payload: parsed,
  });
  revalidatePath("/servicio-tecnico");
  revalidatePath("/servicio-tecnico/precios");
  revalidatePath("/backoffice/servicio-tecnico/precios");
}
