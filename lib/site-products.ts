import "server-only";

import { cache } from "react";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import type { Product } from "@/lib/data";
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

/**
 * Catálogo público: solo productos publicados en Supabase (sort_order, name).
 */
export async function loadPublishedProductsForSite(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PUBLISHED_CATALOG_LIST_COLUMNS)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data?.length) return [];

    return data.map((r) =>
      productRowToProduct(productRowFromRecord(r as Record<string, unknown>)),
    );
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
