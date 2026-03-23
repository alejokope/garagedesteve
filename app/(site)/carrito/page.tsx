import type { Metadata } from "next";
import { CartPageView } from "@/app/components/cart-page-view";
import { SiteFooter } from "@/app/components/site-footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Carrito · ${siteConfig.brandName}`,
  description: "Revisá tu pedido y finalizá por WhatsApp.",
};

export default function CarritoPage() {
  return (
    <main>
      <CartPageView />
      <SiteFooter />
    </main>
  );
}
