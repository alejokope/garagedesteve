import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createBackofficeSessionToken } from "@/lib/backoffice/auth-token";
import { BO_AUTH_COOKIE } from "@/lib/backoffice/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/backoffice")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/backoffice/login")) {
    return NextResponse.next();
  }
  if (process.env.SKIP_BO_AUTH === "true") {
    return NextResponse.next();
  }

  const token = request.cookies.get(BO_AUTH_COOKIE)?.value;
  const expected = await createBackofficeSessionToken();
  if (!expected || token !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = "/backoffice/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice", "/backoffice/:path*"],
};
