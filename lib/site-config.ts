/** Textos y navegación alineados al diseño de la home; centralizá acá el rebranding. */
export const siteConfig = {
  brandName: "El Garage de Steve",
  tagline:
    "Tecnología premium y soporte técnico con la confianza que buscás en cada compra.",
  /** Links oficiales (WhatsApp, mensajes prearmados, footer). */
  publicLinks: {
    instagram: "https://www.instagram.com/elgaragedesteve/",
    linktree: "https://linktr.ee/elgaragedesteve",
  },
  /**
   * Navegación principal: misma en todas las páginas.
   * `shortLabel` en barra desktop; `label` en menú móvil.
   */
  mainNav: [
    { id: "shop", href: "/tienda", label: "Comprar", shortLabel: "Comprar" },
    {
      id: "favorites",
      href: "/favoritos",
      label: "Favoritos",
      shortLabel: "Favoritos",
    },
    { id: "cart", href: "/carrito", label: "Carrito", shortLabel: "Carrito" },
    {
      id: "service",
      href: "/servicio-tecnico",
      label: "Servicio técnico",
      shortLabel: "Servicio",
    },
    { id: "sedes", href: "/#sedes", label: "Nuestras sedes", shortLabel: "Sedes" },
    { id: "sell", href: "/vende-tu-equipo", label: "Vende tu equipo", shortLabel: "Vendé" },
    { id: "faq", href: "/#faq", label: "FAQ", shortLabel: "FAQ" },
  ] as const,
  contact: {
    address: "Microcentro, CABA · Retiro en oficina comercial (coordinar por WhatsApp)",
    phone: "+54 11 0000-0000",
    email: "hola@theiphone.example",
    hours: "Lun–Sáb 10:00–19:00",
  },
  footer: {
    blurb:
      "Repuestos de primera, garantía escrita y coordinación rápida y sin vueltas. También vendemos productos Apple.",
    columns: [
      {
        title: "Compañía",
        links: [
          { href: "/#sedes", label: "Sobre nosotros" },
          { href: "/#sedes", label: "Nuestras sedes" },
          { href: "/vende-tu-equipo", label: "Vende tu equipo" },
        ],
      },
      {
        title: "Productos",
        links: [
          { href: "/tienda?cat=iphone", label: "iPhone" },
          { href: "/tienda?cat=ipad", label: "iPad" },
          { href: "/tienda?cat=watch", label: "Apple Watch" },
          { href: "/tienda?cat=audio", label: "AirPods" },
        ],
      },
      {
        title: "Servicio",
        links: [
          { href: "/servicio-tecnico", label: "Servicio técnico" },
          { href: "/#faq", label: "Consultas" },
        ],
      },
      {
        title: "Ayuda",
        links: [
          { href: "/#faq", label: "Preguntas frecuentes" },
          { href: "/tienda", label: "Envíos" },
          { href: "/#faq", label: "Pagos" },
        ],
      },
    ] as const,
    social: [
      {
        label: "Facebook",
        href: "https://facebook.com",
        icon: "facebook",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/elgaragedesteve/",
        icon: "instagram",
      },
      {
        label: "Linktree",
        href: "https://linktr.ee/elgaragedesteve",
        icon: "link",
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com",
        icon: "linkedin",
      },
      {
        label: "X",
        href: "https://x.com",
        icon: "x",
      },
    ] as const,
  },
} as const;
