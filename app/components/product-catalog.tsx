"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "@/app/context/cart-context";
import {
  categories,
  products,
  type CategoryId,
} from "@/lib/data";

const categorySet = new Set<CategoryId>(
  categories.filter((c) => c.id !== "all").map((c) => c.id as CategoryId),
);

function formatMoney(n: number) {
  if (n <= 0) return "Consultar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  basePath?: string;
};

export function ProductCatalog({ basePath = "/tienda" }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { add } = useCart();

  const base = basePath.replace(/\/$/, "") || "/tienda";

  const filter = useMemo((): CategoryId | "all" => {
    const cat = searchParams.get("cat");
    if (cat && categorySet.has(cat as CategoryId)) return cat as CategoryId;
    return "all";
  }, [searchParams]);

  const setFilter = (next: CategoryId | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("cat");
    else params.set("cat", next);
    const q = params.toString();
    router.replace(q ? `${base}?${q}#catalogo` : `${base}#catalogo`, {
      scroll: false,
    });
  };

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <section
      id="catalogo"
      className="scroll-mt-24 border-t border-black/[0.06] bg-[var(--bg)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="font-display text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Productos
        </h2>
        <p className="mt-2 text-[15px] text-neutral-600">
          Precios orientativos. Confirmación final por WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  active
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "bg-[var(--surface)] text-neutral-600 shadow-sm ring-1 ring-black/[0.06] hover:bg-neutral-50"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glow)]"
            >
              <div className="relative aspect-[4/3] bg-neutral-100">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                {p.badge ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--surface)]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-800 shadow-sm backdrop-blur-sm">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-semibold leading-snug text-neutral-950">
                  {p.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                  {p.short}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
                  <span className="text-sm font-semibold tabular-nums text-neutral-950">
                    {formatMoney(p.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-neutral-500">
            No hay productos en esta categoría.
          </p>
        ) : null}
      </div>
    </section>
  );
}
