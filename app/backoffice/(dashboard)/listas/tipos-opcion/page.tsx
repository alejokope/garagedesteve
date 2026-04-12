import { listVariantKindDefinitionsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

const UI_BEHAVIOR_LABEL: Record<string, string> = {
  color: "Color / muestras",
  storage: "Rejilla (capacidad / precio)",
  select: "Lista simple",
};

export default async function TiposOpcionPage() {
  const rows = await listVariantKindDefinitionsAdmin();

  return (
    <div className="space-y-8">
      <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-400">
        Los <strong className="text-white">tipos de opción</strong> no se editan desde el panel: son los
        definidos en el sistema y sirven para elegir el comportamiento en tienda al crear un grupo de
        variantes en cada producto.
      </p>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">Tipos disponibles</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/30 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Identificador</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Ayuda</th>
                <th className="px-4 py-3 font-medium">Comportamiento</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.label}</td>
                  <td className="max-w-[14rem] px-4 py-3 text-slate-400">
                    {r.hint?.trim() ? r.hint : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {UI_BEHAVIOR_LABEL[r.ui_behavior] ?? r.ui_behavior}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-400">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    {r.active ? (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200/95">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-slate-500">
                        Inactivo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
