import { listProductCategoriesAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { deleteCategory, updateCategory } from "./actions";
import { CreateCategoryForm } from "./create-category-form";

export default async function CategoriasListasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const rows = await listProductCategoriesAdmin();

  return (
    <div className="space-y-10">
      {q.error ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          {q.error}
        </div>
      ) : null}

      <CreateCategoryForm />

      <div>
        <h2 className="font-display text-lg font-semibold text-white">Categorías actuales</h2>
        <p className="mt-1 text-sm text-slate-500">
          Editá el nombre o el orden; el identificador no se puede cambiar. Solo podés eliminar si
          ningún producto la usa.
        </p>
        <div className="mt-4 space-y-4">
          {rows.map((c) => (
            <form
              key={c.id}
              action={updateCategory}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="font-mono text-xs text-slate-500 sm:w-28">{c.id}</div>
              <label className="min-w-[160px] flex-1">
                <span className="mb-1 block text-[11px] text-slate-500">Nombre</span>
                <input
                  name="label"
                  defaultValue={c.label}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 text-sm text-white"
                />
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
                <span className="text-xs text-slate-400">Activa</span>
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
            <form key={`del-${c.id}`} action={deleteCategory} className="flex items-center gap-3">
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
