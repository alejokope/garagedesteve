import { Suspense } from "react";
import { CatalogView } from "@/app/components/catalog/catalog-view";
import { SiteRouteLoading } from "@/app/components/site/site-route-loading";
import { SiteFooter } from "@/app/components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de productos | The iPhone",
  description:
    "Descubrí nuestra selección premium de tecnología. iPhone, iPad, Mac, Apple Watch, AirPods y más.",
};

function CatalogSectionFallback() {
  return (
    <div id="catalogo" className="scroll-mt-24 bg-[#f3f4f6] px-4 py-10 sm:px-8">
      <SiteRouteLoading />
    </div>
  );
}

/** Catálogo: los datos vienen de `CatalogProductsProvider` + GET /api/catalog/products (una sola carga). */
export default function Page() {
  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Catálogo de Productos
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            Descubre nuestra selección premium de tecnología
          </p>
        </div>
      </section>
      <Suspense fallback={<CatalogSectionFallback />}>
        <CatalogView />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
