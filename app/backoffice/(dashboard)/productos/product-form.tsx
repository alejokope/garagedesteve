"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";

import { categories } from "@/lib/data";
import type { ProductRow } from "@/lib/backoffice/products-db";
import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { saveProduct } from "./actions";
import { ProductDetailEditor } from "./product-detail-editor";
import { ProductEditorTabs, type ProductEditorTabId } from "./product-editor-tabs";
import { ProductImageSection } from "./product-image-section";
import { VariantGroupsEditor } from "./variant-groups-editor";

const fallbackCategories = categories
  .filter((c) => c.id !== "all")
  .map((c) => ({ id: String(c.id), label: c.label }));

function PanelIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}

function FieldCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </section>
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
  const [activeTab, setActiveTab] = useState<ProductEditorTabId>("catalogo");
  const productIdForUploads = mode === "create" ? draftId.trim() : (initial?.id ?? "");

  const categoryOptions = categoryOptionsProp.length ? categoryOptionsProp : fallbackCategories;

  /** Incluye la categoría persistida aunque no esté en la lista activa (evita mostrar otra y pisar al guardar). */
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

      {categoryOptionsProp.length === 0 ? (
        <p className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          No hay categorías en Supabase: se usan las del proyecto. Podés crearlas en{" "}
          <a href="/backoffice/listas/categorias" className="text-violet-200 underline">
            Listas → Categorías
          </a>
          .
        </p>
      ) : null}

      <ProductEditorTabs
        active={activeTab}
        onChange={setActiveTab}
        panels={{
          catalogo: (
            <div className="space-y-6">
              <PanelIntro title="Lo que ves en el catálogo">
                Datos del listado: nombre, precio de referencia, categoría y si está publicado. La foto
                principal es la que aparece en la grilla de la tienda.
              </PanelIntro>

              <FieldCard>
                <h3 className="text-sm font-semibold text-white">Identidad y texto corto</h3>
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
                        URL de la tienda y carpeta de fotos en Supabase.
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
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">Nombre</span>
                    <input
                      name="name"
                      required
                      defaultValue={initial?.name ?? ""}
                      className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">Resumen</span>
                    <textarea
                      name="short"
                      required
                      rows={2}
                      defaultValue={initial?.short ?? ""}
                      className="w-full resize-y rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
                      Marca (opcional)
                    </span>
                    <input
                      name="brand"
                      defaultValue={initial?.brand ?? ""}
                      className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                      placeholder="Ej. Apple, Samsung, JBL, Sony…"
                    />
                    <span className="mt-1 block text-[11px] text-slate-500">
                      Aparece en la tienda y genera un chip en el filtro de marcas. Sin marca → quedan
                      bajo “Otras marcas” en el catálogo.
                    </span>
                  </label>
                </div>
              </FieldCard>

              <FieldCard>
                <h3 className="text-sm font-semibold text-white">Precio y clasificación</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">Categoría</span>
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
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
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
                      Si configurás opciones con precio final, ese valor manda.
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
                      Condición (filtro tienda)
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
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">Badge</span>
                    <input
                      name="badge"
                      defaultValue={initial?.badge ?? ""}
                      className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                      placeholder="Ej. Nuevo sellado"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
                      Orden en listados
                    </span>
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
                      <span className="block text-sm font-medium text-slate-200">
                        Visible en la web
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Desmarcado = no aparece en el catálogo ni en la ficha pública.
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
                <h3 className="text-sm font-semibold text-white">Ofertas en el catálogo</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Precio tachado y porcentaje para la etiqueta de descuento.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
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
                    <span className="mb-1.5 block text-xs font-medium text-slate-400">
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
              </FieldCard>
            </div>
          ),
          opciones: (
            <div className="space-y-6">
              <PanelIntro title="Opciones con precio">
                Agregá grupos (por ejemplo Color o Almacenamiento) y las variantes que el cliente puede
                elegir. Los tipos de control y textos de precio se configuran en{" "}
                <a
                  href="/backoffice/listas/tipos-opcion"
                  className="text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200"
                >
                  Listas del catálogo
                </a>
                .
              </PanelIntro>
              <FieldCard>
                <VariantGroupsEditor
                  initialGroups={initial?.variant_groups}
                  kindDefinitions={kindDefinitions}
                  pricingModes={pricingModeLabels}
                />
              </FieldCard>
            </div>
          ),
          ficha: (
            <div className="space-y-6">
              <PanelIntro title="La página del producto en la tienda">
                Todo lo que aparece al entrar al detalle: bullets, galería, especificaciones y productos
                relacionados.
              </PanelIntro>
              <ProductDetailEditor
                key={initial?.id ?? "product-detail-new"}
                productId={productIdForUploads}
                initialDetail={initial?.detail}
                catalogProductOptions={catalogProductOptions}
                currentProductId={mode === "create" ? draftId.trim() || undefined : initial?.id}
              />
            </div>
          ),
        }}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-2 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-white/[0.12] bg-slate-950/85 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="hidden text-sm text-slate-400 sm:block">
            Navegá por las pestañas arriba; al guardar se envía todo junto.
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {activeTab !== "ficha" ? (
              <button
                type="button"
                onClick={() => {
                  const order: ProductEditorTabId[] = ["catalogo", "opciones", "ficha"];
                  const i = order.indexOf(activeTab);
                  if (i < order.length - 1) setActiveTab(order[i + 1]!);
                }}
                className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.1]"
              >
                Siguiente pestaña
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("catalogo")}
                className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/[0.1]"
              >
                Volver al inicio
              </button>
            )}
            <button
              type="submit"
              disabled={pending}
              className="min-w-[160px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar producto"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
