import { NextResponse } from "next/server";

import { loadFlatDeviceCatalog, type FlatDeviceCatalog } from "@/lib/bot/flat-device-catalog";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export type ItemsApiBody = FlatDeviceCatalog;

function isAuthorized(request: Request): boolean {
  const expected = process.env.PROMETHEO_API_KEY?.trim();
  if (!expected) return true;
  const header = request.headers.get("authorization")?.trim() ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token === expected;
}

/** Catálogo plano por categoría. Solo productos activos (`published` en el backoffice). */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
  }

  try {
    const body = await loadFlatDeviceCatalog();
    return NextResponse.json(body satisfies ItemsApiBody, { headers: NO_STORE });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar items";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE });
  }
}
