"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSellQuotes } from "@/app/context/sell-quotes-context";
import { useTradeIn } from "@/app/context/trade-in-context";
import { formatSellPrice } from "@/lib/sell-pricing-schema";
import { sellQuoteTitle, sellQuoteToTradeInOffer } from "@/lib/sell-quote";

export function SellQuotesPageView() {
  const router = useRouter();
  const { quotes, removeQuote, hydrated } = useSellQuotes();
  const { setOffer } = useTradeIn();

  return (
    <div className="min-h-[50vh] bg-[#f9fafb]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <nav className="text-sm text-neutral-600" aria-label="Migas de pan">
          <Link href="/" className="hover:text-[var(--brand-from)]">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="font-medium text-neutral-900">Mis cotizaciones</span>
        </nav>

        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-neutral-900 sm:mt-6 sm:text-4xl">
          Mis cotizaciones
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          Acá quedan las referencias que guardaste desde la experiencia de{" "}
          <Link href="/vende-tu-equipo" className="font-medium text-neutral-900 underline underline-offset-2">
            vendé tu equipo
          </Link>
          . Podés usar una en el carrito como parte de pago del checkout.
        </p>

        {!hydrated ? (
          <p className="mt-10 text-sm text-neutral-500">Cargando…</p>
        ) : quotes.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-neutral-700">Todavía no guardaste ninguna cotización.</p>
            <Link
              href="/vende-tu-equipo"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--brand-from)] px-6 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Cotizar un iPhone
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((q) => (
              <li
                key={q.id}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <p className="font-display text-base font-semibold text-neutral-900">
                  {sellQuoteTitle(q)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(q.createdAt).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-4 font-display text-2xl font-bold tabular-nums text-neutral-900">
                  {formatSellPrice(q.price, q.currency)}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{q.batteryShort}</p>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOffer(sellQuoteToTradeInOffer(q));
                      router.push("/carrito");
                    }}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Usar en el carrito
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuote(q.id)}
                    className="py-2 text-center text-xs font-medium text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
