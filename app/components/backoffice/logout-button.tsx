"use client";

import { logoutAction } from "@/app/backoffice/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
