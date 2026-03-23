import "server-only";

import { productRowFromRecord, productRowToProduct } from "@/lib/backoffice/products-db";
import {
  featuredProductIds,
  getFeaturedProducts,
  products,
  type Product,
} from "@/lib/data";
import {
  homeFaq,
  homeServiceFeatures,
  homeServiceIntro,
  homeTestimonials,
  whyChooseItems,
} from "@/lib/home-content";
import { homeCategoryTiles } from "@/lib/home-categories";
import type {
  HomeCategoriesData,
  HomeCtaFinalData,
  HomeFaqData,
  HomeHeroData,
  HomeServiceTechData,
  HomeTestimonialsData,
  HomeWhyChooseData,
} from "@/lib/home-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const HOME_CONTENT_KEYS = [
  "home.hero",
  "home.categories",
  "home.featured",
  "home.service_tech",
  "home.why_choose",
  "home.testimonials",
  "home.faq",
  "home.cta_final",
] as const;

const DEFAULT_HERO: HomeHeroData = {
  titleBefore: "Tecnología premium y soporte técnico",
  titleHighlight: "especializado",
  subtitle:
    "Descubrí la última tecnología Apple con garantía oficial y el respaldo de nuestro servicio técnico certificado. Más de 10 años llevando innovación a tus manos.",
  stats: [
    { value: "500+", label: "Clientes felices" },
    { value: "100%", label: "Original" },
    { value: "24/7", label: "Soporte" },
  ],
  primaryCta: { label: "Comenzar", href: "/tienda" },
  secondaryCta: { label: "Ver productos", href: "/tienda" },
  imageSrc: "/home-hero-reference.png",
  imageAlt: "iPhone — productos destacados",
};

const DEFAULT_CATEGORIES: HomeCategoriesData = {
  sectionTitle: "Nuestras categorías",
  sectionSubtitle:
    "Explorá nuestra amplia gama de productos Apple y servicios especializados",
  tiles: homeCategoryTiles,
};

const DEFAULT_SERVICE: HomeServiceTechData = {
  title: "Servicio técnico especializado",
  intro: homeServiceIntro,
  imageUrl:
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=88",
  imageAlt: "Técnico reparando un smartphone en banco de trabajo",
  features: homeServiceFeatures,
  ctaLabel: "Saber más sobre el servicio",
  ctaHref: "/#servicio-tecnico",
};

const DEFAULT_WHY: HomeWhyChooseData = {
  sectionTitle: "Por qué elegirnos",
  sectionSubtitle:
    "Somos tu mejor opción para productos Apple y servicio técnico de calidad",
  items: whyChooseItems,
};

const DEFAULT_TESTIMONIALS: HomeTestimonialsData = {
  sectionTitle: "Lo que dicen nuestros clientes",
  sectionSubtitle:
    "Miles de clientes satisfechos confían en nosotros para sus dispositivos Apple",
  items: homeTestimonials,
};

const DEFAULT_FAQ: HomeFaqData = {
  sectionTitle: "Preguntas frecuentes",
  sectionSubtitle:
    "Resolvemos las dudas más comunes sobre nuestros productos y servicios",
  items: homeFaq,
};

const DEFAULT_CTA: HomeCtaFinalData = {
  title: "¿Listo para tu próximo equipo?",
  subtitle:
    "Unite a miles de clientes satisfechos que ya confían en nosotros para sus dispositivos Apple",
  primaryCta: { label: "Ver catálogo", href: "/tienda" },
  secondaryCta: { label: "Ver servicio técnico", href: "/#servicio-tecnico" },
};

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

function mergeHero(payload: unknown): HomeHeroData {
  if (!payload || typeof payload !== "object") return DEFAULT_HERO;
  const p = payload as Partial<HomeHeroData>;
  return {
    ...DEFAULT_HERO,
    ...p,
    stats:
      Array.isArray(p.stats) && p.stats.length > 0 ? (p.stats as HomeHeroData["stats"]) : DEFAULT_HERO.stats,
    primaryCta: p.primaryCta
      ? { ...DEFAULT_HERO.primaryCta, ...p.primaryCta }
      : DEFAULT_HERO.primaryCta,
    secondaryCta: p.secondaryCta
      ? { ...DEFAULT_HERO.secondaryCta, ...p.secondaryCta }
      : DEFAULT_HERO.secondaryCta,
  };
}

function mergeCategories(payload: unknown): HomeCategoriesData {
  if (!payload || typeof payload !== "object") return DEFAULT_CATEGORIES;
  const p = payload as Partial<HomeCategoriesData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_CATEGORIES.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_CATEGORIES.sectionSubtitle,
    tiles:
      Array.isArray(p.tiles) && p.tiles.length > 0
        ? (p.tiles as HomeCategoriesData["tiles"])
        : DEFAULT_CATEGORIES.tiles,
  };
}

