import type { Product } from "@/lib/data";

function parseGalleryImagesRaw(raw: unknown): string[] {
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

/** URLs extra del carrusel (no incluye `image`). */
export function productGalleryExtras(p: Pick<Product, "galleryImages">): string[] {
  return parseGalleryImagesRaw(p.galleryImages);
}

/**
 * Orden del carrusel en tienda: primero `image`, después extras sin duplicar la principal.
 */
export function productCarouselUrls(p: Pick<Product, "image" | "galleryImages">): string[] {
  const main = (p.image ?? "").trim();
  const extras = productGalleryExtras(p).filter((u) => u !== main);
  if (main) return [main, ...extras];
  return extras;
}
