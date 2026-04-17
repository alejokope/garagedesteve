import type { Metadata } from "next";

import { SellDeviceView } from "@/app/components/sell-device-view";
import { SiteFooter } from "@/app/components/site-footer";
import { getSellDeviceWhatsAppHrefServer } from "@/lib/floating-contact-server";
import { getSellPricingConfig } from "@/lib/sell-content-server";
import { getSiteContact } from "@/lib/site-contact-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Vendé tu equipo · ${siteConfig.brandName}`,
  description:
    "Cotización por WhatsApp según modelo, capacidad y estado de tu iPhone, iPad o Apple. Te pasamos un valor orientativo y coordinamos el cierre.",
};

export default async function VendeTuEquipoPage() {
  const [whatsappHref, contact, sellPricing] = await Promise.all([
    getSellDeviceWhatsAppHrefServer(),
    getSiteContact(),
    getSellPricingConfig(),
  ]);

  return (
    <main className="min-h-screen">
      <SellDeviceView
        whatsappHref={whatsappHref}
        fallbackEmail={contact.email}
        fallbackPhone={contact.phone}
        sellPricing={sellPricing}
      />
      <SiteFooter />
    </main>
  );
}
