import type { Metadata } from "next";
import { RepairPricingView } from "@/app/components/repair-pricing-view";
import { SiteFooter } from "@/app/components/site-footer";
import { getRepairPricingConfig } from "@/lib/repair-content-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Precios de reparaciones · ${siteConfig.brandName}`,
  description: "Precios orientativos y cobertura de garantía del servicio técnico.",
};

export default async function ServicioPreciosPage() {
  const config = await getRepairPricingConfig();
  return (
    <main>
      <RepairPricingView config={config} />
      <SiteFooter />
    </main>
  );
}
