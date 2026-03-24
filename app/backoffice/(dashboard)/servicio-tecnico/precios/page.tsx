import Link from "next/link";

import { RepairPricingEditor } from "@/app/backoffice/(dashboard)/servicio-tecnico/precios/repair-pricing-editor";
import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  REPAIR_PRICING_KEY,
  mergeRepairPricingDefaults,
} from "@/lib/repair-pricing-schema";

export default async function BackofficeRepairPreciosPage() {
  let initial = mergeRepairPricingDefaults({});
  try {
    const row = await getContentEntryAdmin(REPAIR_PRICING_KEY);
    if (row?.payload) initial = mergeRepairPricingDefaults(row.payload);
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
            Precios y cobertura
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Editá tablas, filtros, moneda por defecto (ARS/USD) y ARS/USD por fila. Clave{" "}
            <code className="rounded bg-white/[0.06] px-1 font-mono text-xs">{REPAIR_PRICING_KEY}</code>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/servicio-tecnico/precios"
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

      <RepairPricingEditor initial={initial} />
    </div>
  );
}
