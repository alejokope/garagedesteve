import type { Metadata } from "next";

import { SellDeviceView } from "@/app/components/sell-device-view";
import { SiteFooter } from "@/app/components/site-footer";
import { getSellDeviceWhatsAppHrefServer } from "@/lib/floating-contact-server";
import { getSellPricingConfig } from "@/lib/sell-content-server";
import { getSiteContact } from "@/lib/site-contact-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Plan canje · ${siteConfig.brandName}`,
  description:
    "Plan canje: valor orientativo según modelo, capacidad y estado de tu iPhone, iPad o Apple. Coordinamos por WhatsApp los pasos del canje.",
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
