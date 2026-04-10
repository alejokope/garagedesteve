"use client";

import { useLinkStatus } from "next/link";

/**
 * Indicador fijo (sin saltos de layout) mientras el destino del Link carga.
 * Debe renderizarse como descendiente directo del árbol del <Link>.
 */
export function LinkPendingGlyph({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={`inline-flex size-3.5 shrink-0 items-center justify-center ${className}`}
      aria-hidden
    >
      <span
        className={`size-3.5 rounded-full border-2 border-violet-500/25 border-t-violet-300 transition-opacity duration-150 ${
          pending ? "animate-spin opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
