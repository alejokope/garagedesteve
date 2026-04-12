import { listVariantPricingModeLabelsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

function modeTitle(mode: string): string {
  if (mode === "absolute") return "Precio final";
  if (mode === "delta") return "Suma al precio base";
  return mode;
}

export default async function ModosPrecioPage() {
  const rows = await listVariantPricingModeLabelsAdmin();

  return (
    <div className="space-y-8">
      <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-400">
        Los <strong className="text-white">modos de precio</strong> son fijos: solo existen{" "}
        <code className="rounded bg-white/[0.06] px-1 font-mono text-xs text-slate-300">absolute</code> (precio
        final de la variante) y{" "}
        <code className="rounded bg-white/[0.06] px-1 font-mono text-xs text-slate-300">delta</code> (diferencia
        sobre el precio del producto). Los textos que ve el equipo en el formulario vienen de la base; no se
        editan desde acá.
      </p>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">Modos configurados</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/30 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Modo</th>
                <th className="px-4 py-3 font-medium">Uso</th>
                <th className="px-4 py-3 font-medium">Título en el formulario</th>
                <th className="px-4 py-3 font-medium">Ayuda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mode} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.mode}</td>
                  <td className="px-4 py-3 text-slate-300">{modeTitle(r.mode)}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.label}</td>
                  <td className="max-w-xl px-4 py-3 whitespace-pre-wrap text-slate-400">
                    {r.hint?.trim() ? r.hint : "—"}
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
