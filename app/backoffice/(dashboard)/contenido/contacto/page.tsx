import Link from "next/link";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import { getSiteContact } from "@/lib/site-contact-server";
import { SITE_CONTACT_KEY } from "@/lib/site-contact-schema";

import { SiteContactEditor } from "./site-contact-editor";

export default async function BackofficeSiteContactPage() {
  const initial = await getSiteContact();
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(SITE_CONTACT_KEY);
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
            Datos de contacto del sitio
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Oficinas, teléfono, email y horarios: una sola fuente para el footer público y textos relacionados. Clave:{" "}
            <code className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-violet-200/90">
              {SITE_CONTACT_KEY}
            </code>
            .
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
      <SiteContactEditor initial={initial} revision={revision} />
    </div>
  );
}
