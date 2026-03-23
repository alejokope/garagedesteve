import type { FaqItem, HomeServiceFeature, Testimonial } from "@/lib/home-content";
import type { HomeCategoryTile } from "@/lib/home-categories";

export type HomeHeroData = {
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
  sectionTitle: string;
  sectionSubtitle: string;
  tiles: HomeCategoryTile[];
};

export type HomeServiceTechData = {
  title: string;
  intro: string;
  imageUrl: string;
  imageAlt: string;
  features: HomeServiceFeature[];
  ctaLabel: string;
  ctaHref: string;
};

export type HomeWhyChooseData = {
  sectionTitle: string;
  sectionSubtitle: string;
  items: {
    title: string;
    body: string;
    highlight?: boolean;
  }[];
};

export type HomeTestimonialsData = {
  sectionTitle: string;
  sectionSubtitle: string;
  items: Testimonial[];
};

export type HomeFaqData = {
  sectionTitle: string;
  sectionSubtitle: string;
  items: FaqItem[];
};

export type HomeCtaFinalData = {
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};
