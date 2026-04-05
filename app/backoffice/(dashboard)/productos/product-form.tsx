"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, type ReactNode } from "react";

import { categories } from "@/lib/data";
import type { ProductRow } from "@/lib/backoffice/products-db";
import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { saveProduct } from "./actions";
import { ProductDetailEditor } from "./product-detail-editor";
import { ProductFormSections } from "./product-form-sections";
import { ProductImageSection } from "./product-image-section";
import { VariantGroupsEditor } from "./variant-groups-editor";

const fallbackCategories = categories
  .filter((c) => c.id !== "all")
  .map((c) => ({ id: String(c.id), label: c.label }));

const LISTAS_CATEGORIAS = "/backoffice/listas/categorias";
const LISTAS_TIPOS_OPCION = "/backoffice/listas/tipos-opcion";

function FieldCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

function CategoryHelper({ hasDbCategories }: { hasDbCategories: boolean }) {
  return (
    <div className="mb-4 rounded-xl border border-violet-500/25 bg-violet-500/[0.07] px-4 py-3 text-sm leading-relaxed text-slate-200">
      <p className="font-semibold text-white">¿En qué parte del catálogo va este producto?</p>
      <p className="mt-1.5 text-slate-300">
        La <strong className="text-white">categoría</strong> es el filtro de la tienda (iPhone, iPad, AirPods…). No tiene
        nada que ver con las variantes de color o memoria: eso va más abajo, en{" "}
        <span className="text-slate-200">Variantes</span>, y solo si hace falta.
      </p>
      <p className="mt-2 text-slate-400">
        ¿No aparece la categoría que necesitás?{" "}
        <Link href={LISTAS_CATEGORIAS} className="font-medium text-violet-200 underline decoration-violet-400/50 underline-offset-2 hover:text-white">
          Crear o activar categorías
        </Link>
        {" — "}
        volvé a esta pantalla y elegila en el menú. No hace falta tocar &quot;Tipos de opción&quot; para eso.
      </p>
      {!hasDbCategories ? (
        <p className="mt-2 border-t border-white/10 pt-2 text-amber-100/90">
          Ahora mismo no hay categorías en la base: se usan las del código. Para administrarlas desde acá, cargá
          categorías en{" "}
          <Link href={LISTAS_CATEGORIAS} className="font-medium underline">
            Listas → Categorías
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

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
  const hasDbCategories = categoryOptionsProp.length > 0;

  const selectCategoryOptions = useMemo(() => {
    const c = initial?.category?.trim();
    if (mode === "edit" && c && !categoryOptions.some((o) => o.id === c)) {
      return [
        { id: c, label: `${c} (revisá Listas → Categorías: inactiva o no coincide)` },
        ...categoryOptions,
      ];
    }
    return categoryOptions;
  }, [mode, initial?.category, categoryOptions]);

  const defaultCategory =
    mode === "edit" && initial?.category?.trim()
      ? initial.category.trim()
      : (selectCategoryOptions[0]?.id ?? "iphone");

  const bloqueEsencial = (
    <div className="space-y-6">
      <FieldCard>
        <h3 className="text-sm font-semibold text-white">Nombre y textos</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "create" ? (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">
                ID del producto (sin espacios)
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
                Se usa en la URL de la tienda y como carpeta de fotos. Letras minúsculas, guiones, sin espacios.
              </span>
            </label>
          ) : (
            <>
              <input type="hidden" name="id" value={initial?.id ?? ""} />
              <p className="sm:col-span-2 rounded-xl bg-black/25 px-3 py-2 text-sm text-slate-300">
                <span className="text-slate-500">ID: </span>
                <code className="font-mono text-violet-200/95">{initial?.id}</code>
              </p>
            </>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Nombre en la tienda</span>
            <input
              name="name"
              required
              defaultValue={initial?.name ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Resumen (líneas del listado)</span>
            <textarea
              name="short"
              required
              rows={2}
              defaultValue={initial?.short ?? ""}
              className="w-full resize-y rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Marca (opcional)</span>
            <input
              name="brand"
              defaultValue={initial?.brand ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Ej. Apple, JBL…"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Aparece en la ficha y en el filtro de marcas del catálogo.
            </span>
          </label>
        </div>
      </FieldCard>

      <FieldCard>
        <h3 className="text-sm font-semibold text-white">Categoría y precio</h3>
        <CategoryHelper hasDbCategories={hasDbCategories} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Categoría del catálogo</span>
            <select
              name="category"
              required
              defaultValue={defaultCategory}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              {selectCategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Precio base (USD)</span>
            <input
              name="price"
              type="text"
              inputMode="decimal"
              required
              defaultValue={initial?.price ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Si más abajo cargás variantes con precio propio, ese valor puede reemplazar al base según la regla del
              grupo.
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Condición (etiqueta en tienda)</span>
            <select
              name="stock_condition"
              defaultValue={initial?.stock_condition ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">Sin etiqueta</option>
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Badge opcional</span>
            <input
              name="badge"
              defaultValue={initial?.badge ?? ""}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Ej. Nuevo sellado"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Orden en listados (número)</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={initial?.sort_order ?? 0}
              className="max-w-[200px] rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 sm:col-span-2">
            <input
              name="published"
              type="checkbox"
              defaultChecked={initial?.published ?? true}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 text-violet-600 focus:ring-violet-500/40"
            />
            <span>
              <span className="block text-sm font-medium text-slate-200">Publicado en la web</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Si lo desmarcás, el producto no se muestra en la tienda hasta que lo vuelvas a activar.
              </span>
            </span>
          </label>
        </div>
      </FieldCard>

      <ProductImageSection
        mode={mode}
        productId={productIdForUploads}
        initialUrl={initial?.image}
        initialAlt={initial?.image_alt}
      />

      <FieldCard>
        <h3 className="text-sm font-semibold text-white">Oferta en el listado (opcional)</h3>
        <p className="mt-1 text-xs text-slate-500">Precio tachado y porcentaje de descuento en la grilla.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Precio anterior (tachado)</span>
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
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Descuento mostrado (%)</span>
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
      </FieldCard>
    </div>
  );

  const bloqueVariantes = (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-4 text-sm leading-relaxed text-slate-300">
        <p className="font-medium text-white">¿Cuándo usar esto?</p>
        <p className="mt-1.5">
          Solo si el cliente tiene que <strong className="text-slate-100">elegir algo</strong> (color, GB, talle) y eso
          cambia el precio o el SKU lógico. Un funda de un solo precio →{" "}
          <strong className="text-slate-100">no agregues grupos</strong>; dejá esta sección vacía y listo.
        </p>
        <p className="mt-2 text-slate-500">
          Los nombres de tipo (select, chips de color, etc.) vienen de{" "}
          <Link
            href={LISTAS_TIPOS_OPCION}
            className="text-violet-200 underline decoration-violet-500/40 underline-offset-2 hover:text-white"
          >
            Listas → Tipos de opción
          </Link>{" "}
          — solo si necesitás un comportamiento nuevo. No es obligatorio para cada producto.
        </p>
      </div>
      <FieldCard>
        <VariantGroupsEditor
          initialGroups={initial?.variant_groups}
          kindDefinitions={kindDefinitions}
          pricingModes={pricingModeLabels}
        />
      </FieldCard>
    </div>
  );

  const bloqueFicha = (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Galería extra, bullets, especificaciones y &quot;También te puede interesar&quot;. Si lo dejás vacío, la tienda
        igual muestra una ficha razonable con los datos del catálogo.
      </p>
      <ProductDetailEditor
        key={initial?.id ?? "product-detail-new"}
        productId={productIdForUploads}
        initialDetail={initial?.detail}
        catalogProductOptions={catalogProductOptions}
        currentProductId={mode === "create" ? draftId.trim() || undefined : initial?.id}
      />
    </div>
  );

  return (
    <form
      key={mode === "edit" ? (initial?.id ?? "edit") : "create"}
      action={formAction}
      className="pb-28"
    >
      <input type="hidden" name="mode" value={mode} />

      {state?.error ? (
        <div className="mb-6 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {state.error}
        </div>
      ) : null}

      <ProductFormSections
        sections={[
          {
            id: "datos",
            step: "Paso 1",
            title: "Datos del producto en la tienda",
            subtitle:
              "Completá nombre, categoría, precio, foto y publicación. Con esto el producto ya puede aparecer en el catálogo.",
            content: bloqueEsencial,
          },
          {
            id: "variantes",
            step: "Paso 2",
            title: "Variantes (color, memoria…)",
            subtitle:
              "Solo para productos con opciones elegibles. Si es un artículo de precio único, no toques nada acá.",
            optional: true,
            content: bloqueVariantes,
          },
          {
            id: "ficha",
            step: "Paso 3",
            title: "Página detallada del producto",
            subtitle: "Texto largo, más fotos y relacionados. Opcional: la tienda puede usar valores por defecto.",
            optional: true,
            content: bloqueFicha,
          },
        ]}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-2 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-white/[0.12] bg-slate-950/90 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-500 sm:text-sm sm:text-slate-400">
            Un clic guarda <span className="text-slate-300">catálogo + variantes + ficha</span>.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="w-full min-w-[160px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Guardando…" : "Guardar producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
