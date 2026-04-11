import Link from "next/link";

import { getContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  FLOATING_CONTACT_KEY,
  mergeFloatingContactDefaults,
} from "@/lib/floating-contact-schema";

import { FloatingContactEditor } from "./floating-contact-editor";

export default async function BackofficeFloatingContactPage() {
  let initial = mergeFloatingContactDefaults(null);
  let revision = "default";
  try {
    const row = await getContentEntryAdmin(FLOATING_CONTACT_KEY);
    if (row?.payload) initial = mergeFloatingContactDefaults(row.payload);
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
            Botones flotantes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Instagram arriba y WhatsApp abajo. El número y las plantillas (mensaje del globo verde y mensaje del
            carrito) viven en la base; el mismo número y nombre se usan en fichas y formularios, con respaldo en
            variables de entorno si hace falta.
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
      <FloatingContactEditor initial={initial} revision={revision} />
    </div>
  );
}
