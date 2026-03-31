"use client";

import { useActionState, useState } from "react";

import { categories } from "@/lib/data";
import type { ProductRow } from "@/lib/backoffice/products-db";
import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { saveProduct } from "./actions";
import { ProductDetailEditor } from "./product-detail-editor";
import { ProductImageSection } from "./product-image-section";
import { VariantGroupsEditor } from "./variant-groups-editor";

const fallbackCategories = categories
  .filter((c) => c.id !== "all")
  .map((c) => ({ id: String(c.id), label: c.label }));

export function ProductForm({
  mode,
  initial,
  categoryOptions: categoryOptionsProp,
  kindDefinitions,
  pricingModeLabels,
  catalogProductOptions,
}: {
  mode: "create" | "edit";
  initial?: ProductRow | null;
  categoryOptions: { id: string; label: string }[];
  kindDefinitions: VariantKindDefinitionRow[];
  pricingModeLabels: VariantPricingModeLabelRow[];
  catalogProductOptions: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [draftId, setDraftId] = useState(initial?.id ?? "");
  const productIdForUploads = mode === "create" ? draftId.trim() : (initial?.id ?? "");

  const categoryOptions = categoryOptionsProp.length ? categoryOptionsProp : fallbackCategories;
  const defaultCategory =
    initial?.category && categoryOptions.some((c) => c.id === initial.category)
      ? initial.category
      : (categoryOptions[0]?.id ?? "iphone");

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      {state?.error ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {state.error}
        </div>
      ) : null}

      {categoryOptionsProp.length === 0 ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          No hay categorías en Supabase: se usan las categorías por defecto del proyecto. Creá listas
          en{" "}
          <a href="/backoffice/listas/categorias" className="text-violet-200 underline">
            Listas del catálogo → Categorías
          </a>
          .
        </p>
      ) : null}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "create" ? (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Identificador del producto (sin espacios)
              </span>
              <input
                name="id"
                required
                value={draftId}
                onChange={(e) => setDraftId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="iphone-16-pro"
                autoComplete="off"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Lo usamos en la URL de la tienda y en la carpeta de fotos en Supabase.
              </span>
            </label>
          ) : (
            <>
              <input type="hidden" name="id" value={initial?.id ?? ""} />
              <p className="sm:col-span-2 text-sm text-slate-400">
                Identificador:{" "}
                <code className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-slate-200">
                  {initial?.id}
                </code>
              </p>
            </>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Nombre
            </span>
            <input
              name="name"
              required
              defaultValue={initial?.name ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Resumen corto
            </span>
            <textarea
              name="short"
              required
              rows={2}
              defaultValue={initial?.short ?? ""}
              className="w-full resize-y rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Categoría
            </span>
            <select
              name="category"
              required
              defaultValue={defaultCategory}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Precio base (ARS)
            </span>
            <input
              name="price"
              type="text"
              inputMode="decimal"
              required
              defaultValue={initial?.price ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Punto de partida; si más abajo configurás opciones con precio final, ese precio reemplaza al base.
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Condición (stock)
            </span>
            <select
              name="stock_condition"
              defaultValue={initial?.stock_condition ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">Sin clasificar</option>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
            </select>
            <span className="mt-1 block text-[11px] text-slate-500">
              Para filtrar en la tienda; independiente del texto del badge.
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Badge
            </span>
            <input
              name="badge"
              defaultValue={initial?.badge ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Nuevo sellado"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Orden en listados
            </span>
            <input
              name="sort_order"
              type="number"
              defaultValue={initial?.sort_order ?? 0}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="flex items-center gap-3 pt-6 sm:col-span-2">
            <input
              name="published"
              type="checkbox"
              defaultChecked={initial?.published ?? true}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-violet-600 focus:ring-violet-500/40"
            />
            <span className="text-sm text-slate-300">Publicado en la tienda</span>
          </label>
        </div>
      </section>

      <ProductImageSection
        mode={mode}
        productId={productIdForUploads}
        initialUrl={initial?.image}
        initialAlt={initial?.image_alt}
      />

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Promociones</h2>
        <p className="mt-1 text-sm text-slate-500">
          Precio “tachado” y porcentaje de descuento para mostrar ofertas en el catálogo.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Precio anterior (tachado)
            </span>
            <input
              name="compare_at_price"
              type="text"
              inputMode="decimal"
              defaultValue={initial?.compare_at_price ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Opcional"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Descuento mostrado (%)
            </span>
            <input
              name="discount_percent"
              type="number"
              min={0}
              max={100}
              defaultValue={initial?.discount_percent ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Opcional"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Opciones y precios</h2>
        <p className="mt-1 text-sm text-slate-500">
          Los tipos de opción y los textos de precio se administran en{" "}
          <a href="/backoffice/listas/tipos-opcion" className="text-violet-300 hover:text-violet-200">
            Listas del catálogo
          </a>
          .
        </p>
        <div className="mt-6">
          <VariantGroupsEditor
            initialGroups={initial?.variant_groups}
            kindDefinitions={kindDefinitions}
            pricingModes={pricingModeLabels}
          />
        </div>
      </section>

      <ProductDetailEditor
        productId={productIdForUploads}
        initialDetail={initial?.detail}
        catalogProductOptions={catalogProductOptions}
        currentProductId={mode === "create" ? draftId.trim() || undefined : initial?.id}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar producto"}
        </button>
      </div>
    </form>
  );
}
