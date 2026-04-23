import type { SellableVariant } from "./sellable-variants";
import type { ProductVariantGroup } from "./product-variants";

export type CategoryId =
  | "mac"
  | "ipad"
  | "iphone"
  | "watch"
  | "audio"
  | "desktop"
  | "servicio"
  | "otros"
  | "consolas"
  | "smartphones"
  | "tablets";

/** Condición de publicación: equipo nuevo o usado (servicios / sin clasificar: omitir). */
export type ProductStockCondition = "new" | "used";

export type Product = {
  id: string;
  name: string;
  short: string;
  /** Slug alineado a `product_categories.id` en Supabase. */
  category: string;
  /** Marca comercial (ej. Apple, JBL); opcional. */
  brand?: string;
  /** Precio orientativo en USD — el cliente confirma por WhatsApp */
  price: number;
  /** Nuevo o usado; se persiste como `stock_condition` en Supabase. */
  condition?: ProductStockCondition;
  badge?: string;
  image: string;
  imageAlt: string;
  /** URLs extra del carrusel (además de `image`); orden = galería en ficha. */
  galleryImages?: string[];
  /**
   * Características seleccionables (color, almacenamiento, etc.).
   * Mismo shape que puede devolver un BO en el futuro.
   */
  variantGroups?: ProductVariantGroup[];
  /**
   * Combinaciones que realmente existen (capacidad+color+…). Vacío/absente = todas
   * las mezclas de `variantGroups` (comportamiento anterior).
   */
  sellableVariants?: SellableVariant[];
  /** JSONB `detail` desde Supabase (ficha larga); si falta, se usa `lib/product-detail-data`. */
  detail?: unknown;
  /** Promoción real desde Supabase (precio tachado + %). Sin datos → no se muestra oferta. */
  compareAtPrice?: number | null;
  discountPercent?: number | null;
};

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "mac", label: "MacBook" },
  { id: "ipad", label: "iPad" },
  { id: "iphone", label: "iPhone" },
  { id: "watch", label: "Apple Watch" },
  { id: "audio", label: "Audio" },
  { id: "desktop", label: "iMac" },
  { id: "servicio", label: "Servicio técnico" },
  { id: "otros", label: "Otros" },
  { id: "consolas", label: "Consolas y gaming" },
  { id: "smartphones", label: "Celulares" },
  { id: "tablets", label: "Tablets" },
];

/** Catálogo solo desde Supabase; sin datos de respaldo en código. */
export const products: Product[] = [];

export const trustPoints = [
  { title: "Stock verificado", desc: "Equipos nuevos sellados y usados premium revisados." },
  { title: "Servicio técnico", desc: "Especialistas en ecosistema Apple y más marcas." },
  { title: "Compra guiada", desc: "Cerramos precio, pago y retiro por WhatsApp, sin vueltas." },
];

/** Por defecto vacío: los destacados se definen en `content_entries` → home.featured. */
export const featuredProductIds: readonly string[] = [];

export function getFeaturedProducts(): Product[] {
  return [];
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAllProductIds(): string[] {
  return products.map((p) => p.id);
}
