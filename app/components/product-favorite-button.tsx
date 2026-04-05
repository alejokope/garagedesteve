"use client";

import { useFavorites } from "@/app/context/favorites-context";
import { useAckFlash } from "@/app/hooks/use-ack-flash";
import type { Product } from "@/lib/data";

export function ProductFavoriteButton({
  product,
  className = "",
  iconClass = "h-[22px] w-[22px]",
  labelOn = "Quitar de favoritos",
  labelOff = "Agregar a favoritos",
}: {
  product: Product;
  className?: string;
  iconClass?: string;
  labelOn?: string;
  labelOff?: string;
}) {
  const { has, toggle } = useFavorites();
  const on = has(product.id);
  const { on: pop, trigger: triggerPop } = useAckFlash(480);

  return (
    <button
      type="button"
      onClick={() => {
        const wasOn = on;
        toggle(product);
        if (!wasOn) triggerPop();
      }}
      className={`flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 ${pop ? "egd-fav-pop" : ""} ${className}`.trim()}
      aria-label={on ? labelOn : labelOff}
      aria-pressed={on}
    >
      <svg
        className={`${iconClass} ${on ? "fill-red-500 text-red-500" : ""}`}
        fill={on ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
