import "server-only";

import { cache } from "react";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import { getProductById, products, type Product } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Catálogo público: productos publicados en Supabase (orden sort_order, name)
 * más los que solo existen en `lib/data` (migración gradual).
 */
export async function loadPublishedProductsForSite(): Promise<Product[]> {
  const staticList = products;
  if (!hasSupabaseEnv()) return staticList;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) return staticList;

    const dbProducts = data.map((r) =>
      productRowToProduct(productRowFromRecord(r as Record<string, unknown>)),
    );
    const dbIds = new Set(dbProducts.map((p) => p.id));
    const staticExtras = staticList.filter((p) => !dbIds.has(p.id));
    return [...dbProducts, ...staticExtras];
  } catch {
    return staticList;
  }
}

/**
 * Misma lista que `loadPublishedProductsForSite`, deduplicada por request (RSC).
 */
export const cachedPublishedProductsForSite = cache(loadPublishedProductsForSite);

/** Mismo valor que `cachedPublishedProductsForSite` (nombre viejo; mantener por compat). */
export const listPublishedProductsForSite = cachedPublishedProductsForSite;

/** Una ficha: prioriza fila publicada en Supabase, si no existe usa `lib/data`. */
export async function getPublishedProductForSite(id: string): Promise<Product | undefined> {
  if (!hasSupabaseEnv()) return getProductById(id);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();

    if (!error && data) {
      return productRowToProduct(productRowFromRecord(data as Record<string, unknown>));
    }
  } catch {
    /* fallback estático */
  }

  return getProductById(id);
}

export async function listPublishedProductIdsForSite(): Promise<string[]> {
  const list = await cachedPublishedProductsForSite();
  return list.map((p) => p.id);
}
