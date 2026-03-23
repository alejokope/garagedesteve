import Link from "next/link";

import { LoginForm } from "./login-form";

export default function BackofficeLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0e14] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">El Garage de Steve</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white">Backoffice</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Ingresá con la contraseña configurada en{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-slate-300">
            BACKOFFICE_PASSWORD
          </code>
          .
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-violet-300/90 hover:text-violet-200">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
