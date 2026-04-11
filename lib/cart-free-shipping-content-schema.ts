import { z } from "zod";

/** Promo de envío gratis en la página del carrito (orientativo). */
export const CART_FREE_SHIPPING_CONTENT_KEY = "site.cart_free_shipping" as const;

export const cartFreeShippingPayloadSchema = z.object({
  enabled: z.boolean().default(true),
  minUsd: z.number().min(0).max(999_999).default(800),
});

export type CartFreeShippingPayload = z.infer<typeof cartFreeShippingPayloadSchema>;

export function defaultCartFreeShippingPayload(): CartFreeShippingPayload {
  return cartFreeShippingPayloadSchema.parse({ enabled: true, minUsd: 800 });
}

export function mergeCartFreeShippingDefaults(partial: unknown): CartFreeShippingPayload {
  const base = defaultCartFreeShippingPayload();
  if (!partial || typeof partial !== "object") return base;
  const o = partial as Record<string, unknown>;
  try {
    return cartFreeShippingPayloadSchema.parse({
      ...base,
      enabled: typeof o.enabled === "boolean" ? o.enabled : base.enabled,
      minUsd:
        typeof o.minUsd === "number" && Number.isFinite(o.minUsd) && o.minUsd >= 0
          ? o.minUsd
          : base.minUsd,
    });
  } catch {
    return base;
  }
}
