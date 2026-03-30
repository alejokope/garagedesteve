import { NextResponse } from "next/server";

import { getRepairByTrackingCodePublic } from "@/lib/backoffice/repairs-db";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const code =
      body && typeof body === "object" && "code" in body && typeof (body as { code: unknown }).code === "string"
        ? (body as { code: string }).code
        : "";
    const data = await getRepairByTrackingCodePublic(code);
    if (!data) {
      return NextResponse.json({ ok: false as const, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true as const, data });
  } catch {
    return NextResponse.json({ ok: false as const, error: "server" }, { status: 500 });
  }
}
