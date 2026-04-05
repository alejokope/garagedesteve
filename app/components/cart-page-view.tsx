"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCatalogProducts } from "@/app/context/catalog-products-context";
import { useCart } from "@/app/context/cart-context";
import { cartLineDisplayName, cartLineUnitPrice } from "@/lib/cart-line";
import { enrichProduct } from "@/lib/catalog";
import { siteConfig } from "@/lib/site-config";
import { formatMoneyUsd } from "@/lib/format";
import { buildWhatsAppOrderMessage, whatsappUrl } from "@/lib/whatsapp";

function formatCartMoney(n: number) {
  if (n <= 0) return "A convenir";
  return formatMoneyUsd(n);
}

/** Umbral orientativo para mensaje de envío gratis (USD). */
const FREE_SHIPPING_THRESHOLD = 800;

export function CartPageView() {
  const { items, remove, setQty, total, clear } = useCart();
  const { products: catalogProducts, status: catalogStatus } = useCatalogProducts();
  const [note, setNote] = useState("");

  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const businessName =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ?? siteConfig.brandName;

  const waLink = useMemo(() => {
    const text = buildWhatsAppOrderMessage(items, total, {
      businessName,
      customerNote: note,
    });
    if (!phone) return null;
    return whatsappUrl(phone, text);
  }, [items, total, businessName, note, phone]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = total;
  const untilFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;

  const cartProductIds = useMemo(
    () => new Set(items.map((i) => i.product.id)),
    [items],
  );

  const upsellProducts = useMemo(() => {
    if (catalogStatus !== "ready" || !catalogProducts.length) return [];
    return catalogProducts
      .filter((p) => !cartProductIds.has(p.id))
      .slice(0, 6)
      .map(enrichProduct);
  }, [catalogProducts, catalogStatus, cartProductIds]);

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-28 pt-[3.5rem] sm:pb-12 sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <nav aria-label="Migas de pan" className="text-sm text-neutral-500">
          <Link href="/" className="hover:text-[var(--brand-from)]">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="font-medium text-neutral-700">Carrito de compras</span>
        </nav>

        <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Tu carrito
            </h1>
            <p className="mt-1 text-sm text-neutral-500 sm:text-base">
              {count === 0
                ? "No hay productos en el carrito"
                : `${count} ${count === 1 ? "producto" : "productos"} seleccionado${count === 1 ? "" : "s"}`}
            </p>
          </div>
          {count > 0 ? (
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                hasFreeShipping
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                  : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {hasFreeShipping ? "✓" : "🚚"}
              </span>
              {hasFreeShipping
                ? "¡Envío gratis en este pedido!"
                : `Envío gratis en compras desde ${formatCartMoney(FREE_SHIPPING_THRESHOLD)}${
                    subtotal > 0
                      ? ` · Te faltan ${formatCartMoney(untilFree)}`
                      : ""
                  }`}
            </div>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-10 text-center shadow-sm sm:p-14">
            <p className="font-display text-lg font-semibold text-neutral-900">
              Tu carrito está vacío
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Agregá productos desde el catálogo para armar tu pedido.
            </p>
            <Link
              href="/tienda"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-neutral-950 px-8 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.2)] transition hover:bg-neutral-800"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {/* Columna principal */}
            <div className="min-w-0 flex-1 space-y-6">
              <ul className="space-y-4">
                {items.map((line) => {
                  const unit = cartLineUnitPrice(line);
                  const lineTotal = unit > 0 ? unit * line.qty : 0;
                  return (
                    <li
                      key={line.lineKey}
                      className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28">
                        <Image
                          src={line.product.image}
                          alt={line.product.imageAlt}
                          fill
                          sizes="(max-width: 640px) 96px, 112px"
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
                          {line.product.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                          {cartLineDisplayName(line)}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-1 py-0.5">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-neutral-600 transition hover:bg-white"
                              onClick={() => setQty(line.lineKey, line.qty - 1)}
                              aria-label="Quitar uno"
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-neutral-900">
                              {line.qty}
                            </span>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-neutral-600 transition hover:bg-white"
                              onClick={() => setQty(line.lineKey, line.qty + 1)}
                              aria-label="Agregar uno"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-display text-base font-bold tabular-nums text-neutral-900 sm:text-lg">
                              {lineTotal > 0 ? formatCartMoney(lineTotal) : "A convenir"}
                            </p>
                            <button
                              type="button"
                              onClick={() => remove(line.lineKey)}
                              className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                              aria-label="Eliminar producto"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <label htmlFor="cart-note" className="text-sm font-semibold text-neutral-900">
                  Notas del pedido
                </label>
                <p className="mt-1 text-xs text-neutral-500">
                  Capacidad, color, forma de pago o retiro en Microcentro — lo vemos todo por WhatsApp.
                </p>
                <textarea
                  id="cart-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Escribí cualquier detalle que quieras que tengamos en cuenta…"
                  className="mt-3 w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--brand-from)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-from)]/20"
                />
              </div>

              {upsellProducts.length > 0 ? (
                <section aria-labelledby="upsell-heading" className="pt-2">
                  <h2
                    id="upsell-heading"
                    className="font-display text-lg font-semibold text-neutral-900"
                  >
                    Completá tu compra
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Accesorios y más para tu equipo
                  </p>
                  <div className="touch-scroll-x mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {upsellProducts.map((p) => (
                      <article
                        key={p.id}
                        className="w-[min(11rem,42vw)] shrink-0 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm"
                      >
                        <Link href={`/tienda/${p.id}`} className="relative block aspect-square bg-neutral-50">
                          <Image
                            src={p.image}
                            alt={p.imageAlt}
                            fill
                            sizes="160px"
                            className="object-contain p-2"
                          />
                        </Link>
                        <p className="mt-2 line-clamp-2 font-display text-xs font-semibold text-neutral-900">
                          {p.name}
                        </p>
                        <p className="mt-1 font-display text-sm font-bold tabular-nums text-neutral-900">
                          {formatCartMoney(p.price)}
                        </p>
                        <Link
                          href={`/tienda/${p.id}`}
                          className="mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-xl bg-[var(--brand-from)]/10 text-xs font-semibold text-[var(--brand-from)] transition hover:bg-[var(--brand-from)]/15"
                        >
                          <span className="text-base leading-none">+</span> Ver producto
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <h2 className="font-display text-sm font-semibold text-neutral-900">
                  Medios de pago
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Los precios de la tienda están en <span className="font-medium text-neutral-800">USD</span>. Las
                  formas de pago y el tipo de cambio (si pagás en otra moneda) las coordinamos por{" "}
                  <span className="font-medium text-[#25D366]">WhatsApp</span>. También podés usar{" "}
                  <span className="font-medium text-[#25D366]">Mercado Pago</span> u otros medios según lo que
                  acordemos. En la web no cobramos ni tomamos tarjeta.
                </p>
              </section>
            </div>

            {/* Resumen — desktop sidebar */}
            <aside className="lg:sticky lg:top-24 lg:w-[min(100%,22rem)] lg:shrink-0">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-neutral-900">
                  Resumen del pedido
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-neutral-600">
                    <dt>Subtotal</dt>
                    <dd className="font-medium tabular-nums text-neutral-900">
                      {subtotal > 0 ? formatCartMoney(subtotal) : "A convenir"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 text-neutral-600">
                    <dt>Envío</dt>
                    <dd className="font-semibold text-emerald-600">
                      {hasFreeShipping ? "Gratis" : "A coordinar"}
                    </dd>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex justify-between gap-4">
                      <dt className="font-display text-base font-semibold text-neutral-900">Total</dt>
                      <dd className="font-display text-xl font-bold tabular-nums text-neutral-900">
                        {subtotal > 0 ? formatCartMoney(subtotal) : "A convenir"}
                      </dd>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Precios orientativos en USD; cerramos valor y retiro en oficina (Microcentro) por WhatsApp.
                    </p>
                  </div>
                </dl>

                {!phone ? (
                  <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    Configurá{" "}
                    <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px]">
                      NEXT_PUBLIC_WHATSAPP_NUMBER
                    </code>{" "}
                    en <code className="text-[11px]">.env.local</code>.
                  </p>
                ) : null}

                <a
                  href={waLink ?? "#"}
                  onClick={(e) => {
                    if (!waLink) e.preventDefault();
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition ${
                    waLink
                      ? "bg-[#25D366] hover:bg-[#20bd5a]"
                      : "cursor-not-allowed bg-neutral-300"
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Finalizar por WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setNote("");
                  }}
                  className="mt-3 w-full rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  Vaciar carrito
                </button>

                <div className="mt-6 flex items-start gap-3 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-from)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <p>
                    <span className="font-semibold text-neutral-800">Compra asesorada</span>
                    <br />
                    Equipos premium, garantía y condiciones las cerramos por chat antes de pagar.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Barra fija mobile: total + WhatsApp */}
      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Total</p>
              <p className="font-display text-lg font-bold tabular-nums text-neutral-900">
                {subtotal > 0 ? formatCartMoney(subtotal) : "A convenir"}
              </p>
            </div>
            <a
              href={waLink ?? "#"}
              onClick={(e) => {
                if (!waLink) e.preventDefault();
              }}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white ${
                waLink ? "bg-[#25D366] hover:bg-[#20bd5a]" : "cursor-not-allowed bg-neutral-300"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
