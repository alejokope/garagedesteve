import type { Metadata } from "next";

import { SellQuotesPageView } from "@/app/components/sell-quotes-page-view";
import { SiteFooter } from "@/app/components/site-footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Mis cotizaciones · ${siteConfig.brandName}`,
  description:
    "Cotizaciones de compra de usado que guardaste. Usalas en el carrito o volvé a abrirlas cuando quieras.",
};

export default function CotizacionesUsadosPage() {
  return (
    <main>
      <SellQuotesPageView />
      <SiteFooter />
    </main>
  );
}
