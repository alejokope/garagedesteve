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
  /**
   * Índice 0-based en el carrusel del producto (`image` + `galleryImages`) que representa este color.
   * Si hay `imageUrls` legados, se ignoran índices y prevalece el legado en tienda.
   */
  carouselIndex?: number | null;
  /** Varias fotos del mismo color (ficha + miniaturas). */
  imageUrls?: string[];
  /** Compatibilidad: una sola URL; preferí `imageUrls`. */
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
  /**
   * Opción preseleccionada al abrir la ficha (debe existir en `options`). Útil para color por defecto.
   */
  defaultOptionId?: string;
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

/** URLs de imágenes de una opción (nuevo `imageUrls` o legado `imageUrl`). */
export function optionVariantImageUrls(opt: ProductVariantOption): string[] {
  const raw = opt.imageUrls?.filter((u) => typeof u === "string" && u.trim()) ?? [];
  if (raw.length) return [...new Set(raw.map((u) => u.trim()))];
  const legacy = opt.imageUrl?.trim();
  return legacy ? [legacy] : [];
}

/** Selección: groupId → optionId */
export type VariantSelections = Record<string, string>;

/**
 * Primera URL de imagen según la selección: recorre grupos en orden; usa la primera opción elegida con fotos.
 * Si ninguna tiene fotos, devuelve `baseImage` (típicamente la imagen principal del producto).
 * Con `productCarousel` (orden ficha: principal + extras), los grupos **color** usan `carouselIndex` si no hay URLs legadas.
 */
export function resolveVariantPrimaryImageUrl(
  baseImage: string,
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
  productCarousel?: string[],
): string {
  const trimmedCarousel = (productCarousel ?? [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);
  const slides =
    trimmedCarousel.length > 0
      ? trimmedCarousel
      : baseImage?.trim()
        ? [baseImage.trim()]
        : [];
  const fallback = baseImage?.trim() ?? "";
  if (!groups?.length) return fallback;
  for (const g of groups) {
    const oid = selections[g.id];
    if (!oid) continue;
    const opt = g.options.find((o) => o.id === oid);
    if (!opt) continue;
    const urls = optionVariantImageUrls(opt);
    const first = urls[0]?.trim();
    if (first) return first;
    if (getVariantUiKind(g) === "color" && slides.length) {
      const raw = opt.carouselIndex;
      const idx =
        typeof raw === "number" &&
        Number.isInteger(raw) &&
        raw >= 0 &&
        raw < slides.length
          ? raw
          : 0;
      return slides[idx] ?? fallback;
    }
  }
  return fallback;
}

/**
 * Todas las fotos del carrusel para el color elegido: URLs propias de la opción (legado) o el carrusel del producto.
 */
export function colorVariantGalleryUrls(
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
  productCarousel: string[],
): string[] {
  if (!groups?.length) return [];
  for (const g of groups) {
    if (getVariantUiKind(g) !== "color") continue;
    const oid = selections[g.id];
    if (!oid) continue;
    const opt = g.options.find((o) => o.id === oid);
    const urls = opt ? optionVariantImageUrls(opt) : [];
    if (urls.length) return urls;
    return productCarousel.length ? productCarousel : [];
  }
  return [];
}

/** Índice inicial del carrusel al elegir color (sin legado `imageUrls`). */
export function resolveColorCarouselHeroIndex(
  groups: ProductVariantGroup[] | undefined,
  selections: VariantSelections,
  carouselLength: number,
): number {
  if (!groups?.length || carouselLength <= 0) return 0;
  for (const g of groups) {
    if (getVariantUiKind(g) !== "color") continue;
    const oid = selections[g.id];
    if (!oid) continue;
    const opt = g.options.find((o) => o.id === oid);
    if (!opt) return 0;
    if (optionVariantImageUrls(opt).length) return 0;
    const raw = opt.carouselIndex;
    if (
      typeof raw === "number" &&
      Number.isInteger(raw) &&
      raw >= 0 &&
      raw < carouselLength
    ) {
      return raw;
    }
    return 0;
  }
  return 0;
}

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
    const explicit =
      g.defaultOptionId && g.options.some((o) => o.id === g.defaultOptionId)
        ? g.options.find((o) => o.id === g.defaultOptionId)
        : undefined;
    const preferred =
      explicit ??
      (getVariantUiKind(g) === "storage"
        ? (g.options.find((o) => o.label.includes("256")) ?? g.options[0])
        : g.options[0]);
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
