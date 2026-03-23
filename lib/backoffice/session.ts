import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BO_AUTH_COOKIE } from "@/lib/backoffice/constants";
import { createBackofficeSessionToken } from "@/lib/backoffice/auth-token";

export async function requireBackofficeSession() {
  if (process.env.SKIP_BO_AUTH === "true") return;

  const cookie = (await cookies()).get(BO_AUTH_COOKIE)?.value;
  const expected = await createBackofficeSessionToken();
  if (!expected || cookie !== expected) {
    redirect("/backoffice/login");
  }
}
