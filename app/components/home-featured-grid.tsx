import Link from "next/link";

import { HomeFeaturedGridDynamic } from "@/app/components/home-featured-grid-dynamic";
import type { Product } from "@/lib/data";

export function HomeFeaturedGrid({ products }: { products: Product[] }) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-left sm:text-center">
          <h2 className="font-display text-[1.375rem] font-semibold leading-snug tracking-tight text-neutral-950 sm:text-3xl">
            Productos destacados
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-500 sm:mt-3 sm:text-base">
            Los últimos modelos con garantía oficial y los mejores precios del
            mercado
          </p>
        </div>

        <div className="mt-8 sm:mt-12">
          <HomeFeaturedGridDynamic products={products} />
        </div>
        <p className="mt-3 text-center text-xs font-medium tracking-wide text-neutral-400 sm:hidden">
          Deslizá para ver más
        </p>

        <div className="mt-6 flex justify-center sm:mt-12">
          <Link
            href="/tienda"
            className="inline-flex h-12 w-full max-w-sm items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 sm:h-11 sm:w-auto sm:max-w-none"
          >
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
