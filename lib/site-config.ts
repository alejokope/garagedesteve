/** Textos y navegación alineados al diseño de la home; centralizá acá el rebranding. */
export const siteConfig = {
  brandName: "The iPhone",
  tagline:
    "Tecnología premium y soporte técnico con la confianza que buscás en cada compra.",
  nav: [
    { href: "/tienda", label: "Comprar" },
    { href: "/#servicio-tecnico", label: "Servicio Técnico" },
    { href: "/#sedes", label: "Nuestras Sedes" },
    { href: "/#vende", label: "Vende tu equipo" },
    { href: "/#faq", label: "FAQ" },
  ] as const,
  footer: {
    blurb:
      "Equipos originales, asesoramiento honesto y servicio técnico especializado para que compres con tranquilidad.",
    columns: [
      {
        title: "Compañía",
        links: [
          { href: "/#sedes", label: "Sobre nosotros" },
          { href: "/#sedes", label: "Nuestras sedes" },
          { href: "/#vende", label: "Vende tu equipo" },
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
          { href: "/#servicio-tecnico", label: "Reparaciones" },
          { href: "/#servicio-tecnico", label: "Garantía" },
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
