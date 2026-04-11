import type { Product } from "@/lib/data";
import type { VariantSelections } from "@/lib/product-variants";
import type { CartItem } from "@/lib/types";

export const CART_LOCAL_STORAGE_KEY = "egd.cart.v1";

function reviveCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.lineKey !== "string" || o.lineKey.length === 0) return null;
  const qty = Number(o.qty);
  if (!Number.isFinite(qty) || qty < 1) return null;
  const p = o.product;
  if (!p || typeof p !== "object") return null;
  const pr = p as Record<string, unknown>;
  if (
    typeof pr.id !== "string" ||
    typeof pr.name !== "string" ||
    typeof pr.short !== "string" ||
    typeof pr.category !== "string" ||
    typeof pr.price !== "number" ||
    typeof pr.image !== "string" ||
    typeof pr.imageAlt !== "string"
  ) {
    return null;
  }
  const product = p as Product;
  const variantSelections =
    o.variantSelections !== undefined && o.variantSelections !== null
      ? (o.variantSelections as VariantSelections)
      : undefined;
  return {
    lineKey: o.lineKey,
    product,
    qty: Math.min(9999, Math.floor(qty)),
    variantSelections,
  };
}

export function loadCartFromLocalStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
    if (!raw?.trim()) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const row of parsed) {
      const item = reviveCartItem(row);
      if (item) items.push(item);
    }
    return items;
  } catch {
    return [];
  }
}

export function saveCartToLocalStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* cuota llena o modo privado */
  }
}
