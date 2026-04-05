import { BoServicioPageHeader } from "@/app/components/backoffice/bo-servicio-page-header";
import { RepairFormEditor } from "@/app/backoffice/(dashboard)/servicio-tecnico/solicitud/repair-form-editor";
import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import { REPAIR_FORM_KEY, mergeRepairFormDefaults } from "@/lib/repair-form-schema";

export default async function BackofficeRepairSolicitudPage() {
  let initial = mergeRepairFormDefaults({});
  try {
    const row = await getContentEntryAdmin(REPAIR_FORM_KEY);
    if (row?.payload) initial = mergeRepairFormDefaults(row.payload);
  } catch {
    /* sin supabase */
  }

  return (
    <div className="min-w-0 space-y-8">
      <BoServicioPageHeader
        kicker="Servicio técnico"
        title="Formulario de solicitud"
        description={
          <>
            Tipos de servicio (precios en USD por defecto), marcas, modelos, prioridades, entrega, textos y
            testimonios. Clave en Supabase:{" "}
            <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
              {REPAIR_FORM_KEY}
            </code>
          </>
        }
        publicHref="/servicio-tecnico"
        publicLabel="Ver servicio técnico (web)"
      />
      <RepairFormEditor initial={initial} />
    </div>
  );
}
