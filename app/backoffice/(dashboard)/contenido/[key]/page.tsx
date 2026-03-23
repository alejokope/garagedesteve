import Link from "next/link";
import { notFound } from "next/navigation";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";

import { ContentForm } from "../content-form";

type PageProps = {
  params: Promise<{ key: string }>;
};

export default async function EditarContenidoPage({ params }: PageProps) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);
  const entry = await getContentEntryAdmin(decoded);
  if (!entry) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Contenido
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Editar entrada
          </h1>
        </div>
        <Link
          href="/backoffice/contenido"
          className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
        >
          ← Volver al listado
        </Link>
      </div>
      <ContentForm mode="edit" initial={entry} />
    </div>
  );
}
