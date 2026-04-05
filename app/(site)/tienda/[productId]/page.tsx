import { ProductDetailView } from "@/app/components/product-detail-view";
import { SiteFooter } from "@/app/components/site-footer";
import type { Product } from "@/lib/data";
import {
  cachedPublishedProductsForSite,
  getPublishedProductForSite,
  listPublishedProductIdsForSite,
} from "@/lib/site-products";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ productId: string }> };

export const revalidate = 0;

export async function generateStaticParams() {
  const ids = await listPublishedProductIdsForSite();
  return ids.map((productId) => ({ productId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await getPublishedProductForSite(productId);
  if (!product) return { title: "Producto" };
  return {
    title: `${product.name} | The iPhone`,
    description: product.short,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params;
  const product = await getPublishedProductForSite(productId);
  if (!product) notFound();

  const catalog = await cachedPublishedProductsForSite();
  const productLookup: Record<string, Product> = {};
  for (const p of catalog) productLookup[p.id] = p;

  return (
    <main className="min-h-screen pt-[3.5rem] sm:pt-16">
      <ProductDetailView
        key={product.id}
        product={product}
        productLookup={productLookup}
      />
      <SiteFooter />
    </main>
  );
}
