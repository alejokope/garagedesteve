"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LinkPendingGlyph } from "@/app/components/backoffice/link-pending-glyph";

const links = [
  { href: "/backoffice/listas/categorias", label: "Categorías" },
  { href: "/backoffice/listas/tipos-opcion", label: "Tipos de opción" },
  { href: "/backoffice/listas/modos-precio", label: "Modos de precio" },
] as const;

export function ListasTabsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4" aria-label="Secciones de listas">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white/[0.1] text-white ring-1 ring-white/15"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span>{l.label}</span>
            <LinkPendingGlyph />
          </Link>
        );
      })}
    </nav>
  );
}
