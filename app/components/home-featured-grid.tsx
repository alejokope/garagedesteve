import Link from "next/link";
import { FeaturedProductCard } from "@/app/components/featured-product-card";
import type { Product } from "@/lib/data";

export function HomeFeaturedGrid({ products }: { products: Product[] }) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Productos destacados
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            Los últimos modelos con garantía oficial y los mejores precios del
            mercado
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <FeaturedProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/tienda"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
