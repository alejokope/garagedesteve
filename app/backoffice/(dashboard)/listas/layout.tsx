import Link from "next/link";

const links = [
  { href: "/backoffice/listas/categorias", label: "Categorías" },
  { href: "/backoffice/listas/tipos-opcion", label: "Tipos de opción" },
  { href: "/backoffice/listas/modos-precio", label: "Modos de precio" },
] as const;

export default function ListasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Listas del catálogo
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Estas listas alimentan los desplegables al crear o editar productos: categorías, tipos de
          variante y textos de los modos de precio.
        </p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
