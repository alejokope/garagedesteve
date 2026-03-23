"use client";

import { useState, type ReactNode } from "react";
import { CartDrawer } from "@/app/components/cart-drawer";
import { SiteHeader } from "@/app/components/site-header";
import { WhatsAppFab } from "@/app/components/whatsapp-fab";

export function SiteChrome({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <SiteHeader onOpenCart={() => setCartOpen(true)} />
      {children}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppFab />
    </>
  );
}
