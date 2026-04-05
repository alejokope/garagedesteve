import type { Product } from "@/lib/data";
import type { FaqItem, HomeServiceFeature, Testimonial } from "@/lib/home-content";
import type { HomeCategoryTile } from "@/lib/home-categories";

/** Si `visible` es false, el bloque no se renderiza en la home pública. */
export type HomeHeroData = {
  visible: boolean;
  titleBefore: string;
  titleHighlight: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imageSrc: string;
  imageAlt: string;
};

export type HomeCategoriesData = {
  visible: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  tiles: HomeCategoryTile[];
};

export type HomeServiceTechData = {
  visible: boolean;
  title: string;
  intro: string;
  imageUrl: string;
  imageAlt: string;
  features: HomeServiceFeature[];
  ctaLabel: string;
  ctaHref: string;
};

export type HomeWhyChooseData = {
  visible: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  items: {
    title: string;
    body: string;
    highlight?: boolean;
  }[];
};

export type HomeTestimonialsData = {
  visible: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  items: Testimonial[];
};

export type HomeFaqData = {
  visible: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  items: FaqItem[];
};

export type HomeCtaFinalData = {
  visible: boolean;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type HomePageData = {
  hero: HomeHeroData;
  categories: HomeCategoriesData;
  featured: { visible: boolean; products: Product[] };
  serviceTech: HomeServiceTechData;
  whyChoose: HomeWhyChooseData;
  testimonials: HomeTestimonialsData;
  faq: HomeFaqData;
  ctaFinal: HomeCtaFinalData;
};
