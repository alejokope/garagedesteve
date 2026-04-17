"use client";

import type { ReactNode } from "react";
import { CatalogProductsProvider } from "@/app/context/catalog-products-context";
import { CartProvider } from "@/app/context/cart-context";
import { FavoritesProvider } from "@/app/context/favorites-context";
import { ShopFeedbackProvider } from "@/app/context/shop-feedback-context";
import { SellQuotesProvider } from "@/app/context/sell-quotes-context";
import { TradeInProvider } from "@/app/context/trade-in-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ShopFeedbackProvider>
      <FavoritesProvider>
        <TradeInProvider>
          <SellQuotesProvider>
            <CartProvider>
              <CatalogProductsProvider>{children}</CatalogProductsProvider>
            </CartProvider>
          </SellQuotesProvider>
        </TradeInProvider>
      </FavoritesProvider>
    </ShopFeedbackProvider>
  );
}
