"use client";

import type { Product } from "@/lib/data";
import { formatMoneyUsd } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { ProductFavoriteButton } from "@/app/components/product-favorite-button";
import { useCart } from "@/app/context/cart-context";
import { useAckFlash } from "@/app/hooks/use-ack-flash";

function productBadgeLabel(badge: string | undefined) {
  if (!badge) return null;
  const u = badge.toUpperCase();
  if (u.includes("NUEVO")) return "NUEVO";
  if (u.includes("PREMIUM") || u.includes("USADO")) return "DESTACADO";
  return u.slice(0, 12);
}

export function FeaturedProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { on: addAck, trigger: triggerAddAck } = useAckFlash();
  const badge = productBadgeLabel(product.badge);

  return (
    <article
      suppressHydrationWarning
      data-featured-product-card
      className="group relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)]"
    >
      <div className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3">
        <ProductFavoriteButton
          product={product}
          className="h-9 w-9 border-white/80 bg-white/95 shadow-sm backdrop-blur-sm sm:h-10 sm:w-10"
          iconClass="h-[18px] w-[18px] sm:h-5 sm:w-5"
        />
      </div>
      <Link href={`/tienda/${product.id}`} className="relative block aspect-[5/4] bg-neutral-50 sm:aspect-square">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
        />
        {product.condition === "used" ? (
          <span className="absolute right-3 top-3 rounded-md bg-amber-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Usado
          </span>
        ) : badge ? (
          <span className="absolute right-3 top-3 rounded-md bg-[var(--brand-from)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="flex min-h-0 flex-1 flex-col p-4 pt-3 sm:p-5 sm:pt-4">
        {product.brand?.trim() ? (
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">{product.brand.trim()}</p>
        ) : null}
        <Link href={`/tienda/${product.id}`}>
          <h3
            className={`font-display text-[15px] font-semibold leading-snug text-neutral-950 transition hover:text-[var(--brand-from)] sm:text-base ${product.brand?.trim() ? "mt-1" : ""}`}
          >
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500 sm:mt-1.5">{product.short}</p>
        <p className="font-display mt-3 text-lg font-bold tabular-nums text-neutral-950 sm:mt-4">
          {formatMoneyUsd(product.price)}
        </p>
        <div className="mt-auto w-full pt-3 sm:pt-4">
          <button
            type="button"
            onClick={() => {
              add(product);
              triggerAddAck();
            }}
            className={`flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 text-center text-sm font-semibold leading-none text-white transition hover:bg-neutral-800 active:scale-[0.99] ${addAck ? "egd-add-ack" : ""}`}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}
