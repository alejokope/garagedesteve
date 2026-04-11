import "server-only";

import { cache } from "react";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import type { Product } from "@/lib/data";
import type { CategoryImageDefault } from "@/lib/product-image-fallback";
import { applyProductCategoryImageFallback } from "@/lib/product-image-fallback";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Listado tienda / API / lookup PDP: todo lo que usa grilla y carrito, sin `detail` (JSON grande).
 * La ficha carga `detail` con {@link getPublishedProductForSite}.
 */
export const PUBLISHED_CATALOG_LIST_COLUMNS =
  "id,name,short,category,brand,price,stock_condition,badge,image,image_alt,variant_groups,compare_at_price,discount_percent,published,sort_order" as const;

async function fetchCategoryImageDefaultsMap(): Promise<Map<string, CategoryImageDefault>> {
  if (!hasSupabaseEnv()) return new Map();
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("product_categories")
      .select("id, label, default_image, default_image_alt")
      .eq("active", true);
    if (error || !data?.length) return new Map();
    const m = new Map<string, CategoryImageDefault>();
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      const id = String(row.id);
      const url = row.default_image != null ? String(row.default_image).trim() : "";
      if (!url) continue;
      const label = String(row.label ?? "");
      const altRaw = row.default_image_alt != null ? String(row.default_image_alt).trim() : "";
      m.set(id, { url, alt: altRaw || label });
    }
    return m;
  } catch {
    return new Map();
  }
}

const categoryImageDefaultsForRequest = cache(fetchCategoryImageDefaultsMap);

/**
 * Catálogo público: solo productos publicados en Supabase (sort_order, name).
 * Sin imagen en el producto → `product_categories.default_image` si existe.
 */
export async function loadPublishedProductsForSite(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const [productsRes, catMap] = await Promise.all([
      supabase
        .from("products")
        .select(PUBLISHED_CATALOG_LIST_COLUMNS)
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      categoryImageDefaultsForRequest(),
    ]);

    const { data, error } = productsRes;
    if (error || !data?.length) return [];

    return data.map((r) => {
      const p = productRowToProduct(productRowFromRecord(r as Record<string, unknown>));
      return applyProductCategoryImageFallback(p, catMap);
    });
  } catch {
    return [];
  }
}

/**
 * Misma lista que `loadPublishedProductsForSite`, deduplicada por request (RSC).
 */
export const cachedPublishedProductsForSite = cache(loadPublishedProductsForSite);

/** Mismo valor que `cachedPublishedProductsForSite` (nombre viejo; mantener por compat). */
export const listPublishedProductsForSite = cachedPublishedProductsForSite;

/** Una ficha: solo si existe publicado en Supabase. */
export async function getPublishedProductForSite(id: string): Promise<Product | undefined> {
  if (!hasSupabaseEnv()) return undefined;

  try {
    const supabase = await createSupabaseServerClient();
    const [productRes, catMap] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).eq("published", true).maybeSingle(),
      categoryImageDefaultsForRequest(),
    ]);

    const { data, error } = productRes;
    if (!error && data) {
      const p = productRowToProduct(productRowFromRecord(data as Record<string, unknown>));
      return applyProductCategoryImageFallback(p, catMap);
    }
  } catch {
    /* sin red o sin tablas */
  }

  return undefined;
}

/** Solo IDs publicados: evita cargar el catálogo entero (p. ej. `generateStaticParams`). */
export async function listPublishedProductIdsForSite(): Promise<string[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) return [];
    return data.map((row) => String((row as { id: string }).id));
  } catch {
    return [];
  }
}
