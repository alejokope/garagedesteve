"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductFavoriteButton } from "@/app/components/product-favorite-button";
import { useCart } from "@/app/context/cart-context";
import { useFloatingContact } from "@/app/context/floating-contact-context";
import { useAckFlash } from "@/app/hooks/use-ack-flash";
import { enrichProduct } from "@/lib/catalog";
import type { Product } from "@/lib/data";
import { getProductById } from "@/lib/data";
import { formatMoneyUsd } from "@/lib/format";
import {
  buildFallbackDetail,
  getDetailPairs,
  getProductDetailExtra,
  type ProductDetailBlock,
  type ProductDetailPair,
} from "@/lib/product-detail-data";
import {
  defaultVariantSelections,
  describeVariantSelections,
  getVariantUiKind,
  resolveVariantPrice,
  type VariantSelections,
} from "@/lib/product-variants";
import { whatsappUrl } from "@/lib/whatsapp";

function isProductDetailBlock(v: unknown): v is ProductDetailBlock {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.images)) return false;
  if (typeof o.longDescription !== "string") return false;
  return true;
}

function resolveProductDetail(product: Product): ProductDetailBlock {
  if (isProductDetailBlock(product.detail)) return product.detail;
  return getProductDetailExtra(product.id) ?? buildFallbackDetail(product);
}

function DetailKvList({ pairs }: { pairs: ProductDetailPair[] }) {
  if (!pairs.length) return null;
  return (
    <section className="mt-4" aria-labelledby="product-detail-kv-heading">
      <h2
        id="product-detail-kv-heading"
        className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500/70"
      >
        Detalles
      </h2>
      <dl className="mt-2 space-y-1.5 border-l border-neutral-200/50 pl-3.5 text-[13px] leading-[1.45]">
        {pairs.map((row, i) =>
          row.key ? (
            <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <dt className="shrink-0 text-[12px] font-normal text-neutral-500">{row.key}</dt>
              <span className="translate-y-px text-[10px] text-neutral-300/80 select-none" aria-hidden>
                ·
              </span>
              <dd className="m-0 min-w-0 font-normal text-neutral-600">{row.value}</dd>
            </div>
          ) : (
            <div key={i}>
              <dt className="sr-only">Descripción</dt>
              <dd className="m-0 font-normal text-neutral-600">{row.value}</dd>
            </div>
          ),
        )}
      </dl>
    </section>
  );
}

function SmallProductCard({
  id,
  productLookup,
}: {
  id: string;
  productLookup?: Record<string, Product>;
}) {
  const p = productLookup?.[id] ?? getProductById(id);
  const { add } = useCart();
  const { on: addAck, trigger: triggerAddAck } = useAckFlash();
  if (!p) return null;
  const e = enrichProduct(p);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <div className="absolute left-2 top-2 z-10">
        <ProductFavoriteButton
          product={p}
          className="h-8 w-8 border-white/90 bg-white/95 shadow-sm"
          iconClass="h-4 w-4"
        />
      </div>
      <Link href={`/tienda/${p.id}`} className="relative aspect-square bg-neutral-50">
        <Image src={p.image} alt={p.imageAlt} fill className="object-contain p-3" sizes="200px" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {p.brand?.trim() ? (
          <p className="text-[10px] font-bold uppercase text-neutral-500">{p.brand.trim()}</p>
        ) : null}
        <p className={`text-[10px] font-bold uppercase text-neutral-400 ${p.brand?.trim() ? "mt-1" : ""}`}>
          {e.categoryLabel}
        </p>
        <Link href={`/tienda/${p.id}`} className="font-display mt-1 text-sm font-semibold text-neutral-900 line-clamp-2 hover:text-[var(--brand-from)]">
          {p.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{p.short}</p>
        <p className="font-display mt-2 text-sm font-bold">{formatMoneyUsd(p.price)}</p>
        <button
          type="button"
          onClick={() => {
            add(p);
            triggerAddAck();
          }}
          className={`mt-3 rounded-xl bg-[var(--brand-from)] py-2 text-xs font-semibold text-white transition hover:opacity-95 ${addAck ? "egd-add-ack" : ""}`}
        >
          Comprar
        </button>
      </div>
    </article>
  );
}

