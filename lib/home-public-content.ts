import {
  homeFaq,
  homeServiceFeatures,
  homeServiceIntro,
  homeTestimonials,
  whyChooseItems,
} from "@/lib/home-content";
import { homeCategoryTiles, normalizeHomeCategoryTiles } from "@/lib/home-categories";
import type {
  HomeCategoriesData,
  HomeCtaFinalData,
  HomeFaqData,
  HomeHeroData,
  HomeServiceTechData,
  HomeTestimonialsData,
  HomeWhyChooseData,
} from "@/lib/home-types";

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

export type HomeContentKey = (typeof HOME_CONTENT_KEYS)[number];

/** Claves de la home editables en Contenido → Página de inicio (sin testimonios). */
export type HomeContentAdminKey = Exclude<HomeContentKey, "home.testimonials">;

export const HOME_CONTENT_ADMIN_KEYS: HomeContentAdminKey[] = HOME_CONTENT_KEYS.filter(
  (k): k is HomeContentAdminKey => k !== "home.testimonials",
);

/** `visible === false` en el payload de content_entries oculta el bloque en la home. */
export function mergeHomeModuleVisible(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return true;
  return (payload as { visible?: unknown }).visible !== false;
}

export const DEFAULT_HERO: HomeHeroData = {
  visible: true,
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
  imageSrc: "/home-hero.png",
  imageAlt: "MacBook, AirPods, iPhone y Apple Watch — ecosistema Apple",
};

export const DEFAULT_CATEGORIES: HomeCategoriesData = {
  visible: true,
  sectionTitle: "Nuestras categorías",
  sectionSubtitle:
    "Explorá nuestra amplia gama de productos Apple y servicios especializados",
  tiles: homeCategoryTiles,
};

export const DEFAULT_SERVICE: HomeServiceTechData = {
  visible: true,
  title: "Servicio técnico especializado",
  intro: homeServiceIntro,
  imageUrl:
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=88",
  imageAlt: "Técnico reparando un smartphone en banco de trabajo",
  features: homeServiceFeatures,
  ctaLabel: "Saber más sobre el servicio",
  ctaHref: "/servicio-tecnico",
};

export const DEFAULT_WHY: HomeWhyChooseData = {
  visible: true,
  sectionTitle: "Por qué elegirnos",
  sectionSubtitle:
    "Somos tu mejor opción para productos Apple y servicio técnico de calidad",
  items: whyChooseItems,
};

export const DEFAULT_TESTIMONIALS: HomeTestimonialsData = {
  visible: true,
  sectionTitle: "Lo que dicen nuestros clientes",
  sectionSubtitle:
    "Miles de clientes satisfechos confían en nosotros para sus dispositivos Apple",
  items: homeTestimonials,
};

export const DEFAULT_FAQ: HomeFaqData = {
  visible: true,
  sectionTitle: "Preguntas frecuentes",
  sectionSubtitle:
    "Resolvemos las dudas más comunes sobre nuestros productos y servicios",
  items: homeFaq,
};

export const DEFAULT_CTA: HomeCtaFinalData = {
  visible: true,
  title: "¿Listo para tu próximo equipo?",
  subtitle:
    "Unite a miles de clientes satisfechos que ya confían en nosotros para sus dispositivos Apple",
  primaryCta: { label: "Ver catálogo", href: "/tienda" },
  secondaryCta: { label: "Ver servicio técnico", href: "/servicio-tecnico" },
};

