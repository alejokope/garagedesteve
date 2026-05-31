import "server-only";

import { unstable_cache, updateTag } from "next/cache";

import { listProductCategoriesPublic } from "@/lib/backoffice/catalog-dictionaries-db";
import { loadFlatDeviceCatalog, type FlatDeviceCatalog } from "@/lib/bot/flat-device-catalog";
import { loadPublishedProductsForSite } from "@/lib/site-products";

/** Tienda / GET /api/catalog/products — refresco periódico corto. */
export const PUBLISHED_CATALOG_CACHE_TAG = "published-catalog";
export const PUBLISHED_CATALOG_REVALIDATE_SECONDS = 120;

/** GET /api/items (Prometheo) — catálogo plano; TTL largo e invalidación solo desde el BO. */
export const FLAT_DEVICE_CATALOG_CACHE_TAG = "flat-device-catalog";
export const FLAT_DEVICE_CATALOG_REVALIDATE_SECONDS = 60 * 60;

export const getCachedFlatDeviceCatalog = unstable_cache(
  async (): Promise<FlatDeviceCatalog> => loadFlatDeviceCatalog(),
  ["flat-device-catalog-v5"],
  {
    revalidate: FLAT_DEVICE_CATALOG_REVALIDATE_SECONDS,
    tags: [FLAT_DEVICE_CATALOG_CACHE_TAG],
  },
);

export const getCachedCatalogProductsApi = unstable_cache(
  async () => {
    const [products, categoryFilterOptions] = await Promise.all([
      loadPublishedProductsForSite(),
      listProductCategoriesPublic().catch(() => [] as { id: string; label: string }[]),
    ]);
    return { products, categoryFilterOptions };
  },
  ["catalog-products-api-v2"],
  {
    revalidate: PUBLISHED_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLISHED_CATALOG_CACHE_TAG],
  },
);

/** Llamar al crear, editar, publicar/despublicar o eliminar productos en el BO. */
export function revalidatePublishedCatalogCache(): void {
  updateTag(PUBLISHED_CATALOG_CACHE_TAG);
  updateTag(FLAT_DEVICE_CATALOG_CACHE_TAG);
}
