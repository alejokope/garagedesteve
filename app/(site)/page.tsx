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

export const revalidate = 60;

export default async function HomePage() {
  const home = await getHomePageData();

  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <HomeHero data={home.hero} />
      <ScrollReveal>
        <HomeCategoriesGrid data={home.categories} />
      </ScrollReveal>
      <ScrollReveal delayMs={40}>
        <HomeFeaturedGrid products={home.featured} />
      </ScrollReveal>
      <ScrollReveal delayMs={20}>
        <HomeServiceTech data={home.serviceTech} />
      </ScrollReveal>
      <ScrollReveal>
        <HomeWhyChoose data={home.whyChoose} />
      </ScrollReveal>
      <ScrollReveal delayMs={30}>
        <HomeTestimonials data={home.testimonials} />
      </ScrollReveal>
      <ScrollReveal>
        <HomeFaq data={home.faq} />
      </ScrollReveal>
      <ScrollReveal delayMs={50}>
        <HomeCtaFinal data={home.ctaFinal} />
      </ScrollReveal>
      <SiteFooter />
    </main>
  );
}
