import type { Metadata } from "next";

import { SellDeviceView } from "@/app/components/sell-device-view";
import { SiteFooter } from "@/app/components/site-footer";
import { getSellDeviceWhatsAppHref } from "@/lib/sell-device-whatsapp";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Vendé tu equipo · ${siteConfig.brandName}`,
  description:
    "Cotización por WhatsApp según modelo, capacidad y estado de tu iPhone, iPad o Apple. Te pasamos un valor orientativo y coordinamos el cierre.",
};

export default function VendeTuEquipoPage() {
  const whatsappHref = getSellDeviceWhatsAppHref();

  return (
    <main className="min-h-screen">
      <SellDeviceView whatsappHref={whatsappHref} />
      <SiteFooter />
    </main>
  );
}
