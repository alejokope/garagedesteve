import { NextResponse } from "next/server";

import { loadPublishedProductsForSite } from "@/lib/site-products";

/** Evita respuestas cacheadas (CDN/navegador) con datos viejos al recargar o volver a la tienda. */
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Expires: "0",
  Pragma: "no-cache",
} as const;

/** Una respuesta con todo el catálogo; el cliente filtra y ordena en memoria. */
export async function GET() {
  try {
    const products = await loadPublishedProductsForSite();
    return NextResponse.json(products, { headers: NO_STORE });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar el catálogo";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE });
  }
}
