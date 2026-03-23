import { HomeCategoriesGrid } from "@/app/components/home-categories-grid";
import { HomeCtaFinal } from "@/app/components/home-cta-final";
import { HomeFaq } from "@/app/components/home-faq";
import { HomeFeaturedGrid } from "@/app/components/home-featured-grid";
import { HomeHero } from "@/app/components/home-hero";
import { HomeServiceTech } from "@/app/components/home-service-tech";
import { HomeTestimonials } from "@/app/components/home-testimonials";
import { HomeWhyChoose } from "@/app/components/home-why-choose";
import { SiteFooter } from "@/app/components/site-footer";
import { getFeaturedProducts } from "@/lib/data";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <HomeHero />
      <HomeCategoriesGrid />
      <HomeFeaturedGrid products={featured} />
      <HomeServiceTech />
      <HomeWhyChoose />
      <HomeTestimonials />
      <HomeFaq />
      <HomeCtaFinal />
      <SiteFooter />
    </main>
  );
}
