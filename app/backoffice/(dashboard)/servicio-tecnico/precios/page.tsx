import { BoServicioPageHeader } from "@/app/components/backoffice/bo-servicio-page-header";
import { RepairPricingEditor } from "@/app/backoffice/(dashboard)/servicio-tecnico/precios/repair-pricing-editor";
import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  REPAIR_PRICING_KEY,
  mergeRepairPricingDefaults,
} from "@/lib/repair-pricing-schema";

export default async function BackofficeRepairPreciosPage() {
  let initial = mergeRepairPricingDefaults({});
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(REPAIR_PRICING_KEY);
    if (row?.payload) initial = mergeRepairPricingDefaults(row.payload);
    revision = row?.updated_at ?? "default";
  } catch {
    /* sin supabase */
  }

  return (
    <div className="min-w-0 space-y-8">
      <BoServicioPageHeader
        kicker="Servicio técnico"
        title="Precios y cobertura"
        description={
          <>
            Editá tablas, filtros, moneda por defecto (USD) y moneda por fila si hace falta. Clave en Supabase:{" "}
            <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
              {REPAIR_PRICING_KEY}
            </code>
          </>
        }
        publicHref="/servicio-tecnico#precios"
        publicLabel="Ver precios en la web"
      />
      <RepairPricingEditor initial={initial} revision={revision} />
    </div>
  );
}
