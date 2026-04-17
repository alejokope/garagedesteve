import Link from "next/link";

const cards = [
  {
    title: "Contenido",
    description:
      "Página de inicio: formularios por sección (hero, categorías, destacados, FAQ, etc.), sin JSON.",
    href: "/backoffice/contenido",
    tag: "CMS",
  },
  {
    title: "Productos",
    description:
      "Catálogo completo: foto, precios, descuentos y variantes (colores, almacenamiento, mallas, etc.).",
    href: "/backoffice/productos",
    tag: "Catálogo",
  },
  {
    title: "Servicio técnico — Precios",
    description:
      "Tablas de precios, filtros por dispositivo, moneda USD (u otra por fila), acordeón y banner a WhatsApp.",
    href: "/backoffice/servicio-tecnico/precios",
    tag: "Reparaciones",
  },
  {
    title: "Vendé tu equipo — Simulador",
    description:
      "Precios de recompra por modelo, memoria y batería: lo que ves en la web se edita fila a fila, sin código.",
    href: "/backoffice/vende-tu-equipo/precios",
    tag: "Usados",
  },
] as const;

export default function BackofficeHomePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Panel de control
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          Gestioná el contenido del sitio y el catálogo de productos de forma clara. Las
          variantes siguen el mismo modelo que la tienda (precio base, sumas o precio
          absoluto por opción).
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-colors hover:border-violet-500/35 hover:bg-white/[0.05]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-white">{c.title}</h2>
                <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-200/90">
                  {c.tag}
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-400">{c.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-300/90 group-hover:text-violet-200">
                Abrir
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
