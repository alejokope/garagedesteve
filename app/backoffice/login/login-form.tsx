"use client";

import { useActionState } from "react";

import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
          Contraseña del backoffice
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm text-white outline-none ring-violet-500/40 placeholder:text-slate-500 focus:ring-2"
          placeholder="••••••••"
        />
      </div>
      {state?.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200/95">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-opacity disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
