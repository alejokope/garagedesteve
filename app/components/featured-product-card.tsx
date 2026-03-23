"use client";

import type { Product } from "@/lib/data";
import { formatMoneyArs } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cart-context";

function productBadgeLabel(badge: string | undefined) {
  if (!badge) return null;
  const u = badge.toUpperCase();
  if (u.includes("NUEVO")) return "NUEVO";
  if (u.includes("PREMIUM") || u.includes("USADO")) return "DESTACADO";
  return u.slice(0, 12);
}

export function FeaturedProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const badge = productBadgeLabel(product.badge);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)]">
      <Link href={`/tienda/${product.id}`} className="relative block aspect-square bg-neutral-50">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
        />
        {badge ? (
          <span className="absolute right-3 top-3 rounded-md bg-[var(--brand-from)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5 pt-4">
        <Link href={`/tienda/${product.id}`}>
          <h3 className="font-display text-base font-semibold leading-snug text-neutral-950 transition hover:text-[var(--brand-from)]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500">{product.short}</p>
        <p className="font-display mt-4 text-lg font-bold tabular-nums text-neutral-950">
          {formatMoneyArs(product.price)}
        </p>
        <button
          type="button"
          onClick={() => add(product)}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
