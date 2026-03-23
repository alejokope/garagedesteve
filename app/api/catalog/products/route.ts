import { NextResponse } from "next/server";

import { loadPublishedProductsForSite } from "@/lib/site-products";

/** Una respuesta con todo el catálogo; el cliente filtra y ordena en memoria. */
export async function GET() {
  try {
    const products = await loadPublishedProductsForSite();
    return NextResponse.json(products);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar el catálogo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
