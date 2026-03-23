"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/app/context/cart-context";
import { cartLineDisplayName, cartLineUnitPrice } from "@/lib/cart-line";
import { buildWhatsAppOrderMessage, whatsappUrl } from "@/lib/whatsapp";

function formatMoney(n: number) {
  if (n <= 0) return "A convenir";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, remove, setQty, total, clear } = useCart();
  const [note, setNote] = useState("");

  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const businessName =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ?? "El Garage de Steve";

  const waLink = useMemo(() => {
    const text = buildWhatsAppOrderMessage(items, total, {
      businessName,
      customerNote: note,
    });
    if (!phone) return null;
    return whatsappUrl(phone, text);
  }, [items, total, businessName, note, phone]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar"
        className="fixed inset-0 z-[70] bg-neutral-950/25 backdrop-blur-[2px] transition"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-black/[0.06] bg-[var(--surface)] pt-[env(safe-area-inset-top)] shadow-2xl shadow-neutral-950/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-start justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Carrito
            </p>
            <h2
              id="cart-title"
              className="font-display mt-1 text-xl font-semibold text-neutral-950"
            >
              Tu pedido
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/[0.1] bg-neutral-50 px-6 py-14 text-center">
              <p className="font-display font-semibold text-neutral-950">
                Tu carrito está vacío
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Agregá productos desde la tienda.
              </p>
              <Link
                href="/tienda"
                onClick={onClose}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((line) => (
                <li
                  key={line.lineKey}
                  className="flex gap-4 rounded-2xl border border-black/[0.06] bg-neutral-50/80 p-3"
                >
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <Image
                      src={line.product.image}
                      alt={line.product.imageAlt}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-950">
                      {cartLineDisplayName(line)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatMoney(cartLineUnitPrice(line))} c/u
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-black/[0.08] bg-[var(--surface)] px-1 py-0.5">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
                          onClick={() =>
                            setQty(line.lineKey, line.qty - 1)
                          }
                          aria-label="Menos"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
                          onClick={() =>
                            setQty(line.lineKey, line.qty + 1)
                          }
                          aria-label="Más"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.lineKey)}
                        className="text-xs font-medium text-neutral-500 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-black/[0.06] bg-neutral-50/50 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Color preferido, horario, retiro…"
              className="mt-2 w-full resize-none rounded-2xl border border-black/[0.08] bg-[var(--surface)] px-4 py-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950/5"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Total orientativo</span>
              <span className="font-display text-lg font-semibold tabular-nums text-neutral-950">
                {total > 0 ? formatMoney(total) : "A convenir"}
              </span>
            </div>
            {!phone ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-950">
                Configurá{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px]">
                  NEXT_PUBLIC_WHATSAPP_NUMBER
                </code>
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={waLink ?? "#"}
                onClick={(e) => {
                  if (!waLink) e.preventDefault();
                }}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition ${
                  waLink
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "cursor-not-allowed bg-neutral-200 text-neutral-400"
                }`}
              >
                Enviar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setNote("");
                }}
                className="rounded-full border border-black/[0.1] bg-[var(--surface)] py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Vaciar
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
