"use client";

import { type RefObject, useLayoutEffect, useRef } from "react";

import { FeaturedProductCard } from "@/app/components/featured-product-card";
import type { Product } from "@/lib/data";

const carouselTrack =
  "-mx-5 flex touch-scroll-x snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain scroll-pl-5 scroll-pr-5 pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-scroll-x";

const carouselSlide =
  "flex h-auto min-h-0 w-[min(19rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col";

/** Acepta `Product[]` o, por si se pasa por error el bloque `{ visible, products }` de la home. */
function normalizeFeaturedProductsList(products: unknown): Product[] {
  if (Array.isArray(products)) return products as Product[];
  if (
    products &&
    typeof products === "object" &&
    "products" in products &&
    Array.isArray((products as { products: unknown }).products)
  ) {
    return (products as { products: Product[] }).products;
  }
  return [];
}

/**
 * Iguala alturas en la grilla desktop: mide la card más alta y aplica min-height al resto.
 */
function useEqualFeaturedCardHeights(
  gridRef: RefObject<HTMLDivElement | null>,
  productCount: number,
) {
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = () =>
      [
        ...grid.querySelectorAll<HTMLElement>("[data-featured-product-card]"),
      ];

    const equalize = () => {
      const els = cards();
      for (const el of els) el.style.minHeight = "";
      if (els.length === 0) return;
      if (!window.matchMedia("(min-width: 640px)").matches) return;
      void grid.offsetHeight;
      const max = Math.max(
        ...els.map((el) => el.getBoundingClientRect().height),
      );
      if (max <= 0) return;
      const px = `${Math.ceil(max)}px`;
      for (const el of els) el.style.minHeight = px;
    };

    const schedule = () => requestAnimationFrame(equalize);

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(grid);
    for (const el of cards()) ro.observe(el);

    const imgs = [...grid.querySelectorAll("img")];
    const onImg = () => schedule();
    for (const img of imgs) {
      if (!img.complete) img.addEventListener("load", onImg, { once: true });
    }

    window.addEventListener("resize", schedule);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      for (const el of cards()) el.style.minHeight = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gridRef estable, no re-suscribir al mismo ref
  }, [productCount]);
}

/**
 * Dos layouts independientes: en el mismo nodo, mezclar flex + grid rompe el ancho en desktop.
 * Móvil: carrusel horizontal. sm+: grilla clásica (sin wrapper intermedio raro).
 */
export function FeaturedProductCardsGrid({ products }: { products: Product[] | unknown }) {
  const items = normalizeFeaturedProductsList(products);
  const desktopGridRef = useRef<HTMLDivElement>(null);
  useEqualFeaturedCardHeights(desktopGridRef, items.length);

  return (
    <>
      <div
        className={`${carouselTrack} sm:hidden`}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Productos destacados, deslizá para ver más"
      >
        {items.map((p) => (
          <div key={p.id} className={carouselSlide}>
            <FeaturedProductCard product={p} />
          </div>
        ))}
      </div>

      <div
        ref={desktopGridRef}
        className="hidden w-full min-w-0 items-stretch gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        role="region"
        aria-label="Productos destacados"
      >
        {items.map((p) => (
          <FeaturedProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
