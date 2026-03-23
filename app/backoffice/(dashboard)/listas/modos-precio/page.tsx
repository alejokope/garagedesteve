import { listVariantPricingModeLabelsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { updatePricingModeLabel } from "./actions";

export default async function ModosPrecioPage() {
  const rows = await listVariantPricingModeLabelsAdmin();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Solo hay dos modos técnicos (<code className="rounded bg-white/[0.06] px-1 font-mono text-xs">absolute</code>{" "}
        y <code className="rounded bg-white/[0.06] px-1 font-mono text-xs">delta</code>). Podés cambiar los
        textos que ve el equipo al cargar productos; no se pueden eliminar filas.
      </p>
      <div className="space-y-6">
        {rows.map((row) => (
          <form
            key={row.mode}
            action={updatePricingModeLabel}
            className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            <input type="hidden" name="mode" value={row.mode} />
            <h2 className="font-display text-lg font-semibold text-white">
              Modo {row.mode === "absolute" ? "precio final" : "suma al base"}{" "}
              <span className="font-mono text-sm font-normal text-slate-500">({row.mode})</span>
            </h2>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Título en el desplegable</span>
              <input
                name="label"
                required
                defaultValue={row.label}
                className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Texto de ayuda</span>
              <textarea
                name="hint"
                rows={2}
                defaultValue={row.hint ?? ""}
                className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Guardar textos
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
