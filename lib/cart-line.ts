import type { CartItem } from "@/lib/types";
import {
  describeVariantSelections,
  resolveVariantPrice,
} from "@/lib/product-variants";

export function cartLineUnitPrice(item: CartItem): number {
  return resolveVariantPrice(
    item.product.price,
    item.product.variantGroups,
    item.variantSelections ?? {},
  );
}

export function cartLineDisplayName(item: CartItem): string {
  const parts = describeVariantSelections(
    item.product.variantGroups,
    item.variantSelections ?? {},
  );
  if (!parts.length) return item.product.name;
  return `${item.product.name} (${parts.join(" · ")})`;
}
