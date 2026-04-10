import { listVariantKindDefinitionsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { deleteVariantKind } from "./actions";
import { CreateVariantKindForm } from "./create-kind-form";
import { TiposOpcionRowsEditor } from "./tipos-opcion-rows-editor";

export default async function TiposOpcionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const rows = await listVariantKindDefinitionsAdmin();
  const revision = rows
    .map((c) => `${c.id}:${c.label}:${c.hint ?? ""}:${c.ui_behavior}:${c.sort_order}:${c.active}`)
    .join("|");

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
        <TiposOpcionRowsEditor rows={rows} revision={revision} />
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
