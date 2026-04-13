"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCatalogProducts } from "@/app/context/catalog-products-context";
import { useCart } from "@/app/context/cart-context";
import { useFavorites } from "@/app/context/favorites-context";
import { ProductFavoriteButton } from "@/app/components/product-favorite-button";
import { StoreRemoteImage } from "@/app/components/store-remote-image";
import { useAckFlash } from "@/app/hooks/use-ack-flash";
import { catalogProductPreviewImage, enrichProduct } from "@/lib/catalog";
import type { Product } from "@/lib/data";
import { formatMoneyUsd } from "@/lib/format";

export function FavoritesPageView() {
  const { items, remove } = useFavorites();
  const { productLookup } = useCatalogProducts();
  const { add } = useCart();

  const rows = useMemo(
    () =>
      items.map((stored) => {
        const live = productLookup[stored.id] ?? stored;
        return { product: live, enriched: enrichProduct(live) };
      }),
    [items, productLookup],
  );

  return (
    <div className="bg-[#f9fafb] min-h-[50vh]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <nav className="text-sm text-neutral-600" aria-label="Migas de pan">
          <Link href="/" className="hover:text-[var(--brand-from)]">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="font-medium text-neutral-900">Favoritos</span>
        </nav>

        <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Favoritos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          Guardamos tus productos en este dispositivo. Podés agregarlos al carrito o volver al catálogo cuando quieras.
        </p>

        {rows.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm">
            <p className="text-neutral-700">Todavía no tenés favoritos.</p>
            <Link
              href="/tienda"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--brand-from)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ product, enriched }) => (
              <FavoriteRow
                key={product.id}
                product={product}
                enriched={enriched}
                onAdd={() => add(product)}
                onRemove={() => remove(product.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FavoriteRow({
  product,
  enriched,
  onAdd,
  onRemove,
}: {
  product: Product;
  enriched: ReturnType<typeof enrichProduct>;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const { on: addFlash, trigger: triggerAdd } = useAckFlash();
  const showDiscount =
    enriched.discountPercent != null &&
    enriched.compareAtPrice != null &&
    enriched.compareAtPrice > product.price;

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <Link href={`/tienda/${product.id}`} className="relative block aspect-[4/3] bg-neutral-50">
        <StoreRemoteImage
          src={catalogProductPreviewImage(product)}
          alt={product.imageAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {product.brand?.trim() ? (
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-600">
                {product.brand.trim()}
              </p>
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {enriched.categoryLabel}
            </p>
            <Link
              href={`/tienda/${product.id}`}
              className="font-display mt-1 block text-base font-semibold text-neutral-900 hover:text-[var(--brand-from)]"
            >
              {product.name}
            </Link>
          </div>
          <ProductFavoriteButton product={product} className="h-10 w-10 shrink-0" iconClass="h-5 w-5" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{product.short}</p>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          {showDiscount ? (
            <p className="text-xs text-neutral-400 line-through">
              {formatMoneyUsd(enriched.compareAtPrice!)}
            </p>
          ) : null}
          <p className="font-display text-lg font-bold tabular-nums text-neutral-900">
            {formatMoneyUsd(product.price)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onAdd();
              triggerAdd();
            }}
            className={`inline-flex flex-1 min-w-[8rem] items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 ${addFlash ? "egd-add-ack" : ""}`}
          >
            Agregar al carrito
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}
