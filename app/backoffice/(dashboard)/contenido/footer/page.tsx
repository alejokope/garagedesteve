import Link from "next/link";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  FOOTER_CONTENT_KEY,
  mergeFooterContentDefaults,
} from "@/lib/footer-content-schema";

import { FooterContentEditor } from "./footer-content-editor";

export default async function BackofficeFooterContentPage() {
  let initial = mergeFooterContentDefaults(null);
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(FOOTER_CONTENT_KEY);
    if (row?.payload) initial = mergeFooterContentDefaults(row.payload);
    revision = row?.updated_at ?? "default";
  } catch {
    /* sin supabase */
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contenido</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Pie de página (footer)
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Textos del pie, redes, columnas de enlaces, contacto y links legales. Se guarda en Supabase y el
            sitio público lo lee en cada página. Clave:{" "}
            <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
              {FOOTER_CONTENT_KEY}
            </code>
            . El nombre de la marca sigue en código (
            <code className="font-mono text-xs text-slate-500">site-config</code>), no acá.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-violet-300/90 hover:text-violet-200"
          >
            Ver sitio ↗
          </Link>
          <Link href="/backoffice/contenido" className="text-sm font-medium text-violet-300/90 hover:text-violet-200">
            ← Contenido
          </Link>
        </div>
      </div>
      <FooterContentEditor initial={initial} revision={revision} />
    </div>
  );
}
