import { NextResponse } from "next/server";

import { listProductCategoriesPublic } from "@/lib/backoffice/catalog-dictionaries-db";
import { loadPublishedProductsForSite } from "@/lib/site-products";

/** Evita respuestas cacheadas (CDN/navegador) con datos viejos al recargar o volver a la tienda. */
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export type CatalogProductsApiBody = {
  products: Awaited<ReturnType<typeof loadPublishedProductsForSite>>;
  categoryFilterOptions: { id: string; label: string }[];
};

/** Catálogo + categorías activas para filtros (misma fuente que Listas → Categorías). */
export async function GET() {
  try {
    const [products, categoryFilterOptions] = await Promise.all([
      loadPublishedProductsForSite(),
      listProductCategoriesPublic().catch(() => [] as { id: string; label: string }[]),
    ]);
    const body: CatalogProductsApiBody = { products, categoryFilterOptions };
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar el catálogo";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE });
  }
}
