"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createBackofficeSessionToken } from "@/lib/backoffice/auth-token";
import { BO_AUTH_COOKIE } from "@/lib/backoffice/constants";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const expectedPwd = process.env.BACKOFFICE_PASSWORD?.trim();
  if (!expectedPwd) {
    return { error: "Falta BACKOFFICE_PASSWORD en .env.local" };
  }
  if (password !== expectedPwd) {
    return { error: "Contraseña incorrecta" };
  }

  const token = await createBackofficeSessionToken();
  if (!token) {
    return { error: "Falta BACKOFFICE_AUTH_SECRET en .env.local" };
  }

  const store = await cookies();
  store.set(BO_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/backoffice");
}

export async function logoutAction() {
  const store = await cookies();
  store.set(BO_AUTH_COOKIE, "", { maxAge: 0, path: "/" });
  redirect("/backoffice/login");
}
