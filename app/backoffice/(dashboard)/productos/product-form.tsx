"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import { categories } from "@/lib/data";
import type { ProductRow } from "@/lib/backoffice/products-db";
import type { VariantKindDefinitionRow, VariantPricingModeLabelRow } from "@/lib/catalog-dictionary-types";

import { saveProduct } from "./actions";
import { ProductDetailEditor } from "./product-detail-editor";
import { ProductFormSections } from "./product-form-sections";
import {
  getCreateWizardSteps,
  ProductFormWizardCreate,
  validateCreateWizardStep,
} from "./product-form-wizard";
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
        nada que ver con las variantes de color o memoria: eso va en el paso <span className="text-slate-200">Variantes</span>
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
  const [wizardMode, setWizardMode] = useState(mode === "create");
  const [wizardStep, setWizardStep] = useState(0);
  const [formDirty, setFormDirty] = useState(false);

  const showClassicProductBar = !(mode === "create" && wizardMode);

  useEffect(() => {
    setFormDirty(false);
  }, [mode, initial?.id, wizardMode]);

  const productSaveBarSnapshot = useMemo(() => {
    if (!showClassicProductBar) return null;
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
  }, [showClassicProductBar, formDirty, pending, state?.error]);

  useBackofficeSaveBarReporter(productSaveBarSnapshot);

  const productIdForUploads = mode === "create" ? draftId.trim() : (initial?.id ?? "");
  const categoryOptions = categoryOptionsProp.length ? categoryOptionsProp : fallbackCategories;
  const hasDbCategories = categoryOptionsProp.length > 0;
  const suppressHtmlRequired = mode === "create" && wizardMode;

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

  const req = !suppressHtmlRequired;

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
          <span className="mt-1 block text-[11px] text-slate-500">Ficha y filtro de marcas.</span>
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

  const imageBlock = (
    <ProductImageSection
      mode={mode}
      productId={productIdForUploads}
      initialUrl={initial?.image}
      initialAlt={initial?.image_alt}
      skipNativeValidation={suppressHtmlRequired}
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
          .
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

  const detailBlock = (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Galería, specs y relacionados. Opcional: la tienda puede usar valores por defecto.
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

  const introBlock = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 p-5">
        <p className="text-lg font-semibold text-white">Rápido y guiado</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Primero el nombre y el ID, después categoría y precio, una foto, y listo para publicar. Las ofertas,
          variantes y la ficha larga son opcionales.
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5">
        <p className="text-sm font-semibold text-white">Tips</p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-400">
          <li>El ID no se puede cambiar después: elegí algo estable (ej. modelo-color).</li>
          <li>Sin categoría en el menú: creala en Listas antes o después y volvé acá.</li>
          <li>Un solo guardado al final incluye variantes y ficha.</li>
        </ul>
      </div>
    </div>
  );

  const reviewBlock = (
    <p className="text-center text-sm text-slate-400">
      Revisá el resumen arriba y pulsá <strong className="text-slate-200">Guardar producto</strong> cuando estés
      listo.
    </p>
  );

  const bloqueEsencialClasico = (
    <div className="space-y-6">
      {identityBlock}
      {storeBlock}
      {imageBlock}
      {promoBlock}
    </div>
  );

  const wizardStepsMeta = getCreateWizardSteps();
  const wizardStepBodies =
    mode === "create"
      ? [
          introBlock,
          identityBlock,
          storeBlock,
          imageBlock,
          promoBlock,
          variantsBlock,
          detailBlock,
          reviewBlock,
        ]
      : [];

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (mode !== "create" || !wizardMode) return;
    const form = e.currentTarget;
    for (let s = 1; s <= 3; s++) {
      const err = validateCreateWizardStep(s, form);
      if (err) {
        e.preventDefault();
        window.alert(`${err}\n\nTe llevamos al paso correspondiente.`);
        setWizardStep(s);
        return;
      }
    }
  };

  return (
    <form
      id="bo-product-form"
      key={mode === "edit" ? (initial?.id ?? "edit") : "create"}
      action={formAction}
      onSubmit={onFormSubmit}
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

      {mode === "create" ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-medium text-white">Modo de creación</p>
            <p className="text-xs text-slate-500">Asistente paso a paso o formulario completo en una página.</p>
          </div>
          <div className="flex rounded-xl border border-white/[0.1] p-1">
            <button
              type="button"
              onClick={() => {
                if (!wizardMode) {
                  const ok = window.confirm(
                    "Al volver al asistente el formulario se arma de nuevo: si escribiste algo en modo página única sin guardar, copiá los datos o guardá antes. ¿Continuar?",
                  );
                  if (!ok) return;
                  setWizardStep(0);
                }
                setWizardMode(true);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                wizardMode ? "bg-violet-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Asistente
            </button>
            <button
              type="button"
              onClick={() => {
                if (wizardMode && wizardStep > 0) {
                  const ok = window.confirm(
                    "Al pasar a una sola página el formulario se reconstruye: lo escrito en el asistente sin guardar puede perderse. ¿Continuar?",
                  );
                  if (!ok) return;
                }
                setWizardMode(false);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !wizardMode ? "bg-violet-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Una página
            </button>
          </div>
        </div>
      ) : null}

      {mode === "create" && wizardMode ? (
        <ProductFormWizardCreate
          formId="bo-product-form"
          steps={wizardStepsMeta}
          stepIndex={wizardStep}
          onStepChange={setWizardStep}
          stepBodies={wizardStepBodies}
          pending={pending}
          onPreferClassic={() => setWizardMode(false)}
        />
      ) : (
        <>
          <ProductFormSections
            sections={[
              {
                id: "datos",
                step: "Paso 1",
                title: "Datos del producto en la tienda",
                subtitle: "Nombre, categoría, precio, foto y publicación.",
                content: bloqueEsencialClasico,
              },
              {
                id: "variantes",
                step: "Paso 2",
                title: "Variantes (color, memoria…)",
                subtitle: "Solo si hay opciones con distinto precio.",
                optional: true,
                content: variantsBlock,
              },
              {
                id: "ficha",
                step: "Paso 3",
                title: "Página detallada del producto",
                subtitle: "Galería, specs y relacionados. Opcional.",
                optional: true,
                content: detailBlock,
              },
            ]}
          />

          <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
            Los cambios quedan en el navegador hasta que pulses <strong className="text-white">Guardar cambios</strong>{" "}
            en la barra inferior (guarda todo el producto de una vez).
          </p>
        </>
      )}
    </form>
  );
}
