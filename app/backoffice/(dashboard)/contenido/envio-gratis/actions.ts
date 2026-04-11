"use server";

import { revalidatePath } from "next/cache";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  CART_FREE_SHIPPING_CONTENT_KEY,
  cartFreeShippingPayloadSchema,
} from "@/lib/cart-free-shipping-content-schema";
import { requireBackofficeSession } from "@/lib/backoffice/session";

export type SaveCartFreeShippingResult = { ok: true } | { ok: false; error: string };

export async function saveCartFreeShippingAction(
  payload: unknown,
): Promise<SaveCartFreeShippingResult> {
  await requireBackofficeSession();
  const parsed = cartFreeShippingPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.map(String).join(".") || "dato"}: ${i.message}`)
      .join(" · ");
    return { ok: false, error: msg };
  }
  const data = parsed.data;
  try {
    await upsertContentEntryAdmin({
      key: CART_FREE_SHIPPING_CONTENT_KEY,
      label: "Sitio — Envío gratis (carrito)",
      payload: {
        enabled: data.enabled,
        minUsd: Math.round(data.minUsd),
      },
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar",
    };
  }
  revalidatePath("/", "layout");
  revalidatePath("/backoffice/contenido/envio-gratis");
  return { ok: true };
}
