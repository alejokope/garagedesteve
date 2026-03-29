"use client";

import dynamic from "next/dynamic";

import { FeaturedGridSkeleton } from "@/app/components/featured-grid-skeleton";
import type { Product } from "@/lib/data";

const FeaturedProductCardsGrid = dynamic(
  () =>
    import("@/app/components/featured-product-cards-grid").then(
      (m) => m.FeaturedProductCardsGrid,
    ),
  {
    ssr: false,
    loading: () => <FeaturedGridSkeleton count={8} />,
  },
);

export function HomeFeaturedGridDynamic({ products }: { products: Product[] }) {
  return <FeaturedProductCardsGrid products={products} />;
}
