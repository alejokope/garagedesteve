import Link from "next/link";

import { NuevaReparacionForm } from "./nueva-reparacion-form";

export default function NuevaReparacionPage() {
  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Reparaciones
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
          Nueva reparación
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Se genera un código único automáticamente. Al enviar, se guarda el registro y se manda un
          email al cliente con el código (Resend).
        </p>
      </div>

      <NuevaReparacionForm />

      <p className="text-center text-xs text-slate-600">
        <Link href="/backoffice/reparaciones" className="text-violet-400/80 hover:text-violet-300">
          ← Volver al listado
        </Link>
      </p>
    </div>
  );
}
