import Link from "next/link";

import { ContentForm } from "../content-form";

export default function NuevaEntradaContenidoPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Contenido
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Nueva entrada (técnica)
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-500">
            La home se edita con formularios en{" "}
            <Link href="/backoffice/contenido" className="text-violet-300 hover:text-violet-200">
              Contenido
            </Link>
            . Esta pantalla es solo si necesitás crear una clave nueva a mano.
          </p>
        </div>
        <Link
          href="/backoffice/contenido"
          className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
        >
          ← Volver al listado
        </Link>
      </div>
      <ContentForm mode="create" />
    </div>
  );
}