export function ProductDetailView({
  product,
  productLookup,
}: {
  product: Product;
  /** Catálogo ya resuelto en el servidor (Supabase + estático) para relacionados/accesorios. */
  productLookup?: Record<string, Product>;
}) {
  const detail = useMemo(() => resolveProductDetail(product), [product]);
  const enriched = useMemo(() => enrichProduct(product), [product]);

  const groups = product.variantGroups ?? [];
  const [selections, setSelections] = useState<VariantSelections>(() =>
    defaultVariantSelections(groups),
  );

  const displayPrice = resolveVariantPrice(
    product.price,
    groups,
    selections,
  );
  const hasDbPromo =
    enriched.compareAtPrice != null &&
    enriched.discountPercent != null &&
    enriched.discountPercent > 0 &&
    displayPrice > 0 &&
    enriched.compareAtPrice > displayPrice;
  const compareAt = hasDbPromo ? enriched.compareAtPrice : null;
  const pctOff = hasDbPromo ? enriched.discountPercent : null;

  const { add } = useCart();
  const { on: addMainAck, trigger: triggerAddMainAck } = useAckFlash();
  const { phoneDigits, brandName: businessName } = useFloatingContact();

  const setVariant = (groupId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const variantSummary = describeVariantSelections(groups, selections);
  const waHref =
    phoneDigits && phoneDigits.length > 0
      ? whatsappUrl(
          phoneDigits,
          `Hola ${businessName}, consulto por: ${product.name}${variantSummary.length ? ` — ${variantSummary.join(", ")}` : ""}.`,
        )
      : null;

  const categoryBreadcrumb =
    product.category === "iphone"
      ? "iPhone"
      : product.category === "ipad"
        ? "iPad"
        : product.category.toUpperCase();

  const addToCart = () => {
    add(product, groups.length ? selections : undefined);
    triggerAddMainAck();
  };

  const detailPairs = useMemo(() => getDetailPairs(detail), [detail]);

  return (
    <div className="bg-[#f9fafb]">
      <div className="border-b border-[var(--border)] bg-neutral-100/80">
        <div className="mx-auto max-w-6xl px-4 py-3 text-sm text-neutral-600 sm:px-8">
          <nav aria-label="Migas de pan">
            <Link href="/" className="hover:text-[var(--brand-from)]">
              Inicio
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <Link href="/tienda" className="hover:text-[var(--brand-from)]">
              Catálogo
            </Link>
            <span className="mx-2 text-neutral-400">/</span>
            <span className="text-neutral-500">{categoryBreadcrumb}</span>
            <span className="mx-2 text-neutral-400">/</span>
            <span className="font-medium text-neutral-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                priority
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              {product.brand?.trim() ? (
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  {product.brand.trim()}
                </span>
              ) : null}
              {product.condition === "used" ? (
                <span className="rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                  Usado
                </span>
              ) : product.condition === "new" ? (
                <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                  Nuevo
                </span>
              ) : null}
            </div>
            <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
            {detail.warranty?.trim() ? (
              <div className="mt-5 rounded-2xl border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-50 to-teal-50/80 px-5 py-4 shadow-sm ring-1 ring-emerald-200/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                  Garantía
                </p>
                <p className="mt-2 text-[15px] font-medium leading-relaxed text-emerald-950">
                  {detail.warranty.trim()}
                </p>
              </div>
            ) : null}
            {detailPairs.length > 0 ? <DetailKvList pairs={detailPairs} /> : null}

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="font-display text-3xl font-bold tabular-nums text-neutral-950">
                {formatMoneyUsd(displayPrice)}
              </span>
              {compareAt && compareAt > displayPrice ? (
                <span className="text-lg text-neutral-400 line-through">
                  {formatMoneyUsd(compareAt)}
                </span>
              ) : null}
              {pctOff ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                  -{pctOff}%
                </span>
              ) : null}
            </div>

            {groups.map((g) => (
              <div key={g.id} className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {g.label}
                </p>
                {getVariantUiKind(g) === "color" ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {g.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        title={opt.label}
                        onClick={() => setVariant(g.id, opt.id)}
                        className={`h-11 w-11 rounded-xl border-2 shadow-inner transition ${
                          selections[g.id] === opt.id
                            ? "border-[var(--brand-from)] ring-2 ring-[var(--brand-from)]/25"
                            : "border-neutral-200"
                        }`}
                        style={
                          opt.hex
                            ? { backgroundColor: opt.hex }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : getVariantUiKind(g) === "storage" ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {g.options.map((opt) => {
                      const showPrice =
                        g.pricingMode === "absolute" && opt.price != null
                          ? opt.price
                          : resolveVariantPrice(product.price, [g], {
                              [g.id]: opt.id,
                            });
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVariant(g.id, opt.id)}
                          className={`rounded-xl border-2 px-3 py-3 text-left transition ${
                            selections[g.id] === opt.id
                              ? "border-[var(--brand-from)] bg-[var(--brand-from)]/5"
                              : "border-neutral-200 bg-white hover:border-neutral-300"
                          }`}
                        >
                          <span className="block text-sm font-semibold text-neutral-900">
                            {opt.label}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-neutral-600">
                            {formatMoneyUsd(showPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVariant(g.id, opt.id)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          selections[g.id] === opt.id
                            ? "border-[var(--brand-from)] bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                <span className="text-emerald-600">✓</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Disponible</p>
                  <p className="text-xs text-neutral-600">Stock sujeto a confirmación</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--brand-from)]/25 bg-[var(--brand-from)]/5 px-4 py-3">
                <span className="text-[var(--brand-from)]">🛡</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Garantía</p>
                  <p className="text-xs text-neutral-600">
                    {detail.warranty?.trim()
                      ? "Cobertura detallada en el recuadro superior."
                      : "12 meses oficial · consultá condiciones"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addToCart}
                className={`inline-flex flex-1 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[var(--brand-from)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-from)]/25 transition hover:opacity-95 ${addMainAck ? "egd-add-ack" : ""}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                Agregar al carrito
              </button>
              <ProductFavoriteButton
                product={product}
                className="h-[52px] w-[52px] shrink-0"
                iconClass="h-6 w-6"
              />
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a] sm:w-auto"
                >
                  Consultar por WhatsApp
                </a>
              ) : null}
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
              <p className="text-sm font-semibold text-neutral-900">Garantía de confianza</p>
              <ul className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                <li className="flex gap-2">✓ 100% original</li>
                <li className="flex gap-2">✓ Soporte técnico</li>
                <li className="flex gap-2">✓ Entrega coordinada</li>
                <li className="flex gap-2">✓ Medios de pago</li>
              </ul>
            </div>
          </div>
        </div>

        {detail.relatedIds.length > 0 ? (
          <section className="mt-20">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-neutral-900">También te puede interesar</h2>
              <Link href="/tienda" className="text-sm font-semibold text-[var(--brand-from)] hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {detail.relatedIds.map((id) => (
                <SmallProductCard key={id} id={id} productLookup={productLookup} />
              ))}
            </div>
          </section>
        ) : null}

        {detail.accessoryIds.length > 0 ? (
          <section className="mt-16">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-neutral-900">Accesorios recomendados</h2>
              <Link href="/tienda?cat=otros#catalogo" className="text-sm font-semibold text-[var(--brand-from)] hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {detail.accessoryIds.map((id) => (
                <SmallProductCard key={id} id={id} productLookup={productLookup} />
              ))}
            </div>
          </section>
        ) : null}

      </div>
    </div>
  );
}
