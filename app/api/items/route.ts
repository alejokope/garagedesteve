import { NextResponse } from "next/server";

import {
  applyFlatDeviceFilters,
  filterFlatDeviceItems,
  parseFlatDeviceStateFilter,
  type FlatDeviceCatalog,
  type FlatDeviceItem,
} from "@/lib/bot/flat-device-catalog";
import {
  getCachedFlatDeviceCatalog,
  FLAT_DEVICE_CATALOG_REVALIDATE_SECONDS,
} from "@/lib/published-catalog-cache";

const CACHE_HEADERS = {
  "Cache-Control": `private, max-age=0, s-maxage=${FLAT_DEVICE_CATALOG_REVALIDATE_SECONDS}`,
} as const;

export type ItemsApiBody = FlatDeviceCatalog;
export type ItemsApiFilteredBody = FlatDeviceItem[];

/** Catálogo plano por categoría. Solo productos activos (`published` en el backoffice). */
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const product = params.get("product")?.trim() ?? "";
    const state = parseFlatDeviceStateFilter(params.get("state")?.trim() ?? "");
    const catalog = await getCachedFlatDeviceCatalog();

    if (product) {
      const items = filterFlatDeviceItems(catalog, { product, state: state ?? undefined });
      return NextResponse.json(items satisfies ItemsApiFilteredBody, { headers: CACHE_HEADERS });
    }

    const body = applyFlatDeviceFilters(catalog, { state: state ?? undefined });
    return NextResponse.json(body satisfies ItemsApiBody, { headers: CACHE_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
