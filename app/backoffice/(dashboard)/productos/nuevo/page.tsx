import Link from "next/link";

import {
  listProductCategoriesPublic,
  listProductPickerOptions,
  listVariantKindDefinitionsActive,
  listVariantPricingModeLabelsAdmin,
} from "@/lib/backoffice/catalog-dictionaries-db";

import { ProductForm } from "../product-form";

export default async function NuevoProductoPage() {
  const [categoryOptions, kindDefinitions, pricingModeLabels, catalogProductOptions] =
    await Promise.all([
      listProductCategoriesPublic(),
      listVariantKindDefinitionsActive(),
      listVariantPricingModeLabelsAdmin(),
      listProductPickerOptions(),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Productos
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Nuevo producto
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Primero completá nombre, categoría y precio (Paso 1). Las variantes y el texto extra en la página del
            producto son opcionales: solo si lo necesitás. La categoría se gestiona en{" "}
            <Link href="/backoffice/listas/categorias" className="text-violet-300 underline hover:text-violet-200">
              Listas → Categorías
            </Link>
            ; no hace falta ir a &quot;Tipos de opción&quot; salvo que quieras otro tipo de control (color, etc.).
          </p>
        </div>
        <Link
          href="/backoffice/productos"
          className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
        >
          ← Volver al listado
        </Link>
      </div>
      <ProductForm
        mode="create"
        categoryOptions={categoryOptions}
        kindDefinitions={kindDefinitions}
        pricingModeLabels={pricingModeLabels}
        catalogProductOptions={catalogProductOptions}
      />
    </div>
  );
}
