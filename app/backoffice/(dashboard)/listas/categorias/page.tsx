import Link from "next/link";

import { listProductCategoriesAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { deleteCategory } from "./actions";
import { CategoriasRowsEditor } from "./categorias-rows-editor";
import { CreateCategoryForm } from "./create-category-form";

export default async function CategoriasListasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const rows = await listProductCategoriesAdmin();
  const revision = rows
    .map(
      (c) =>
        `${c.id}:${c.label}:${c.sort_order}:${c.active}:${c.default_image ?? ""}:${c.default_image_alt ?? ""}`,
    )
    .join("|");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Listas del catálogo</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">Categorías</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Definís en qué <strong className="text-slate-200">sección del catálogo</strong> cae cada producto (iPhone,
          iPad, etc.). Podés configurar una <strong className="text-slate-200">imagen por defecto</strong>: si un
          producto no tiene foto propia, la tienda usa la de la categoría. Tras subir un archivo, pulsá{" "}
          <strong className="text-slate-200">Guardar cambios</strong> para guardar la URL en la base. Las variantes
          (color, almacenamiento) se cargan al{" "}
          <Link href="/backoffice/productos" className="text-violet-300 underline hover:text-violet-200">
            editar cada producto
          </Link>
          .
        </p>
      </div>

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
        <CategoriasRowsEditor rows={rows} revision={revision} />
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
