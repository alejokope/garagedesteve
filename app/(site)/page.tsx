import { HomeCategoriesGrid } from "@/app/components/home-categories-grid";
import { HomeCtaFinal } from "@/app/components/home-cta-final";
import { HomeFaq } from "@/app/components/home-faq";
import { HomeFeaturedGrid } from "@/app/components/home-featured-grid";
import { HomeHero } from "@/app/components/home-hero";
import { HomeServiceTech } from "@/app/components/home-service-tech";
import { HomeTestimonials } from "@/app/components/home-testimonials";
import { HomeWhyChoose } from "@/app/components/home-why-choose";
import { SiteFooter } from "@/app/components/site-footer";
import { getHomePageData } from "@/lib/home-content-server";

export const revalidate = 60;

export default async function HomePage() {
  const home = await getHomePageData();

  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <HomeHero data={home.hero} />
      <HomeCategoriesGrid data={home.categories} />
      <HomeFeaturedGrid products={home.featured} />
      <HomeServiceTech data={home.serviceTech} />
      <HomeWhyChoose data={home.whyChoose} />
      <HomeTestimonials data={home.testimonials} />
      <HomeFaq data={home.faq} />
      <HomeCtaFinal data={home.ctaFinal} />
      <SiteFooter />
    </main>
  );
}
