import { NextResponse } from "next/server";

import type { Product } from "@/lib/data";
import {
  getCachedCatalogProductsApi,
  PUBLISHED_CATALOG_REVALIDATE_SECONDS,
} from "@/lib/published-catalog-cache";

const CACHE_HEADERS = {
  "Cache-Control": `public, max-age=0, s-maxage=${PUBLISHED_CATALOG_REVALIDATE_SECONDS}, stale-while-revalidate=600`,
} as const;

export type CatalogProductsApiBody = {
  products: Product[];
  categoryFilterOptions: { id: string; label: string }[];
};

/** Catálogo + categorías activas para filtros (misma fuente que Listas → Categorías). */
export async function GET() {
  try {
    const body = await getCachedCatalogProductsApi();
    return NextResponse.json(body satisfies CatalogProductsApiBody, { headers: CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar el catálogo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