function mergeServiceTech(payload: unknown): HomeServiceTechData {
  if (!payload || typeof payload !== "object") return DEFAULT_SERVICE;
  const p = payload as Partial<HomeServiceTechData>;
  return {
    title: p.title ?? DEFAULT_SERVICE.title,
    intro: p.intro ?? DEFAULT_SERVICE.intro,
    imageUrl: p.imageUrl ?? DEFAULT_SERVICE.imageUrl,
    imageAlt: p.imageAlt ?? DEFAULT_SERVICE.imageAlt,
    features:
      Array.isArray(p.features) && p.features.length > 0
        ? (p.features as HomeServiceTechData["features"])
        : DEFAULT_SERVICE.features,
    ctaLabel: p.ctaLabel ?? DEFAULT_SERVICE.ctaLabel,
    ctaHref: p.ctaHref ?? DEFAULT_SERVICE.ctaHref,
  };
}

function mergeWhyChoose(payload: unknown): HomeWhyChooseData {
  if (!payload || typeof payload !== "object") return DEFAULT_WHY;
  const p = payload as Partial<HomeWhyChooseData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_WHY.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_WHY.sectionSubtitle,
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeWhyChooseData["items"])
        : DEFAULT_WHY.items,
  };
}

function mergeTestimonials(payload: unknown): HomeTestimonialsData {
  if (!payload || typeof payload !== "object") return DEFAULT_TESTIMONIALS;
  const p = payload as Partial<HomeTestimonialsData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_TESTIMONIALS.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_TESTIMONIALS.sectionSubtitle,
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeTestimonialsData["items"])
        : DEFAULT_TESTIMONIALS.items,
  };
}

function mergeFaq(payload: unknown): HomeFaqData {
  if (!payload || typeof payload !== "object") return DEFAULT_FAQ;
  const p = payload as Partial<HomeFaqData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_FAQ.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_FAQ.sectionSubtitle,
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeFaqData["items"])
        : DEFAULT_FAQ.items,
  };
}

function mergeCtaFinal(payload: unknown): HomeCtaFinalData {
  if (!payload || typeof payload !== "object") return DEFAULT_CTA;
  const p = payload as Partial<HomeCtaFinalData>;
  return {
    title: p.title ?? DEFAULT_CTA.title,
    subtitle: p.subtitle ?? DEFAULT_CTA.subtitle,
    primaryCta: p.primaryCta
      ? { ...DEFAULT_CTA.primaryCta, ...p.primaryCta }
      : DEFAULT_CTA.primaryCta,
    secondaryCta: p.secondaryCta
      ? { ...DEFAULT_CTA.secondaryCta, ...p.secondaryCta }
      : DEFAULT_CTA.secondaryCta,
  };
}

function mergeFeaturedIds(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [...featuredProductIds];
  const ids = (payload as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || ids.length === 0) return [...featuredProductIds];
  const out = ids.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return out.length > 0 ? out : [...featuredProductIds];
}

async function resolveFeaturedProducts(ids: string[]): Promise<Product[]> {
  const staticById = new Map(products.map((p) => [p.id, p]));

  if (!hasSupabaseEnv()) {
    const only = ids.map((id) => staticById.get(id)).filter((p): p is Product => p != null);
    return only.length > 0 ? only : getFeaturedProducts();
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("published", true);
    if (error || !data?.length) {
      const hybrid = ids.map((id) => staticById.get(id)).filter((p): p is Product => p != null);
      return hybrid.length > 0 ? hybrid : getFeaturedProducts();
    }
    const fromDb = new Map(
      data.map((r) => {
        const row = productRowFromRecord(r as Record<string, unknown>);
        return [row.id, productRowToProduct(row)] as const;
      }),
    );
    const ordered = ids
      .map((id) => fromDb.get(id) ?? staticById.get(id))
      .filter((p): p is Product => p != null);
    return ordered.length > 0 ? ordered : getFeaturedProducts();
  } catch {
    const hybrid = ids.map((id) => staticById.get(id)).filter((p): p is Product => p != null);
    return hybrid.length > 0 ? hybrid : getFeaturedProducts();
  }
}

export type HomePageData = {
  hero: HomeHeroData;
  categories: HomeCategoriesData;
  featured: Product[];
  serviceTech: HomeServiceTechData;
  whyChoose: HomeWhyChooseData;
  testimonials: HomeTestimonialsData;
  faq: HomeFaqData;
  ctaFinal: HomeCtaFinalData;
};

/** Lee `content_entries` (anon) y productos publicados; si falla, usa `lib/data` y `lib/home-content`. */
export async function getHomePageData(): Promise<HomePageData> {
  const entries = await fetchContentMap(HOME_CONTENT_KEYS);
  const featuredIds = mergeFeaturedIds(entries.get("home.featured"));
  const featured = await resolveFeaturedProducts(featuredIds);

  return {
    hero: mergeHero(entries.get("home.hero")),
    categories: mergeCategories(entries.get("home.categories")),
    featured,
    serviceTech: mergeServiceTech(entries.get("home.service_tech")),
    whyChoose: mergeWhyChoose(entries.get("home.why_choose")),
    testimonials: mergeTestimonials(entries.get("home.testimonials")),
    faq: mergeFaq(entries.get("home.faq")),
    ctaFinal: mergeCtaFinal(entries.get("home.cta_final")),
  };
}
