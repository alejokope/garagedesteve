import type { Product } from "@/lib/data";

const GENERIC_FALLBACK = {
  image: "https://images.unsplash.com/photo-14919333824374-121287b29b84?w=800&q=85",
  imageAlt: "Productos",
} as const;

export type CategoryImageDefault = { url: string; alt: string };

/** Si el producto no tiene imagen, usa la de la categoría (mapa) o un placeholder genérico. */
export function applyProductCategoryImageFallback(
  product: Product,
  categoryDefaults: Map<string, CategoryImageDefault>,
): Product {
  if (product.image?.trim()) return product;
  const d = categoryDefaults.get(product.category);
  if (d?.url?.trim()) {
    return {
      ...product,
      image: d.url.trim(),
      imageAlt: (product.imageAlt?.trim() || d.alt.trim() || product.name).trim() || product.name,
    };
  }
  return {
    ...product,
    image: GENERIC_FALLBACK.image,
    imageAlt: (product.imageAlt?.trim() || GENERIC_FALLBACK.imageAlt).trim(),
  };
}
