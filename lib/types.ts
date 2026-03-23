import type { Product } from "./data";
import type { VariantSelections } from "./product-variants";

export type CartItem = {
  /** Identifica la línea (mismo producto + distintas variantes = distintas líneas) */
  lineKey: string;
  product: Product;
  qty: number;
  variantSelections?: VariantSelections;
};
