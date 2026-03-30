const links = [
  { href: "#seguimiento", label: "Seguimiento" },
  { href: "#precios", label: "Precios" },
] as const;

export function ServicioTecnicoSubnav() {
  return (
    <nav
      className="sticky top-14 z-20 -mx-4 mb-10 flex flex-wrap gap-2 border-b border-neutral-200/90 bg-[#f9fafb]/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8"
      aria-label="Secciones del servicio técnico"
    >
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:bg-neutral-50 hover:text-neutral-900"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
