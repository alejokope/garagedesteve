import Link from "next/link";

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Servicio técnico
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Formulario de solicitud
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Tipos de servicio (con precio en ARS o USD), marcas, modelos, prioridades, entrega,
            textos y testimonios. Clave{" "}
            <code className="rounded bg-white/[0.06] px-1 font-mono text-xs">{REPAIR_FORM_KEY}</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/servicio-tecnico/solicitud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            Ver página pública ↗
          </Link>
          <Link href="/backoffice" className="text-sm font-medium text-slate-400 hover:text-slate-200">
            ← Panel
          </Link>
        </div>
      </div>

      <RepairFormEditor initial={initial} />
    </div>
  );
}
