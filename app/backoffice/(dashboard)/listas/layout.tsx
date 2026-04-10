import { ListasTabsNav } from "./listas-tabs-nav";

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
      <ListasTabsNav />
      {children}
    </div>
  );
}
