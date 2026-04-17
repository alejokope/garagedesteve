"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import { categories } from "@/lib/data";
import type { ProductRow } from "@/lib/backoffice/product-row-shared";
import { parseGalleryImagesColumn, productRowToProduct } from "@/lib/backoffice/product-row-shared";
import { productCarouselUrls } from "@/lib/product-carousel";
import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { saveProduct } from "./actions";
import { ProductDetailEditor } from "./product-detail-editor";
import { ProductFormSections } from "./product-form-sections";
import { ProductMediaBlock } from "./product-media-block";
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
        nada que ver con las variantes de color o memoria: eso va en la sección{" "}
        <span className="text-slate-200">Variantes</span>
        , si hace falta.
      </p>
      <p className="mt-2 text-slate-400">
        ¿No aparece la categoría?{" "}
        <Link href={LISTAS_CATEGORIAS} className="font-medium text-violet-200 underline decoration-violet-400/50 underline-offset-2 hover:text-white">
          Crear o activar categorías
        </Link>
        .
      </p>
      {!hasDbCategories ? (
        <p className="mt-2 border-t border-white/10 pt-2 text-amber-100/90">
          No hay categorías en la base: se usan las del código. Cargá categorías en{" "}
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

  useEffect(() => {
    if (state?.error) {
      toast.error("No se pudo guardar el producto", { description: state.error });
    }
  }, [state?.error]);
  const [formDirty, setFormDirty] = useState(false);
  const [carouselThumbs, setCarouselThumbs] = useState<string[]>(() =>
    initial ? productCarouselUrls(productRowToProduct(initial)) : [],
  );

  const markFormDirty = useCallback(() => setFormDirty(true), []);

  /** Misma galería puede llegar con otro `[]` en memoria tras `router.refresh()`; sin esto se resetean extras locales. */
  const initialGalleryImagesKey = initial
    ? JSON.stringify(initial.gallery_images ?? null)
    : "null";

  const initialGalleryList = useMemo(() => {
    try {
      return parseGalleryImagesColumn(JSON.parse(initialGalleryImagesKey));
    } catch {
      return [];
    }
  }, [initialGalleryImagesKey]);

  useEffect(() => {
    setFormDirty(false);
  }, [mode, initial?.id]);

  const productSaveBarSnapshot = useMemo(() => {
    if (!formDirty && !pending && !state?.error) return null;
    return {
      isDirty: formDirty || Boolean(state?.error),
      isSaving: pending,
      error: state?.error ?? null,
      onSave: async () => {
        const el = document.getElementById("bo-product-form");
        if (el instanceof HTMLFormElement) el.requestSubmit();
      },
    };
  }, [formDirty, pending, state?.error]);

  useBackofficeSaveBarReporter(productSaveBarSnapshot);

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

  const req = true;

  const identityBlock = (
    <FieldCard>
      <h3 className="text-sm font-semibold text-white">Nombre y textos</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === "create" ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">ID del producto (sin espacios)</span>
            <input
              name="id"
              required={req}
              value={draftId}
              onChange={(e) => setDraftId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="iphone-16-pro"
              autoComplete="off"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              URL en la tienda y carpeta de fotos. Minúsculas y guiones.
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
            required={req}
            defaultValue={initial?.name ?? ""}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Resumen (listado)</span>
          <textarea
            name="short"
            required={req}
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
          <span className="mt-1 block text-[11px] text-slate-500">Visible en la tienda y filtros del catálogo.</span>
        </label>
      </div>
    </FieldCard>
  );

  const storeBlock = (
    <FieldCard>
      <h3 className="text-sm font-semibold text-white">Categoría y precio</h3>
      <CategoryHelper hasDbCategories={hasDbCategories} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Categoría del catálogo</span>
          <select
            name="category"
            required={req}
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
            required={req}
            defaultValue={initial?.price ?? ""}
            className="w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Condición</span>
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
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Orden en listados</span>
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
            <span className="mt-0.5 block text-xs text-slate-500">Desmarcado = oculto en la tienda.</span>
          </span>
        </label>
      </div>
    </FieldCard>
  );

  /** Remount solo si cambian datos de servidor (evita borrar extras locales por un `[]` nuevo tras `router.refresh()`). */
  const productMediaBlockKey =
    mode === "edit" && initial?.id
      ? `${initial.id}|${JSON.stringify(initial.image ?? null)}|${initialGalleryImagesKey}`
      : `create|${initialGalleryImagesKey}`;

  const imageBlock = (
    <ProductMediaBlock
      key={productMediaBlockKey}
      mode={mode}
      productId={productIdForUploads}
      initialImage={initial?.image}
      initialAlt={initial?.image_alt}
      initialGalleryExtras={initialGalleryList}
      skipNativeValidation={false}
      onCarouselThumbsChange={setCarouselThumbs}
      onMarkDirty={markFormDirty}
    />
  );

  const promoBlock = (
    <FieldCard>
      <h3 className="text-sm font-semibold text-white">Oferta en el listado (opcional)</h3>
      <p className="mt-1 text-xs text-slate-500">Precio tachado y % en la grilla.</p>
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
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Descuento (%)</span>
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
  );

  const variantsBlock = (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-4 text-sm leading-relaxed text-slate-300">
        <p className="font-medium text-white">¿Cuándo usar esto?</p>
        <p className="mt-1.5">
          Solo si el cliente elige color, GB, etc. y eso cambia el precio. Un solo precio →{" "}
          <strong className="text-slate-100">Saltar</strong>.
        </p>
        <p className="mt-2 text-slate-500">
          Tipos de control en{" "}
          <Link href={LISTAS_TIPOS_OPCION} className="text-violet-200 underline hover:text-white">
            Listas → Tipos de opción
          </Link>
          . Grupo tipo <strong className="text-slate-200">color</strong>: enlazá cada tono a una foto del carrusel del
          producto (sección de fotos). En la tienda, el color inicial sigue la miniatura del carrusel (índice 0).
        </p>
        <p className="mt-2 text-slate-500">
          <strong className="text-slate-200">Combinaciones vendibles</strong> (abajo): usalas cuando no todas las
          mezclas de color/capacidad existan. Si dejás esa lista vacía, el cliente puede combinar libremente los grupos
          (como antes).
        </p>
      </div>
      <FieldCard>
        <VariantGroupsEditor
          initialGroups={initial?.variant_groups}
          initialSellableVariants={initial?.sellable_variants}
          kindDefinitions={kindDefinitions}
          pricingModes={pricingModeLabels}
          carouselThumbSrcs={carouselThumbs}
          onMarkDirty={markFormDirty}
        />
      </FieldCard>
    </div>
  );

  const detailBlock = (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Viñetas de beneficios, garantía en recuadro y productos relacionados. Todo opcional.
      </p>
      <ProductDetailEditor
        key={initial?.id ?? "product-detail-new"}
        initialDetail={initial?.detail}
        catalogProductOptions={catalogProductOptions}
        currentProductId={mode === "create" ? draftId.trim() || undefined : initial?.id}
      />
    </div>
  );

  const bloqueEsencialClasico = (
    <div className="space-y-6">
      {identityBlock}
      {storeBlock}
      {imageBlock}
      {promoBlock}
    </div>
  );

  return (
    <form
      id="bo-product-form"
      key={mode === "edit" ? (initial?.id ?? "edit") : "create"}
      action={formAction}
      onChange={() => setFormDirty(true)}
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
          <Link href={LISTAS_CATEGORIAS} className="text-violet-200 underline">
            Listas → Categorías
          </Link>
          .
        </p>
      ) : null}

      <ProductFormSections
        sections={[
          {
            id: "datos",
            step: "Datos",
            title: "Datos del producto en la tienda",
            subtitle: "Nombre, categoría, precio, foto y publicación.",
            content: bloqueEsencialClasico,
          },
          {
            id: "variantes",
            step: "Variantes",
            title: "Variantes (color, memoria…)",
            subtitle: "Solo si hay opciones con distinto precio.",
            optional: true,
            content: variantsBlock,
          },
          {
            id: "texto",
            step: "Página del producto",
            title: "Texto en la página del producto",
            subtitle: "Viñetas, garantía y productos relacionados. Opcional.",
            optional: true,
            content: detailBlock,
          },
        ]}
      />

      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Los cambios quedan en el navegador hasta que pulses{" "}
        <strong className="text-white">{mode === "create" ? "Guardar producto" : "Guardar cambios"}</strong> en la barra
        inferior (se guarda todo de una vez).
      </p>
    </form>
  );
}
