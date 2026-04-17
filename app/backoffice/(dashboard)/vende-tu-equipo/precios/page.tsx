import { BoServicioPageHeader } from "@/app/components/backoffice/bo-servicio-page-header";
import { SellPricingEditor } from "@/app/backoffice/(dashboard)/vende-tu-equipo/precios/sell-pricing-editor";
import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import { SELL_PRICING_KEY, mergeSellPricingDefaults } from "@/lib/sell-pricing-schema";

export default async function BackofficeSellPreciosPage() {
  let initial = mergeSellPricingDefaults({});
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(SELL_PRICING_KEY);
    if (row?.payload) initial = mergeSellPricingDefaults(row.payload);
    revision = row?.updated_at ?? "default";
  } catch {
    /* sin supabase */
  }

  return (
    <div className="min-w-0 space-y-8">
      <BoServicioPageHeader
        kicker="Vendé tu equipo"
        title="Simulador de precios (compra de usados)"
        description={
          <>
            Editá textos, moneda por defecto y cada fila de la tabla. Clave en Supabase:{" "}
            <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
              {SELL_PRICING_KEY}
            </code>
          </>
        }
        publicHref="/vende-tu-equipo"
        publicLabel="Ver página pública"
      />
      <SellPricingEditor initial={initial} revision={revision} />
    </div>
  );
}
