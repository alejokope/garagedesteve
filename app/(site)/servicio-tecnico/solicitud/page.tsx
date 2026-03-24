import type { Metadata } from "next";
import { RepairFormView } from "@/app/components/repair-form-view";
import { SiteFooter } from "@/app/components/site-footer";
import { getRepairFormConfig } from "@/lib/repair-content-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Solicitar reparación · ${siteConfig.brandName}`,
  description: "Enviá tu consulta de servicio técnico por WhatsApp.",
};

export default async function ServicioSolicitudPage() {
  const config = await getRepairFormConfig();
  return (
    <main>
      <RepairFormView config={config} />
      <SiteFooter />
    </main>
  );
}