export function mergeHero(payload: unknown): HomeHeroData {
  if (!payload || typeof payload !== "object") return DEFAULT_HERO;
  const p = payload as Partial<HomeHeroData> & {
    imageSrcDesktop?: string;
    imageSrcMobile?: string;
  };
  const imageSrc =
    (typeof p.imageSrc === "string" && p.imageSrc.trim()) ||
    (typeof p.imageSrcDesktop === "string" && p.imageSrcDesktop.trim()) ||
    (typeof p.imageSrcMobile === "string" && p.imageSrcMobile.trim()) ||
    DEFAULT_HERO.imageSrc;
  return {
    ...DEFAULT_HERO,
    ...p,
    imageSrc,
    visible: mergeHomeModuleVisible(payload),
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

export function mergeCategories(payload: unknown): HomeCategoriesData {
  if (!payload || typeof payload !== "object") {
    return {
      ...DEFAULT_CATEGORIES,
      tiles: normalizeHomeCategoryTiles(DEFAULT_CATEGORIES.tiles),
    };
  }
  const p = payload as Partial<HomeCategoriesData>;
  const rawTiles =
    Array.isArray(p.tiles) && p.tiles.length > 0
      ? (p.tiles as HomeCategoriesData["tiles"])
      : DEFAULT_CATEGORIES.tiles;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_CATEGORIES.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_CATEGORIES.sectionSubtitle,
    visible: mergeHomeModuleVisible(payload),
    tiles: normalizeHomeCategoryTiles(rawTiles),
  };
}

export function mergeServiceTech(payload: unknown): HomeServiceTechData {
  if (!payload || typeof payload !== "object") return DEFAULT_SERVICE;
  const p = payload as Partial<HomeServiceTechData>;
  return {
    title: p.title ?? DEFAULT_SERVICE.title,
    intro: p.intro ?? DEFAULT_SERVICE.intro,
    imageUrl: p.imageUrl ?? DEFAULT_SERVICE.imageUrl,
    imageAlt: p.imageAlt ?? DEFAULT_SERVICE.imageAlt,
    visible: mergeHomeModuleVisible(payload),
    features:
      Array.isArray(p.features) && p.features.length > 0
        ? (p.features as HomeServiceTechData["features"])
        : DEFAULT_SERVICE.features,
    ctaLabel: p.ctaLabel ?? DEFAULT_SERVICE.ctaLabel,
    ctaHref: p.ctaHref ?? DEFAULT_SERVICE.ctaHref,
  };
}

export function mergeWhyChoose(payload: unknown): HomeWhyChooseData {
  if (!payload || typeof payload !== "object") return DEFAULT_WHY;
  const p = payload as Partial<HomeWhyChooseData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_WHY.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_WHY.sectionSubtitle,
    visible: mergeHomeModuleVisible(payload),
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeWhyChooseData["items"])
        : DEFAULT_WHY.items,
  };
}

export function mergeTestimonials(payload: unknown): HomeTestimonialsData {
  if (!payload || typeof payload !== "object") return DEFAULT_TESTIMONIALS;
  const p = payload as Partial<HomeTestimonialsData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_TESTIMONIALS.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_TESTIMONIALS.sectionSubtitle,
    visible: mergeHomeModuleVisible(payload),
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeTestimonialsData["items"])
        : DEFAULT_TESTIMONIALS.items,
  };
}

export function mergeFaq(payload: unknown): HomeFaqData {
  if (!payload || typeof payload !== "object") return DEFAULT_FAQ;
  const p = payload as Partial<HomeFaqData>;
  return {
    sectionTitle: p.sectionTitle ?? DEFAULT_FAQ.sectionTitle,
    sectionSubtitle: p.sectionSubtitle ?? DEFAULT_FAQ.sectionSubtitle,
    visible: mergeHomeModuleVisible(payload),
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? (p.items as HomeFaqData["items"])
        : DEFAULT_FAQ.items,
  };
}

export function mergeCtaFinal(payload: unknown): HomeCtaFinalData {
  if (!payload || typeof payload !== "object") return DEFAULT_CTA;
  const p = payload as Partial<HomeCtaFinalData>;
  return {
    title: p.title ?? DEFAULT_CTA.title,
    subtitle: p.subtitle ?? DEFAULT_CTA.subtitle,
    visible: mergeHomeModuleVisible(payload),
    primaryCta: p.primaryCta
      ? { ...DEFAULT_CTA.primaryCta, ...p.primaryCta }
      : DEFAULT_CTA.primaryCta,
    secondaryCta: p.secondaryCta
      ? { ...DEFAULT_CTA.secondaryCta, ...p.secondaryCta }
      : DEFAULT_CTA.secondaryCta,
  };
}

export function mergeFeaturedIds(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const ids = (payload as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return ids.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}
