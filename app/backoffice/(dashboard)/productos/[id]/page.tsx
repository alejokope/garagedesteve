import Link from "next/link";
import { notFound } from "next/navigation";

import {
  listProductCategoriesPublic,
  listProductPickerOptions,
  listVariantKindDefinitionsActive,
  listVariantPricingModeLabelsAdmin,
} from "@/lib/backoffice/catalog-dictionaries-db";
import { getProductAdmin } from "@/lib/backoffice/products-db";

import { ProductForm } from "../product-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const product = await getProductAdmin(decoded);
  if (!product) notFound();

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
            Editar producto
          </h1>
        </div>
        <Link
          href="/backoffice/productos"
          className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
        >
          ← Volver al listado
        </Link>
      </div>
      <ProductForm
        mode="edit"
        initial={product}
        categoryOptions={categoryOptions}
        kindDefinitions={kindDefinitions}
        pricingModeLabels={pricingModeLabels}
        catalogProductOptions={catalogProductOptions}
      />
    </div>
  );
}
