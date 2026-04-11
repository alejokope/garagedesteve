import Link from "next/link";

import { listContentEntriesAdmin } from "@/lib/backoffice/content-db";
import { listProductsAdmin } from "@/lib/backoffice/products-db";
import { SITE_HOME_SECTION_META } from "@/lib/backoffice/site-content-sections-meta";
import {
  HOME_CONTENT_KEYS,
  mergeCategories,
  mergeCtaFinal,
  mergeFaq,
  mergeFeaturedIds,
  mergeHero,
  mergeHomeModuleVisible,
  mergeServiceTech,
  mergeTestimonials,
  mergeWhyChoose,
} from "@/lib/home-public-content";

import { FOOTER_CONTENT_KEY } from "@/lib/footer-content-schema";
import { FLOATING_CONTACT_KEY } from "@/lib/floating-contact-schema";
import { SITE_CONTACT_KEY } from "@/lib/site-contact-schema";

import { deleteContentEntryAction } from "./actions";
import { SiteContentHub } from "./site-content-hub";

const HOME_KEY_SET = new Set<string>(HOME_CONTENT_KEYS);
const HIDDEN_IN_OTHER_TABLE = new Set<string>([
  FOOTER_CONTENT_KEY,
  FLOATING_CONTACT_KEY,
  SITE_CONTACT_KEY,
]);

export default async function BackofficeContenidoPage() {
  let rows: Awaited<ReturnType<typeof listContentEntriesAdmin>> = [];
  let products: Awaited<ReturnType<typeof listProductsAdmin>> = [];
  let loadError: string | null = null;

  try {
    [rows, products] = await Promise.all([listContentEntriesAdmin(), listProductsAdmin()]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "No se pudo cargar el contenido";
  }

  const payloadByKey = new Map(rows.map((r) => [r.key, r.payload] as const));

  const hasRow: Record<string, boolean> = {};
  for (const k of HOME_CONTENT_KEYS) {
    hasRow[k] = rows.some((r) => r.key === k);
  }

  const revision = HOME_CONTENT_KEYS.map((k) => rows.find((r) => r.key === k)?.updated_at ?? "—").join("|");

  const merged = {
    hero: mergeHero(payloadByKey.get("home.hero")),
    categories: mergeCategories(payloadByKey.get("home.categories")),
    featuredIds: mergeFeaturedIds(payloadByKey.get("home.featured")),
    featuredVisible: mergeHomeModuleVisible(payloadByKey.get("home.featured")),
    serviceTech: mergeServiceTech(payloadByKey.get("home.service_tech")),
    whyChoose: mergeWhyChoose(payloadByKey.get("home.why_choose")),
    testimonials: mergeTestimonials(payloadByKey.get("home.testimonials")),
    faq: mergeFaq(payloadByKey.get("home.faq")),
    ctaFinal: mergeCtaFinal(payloadByKey.get("home.cta_final")),
  };

  const otherRows = rows.filter(
    (r) => !HOME_KEY_SET.has(r.key) && !HIDDEN_IN_OTHER_TABLE.has(r.key),
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contenido</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
            Página de inicio
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Editá cada parte de la home con formularios claros. Los cambios son borrador hasta que pulses{" "}
            <strong className="font-medium text-slate-300">Guardar cambios</strong> en la barra fija inferior (así se
            envía todo lo modificado a la base). En cada módulo podés desmarcar{" "}
            <strong className="font-medium text-slate-300">Mostrar este bloque en la página de inicio</strong> para
            ocultarlo en el sitio público sin perder lo que guardaste.
          </p>
        </div>
        <Link href="/backoffice" className="text-sm font-medium text-violet-300/90 hover:text-violet-200">
          ← Inicio del panel
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-violet-500/25 bg-violet-950/20 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">
                Sitio completo
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Pie de página: textos, redes, columnas de enlaces y legales (sin datos de contacto).
              </p>
            </div>
            <Link
              href="/backoffice/contenido/footer"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white/[0.1] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/[0.14]"
            >
              Editar footer
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-950/15 p-4 sm:p-5 ring-1 ring-cyan-500/15">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
                Contacto público
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Oficinas, teléfono, email y horario: fuente única para el footer, carrito y más.
              </p>
            </div>
            <Link
              href="/backoffice/contenido/contacto"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white/[0.1] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/[0.14]"
            >
              Editar
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-950/30 to-violet-950/20 p-4 sm:p-5 ring-1 ring-fuchsia-500/20 sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200/90">
                Contacto rápido
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Botones flotantes, número, plantillas de WhatsApp y umbral de envío gratis del carrito.
              </p>
            </div>
            <Link
              href="/backoffice/contenido/contacto-flotante"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500/25 to-violet-500/25 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-fuchsia-400/30 transition hover:from-fuchsia-500/35 hover:to-violet-500/35"
            >
              Configurar
            </Link>
          </div>
        </div>
      </div>

      <nav className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ir a una sección</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {HOME_CONTENT_KEYS.map((k) => {
            const m = SITE_HOME_SECTION_META[k];
            return (
              <li key={k}>
                <a
                  href={`#${m.anchorId}`}
                  className="inline-block rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/[0.1]"
                >
                  {m.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {loadError ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100/95">
          {loadError}
        </div>
      ) : (
        <SiteContentHub
          revision={revision}
          homeKeys={[...HOME_CONTENT_KEYS]}
          merged={merged}
          hasRow={hasRow}
          products={products.map((p) => ({ id: p.id, name: p.name, published: p.published }))}
        />
      )}

      {otherRows.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Otras entradas en la base</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Claves que no son de la home (por ejemplo formularios técnicos). Suelen editarse desde su propia
              pantalla del panel; acá podés borrarlas o abrir el editor avanzado.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Clave</th>
                  <th className="px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {otherRows.map((row) => (
                  <tr key={row.key} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-violet-200/90">{row.key}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-300">{row.label ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/backoffice/contenido/${encodeURIComponent(row.key)}`}
                          className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white hover:bg-white/[0.1]"
                        >
                          Editor avanzado
                        </Link>
                        <form action={deleteContentEntryAction} className="inline">
                          <input type="hidden" name="key" value={row.key} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200/95 hover:bg-red-500/20"
                          >
                            Borrar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="text-center text-xs text-slate-600">
        <Link href="/backoffice/contenido/nuevo" className="text-violet-400/90 hover:text-violet-300">
          Crear entrada con clave nueva (solo uso técnico)
        </Link>
      </p>
    </div>
  );
}
