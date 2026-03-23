import { listVariantKindDefinitionsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { deleteVariantKind, updateVariantKind } from "./actions";
import { CreateVariantKindForm } from "./create-kind-form";

export default async function TiposOpcionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const rows = await listVariantKindDefinitionsAdmin();

  return (
    <div className="space-y-10">
      {q.error ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          {q.error}
        </div>
      ) : null}

      <CreateVariantKindForm />

      <div>
        <h2 className="font-display text-lg font-semibold text-white">Tipos configurados</h2>
        <div className="mt-4 space-y-4">
          {rows.map((c) => (
            <form
              key={c.id}
              action={updateVariantKind}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 lg:flex-row lg:flex-wrap lg:items-end"
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="font-mono text-xs text-slate-500 lg:w-28">{c.id}</div>
              <label className="min-w-[140px] flex-1">
                <span className="mb-1 block text-[11px] text-slate-500">Nombre</span>
                <input
                  name="label"
                  defaultValue={c.label}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="min-w-[200px] flex-[2]">
                <span className="mb-1 block text-[11px] text-slate-500">Ayuda</span>
                <input
                  name="hint"
                  defaultValue={c.hint ?? ""}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="min-w-[180px]">
                <span className="mb-1 block text-[11px] text-slate-500">Comportamiento</span>
                <select
                  name="ui_behavior"
                  defaultValue={c.ui_behavior}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
                >
                  <option value="color">Color / muestras</option>
                  <option value="storage">Rejilla</option>
                  <option value="select">Lista</option>
                </select>
              </label>
              <label className="w-24">
                <span className="mb-1 block text-[11px] text-slate-500">Orden</span>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={c.sort_order}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="flex items-center gap-2 pb-2">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={c.active}
                  className="h-4 w-4 rounded"
                />
                <span className="text-xs text-slate-400">Activo</span>
              </label>
              <button
                type="submit"
                className="rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.12]"
              >
                Guardar
              </button>
            </form>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">Eliminar</h2>
        <div className="mt-2 space-y-2">
          {rows.map((c) => (
            <form key={`del-${c.id}`} action={deleteVariantKind} className="flex items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <span className="text-sm text-slate-400">
                {c.label} <span className="font-mono text-xs text-slate-600">({c.id})</span>
              </span>
              <button
                type="submit"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
              >
                Eliminar
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
