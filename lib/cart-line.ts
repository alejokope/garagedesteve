import type { CartItem } from "@/lib/types";
import { describeVariantSelections } from "@/lib/product-variants";
import { parseSellableVariants, resolvePriceWithSellableMatrix } from "@/lib/sellable-variants";

export function cartLineUnitPrice(item: CartItem): number {
  const rows = parseSellableVariants(item.product.sellableVariants);
  return resolvePriceWithSellableMatrix(
    item.product.price,
    item.product.variantGroups,
    item.variantSelections ?? {},
    rows,
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
