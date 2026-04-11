import Link from "next/link";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import { CART_FREE_SHIPPING_CONTENT_KEY } from "@/lib/cart-free-shipping-content-schema";
import { getCartFreeShippingPublic } from "@/lib/cart-free-shipping-content-server";

import { CartFreeShippingEditor } from "./cart-free-shipping-editor";

export default async function BackofficeCartFreeShippingPage() {
  const initial = await getCartFreeShippingPublic();
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(CART_FREE_SHIPPING_CONTENT_KEY);
    revision = row?.updated_at ?? "default";
  } catch {
    /* sin supabase */
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contenido</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Envío gratis (carrito)
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Umbral y visibilidad de la promo en el carrito. Si aún no guardaste acá, se usan valores previos de la base
            (incluido legado de contacto rápido) hasta que pulses Guardar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            Ver sitio ↗
          </Link>
          <Link href="/backoffice/contenido" className="text-sm font-medium text-violet-300/90 hover:text-violet-200">
            ← Contenido
          </Link>
        </div>
      </div>
      <CartFreeShippingEditor initial={initial} revision={revision} />
    </div>
  );
}
