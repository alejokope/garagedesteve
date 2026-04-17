/**
 * Tipos y mapeo de fila `products` sin `server-only`: seguro para importar desde Client Components.
 */
import type { Product } from "@/lib/data";
import type { ProductVariantGroup } from "@/lib/product-variants";
import { parseSellableVariants } from "@/lib/sellable-variants";

export function parseGalleryImagesColumn(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const t = x.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export type ProductRow = {
  id: string;
  name: string;
  short: string;
  category: string;
  brand: string | null;
  price: number;
  stock_condition: string | null;
  badge: string | null;
  image: string;
  image_alt: string;
  /** JSON array en BD (`gallery_images`). */
  gallery_images: unknown;
  variant_groups: unknown;
  sellable_variants: unknown;
  detail: unknown | null;
  compare_at_price: number | null;
  discount_percent: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Para la tienda pública: fila → tipo `Product` del sitio. */
export function productRowToProduct(row: ProductRow): Product {
  const condition =
    row.stock_condition === "new" || row.stock_condition === "used"
      ? row.stock_condition
      : undefined;
  const sellableVariants = parseSellableVariants(row.sellable_variants);
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    category: row.category,
    ...(row.brand ? { brand: row.brand } : {}),
    price: row.price,
    condition,
    badge: row.badge ?? undefined,
    image: row.image,
    imageAlt: row.image_alt,
    galleryImages: parseGalleryImagesColumn(row.gallery_images),
    variantGroups: Array.isArray(row.variant_groups)
      ? (row.variant_groups as ProductVariantGroup[])
      : undefined,
    ...(sellableVariants.length ? { sellableVariants } : {}),
    detail: row.detail ?? undefined,
    compareAtPrice: row.compare_at_price,
    discountPercent: row.discount_percent,
  };
}
