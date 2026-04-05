import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import { SITE_HOME_SECTION_META } from "@/lib/backoffice/site-content-sections-meta";
import { FOOTER_CONTENT_KEY } from "@/lib/footer-content-schema";
import { HOME_CONTENT_KEYS, type HomeContentKey } from "@/lib/home-public-content";

import { ContentForm } from "../content-form";

type PageProps = {
  params: Promise<{ key: string }>;
};

const HOME_KEYS_SET = new Set<string>(HOME_CONTENT_KEYS);

export default async function EditarContenidoPage({ params }: PageProps) {
  const { key } = await params;
  const decoded = decodeURIComponent(key);

  if (decoded === FOOTER_CONTENT_KEY) {
    redirect("/backoffice/contenido/footer");
  }

  if (HOME_KEYS_SET.has(decoded)) {
    const anchor = SITE_HOME_SECTION_META[decoded as HomeContentKey].anchorId;
    redirect(`/backoffice/contenido#${anchor}`);
  }

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
            Editor avanzado (JSON)
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-500">
            Solo para claves técnicas. La página de inicio se edita en{" "}
            <Link href="/backoffice/contenido" className="text-violet-300 hover:text-violet-200">
              Contenido → Página de inicio
            </Link>
            .
          </p>
        </div>
        <Link
          href="/backoffice/contenido"
          className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
        >
          ← Volver
        </Link>
      </div>
      <ContentForm mode="edit" initial={entry} />
    </div>
  );
}
