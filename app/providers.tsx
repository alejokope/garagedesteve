"use client";

import type { ReactNode } from "react";
import { CatalogProductsProvider } from "@/app/context/catalog-products-context";
import { CartProvider } from "@/app/context/cart-context";
import { FavoritesProvider } from "@/app/context/favorites-context";
import { ShopFeedbackProvider } from "@/app/context/shop-feedback-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ShopFeedbackProvider>
      <FavoritesProvider>
        <CartProvider>
          <CatalogProductsProvider>{children}</CatalogProductsProvider>
        </CartProvider>
      </FavoritesProvider>
    </ShopFeedbackProvider>
  );
}
