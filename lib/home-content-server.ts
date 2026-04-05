import "server-only";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import type { Product } from "@/lib/data";
import {
  HOME_CONTENT_KEYS,
  mergeCategories,
  mergeCtaFinal,
  mergeFaq,
  mergeFeaturedIds,
  mergeHero,
  mergeHomeModuleVisible,
  mergeServiceTech,
  mergeTestimonials,
  mergeWhyChoose,
} from "@/lib/home-public-content";
import type { HomePageData } from "@/lib/home-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export { HOME_CONTENT_KEYS } from "@/lib/home-public-content";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function fetchContentMap(keys: readonly string[]): Promise<Map<string, unknown>> {
  const map = new Map<string, unknown>();
  if (!hasSupabaseEnv()) return map;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_entries")
      .select("key,payload")
      .in("key", [...keys]);
    if (error) return map;
    for (const row of data ?? []) {
      const r = row as { key?: string; payload?: unknown };
      if (r.key) map.set(r.key, r.payload);
    }
  } catch {
    /* sin red o sin tablas */
  }
  return map;
}

async function resolveFeaturedProducts(ids: string[]): Promise<Product[]> {
  if (!hasSupabaseEnv() || ids.length === 0) return [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("published", true);
    if (error || !data?.length) return [];

    const fromDb = new Map(
      data.map((r) => {
        const row = productRowFromRecord(r as Record<string, unknown>);
        return [row.id, productRowToProduct(row)] as const;
      }),
    );
    return ids.map((id) => fromDb.get(id)).filter((p): p is Product => p != null);
  } catch {
    return [];
  }
}

/** Lee `content_entries` (anon) y productos publicados; si falla, usa `lib/data` y `lib/home-content`. */
export async function getHomePageData(): Promise<HomePageData> {
  const entries = await fetchContentMap(HOME_CONTENT_KEYS);
  const featuredRaw = entries.get("home.featured");
  const featuredVisible = mergeHomeModuleVisible(featuredRaw);
  const featuredIds = mergeFeaturedIds(featuredRaw);
  const featuredProducts = featuredVisible ? await resolveFeaturedProducts(featuredIds) : [];

  return {
    hero: mergeHero(entries.get("home.hero")),
    categories: mergeCategories(entries.get("home.categories")),
    featured: { visible: featuredVisible, products: featuredProducts },
    serviceTech: mergeServiceTech(entries.get("home.service_tech")),
    whyChoose: mergeWhyChoose(entries.get("home.why_choose")),
    testimonials: mergeTestimonials(entries.get("home.testimonials")),
    faq: mergeFaq(entries.get("home.faq")),
    ctaFinal: mergeCtaFinal(entries.get("home.cta_final")),
  };
}

