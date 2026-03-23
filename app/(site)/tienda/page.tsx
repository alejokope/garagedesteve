import { Suspense } from "react";
import { CategoryShowcase } from "@/app/components/category-showcase";
import { ProductCatalog } from "@/app/components/product-catalog";
import { SiteFooter } from "@/app/components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda | El Garage de Steve",
  description:
    "Catálogo de MacBook, iPhone, iPad, Apple Watch, AirPods, iMac, servicio técnico y más. Pedidos por WhatsApp.",
};

function CatalogFallback() {
  return (
    <section className="border-t border-black/[0.06] py-16">
      <div className="mx-auto max-w-6xl animate-pulse px-5 sm:px-8">
        <div className="h-8 w-48 rounded-full bg-neutral-200" />
        <div className="mt-6 h-4 max-w-md rounded-full bg-neutral-100" />
        <div className="mt-10 flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-neutral-100" />
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-neutral-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TiendaPage() {
  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[var(--surface)] py-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,113,108,0.08),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
            Tienda
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            Catálogo
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-600">
            Explorá por categoría, agregá al carrito y enviá el pedido por
            WhatsApp con el detalle armado.
          </p>
        </div>
      </section>
      <CategoryShowcase />
      <Suspense fallback={<CatalogFallback />}>
        <ProductCatalog basePath="/tienda" />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
