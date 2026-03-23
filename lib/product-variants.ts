/**
 * Opciones seleccionables por producto (color, almacenamiento, etc.).
 * Pensado para persistir igual desde un BO (JSON): mismos tipos y campos.
 */

export type ProductVariantKind = "color" | "storage" | "select";

/** Cómo se muestra el grupo en tienda (color swatches, grid tipo storage, o lista). */
export type VariantUiKind = "color" | "storage" | "select";

/**
 * Modo de precio del grupo:
 * - `absolute`: el precio del producto pasa a ser `option.price` al elegir esa opción (típico almacenamiento).
 * - `delta`: se suma `priceDelta` al precio acumulado (típico color o acabado).
 */
export type ProductVariantPricingMode = "absolute" | "delta";

export type ProductVariantOption = {
  id: string;
  label: string;
  /** Swatch de color */
  hex?: string;
  /** Imagen opcional por variante (ej. otro ángulo al elegir color) */
  imageUrl?: string;
  /**
   * Precio final del ítem al elegir esta opción (solo si el grupo es `pricingMode: "absolute"`).
   */
  price?: number;
  /**
   * Suma al precio cuando el grupo es `delta` (o si no hay `price` en modo absolute).
   */
  priceDelta?: number;
};

export type ProductVariantGroup = {
  /** Clave estable para `variantSelections` en carrito y APIs */
  id: string;
  /**
   * Id del tipo de opción (tabla `variant_kind_definitions` o valores legados color|storage|select).
   */
  kind: string;
  /**
   * Presentación en tienda; si falta, se infiere con `getVariantUiKind`.
   */
  uiKind?: VariantUiKind;
  label: string;
  pricingMode: ProductVariantPricingMode;
  options: ProductVariantOption[];
};

/** Compatibilidad con JSON guardado antes de `uiKind`. */
export function getVariantUiKind(g: Pick<ProductVariantGroup, "kind" | "uiKind">): VariantUiKind {
  if (g.uiKind === "color" || g.uiKind === "storage" || g.uiKind === "select") {
    return g.uiKind;
  }
  const k = g.kind;
  if (k === "color" || k === "storage" || k === "select") return k;
  return "select";
}

/** Selección: groupId → optionId */
export type VariantSelections = Record<string, string>;

export function resolveVariantPrice(
  basePrice: number,
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
): number {
  if (!groups?.length) return basePrice;
  let price = basePrice;
  for (const g of groups) {
    const oid = selections[g.id];
    if (!oid) continue;
    const opt = g.options.find((o) => o.id === oid);
    if (!opt) continue;
    if (g.pricingMode === "absolute" && opt.price != null) {
      price = opt.price;
    } else {
      price += opt.priceDelta ?? 0;
    }
  }
  return price;
}

export function defaultVariantSelections(
  groups: ProductVariantGroup[] | undefined,
): VariantSelections {
  if (!groups?.length) return {};
  const out: VariantSelections = {};
  for (const g of groups) {
    const preferred =
      getVariantUiKind(g) === "storage"
        ? g.options.find((o) => o.label.includes("256")) ?? g.options[0]
        : g.options[0];
    if (preferred) out[g.id] = preferred.id;
  }
  return out;
}

/** Texto legible para carrito / WhatsApp */
export function describeVariantSelections(
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
): string[] {
  if (!groups?.length) return [];
  const parts: string[] = [];
  for (const g of groups) {
    const oid = selections[g.id];
    if (!oid) continue;
    const opt = g.options.find((o) => o.id === oid);
    if (opt) parts.push(`${g.label}: ${opt.label}`);
  }
  return parts;
}

/** Clave estable para una línea de carrito (mismo producto + distintas variantes = distintas líneas) */
export function cartLineKey(
  productId: string,
  selections?: VariantSelections,
): string {
  if (!selections || Object.keys(selections).length === 0) return productId;
  const keys = Object.keys(selections).sort();
  const payload = keys.map((k) => `${k}=${selections[k]}`).join("&");
  return `${productId}::${payload}`;
}
