import { HomeCategoriesGrid } from "@/app/components/home-categories-grid";
import { HomeCtaFinal } from "@/app/components/home-cta-final";
import { HomeFaq } from "@/app/components/home-faq";
import { HomeFeaturedGrid } from "@/app/components/home-featured-grid";
import { HomeHero } from "@/app/components/home-hero";
import { HomeServiceTech } from "@/app/components/home-service-tech";
import { HomeTestimonials } from "@/app/components/home-testimonials";
import { HomeWhyChoose } from "@/app/components/home-why-choose";
import { ScrollReveal } from "@/app/components/scroll-reveal";
import { SiteFooter } from "@/app/components/site-footer";
import { getHomePageData } from "@/lib/home-content-server";

/** Sin ISR (caché fija en dev con `revalidate` > 0). Literal exigido por Next. */
export const revalidate = 0;

export default async function HomePage() {
  const home = await getHomePageData();

  return (
    <main className="min-h-screen pt-[calc(3.25rem+env(safe-area-inset-top))] sm:pt-16">
      {home.hero.visible ? <HomeHero data={home.hero} /> : null}
      {home.categories.visible ? (
        <ScrollReveal>
          <HomeCategoriesGrid data={home.categories} />
        </ScrollReveal>
      ) : null}
      {home.featured.visible ? (
        <ScrollReveal delayMs={40} className="w-full min-w-0">
          <HomeFeaturedGrid products={home.featured.products} />
        </ScrollReveal>
      ) : null}
      {home.serviceTech.visible ? (
        <ScrollReveal delayMs={20}>
          <HomeServiceTech data={home.serviceTech} />
        </ScrollReveal>
      ) : null}
      {home.whyChoose.visible ? (
        <ScrollReveal>
          <HomeWhyChoose data={home.whyChoose} />
        </ScrollReveal>
      ) : null}
      {home.testimonials.visible ? (
        <ScrollReveal delayMs={30}>
          <HomeTestimonials data={home.testimonials} />
        </ScrollReveal>
      ) : null}
      {home.faq.visible ? (
        <ScrollReveal>
          <HomeFaq data={home.faq} />
        </ScrollReveal>
      ) : null}
      {home.ctaFinal.visible ? (
        <ScrollReveal delayMs={50}>
          <HomeCtaFinal data={home.ctaFinal} />
        </ScrollReveal>
      ) : null}
      <SiteFooter />
    </main>
  );
}
