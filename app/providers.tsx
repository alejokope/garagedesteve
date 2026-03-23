"use client";

import type { ReactNode } from "react";
import { CatalogProductsProvider } from "@/app/context/catalog-products-context";
import { CartProvider } from "@/app/context/cart-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <CatalogProductsProvider>{children}</CatalogProductsProvider>
    </CartProvider>
  );
}
