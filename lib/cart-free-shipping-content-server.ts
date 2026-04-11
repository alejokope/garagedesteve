import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FLOATING_CONTACT_KEY } from "@/lib/floating-contact-schema";
import {
  CART_FREE_SHIPPING_CONTENT_KEY,
  mergeCartFreeShippingDefaults,
  type CartFreeShippingPayload,
} from "@/lib/cart-free-shipping-content-schema";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function fetchContentPayload(key: string): Promise<unknown | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_entries")
      .select("payload")
      .eq("key", key)
      .maybeSingle();
    if (error) return null;
    const row = data as { payload?: unknown } | null;
    return row?.payload ?? null;
  } catch {
    return null;
  }
}

/** Valores públicos del carrito (promo envío gratis). */
export async function getCartFreeShippingPublic(): Promise<CartFreeShippingPayload> {
  const raw = await fetchContentPayload(CART_FREE_SHIPPING_CONTENT_KEY);
  if (raw) return mergeCartFreeShippingDefaults(raw);

  const legacyFloat = await fetchContentPayload(FLOATING_CONTACT_KEY);
  if (legacyFloat && typeof legacyFloat === "object") {
    const o = legacyFloat as Record<string, unknown>;
    const hasLegacy =
      typeof o.cartFreeShippingEnabled === "boolean" ||
      (typeof o.cartFreeShippingMinUsd === "number" && Number.isFinite(o.cartFreeShippingMinUsd));
    if (hasLegacy) {
      return mergeCartFreeShippingDefaults({
        enabled:
          typeof o.cartFreeShippingEnabled === "boolean" ? o.cartFreeShippingEnabled : undefined,
        minUsd:
          typeof o.cartFreeShippingMinUsd === "number" && Number.isFinite(o.cartFreeShippingMinUsd)
            ? o.cartFreeShippingMinUsd
            : undefined,
      });
    }
  }

  return mergeCartFreeShippingDefaults(null);
}
